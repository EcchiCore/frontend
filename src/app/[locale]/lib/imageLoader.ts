'use client'

// src/app/lib/[locale]/imageLoader.ts
export default function myImageLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}) {
  // Debug log
  console.log('Image loader called with:', { src, width, quality });

  // ตรวจสอบว่าคือ relative path /image/... หรือ full URL
  const isRelativeImage = src.startsWith('/image/');
  const isRustgramImage = isRelativeImage || src.startsWith('https://rustgram.onrender.com');
  
  // หากเป็น Rustgram image
  if (isRustgramImage) {
    // สร้าง absolute URL
    const baseUrl = 'https://rustgram.onrender.com';
    const finalSrc = isRelativeImage ? `${baseUrl}${src}` : src;
    
    // ไม่ใส่ query parameters เพราะ Rustgram อาจไม่รองรับ
    console.log('Returning Rustgram URL:', finalSrc);
    return finalSrc;
  }
  
  // ภาพจาก URL อื่น ใช้ตรง ๆ ไม่ optimize
  console.log('Returning external URL:', src);
  return src;
}

// Alternative version with optimization (ถ้า Rustgram รองรับ)
export function myImageLoaderWithOptimization({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}) {
  const isRelativeImage = src.startsWith('/image/');
  const isRustgramImage = isRelativeImage || src.startsWith('https://rustgram.onrender.com');
  
  if (isRustgramImage) {
    const baseUrl = 'https://rustgram.onrender.com';
    const finalSrc = isRelativeImage ? `${baseUrl}${src}` : src;
    const finalQuality = quality ?? getUserPreferredQuality() ?? 80;
    
    // ใช้ format ที่ Rustgram รองรับ (ต้องเช็ค API docs)
    return `${finalSrc}?w=${width}&q=${finalQuality}`;
  }
  
  return src;
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
