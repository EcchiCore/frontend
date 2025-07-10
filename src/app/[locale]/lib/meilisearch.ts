import { MeiliSearch } from 'meilisearch';

const meiliClient = new MeiliSearch({
  host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST || 'https://search.chanomhub.online',
  apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY || '',
});

console.log('MeiliSearch Client Initialized with Host:', meiliClient.config.host);

export { meiliClient };