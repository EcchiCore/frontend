import { NextResponse } from 'next/server';

import { buildSitemapXml, buildStaticFields } from '@/lib/sitemap';

export async function GET() {
  try {
    const generatedAt = new Date().toISOString();
    const fields = buildStaticFields(generatedAt);
    const xml = buildSitemapXml(fields);

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=60, s-maxage=300',
      },
    });
  } catch (error) {
    console.error('Error generating static sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
