import {
  modifiersToRegexPatterns,
  productPhrasesForResolver,
} from '@/config/keyword-modifiers';
import {
  getAreaBySlug,
  getCities,
  getSearchIntentBySlug,
  getSearchIntents,
  getServiceBySlug,
  getStateById,
} from '@/lib/data/repository';
import type { Area, City, SearchIntent, Service, State } from '@/lib/data/schemas';
import {
  intentAllowedInArea,
  intentAppliesToService,
} from '@/lib/routing/facets';
import {
  serviceInAreaIntentPath,
  serviceInAreaPath,
  serviceInCityIntentPath,
  serviceInCityPath,
} from '@/lib/routing/url';
import { slugify } from '@/lib/utils/text';

/**
 * Maps long-tail search phrases to canonical service + intent URLs.
 *
 * We do not mint one page per keyword variant. Synonyms and plural forms roll up
 * to the same location URL; only distinct intents (price, for-balcony, …) get
 * their own path segment.
 *
 * Phrases ending with ` in {locality} {city}` resolve to area URLs when the area
 * is published; otherwise they roll up to the city URL for that city.
 */

export interface KeywordResolution {
  readonly phrase: string;
  readonly service?: Service;
  readonly intent?: SearchIntent;
  readonly state?: State;
  readonly city?: City;
  readonly area?: Area;
  readonly locality?: string;
  readonly locationTier?: 'area' | 'city' | 'none';
  /** Canonical path when location (from phrase or example) is known. */
  readonly examplePath?: string;
  readonly coverage: 'full' | 'alias-only' | 'unmapped';
  readonly note?: string;
}

/**
 * Longest-match modifier patterns → intent slug.
 * High-specificity patterns stay first; the catalog fills the long-tail aliases.
 */
const MODIFIER_PATTERNS: readonly { readonly pattern: RegExp; readonly intentSlug: string }[] = [
  { pattern: /\bcost per square feet\b/u, intentSlug: 'per-sq-ft' },
  { pattern: /\bper sq ft price\b/u, intentSlug: 'per-sq-ft' },
  { pattern: /\binstallation cost\b/u, intentSlug: 'installation-cost' },
  { pattern: /\bprice list\b/u, intentSlug: 'price-list' },
  { pattern: /\binvisible grills? vs ms grills?\b/u, intentSlug: 'vs-ms-grills' },
  { pattern: /\binvisible grills? vs iron grills?\b/u, intentSlug: 'vs-iron-grills' },
  { pattern: /\bvs iron grills?\b/u, intentSlug: 'vs-iron-grills' },
  { pattern: /\bvs ms grills?\b/u, intentSlug: 'vs-ms-grills' },
  { pattern: /\bvs bird nets?\b/u, intentSlug: 'vs-bird-nets' },
  { pattern: /\bbetter than (?:iron|ms|traditional) grills?\b/u, intentSlug: 'vs-iron-grills' },
  { pattern: /\bbuying guide\b/u, intentSlug: 'buying-guide' },
  { pattern: /\bwarranty guide\b/u, intentSlug: 'warranty-guide' },
  { pattern: /\bfree site visit\b/u, intentSlug: 'free-site-visit' },
  { pattern: /\bfree (?:visit|inspection|measurement|quote|estimate)\b/u, intentSlug: 'free-site-visit' },
  { pattern: /\bbird spikes?\b/u, intentSlug: 'bird-spikes' },
  { pattern: /\bmosquito nets?\b/u, intentSlug: 'mosquito-nets' },
  { pattern: /\btransparent\b/u, intentSlug: 'transparent-nets' },
  { pattern: /\bstaircase\b/u, intentSlug: 'for-staircase' },
  { pattern: /\bfor societies?\b/u, intentSlug: 'for-society' },
  { pattern: /\bgated community\b/u, intentSlug: 'for-society' },
  { pattern: /\bbest\s+rated\b/u, intentSlug: 'best' },
  { pattern: /\bauthorized\b/u, intentSlug: 'trusted' },
  { pattern: /\bleading\b/u, intentSlug: 'best' },
  { pattern: /\bno\.?\s*1\b/u, intentSlug: 'best' },
  { pattern: /\bclosest\b/u, intentSlug: 'near-me' },
  { pattern: /\bnearby\b/u, intentSlug: 'near-me' },
  { pattern: /\blocal\b/u, intentSlug: 'near-me' },
  { pattern: /\bprice calculator\b/u, intentSlug: 'price' },
  { pattern: /\bprice per sq\.?\s*ft\b/u, intentSlug: 'per-sq-ft' },
  { pattern: /\bmarine grade\b/u, intentSlug: 'ss316' },
  { pattern: /\buv resistant\b/u, intentSlug: 'uv-protected' },
  { pattern: /\bweather resistant\b/u, intentSlug: 'uv-protected' },
  { pattern: /\banti rust\b/u, intentSlug: 'stainless-steel' },
  { pattern: /\brust proof\b/u, intentSlug: 'stainless-steel' },
  { pattern: /\bbook free inspection\b/u, intentSlug: 'free-site-visit' },
  { pattern: /\bfree site inspection\b/u, intentSlug: 'free-site-visit' },
  { pattern: /\bsame day inspection\b/u, intentSlug: 'same-day' },
  { pattern: /\bwhatsapp\b/u, intentSlug: 'booking' },
  { pattern: /\bcall now\b/u, intentSlug: 'booking' },
  { pattern: /\bbook now\b/u, intentSlug: 'booking' },
  { pattern: /\bget quote\b/u, intentSlug: 'quote' },
  { pattern: /\brequest quote\b/u, intentSlug: 'quote' },
  { pattern: /\bfor 3 bhk\b/u, intentSlug: 'for-3bhk' },
  { pattern: /\bfor 2 bhk\b/u, intentSlug: 'for-2bhk' },
  { pattern: /\bfor 1 bhk\b/u, intentSlug: 'for-1bhk' },
  { pattern: /\b3 bhk\b/u, intentSlug: 'for-3bhk' },
  { pattern: /\b2 bhk\b/u, intentSlug: 'for-2bhk' },
  { pattern: /\b1 bhk\b/u, intentSlug: 'for-1bhk' },
  { pattern: /\bss\s*316\b/u, intentSlug: 'ss316' },
  { pattern: /\bss\s*304\b/u, intentSlug: 'ss304' },
  { pattern: /\b316 ss\b/u, intentSlug: 'ss316' },
  { pattern: /\b304 ss\b/u, intentSlug: 'ss304' },
  { pattern: /\bmarine grade\b/u, intentSlug: 'ss316' },
  { pattern: /\bmonsoon ready\b/u, intentSlug: 'monsoon-ready' },
  { pattern: /\bunder construction\b/u, intentSlug: 'under-construction' },
  ...modifiersToRegexPatterns(),
];

