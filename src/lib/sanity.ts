import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const client = createClient({
  projectId: '7cmm88by',
  dataset: 'production',
  useCdn: true, // set to `false` for fresh data
  apiVersion: '2024-07-18', // use a UTC date in YYYY-MM-DD format
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}
