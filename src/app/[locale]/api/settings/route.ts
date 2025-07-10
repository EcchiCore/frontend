// src/app/api/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto'; // For generating CSRF tokens

const NESTJS_API_URL = process.env.API_URL || 'http://localhost:3000';

// Helper function to extract the auth token from request headers
function getAuthToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }
  return req.cookies.get('token')?.value || null;
}

// Store CSRF tokens in memory (for simplicity; use a database or session store in production)
const csrfTokenStore: Map<string, string> = new Map();

export async function GET(req: NextRequest) {
  const token = getAuthToken(req);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(`${NESTJS_API_URL}/api/user`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
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

    // Generate a CSRF token and associate it with the user's auth token
    const csrfToken = randomBytes(32).toString('hex');
    csrfTokenStore.set(token, csrfToken);

    return NextResponse.json({ user: data.user, csrfToken });
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = getAuthToken(req);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { user, csrfToken } = body;

    // Validate CSRF token
    const storedCsrfToken = csrfTokenStore.get(token);
    if (!storedCsrfToken || storedCsrfToken !== csrfToken) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    // Forward the user update request to the NestJS backend
    const response = await fetch(`${NESTJS_API_URL}/api/user`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
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

    // Optionally, remove the CSRF token after successful use (one-time use)
    csrfTokenStore.delete(token);

    return NextResponse.json({ user: data.user });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}