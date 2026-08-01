import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const configDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Security headers applied to every response. Kept here rather than in
 * middleware so they are emitted for static and ISR responses alike.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  /** Slim Node runtime for PM2 (no Docker) — see ecosystem.config.cjs */
  output: 'standalone',
  /** Keep standalone output flat (avoid /var/www/... nesting on VPS). */
  outputFileTracingRoot: configDir,

  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    // VPS fast path: AVENSAFE_SKIP_LINT=1 (set by deploy/pm2-release.sh --fast)
    ignoreDuringBuilds: process.env.AVENSAFE_SKIP_LINT === '1',
  },

  // Windows: keep concurrency low (OOM risk). Linux VPS: allow more workers
  // via AVENSAFE_SG_CONCURRENCY (pm2-release --fast sets 8).
  experimental: {
    staticGenerationMaxConcurrency: (() => {
      const fromEnv = Number(process.env.AVENSAFE_SG_CONCURRENCY ?? '');
      if (Number.isFinite(fromEnv) && fromEnv >= 1) return fromEnv;
      return process.platform === 'win32' ? 2 : 6;
    })(),
    staticGenerationMinPagesPerWorker: 25,
  },

  images: {
    // AVIF first, WebP fallback. Next negotiates via the Accept header.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [96, 128, 192, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },

  async redirects() {
    return [
      {
        source: '/favicon.ico',
        destination: '/favicon.png',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
