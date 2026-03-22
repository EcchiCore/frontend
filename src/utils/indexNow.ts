// src/utils/indexNow.ts

const INDEXNOW_KEY = '711d8339cc02456e97a36dba4a408303';
const HOST = 'chanomhub.com';
const INDEXNOW_URL = 'https://www.bing.com/indexnow';

/**
 * Submits a list of URLs to IndexNow (Bing/Yandex)
 * @param urlList List of absolute URLs to submit
 */
export async function submitToIndexNow(urlList: string[]) {
  if (!urlList || urlList.length === 0) return;

  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
    urlList: urlList,
  };

  try {
    const response = await fetch(INDEXNOW_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('IndexNow submission successful:', urlList.length, 'URLs');
      return true;
    } else {
      console.error('IndexNow submission failed:', response.status, await response.text());
      return false;
    }
  } catch (error) {
    console.error('IndexNow submission error:', error);
    return false;
  }
}
