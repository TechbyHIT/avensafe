import { getPrimaryUrlsetXml } from '@/lib/sitemap/engine';
import { sitemapXmlResponse } from '@/lib/sitemap/response';

/**
 * Submitted Search Console sitemap. Must be a urlset (not an index) so GSC
 * immediately counts discovered pages.
 */
export const dynamic = 'force-dynamic';

export function GET(request: Request): Response {
  return sitemapXmlResponse(getPrimaryUrlsetXml(), request);
}
