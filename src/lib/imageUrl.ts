/**
 * Image URL Utilities using @chanomhub/sdk imgproxy functions
 *
 * This module provides centralized image URL transformation using the SDK's
 * imgproxy functions for optimized image delivery.
 */

import {
    resolveImageUrl,
    getFallbackUrl,
    buildImgproxyPath,
    type ImgproxyOptions,
} from '@chanomhub/sdk';

// Environment-based configuration
const IMGPROXY_URL = process.env.NEXT_PUBLIC_IMGPROXY_URL || 'https://imgproxy.chanomhub.com';
const STORAGE_URL = 'https://cdn.chanomhub.com';

// Re-export types for convenience
export type { ImgproxyOptions, ImgproxyFormat, ImgproxyResizeType, ImgproxyGravity } from '@chanomhub/sdk';

// Default options for different use cases
export const IMAGE_PRESETS = {
    /** Game card thumbnail (300x188, webp, 80% quality) */
    cardThumbnail: {
        width: 300,
        height: 188,
        resizeType: 'fill',
        quality: 80,
        format: 'webp',
    } as ImgproxyOptions,

    /** Game card (600x375, webp, 85% quality) */
    card: {
        width: 600,
        height: 375,
        resizeType: 'fill',
        quality: 85,
        format: 'webp',
    } as ImgproxyOptions,

    /** Featured/Hero image (1200x675, webp, 90% quality) */
    hero: {
        width: 1200,
        height: 675,
        resizeType: 'fill',
        quality: 90,
        format: 'webp',
    } as ImgproxyOptions,

    /** Gallery image (800x0 - auto height, webp, 85% quality) */
    gallery: {
        width: 800,
        height: 0,
        resizeType: 'fit',
        quality: 85,
        format: 'webp',
    } as ImgproxyOptions,

    /** Avatar/Profile (128x128, webp, 80% quality) */
    avatar: {
        width: 128,
        height: 128,
        resizeType: 'fill',
        gravity: 'ce',
        quality: 80,
        format: 'webp',
    } as ImgproxyOptions,

    /** Blur placeholder (32x32, webp, 50% quality, blur) */
    placeholder: {
        width: 32,
        height: 32,
        resizeType: 'fill',
        quality: 50,
        blur: 10,
        format: 'webp',
    } as ImgproxyOptions,
} as const;

/**
 * Get an optimized image URL using imgproxy
 *
 * @param imageUrl - Image filename or full URL
 * @param preset - Preset name or custom ImgproxyOptions
 * @returns Optimized imgproxy URL or null
 *
 * @example
 * // Using preset
 * getImageUrl('abc.jpg', 'card')
 *
 * // Using custom options
 * getImageUrl('abc.jpg', { width: 400, height: 300, format: 'webp' })
 */
export function getImageUrl(
    imageUrl: string | null | undefined,
    preset: keyof typeof IMAGE_PRESETS | ImgproxyOptions = 'card'
): string | null {
    if (!imageUrl) return null;

    let processedUrl = imageUrl;

    // Robustly strip Cloudflare/Storage prefixes
    // Matches:
    // 1. Optional storage domain (https://cdn.chanomhub.com)
    // 2. Optional /cdn-cgi/image/... part (any options)
    // 3. Optional leading slash
    const prefixRegex = /^(?:https?:\/\/[^/]+)?(?:\/cdn-cgi\/image\/[^/]+\/)?\/?/;

    // If we match the storage url domain specifically, or just relative cdn-cgi paths
    if (processedUrl.includes('cdn-cgi/image/') || processedUrl.startsWith(STORAGE_URL)) {
        processedUrl = processedUrl.replace(prefixRegex, '');
    }

    const options = typeof preset === 'string' ? IMAGE_PRESETS[preset] : preset;
    return resolveImageUrl(processedUrl, IMGPROXY_URL, STORAGE_URL, options);
}

/**
 * Get the fallback (original source) URL for an image.
 * Useful when imgproxy fails to load.
 *
 * @param imageUrl - The image URL (potentially from imgproxy) or filename
 * @returns Original source URL
 */
export function getImageFallbackUrl(imageUrl: string | null | undefined): string | null {
    return getFallbackUrl(imageUrl, IMGPROXY_URL, STORAGE_URL);
}

/**
 * Build imgproxy options path for manual URL construction
 */
export { buildImgproxyPath };

/**
 * Check if a URL is an imgproxy URL
 */
export function isImgproxyUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    return url.startsWith(IMGPROXY_URL);
}

/**
 * Check if Next.js Image optimization should be skipped
 * (true for imgproxy URLs and Cloudflare CDN URLs)
 */
export function shouldSkipNextOptimization(url: string | null | undefined): boolean {
    if (!url) return false;
    return url.includes('/cdn-cgi/image/') || url.startsWith(IMGPROXY_URL);
}
