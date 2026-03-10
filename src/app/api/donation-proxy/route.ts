import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const targetUrl = new URL('https://widgets.easydonate.app');
  
  // Forward all search parameters
  searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  try {
    const response = await fetch(targetUrl.toString(), {
      headers: {
        'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0',
      }
    });
    
    if (!response.ok) {
      return new NextResponse(`Error fetching widget: ${response.statusText}`, { status: response.status });
    }

    let html = await response.text();

    // Inject <base> tag to handle relative assets correctly from our domain
    const baseTag = '\n    <base href="https://widgets.easydonate.app/">';
    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>${baseTag}`);
    } else if (html.includes('<html>')) {
      html = html.replace('<html>', `<html><head>${baseTag}</head>`);
    } else {
      html = `<head>${baseTag}</head>` + html;
    }

    // Prepare headers for the response
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'text/html; charset=utf-8');
    // Ensure X-Frame-Options is NOT set to SAMEORIGIN
    // We can either not set it or set it to allow our origin
    // By not setting it, most browsers will allow it in an iframe
    
    // Also handle CORS just in case
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    return new NextResponse(html, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Donation proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
