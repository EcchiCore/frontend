import { NextRequest, NextResponse } from 'next/server';
import { generateToken, verifyToken } from './../../lib/tokenUtils';
import { decodeFromUrl } from './../../lib/urlEncryption';

const API_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_BASE_URL;
const CACHE_DURATION = 60 * 60 * 48; // 48 hours in seconds

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const encodedDocumentId = searchParams.get('documentId');
    let documentId: string | null = null;

    // Decode documentId if present
    if (encodedDocumentId) {
      documentId = decodeFromUrl(encodedDocumentId);
      if (!documentId) {
        return NextResponse.json(
          { error: 'Invalid document ID' }, 
          { 
            status: 400,
            headers: {
              'Cache-Control': 'no-store'
            }
          }
        );
      }
    }

    // Token handling
    if (token) {
      const tokenData = verifyToken(token);
      if (!tokenData) {
        return NextResponse.json(
          { error: 'Invalid or expired token' }, 
          { 
            status: 401,
            headers: {
              'Cache-Control': 'no-store'
            }
          }
        );
      }
      documentId = tokenData.documentId;
    }
    else if (documentId) {
      const newToken = generateToken(documentId);
      return NextResponse.json(
        { token: newToken },
        {
          headers: {
            'Cache-Control': `public, max-age=${CACHE_DURATION}, s-maxage=${CACHE_DURATION}, stale-while-revalidate=60`
          }
        }
      );
    }
    else {
      return NextResponse.json(
        { error: 'Missing documentId or token' }, 
        { 
          status: 400,
          headers: {
            'Cache-Control': 'no-store'
          }
        }
      );
    }

    // Fetch data from Strapi
    const url = `${API_BASE_URL}/api/articles?filters[documentId][$eq]=${documentId}&populate[OS][populate][management][fields][0]=name&populate[OS][populate][management][fields][1]=url&populate[OS][populate][management][fields][2]=ready`;
   
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Return response with caching headers
    return NextResponse.json(
      data,
      {
        headers: {
          'Cache-Control': `public, max-age=${CACHE_DURATION}, s-maxage=${CACHE_DURATION}, stale-while-revalidate=60`
        }
      }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );
  }
}