/**
 * Builds a full Service × Location keyword/SEO package from the 11-tier catalog.
 *
 * One package per service×place — keywords cluster into buckets; synonyms share
 * one suggested URL so we never mint duplicate thin pages.
 */
import { business, primaryPhone } from '@/config/business';
import {
  KEYWORD_TEMPLATES,
  KEYWORD_TIER_LABELS,
  type KeywordBucket,
  type KeywordTemplate,
} from '@/config/keyword-tiers';
import { SERVICE_KEYWORD_ROOTS } from '@/config/keyword-modifiers';
import { SERVICE_TAXONOMY } from '@/config/service-taxonomy';
import { SEO_LIMITS } from '@/config/constants';
import {
  getAdjacentAreas,
  getAreasByCity,
  getCitiesByState,
  getDistrictById,
  getNeighbouringCities,
  getSearchIntentBySlug,
  getServiceBySlug,
  getServices,
  getStateById,
} from '@/lib/data/repository';
import type { Area, City, District, Service, State } from '@/lib/data/schemas';
import {
  intentAppliesToService,
} from '@/lib/routing/facets';
import {
  absoluteUrl,
  areaPath,
  cityPath,
  districtPath,
  serviceInAreaIntentPath,
  serviceInAreaPath,
  serviceInCityIntentPath,
  serviceInCityPath,
  serviceInDistrictPath,
  servicePath,
  statePath,
} from '@/lib/routing/url';
import { truncateAtWord, unique } from '@/lib/utils/text';

export interface KeywordLocationContext {
  readonly state: State;
  readonly district?: District;
  readonly city?: City;
  readonly area?: Area;
}

export interface KeywordPhraseRow {
  readonly phrase: string;
  readonly tier: number;
  readonly tierLabel: string;
  readonly bucket: KeywordBucket;
  readonly intentSlug?: string;
  readonly buyingIntent: number;
  readonly commercialIntent: number;
  readonly localIntent: number;
  readonly suggestedUrl: string;
}

export interface KeywordSeoPackage {
  readonly serviceSlug: string;
  readonly serviceName: string;
  readonly locationLabel: string;
  readonly locationDepth: 'state' | 'district' | 'city' | 'area';
  readonly primaryKeyword: string;
  readonly secondaryKeywords: readonly string[];
  readonly commercialKeywords: readonly string[];
  readonly transactionalKeywords: readonly string[];
  readonly localKeywords: readonly string[];
  readonly nearMeKeywords: readonly string[];
  readonly priceKeywords: readonly string[];
  readonly installationKeywords: readonly string[];
  readonly propertyKeywords: readonly string[];
  readonly problemSolvingKeywords: readonly string[];
  readonly questionKeywords: readonly string[];
  readonly lsiKeywords: readonly string[];
  readonly semanticKeywords: readonly string[];
  readonly longTailKeywords: readonly string[];
  readonly relatedSearches: readonly string[];
  readonly googleAutosuggestVariations: readonly string[];
  readonly peopleAlsoSearchFor: readonly string[];
  readonly buyingIntentScore: number;
  readonly commercialIntentScore: number;
  readonly localIntentScore: number;
  readonly suggestedUrl: string;
  readonly seoTitle: string;
  readonly h1: string;
  readonly metaDescription: string;
  readonly breadcrumb: readonly string[];
  readonly canonicalUrl: string;
  readonly internalLinkSuggestions: readonly string[];
  readonly nearbyAreaSuggestions: readonly string[];
  readonly nearbyCitySuggestions: readonly string[];
  readonly relatedServices: readonly string[];
  readonly faqTopics: readonly string[];
  readonly phrases: readonly KeywordPhraseRow[];
}

