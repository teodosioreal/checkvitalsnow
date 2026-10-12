// Fills article images from Unsplash.
//
// - Cover: frontmatter `imageQuery` -> frontmatter `cover` (skipped if a cover exists).
// - In-text: every `<!-- unsplash: query -->` marker in the body is replaced by a <figure>.
// - Avoids reusing a photo across the site when another good result exists.
// - Saves a small preview of each chosen photo to .unsplash-preview/ for review.
//
// Usage: UNSPLASH_ACCESS_KEY=... npm run images:unsplash
//
// Follows the Unsplash API guidelines: photos are hotlinked from images.unsplash.com,
// the download endpoint is triggered for each photo used, and the photographer is credited.
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!KEY) {
  console.error('Missing UNSPLASH_ACCESS_KEY environment variable.');
  process.exit(1);
}

const APP = 'checkvitalsnow';
const DIR = 'src/content/articles';
const PREVIEW = '.unsplash-preview';
const headers = { Authorization: `Client-ID ${KEY}`, 'Accept-Version': 'v1' };
const utm = (url) => `${url}${url.includes('?') ? '&' : '?'}utm_source=${APP}&utm_medium=referral`;
const yaml = (s) => JSON.stringify(s ?? '');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sized = (raw, w) => `${raw}&w=${w}&h=${Math.round((w * 9) / 16)}&fit=crop&crop=entropy&fm=webp&q=70`;
const altText = (photo, query) => {
  const a = (photo.alt_description || query).trim();
  return a.charAt(0).toUpperCase() + a.slice(1);
};

mkdirSync(PREVIEW, { recursive: true });
const files = readdirSync(DIR).filter((f) => f.endsWith('.md'));

// Photos already on the site count as used.
const used = new Set();
for (const f of files) {
  for (const m of readFileSync(join(DIR, f), 'utf8').matchAll(/images\.unsplash\.com\/(photo-[\w-]+)/g)) used.add(m[1]);
}
const photoKey = (p) => p.urls.raw.match(/(photo-[\w-]+)/)?.[1] ?? p.id;

async function pick(query) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&content_filter=high&per_page=20`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Unsplash search failed for "${query}": ${res.status} ${await res.text()}`);
  const { results = [] } = await res.json();
  if (!results.length) return null;
  const photo = results.find((p) => !used.has(photoKey(p))) ?? results[0];
  used.add(photoKey(photo));
  await fetch(photo.links.download_location, { headers });
  return photo;
}

async function savePreview(photo, name) {
  const res = await fetch(`${photo.urls.raw}&w=480&h=270&fit=crop&crop=entropy&fm=jpg&q=60`);
  if (res.ok) writeFileSync(join(PREVIEW, `${name}.jpg`), Buffer.from(await res.arrayBuffer()));
}

const report = [];
for (const file of files) {
  const slug = file.replace(/\.md$/, '');
  const path = join(DIR, file);
  let text = readFileSync(path, 'utf8');

  const coverQuery = text.match(/^imageQuery:\s*"?(.+?)"?\s*$/m)?.[1];
  if (coverQuery && !/^cover:/m.test(text)) {
    const photo = await pick(coverQuery);
    if (photo) {
      const cover = [
        'cover:',
        `  url: ${yaml(photo.urls.raw)}`,
        `  alt: ${yaml(altText(photo, coverQuery))}`,
        `  author: ${yaml(photo.user.name)}`,
        `  authorUrl: ${yaml(utm(photo.user.links.html))}`,
        `  photoUrl: ${yaml(utm(photo.links.html))}`,
      ].join('\n');
      text = text.replace(/^keyTakeaways:/m, `${cover}\nkeyTakeaways:`);
      await savePreview(photo, `${slug}-0-cover`);
      report.push(`${slug} | cover | ${coverQuery} | ${photo.links.html} | ${photo.alt_description}`);
    }
  }

  let n = 0;
  for (const m of [...text.matchAll(/<!-- unsplash: (.+?) -->/g)]) {
    const query = m[1].trim();
    const photo = await pick(query);
    if (!photo) {
      report.push(`${slug} | inline | ${query} | NO RESULT`);
      continue;
    }
    n++;
    const raw = photo.urls.raw;
    const figure = [
      '<figure class="article-figure">',
      `<img src="${esc(sized(raw, 1200))}" srcset="${[640, 960, 1200].map((w) => `${esc(sized(raw, w))} ${w}w`).join(', ')}" sizes="(min-width: 768px) 720px, 100vw" width="1200" height="675" alt="${esc(altText(photo, query))}" loading="lazy" decoding="async">`,
      `<figcaption>Photo by <a href="${esc(utm(photo.user.links.html))}" rel="noopener" target="_blank">${esc(photo.user.name)}</a> on <a href="${esc(utm(photo.links.html))}" rel="noopener" target="_blank">Unsplash</a></figcaption>`,
      '</figure>',
    ].join('\n');
    text = text.replace(m[0], figure);
    await savePreview(photo, `${slug}-${n}`);
    report.push(`${slug} | inline ${n} | ${query} | ${photo.links.html} | ${photo.alt_description}`);
  }

  writeFileSync(path, text);
}

writeFileSync(join(PREVIEW, 'report.txt'), report.join('\n') + '\n');
console.log(report.join('\n'));
