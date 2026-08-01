/**
 * Route registry.
 *
 * Every URL the site can serve is described here or derived from here. The
 * dynamic `[state]` segment sits at the site root, so this file also owns the
 * reserved-segment list that stops a location slug from shadowing a real page.
 */

export const STATIC_ROUTES = {
  home: '/',
  about: '/about',
  contact: '/contact',
  services: '/services',
  serviceAreas: '/service-areas',
  blog: '/blog',
  guides: '/guides',
  gallery: '/gallery',
  projects: '/projects',
  faq: '/faq',
  compare: '/compare',
  pricingGuide: '/pricing-guide',
  materialsGuide: '/materials-guide',
  installationGuide: '/installation-guide',
  safetyGuide: '/safety-guide',
  buyingGuide: '/buying-guide',
  maintenanceGuide: '/maintenance-guide',
  faqTroubleshootingGuide: '/faq-troubleshooting-guide',
} as const;

export type StaticRouteKey = keyof typeof STATIC_ROUTES;

/**
 * Cornerstone guides are published at the site root rather than under
 * `/guides/<slug>`. The guide detail route refuses these slugs so the same
 * content is never reachable from two URLs.
 */
export const CORNERSTONE_GUIDE_PATHS: Readonly<Record<string, string>> = {
  'pricing-guide': STATIC_ROUTES.pricingGuide,
  'materials-guide': STATIC_ROUTES.materialsGuide,
  'installation-guide': STATIC_ROUTES.installationGuide,
  'safety-guide': STATIC_ROUTES.safetyGuide,
  'balcony-safety-buying-guide': STATIC_ROUTES.buyingGuide,
  'net-and-cable-maintenance-guide': STATIC_ROUTES.maintenanceGuide,
  'faq-troubleshooting-guide': STATIC_ROUTES.faqTroubleshootingGuide,
};

/**
 * First-level path segments that can never be a state slug. Includes every
 * static route, the framework's own paths, and public asset folders.
 */
export const RESERVED_ROOT_SEGMENTS: ReadonlySet<string> = new Set([
  ...Object.values(STATIC_ROUTES)
    .map((path) => path.replace(/^\//, ''))
    .filter((segment) => segment.length > 0),
  'api',
  'sitemaps',
  'sitemap.xml',
  'robots.txt',
  'brand',
  'images',
  'icons',
  'favicon.ico',
  'manifest.webmanifest',
  '_next',
  'opengraph-image',
  'twitter-image',
]);

/**
 * The kinds of page the dynamic engines can produce. Used to select metadata
 * templates, schema graphs, content modules and sitemap buckets.
 */
export const PAGE_KINDS = [
  'home',
  'about',
  'contact',
  'serviceHub',
  'service',
  'serviceIntent',
  'serviceAreasHub',
  'state',
  'district',
  'city',
  'area',
  'serviceInDistrict',
  'serviceInCity',
  'serviceInArea',
  'serviceInCityIntent',
  'serviceInAreaIntent',
  'blogHub',
  'blogPost',
  'guideHub',
  'guide',
  'gallery',
  'projects',
  'faq',
] as const;

export type PageKind = (typeof PAGE_KINDS)[number];

/** Sitemap buckets, each rendered as its own batched XML file. */
export const SITEMAP_TYPES = [
  'core',
  'services',
  'service-intents',
  'states',
  'districts',
  'cities',
  'areas',
  'service-district',
  'service-city',
  'service-area',
  'service-city-intent',
  'service-area-intent',
  'blog',
  'guides',
  'images',
] as const;

export type SitemapType = (typeof SITEMAP_TYPES)[number];
