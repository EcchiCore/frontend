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
  experimental: {
    mdxRs: {
      mdxType: 'gfm', // Enable GitHub Flavored Markdown (tables, strikethrough, etc.)
    },
  },
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
    ],
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
