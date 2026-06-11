// scripts/submit-google-indexing.ts
import * as fs from 'fs';
import * as path from 'path';
import { JWT } from 'google-auth-library';

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
  const credentialsConfig = process.env.GOOGLE_INDEXING_CREDENTIALS;
  if (!credentialsConfig) {
    console.error('GOOGLE_INDEXING_CREDENTIALS environment variable not set.');
    process.exit(1);
  }

  let credentialsJson: { client_email?: string; private_key?: string } = {};
  try {
    credentialsJson = JSON.parse(credentialsConfig);
  } catch {
    const filePath = path.resolve(credentialsConfig);
    if (!fs.existsSync(filePath)) {
      console.error(`Google Indexing credentials file not found at path: ${filePath}`);
      process.exit(1);
    }
    try {
      credentialsJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.error(`Failed to read/parse credentials file: ${err}`);
      process.exit(1);
    }
  }

  if (!credentialsJson.client_email || !credentialsJson.private_key) {
    console.error('Credentials JSON missing client_email or private_key.');
    process.exit(1);
  }

  const privateKey = credentialsJson.private_key.replace(/\\n/g, '\n');
  const jwtClient = new JWT({
    email: credentialsJson.client_email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });

  const urls = importantPages.map(p => `${siteUrl}${p}`);
  const thUrls = importantPages.map(p => `${siteUrl}/th${p}`);
  const allUrls = [...urls, ...thUrls];

  console.log(`Submitting ${allUrls.length} URLs to Google Indexing API...`);

  for (const targetUrl of allUrls) {
    try {
      console.log(`Submitting: ${targetUrl}`);
      await jwtClient.request({
        url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
        method: 'POST',
        data: {
          url: targetUrl,
          type: 'URL_UPDATED',
        },
      });
      console.log(`Successfully indexed: ${targetUrl}`);
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        String(error);
      console.error(`Failed to index ${targetUrl}: ${message}`);
    }
  }
}

run();
