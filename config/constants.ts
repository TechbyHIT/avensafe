/**
 * Tunable limits for the routing, SEO, sitemap, linking and content engines.
 *
 * These are deliberately centralized: scaling the site from a few hundred to
 * tens of thousands of URLs should be a matter of editing values here and
 * adding JSON rows, never editing page components.
 */

/** ISR revalidation windows, in seconds. */
export const REVALIDATE = {
  /** Marketing pages change rarely but should not go stale for long. */
  home: 60 * 60 * 6,
  static: 60 * 60 * 12,
  serviceHub: 60 * 60 * 12,
  service: 60 * 60 * 12,
  state: 60 * 60 * 24,
  district: 60 * 60 * 24,
  city: 60 * 60 * 24,
  area: 60 * 60 * 24 * 2,
  serviceLocation: 60 * 60 * 24 * 2,
  editorial: 60 * 60 * 12,
  sitemap: 60 * 60 * 12,
} as const;

/**
 * Caps for the internal link engine. Contextual links only: enough to build a
 * crawlable graph and help a reader, never a footer dump.
 */
export const LINK_LIMITS = {
  /** All published services must appear in service-nav groups. */
  relatedServices: 8,
  nearbyCities: 24,
  /** Adjacent localities in related-links (full list lives in LocalityDirectory UI). */
  nearbyAreas: 24,
  /** Related-link deep locality dump per city/service (UI directory shows all). */
  areasOnCityPage: 48,
  citiesOnStatePage: 80,
  districtsOnStatePage: 80,
  citiesOnDistrictPage: 40,
  relatedGuides: 6,
  relatedPosts: 4,
  taxonomyIntents: 24,
  /**
   * Hard ceiling on generated contextual links per page.
   * Critical groups (services/intents/parents) are assembled first so locality
   * dumps cannot starve them.
   */
  maxContextualLinksPerPage: 360,
  /** Cap FAQs rendered on a single generated page. */
  maxFaqsPerPage: 15,
} as const;

/** How many items each index page shows before paginating. */
export const PAGINATION = {
  blog: 12,
  guides: 12,
  gallery: 18,
  projects: 12,
  cities: 60,
  areas: 120,
} as const;

/**
 * Sitemap batching. The protocol allows 50,000 URLs per file; we use a smaller
 * batch so files stay small, cache well and are quick to regenerate.
 */
export const SITEMAP = {
  batchSize: 5_000,
  maxUrlsPerFile: 50_000,
} as const;

/** Search-result rendering budgets used by the SEO validator. */
export const SEO_LIMITS = {
  titleMin: 20,
  titleMax: 62,
  descriptionMin: 80,
  descriptionMax: 165,
  h1Max: 90,
} as const;

/**
 * Advisory content depth targets for reports and audits.
 * Sitemap inventory URLs stay indexable even when below these floors —
 * only structural routing faults set `noindex`.
 */
export const CONTENT_THRESHOLDS = {
  /** Minimum unique body words before a page may be published. */
  minWords: 350,
  /**
   * Service × locality pages stay conversion-focused (target 800–1,500 words).
   * Deep buying/install/price content lives in cornerstone guides instead.
   */
  minWordsServiceInArea: 800,
  /** Service × city pages (target 2,000–3,000 words). */
  minWordsServiceInCity: 1800,
  /** City hub pages (target 2,000–4,000 words). */
  minWordsCity: 1600,
  /**
   * State hub floor (editorial target 6,000–10,000). The live floor stays
   * reachable for small states while city matrices and guides carry depth.
   */
  minWordsState: 2000,
  /** District hubs (target 1,500–3,000). */
  minWordsDistrict: 1200,
  /** Service × district pages. */
  minWordsServiceInDistrict: 1400,
  /** National service × intent hubs (target 1,200–2,500). */
  minWordsServiceIntent: 1200,
  minModulesServiceIntent: 7,
  /** Minimum number of content modules a page must render. */
  minModules: 6,
  minModulesServiceInArea: 7,
  minModulesServiceInCity: 10,
  minModulesCity: 8,
  minModulesState: 8,
  minModulesDistrict: 7,
  minModulesServiceInDistrict: 8,
  /** Minimum FAQs required on a location or service page. */
  minFaqs: 3,
  minFaqsServiceLocation: 5,
  /**
   * Minimum share of a page's words that must come from location- or
   * service-specific facts rather than shared boilerplate.
   */
  /**
   * Location landings must be majority entity-derived. Catalogue modules are
   * marked non-specific so this ratio actually gates boilerplate.
   */
  minSpecificityRatio: 0.4,
} as const;

/**
 * Build-time prerendering budget.
 *
 * At scale it is neither necessary nor desirable to prerender every URL. High
 * value pages are built ahead of time; the long tail is rendered on first
 * request and then cached by ISR, which keeps build times flat as the corpus
 * grows from hundreds to tens of thousands of URLs.
 */
export const PRERENDER = {
  /** Prerender service-in-city pages only for cities at or below this tier. */
  serviceInCityMaxTier: 1,
  /** Service-in-area pages are the largest bucket, so they build on demand. */
  serviceInArea: false,
  /** High-intent modifier pages (installation, price, …) for tier-1 cities only. */
  serviceInCityIntentMaxTier: 1,
  serviceInAreaIntent: false,
} as const;

/** Deterministic seed so content and metadata variation is stable per URL. */
export const VARIATION_SEED = 'avensafe-v1';
