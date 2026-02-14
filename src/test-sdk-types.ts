
import { getSdk } from './lib/sdk';
import { ArticleQueryOptions } from '@chanomhub/sdk';

async function test() {
    const sdk = await getSdk();
    const slug = 'test-slug';
    const locale = 'en';

    // Test 1: Passing locale string (Should error)
    // const res1 = await sdk.articles.getWithDownloads(slug, locale);

    // Test 2: Passing options object (Should work)
    const res2 = await sdk.articles.getWithDownloads(slug, { language: locale });

    // Test 3: Check type of second argument
    type SecondArg = Parameters<typeof sdk.articles.getWithDownloads>[1];
    // This should be ArticleQueryOptions | undefined
}
