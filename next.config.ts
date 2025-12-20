import type { NextConfig } from 'next';
import withMDX from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Configure MDX
const withMDXEnhanced = withMDX({
  extension: /\.mdx?$/,
  options: { remarkPlugins: [], rehypePlugins: [] },
});

// Next.js configuration
const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
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
        ],
      },
    ];
  },
};

// Apply both withNextIntl and withMDXEnhanced
export default withNextIntl(withMDXEnhanced(nextConfig));
