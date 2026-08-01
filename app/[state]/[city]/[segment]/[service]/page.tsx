import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRERENDER } from '@/config/constants';
import { GeneratedPage } from '@/components/templates/GeneratedPage';
import {
  getAreas,
  getCitiesByState,
  getCityById,
  getSearchIntents,
  getServices,
  getStateById,
  getStates,
} from '@/lib/data/repository';
import { intentsForServiceInCity } from '@/lib/routing/facets';
import { loadPage } from '@/lib/routing/page-bundle';
import { metadataForPath } from '@/lib/routing/page-helpers';

/**
 * Fourth segment disambiguation (see `resolveFourthSegment`):
 * - `/state/city/service/intent` when the third segment is a service slug;
 * - `/state/city/area/service` when the third segment is a locality slug.
 */
export const revalidate = 172800; // REVALIDATE.serviceLocation

interface RouteParams {
  readonly params: Promise<{
    readonly state: string;
    readonly city: string;
    readonly segment: string;
    readonly service: string;
  }>;
}

export function generateStaticParams(): {
  state: string;
  city: string;
  segment: string;
  service: string;
}[] {
  const services = getServices();
  const intents = getSearchIntents();
  const params: { state: string; city: string; segment: string; service: string }[] = [];

  if (PRERENDER.serviceInArea) {
    for (const area of getAreas()) {
      const city = getCityById(area.cityId);
      if (!city) continue;
      const state = getStateById(city.stateId);
      if (!state) continue;

      for (const service of services) {
        params.push({
          state: state.slug,
          city: city.slug,
          segment: area.slug,
          service: service.slug,
        });
      }
    }
  }

  for (const state of getStates()) {
    for (const city of getCitiesByState(state.id)) {
      if (city.tier > PRERENDER.serviceInCityIntentMaxTier) continue;
      for (const service of services) {
        for (const intent of intentsForServiceInCity(intents, service, city)) {
          params.push({
            state: state.slug,
            city: city.slug,
            segment: service.slug,
            service: intent.slug,
          });
        }
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { state, city, segment, service } = await params;
  return metadataForPath(`/${state}/${city}/${segment}/${service}`);
}

export default async function ServiceInAreaOrIntentPage({ params }: RouteParams) {
  const { state, city, segment, service } = await params;
  const bundle = loadPage(`/${state}/${city}/${segment}/${service}`);
  if (!bundle) notFound();

  return <GeneratedPage bundle={bundle} />;
}
