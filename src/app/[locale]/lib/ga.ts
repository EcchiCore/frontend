import { BetaAnalyticsDataClient } from '@google-analytics/data';

let analyticsClient: BetaAnalyticsDataClient | null = null;

async function getAnalyticsClient() {
  if (!analyticsClient) {
    // Check if required environment variables are set
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error('Missing required Google Analytics credentials in environment variables');
    }

    analyticsClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });
  }
  return analyticsClient;
}

export async function getActiveUsers(propertyId: string): Promise<number> {
  try {
    const client = await getAnalyticsClient();

    const [response] = await client.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [{ name: 'activeUsers' }],
    });

    if (!response.rows || response.rows.length === 0) {
      return 0;
    }

    return parseInt(response.rows[0].metricValues?.[0].value || '0', 10);
  } catch (error) {
    console.error('Error getting active users from GA4:', error);
    return 0;
  }
}
