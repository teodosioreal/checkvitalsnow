// Checks every source URL listed in article frontmatter and prints a report.
// Runs in GitHub Actions (open network). Usage: node scripts/check-sources.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

const DIR = 'src/content/articles';
const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const urls = new Map();
for (const f of readdirSync(DIR).filter((f) => f.endsWith('.md'))) {
  const fm = readFileSync(`${DIR}/${f}`, 'utf8').split('\n---')[0];
  for (const m of fm.matchAll(/url:\s*"([^"]+)"/g)) {
    if (m[1].includes('images.unsplash.com')) continue;
    if (!urls.has(m[1])) urls.set(m[1], []);
    urls.get(m[1]).push(f.replace('.md', ''));
  }
}

const rows = [];
for (const [url, files] of urls) {
  let status = 'error';
  let final = '';
  try {
    const res = await fetch(url, { headers: { 'User-Agent': ua, Accept: 'text/html,*/*' }, redirect: 'follow', signal: AbortSignal.timeout(20000) });
    status = String(res.status);
    final = res.url !== url ? res.url : '';
  } catch (e) {
    status = `error: ${e.cause?.code ?? e.message}`;
  }
  // 401/403/429 usually mean the site blocks automated checks, not that the page is gone.
  const blocked = ['401', '403', '429'].includes(status);
  const moved = /archived/i.test(final);
  const ok = status.startsWith('2') && !moved;
  const label = ok ? 'OK     ' : blocked ? 'BLOCKED' : moved ? 'MOVED  ' : 'BROKEN ';
  rows.push({ ok, blocked, status, url, final, files });
  console.log(`${label} ${status} ${url}${final ? ` -> ${final}` : ''} [${files.join(', ')}]`);
}
const bad = rows.filter((r) => !r.ok && !r.blocked);
const blockedRows = rows.filter((r) => r.blocked);
const report = [`# Source link report`, ``, `Checked ${rows.length} URLs. Broken or moved: ${bad.length}. Blocked for robots (page likely fine): ${blockedRows.length}.`, ``, '## Broken or moved', ...bad.map((r) => `- ${r.status} ${r.url} ${r.final ? `-> ${r.final} ` : ''}(${r.files.join(', ')})`)].join('\n');
writeFileSync('source-report.md', report + '\n');
console.log(`\n${bad.length} broken or moved, ${blockedRows.length} blocked for robots, of ${rows.length} URLs.`);
