import { business } from '@/config/business';
import { STATIC_ROUTES } from '@/config/routes';
import { SEO_DEFAULTS } from '@/config/seo';
import type { BlogPost, Faq, Guide, ImageRecord, Service, Testimonial } from '@/lib/data/schemas';
import { absoluteUrl } from '@/lib/routing/url';
import type { Crumb } from '@/types/routing';

/**
 * JSON-LD builders.
 *
 * Only schema we can substantiate is emitted: no aggregate ratings, no invented
 * prices, and `Review` nodes only for verified testimonials. `LocalBusiness` is
 * only produced when a verified postal address exists in the business config.
 */

export type JsonLdNode = Record<string, unknown>;

/** Stable node identifiers so nodes in one graph can reference each other. */
export const SCHEMA_IDS = {
  organization: absoluteUrl('/#organization'),
  website: absoluteUrl('/#website'),
} as const;

export function organizationSchema(): JsonLdNode {
  const telephones = business.phones.map((phone) => phone.e164);

  return {
    '@type': 'Organization',
    '@id': SCHEMA_IDS.organization,
    name: business.name,
    legalName: business.legalName,
    url: business.url,
    email: business.email,
    description: business.description,
    foundingDate: String(business.foundingYear),
    telephone: telephones[0],
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl(business.logo.src),
      width: business.logo.width,
      height: business.logo.height,
    },
    image: absoluteUrl(business.openGraphImage.src),
    contactPoint: business.phones.map((phone) => ({
      '@type': 'ContactPoint',
      telephone: phone.e164,
      contactType: phone.label,
      email: business.email,
      areaServed: 'IN',
      availableLanguage: [...business.languages],
    })),
    ...(business.socialProfiles.length > 0
      ? { sameAs: business.socialProfiles.map((profile) => profile.url) }
      : {}),
    ...(business.address ? { address: postalAddressSchema() } : {}),
  };
}

function postalAddressSchema(): JsonLdNode | undefined {
  const address = business.address;
  if (!address) return undefined;
  return {
    '@type': 'PostalAddress',
    streetAddress: address.streetAddress,
    addressLocality: address.addressLocality,
    addressRegion: address.addressRegion,
    postalCode: address.postalCode,
    addressCountry: address.addressCountry,
  };
}

export function websiteSchema(): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': SCHEMA_IDS.website,
    url: business.url,
    name: business.name,
    description: business.shortDescription,
    inLanguage: SEO_DEFAULTS.htmlLang,
    publisher: { '@id': SCHEMA_IDS.organization },
  };
}

/**
 * Only emitted when a verified address is configured. Returns `undefined`
 * otherwise, and the graph builder drops it.
 */
export function localBusinessSchema(): JsonLdNode | undefined {
  if (!business.address) return undefined;

  return {
    '@type': 'LocalBusiness',
    '@id': absoluteUrl('/#localbusiness'),
    name: business.name,
    url: business.url,
    email: business.email,
    telephone: business.phones[0]?.e164,
    description: business.description,
    address: postalAddressSchema(),
    ...(business.geo
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: business.geo.latitude,
            longitude: business.geo.longitude,
          },
        }
      : {}),
    openingHoursSpecification: business.openingHours.map((hours) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [...hours.days],
      opens: hours.opens,
      closes: hours.closes,
    })),
    // No priceRange is emitted: we publish cost factors rather than a price band.
  };
}

export interface WebPageInput {
  readonly name: string;
  readonly description: string;
  readonly path: string;
  readonly primaryImage?: ImageRecord | undefined;
  readonly hasBreadcrumb?: boolean;
}

export function webPageSchema({
  name,
  description,
  path,
  primaryImage,
  hasBreadcrumb = true,
}: WebPageInput): JsonLdNode {
  const url = absoluteUrl(path);
  return {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: SEO_DEFAULTS.htmlLang,
    isPartOf: { '@id': SCHEMA_IDS.website },
    about: { '@id': SCHEMA_IDS.organization },
    ...(primaryImage ? { primaryImageOfPage: imageObjectSchema(primaryImage) } : {}),
    ...(hasBreadcrumb ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}),
  };
}

export function contactPageSchema(description: string): JsonLdNode {
  const url = absoluteUrl(STATIC_ROUTES.contact);
  return {
    '@type': 'ContactPage',
    '@id': `${url}#webpage`,
    url,
    name: `Contact ${business.name}`,
    description,
    inLanguage: SEO_DEFAULTS.htmlLang,
    isPartOf: { '@id': SCHEMA_IDS.website },
    about: { '@id': SCHEMA_IDS.organization },
    breadcrumb: { '@id': `${url}#breadcrumb` },
  };
}

