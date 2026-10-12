// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { noindexPaths } from './src/data/noindex.mjs';

export default defineConfig({
  site: 'https://checkvitalsnow.com',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !noindexPaths.some((path) => page.endsWith(path)),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
