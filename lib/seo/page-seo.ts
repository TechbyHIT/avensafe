import type { PageKind } from '@/config/routes';
import { business } from '@/config/business';
import { buildPageCopy } from '@/lib/seo/copy';
import { absoluteUrl } from '@/lib/routing/url';
import type { Crumb, PageTarget } from '@/types/routing';

/**
 * Typed SEO record for one resolved page.
 *
 * Titles, descriptions, and canonicals still come from `buildPageCopy` and
 * `buildMetadata`. This record is the keyword and intent map those engines
 * already imply, so a URL has one primary query and does not compete with a
 * more specific child URL for the same string.
 *
 * `keywords` here are never written to a meta keywords tag.
 */

export type SearchIntentClass = 'commercial' | 'local' | 'informational' | 'navigational';

export interface PageSeo {
  readonly slug: string;
  readonly pageType: PageKind;
  readonly title: string;
  readonly description: string;
  readonly primaryKeyword: string;
  readonly secondaryKeywords: readonly string[];
  readonly searchIntent: SearchIntentClass;
  readonly h1: string;
  readonly canonicalUrl: string;
  readonly indexable: boolean;
  readonly robots: 'index, follow' | 'noindex, follow';
  readonly ogImagePath?: string;
  readonly lastModified?: string;
  readonly breadcrumbs?: readonly Crumb[];
  readonly schemaType: 'WebPage' | 'Service' | 'Article' | 'BlogPosting';
}

const LOCAL_KINDS = new Set<PageKind>(['state', 'district', 'city', 'area', 'serviceAreasHub']);

const COMMERCIAL_KINDS = new Set<PageKind>([
  'service',
  'serviceIntent',
  'serviceInDistrict',
  'serviceInCity',
  'serviceInArea',
  'serviceInCityIntent',
  'serviceInAreaIntent',
]);

const ARTICLE_KINDS = new Set<PageKind>(['guide', 'guideHub']);

function joinParts(parts: readonly (string | undefined)[]): string {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(' ');
}

/** One primary query per URL. More specific pages add place and intent. */
export function primaryKeywordFor(target: PageTarget): string {
  const service = target.service?.name;
  const intent = target.intent?.titlePhrase;
  const area = target.location?.area?.name;
  const city = target.location?.city?.name;
  const district = target.location?.district?.name;
  const state = target.location?.state?.name;

  switch (target.kind) {
    case 'serviceInAreaIntent':
      return joinParts([service, intent, 'in', area && city ? `${area}, ${city}` : area]);
    case 'serviceInCityIntent':
      return joinParts([service, intent, 'in', city]);
    case 'serviceInArea':
      return joinParts([service, 'in', area && city ? `${area}, ${city}` : area]);
    case 'serviceInCity':
      return joinParts([service, 'in', city]);
    case 'serviceInDistrict':
      return joinParts([service, 'in', district, 'district']);
    case 'serviceIntent':
      return joinParts([service, intent]);
    case 'service':
      return joinParts([service, 'installation']);
    case 'area':
      return joinParts([
        'invisible grills and safety nets in',
        area && city ? `${area}, ${city}` : area,
      ]);
    case 'city':
      return joinParts(['invisible grills and safety nets in', city]);
    case 'district':
      return joinParts(['invisible grills and safety nets in', district, 'district']);
    case 'state':
    case 'serviceAreasHub':
      return joinParts(['invisible grills and safety nets in', state ?? 'Andhra Pradesh']);
    case 'blogPost':
    case 'guide':
      return target.path.split('/').filter(Boolean).at(-1)?.replace(/-/g, ' ') ?? target.kind;
    default:
      return target.kind.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
  }
}

function searchIntentFor(target: PageTarget): SearchIntentClass {
  if (target.intent) {
    if (target.intent.dimension === 'pricing' || target.intent.dimension === 'commercial') {
      return 'commercial';
    }
    return 'informational';
  }
  if (COMMERCIAL_KINDS.has(target.kind)) return 'commercial';
  if (LOCAL_KINDS.has(target.kind)) return 'local';
  if (target.kind === 'home' || target.kind === 'contact') return 'navigational';
  return 'informational';
}

function schemaTypeFor(target: PageTarget): PageSeo['schemaType'] {
  if (target.kind === 'blogPost') return 'BlogPosting';
  if (ARTICLE_KINDS.has(target.kind)) return 'Article';
  if (target.service) return 'Service';
  return 'WebPage';
}

export function canonicalUrlFor(path: string): string {
  const url = absoluteUrl(path);
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    throw new Error(
      `Refusing a canonical on an untrusted host (${url}). Set business.url to the production origin.`,
    );
  }
  if (!url.startsWith(business.url)) {
    throw new Error(`Canonical ${url} is not on the configured origin ${business.url}.`);
  }
  return url;
}

export interface PageSeoExtras {
  readonly indexable?: boolean;
  readonly h1?: string;
  readonly lastModified?: string;
  readonly ogImagePath?: string;
  readonly breadcrumbs?: readonly Crumb[];
}

export function buildPageSeo(target: PageTarget, extras: PageSeoExtras = {}): PageSeo {
  const copy = buildPageCopy(target);
  const indexable = extras.indexable ?? true;
  const slug = target.path === '/' ? 'home' : (target.path.split('/').filter(Boolean).at(-1) ?? 'home');

  return {
    slug,
    pageType: target.kind,
    title: copy.title,
    description: copy.description,
    primaryKeyword: primaryKeywordFor(target),
    secondaryKeywords: copy.keywords ?? [],
    searchIntent: searchIntentFor(target),
    h1: extras.h1 ?? copy.h1,
    canonicalUrl: canonicalUrlFor(target.path),
    indexable,
    robots: indexable ? 'index, follow' : 'noindex, follow',
    ...(extras.ogImagePath ? { ogImagePath: extras.ogImagePath } : {}),
    ...(extras.lastModified ? { lastModified: extras.lastModified } : {}),
    ...(extras.breadcrumbs ? { breadcrumbs: extras.breadcrumbs } : {}),
    schemaType: schemaTypeFor(target),
  };
}
