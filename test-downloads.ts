import { getSdk } from './src/lib/sdk';
async function test() {
  const sdk = await getSdk();
  const downloads = await sdk.downloads.getAll({ articleId: 351 }); // the screenshot URL has id=351, wait, actually URL is articles/sister-virodar-HJ401?id=351 but id is 351? No, article slug is mostly used. The editor form has article.id.
  console.log(JSON.stringify(downloads, null, 2));
}
test().catch(console.error);