/** City name aliases that appear in search phrases. */
const CITY_ALIASES: Readonly<Record<string, string>> = {
  bangalore: 'bengaluru',
  bengalore: 'bengaluru',
  bengaluru: 'bengaluru',
  mysore: 'mysuru',
  mysuru: 'mysuru',
};

/**
 * Area aliases keyed by city slug.
 * Shared locality names without a Mysore/Mysuru qualifier resolve to Bengaluru.
 */
const AREA_ALIASES: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  bengaluru: {
    'rr nagar': 'rajarajeshwari-nagar',
    rrnagar: 'rajarajeshwari-nagar',
    'r r nagar': 'rajarajeshwari-nagar',
    'raja rajeshwari nagar': 'rajarajeshwari-nagar',
    'electronic city phase 1': 'electronic-city-phase-1',
    'e city': 'electronic-city',
    ecity: 'electronic-city',
    'hsr': 'hsr-layout',
    'btm': 'btm-layout',
    'jp nagar bangalore': 'jp-nagar',
    'jp nagar bengaluru': 'jp-nagar',
    'vijayanagar bangalore': 'vijayanagar',
    'vijayanagar bengaluru': 'vijayanagar',
    'hebbal bangalore': 'hebbal',
    'hebbal bengaluru': 'hebbal',
    'kr puram': 'kr-puram',
    'k r puram': 'kr-puram',
    'manyata': 'manyata-tech-park',
  },
  mysuru: {
    'vijayanagar 2nd stage': 'vijayanagar-2nd-stage',
    'vijayanagar 4th stage': 'vijayanagar-4th-stage',
    'vijayanagar second stage': 'vijayanagar-2nd-stage',
    'vijayanagar fourth stage': 'vijayanagar-4th-stage',
    'jp nagar mysore': 'jp-nagar',
    'jp nagar mysuru': 'jp-nagar',
    'vijayanagar mysore': 'vijayanagar',
    'vijayanagar mysuru': 'vijayanagar',
    'hebbal mysore': 'hebbal',
    'hebbal mysuru': 'hebbal',
    'hebbal industrial area': 'hebbal-industrial-area',
    'nr mohalla': 'nr-mohalla',
  },
};

