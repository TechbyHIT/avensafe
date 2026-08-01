import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GeneratedPage } from '@/components/templates/GeneratedPage';
import { getDistrictsByState, getStates } from '@/lib/data/repository';
import { loadPage } from '@/lib/routing/page-bundle';
import { metadataForPath } from '@/lib/routing/page-helpers';

export const revalidate = 86400; // REVALIDATE.district

interface RouteParams {
  readonly params: Promise<{ readonly state: string; readonly district: string }>;
}

export function generateStaticParams(): { state: string; district: string }[] {
  return getStates().flatMap((state) =>
    getDistrictsByState(state.id).map((district) => ({
      state: state.slug,
      district: district.slug,
    })),
  );
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { state, district } = await params;
  return metadataForPath(`/${state}/district/${district}`);
}

export default async function DistrictPage({ params }: RouteParams) {
  const { state, district } = await params;
  const bundle = loadPage(`/${state}/district/${district}`);
  if (!bundle) notFound();

  return <GeneratedPage bundle={bundle} />;
}
