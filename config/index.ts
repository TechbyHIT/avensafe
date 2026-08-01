/**
 * Barrel for the configuration layer so consumers can import from
 * `@/config` without knowing which file a value lives in.
 */
export {
  business,
  mailtoHref,
  primaryPhone,
  telHref,
  whatsappHref,
  whatsappPhone,
  whatsappPhones,
} from '@/config/business';
export {
  CONTENT_THRESHOLDS,
  LINK_LIMITS,
  PAGINATION,
  REVALIDATE,
  SEO_LIMITS,
  SITEMAP,
  VARIATION_SEED,
} from '@/config/constants';
export { FOOTER_COLUMNS, PRIMARY_NAV } from '@/config/navigation';
export {
  CORNERSTONE_GUIDE_PATHS,
  PAGE_KINDS,
  RESERVED_ROOT_SEGMENTS,
  SITEMAP_TYPES,
  STATIC_ROUTES,
} from '@/config/routes';
export type { PageKind, SitemapType, StaticRouteKey } from '@/config/routes';
export {
  ROBOTS_DISALLOW,
  ROBOTS_INDEXABLE,
  ROBOTS_NOINDEX,
  SEARCH_CONSOLE_VERIFICATION,
  SEO_DEFAULTS,
} from '@/config/seo';
