import type { NextConfig } from 'next';
import withMDX from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Configure MDX (without remark/rehype plugins for Turbopack compatibility)
const withMDXEnhanced = withMDX({
  extension: /\.mdx?$/,
});

// Next.js configuration
const nextConfig: NextConfig = {
  images: {
    qualities: [25, 50, 75],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year
    remotePatterns: [
      { protocol: 'http', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'rustgram.onrender.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i.pinimg.com', pathname: '/**' },

      { protocol: 'https', hostname: 'resize.chanomhub.online', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.chanomhub.online', pathname: '/**' },
      { protocol: 'https', hostname: 'icons.duckduckgo.com', pathname: '/ip3/**' },
      { protocol: 'https', hostname: 'via.placeholder.com', pathname: '/**' },
      { protocol: 'https', hostname: 'files.catbox.moe', pathname: '/**' },
      { protocol: 'https', hostname: 'i.ibb.co', pathname: '/**' },
      // Note: cdn.chanomhub.com/cdn-cgi/** URLs use Cloudflare Image Transformation and should use unoptimized prop
      { protocol: 'https', hostname: 'cdn.chanomhub.com', pathname: '/**' },
      { protocol: 'https', hostname: 'imgproxy.chanomhub.com', pathname: '/**' },
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
    ],
  },

  // As per docs: experimental.dynamicIO -> cacheComponents (root)
  // But TS types for NextConfig might not have it yet if @types/next is old.
  // Package.json says next: 16.1.0. 
  // Let's stick to the doc suggestion: cacheComponents: true at root.
  cacheComponents: true,
  // Use custom cache handler if DRAGONFLY_URL is set and the file exists
  cacheHandler: (() => {
    if (!process.env.DRAGONFLY_URL) return undefined;
    try {
      return require.resolve('./src/lib/cache/dragonfly-handler.ts');
    } catch (e) {
      console.warn('Dragonfly cache handler not found, falling back to default cache.');
      return undefined;
    }
  })(),
  staticPageGenerationTimeout: 300, // Increase timeout to 5 minutes to handle slow APIs
  experimental: {
    cpus: 1, // Limit CPUs to reduce concurrent requests to the API during build
  },
  compiler: { removeConsole: process.env.NODE_ENV === 'production' },
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-Requested-With, Content-Type, Authorization' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
        ],
      },
    ];
  },
};

// Apply both withNextIntl and withMDXEnhanced
export default withNextIntl(withMDXEnhanced(nextConfig));