/** Product roots → service slug (checked longest phrase first). */
const PRODUCT_PHRASES: readonly {
  readonly phrase: string;
  readonly serviceSlug: string;
  readonly defaultIntentSlug?: string;
}[] = [
  ...productPhrasesForResolver(),
  { phrase: 'building covering safety net', serviceSlug: 'building-covering-safety-nets' },
  { phrase: 'duct area safety net', serviceSlug: 'duct-area-safety-nets' },
  { phrase: 'child safety invisible grill', serviceSlug: 'invisible-grills' },
  { phrase: 'pet safety invisible grill', serviceSlug: 'invisible-grills' },
  { phrase: 'cricket turf net', serviceSlug: 'sports-nets', defaultIntentSlug: 'cricket-nets' },
  { phrase: 'badminton court net', serviceSlug: 'sports-nets' },
  { phrase: 'tennis court net', serviceSlug: 'sports-nets' },
  { phrase: 'volleyball net', serviceSlug: 'sports-nets' },
  { phrase: 'football net', serviceSlug: 'sports-nets' },
  { phrase: 'staircase safety net', serviceSlug: 'safety-nets' },
  { phrase: 'terrace safety net', serviceSlug: 'safety-nets', defaultIntentSlug: 'for-terrace' },
  { phrase: 'window safety net', serviceSlug: 'safety-nets', defaultIntentSlug: 'for-windows' },
  { phrase: 'balcony safety grill', serviceSlug: 'invisible-grills', defaultIntentSlug: 'for-balcony' },
  { phrase: 'window safety grill', serviceSlug: 'invisible-grills', defaultIntentSlug: 'for-windows' },
  { phrase: 'transparent grill', serviceSlug: 'invisible-grills' },
  { phrase: 'invisible grill for balcony', serviceSlug: 'invisible-grills', defaultIntentSlug: 'for-balcony' },
  { phrase: 'invisible grill for window', serviceSlug: 'invisible-grills', defaultIntentSlug: 'for-windows' },
];

const SORTED_PRODUCT_PHRASES = [...PRODUCT_PHRASES].sort((a, b) => b.phrase.length - a.phrase.length);

export function normalizeKeywordPhrase(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/gu, ' ');
}

interface ParsedLocation {
  readonly productPhrase: string;
  readonly state?: State;
  readonly city?: City;
  readonly locality?: string;
  readonly area?: Area;
}

function cityMatchTails(city: City): readonly string[] {
  const aliases = Object.entries(CITY_ALIASES)
    .filter(([, slug]) => slug === city.slug)
    .map(([alias]) => alias);
  return [...new Set([city.slug, slugify(city.name), ...aliases].filter((tail) => tail.length > 0))].sort(
    (a, b) => b.length - a.length,
  );
}

function resolveAreaInCity(city: City, localityRaw: string): Area | undefined {
  const locality = localityRaw.trim();
  if (!locality) return undefined;

  const cityAliases = AREA_ALIASES[city.slug] ?? {};
  const aliasSlug = cityAliases[locality] ?? cityAliases[slugify(locality).replace(/-/gu, ' ')];
  const candidates = [
    aliasSlug,
    slugify(locality),
    slugify(locality.replace(/\b(?:bangalore|bengaluru|mysore|mysuru)\b/gu, '').trim()),
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    const area = getAreaBySlug(city.id, candidate);
    if (area?.published) return area;
  }
  return undefined;
}

/**
 * Shared locality names (JP Nagar, Hebbal, Vijayanagar) without a Mysore/Mysuru
 * qualifier resolve to Bengaluru; with that qualifier they resolve to Mysuru.
 */
function preferCityForAmbiguousLocality(
  locality: string,
  matchedCity: City,
): City {
  const hasMysoreCue = /\b(?:mysore|mysuru)\b/u.test(locality);
  if (!hasMysoreCue) return matchedCity;

  const mysuru = getCities().find((city) => city.slug === 'mysuru');
  return mysuru ?? matchedCity;
}

/** Strips trailing ` in {locality} {city}` / ` near {city}` for published cities. */
export function parseLocationFromPhrase(normalized: string): ParsedLocation {
  const cities = [...getCities()].sort((a, b) => b.slug.length - a.slug.length);

  for (const city of cities) {
    const state = getStateById(city.stateId);
    if (!state?.published) continue;

    for (const tail of cityMatchTails(city)) {
      const suffix = ` ${tail}`;
      if (!normalized.endsWith(suffix)) continue;

      const beforeCity = normalized.slice(0, normalized.length - suffix.length);

      for (const connector of [' in ', ' near ', ' around '] as const) {
        const connectorIndex = beforeCity.lastIndexOf(connector);
        if (connectorIndex <= 0) continue;

        const productPhrase = beforeCity.slice(0, connectorIndex).trim();
        const locality = beforeCity.slice(connectorIndex + connector.length).trim();
        if (locality.length === 0) {
          return { productPhrase, city, state };
        }

        const resolvedCity = preferCityForAmbiguousLocality(locality, city);
        const resolvedState = getStateById(resolvedCity.stateId) ?? state;
        const area = resolveAreaInCity(resolvedCity, locality);
        return {
          productPhrase,
          city: resolvedCity,
          state: resolvedState,
          locality,
          area,
        };
      }

      // Location-first / bare city: "invisible grills bangalore"
      return {
        productPhrase: beforeCity.trim(),
        city,
        state,
      };
    }
  }

  return { productPhrase: normalized };
}

