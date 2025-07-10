// app/[locale]/s/[slug]/page.tsx
import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ShortlinkClient from './client';
import type { RedirectResponse, ShortlinkPageProps } from '../types/shortlink';

interface PageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

async function getRedirectData(slug: string, headers: HeadersInit = {}): Promise<RedirectResponse | null> {
  try {
    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/redirect/${slug}`, {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      cache: 'no-store', // Disable caching for dynamic content
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const redirectData: RedirectResponse = await response.json();
    return redirectData;
  } catch (error) {
    console.error('Error fetching redirect data:', error);
    return null;
  }
}

export default async function ShortlinkPage({ params }: PageProps) {
  // Await the params since it's now a Promise in Next.js 15+
  const { slug } = await params;

  // Get redirect data on the server
  const redirectData = await getRedirectData(slug);

  // If no data found, show 404
  if (!redirectData || !redirectData.success) {
    notFound();
  }

  const props: ShortlinkPageProps = {
    redirectData,
    slug,
  };

  return <ShortlinkClient {...props} />;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `Redirecting ${slug}... | ShortLink`,
    robots: {
      index: false,
      follow: false,
    },
  };
}