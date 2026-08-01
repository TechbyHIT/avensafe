import { RESERVED_ROOT_SEGMENTS, STATIC_ROUTES } from '@/config/routes';
import {
  getAreaBySlug,
  getCityBySlug,
  getDistrictById,
  getDistrictBySlug,
  getSearchIntentBySlug,
  getServiceBySlug,
  getStateBySlug,
} from '@/lib/data/repository';
import type { City, State } from '@/lib/data/schemas';
import type { TraitKey } from '@/lib/data/schemas';
import {
  intentAllowedInArea,
  intentAllowedInCity,
  intentAppliesToService,
} from '@/lib/routing/facets';
import {
  areaPath,
  cityPath,
  districtPath,
  servicePath,
  serviceIntentPath,
  serviceInAreaPath,
  serviceInCityPath,
  serviceInDistrictPath,
  serviceInAreaIntentPath,
  serviceInCityIntentPath,
  statePath,
} from '@/lib/routing/url';
import type { Crumb, LocationTarget, PageTarget } from '@/types/routing';

/**
 * Turns route params into a `PageTarget`, or `null` when the combination does
 * not describe a real, published page (in which case the route calls
 * `notFound()`).
 *
 * All the ambiguity in the URL scheme is handled here. `/tg/hyderabad/x` can be
 * either a service in a city or an area, and resolving that in one place keeps
 * the page components free of routing logic.
 */

/**
 * Resolves the traits in force for a location, taking the most specific level
 * that declares any. Traits are not unioned up the hierarchy because that would
 * combine contradictory conditions — an inland area of a coastal state should
 * not inherit `coastal`.
 */
export function resolveTraits(location: LocationTarget | undefined): readonly TraitKey[] {
  if (!location) return [];
  if (location.area && location.area.traits.length > 0) return location.area.traits;
  if (location.city && location.city.traits.length > 0) return location.city.traits;
  return location.state.traits;
}

export function isReservedRootSegment(segment: string): boolean {
  return RESERVED_ROOT_SEGMENTS.has(segment);
}

/** Attaches the official district when a city row declares `districtId`. */
export function attachDistrictFromCity(location: LocationTarget): LocationTarget {
  if (location.district || !location.city) return location;
  const district = getDistrictById(location.city.districtId);
  if (!district) return location;
  return { ...location, district };
}

function locationWithCity(state: State, city: City, area?: LocationTarget['area']): LocationTarget {
  return attachDistrictFromCity({ state, city, ...(area ? { area } : {}) });
}

export function resolveDistrictPage(stateSlug: string, districtSlug: string): PageTarget | null {
  const state = getStateBySlug(stateSlug);
  if (!state) return null;
  const district = getDistrictBySlug(state.id, districtSlug);
  if (!district) return null;
  const location: LocationTarget = { state, district };
  return {
    kind: 'district',
    path: districtPath(state, district),
    location,
    traits: resolveTraits(location),
  };
}

export function resolveServiceInDistrictPage(
  stateSlug: string,
  districtSlug: string,
  serviceSlug: string,
): PageTarget | null {
  const state = getStateBySlug(stateSlug);
  if (!state) return null;
  const district = getDistrictBySlug(state.id, districtSlug);
  if (!district) return null;
  const service = getServiceBySlug(serviceSlug);
  if (!service) return null;

  const location: LocationTarget = { state, district };
  return {
    kind: 'serviceInDistrict',
    path: serviceInDistrictPath(service, state, district),
    service,
    location,
    traits: resolveTraits(location),
  };
}

export function resolveServicePage(serviceSlug: string): PageTarget | null {
  const service = getServiceBySlug(serviceSlug);
  if (!service) return null;
  return { kind: 'service', path: servicePath(service), service, traits: [] };
}

/**
 * National variant hub: `/services/{service}/{intent}` — unique page per
 * subsection, then lists every state/city for that combination.
 */
