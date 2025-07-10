import { NextResponse } from 'next/server';
import { getActiveUsers } from '../../lib/ga';

export async function GET() {
  try {
    const propertyId = process.env.GA_PROPERTY_ID;
    if (!propertyId) {
      throw new Error('GA_PROPERTY_ID is not configured');
    }

    const activeUsers = await getActiveUsers(propertyId);

    return NextResponse.json({ activeUsers });
  } catch (error) {
    console.error('Error fetching active users:', error);
    return NextResponse.json({ activeUsers: 0 }, { status: 500 });
  }
}
