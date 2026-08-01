import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRERENDER } from '@/config/constants';
import { GeneratedPage } from '@/components/templates/GeneratedPage';
import { getAreas, getCityById, getSearchIntents, getServices, getStateById } from '@/lib/data/repository';
import { intentsForServiceInArea } from '@/lib/routing/facets';
import { loadPage } from '@/lib/routing/page-bundle';
import { metadataForPath } from '@/lib/routing/page-helpers';

/**
 * High-intent service-in-locality pages:
 * `/state/city/area/service/installation`, `/state/city/area/service/price`, …
 */
export const revalidate = 172800; // REVALIDATE.serviceLocation

interface RouteParams {
  readonly params: Promise<{
    readonly state: string;
    readonly city: string;
    readonly segment: string;
    readonly service: string;
    readonly intent: string;
  }>;
}

export function generateStaticParams(): {
  state: string;
  city: string;
  segment: string;
  service: string;
  intent: string;
}[] {
  if (!PRERENDER.serviceInAreaIntent) return [];

  const services = getServices();
  const intents = getSearchIntents();
  const params: {
    state: string;
    city: string;
    segment: string;
    service: string;
    intent: string;
  }[] = [];

  for (const area of getAreas()) {
    const city = getCityById(area.cityId);
    if (!city) continue;
    const state = getStateById(city.stateId);
    if (!state) continue;

    for (const service of services) {
      for (const intent of intentsForServiceInArea(intents, service, city)) {
        params.push({
          state: state.slug,
          city: city.slug,
          segment: area.slug,
          service: service.slug,
          intent: intent.slug,
        });
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { state, city, segment, service, intent } = await params;
  return metadataForPath(`/${state}/${city}/${segment}/${service}/${intent}`);
}

export default async function ServiceInAreaIntentPage({ params }: RouteParams) {
  const { state, city, segment, service, intent } = await params;
  const bundle = loadPage(`/${state}/${city}/${segment}/${service}/${intent}`);
  if (!bundle) notFound();

  return <GeneratedPage bundle={bundle} />;
}
