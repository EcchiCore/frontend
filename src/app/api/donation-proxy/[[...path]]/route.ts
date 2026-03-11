import { NextRequest, NextResponse } from 'next/server';

async function handleProxy(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const resolvedParams = await params;
  const subPath = resolvedParams.path ? resolvedParams.path.join('/') : '';
  const searchParams = request.nextUrl.searchParams;
  
  const targetUrl = new URL(`https://widgets.easydonate.app/${subPath}`);
  
  // Forward all search parameters
  searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  try {
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // Skip host and other sensitive headers
      if (['host', 'connection', 'cookie'].includes(key.toLowerCase())) return;
      headers.set(key, value);
    });
    
    // Set mandatory headers for the target
    headers.set('Referer', 'https://widgets.easydonate.app/');
    headers.set('Origin', 'https://widgets.easydonate.app');

    const fetchOptions: RequestInit = {
      method: request.method,
      headers: headers,
      redirect: 'manual',
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      fetchOptions.body = await request.blob();
    }

    const response = await fetch(targetUrl.toString(), fetchOptions);

    // Handle redirects
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        const redirectUrl = new URL(location, 'https://widgets.easydonate.app/');
        if (redirectUrl.origin === 'https://widgets.easydonate.app') {
          // Redirect to our proxy instead
          const proxyRedirect = redirectUrl.pathname + redirectUrl.search;
          return NextResponse.redirect(new URL(`/api/donation-proxy${proxyRedirect}`, request.url));
        }
        return NextResponse.redirect(location);
      }
    }
    
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('text/html')) {
      let html = await response.text();

      // Inject script to intercept AJAX calls and make them same-origin
      const interceptScript = `
        <script>
          (function() {
            const PROXY_PATH = '/api/donation-proxy';
            const TARGET_DOMAIN = 'widgets.easydonate.app';

            function transformUrl(url) {
              if (!url) return url;
              try {
                const absoluteUrl = new URL(url, window.location.href);
                if (absoluteUrl.hostname === TARGET_DOMAIN) {
                  return PROXY_PATH + absoluteUrl.pathname + absoluteUrl.search;
                }
                if (url.startsWith('/') && !url.startsWith(PROXY_PATH)) {
                   return PROXY_PATH + url;
                }
              } catch (e) {}
              return url;
            }

            // Intercept XMLHttpRequest
            const originalOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url) {
              arguments[1] = transformUrl(url);
              return originalOpen.apply(this, arguments);
            };

            // Intercept fetch
            const originalFetch = window.fetch;
            window.fetch = function(input, init) {
              if (typeof input === 'string') {
                input = transformUrl(input);
              } else if (input instanceof Request) {
                const newUrl = transformUrl(input.url);
                if (newUrl !== input.url) {
                  input = new Request(newUrl, input);
                }
              }
              return originalFetch(input, init);
            };
          })();
        </script>
      `;

      // Inject <base> tag pointing to our proxy to handle relative assets
      const baseTag = '\n    <base href="/api/donation-proxy/">';
      
      if (html.includes('<head>')) {
        html = html.replace('<head>', `<head>${interceptScript}${baseTag}`);
      } else if (html.includes('<html>')) {
        html = html.replace('<html>', `<html><head>${interceptScript}${baseTag}</head>`);
      } else {
        html = `<head>${interceptScript}${baseTag}</head>` + html;
      }

      // Rewrite any hardcoded absolute links to easydonate in the HTML
      html = html.replace(/https:\/\/widgets\.easydonate\.app/g, '/api/donation-proxy');

      const responseHeaders = new Headers();
      responseHeaders.set('Content-Type', 'text/html; charset=utf-8');
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      
      return new NextResponse(html, {
        status: 200,
        headers: responseHeaders,
      });
    } else {
      // For other assets (JS, CSS, images, etc.), just pipe the response
      const responseHeaders = new Headers();
      for (const [key, value] of response.headers.entries()) {
        const lowerKey = key.toLowerCase();
        // Skip security headers that might block framing
        if (['x-frame-options', 'content-security-policy', 'report-to', 'nel'].includes(lowerKey)) continue;
        responseHeaders.set(key, value);
      }
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      
      return new NextResponse(response.body, {
        status: response.status,
        headers: responseHeaders,
      });
    }
  } catch (error) {
    console.error('Donation proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(request, context);
}
