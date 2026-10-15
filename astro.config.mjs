// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readdirSync, readFileSync } from 'node:fs';
import { noindexPaths } from './src/data/noindex.mjs';

// Last-modified date of each article (from its frontmatter), so the sitemap tells Google
// which pages are new or updated.
const articlesDir = new URL('./src/content/articles/', import.meta.url);
const lastmodBySlug = Object.fromEntries(
  readdirSync(articlesDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => [f.replace(/\.md$/, ''), readFileSync(new URL(f, articlesDir), 'utf8').match(/^dateModified:\s*(\S+)/m)?.[1]]),
);
import unlinkScheduled from './integrations/unlink-scheduled.mjs';
import alsoRead from './integrations/also-read.mjs';

export default defineConfig({
  site: 'https://checkvitalsnow.com',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !noindexPaths.some((path) => page.endsWith(path)),
      serialize: (item) => {
        const slug = item.url.match(/\/([a-z0-9-]+)\/$/)?.[1];
        const date = slug && lastmodBySlug[slug];
        return date ? { ...item, lastmod: new Date(`${date}T12:00:00Z`).toISOString() } : item;
      },
    }),
    unlinkScheduled(),
    alsoRead(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
