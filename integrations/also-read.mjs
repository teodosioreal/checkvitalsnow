import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

/**
 * The "Also read" box (components/AlsoRead.astro) is rendered right after the article body.
 * After the build, this moves it up to just before a heading in the middle of the article,
 * where a reader who is still scrolling sees it. Pages with fewer than two body headings keep it in place.
 */
export default function alsoRead() {
  return {
    name: 'also-read',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        let moved = 0;
        const visit = (path) => {
          for (const name of readdirSync(path)) {
            const full = join(path, name);
            if (statSync(full).isDirectory()) visit(full);
            else if (name.endsWith('.html')) {
              const html = readFileSync(full, 'utf8');
              const start = html.indexOf('class="article-body"');
              const box = html.match(/<aside data-also-read[\s\S]*?<\/aside>/);
              if (start < 0 || !box) continue;
              const body = html.slice(start, box.index);
              const headings = [...body.matchAll(/<h2[\s>]/g)].map((m) => start + m.index);
              if (headings.length < 2) continue;
              const at = headings[Math.floor(headings.length / 2)];
              const without = html.slice(0, box.index) + html.slice(box.index + box[0].length);
              writeFileSync(full, without.slice(0, at) + box[0] + without.slice(at));
              moved++;
            }
          }
        };
        visit(fileURLToPath(dir));
        logger.info(`"Also read" box placed mid-article on ${moved} pages`);
      },
    },
  };
}
