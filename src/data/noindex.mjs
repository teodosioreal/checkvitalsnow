import { owner } from './owner.mjs';

// Pages kept out of search (noindex + excluded from the sitemap) until the
// real details they need are filled in (see owner.mjs).
export const noindexPaths = [
  ...(owner.contactEmail ? [] : ['/contact/']),
];
