/**
 * Utility functions to encode and decode download URLs for link masking.
 * Uses a simple URL-safe base64 logic to run safely on both server and client.
 */

export function encodeDownloadUrl(url: string): string {
  const base64 = typeof window === 'undefined'
    ? Buffer.from(url).toString('base64')
    : btoa(unescape(encodeURIComponent(url)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeDownloadUrl(encoded: string): string {
  let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return typeof window === 'undefined'
    ? Buffer.from(base64, 'base64').toString('utf8')
    : decodeURIComponent(escape(atob(base64)));
}