export interface ServiceSchemaInput {
  readonly service: Service;
  readonly path: string;
  readonly description: string;
  /** Place names this page's service is offered in. */
  readonly areaServed: readonly string[];
}

export function serviceSchema({
  service,
  path,
  description,
  areaServed,
}: ServiceSchemaInput): JsonLdNode {
  const url = absoluteUrl(path);
  return {
    '@type': 'Service',
    '@id': `${url}#service`,
    name: service.name,
    serviceType: service.name,
    description,
    url,
    category: service.category,
    provider: { '@id': SCHEMA_IDS.organization },
    ...(areaServed.length > 0
      ? { areaServed: areaServed.map((place) => ({ '@type': 'Place', name: place })) }
      : {}),
    // No `offers` node: we do not publish prices, so asserting one would be false.
  };
}

export function faqPageSchema(faqs: readonly Faq[], path: string): JsonLdNode | undefined {
  if (faqs.length === 0) return undefined;
  const url = absoluteUrl(path);
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

/** Installation path HowTo — only for geo×service pages that show the process. */
export function howToSchema(input: {
  readonly name: string;
  readonly description: string;
  readonly path: string;
}): JsonLdNode {
  const url = absoluteUrl(input.path);
  const steps = [
    {
      name: 'Share the opening',
      text: 'Send a clear photo of the balcony, window, or duct, plus your city and PIN code.',
    },
    {
      name: 'Measure and check',
      text: 'We confirm dimensions, fixing surfaces, access, and how the space is used day to day.',
    },
    {
      name: 'Compare the written estimate',
      text: 'The quotation lists material grade, spacing, labour, and finish so comparisons stay fair.',
    },
    {
      name: 'Install and hand over',
      text: 'We fit the system, check tension, and walk through care before leaving site.',
    },
  ] as const;

  return {
    '@type': 'HowTo',
    '@id': `${url}#howto`,
    name: input.name,
    description: input.description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      url: `${url}#howto-step-${index + 1}`,
    })),
  };
}

export function breadcrumbSchema(crumbs: readonly Crumb[], path: string): JsonLdNode | undefined {
  if (crumbs.length < 2) return undefined;
  const url = absoluteUrl(path);
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: absoluteUrl(crumb.href),
    })),
  };
}

export function imageObjectSchema(image: ImageRecord): JsonLdNode {
  return {
    '@type': 'ImageObject',
    '@id': `${absoluteUrl(image.src)}#image`,
    url: absoluteUrl(image.src),
    contentUrl: absoluteUrl(image.src),
    width: image.width,
    height: image.height,
    description: image.alt,
    ...(image.caption ? { caption: image.caption } : {}),
  };
}

/**
 * One `Review` node per verified testimonial. Never invent star ratings —
 * `AggregateRating` stays out of the graph until we have measured scores.
 */
export function reviewSchema(
  entry: Testimonial,
  path: string,
  itemReviewedId: string,
): JsonLdNode {
  const url = absoluteUrl(path);
  return {
    '@type': 'Review',
    '@id': `${url}#review-${entry.id}`,
    reviewBody: entry.quote,
    author: {
      '@type': 'Person',
      name: entry.attribution,
    },
    itemReviewed: { '@id': itemReviewedId },
    publisher: { '@id': SCHEMA_IDS.organization },
  };
}

export interface ArticleSchemaInput {
  readonly entry: BlogPost | Guide;
  readonly path: string;
  readonly image?: ImageRecord | undefined;
  /** `BlogPosting` for posts, `Article` for guides. */
  readonly articleType: 'BlogPosting' | 'Article';
}

export function articleSchema({
  entry,
  path,
  image,
  articleType,
}: ArticleSchemaInput): JsonLdNode {
  const url = absoluteUrl(path);
  return {
    '@type': articleType,
    '@id': `${url}#article`,
    headline: entry.title,
    description: entry.description,
    url,
    mainEntityOfPage: { '@id': `${url}#webpage` },
    datePublished: entry.publishedAt,
    dateModified: entry.updatedAt,
    inLanguage: SEO_DEFAULTS.htmlLang,
    author: { '@type': 'Organization', name: entry.author, url: business.url },
    publisher: { '@id': SCHEMA_IDS.organization },
    wordCount: entry.sections.reduce(
      (total, section) =>
        total + section.paragraphs.reduce((sum, text) => sum + text.split(/\s+/u).length, 0),
      0,
    ),
    ...(image ? { image: imageObjectSchema(image) } : {}),
  };
}
