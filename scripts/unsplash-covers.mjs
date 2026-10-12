// Picks a cover photo from Unsplash for every article that has an `imageQuery`
// and no `cover` yet, and writes the photo data into the article frontmatter.
//
// Usage: UNSPLASH_ACCESS_KEY=... npm run images:unsplash
//
// Follows the Unsplash API guidelines: images are hotlinked from images.unsplash.com,
// the download endpoint is triggered for each photo used, and the photographer is credited.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!KEY) {
  console.error('Missing UNSPLASH_ACCESS_KEY environment variable.');
  process.exit(1);
}

const APP = 'checkvitalsnow';
const DIR = 'src/content/articles';
const headers = { Authorization: `Client-ID ${KEY}`, 'Accept-Version': 'v1' };
const utm = (url) => `${url}${url.includes('?') ? '&' : '?'}utm_source=${APP}&utm_medium=referral`;
const yaml = (s) => JSON.stringify(s ?? '');

for (const file of readdirSync(DIR).filter((f) => f.endsWith('.md'))) {
  const path = join(DIR, file);
  const text = readFileSync(path, 'utf8');
  const query = text.match(/^imageQuery:\s*"?(.+?)"?\s*$/m)?.[1];
  if (!query || /^cover:/m.test(text)) {
    console.log(`skip ${file}`);
    continue;
  }

  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&content_filter=high&per_page=10`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Unsplash search failed for ${file}: ${res.status} ${await res.text()}`);
  const { results } = await res.json();
  const photo = results?.[0];
  if (!photo) {
    console.log(`no result for ${file} (${query})`);
    continue;
  }

  await fetch(photo.links.download_location, { headers });

  const cover = [
    'cover:',
    `  url: ${yaml(photo.urls.raw)}`,
    `  alt: ${yaml(photo.alt_description || query)}`,
    `  author: ${yaml(photo.user.name)}`,
    `  authorUrl: ${yaml(utm(photo.user.links.html))}`,
    `  photoUrl: ${yaml(utm(photo.links.html))}`,
  ].join('\n');
  writeFileSync(path, text.replace(/^keyTakeaways:/m, `${cover}\nkeyTakeaways:`));
  console.log(`cover set for ${file}: ${photo.links.html} by ${photo.user.name}`);
}
