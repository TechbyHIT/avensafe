import { business, primaryPhone } from '@/config/business';
import { SEO_LIMITS } from '@/config/constants';
import { taxonomyLabelFor } from '@/config/service-taxonomy';
import { locationLabel, shortLocationLabel } from '@/lib/routing/resolve';
import { areaH1Variant, cityH1Variant } from '@/lib/content/local-depth';
import { joinWithAnd, lowerFirst, truncateAtWord, unique } from '@/lib/utils/text';
import type { Service } from '@/lib/data/schemas';
import type { PageTarget } from '@/types/routing';

/**
 * Generates the title, H1, meta description and opening paragraph for every
 * generated page.
 *
 * Uniqueness here is structural rather than accidental: each string is composed
 * from facts that differ per page (the service, the place, and the
 * environmental angle that place actually has), so no two URLs can produce the
 * same title without the underlying data being duplicated.
 */

export interface PageCopy {
  /** Full <title>, already including any brand suffix. */
  readonly title: string;
  readonly h1: string;
  readonly description: string;
  /** Opening paragraph rendered under the H1. */
  readonly lede: string;
  /**
   * Keyword phrases for internal reports only — never rendered as a
   * `<meta name="keywords">` tag (search engines ignore it).
   */
  readonly keywords?: readonly string[];
}

const BRAND_SUFFIX = ` | ${business.shortName}`;

/**
 * Builds a title from a required base plus optional refinements, adding each
 * only while the whole string still fits a search result.
 */
function composeTitle(base: string, optional: readonly string[]): string {
  let title = base;
  for (const part of optional) {
    const candidate = `${title} — ${part}`;
    if (candidate.length + BRAND_SUFFIX.length <= SEO_LIMITS.titleMax) title = candidate;
  }
  const withBrand =
    title.length + BRAND_SUFFIX.length <= SEO_LIMITS.titleMax
      ? `${title}${BRAND_SUFFIX}`
      : title;
  return withBrand.length <= SEO_LIMITS.titleMax
    ? withBrand
    : truncateAtWord(withBrand, SEO_LIMITS.titleMax);
}

function fitDescription(text: string): string {
  return truncateAtWord(text, SEO_LIMITS.descriptionMax);
}

/**
 * The short environmental angle for a page, taken from the service's own
 * trait-keyed phrases. This is what keeps a coastal city's title different from
 * an inland one for the same service.
 */
function angleFor(target: PageTarget): string | undefined {
  const { service, traits } = target;
  if (!service) return undefined;
  for (const trait of traits) {
    const angle = service.locationAngles[trait];
    if (angle) return angle;
  }
  return service.locationAngles.default;
}

export function buildPageCopy(target: PageTarget): PageCopy {
  switch (target.kind) {
    case 'service':
      return serviceCopy(target);
    case 'serviceIntent':
      return serviceIntentCopy(target);
    case 'serviceInCity':
    case 'serviceInArea':
    case 'serviceInDistrict':
      return serviceLocationCopy(target);
    case 'serviceInCityIntent':
    case 'serviceInAreaIntent':
      return serviceLocationIntentCopy(target);
    case 'state':
      return stateCopy(target);
    case 'city':
      return cityCopy(target);
    case 'district':
      return districtCopy(target);
    case 'area':
      return areaCopy(target);
    default:
      return fallbackCopy();
  }
}

function serviceCopy(target: PageTarget): PageCopy {
  const service = target.service;
  if (!service) return fallbackCopy();

  return {
    title: composeTitle(`${service.name} Installation`, [service.locationAngles.default]),
    h1: `${service.name} installation across South and West India`,
    description: fitDescription(
      `${service.summary} Surveyed, specified and installed by ${business.name}.`,
    ),
    lede: service.intro,
  };
}

