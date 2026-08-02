import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRERENDER } from '@/config/constants';
import { GeneratedPage } from '@/components/templates/GeneratedPage';
import { getAreasByCity, getCitiesByState, getServices, getStates } from '@/lib/data/repository';
import { loadPage } from '@/lib/routing/page-bundle';
import { metadataForPath } from '@/lib/routing/page-helpers';

/**
 * The third segment is either a service (a service-in-city page) or a locality.
 * One route handles both because the two share a URL shape;
 * `resolveThirdSegment` decides which, and the data validator guarantees the two
 * slug spaces never collide.
 */
export const revalidate = 172800; // REVALIDATE.serviceLocation

interface RouteParams {
  readonly params: Promise<{
    readonly state: string;
    readonly city: string;
    readonly segment: string;
  }>;
}

/**
 * Localities + tier-1 service-in-city are prerendered by default.
 * `AVENSAFE_QUICK_BUILD=1` skips localities (ISR on first request) for <5m deploys.
 */
export function generateStaticParams(): { state: string; city: string; segment: string }[] {
  // Quick VPS: no locality / service-in-city prerender (ISR + sitemap unchanged).
  if (PRERENDER.quickBuild) return [];

  const services = getServices();
  const params: { state: string; city: string; segment: string }[] = [];

  for (const state of getStates()) {
    for (const city of getCitiesByState(state.id)) {
      for (const area of getAreasByCity(city.id)) {
        params.push({ state: state.slug, city: city.slug, segment: area.slug });
      }

      if (city.tier <= PRERENDER.serviceInCityMaxTier) {
        for (const service of services) {
          params.push({ state: state.slug, city: city.slug, segment: service.slug });
        }
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { state, city, segment } = await params;
  return metadataForPath(`/${state}/${city}/${segment}`);
}

export default async function AreaOrServiceInCityPage({ params }: RouteParams) {
  const { state, city, segment } = await params;
  const bundle = loadPage(`/${state}/${city}/${segment}`);
  if (!bundle) notFound();

  return <GeneratedPage bundle={bundle} />;
}
