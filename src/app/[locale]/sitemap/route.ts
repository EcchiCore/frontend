import { NextResponse, NextRequest } from 'next/server';
import { generateLanguageAlternates } from '../../../utils/metadataUtils';
import { supportedLocales, defaultLocale, siteUrl } from '../../../utils/localeUtils';

// Define the Article interface based on the API response
interface Article {
  id: number;
  title: string;
  slug: string;
  description: string;
  updatedAt: string;
  status: string;
  // Add other fields if needed (e.g., tagList, categoryList, etc.)
}

export async function GET(request: NextRequest) {
  try {
    // Extract locale from the URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);

    // Determine locale from URL path
    let locale = defaultLocale;
    if (pathSegments.length > 0) {
      const potentialLocale = pathSegments[0];
      if (supportedLocales.includes(potentialLocale as any)) {
        locale = potentialLocale as any;
      }
    }

    // Fetch articles from the API
    const response = await fetch(`${process.env.API_URL}/api/articles?status=PUBLISHED`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    });


    if (!response.ok) {
      console.error('Failed to fetch articles:', response.statusText);
      return new NextResponse('Internal Server Error: Failed to fetch articles', { status: 500 });
    }

    // Parse the JSON response and type it
    const data: { articles: Article[] } = await response.json();
    const articles = data.articles;

    // Get current date for lastmod
    const currentDate = new Date().toISOString();

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- Homepage -->
  <url>
    <loc>${siteUrl}/${locale}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    ${generateAlternateLinks('')}
  </url>
  
  <!-- Articles Pages -->
  <url>
    <loc>${siteUrl}/${locale}/articles</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    ${generateAlternateLinks('articles')}
  </url>
  
  <!-- Individual Articles -->
  ${articles.map((article: Article) => `
  <url>
    <loc>${siteUrl}/${locale}/articles/${article.slug}</loc>
    <lastmod>${new Date(article.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    ${generateAlternateLinks(`articles/${article.slug}`)}
  </url>`).join('')}
  
  <!-- Static Pages -->
  <url>
    <loc>${siteUrl}/${locale}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    ${generateAlternateLinks('about')}
  </url>
  
  <url>
    <loc>${siteUrl}/${locale}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
    ${generateAlternateLinks('contact')}
  </url>
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse(
      `Error generating sitemap: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    );
  }
}

// Helper function to generate alternate language links for SEO
function generateAlternateLinks(contentPath: string): string {
  const alternates = generateLanguageAlternates(contentPath);

  return Object.entries(alternates)
    .map(([hreflang, href]) =>
      `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}" />`
    )
    .join('\n    ');
}