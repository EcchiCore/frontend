
// src/app/api/proxy/categories/route.ts

import { NextResponse } from 'next/server';
import { getCached } from '@/lib/cache';

async function fetchCategories() {
  const response = await fetch('https://api.chanomhub.online/api/categories');
  if (!response.ok) {
    throw new Error('Failed to fetch categories from backend');
  }
  return response.json();
}

export async function GET() {
  try {
    const categories = await getCached('categories', fetchCategories);
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error in categories proxy API:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
