// scripts/submit-indexnow.ts
import { submitToIndexNow } from '../src/utils/indexNow';

const siteUrl = 'https://chanomhub.com';

const importantPages = [
  '',
  '/games',
  '/chanox2',
  '/chanolite',
  '/tools',
  '/nst',
  '/donations',
  '/contact',
  '/privacy-policy'
];

async function run() {
  const urls = importantPages.map(p => `${siteUrl}${p}`);
  
  // Also add Thai locale versions
  const thUrls = importantPages.map(p => `${siteUrl}/th${p}`);
  
  const allUrls = [...urls, ...thUrls];

  console.log('Submitting', allUrls.length, 'URLs to IndexNow...');
  const success = await submitToIndexNow(allUrls);
  
  if (success) {
    console.log('Submission complete!');
  } else {
    console.error('Submission failed.');
  }
}

run();
