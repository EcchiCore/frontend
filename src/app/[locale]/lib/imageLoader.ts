'use client'
// src/app/lib/imageLoader.ts

export default function myImageLoader({
                                        src,
                                        width,
                                        quality,
                                      }: {
  src: string;
  width: number;
  quality?: number;
}) {
  const videoExtensions = ['.mp4', '.webm', '.ogv', '.mov', '.avi'];
  if (videoExtensions.some(ext => src.toLowerCase().endsWith(ext))) {
    return src;
  }

  const userQuality = getUserPreferredQuality();
  const finalQuality = (quality ?? userQuality ?? 80);
  const height = width;
  const format = 'format=auto';
  const encodedSrc = encodeURIComponent(src);

  // Try/catch for extra safety, even though logic is minimal
  try {
    const cdnUrl = `https://chanomhub.online/cdn-cgi/image/width=${width},height=${height},quality=${finalQuality},${format}/${encodedSrc}`;
    return cdnUrl;
  } catch (e) {
    console.warn('CDN image URL generation failed, using original:', e);
    return src; // fallback to original if error happens
  }
}

function getUserPreferredQuality(): number | null {
  if (typeof document === 'undefined') return null;
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
