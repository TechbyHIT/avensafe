import {
  getAreas,
  getAreasByCity,
  getCities,
  getCityById,
  getSearchIntents,
  getServices,
  getStateById,
} from '@/lib/data/repository';
import { intentsForServiceInCity } from '@/lib/routing/facets';
import {
  cityTierIndexesCityIntent,
  cityTierIndexesLocality,
  isRankingIntentSlug,
  isRankingServiceSlug,
} from '@/lib/seo/index-policy';
import { areaPath, serviceInAreaPath, serviceInCityIntentPath } from '@/lib/routing/url';
import type { City, SearchIntent, Service } from '@/lib/data/schemas';

/**
 * Path-only sitemap enumeration. Child sitemaps must not allocate PageTargets
 * or hash lastmods — Googlebot drops 8 MB files that take too long to build,
 * which is why Search Console showed 0 discovered pages on the indexes.
 */

const cityIntentMemo = new Map<string, readonly SearchIntent[]>();

let cachedAreaCount: number | undefined;
let cachedServiceAreaCount: number | undefined;
let cachedCityIntentCount: number | undefined;

export function resetSitemapPathCache(): void {
  cityIntentMemo.clear();
  cachedAreaCount = undefined;
  cachedServiceAreaCount = undefined;
  cachedCityIntentCount = undefined;
}

function cityIntents(
  intents: readonly SearchIntent[],
  service: Service,
  city: City,
): readonly SearchIntent[] {
  const hit = cityIntentMemo.get(service.slug);
  if (hit) return hit;
  const list = intentsForServiceInCity(intents, service, city);
  cityIntentMemo.set(service.slug, list);
  return list;
}

function rankingServices(): readonly Service[] {
  return getServices().filter((service) => isRankingServiceSlug(service.slug));
}

/** Installation and price for the three priority services, on tier 1–2 cities. */
function indexableCityIntents(
  intents: readonly SearchIntent[],
  service: Service,
  city: City,
): readonly SearchIntent[] {
  if (!cityTierIndexesCityIntent(city.tier) || !isRankingServiceSlug(service.slug)) return [];
  return cityIntents(intents, service, city).filter((intent) => isRankingIntentSlug(intent.slug));
}

export function cachedCountAreaTargets(): number {
  if (cachedAreaCount !== undefined) return cachedAreaCount;
  let count = 0;
  for (const city of getCities()) {
    if (!getStateById(city.stateId) || !cityTierIndexesLocality(city.tier)) continue;
    count += getAreasByCity(city.id).length;
  }
  cachedAreaCount = count;
  return count;
}

export function cachedCountServiceAreaTargets(): number {
  if (cachedServiceAreaCount !== undefined) return cachedServiceAreaCount;
  const serviceCount = rankingServices().length;
  let count = 0;
  for (const area of getAreas()) {
    const city = getCityById(area.cityId);
    if (!city || !getStateById(city.stateId) || !cityTierIndexesLocality(city.tier)) continue;
    count += serviceCount;
  }
  cachedServiceAreaCount = count;
  return count;
}

export function cachedCountServiceCityIntentTargets(): number {
  if (cachedCityIntentCount !== undefined) return cachedCityIntentCount;
  const services = getServices();
  const intents = getSearchIntents();
  let count = 0;
  for (const city of getCities()) {
    if (!getStateById(city.stateId)) continue;
    for (const service of services) {
      count += indexableCityIntents(intents, service, city).length;
    }
  }
  cachedCityIntentCount = count;
  return count;
}

/**
 * Locality × service × intent URLs stay on the site as noindex pages.
 * They are not submitted to Search Console.
 */
export function cachedCountServiceAreaIntentTargets(): number {
  return 0;
}

export function sliceAreaPaths(offset: number, limit: number): readonly string[] {
  if (limit <= 0 || offset < 0) return [];
  const paths: string[] = [];
  let index = 0;
  for (const city of getCities()) {
    const state = getStateById(city.stateId);
    if (!state) continue;
    if (!cityTierIndexesLocality(city.tier)) continue;
    const areas = getAreasByCity(city.id);
    if (index + areas.length <= offset) {
      index += areas.length;
      continue;
    }
    for (const area of areas) {
      if (index >= offset + limit) return paths;
      if (index >= offset) paths.push(areaPath(state, city, area));
      index += 1;
    }
  }
  return paths;
}

export function sliceServiceAreaPaths(offset: number, limit: number): readonly string[] {
  if (limit <= 0 || offset < 0) return [];
  const paths: string[] = [];
  const services = rankingServices();
  const stride = services.length;
  let index = 0;
  for (const area of getAreas()) {
    const city = getCityById(area.cityId);
    if (!city || !cityTierIndexesLocality(city.tier)) continue;
    const state = getStateById(city.stateId);
    if (!state) continue;
    if (index + stride <= offset) {
      index += stride;
      continue;
    }
    for (const service of services) {
      if (index >= offset + limit) return paths;
      if (index >= offset) paths.push(serviceInAreaPath(service, state, city, area));
      index += 1;
    }
  }
  return paths;
}

export function sliceServiceCityIntentPaths(offset: number, limit: number): readonly string[] {
  if (limit <= 0 || offset < 0) return [];
  const paths: string[] = [];
  const services = getServices();
  const intents = getSearchIntents();
  let index = 0;
  for (const city of getCities()) {
    const state = getStateById(city.stateId);
    if (!state) continue;
    let cityCount = 0;
    const perService: ReadonlyArray<readonly SearchIntent[]> = services.map((service) => {
      const list = indexableCityIntents(intents, service, city);
      cityCount += list.length;
      return list;
    });
    if (index + cityCount <= offset) {
      index += cityCount;
      continue;
    }
    for (let i = 0; i < services.length; i += 1) {
      const service = services[i]!;
      for (const intent of perService[i] ?? []) {
        if (index >= offset + limit) return paths;
        if (index >= offset) {
          paths.push(serviceInCityIntentPath(service, state, city, intent));
        }
        index += 1;
      }
    }
  }
  return paths;
}

export function sliceServiceAreaIntentPaths(_offset: number, _limit: number): readonly string[] {
  return [];
}
