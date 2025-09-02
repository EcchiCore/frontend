
import { NextRequest, NextResponse } from 'next/server';

function getAuthToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }
  return req.cookies.get('token')?.value || null;
}

export async function POST(request: NextRequest) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { articleId, name, url } = body;

    if (!articleId || !name || !url) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const backendResponse = await fetch('https://api.chanomhub.online/api/official-download-sources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        articleId,
        name,
        url,
      }),
    });

    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json({ message: 'Backend API error', details: backendData }, { status: backendResponse.status });
    }

    return NextResponse.json(backendData, { status: 200 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