function detectProduct(normalized: string):
  | { readonly serviceSlug: string; readonly defaultIntentSlug?: string }
  | undefined {
  for (const entry of SORTED_PRODUCT_PHRASES) {
    if (normalized.includes(entry.phrase)) {
      return {
        serviceSlug: entry.serviceSlug,
        defaultIntentSlug: entry.defaultIntentSlug,
      };
    }
  }
  return undefined;
}

function detectIntentSlug(normalized: string): string | undefined {
  for (const { pattern, intentSlug } of MODIFIER_PATTERNS) {
    if (pattern.test(normalized)) return intentSlug;
  }
  return undefined;
}

function buildLocationPath(
  service: Service,
  state: State,
  city: City,
  area: Area | undefined,
  intent: SearchIntent | undefined,
): string {
  if (area) {
    return intent
      ? serviceInAreaIntentPath(service, state, city, area, intent)
      : serviceInAreaPath(service, state, city, area);
  }
  return intent
    ? serviceInCityIntentPath(service, state, city, intent)
    : serviceInCityPath(service, state, city);
}

export function resolveKeywordPhrase(
  raw: string,
  example?: { readonly state: State; readonly city: City },
): KeywordResolution {
  const phrase = normalizeKeywordPhrase(raw);
  const location = parseLocationFromPhrase(phrase);
  const productPhrase = location.productPhrase;

  const product = detectProduct(productPhrase);
  if (!product) {
    return { phrase, coverage: 'unmapped', note: 'No product match', locationTier: 'none' };
  }

  const service = getServiceBySlug(product.serviceSlug);
  if (!service) {
    return { phrase, coverage: 'unmapped', note: 'Service slug missing', locationTier: 'none' };
  }

  const intentSlug = detectIntentSlug(productPhrase) ?? product.defaultIntentSlug;
  const rawIntent = intentSlug ? getSearchIntentBySlug(intentSlug) : undefined;

  const state = location.state ?? example?.state;
  const city = location.city ?? example?.city;
  const area = location.area;
  const locationTier: KeywordResolution['locationTier'] = area
    ? 'area'
    : city && state
      ? 'city'
      : 'none';

  let intent = rawIntent;
  let rollupNote: string | undefined;

  if (rawIntent && !intentAppliesToService(rawIntent, service)) {
    intent = undefined;
    rollupNote = `Intent "${rawIntent.slug}" does not apply to ${service.slug} — rolls up to service-in-location`;
  } else if (rawIntent && area && city && !intentAllowedInArea(rawIntent, city)) {
    // Keep the intent but drop to city depth when the facet is city-only / tier-gated.
    const cityPathOnly = state
      ? buildLocationPath(service, state, city, undefined, rawIntent)
      : undefined;
    return {
      phrase,
      service,
      intent: rawIntent,
      state,
      city,
      locality: location.locality,
      locationTier: 'city',
      examplePath: cityPathOnly,
      coverage: 'full',
      note: `Intent "${rawIntent.slug}" is city-depth only for this market`,
    };
  }

  let examplePath: string | undefined;
  if (state && city) {
    examplePath = buildLocationPath(service, state, city, area, intent);
  }

  if (intentSlug && !intent) {
    return {
      phrase,
      service,
      state,
      city,
      area,
      locality: location.locality,
      locationTier,
      examplePath: state && city ? buildLocationPath(service, state, city, area, undefined) : undefined,
      coverage: 'alias-only',
      note:
        rollupNote ??
        `Intent "${intentSlug}" not published — rolls up to service-in-location`,
    };
  }

  return {
    phrase,
    service,
    intent,
    state,
    city,
    area,
    locality: location.locality,
    locationTier,
    examplePath,
    coverage: intent ? 'full' : 'alias-only',
    ...(intent ? {} : { note: 'Base service keyword (no modifier intent)' }),
  };
}

/** Distinct intent slugs referenced by the modifier table that are not yet published. */
export function listMissingIntentSlugs(): readonly string[] {
  const published = new Set(getSearchIntents().map((entry) => entry.slug));
  const needed = new Set(MODIFIER_PATTERNS.map((entry) => entry.intentSlug));
  return [...needed].filter((slug) => !published.has(slug)).sort();
}
