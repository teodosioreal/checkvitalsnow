import { owner } from './owner.mjs';

// Pages kept out of search (noindex + excluded from the sitemap) until they
// pass the content and compliance review (Etapa B of the migration), or until
// the real details they need are filled in (see owner.mjs).
export const noindexPaths = [
  '/nervecalm-scam-or-legit-nervecalm-full-review/',
  ...(owner.contactEmail ? [] : ['/contact/']),
];
