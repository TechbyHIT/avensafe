import { REVALIDATE } from '@/config/constants';
import { getLongTailSitemapIndexXml } from '@/lib/sitemap/engine';

/**
 * Long-tail sitemap index (`/sitemap-long-tail.xml`).
 *
 * Google does not allow an index to list another index, so robots.txt lists
 * this beside `/sitemap.xml`. Submit both in Search Console.
 */
export const dynamic = 'force-dynamic';

const CACHE_CONTROL = `public, max-age=3600, s-maxage=${REVALIDATE.sitemap}, stale-while-revalidate=86400`;

export function GET(): Response {
  return new Response(getLongTailSitemapIndexXml(), {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': CACHE_CONTROL,
    },
  });
}
