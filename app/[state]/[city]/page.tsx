import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GeneratedPage } from '@/components/templates/GeneratedPage';
import { getCitiesByState, getStates } from '@/lib/data/repository';
import { loadPage } from '@/lib/routing/page-bundle';
import { metadataForPath } from '@/lib/routing/page-helpers';

export const revalidate = 86400; // REVALIDATE.city

interface RouteParams {
  readonly params: Promise<{ readonly state: string; readonly city: string }>;
}

export function generateStaticParams(): { state: string; city: string }[] {
  return getStates().flatMap((state) =>
    getCitiesByState(state.id).map((city) => ({ state: state.slug, city: city.slug })),
  );
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { state, city } = await params;
  return metadataForPath(`/${state}/${city}`);
}

export default async function CityPage({ params }: RouteParams) {
  const { state, city } = await params;
  const bundle = loadPage(`/${state}/${city}`);
  if (!bundle) notFound();

  return <GeneratedPage bundle={bundle} />;
}
