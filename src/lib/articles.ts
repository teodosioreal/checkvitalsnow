import { getCollection, type CollectionEntry } from 'astro:content';

// Articles dated in the future stay hidden until a build runs on or after that date.
// A scheduled GitHub Action rebuilds the site every morning, so posts go live on their date.
// PREVIEW_DATE (e.g. 2026-10-23) lets you build the site as it will look on a future day.
const buildDate = () => (process.env.PREVIEW_DATE ? new Date(process.env.PREVIEW_DATE) : new Date());

export const isPublished = (entry: CollectionEntry<'articles'>, now = buildDate()) =>
  entry.data.datePublished.getTime() <= now.getTime();

export async function getPublishedArticles() {
  return (await getCollection('articles')).filter((entry) => isPublished(entry));
}
