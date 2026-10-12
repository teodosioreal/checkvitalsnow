// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import affiliateRedirects from './integrations/affiliate-redirects.mjs';
import { noindexPaths } from './src/data/noindex.mjs';

export default defineConfig({
  site: 'https://checkvitalsnow.com',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !noindexPaths.some((path) => page.endsWith(path)),
    }),
    affiliateRedirects(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
