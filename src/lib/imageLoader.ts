'use client'

import { getImageUrl, type ImgproxyOptions } from '@/lib/imageUrl';

/**
 * Next.js Image Loader using imgproxy
 * 
 * Maps width breakpoints to appropriate imgproxy options for optimal performance.
 * This loader integrates with the SDK's imgproxy transformation functions.
 */
export default function myImageLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}) {
  // URLs with /cdn-cgi/image/ are already optimized by Cloudflare - return as-is
  if (src.includes('/cdn-cgi/image/')) {
    return src;
  }

  // URLs already processed by imgproxy - return as-is
  if (src.includes('/insecure/') || src.includes('imgproxy.chanomhub.com')) {
    return src;
  }

  // If it's already a full URL, return as-is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // Build imgproxy options based on requested width and quality
  const options: ImgproxyOptions = {
    width: width,
    height: 0, // Auto height
    resizeType: 'fit',
    quality: quality || 80,
    format: 'webp',
  };

  // Use SDK's getImageUrl for imgproxy transformation
  return getImageUrl(src, options) || src;
}

/**
 * Get imgproxy URL with specific preset
 */
export function getLoaderUrl(
  src: string,
  preset: 'card' | 'cardThumbnail' | 'hero' | 'gallery' | 'avatar' | 'placeholder' = 'card'
) {
  return getImageUrl(src, preset) || src;
}

function getUserPreferredQuality(): number | null {
  // Server-side rendering safety
  if (typeof window === 'undefined') return null;

  try {
    const cookies = document.cookie.split(';');
    let userPrefCookie = '';

    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'userPreferences') {
        userPrefCookie = decodeURIComponent(value);
        break;
      }
    }

    if (!userPrefCookie) return null;

    const userPreferences = JSON.parse(userPrefCookie);

    switch (userPreferences.imageResolution) {
      case 'low': return 60;
      case 'medium': return 80;
      case 'high': return 100;
      default: return 80;
    }
  } catch (error) {
    console.error('Error parsing userPreferences cookie:', error);
    return null;
  }
}

// Utility function เพื่อตรวจสอบว่า URL ใช้งานได้
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
