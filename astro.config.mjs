// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { noindexPaths } from './src/data/noindex.mjs';
import unlinkScheduled from './integrations/unlink-scheduled.mjs';
import alsoRead from './integrations/also-read.mjs';

export default defineConfig({
  site: 'https://checkvitalsnow.com',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !noindexPaths.some((path) => page.endsWith(path)),
    }),
    unlinkScheduled(),
    alsoRead(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