export function resolveServiceIntentPage(
  serviceSlug: string,
  intentSlug: string,
): PageTarget | null {
  const service = getServiceBySlug(serviceSlug);
  if (!service) return null;
  const intent = getSearchIntentBySlug(intentSlug);
  if (!intent || !intent.published) return null;
  if (!intentAppliesToService(intent, service)) return null;
  return {
    kind: 'serviceIntent',
    path: serviceIntentPath(service, intent),
    service,
    intent,
    traits: [],
  };
}

export function resolveStatePage(stateSlug: string): PageTarget | null {
  if (isReservedRootSegment(stateSlug)) return null;
  const state = getStateBySlug(stateSlug);
  if (!state) return null;
  const location: LocationTarget = { state };
  return {
    kind: 'state',
    path: statePath(state),
    location,
    traits: resolveTraits(location),
  };
}

export function resolveCityPage(stateSlug: string, citySlug: string): PageTarget | null {
  const state = getStateBySlug(stateSlug);
  if (!state) return null;
  const city = getCityBySlug(state.id, citySlug);
  if (!city) return null;
  const location = locationWithCity(state, city);
  return {
    kind: 'city',
    path: cityPath(state, city),
    location,
    traits: resolveTraits(location),
  };
}

/**
 * The third URL segment is either a service (a service-in-city page) or an area.
 * Services are tried first, and `validate-data` enforces that no area slug can
 * collide with a service slug, so the precedence never hides a real area page.
 */
export function resolveThirdSegment(
  stateSlug: string,
  citySlug: string,
  segment: string,
): PageTarget | null {
  const state = getStateBySlug(stateSlug);
  if (!state) return null;
  const city = getCityBySlug(state.id, citySlug);
  if (!city) return null;

  const service = getServiceBySlug(segment);
  if (service) {
    const location = locationWithCity(state, city);
    return {
      kind: 'serviceInCity',
      path: serviceInCityPath(service, state, city),
      service,
      location,
      traits: resolveTraits(location),
    };
  }

  const area = getAreaBySlug(city.id, segment);
  if (area) {
    const location = locationWithCity(state, city, area);
    return {
      kind: 'area',
      path: areaPath(state, city, area),
      location,
      traits: resolveTraits(location),
    };
  }

  return null;
}

export function resolveServiceInAreaPage(
  stateSlug: string,
  citySlug: string,
  areaSlug: string,
  serviceSlug: string,
): PageTarget | null {
  const state = getStateBySlug(stateSlug);
  if (!state) return null;
  const city = getCityBySlug(state.id, citySlug);
  if (!city) return null;
  const area = getAreaBySlug(city.id, areaSlug);
  if (!area) return null;
  const service = getServiceBySlug(serviceSlug);
  if (!service) return null;

  const location = locationWithCity(state, city, area);
  return {
    kind: 'serviceInArea',
    path: serviceInAreaPath(service, state, city, area),
    service,
    location,
    traits: resolveTraits(location),
  };
}

/**
 * Fourth segment disambiguation:
 * - `/state/city/service/intent` when the third segment is a service slug;
 * - `/state/city/area/service` when the third segment is a locality slug.
 */
export function resolveFourthSegment(
  stateSlug: string,
  citySlug: string,
  thirdSlug: string,
  fourthSlug: string,
): PageTarget | null {
  const serviceAsThird = getServiceBySlug(thirdSlug);
  if (serviceAsThird) {
    return resolveServiceInCityIntentPage(stateSlug, citySlug, thirdSlug, fourthSlug);
  }
  return resolveServiceInAreaPage(stateSlug, citySlug, thirdSlug, fourthSlug);
}

export function resolveServiceInCityIntentPage(
  stateSlug: string,
  citySlug: string,
  serviceSlug: string,
  intentSlug: string,
): PageTarget | null {
  const state = getStateBySlug(stateSlug);
  if (!state) return null;
  const city = getCityBySlug(state.id, citySlug);
  if (!city) return null;
  const service = getServiceBySlug(serviceSlug);
  if (!service) return null;
  const intent = getSearchIntentBySlug(intentSlug);
  if (!intent) return null;
  if (!intentAppliesToService(intent, service) || !intentAllowedInCity(intent, city)) {
    return null;
  }

  const location = locationWithCity(state, city);
  return {
    kind: 'serviceInCityIntent',
    path: serviceInCityIntentPath(service, state, city, intent),
    service,
    location,
    intent,
    traits: resolveTraits(location),
  };
}

