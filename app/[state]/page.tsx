import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GeneratedPage } from '@/components/templates/GeneratedPage';
import { getStates } from '@/lib/data/repository';
import { loadPage } from '@/lib/routing/page-bundle';
import { metadataForPath } from '@/lib/routing/page-helpers';

/**
 * State pages sit at the site root, so this segment competes with every static
 * route. Next resolves static routes first, and `resolveStatePage` additionally
 * refuses any reserved segment, so `/about` can never be read as a state.
 */
export const revalidate = 86400; // REVALIDATE.state

interface RouteParams {
  readonly params: Promise<{ readonly state: string }>;
}

export function generateStaticParams(): { state: string }[] {
  return getStates().map((state) => ({ state: state.slug }));
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { state } = await params;
  return metadataForPath(`/${state}`);
}

export default async function StatePage({ params }: RouteParams) {
  const { state } = await params;
  const bundle = loadPage(`/${state}`);
  if (!bundle) notFound();

  return <GeneratedPage bundle={bundle} />;
}
