import { NextRequest, NextResponse } from 'next/server';

const NESTJS_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper function to extract the Authorization header from the request
function getAuthorizationHeader(req: NextRequest): string | null {
  return req.headers.get('authorization');
}

export async function GET(req: NextRequest) {
  const authHeader = getAuthorizationHeader(req);
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized: Missing Authorization header' }, { status: 401 });
  }

  try {
    // Forward the request to the NestJS backend using the provided Authorization header
    const response = await fetch(`${NESTJS_API_URL}/api/user`, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch user data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ user: data.user });
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authHeader = getAuthorizationHeader(req);
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized: Missing Authorization header' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { user, captchaToken } = body;

    // Validate CAPTCHA with Cloudflare
    const captchaResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY,
        response: captchaToken,
      }),
    });

    const captchaData = await captchaResponse.json();
    if (!captchaData.success) {
      return NextResponse.json({ error: 'CAPTCHA validation failed' }, { status: 400 });
    }

    // Forward the user update request to the NestJS backend using the provided Authorization header
    const response = await fetch(`${NESTJS_API_URL}/api/user`, {
      method: 'PUT',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ user }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to update profile' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ user: data.user });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
