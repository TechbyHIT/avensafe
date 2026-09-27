import { getLongTailUrlsetXml } from '@/lib/sitemap/engine';
import { sitemapXmlResponse } from '@/lib/sitemap/response';

/**
 * Submitted long-tail Search Console sitemap (urlset, first 50k intent URLs).
 */
export const dynamic = 'force-dynamic';

export function GET(request: Request): Response {
  return sitemapXmlResponse(getLongTailUrlsetXml(), request);
}
