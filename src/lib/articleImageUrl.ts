/**
 * Article Image URL Helper
 * 
 * Centralized utility for transforming article image URLs.
 * Handles both filename-only format (new API) and full URLs (backward compatibility).
 */

// CDN Base URL - can be configured via environment variable
const CDN_BASE_URL = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.chanomhub.com';

/**
 * Resolves an article image URL.
 * - If it's just a filename (e.g., "abc.jpg"), prepends the CDN base URL
 * - If it's already a full URL, returns it as-is
 * - Handles null/undefined gracefully
 * 
 * @param imageUrl - The image URL or filename from the API
 * @returns The full resolved image URL or null
 */
export function resolveArticleImageUrl(imageUrl: string | null | undefined): string | null {
    if (!imageUrl) return null;

    // Already a full URL - return as-is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // Filename only - prepend CDN base URL
    return `${CDN_BASE_URL}/${imageUrl}`;
}

/**
 * Resolves an image object with url property.
 * Used for article.images array which contains { url: string } objects.
 * 
 * @param image - The image object from the API
 * @returns The image object with resolved URL or null
 */
export function resolveArticleImageObject(
    image: { url: string } | null | undefined
): { url: string } | null {
    if (!image?.url) return null;
    const resolvedUrl = resolveArticleImageUrl(image.url);
    if (!resolvedUrl) return null;
    return { url: resolvedUrl };
}
