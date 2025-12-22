import { NextRequest, NextResponse } from 'next/server';

function getAuthToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
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
    const { articleId, name, url, note, submitNote, isActive, vipOnly } = body;

    if (!articleId || !name || !url) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const backendResponse = await fetch(`${process.env.API_URL || "https://api.chanomhub.com"}/api/authorized-purchase-sources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        articleId,
        name,
        url,
        note,
        submitNote,
        isActive,
        vipOnly,
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