/** Unique national hub for one taxonomy subsection (service × intent). */
function serviceIntentCopy(target: PageTarget): PageCopy {
  const { service, intent } = target;
  if (!service || !intent) return fallbackCopy();

  const taxonomyLabel = taxonomyLabelFor(service.slug, intent.slug) ?? intent.label;
  const title = composeTitle(taxonomyLabel, ['South & West India', service.shortName]);

  return {
    title,
    h1: truncateAtWord(`${taxonomyLabel} across South and West India`, SEO_LIMITS.h1Max),
    description: fitDescription(
      `${taxonomyLabel}: ${intent.lede} Available across every state we cover — pick a city for a surveyed quotation. Call ${primaryPhone.display}.`,
    ),
    lede: `${intent.lede} ${service.summary} Use the state and city links below for local pages; each city URL keeps its own specification notes so content is not copied from one metro template.`,
    keywords: [
      taxonomyLabel,
      `${intent.titlePhrase} ${service.shortName}`,
      `${service.name} ${intent.label}`,
    ],
  };
}

/**
 * Builds a title that always keeps the full place string (needed when locality
 * names collide across cities) and trims the lead phrase instead.
 */
function titleWithPlace(lead: string, place: string, modifiers: readonly string[] = []): string {
  const brand = business.shortName;
  for (const modifier of modifiers) {
    const candidate = `${lead} in ${place} | ${modifier} | ${brand}`;
    if (candidate.length <= SEO_LIMITS.titleMax) return candidate;
  }
  const withPlace = `${lead} in ${place} | ${brand}`;
  if (withPlace.length <= SEO_LIMITS.titleMax) return withPlace;

  const suffix = ` in ${place} | ${brand}`;
  const maxLead = Math.max(8, SEO_LIMITS.titleMax - suffix.length);
  return `${truncateAtWord(lead, maxLead)}${suffix}`;
}

/** Compact unique service identity for titles that cannot fit the short name. */
function serviceTitleCode(serviceSlug: string): string {
  const known: Readonly<Record<string, string>> = {
    'invisible-grills': 'ig',
    'safety-nets': 'snet',
    'sports-nets': 'spnet',
    'cloth-hangers': 'ch',
    'duct-area-safety-nets': 'duct',
    'building-covering-safety-nets': 'bcsn',
  };
  return known[serviceSlug] ?? serviceSlug.replace(/-/gu, '').slice(0, 5);
}

/**
 * Intent titles reserve intent slug + city. Area identity is kept via name or
 * slug so city-level and locality pages never share a title. The final fallback
 * always includes a service code so two services cannot collide.
 */
function titleWithPlaceAndIntent(
  serviceLead: string,
  serviceSlug: string,
  intentSlug: string,
  areaOrPlace: string,
  cityName?: string,
  areaSlug?: string,
): string {
  const brand = business.shortName;
  const intentToken = intentSlug.replace(/-/gu, ' ');
  const city = cityName?.trim() ?? '';
  const svcCode = serviceTitleCode(serviceSlug);
  const leadOptions = unique([
    serviceLead,
    serviceLead.split(/\s+/u).slice(0, 2).join(' '),
    serviceLead.split(/\s+/u)[0] ?? svcCode,
    svcCode,
  ]);
  const areaOptions = unique(
    [areaOrPlace, areaSlug?.replace(/-/gu, ' '), areaSlug].filter(
      (value): value is string => Boolean(value && value.length > 0),
    ),
  );

  const build = (lead: string, areaBit: string): string =>
    city
      ? `${lead} in ${areaBit} | ${intentToken} | ${city} | ${brand}`
      : `${lead} in ${areaBit} | ${intentToken} | ${brand}`;

  for (const lead of leadOptions) {
    for (const areaBit of areaOptions) {
      const candidate = build(lead, areaBit);
      if (candidate.length <= SEO_LIMITS.titleMax) return candidate;
    }
  }

  const compactArea = areaSlug ?? areaOrPlace;
  for (const lead of leadOptions) {
    const candidate = city
      ? `${lead} | ${intentToken} | ${compactArea} | ${city} | ${brand}`
      : `${lead} | ${intentToken} | ${compactArea} | ${brand}`;
    if (candidate.length <= SEO_LIMITS.titleMax) return candidate;
  }

  // Guaranteed-unique compact form: service code is never dropped.
  const uniqueFallback = city
    ? `${svcCode} ${intentSlug} | ${compactArea} | ${city} | ${brand}`
    : `${svcCode} ${intentSlug} | ${compactArea} | ${brand}`;
  return uniqueFallback.length <= SEO_LIMITS.titleMax
    ? uniqueFallback
    : truncateAtWord(uniqueFallback, SEO_LIMITS.titleMax);
}

