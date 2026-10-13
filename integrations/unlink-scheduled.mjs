import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

/**
 * After the build, links to articles that are not live yet (future datePublished) are turned
 * into plain text in every page, so scheduled posts can link ahead without creating 404s.
 * The link comes back by itself in the first build on or after the target's date.
 */
export default function unlinkScheduled() {
  return {
    name: 'unlink-scheduled',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const articles = new URL('../src/content/articles/', import.meta.url);
        const now = Date.now();
        const scheduled = readdirSync(articles)
          .filter((f) => f.endsWith('.md'))
          .filter((f) => {
            const date = readFileSync(new URL(f, articles), 'utf8').match(/^datePublished:\s*(\S+)/m)?.[1];
            return date && new Date(date).getTime() > now;
          })
          .map((f) => f.replace(/\.md$/, ''));
        if (!scheduled.length) return;

        const pattern = new RegExp(`<a href="/[a-z-]+/(?:${scheduled.join('|')})/"[^>]*>([\\s\\S]*?)</a>`, 'g');
        let changed = 0;
        const visit = (path) => {
          for (const name of readdirSync(path)) {
            const full = join(path, name);
            if (statSync(full).isDirectory()) visit(full);
            else if (name.endsWith('.html')) {
              const html = readFileSync(full, 'utf8');
              const out = html.replace(pattern, (_, text) => (changed++, text));
              if (out !== html) writeFileSync(full, out);
            }
          }
        };
        visit(fileURLToPath(dir));
        logger.info(`${scheduled.length} scheduled articles, ${changed} links turned into text`);
      },
    },
  };
}
