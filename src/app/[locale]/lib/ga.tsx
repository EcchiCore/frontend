import { BetaAnalyticsDataClient } from '@google-analytics/data';

let analyticsClient: BetaAnalyticsDataClient | null = null;

async function getAnalyticsClient() {
  if (!analyticsClient) {
    const { BetaAnalyticsDataClient } = await import('@google-analytics/data');
    analyticsClient = new BetaAnalyticsDataClient({
      keyFilename: 'public/analytics-464118-e7b70d3545b6.json',
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