// Shared logic for the comment system (Cloudflare Pages Functions in /functions/api).
// Every comment is stored as "pending" and only shows on the site after a moderator approves it.

export const LIMITS = { name: 60, minBody: 10, body: 1500, perTenMinutes: 3, perDay: 10, minSeconds: 4 };

// Links in any disguise, emails, phone numbers, HTML and common spam words are rejected outright.
const TLD = '(com|net|org|info|biz|io|uk|ca|au|br|xyz|ru|cn|ly|gl|tk|ml|ga|cf|gq|vip|bid)';
const LINK = new RegExp(
  `(https?:\\/\\/|www\\s*\\.|\\b[a-z0-9-]{2,}\\.${TLD}\\b|\\b[a-z0-9-]{2,}\\s*(\\(dot\\)|\\[dot\\]|\\sdot\\s)\\s*${TLD}\\b)`,
  'i',
);
const EMAIL = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i;
// A phone number: a run of digits and separators with at least 9 digits in it.
const PHONE = /\+?\d[\d\s().-]{7,}\d/g;
const hasPhone = (s) => (s.match(PHONE) ?? []).some((m) => m.replace(/\D/g, '').length >= 9);
const HTML = /[<>]/;
const SPAM =
  /\b(viagra|cialis|casino|betting|gambl\w*|crypto\w*|bitcoin|forex|loans?|seo|backlinks?|escort|porn\w*|xxx|onlyfans|telegram|whatsapp|followers|promo ?code|discount ?code|buy now|click here|dm me|order now|cheap pills?|pharmacy|weight loss pills?|miracle cure)\b/i;

const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const cleanBody = (s) => String(s ?? '').replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

/** Returns { ok: true, name, body } or { ok: false, error } with a message safe to show the reader. */
export function validateComment(input) {
  const name = clean(input.name);
  const body = cleanBody(input.body);
  if (clean(input.website)) return { ok: false, error: 'Something went wrong. Please try again.' }; // honeypot
  if (!(Number(input.elapsed) >= LIMITS.minSeconds)) return { ok: false, error: 'Please take a moment before posting.' };
  if (name.length < 2 || name.length > LIMITS.name) return { ok: false, error: `Please enter a name (2 to ${LIMITS.name} characters).` };
  if (body.length < LIMITS.minBody || body.length > LIMITS.body)
    return { ok: false, error: `Comments must be ${LIMITS.minBody} to ${LIMITS.body} characters.` };
  const both = `${name}\n${body}`;
  if (LINK.test(both)) return { ok: false, error: 'Links and website addresses are not allowed in comments.' };
  if (EMAIL.test(both) || hasPhone(both))
    return { ok: false, error: 'For your privacy, please leave out email addresses and phone numbers.' };
  if (HTML.test(both)) return { ok: false, error: 'Please remove the < and > characters.' };
  if (SPAM.test(both)) return { ok: false, error: 'This comment looks like spam and was not sent.' };
  return { ok: true, name, body };
}

/** Article pages look like /category/slug/. */
export const isArticlePath = (path) => typeof path === 'string' && /^\/[a-z0-9-]{2,60}\/[a-z0-9-]{2,120}\/$/.test(path);

export async function ensureSchema(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL,
        name TEXT NOT NULL,
        body TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        ip_hash TEXT,
        created_at TEXT NOT NULL
      )`,
    )
    .run();
  await db.prepare('CREATE INDEX IF NOT EXISTS comments_path_status ON comments (path, status)').run();
}

export async function hashIp(ip, salt) {
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyTurnstile(secret, token, ip) {
  if (!token) return false;
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
  const out = await res.json().catch(() => ({}));
  return out.success === true;
}

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...headers } });
