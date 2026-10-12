// Downloads the main product photo (og:image) from each official product page
// listed in scripts/product-images.json and saves it as WebP in src/assets/products/.
//
// - Skips products whose image already exists, so it is safe to run again.
// - Uses og:image, or the first <img> matching the optional `match` regex.
// - Tries each page in order and uses the first one that returns an image.
// - Writes src/assets/products/SOURCES.md with the page and image URL of every
//   photo, so each one can be checked before it goes on the site.
//
// Usage: npm run images:products
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import sharp from 'sharp';

const DIR = 'src/assets/products';
const SOURCES = `${DIR}/SOURCES.md`;
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  Accept: 'text/html,image/avif,image/webp,image/*,*/*',
};

const meta = (html, prop) =>
  html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["']`, 'i'))?.[1] ??
  html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${prop}["']`, 'i'))?.[1];

const decode = (s) => s.replace(/&amp;/g, '&');

// Fallback for pages without og:image: first <img> whose src or alt matches `match`.
function matchImg(html, match) {
  if (!match) return null;
  const re = new RegExp(match, 'i');
  for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
    const src = tag.match(/\s(?:data-src|src)=["']([^"']+)["']/i)?.[1];
    const alt = tag.match(/\salt=["']([^"']*)["']/i)?.[1] ?? '';
    if (src && !src.startsWith('data:') && (re.test(src) || re.test(alt))) return src;
  }
  return null;
}

async function fromPage(page, match) {
  const res = await fetch(page, { headers, redirect: 'follow' });
  if (!res.ok) throw new Error(`page ${res.status}`);
  const html = await res.text();
  const found = meta(html, 'og:image:secure_url') ?? meta(html, 'og:image') ?? meta(html, 'twitter:image') ?? matchImg(html, match);
  if (!found) throw new Error('no og:image or matching <img>');
  const image = new URL(decode(found), res.url).href;
  const img = await fetch(image, { headers });
  if (!img.ok) throw new Error(`image ${img.status}`);
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.replace(/\s+/g, ' ').trim() ?? '';
  return { finalUrl: res.url, image, title, buffer: Buffer.from(await img.arrayBuffer()) };
}

mkdirSync(DIR, { recursive: true });
const products = JSON.parse(readFileSync('scripts/product-images.json', 'utf8'));
const log = existsSync(SOURCES) ? readFileSync(SOURCES, 'utf8').trimEnd() + '\n' : '# Product photo sources\n\n| File | Page | Page title | Image URL |\n|---|---|---|---|\n';
let added = '';

for (const p of products) {
  const out = `${DIR}/${p.id}.webp`;
  if (existsSync(out)) {
    console.log(`${p.id}: already exists, skipped`);
    continue;
  }
  let done = false;
  for (const page of p.pages) {
    try {
      const r = await fromPage(page, p.match);
      await sharp(r.buffer).resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toFile(out);
      added += `| ${p.id}.webp | ${r.finalUrl} | ${r.title.replace(/\|/g, '/')} | ${r.image} |\n`;
      console.log(`${p.id}: saved from ${r.finalUrl}`);
      done = true;
      break;
    } catch (err) {
      console.log(`${p.id}: ${page} failed (${err.message})`);
    }
  }
  if (!done) console.log(`${p.id}: NOT FOUND, check the page URLs`);
}

if (added) writeFileSync(SOURCES, log + added);