export function resolveServiceInAreaIntentPage(
  stateSlug: string,
  citySlug: string,
  areaSlug: string,
  serviceSlug: string,
  intentSlug: string,
): PageTarget | null {
  const base = resolveServiceInAreaPage(stateSlug, citySlug, areaSlug, serviceSlug);
  if (!base) return null;
  const intent = getSearchIntentBySlug(intentSlug);
  if (!intent || !base.location?.area || !base.location.city) return null;

  const { service, location } = base;
  const city = location.city;
  const area = location.area;
  if (!service || !city || !area) return null;
  if (!intentAppliesToService(intent, service) || !intentAllowedInArea(intent, city)) {
    return null;
  }

  return {
    kind: 'serviceInAreaIntent',
    path: serviceInAreaIntentPath(service, location.state, city, area, intent),
    service,
    location,
    intent,
    traits: base.traits,
  };
}

/**
 * Breadcrumb trail for a target. Every generated page gets a full trail up to
 * the home page, which is what keeps deep location pages from being orphans.
 */
export function buildCrumbs(target: PageTarget): readonly Crumb[] {
  const crumbs: Crumb[] = [{ label: 'Home', href: STATIC_ROUTES.home }];
  const { service, location } = target;

  if (location) {
    crumbs.push({ label: 'Service areas', href: STATIC_ROUTES.serviceAreas });
    crumbs.push({ label: location.state.name, href: statePath(location.state) });

    if (location.district) {
      crumbs.push({
        label: location.district.name,
        href: districtPath(location.state, location.district),
      });
    }

    if (location.city) {
      crumbs.push({
        label: location.city.name,
        href: cityPath(location.state, location.city),
      });

      if (location.area) {
        crumbs.push({
          label: location.area.name,
          href: areaPath(location.state, location.city, location.area),
        });
      }
    }

    if (service && (location.city || location.district)) {
      const baseHref =
        target.intent && target.kind === 'serviceInCityIntent' && location.city
          ? serviceInCityPath(service, location.state, location.city)
          : target.intent && target.kind === 'serviceInAreaIntent' && location.area && location.city
            ? serviceInAreaPath(service, location.state, location.city, location.area)
            : target.path;
      crumbs.push({
        label: service.name,
        href: target.intent ? baseHref : target.path,
      });
      if (target.intent) {
        crumbs.push({ label: target.intent.label, href: target.path });
      }
    }
    return crumbs;
  }

  crumbs.push({ label: 'Services', href: STATIC_ROUTES.services });
  if (service) {
    crumbs.push({ label: service.name, href: servicePath(service) });
    if (target.intent && target.kind === 'serviceIntent') {
      crumbs.push({ label: target.intent.label, href: target.path });
    }
  }
  return crumbs;
}

/** Human-readable location label: "Kondapur, Hyderabad" or "Hyderabad, Telangana". */
export function locationLabel(location: LocationTarget | undefined): string {
  if (!location) return '';
  if (location.area && location.city && location.district) {
    return `${location.area.name}, ${location.city.name}, ${location.district.name}`;
  }
  if (location.area && location.city) return `${location.area.name}, ${location.city.name}`;
  if (location.city) return `${location.city.name}, ${location.state.name}`;
  // District-only pages must say "District" so labels never match same-named cities.
  if (location.district) {
    return `${location.district.name} District, ${location.state.name}`;
  }
  return location.state.name;
}

/** Short label used inside titles, where the full trail would be too long. */
export function shortLocationLabel(location: LocationTarget | undefined): string {
  if (!location) return '';
  if (location.area) return location.area.name;
  if (location.city) return location.city.name;
  if (location.district) return `${location.district.name} District`;
  return location.state.name;
}
