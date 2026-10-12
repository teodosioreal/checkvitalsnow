import { readFileSync, writeFileSync, existsSync } from 'node:fs';

/**
 * Writes /go/<goSlug>/ -> affiliateUrl (302) rules from src/data/products.json
 * into dist/_redirects, appended after any rules from public/_redirects.
 */
export default function affiliateRedirects() {
  return {
    name: 'affiliate-redirects',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const products = JSON.parse(readFileSync(new URL('../src/data/products.json', import.meta.url), 'utf8'));
        const target = new URL('_redirects', dir);
        const existing = existsSync(target) ? readFileSync(target, 'utf8').trimEnd() + '\n' : '';
        const rules = products
          .filter((p) => p.goSlug && p.affiliateUrl)
          .flatMap((p) => [`/go/${p.goSlug} ${p.affiliateUrl} 302`, `/go/${p.goSlug}/ ${p.affiliateUrl} 302`]);
        writeFileSync(target, existing + rules.join('\n') + '\n');
        logger.info(`wrote ${rules.length} affiliate redirect rules`);
      },
    },
  };
}
