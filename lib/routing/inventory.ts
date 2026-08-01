import { taxonomyServiceIntentPairs } from '@/config/service-taxonomy';
import {
  getAreas,
  getAreasByCity,
  getCities,
  getCitiesByState,
  getCityById,
  getDistricts,
  getDistrictsByState,
  getSearchIntentBySlug,
  getSearchIntents,
  getServices,
  getStateById,
  getStates,
} from '@/lib/data/repository';
import {
  intentAppliesToService,
  intentsForServiceInArea,
  intentsForServiceInCity,
} from '@/lib/routing/facets';
import { resolveTraits } from '@/lib/routing/resolve';
import {
  areaPath,
  cityPath,
  districtPath,
  servicePath,
  serviceIntentPath,
  serviceInAreaPath,
  serviceInAreaIntentPath,
  serviceInCityPath,
  serviceInCityIntentPath,
  serviceInDistrictPath,
  statePath,
} from '@/lib/routing/url';
import type { LocationTarget, PageTarget } from '@/types/routing';

/**
 * Enumerates every dynamically generated page as a `PageTarget`.
 *
 * The sitemap engine, the SEO validator and the route report all read from here,
 * so there is exactly one definition of "which URLs exist". Nothing is
 * generated as a physical file: this is a projection over the JSON data, which
 * is what lets the URL count grow by adding rows rather than folders.
 */

export function listServiceTargets(): readonly PageTarget[] {
  return getServices().map((service) => ({
    kind: 'service' as const,
    path: servicePath(service),
    service,
    traits: [],
  }));
}

