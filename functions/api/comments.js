// GET  /api/comments?path=/category/slug/  → approved comments for that article
// POST /api/comments                        → new comment, saved as "pending" until a moderator approves it
// Needs (Cloudflare Pages → Settings): D1 binding DB, secrets TURNSTILE_SECRET and ADMIN_TOKEN.
import { LIMITS, validateComment, isArticlePath, ensureSchema, hashIp, verifyTurnstile, json } from '../../server/comments.js';

export async function onRequestGet({ request, env }) {
  const path = new URL(request.url).searchParams.get('path');
  if (!isArticlePath(path)) return json({ error: 'Bad request' }, 400);
  if (!env.DB) return json({ enabled: false, comments: [] });
  await ensureSchema(env.DB);
  const { results } = await env.DB.prepare(
    "SELECT id, name, body, created_at FROM comments WHERE path = ? AND status = 'approved' ORDER BY created_at ASC LIMIT 200",
  )
    .bind(path)
    .all();
  return json({ enabled: Boolean(env.TURNSTILE_SECRET), comments: results }, 200, { 'cache-control': 'public, max-age=60' });
}

export async function onRequestPost({ request, env }) {
  if (!env.DB || !env.TURNSTILE_SECRET) return json({ error: 'Comments are not open yet.' }, 503);
  let input;
  try {
    input = await request.json();
  } catch {
    return json({ error: 'Bad request' }, 400);
  }
  if (!isArticlePath(input.path)) return json({ error: 'Bad request' }, 400);

  const checked = validateComment(input);
  if (!checked.ok) return json({ error: checked.error }, 422);

  const ip = request.headers.get('cf-connecting-ip') ?? '';
  if (!(await verifyTurnstile(env.TURNSTILE_SECRET, input.token, ip)))
    return json({ error: 'We could not confirm you are human. Please try again.' }, 403);

  // Only real article pages can receive comments.
  if (env.ASSETS) {
    const page = await env.ASSETS.fetch(new URL(input.path, request.url));
    if (!page.ok) return json({ error: 'Bad request' }, 400);
  }

  await ensureSchema(env.DB);
  const ipHash = await hashIp(ip, env.ADMIN_TOKEN ?? 'checkvitalsnow');
  const recent = await env.DB.prepare(
    `SELECT
       SUM(created_at > datetime('now', '-10 minutes')) AS last10,
       SUM(created_at > datetime('now', '-1 day')) AS lastDay
     FROM comments WHERE ip_hash = ?`,
  )
    .bind(ipHash)
    .first();
  if ((recent?.last10 ?? 0) >= LIMITS.perTenMinutes || (recent?.lastDay ?? 0) >= LIMITS.perDay)
    return json({ error: 'You have posted several comments recently. Please try again later.' }, 429);

  await env.DB.prepare("INSERT INTO comments (path, name, body, status, ip_hash, created_at) VALUES (?, ?, ?, 'pending', ?, datetime('now'))")
    .bind(input.path, checked.name, checked.body, ipHash)
    .run();
  return json({ ok: true, message: 'Thanks! Your comment will appear after our team reviews it.' }, 201);
}