/** Landing-page title: try conversion modifiers, then keep place + brand. */
function landingServiceTitle(serviceName: string, place: string): string {
  // Avoid "Free Site Visit" here — that phrase is reserved for the free-site-visit
  // intent URL so titles stay unique under case-insensitive comparison.
  return titleWithPlace(serviceName, place, ['Same Day Installation', 'Call for Survey']);
}

function localHeroFact(target: PageTarget): string {
  const { location, traits, service } = target;
  if (!location || !service) return '';

  const landmark = location.area?.landmarks[0] ?? location.city?.landmarks[0];
  if (landmark) {
    return `Jobs near ${landmark} follow the same measured specification as the rest of ${shortLocationLabel(location)}.`;
  }

  const angle = angleFor(target);
  if (angle) return `${angle}.`;

  if (traits.length > 0) {
    return `Local ${traits[0]} conditions shape grade, spacing, and access on every quotation.`;
  }

  return `Building stock and access rules in ${shortLocationLabel(location)} decide the fixings we bring.`;
}

function serviceLocationMetaDescription(service: Service, fullPlace: string): string {
  const base = `${service.name} in ${fullPlace}: measured fit, written quote, and local installation. Send a photo for estimate or call ${primaryPhone.display}.`;
  const fallback = `Professional ${lowerFirst(service.name)} installation in ${fullPlace}. Free site inspection and surveyed pricing. Call ${primaryPhone.display}.`;
  return fitDescription(base.length <= SEO_LIMITS.descriptionMax ? base : fallback);
}

function serviceLocationCopy(target: PageTarget): PageCopy {
  const { service, location } = target;
  if (!service || !location) return fallbackCopy();

  const place = shortLocationLabel(location);
  const fullPlace = locationLabel(location);
  const district = location.district;

  let titlePlace: string;
  let h1: string;

  const societyKinds = new Set(['society', 'apartment', 'gated-community', 'township']);

  if (target.kind === 'serviceInDistrict' && district) {
    // Always say "District" so titles never collide with same-named city pages.
    titlePlace = `${district.name} District`;
    h1 = truncateAtWord(`Best ${service.name} in ${titlePlace}`, SEO_LIMITS.h1Max);
  } else if (target.kind === 'serviceInArea' && location.area && location.city) {
    titlePlace = district
      ? `${location.area.name}, ${location.city.name}, ${district.name}`
      : `${location.area.name}, ${location.city.name}`;
    const kind = location.area.locationKind;
    h1 = truncateAtWord(
      kind && societyKinds.has(kind)
        ? `${service.name} in ${location.area.name}, ${location.city.name}`
        : `Best ${service.name} in ${location.area.name}, ${location.city.name}`,
      SEO_LIMITS.h1Max,
    );
  } else if (target.kind === 'serviceInCity' && location.city) {
    titlePlace = location.city.name;
    // Match head-term search: "{Service} Installation in {City}"
    h1 = truncateAtWord(
      `${service.name} Installation in ${location.city.name}`,
      SEO_LIMITS.h1Max,
    );
  } else {
    titlePlace =
      location.area && location.city
        ? district
          ? `${location.area.name}, ${location.city.name}, ${district.name}`
          : `${location.area.name}, ${location.city.name}`
        : place;
    h1 = truncateAtWord(`Professional ${service.name} in ${titlePlace}`, SEO_LIMITS.h1Max);
  }

  const serviceLower = lowerFirst(service.name);

  const metaPlace =
    target.kind === 'serviceInDistrict' && district
      ? `${district.name} District, ${location.state.name}`
      : fullPlace;

  return {
    title: landingServiceTitle(service.name, titlePlace),
    h1,
    description: serviceLocationMetaDescription(service, metaPlace),
    lede: `Premium installation for apartments, villas, homes, offices, and commercial buildings throughout ${metaPlace}. ${localHeroFact(target)}`,
    keywords: [
      `${serviceLower} in ${place}`,
      `best ${serviceLower} in ${titlePlace}`,
      `${serviceLower} installation ${place}`,
      `${serviceLower} near me`,
      `free site visit ${titlePlace}`,
    ],
  };
}

