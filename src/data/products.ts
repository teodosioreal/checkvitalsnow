import products from './products.json';

export type Product = (typeof products)[number];

export function getProduct(id: string): Product {
  const product = products.find((p) => p.id === id);
  if (!product) throw new Error(`Unknown product id: ${id}`);
  return product;
}

export function goUrl(id: string): string {
  return `/go/${getProduct(id).goSlug}/`;
}

export { products };
