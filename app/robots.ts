import type { MetadataRoute } from 'next';
import { business } from '@/config/business';
import { ROBOTS_DISALLOW } from '@/config/seo';
import { absoluteUrl } from '@/lib/routing/url';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [...ROBOTS_DISALLOW],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: business.url,
  };
}
