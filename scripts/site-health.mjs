// Checks the live site the way a search engine sees it: every sitemap URL, its status,
// robots headers and meta tags, canonical, plus www / pages.dev / http duplicates.
// Run by .github/workflows/site-health.yml. Writes site-health.md for the job summary.
import { writeFileSync } from 'node:fs';

const SITE = 'https://checkvitalsnow.com';
const UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const lines = [];
const log = (s) => (console.log(s), lines.push(s));

const get = (url, redirect = 'follow') => fetch(url, { headers: { 'user-agent': UA }, redirect });

async function hostCheck(url) {
  try {
    const r = await get(url, 'manual');
    log(`- ${url} → ${r.status} ${r.headers.get('location') ?? ''}`);
  } catch (e) {
    log(`- ${url} → error ${e.message}`);
  }
}

log('## Hosts and duplicates');
for (const u of [SITE + '/', 'https://www.checkvitalsnow.com/', 'http://checkvitalsnow.com/', 'https://checkvitalsnow.pages.dev/']) await hostCheck(u);

log('\n## Server headers (home)');
{
  const r = await get(SITE + '/', 'manual');
  for (const h of ['server', 'x-powered-by', 'platform', 'panel', 'x-hcdn-request-id', 'x-hcdn-cache-status', 'cf-ray', 'x-litespeed-cache', 'via'])
    if (r.headers.get(h)) log(`- ${h}: ${r.headers.get(h)}`);
}
log('\n## Old URL redirects (public/_redirects)');
for (const p of ['/sitemap.xml', '/femipro-review-scam-or-legit-femipro-full-review/', '/go/test']) await hostCheck(SITE + p);
log('\n## Comments API');
await hostCheck(SITE + '/api/comments?path=/womens-health/kegel-exercises-for-women/');

log('\n## robots.txt');
log('```\n' + (await (await get(SITE + '/robots.txt')).text()).trim() + '\n```');

const index = await (await get(SITE + '/sitemap-index.xml')).text();
const maps = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const urls = [];
for (const m of maps) urls.push(...[...(await (await get(m)).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1]));
log(`\n## Sitemap: ${urls.length} URLs`);

let problems = 0;
log('\n| URL | Status | X-Robots-Tag | meta robots | canonical ok | words | cache |');
log('| --- | --- | --- | --- | --- | --- | --- |');
for (const u of urls) {
  const r = await get(u, 'manual');
  const html = r.status === 200 ? await r.text() : '';
  const metaRobots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? '';
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? '';
  const words = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const bad = r.status !== 200 || /noindex/.test(metaRobots + (r.headers.get('x-robots-tag') ?? '')) || canonical !== u;
  if (bad) problems++;
  log(`| ${u.replace(SITE, '')} | ${r.status}${r.headers.get('location') ? ' → ' + r.headers.get('location') : ''} | ${r.headers.get('x-robots-tag') ?? ''} | ${metaRobots} | ${canonical === u ? 'yes' : 'NO: ' + canonical} | ${words} | ${r.headers.get('cf-cache-status') ?? ''} |`);
}
log(`\n**${problems} problem URLs of ${urls.length}.**`);
writeFileSync('site-health.md', lines.join('\n'));
