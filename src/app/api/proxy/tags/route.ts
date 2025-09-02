
// src/app/api/proxy/tags/route.ts

import { NextResponse } from 'next/server';
import { getCached } from '@/lib/cache';

async function fetchTags() {
  const response = await fetch('https://api.chanomhub.online/api/tags');
  if (!response.ok) {
    throw new Error('Failed to fetch tags from backend');
  }
  return response.json();
}

export async function GET() {
  try {
    const tags = await getCached('tags', fetchTags);
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error in tags proxy API:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}