function fillPattern(
  pattern: string,
  serviceName: string,
  location: KeywordLocationContext,
): string | undefined {
  const areaName = location.area?.name;
  const cityName = location.city?.name;
  const districtName = location.district?.name;
  const stateName = location.state.name;

  let out = pattern.replaceAll('{Service}', serviceName);

  const needsArea = /\{Area\}|\{Locality\}|\{Colony\}|\{Ward\}|\{Village\}|\{Town\}/u.test(pattern);
  const needsCity = /\{City\}/u.test(pattern);
  const needsDistrict = /\{District\}/u.test(pattern);
  const needsState = /\{State\}/u.test(pattern);

  if (needsArea && !areaName) return undefined;
  if (needsCity && !cityName && !areaName) return undefined;
  if (needsDistrict && !districtName) return undefined;

  if (areaName) {
    out = out
      .replaceAll('{Area}', areaName)
      .replaceAll('{Locality}', areaName)
      .replaceAll('{Colony}', areaName)
      .replaceAll('{Ward}', areaName)
      .replaceAll('{Village}', areaName)
      .replaceAll('{Town}', areaName);
  }
  if (cityName) out = out.replaceAll('{City}', cityName);
  else if (areaName && needsCity) out = out.replaceAll('{City}', location.city?.name ?? areaName);

  if (districtName) out = out.replaceAll('{District}', districtName);
  if (needsState) out = out.replaceAll('{State}', stateName);

  // Drop unresolved tokens.
  if (/\{[A-Za-z]+\}/u.test(out)) return undefined;
  return out.replace(/\s+/gu, ' ').trim();
}

function locationLabel(location: KeywordLocationContext): string {
  if (location.area && location.city) return `${location.area.name}, ${location.city.name}`;
  if (location.city) return location.city.name;
  if (location.district) return `${location.district.name} District`;
  return location.state.name;
}

function locationDepth(
  location: KeywordLocationContext,
): KeywordSeoPackage['locationDepth'] {
  if (location.area) return 'area';
  if (location.city) return 'city';
  if (location.district) return 'district';
  return 'state';
}

function suggestedUrlFor(
  service: Service,
  location: KeywordLocationContext,
  intentSlug?: string,
): string {
  const intent = intentSlug ? getSearchIntentBySlug(intentSlug) : undefined;
  const { state, city, area, district } = location;

  if (area && city) {
    return intent
      ? serviceInAreaIntentPath(service, state, city, area, intent)
      : serviceInAreaPath(service, state, city, area);
  }
  if (city) {
    return intent
      ? serviceInCityIntentPath(service, state, city, intent)
      : serviceInCityPath(service, state, city);
  }
  if (district) {
    return serviceInDistrictPath(service, state, district);
  }
  return servicePath(service);
}

