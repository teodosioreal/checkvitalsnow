import { getCollection, type CollectionEntry } from 'astro:content';

// Articles dated in the future stay hidden until a build runs on or after that date.
// A scheduled GitHub Action rebuilds the site every morning, so posts go live on their date.
export const isPublished = (entry: CollectionEntry<'articles'>, now = new Date()) =>
  entry.data.datePublished.getTime() <= now.getTime();

export async function getPublishedArticles() {
  return (await getCollection('articles')).filter((entry) => isPublished(entry));
}
