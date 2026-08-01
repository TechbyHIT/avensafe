/**
 * Builds the Areas mega-menu from published city/area data so every city with
 * localities surfaces crawlable internal links — not only Hyderabad.
 */
import { getAreasByCity, getCities, getServices, getStateById } from '@/lib/data/repository';
import { areaPath, cityPath, serviceInCityPath } from '@/lib/routing/url';
import type { AreaMegaCity, MegaMenuLink } from '@/config/mega-menu';

const PRIORITY_CITY_SLUGS = [
  'hyderabad',
  'bengaluru',
  'chennai',
  'mumbai',
  'pune',
  'visakhapatnam',
  'kochi',
  'mysuru',
  'coimbatore',
  'navi-mumbai',
  'thane',
  'nagpur',
  'bhubaneswar',
] as const;

export function buildAreasMegaMenu(): readonly AreaMegaCity[] {
  const services = getServices();
  const primary = services.find((entry) => entry.slug === 'invisible-grills') ?? services[0];
  const secondary = services.find((entry) => entry.slug === 'safety-nets') ?? services[1];

  const cities = [...getCities()].sort((a, b) => {
    const ai = PRIORITY_CITY_SLUGS.indexOf(a.slug as (typeof PRIORITY_CITY_SLUGS)[number]);
    const bi = PRIORITY_CITY_SLUGS.indexOf(b.slug as (typeof PRIORITY_CITY_SLUGS)[number]);
    const aRank = ai === -1 ? 999 : ai;
    const bRank = bi === -1 ? 999 : bi;
    if (aRank !== bRank) return aRank - bRank;
    return a.name.localeCompare(b.name);
  });

  const columns: AreaMegaCity[] = [];

  for (const city of cities) {
    if (columns.length >= 12) break;

    const state = getStateById(city.stateId);
    if (!state?.published) continue;

    const areas = getAreasByCity(city.id);
    if (areas.length === 0) continue;

    const href = cityPath(state, city);
    const links: MegaMenuLink[] = [];

    if (primary) {
      links.push({
        label: `${primary.name} in ${city.name}`,
        href: serviceInCityPath(primary, state, city),
      });
    }
    if (secondary) {
      links.push({
        label: `${secondary.name} in ${city.name}`,
        href: serviceInCityPath(secondary, state, city),
      });
    }

    for (const area of areas.slice(0, 6)) {
      links.push({
        label: area.name,
        href: areaPath(state, city, area),
      });
    }

    links.push({
      label: `All ${city.name} areas`,
      href,
    });

    columns.push({ name: city.name, href, areas: links });
  }

  return columns;
}