function avg(scores: readonly number[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
}

function bucketPhrases(
  rows: readonly KeywordPhraseRow[],
  bucket: KeywordBucket,
): readonly string[] {
  return unique(rows.filter((row) => row.bucket === bucket).map((row) => row.phrase));
}

function buildQuestions(serviceName: string, place: string): string[] {
  return [
    `How much does ${serviceName} cost in ${place}?`,
    `Who installs ${serviceName} near me in ${place}?`,
    `What is the best ${serviceName} company in ${place}?`,
    `How long does ${serviceName} installation take in ${place}?`,
    `Do you provide free site inspection for ${serviceName} in ${place}?`,
    `Is ${serviceName} safe for children and pets in ${place}?`,
    `What materials are used for ${serviceName} in ${place}?`,
    `Can I get same day ${serviceName} installation in ${place}?`,
  ];
}

function buildLsi(service: Service): readonly string[] {
  return unique([
    ...service.searchTerms.slice(0, 8),
    'balcony safety',
    'window protection',
    'fall protection',
    'stainless steel cable',
    'UV stabilised net',
    'site survey',
    'written quotation',
    'society approval',
  ]);
}

function buildSemantic(serviceName: string, place: string): string[] {
  return [
    `${serviceName} experts in ${place}`,
    `${serviceName} service provider ${place}`,
    `${serviceName} home visit ${place}`,
    `doorstep ${serviceName} ${place}`,
    `${serviceName} after sales support ${place}`,
    `custom size ${serviceName} ${place}`,
  ];
}

function buildFaqTopics(serviceName: string, place: string): string[] {
  return [
    `${serviceName} price factors in ${place}`,
    `Installation time for ${serviceName}`,
    `Maintenance of ${serviceName}`,
    `Warranty and handover checklist`,
    `Society / association permissions in ${place}`,
    `Child and pet safety spacing`,
    `SS304 vs SS316 for coastal vs inland`,
    `How to book a free survey`,
  ];
}

function primaryTemplate(location: KeywordLocationContext): KeywordTemplate {
  if (location.area) {
    return KEYWORD_TEMPLATES.find((row) => row.pattern === 'Best {Service} in {Area}')!;
  }
  if (location.city) {
    return KEYWORD_TEMPLATES.find((row) => row.pattern === '{Service} Installation in {City}')!;
  }
  return KEYWORD_TEMPLATES.find((row) => row.pattern === '{Service} Near Me')!;
}

export function buildKeywordPackage(
  service: Service,
  location: KeywordLocationContext,
): KeywordSeoPackage {
  const place = locationLabel(location);
  const depth = locationDepth(location);
  const serviceName = service.name;
  const seen = new Set<string>();
  const phrases: KeywordPhraseRow[] = [];

  for (const template of KEYWORD_TEMPLATES) {
    const phrase = fillPattern(template.pattern, serviceName, location);
    if (!phrase) continue;
    const key = phrase.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    let intentSlug = template.intentSlug;
    if (intentSlug) {
      const intent = getSearchIntentBySlug(intentSlug);
      if (intent && !intentAppliesToService(intent, service)) {
        intentSlug = undefined;
      }
    }

    phrases.push({
      phrase,
      tier: template.tier,
      tierLabel: KEYWORD_TIER_LABELS[template.tier],
      bucket: template.bucket,
      ...(intentSlug ? { intentSlug } : {}),
      buyingIntent: template.buyingIntent,
      commercialIntent: template.commercialIntent,
      localIntent: template.localIntent,
      suggestedUrl: suggestedUrlFor(service, location, intentSlug),
    });
  }

  // Rank for primary: highest buying × commercial × local product.
  const ranked = [...phrases].sort((a, b) => {
    const scoreA = a.buyingIntent * 100 + a.commercialIntent * 10 + a.localIntent;
    const scoreB = b.buyingIntent * 100 + b.commercialIntent * 10 + b.localIntent;
    return scoreB - scoreA;
  });

  const primarySeed = primaryTemplate(location);
  const primaryFilled =
    fillPattern(primarySeed.pattern, serviceName, location) ??
    ranked[0]?.phrase ??
    `${serviceName} in ${place}`;

  const primaryRow =
    phrases.find((row) => row.phrase === primaryFilled) ??
    ranked[0] ??
    {
      phrase: primaryFilled,
      tier: 2,
      tierLabel: KEYWORD_TIER_LABELS[2],
      bucket: 'local' as const,
      buyingIntent: 9,
      commercialIntent: 8,
      localIntent: 10,
      suggestedUrl: suggestedUrlFor(service, location, primarySeed.intentSlug),
    };

  const canonicalPath = primaryRow.suggestedUrl;
  const seoTitle = truncateAtWord(
    `${primaryFilled} | Call ${primaryPhone.display} | ${business.shortName}`,
    SEO_LIMITS.titleMax,
  );
  const h1 = primaryFilled;
  const metaDescription = truncateAtWord(
    `Looking for ${primaryFilled.toLowerCase()}? ${business.shortName} provides survey-led ${serviceName.toLowerCase()} with written quotes, Call/WhatsApp booking, and installation across ${place}. Free site inspection available.`,
    SEO_LIMITS.descriptionMax,
  );

  const crumbs = ['Home', 'Services', service.name];
  if (location.state) crumbs.push(location.state.name);
  if (location.district) crumbs.push(`${location.district.name} District`);
  if (location.city) crumbs.push(location.city.name);
  if (location.area) crumbs.push(location.area.name);

  const nearbyAreas =
    location.city && location.area
      ? getAdjacentAreas(location.area).slice(0, 12).map((area) => area.name)
      : location.city
        ? getAreasByCity(location.city.id)
            .slice(0, 16)
            .map((area) => area.name)
        : [];

  const nearbyCities = location.city
    ? getNeighbouringCities(location.city).slice(0, 10).map((city) => city.name)
    : getCitiesByState(location.state.id)
        .filter((city) => city.tier <= 2)
        .slice(0, 10)
        .map((city) => city.name);

  const family = SERVICE_TAXONOMY.find((entry) => entry.serviceSlug === service.slug);
  const relatedServices = unique([
    ...getServices()
      .filter((entry) => entry.id !== service.id)
      .slice(0, 6)
      .map((entry) => entry.name),
    ...(family?.children.slice(0, 4).map((child) => child.label) ?? []),
  ]);

  const internalLinks = unique([
    canonicalPath,
    servicePath(service),
    location.city ? cityPath(location.state, location.city) : statePath(location.state),
    location.area && location.city
      ? areaPath(location.state, location.city, location.area)
      : undefined,
    location.district
      ? districtPath(location.state, location.district)
      : undefined,
    ...getServices()
      .filter((entry) => entry.id !== service.id)
      .slice(0, 5)
      .map((entry) => suggestedUrlFor(entry, location)),
  ].filter((value): value is string => Boolean(value)));

  const autosuggest = unique([
    `${serviceName.toLowerCase()} near me`,
    `best ${serviceName.toLowerCase()} in ${place.toLowerCase()}`,
    `${serviceName.toLowerCase()} price`,
    `${serviceName.toLowerCase()} installation cost`,
    `${serviceName.toLowerCase()} dealers near me`,
    `book ${serviceName.toLowerCase()} inspection`,
  ]);

  const peopleAlso = unique([
    ...bucketPhrases(phrases, 'price').slice(0, 4),
    ...bucketPhrases(phrases, 'installation').slice(0, 4),
    ...bucketPhrases(phrases, 'nearMe').slice(0, 4),
  ]);

  return {
    serviceSlug: service.slug,
    serviceName,
    locationLabel: place,
    locationDepth: depth,
    primaryKeyword: primaryFilled,
    secondaryKeywords: ranked
      .filter((row) => row.phrase !== primaryFilled)
      .slice(0, 11)
      .map((row) => row.phrase),
    commercialKeywords: bucketPhrases(phrases, 'commercial'),
    transactionalKeywords: bucketPhrases(phrases, 'transactional'),
    localKeywords: bucketPhrases(phrases, 'local'),
    nearMeKeywords: bucketPhrases(phrases, 'nearMe'),
    priceKeywords: bucketPhrases(phrases, 'price'),
    installationKeywords: bucketPhrases(phrases, 'installation'),
    propertyKeywords: bucketPhrases(phrases, 'property'),
    problemSolvingKeywords: bucketPhrases(phrases, 'problemSolving'),
    questionKeywords: buildQuestions(serviceName, place),
    lsiKeywords: buildLsi(service),
    semanticKeywords: buildSemantic(serviceName, place),
    longTailKeywords: bucketPhrases(phrases, 'longTail'),
    relatedSearches: peopleAlso.slice(0, 12),
    googleAutosuggestVariations: autosuggest,
    peopleAlsoSearchFor: peopleAlso,
    buyingIntentScore: avg(phrases.map((row) => row.buyingIntent)),
    commercialIntentScore: avg(phrases.map((row) => row.commercialIntent)),
    localIntentScore: avg(phrases.map((row) => row.localIntent)),
    suggestedUrl: canonicalPath,
    seoTitle,
    h1,
    metaDescription,
    breadcrumb: crumbs,
    canonicalUrl: absoluteUrl(canonicalPath),
    internalLinkSuggestions: internalLinks,
    nearbyAreaSuggestions: nearbyAreas,
    nearbyCitySuggestions: nearbyCities,
    relatedServices,
    faqTopics: buildFaqTopics(serviceName, place),
    phrases,
  };
}

/** Expand packages for selected services × locations. */
export function buildKeywordPackagesForCity(
  city: City,
  options?: { readonly includeAreas?: boolean; readonly serviceSlugs?: readonly string[] },
): readonly KeywordSeoPackage[] {
  const state = getStateById(city.stateId);
  if (!state) return [];
  const district = city.districtId ? getDistrictById(city.districtId) : undefined;
  const services = options?.serviceSlugs?.length
    ? options.serviceSlugs
        .map((slug) => getServiceBySlug(slug))
        .filter((service): service is Service => Boolean(service))
    : getServices();

  const packages: KeywordSeoPackage[] = [];
  for (const service of services) {
    packages.push(
      buildKeywordPackage(service, {
        state,
        ...(district ? { district } : {}),
        city,
      }),
    );
    if (options?.includeAreas) {
      for (const area of getAreasByCity(city.id)) {
        packages.push(
          buildKeywordPackage(service, {
            state,
            ...(district ? { district } : {}),
            city,
            area,
          }),
        );
      }
    }
  }
  return packages;
}

export function listKeywordServiceLabels(): readonly string[] {
  return SERVICE_KEYWORD_ROOTS.map((root) => root.label);
}
