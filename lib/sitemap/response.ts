import { gzipSync } from 'node:zlib';
import { REVALIDATE } from '@/config/constants';

const CACHE_CONTROL = `public, max-age=3600, s-maxage=${REVALIDATE.sitemap}, stale-while-revalidate=86400`;

/** XML sitemap response. Gzip when the client asks — 50k urlsets shrink ~8×. */
export function sitemapXmlResponse(xml: string, request?: Request): Response {
  const headers: Record<string, string> = {
    'content-type': 'application/xml; charset=utf-8',
    'cache-control': CACHE_CONTROL,
    vary: 'accept-encoding',
  };

  const accept = request?.headers.get('accept-encoding') ?? '';
  if (accept.includes('gzip')) {
    headers['content-encoding'] = 'gzip';
    return new Response(new Uint8Array(gzipSync(xml)), { headers });
  }

  return new Response(xml, { headers });
}
