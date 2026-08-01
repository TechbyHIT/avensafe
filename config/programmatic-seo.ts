/**
 * Programmatic SEO strategy encoded as configuration.
 *
 * This site scales by adding JSON rows and toggles here — not by cloning page
 * files. Flat patterns such as `/{service}-installation-in-{locality}` map to
 * hierarchical URLs that preserve state context, breadcrumbs, and crawl depth:
 *
 *   Flat intent (marketing)     →  Canonical route on this site
 *   ─────────────────────────────────────────────────────────────
 *   invisible-grills-in-hyderabad → /telangana/hyderabad/invisible-grills
 *   …-installation-in-hyderabad   → /telangana/hyderabad/invisible-grills/installation
 *   …-price-in-hyderabad          → /telangana/hyderabad/invisible-grills/price
 *   …-in-gajuwaka                 → /…/hyderabad/gajuwaka/invisible-grills
 *   …-in-hyderabad-district       → /telangana/district/hyderabad/invisible-grills
 *
 * Full India admin trees (mandal → village → ward → street) are modelled in
 * `config/location-hierarchy.ts`. Pages are generated only for levels with real
 * rows that clear the publishing gate — never for empty combinatorial shells.
 *
 * No one can guarantee #1 rankings everywhere; the publishing gate (`CONTENT_THRESHOLDS`)
 * and indexability rules exist so quantity never outruns useful, localized pages.
 */

export {
  LOCATION_HIERARCHY,
  LOCATION_KINDS,
  type HierarchyLevel,
  type LocationKind,
} from '@/config/location-hierarchy';

/** Property- and audience-based landing themes (guides + future intent modules). */
export const PROPERTY_USE_CASES = [
  'apartments',
  'villas',
  'independent-houses',
  'high-rise',
  'balconies',
  'windows',
  'terraces',
  'offices',
  'schools',
  'hospitals',
  'hotels',
  'commercial-buildings',
] as const;

/** Problem / benefit themes for editorial and FAQ clustering. */
export const PROBLEM_THEMES = [
  'child-safety',
  'pet-safety',
  'bird-control',
  'pigeon-control',
  'monkey-protection',
  'fall-protection',
  'balcony-protection',
  'uv-resistance',
  'rust-resistance',
  'weather-resistance',
] as const;

/**
 * Services planned for full JSON records (see `config/service-catalog.ts`).
 * Until each has complete copy in `data/services.json`, keep `published: false`.
 */
export const TARGET_STATE_CODES = ['AP', 'TG', 'KA', 'KL', 'TN', 'MH', 'GA', 'OD'] as const;

/** Maximum intent URLs generated per service × location (see `data/search-intents.json`). */
export const INTENT_SCALE = {
  /** Intents marked `published: true` in JSON. */
  publishedIntentsOnly: true,
  /** Service-in-area intent URLs are the largest bucket — ISR on demand by default. */
  serviceInAreaIntentsEnabled: true,
} as const;
