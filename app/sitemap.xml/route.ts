import { REVALIDATE } from '@/config/constants';
import { listSitemapFileNames, renderSitemapIndex } from '@/lib/sitemap/engine';

/**
 * Sitemap index at `/sitemap.xml`, pointing at each batched child sitemap.
 *
 * A route handler rather than Next's `sitemap.ts` convention, because we need
 * named files (`services.xml`, `service-area-1.xml`) instead of numeric ids.
 * The index only enumerates file names (cheap); each child builds its batch.
 */
export const dynamic = 'force-dynamic';

export function GET(): Response {
  const xml = renderSitemapIndex(listSitemapFileNames());

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': `public, max-age=0, s-maxage=${REVALIDATE.sitemap}, stale-while-revalidate=86400`,
    },
  });
}
