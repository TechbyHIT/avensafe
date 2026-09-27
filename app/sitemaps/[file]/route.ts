import { notFound } from 'next/navigation';
import { getSitemapXml } from '@/lib/sitemap/engine';
import { sitemapXmlResponse } from '@/lib/sitemap/response';

/**
 * Serves one batched sitemap, e.g. `/sitemaps/service-area-1.xml`.
 */
export const dynamic = 'force-dynamic';

interface RouteParams {
  readonly params: Promise<{ readonly file: string }>;
}

export async function GET(request: Request, { params }: RouteParams): Promise<Response> {
  const { file } = await params;

  if (!file.endsWith('.xml')) notFound();
  const name = file.slice(0, -'.xml'.length);

  const xml = getSitemapXml(name);
  if (!xml) notFound();

  return sitemapXmlResponse(xml, request);
}
