import { business } from '@/config/business';
import { CORNERSTONE_GUIDE_PATHS, STATIC_ROUTES } from '@/config/routes';
import type {
  Area,
  BlogPost,
  City,
  District,
  Guide,
  Service,
  State,
} from '@/lib/data/schemas';

/**
 * The one place URLs are constructed.
 *
 * Canonical tags, internal links, breadcrumbs, sitemaps and structured data all
 * call these builders, so a URL can never be spelled two different ways in two
 * different places.
 */

/** Normalizes a path to a single leading slash and no trailing slash. */
export function normalizePath(path: string): string {
  const withLeading = path.startsWith('/') ? path : `/${path}`;
  if (withLeading === '/') return '/';
  return withLeading.replace(/\/+$/u, '');
}

/** Absolute URL on the configured origin. Used for canonicals and JSON-LD. */
export function absoluteUrl(path: string): string {
  return `${business.url}${normalizePath(path)}`;
}

export function servicePath(service: Service): string {
  return `${STATIC_ROUTES.services}/${service.slug}`;
}

/** National service × intent hub (lists every state/city for that variant). */
export function serviceIntentPath(
  service: Service,
  intent: { readonly slug: string },
): string {
  return `${STATIC_ROUTES.services}/${service.slug}/${intent.slug}`;
}

export function statePath(state: State): string {
  return `/${state.slug}`;
}

/** District hubs sit under a literal `district` segment to avoid city slug collisions. */
export function districtPath(state: State, district: District): string {
  return `/${state.slug}/district/${district.slug}`;
}

export function serviceInDistrictPath(
  service: Service,
  state: State,
  district: District,
): string {
  return `/${state.slug}/district/${district.slug}/${service.slug}`;
}

export function cityPath(state: State, city: City): string {
  return `/${state.slug}/${city.slug}`;
}

export function areaPath(state: State, city: City, area: Area): string {
  return `/${state.slug}/${city.slug}/${area.slug}`;
}

export function serviceInCityPath(service: Service, state: State, city: City): string {
  return `/${state.slug}/${city.slug}/${service.slug}`;
}

export function serviceInAreaPath(
  service: Service,
  state: State,
  city: City,
  area: Area,
): string {
  return `/${state.slug}/${city.slug}/${area.slug}/${service.slug}`;
}

export function serviceInCityIntentPath(
  service: Service,
  state: State,
  city: City,
  intent: { readonly slug: string },
): string {
  return `/${state.slug}/${city.slug}/${service.slug}/${intent.slug}`;
}

export function serviceInAreaIntentPath(
  service: Service,
  state: State,
  city: City,
  area: Area,
  intent: { readonly slug: string },
): string {
  return `/${state.slug}/${city.slug}/${area.slug}/${service.slug}/${intent.slug}`;
}

/**
 * Cornerstone guides live at the site root; everything else sits under
 * `/guides/`. Routing this through one function is what prevents the same guide
 * being reachable at two URLs.
 */
export function guidePath(guide: Guide): string {
  return CORNERSTONE_GUIDE_PATHS[guide.slug] ?? `${STATIC_ROUTES.guides}/${guide.slug}`;
}

export function blogPath(post: BlogPost): string {
  return `${STATIC_ROUTES.blog}/${post.slug}`;
}

/** True when a guide slug is claimed by a root-level cornerstone route. */
export function isCornerstoneGuideSlug(slug: string): boolean {
  return Object.hasOwn(CORNERSTONE_GUIDE_PATHS, slug);
}
