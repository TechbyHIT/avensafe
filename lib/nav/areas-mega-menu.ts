/**
 * Builds the Areas mega-menu from published city/area data so every city with
 * localities surfaces crawlable internal links — not only Hyderabad.
 */
import { LINK_LIMITS } from '@/config/constants';
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

  // Cap cities + areas so the desktop mega-menu is not a 100+ anchor matrix on
  // every HTML response (mobile drawer no longer duplicates this list).
  const AREAS_PER_CITY = LINK_LIMITS.areasOnCityPage;
  const MAX_CITIES = 8;

  for (const city of cities) {
    if (columns.length >= MAX_CITIES) break;

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

    const preview = areas.slice(0, AREAS_PER_CITY);
    for (const area of preview) {
      links.push({
        label: area.name,
        href: areaPath(state, city, area),
      });
    }

    const remaining = areas.length - preview.length;
    links.push({
      label: remaining > 0 ? `+${remaining} more in ${city.name}` : `All ${city.name} areas`,
      href,
    });

    columns.push({ name: city.name, href, areas: links });
  }

  return columns;
}
