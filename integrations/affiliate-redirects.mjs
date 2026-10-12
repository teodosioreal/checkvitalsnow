import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

/**
 * Builds the /go/<goSlug>/ affiliate redirects from src/data/products.json.
 *
 * - Plain URLs become 302 rules in dist/_redirects (appended after public/_redirects).
 * - URLs with a #fragment (e.g. "...text.php#aff=ID") can't be expressed safely in
 *   _redirects, where "#" starts a comment, so they get a tiny noindex HTML page that
 *   forwards the browser and keeps the fragment.
 */
export default function affiliateRedirects() {
  return {
    name: 'affiliate-redirects',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const products = JSON.parse(readFileSync(new URL('../src/data/products.json', import.meta.url), 'utf8'));
        const target = new URL('_redirects', dir);
        const existing = existsSync(target) ? readFileSync(target, 'utf8').trimEnd() + '\n' : '';
        const rules = [];
        let pages = 0;
        for (const p of products) {
          if (!p.goSlug || !p.affiliateUrl) continue;
          if (p.affiliateUrl.includes('#')) {
            const folder = new URL(`go/${p.goSlug}/`, dir);
            mkdirSync(folder, { recursive: true });
            writeFileSync(new URL('index.html', folder), redirectPage(p.affiliateUrl));
            pages++;
          } else {
            rules.push(`/go/${p.goSlug} ${p.affiliateUrl} 302`, `/go/${p.goSlug}/ ${p.affiliateUrl} 302`);
          }
        }
        writeFileSync(target, existing + rules.join('\n') + '\n');
        logger.info(`wrote ${rules.length} redirect rules and ${pages} redirect pages`);
      },
    },
  };
}

function redirectPage(url) {
  const safe = url.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const js = JSON.stringify(url).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="no-referrer-when-downgrade">
<meta http-equiv="refresh" content="0;url=${safe}">
<title>Redirecting…</title>
<script>location.replace(${js});</script>
</head>
<body><p>Redirecting to the official website. <a href="${safe}" rel="sponsored nofollow noopener">Continue</a></p></body>
</html>
`;
}