/** National hubs for every taxonomy subsection (unique service × intent pages). */
export function listServiceIntentTargets(): readonly PageTarget[] {
  const services = new Map(getServices().map((service) => [service.slug, service]));
  const targets: PageTarget[] = [];
  const seen = new Set<string>();

  for (const pair of taxonomyServiceIntentPairs()) {
    const key = `${pair.serviceSlug}/${pair.intentSlug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const service = services.get(pair.serviceSlug);
    const intent = getSearchIntentBySlug(pair.intentSlug);
    if (!service || !intent?.published) continue;
    if (!intentAppliesToService(intent, service)) continue;
    targets.push({
      kind: 'serviceIntent',
      path: serviceIntentPath(service, intent),
      service,
      intent,
      traits: [],
    });
  }

  return targets;
}

export function listStateTargets(): readonly PageTarget[] {
  return getStates().map((state) => {
    const location: LocationTarget = { state };
    return {
      kind: 'state' as const,
      path: statePath(state),
      location,
      traits: resolveTraits(location),
    };
  });
}

export function listDistrictTargets(): readonly PageTarget[] {
  const targets: PageTarget[] = [];
  for (const state of getStates()) {
    for (const district of getDistrictsByState(state.id)) {
      const location: LocationTarget = { state, district };
      targets.push({
        kind: 'district',
        path: districtPath(state, district),
        location,
        traits: resolveTraits(location),
      });
    }
  }
  return targets;
}

export function listServiceDistrictTargets(): readonly PageTarget[] {
  const targets: PageTarget[] = [];
  const services = getServices();
  for (const district of getDistricts()) {
    const state = getStateById(district.stateId);
    if (!state) continue;
    const location: LocationTarget = { state, district };
    const traits = resolveTraits(location);
    for (const service of services) {
      targets.push({
        kind: 'serviceInDistrict',
        path: serviceInDistrictPath(service, state, district),
        service,
        location,
        traits,
      });
    }
  }
  return targets;
}

export function listCityTargets(): readonly PageTarget[] {
  const targets: PageTarget[] = [];
  for (const state of getStates()) {
    for (const city of getCitiesByState(state.id)) {
      const location: LocationTarget = { state, city };
      targets.push({
        kind: 'city',
        path: cityPath(state, city),
        location,
        traits: resolveTraits(location),
      });
    }
  }
  return targets;
}

export function listAreaTargets(): readonly PageTarget[] {
  const targets: PageTarget[] = [];
  for (const city of getCities()) {
    const state = getStateById(city.stateId);
    if (!state) continue;
    for (const area of getAreasByCity(city.id)) {
      const location: LocationTarget = { state, city, area };
      targets.push({
        kind: 'area',
        path: areaPath(state, city, area),
        location,
        traits: resolveTraits(location),
      });
    }
  }
  return targets;
}

export function listServiceCityTargets(): readonly PageTarget[] {
  const targets: PageTarget[] = [];
  const services = getServices();
  for (const city of getCities()) {
    const state = getStateById(city.stateId);
    if (!state) continue;
    const location: LocationTarget = { state, city };
    const traits = resolveTraits(location);
    for (const service of services) {
      targets.push({
        kind: 'serviceInCity',
        path: serviceInCityPath(service, state, city),
        service,
        location,
        traits,
      });
    }
  }
  return targets;
}

export function listServiceAreaTargets(): readonly PageTarget[] {
  const targets: PageTarget[] = [];
  const services = getServices();
  for (const area of getAreas()) {
    const city = getCityById(area.cityId);
    if (!city) continue;
    const state = getStateById(city.stateId);
    if (!state) continue;
    const location: LocationTarget = { state, city, area };
    const traits = resolveTraits(location);
    for (const service of services) {
      targets.push({
        kind: 'serviceInArea',
        path: serviceInAreaPath(service, state, city, area),
        service,
        location,
        traits,
      });
    }
  }
  return targets;
}

/** Count without allocating the full service × area matrix. */
export function countServiceAreaTargets(): number {
  let count = 0;
  const serviceCount = getServices().length;
  for (const area of getAreas()) {
    const city = getCityById(area.cityId);
    if (!city || !getStateById(city.stateId)) continue;
    count += serviceCount;
  }
  return count;
}

/** Slice of service × area targets for sitemap batches. */
export function sliceServiceAreaTargets(offset: number, limit: number): readonly PageTarget[] {
  if (limit <= 0 || offset < 0) return [];
  const targets: PageTarget[] = [];
  const services = getServices();
  let index = 0;
  for (const area of getAreas()) {
    const city = getCityById(area.cityId);
    if (!city) continue;
    const state = getStateById(city.stateId);
    if (!state) continue;
    const location: LocationTarget = { state, city, area };
    const traits = resolveTraits(location);
    for (const service of services) {
      if (index >= offset + limit) return targets;
      if (index >= offset) {
        targets.push({
          kind: 'serviceInArea',
          path: serviceInAreaPath(service, state, city, area),
          service,
          location,
          traits,
        });
      }
      index += 1;
    }
  }
  return targets;
}

export function listServiceCityIntentTargets(): readonly PageTarget[] {
  const targets: PageTarget[] = [];
  const services = getServices();
  const intents = getSearchIntents();
  for (const city of getCities()) {
    const state = getStateById(city.stateId);
    if (!state) continue;
    const location: LocationTarget = { state, city };
    const traits = resolveTraits(location);
    for (const service of services) {
      for (const intent of intentsForServiceInCity(intents, service, city)) {
        targets.push({
          kind: 'serviceInCityIntent',
          path: serviceInCityIntentPath(service, state, city, intent),
          service,
          location,
          intent,
          traits,
        });
      }
    }
  }
  return targets;
}

export function countServiceCityIntentTargets(): number {
  let count = 0;
  const services = getServices();
  const intents = getSearchIntents();
  for (const city of getCities()) {
    for (const service of services) {
      count += intentsForServiceInCity(intents, service, city).length;
    }
  }
  return count;
}

export function sliceServiceCityIntentTargets(offset: number, limit: number): readonly PageTarget[] {
  if (limit <= 0 || offset < 0) return [];
  const targets: PageTarget[] = [];
  const services = getServices();
  const intents = getSearchIntents();
  let index = 0;
  for (const city of getCities()) {
    const state = getStateById(city.stateId);
    if (!state) continue;
    const location: LocationTarget = { state, city };
    const traits = resolveTraits(location);
    for (const service of services) {
      for (const intent of intentsForServiceInCity(intents, service, city)) {
        if (index >= offset + limit) return targets;
        if (index >= offset) {
          targets.push({
            kind: 'serviceInCityIntent',
            path: serviceInCityIntentPath(service, state, city, intent),
            service,
            location,
            intent,
            traits,
          });
        }
        index += 1;
      }
    }
  }
  return targets;
}

export function listServiceAreaIntentTargets(): readonly PageTarget[] {
  const targets: PageTarget[] = [];
  const services = getServices();
  const intents = getSearchIntents();
  for (const area of getAreas()) {
    const city = getCityById(area.cityId);
    if (!city) continue;
    const state = getStateById(city.stateId);
    if (!state) continue;
    const location: LocationTarget = { state, city, area };
    const traits = resolveTraits(location);
    for (const service of services) {
      for (const intent of intentsForServiceInArea(intents, service, city)) {
        targets.push({
          kind: 'serviceInAreaIntent',
          path: serviceInAreaIntentPath(service, state, city, area, intent),
          service,
          location,
          intent,
          traits,
        });
      }
    }
  }
  return targets;
}

export function countServiceAreaIntentTargets(): number {
  let count = 0;
  const services = getServices();
  const intents = getSearchIntents();
  for (const area of getAreas()) {
    const city = getCityById(area.cityId);
    if (!city) continue;
    for (const service of services) {
      count += intentsForServiceInArea(intents, service, city).length;
    }
  }
  return count;
}

export function sliceServiceAreaIntentTargets(offset: number, limit: number): readonly PageTarget[] {
  if (limit <= 0 || offset < 0) return [];
  const targets: PageTarget[] = [];
  const services = getServices();
  const intents = getSearchIntents();
  let index = 0;
  for (const area of getAreas()) {
    const city = getCityById(area.cityId);
    if (!city) continue;
    const state = getStateById(city.stateId);
    if (!state) continue;
    const location: LocationTarget = { state, city, area };
    const traits = resolveTraits(location);
    for (const service of services) {
      for (const intent of intentsForServiceInArea(intents, service, city)) {
        if (index >= offset + limit) return targets;
        if (index >= offset) {
          targets.push({
            kind: 'serviceInAreaIntent',
            path: serviceInAreaIntentPath(service, state, city, area, intent),
            service,
            location,
            intent,
            traits,
          });
        }
        index += 1;
      }
    }
  }
  return targets;
}

export function listAllTargets(): readonly PageTarget[] {
  return [
    ...listServiceTargets(),
    ...listServiceIntentTargets(),
    ...listStateTargets(),
    ...listDistrictTargets(),
    ...listCityTargets(),
    ...listAreaTargets(),
    ...listServiceCityTargets(),
    ...listServiceDistrictTargets(),
    ...listServiceAreaTargets(),
    ...listServiceCityIntentTargets(),
    ...listServiceAreaIntentTargets(),
  ];
}
