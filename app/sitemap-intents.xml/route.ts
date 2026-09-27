import { getLongTailSitemapIndexXml } from '@/lib/sitemap/engine';
import { sitemapXmlResponse } from '@/lib/sitemap/response';

/**
 * Index of every intent child file. Listed in robots.txt for URLs beyond
 * the 50k cap on `/sitemap-long-tail.xml`.
 */
export const dynamic = 'force-dynamic';

export function GET(request: Request): Response {
  return sitemapXmlResponse(getLongTailSitemapIndexXml(), request);
}
