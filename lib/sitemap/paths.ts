import {
  getAreas,
  getAreasByCity,
  getCities,
  getCityById,
  getSearchIntents,
  getServices,
  getStateById,
} from '@/lib/data/repository';
import { intentsForServiceInArea, intentsForServiceInCity } from '@/lib/routing/facets';
import {
  areaPath,
  serviceInAreaIntentPath,
  serviceInAreaPath,
  serviceInCityIntentPath,
} from '@/lib/routing/url';
import type { City, SearchIntent, Service } from '@/lib/data/schemas';

/**
 * Path-only sitemap enumeration. Child sitemaps must not allocate PageTargets
 * or hash lastmods — Googlebot drops 8 MB files that take too long to build,
 * which is why Search Console showed 0 discovered pages on the indexes.
 */

const cityIntentMemo = new Map<string, readonly SearchIntent[]>();
const areaIntentMemo = new Map<string, readonly SearchIntent[]>();

let cachedAreaCount: number | undefined;
let cachedServiceAreaCount: number | undefined;
let cachedCityIntentCount: number | undefined;
let cachedAreaIntentCount: number | undefined;

export function resetSitemapPathCache(): void {
  cityIntentMemo.clear();
  areaIntentMemo.clear();
  cachedAreaCount = undefined;
  cachedServiceAreaCount = undefined;
  cachedCityIntentCount = undefined;
  cachedAreaIntentCount = undefined;
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

function areaIntents(
  intents: readonly SearchIntent[],
  service: Service,
  city: City,
): readonly SearchIntent[] {
  const key = `${service.slug}:${city.tier}`;
  const hit = areaIntentMemo.get(key);
  if (hit) return hit;
  const list = intentsForServiceInArea(intents, service, city);
  areaIntentMemo.set(key, list);
  return list;
}

export function cachedCountAreaTargets(): number {
  if (cachedAreaCount !== undefined) return cachedAreaCount;
  let count = 0;
  for (const city of getCities()) {
    if (!getStateById(city.stateId)) continue;
    count += getAreasByCity(city.id).length;
  }
  cachedAreaCount = count;
  return count;
}

export function cachedCountServiceAreaTargets(): number {
  if (cachedServiceAreaCount !== undefined) return cachedServiceAreaCount;
  const serviceCount = getServices().length;
  let count = 0;
  for (const area of getAreas()) {
    const city = getCityById(area.cityId);
    if (!city || !getStateById(city.stateId)) continue;
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
      count += cityIntents(intents, service, city).length;
    }
  }
  cachedCityIntentCount = count;
  return count;
}

export function cachedCountServiceAreaIntentTargets(): number {
  if (cachedAreaIntentCount !== undefined) return cachedAreaIntentCount;
  const services = getServices();
  const intents = getSearchIntents();
  let count = 0;
  for (const area of getAreas()) {
    const city = getCityById(area.cityId);
    if (!city || !getStateById(city.stateId)) continue;
    for (const service of services) {
      count += areaIntents(intents, service, city).length;
    }
  }
  cachedAreaIntentCount = count;
  return count;
}

export function sliceAreaPaths(offset: number, limit: number): readonly string[] {
  if (limit <= 0 || offset < 0) return [];
  const paths: string[] = [];
  let index = 0;
  for (const city of getCities()) {
    const state = getStateById(city.stateId);
    if (!state) continue;
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
  const services = getServices();
  const stride = services.length;
  let index = 0;
  for (const area of getAreas()) {
    const city = getCityById(area.cityId);
    if (!city) continue;
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
      const list = cityIntents(intents, service, city);
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

export function sliceServiceAreaIntentPaths(offset: number, limit: number): readonly string[] {
  if (limit <= 0 || offset < 0) return [];
  const paths: string[] = [];
  const services = getServices();
  const intents = getSearchIntents();
  let index = 0;
  for (const area of getAreas()) {
    const city = getCityById(area.cityId);
    if (!city) continue;
    const state = getStateById(city.stateId);
    if (!state) continue;
    let areaCount = 0;
    const perService: ReadonlyArray<readonly SearchIntent[]> = services.map((service) => {
      const list = areaIntents(intents, service, city);
      areaCount += list.length;
      return list;
    });
    if (index + areaCount <= offset) {
      index += areaCount;
      continue;
    }
    for (let i = 0; i < services.length; i += 1) {
      const service = services[i]!;
      for (const intent of perService[i] ?? []) {
        if (index >= offset + limit) return paths;
        if (index >= offset) {
          paths.push(serviceInAreaIntentPath(service, state, city, area, intent));
        }
        index += 1;
      }
    }
  }
  return paths;
}
