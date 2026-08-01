import { REVALIDATE } from '@/config/constants';
import { getSitemapIndexXml } from '@/lib/sitemap/engine';

/**
 * Sitemap index at `/sitemap.xml`, pointing at each batched child sitemap.
 *
 * A route handler rather than Next's `sitemap.ts` convention, because we need
 * named files (`services.xml`, `service-area-1.xml`) instead of numeric ids.
 * The index only enumerates file names (cheap); each child builds its batch.
 */
export const dynamic = 'force-dynamic';

const CACHE_CONTROL = `public, max-age=3600, s-maxage=${REVALIDATE.sitemap}, stale-while-revalidate=86400`;

export function GET(): Response {
  return new Response(getSitemapIndexXml(), {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': CACHE_CONTROL,
    },
  });
}
