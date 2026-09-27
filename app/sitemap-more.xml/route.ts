import { getSitemapIndexXml } from '@/lib/sitemap/engine';
import { sitemapXmlResponse } from '@/lib/sitemap/response';

/**
 * Index of every primary child file. Listed in robots.txt so Google still
 * finds URLs beyond the 50k cap on `/sitemap.xml`.
 */
export const dynamic = 'force-dynamic';

export function GET(request: Request): Response {
  return sitemapXmlResponse(getSitemapIndexXml(), request);
}
