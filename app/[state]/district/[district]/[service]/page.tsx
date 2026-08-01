import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GeneratedPage } from '@/components/templates/GeneratedPage';
import { getDistrictsByState, getServices, getStates } from '@/lib/data/repository';
import { loadPage } from '@/lib/routing/page-bundle';
import { metadataForPath } from '@/lib/routing/page-helpers';

export const revalidate = 172800; // REVALIDATE.serviceLocation

interface RouteParams {
  readonly params: Promise<{
    readonly state: string;
    readonly district: string;
    readonly service: string;
  }>;
}

export function generateStaticParams(): { state: string; district: string; service: string }[] {
  const services = getServices();
  const params: { state: string; district: string; service: string }[] = [];

  for (const state of getStates()) {
    for (const district of getDistrictsByState(state.id)) {
      for (const service of services) {
        params.push({
          state: state.slug,
          district: district.slug,
          service: service.slug,
        });
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { state, district, service } = await params;
  return metadataForPath(`/${state}/district/${district}/${service}`);
}

export default async function ServiceInDistrictPage({ params }: RouteParams) {
  const { state, district, service } = await params;
  const bundle = loadPage(`/${state}/district/${district}/${service}`);
  if (!bundle) notFound();

  return <GeneratedPage bundle={bundle} />;
}
