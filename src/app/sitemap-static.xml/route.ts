// app/sitemap-static.xml/route.ts
import { NextResponse } from 'next/server';
import { buildSitemapXml, buildStaticFields } from '@/lib/sitemap';

export async function GET() {
  try {
    const generatedAt = new Date().toISOString();
    const xml = buildSitemapXml(buildStaticFields(generatedAt));

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Static sitemap error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}