// Moderation API used by /moderate/. Requires the header "Authorization: Bearer <ADMIN_TOKEN>".
// GET  ?status=pending|approved   → list comments
// POST { id, action: 'approve' | 'delete' }
import { ensureSchema, json } from '../../../server/comments.js';

function authorized(request, env) {
  const given = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const expected = env.ADMIN_TOKEN ?? '';
  if (!expected || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export async function onRequest({ request, env }) {
  if (!env.DB || !env.ADMIN_TOKEN) return json({ error: 'Comments are not set up yet (DB or ADMIN_TOKEN missing).' }, 503);
  if (!authorized(request, env)) return json({ error: 'Wrong password.' }, 401);
  await ensureSchema(env.DB);

  if (request.method === 'GET') {
    const status = new URL(request.url).searchParams.get('status') === 'approved' ? 'approved' : 'pending';
    const { results } = await env.DB.prepare(
      'SELECT id, path, name, body, status, created_at FROM comments WHERE status = ? ORDER BY created_at DESC LIMIT 200',
    )
      .bind(status)
      .all();
    return json({ comments: results }, 200, { 'cache-control': 'no-store' });
  }

  if (request.method === 'POST') {
    const { id, action } = await request.json().catch(() => ({}));
    if (!Number.isInteger(id)) return json({ error: 'Bad request' }, 400);
    if (action === 'approve') await env.DB.prepare("UPDATE comments SET status = 'approved' WHERE id = ?").bind(id).run();
    else if (action === 'delete') await env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(id).run();
    else return json({ error: 'Bad request' }, 400);
    return json({ ok: true });
  }

  return json({ error: 'Method not allowed' }, 405);
}
