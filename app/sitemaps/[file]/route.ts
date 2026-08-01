import { notFound } from 'next/navigation';
import { REVALIDATE } from '@/config/constants';
import { getSitemapFile, renderUrlset } from '@/lib/sitemap/engine';

/**
 * Serves one batched sitemap, e.g. `/sitemaps/service-area-1.xml`.
 *
 * The `.xml` suffix is part of the route param rather than a folder name, so a
 * single handler covers every bucket and batch.
 */
export const dynamic = 'force-dynamic';

interface RouteParams {
  readonly params: Promise<{ readonly file: string }>;
}

export async function GET(_request: Request, { params }: RouteParams): Promise<Response> {
  const { file } = await params;

  if (!file.endsWith('.xml')) notFound();
  const name = file.slice(0, -'.xml'.length);

  const sitemap = getSitemapFile(name);
  if (!sitemap) notFound();

  return new Response(renderUrlset(sitemap), {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': `public, max-age=0, s-maxage=${REVALIDATE.sitemap}, stale-while-revalidate=86400`,
    },
  });
}