function serviceLocationIntentCopy(target: PageTarget): PageCopy {
  const { service, location, intent } = target;
  if (!service || !location || !intent) return fallbackCopy();

  const place = shortLocationLabel(location);
  const fullPlace = locationLabel(location);
  const areaOrPlace = location.area?.name ?? place;
  const cityName = location.area ? location.city?.name : undefined;
  const areaSlug = location.area?.slug;

  const descriptionLead = `${intent.label} — ${lowerFirst(service.shortName)} in ${fullPlace}. ${intent.lede}`;

  return {
    title: titleWithPlaceAndIntent(
      service.shortName,
      service.slug,
      intent.slug,
      areaOrPlace,
      cityName,
      areaSlug,
    ),
    h1: truncateAtWord(`${service.name} ${intent.h1Phrase} in ${fullPlace}`, SEO_LIMITS.h1Max),
    description: fitDescription(descriptionLead),
    lede: `${intent.lede} In ${fullPlace}, ${service.problemSolved}`,
  };
}

function stateCopy(target: PageTarget): PageCopy {
  const state = target.location?.state;
  if (!state) return fallbackCopy();

  return {
    title: composeTitle(`Safety Nets & Invisible Grills in ${state.name}`, []),
    h1: `Invisible grills, safety nets and cloth hangers across ${state.name}`,
    description: fitDescription(
      `Professional installation across ${state.name}, specified for local building types and climate. Invisible grills, safety nets, sports nets and cloth hangers.`,
    ),
    lede: state.intro,
  };
}

function cityCopy(target: PageTarget): PageCopy {
  const location = target.location;
  const city = location?.city;
  if (!location || !city) return fallbackCopy();

  return {
    title: composeTitle(`Safety Nets & Invisible Grills in ${city.name}`, []),
    h1: cityH1Variant(city, location.state),
    description: fitDescription(
      `Installation across ${city.name}, ${location.state.name}. ${city.localConsiderations}`,
    ),
    lede: city.intro,
  };
}

function districtCopy(target: PageTarget): PageCopy {
  const location = target.location;
  const district = location?.district;
  if (!location || !district) return fallbackCopy();

  const districtLabel = `${district.name} District`;

  return {
    title: composeTitle(`Safety Nets & Invisible Grills in ${districtLabel}`, [
      location.state.name,
    ]),
    h1: truncateAtWord(
      `Invisible grills and safety nets across ${districtLabel}`,
      SEO_LIMITS.h1Max,
    ),
    description: fitDescription(
      `District-wide installation across ${districtLabel}, ${location.state.name}. ${district.localConsiderations}`,
    ),
    lede: district.intro,
  };
}

function areaCopy(target: PageTarget): PageCopy {
  const location = target.location;
  const area = location?.area;
  const city = location?.city;
  if (!location || !area || !city) return fallbackCopy();

  const disambiguated = `${area.name}, ${city.name}`;

  return {
    // Avoid "Balcony…" leads — they collide with the Balcony Nets service titles
    // once both are truncated under the title length limit.
    title: titleWithPlace('Area safety install', disambiguated),
    h1: truncateAtWord(areaH1Variant(area, city), SEO_LIMITS.h1Max),
    description: fitDescription(
      `Installation in ${area.name}, ${city.name}. ${area.notes}`,
    ),
    lede: `${area.notes} Below is what that means in practice for each of the services we install in ${area.name}.`,
  };
}

function fallbackCopy(): PageCopy {
  return {
    title: composeTitle(business.name, [business.shortDescription]),
    h1: business.name,
    description: fitDescription(business.shortDescription),
    lede: business.shortDescription,
  };
}

/** Comma-joined service names, used in hub descriptions and lede copy. */
export function serviceNameList(names: readonly string[]): string {
  return joinWithAnd(names);
}
