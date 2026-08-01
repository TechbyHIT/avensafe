import { z } from 'zod';

/**
 * Zod contracts for every JSON module in `data/`.
 *
 * These schemas are the single definition of the content model: the TypeScript
 * types used across the app are inferred from them, and `npm run validate:data`
 * fails the build if a JSON file drifts from the contract.
 */

const slug = z
  .string()
  .min(2)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be a lowercase, hyphenated slug');

const id = z.string().min(2);
const nonEmpty = z.string().min(1);
const sentence = z.string().min(20);
const paragraph = z.string().min(60);

/**
 * Environmental and built-form traits. A location declares its traits and the
 * content engine uses them to select genuinely different technical guidance,
 * rather than swapping a place name into a fixed sentence.
 */
export const TRAIT_KEYS = [
  'coastal',
  'humid',
  'arid',
  'highRise',
  'monsoonHeavy',
  'industrial',
] as const;

export const traitKeySchema = z.enum(TRAIT_KEYS);
export type TraitKey = z.infer<typeof traitKeySchema>;

/** A short heading plus explanatory body, used by most content modules. */
export const titledDetailSchema = z.object({
  title: nonEmpty,
  detail: sentence,
});

export const materialSchema = z.object({
  name: nonEmpty,
  spec: nonEmpty,
  detail: sentence,
});

export const stepSchema = z.object({
  title: nonEmpty,
  detail: sentence,
});

/** Trait-keyed copy. Every service supplies a `default` plus any traits it varies on. */
const traitCopySchema = z
  .object({ default: nonEmpty })
  .catchall(z.string())
  .refine(
    (value) =>
      Object.keys(value).every(
        (key) => key === 'default' || (TRAIT_KEYS as readonly string[]).includes(key),
      ),
    { message: 'trait keys must be one of TRAIT_KEYS or "default"' },
  );

/* ------------------------------------------------------------------ services */

export const serviceSchema = z.object({
  id,
  slug,
  name: nonEmpty,
  shortName: nonEmpty,
  category: z.enum(['safety', 'utility', 'sports', 'industrial']),
  /** One-line summary used in cards and meta descriptions. */
  summary: sentence,
  /** Opening body paragraph for the service's own page. */
  intro: paragraph,
  /** What problem this product solves, in plain language. */
  problemSolved: sentence,
  searchTerms: z.array(nonEmpty).min(1),
  propertyTypes: z.array(nonEmpty).min(1),
  benefits: z.array(titledDetailSchema).min(3),
  features: z.array(titledDetailSchema).min(3),
  applications: z.array(titledDetailSchema).min(3),
  materials: z.array(materialSchema).min(2),
  installation: z.object({
    typicalDurationHours: z.tuple([z.number().positive(), z.number().positive()]),
    surveyRequired: z.boolean(),
    steps: z.array(stepSchema).min(3),
    sitePreparation: z.array(nonEmpty).min(2),
  }),
  safety: z.object({
    standards: z.array(nonEmpty),
    notes: z.array(titledDetailSchema).min(2),
  }),
  maintenance: z.object({
    inspectionIntervalMonths: z.number().int().positive(),
    tasks: z.array(titledDetailSchema).min(2),
  }),
  quality: z.object({
    warrantyYears: z.number().int().nonnegative(),
    checks: z.array(nonEmpty).min(2),
  }),
  pricingFactors: z.array(titledDetailSchema).min(3),
  /** Short phrase per trait, used to keep titles and H1s distinct. */
  locationAngles: traitCopySchema,
  /** Full paragraph per trait, used for location-specific body guidance. */
  environmentalGuidance: traitCopySchema,
  relatedServiceIds: z.array(id),
  imageIds: z.array(id),
  featured: z.boolean(),
  published: z.boolean(),
});

export const servicesFileSchema = z.array(serviceSchema).min(1);
export type Service = z.infer<typeof serviceSchema>;

/* -------------------------------------------------------------------- states */

export const stateSchema = z.object({
  id,
  slug,
  name: nonEmpty,
  code: z.string().min(2).max(3),
  isUnionTerritory: z.boolean(),
  region: z.enum(['south', 'west', 'east', 'north', 'central', 'northeast']),
  coastal: z.boolean(),
  traits: z.array(traitKeySchema),
  /** Unique opening paragraph for the state page. */
  intro: paragraph,
  /** How buildings in this state affect the work. */
  buildingContext: paragraph,
  /** Climate factors that change material choice. */
  climateContext: paragraph,
  primaryLanguages: z.array(nonEmpty).min(1),
  published: z.boolean(),
});

export const statesFileSchema = z.array(stateSchema).min(1);
export type State = z.infer<typeof stateSchema>;

/* ----------------------------------------------------------------- districts */

export const districtSchema = z.object({
  id,
  slug,
  name: nonEmpty,
  stateId: id,
  headquarters: nonEmpty,
  /** Optional LGD / source short code for reconciliation. */
  sourceCode: z.string().min(1).max(8).optional(),
  intro: paragraph,
  localConsiderations: sentence,
  neighbouringDistrictIds: z.array(id),
  published: z.boolean(),
});

export const districtsFileSchema = z.array(districtSchema).min(1);
export type District = z.infer<typeof districtSchema>;

/* -------------------------------------------------------------------- cities */

export const citySchema = z.object({
  id,
  slug,
  name: nonEmpty,
  stateId: id,
  /** Official district this city sits in (LGD-aligned). */
  districtId: id,
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  traits: z.array(traitKeySchema),
  /** Dominant built form, which drives access and fixing method. */
  builtForm: z.enum(['high-rise', 'mid-rise', 'independent-houses', 'mixed']),
  /** Unique opening paragraph for the city page. */
  intro: paragraph,
  /** Locally specific installation considerations. */
  localConsiderations: sentence,
  landmarks: z.array(nonEmpty),
  pincodePrefixes: z.array(z.string().regex(/^\d{3}$/)),
  neighbouringCityIds: z.array(id),
  published: z.boolean(),
});

export const citiesFileSchema = z.array(citySchema).min(1);
export type City = z.infer<typeof citySchema>;

/* --------------------------------------------------------------------- areas */

export const areaSchema = z.object({
  id,
  slug,
  name: nonEmpty,
  cityId: id,
  /** Optional finer label for locality rows (ward, colony, IT park, etc.). */
  locationKind: z.enum([
    'district',
    'revenue-division',
    'sub-division',
    'mandal',
    'taluk',
    'tehsil',
    'block',
    'municipal-corporation',
    'municipality',
    'nagar-panchayat',
    'cantonment-board',
    'city',
    'town',
    'census-town',
    'village',
    'gram-panchayat',
    'ward',
    'area',
    'locality',
    'colony',
    'layout',
    'nagar',
    'residential-area',
    'commercial-area',
    'industrial-area',
    'it-park',
    'sez',
    'apartment',
    'gated-community',
    'society',
    'township',
    'street',
    'road',
    'landmark',
    'metro-station',
    'pincode',
    'other',
  ]).optional(),
  profile: z.enum(['residential', 'commercial', 'mixed', 'industrial']),
  builtForm: z.enum([
    'gated-apartments',
    'high-rise',
    'independent-houses',
    'commercial-towers',
    'mixed',
  ]),
  traits: z.array(traitKeySchema),
  /** Specific, verifiable notes. Areas without these are not published. */
  notes: sentence,
  landmarks: z.array(nonEmpty),
  pincode: z.string().regex(/^\d{6}$/).optional(),
  adjacentAreaIds: z.array(id),
  published: z.boolean(),
});

export const areasFileSchema = z.array(areaSchema).min(1);
export type Area = z.infer<typeof areaSchema>;

/* ---------------------------------------------------------------------- FAQs */

export const faqSchema = z.object({
  id,
  question: nonEmpty,
  answer: paragraph,
  /**
   * `global` FAQs may appear anywhere; `service` FAQs attach to the listed
   * services; `location` FAQs are only used on location pages.
   */
  scope: z.enum(['global', 'service', 'location', 'pricing', 'maintenance']),
  serviceIds: z.array(id),
  traits: z.array(traitKeySchema),
  order: z.number().int(),
});

export const faqsFileSchema = z.array(faqSchema).min(1);
export type Faq = z.infer<typeof faqSchema>;

/* -------------------------------------------------------------------- images */

export const imageSchema = z.object({
  id,
  src: z.string().startsWith('/'),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  /** Descriptive alt text. Enforced non-empty so no image ships without one. */
  alt: z.string().min(12),
  caption: z.string().optional(),
  serviceIds: z.array(id),
  tags: z.array(nonEmpty),
  /** Marks generated placeholder art that should be swapped for photography. */
  placeholder: z.boolean(),
});

export const imagesFileSchema = z.array(imageSchema).min(1);
export type ImageRecord = z.infer<typeof imageSchema>;

/* ------------------------------------------------------------------- gallery */

export const galleryItemSchema = z.object({
  id,
  imageId: id,
  title: nonEmpty,
  description: sentence,
  serviceId: id,
  category: nonEmpty,
  order: z.number().int(),
  published: z.boolean(),
});

export const galleryFileSchema = z.array(galleryItemSchema);
export type GalleryItem = z.infer<typeof galleryItemSchema>;

/* --------------------------------------------------------- editorial content */

export const contentSectionSchema = z.object({
  heading: nonEmpty,
  paragraphs: z.array(paragraph).min(1),
  bullets: z.array(nonEmpty).optional(),
  callout: sentence.optional(),
});

export type ContentSection = z.infer<typeof contentSectionSchema>;

const editorialBase = {
  id,
  slug,
  title: nonEmpty,
  /** Distinct from `title`: used as the on-page H1. */
  heading: nonEmpty,
  description: sentence,
  excerpt: sentence,
  publishedAt: z.string().date(),
  updatedAt: z.string().date(),
  author: nonEmpty,
  readingMinutes: z.number().int().positive(),
  sections: z.array(contentSectionSchema).min(3),
  serviceIds: z.array(id),
  faqIds: z.array(id),
  imageId: id.optional(),
  published: z.boolean(),
};

export const blogPostSchema = z.object({
  ...editorialBase,
  category: nonEmpty,
  tags: z.array(nonEmpty),
});

export const blogsFileSchema = z.array(blogPostSchema);
export type BlogPost = z.infer<typeof blogPostSchema>;

export const guideSchema = z.object({
  ...editorialBase,
  /** Cornerstone guides are published at the site root, not under /guides/. */
  cornerstone: z.boolean(),
  topic: z.enum([
    'pricing',
    'materials',
    'installation',
    'safety',
    'maintenance',
    'buying',
    'faq',
  ]),
});

export const guidesFileSchema = z.array(guideSchema);
export type Guide = z.infer<typeof guideSchema>;

/* ------------------------------------------------------------------ projects */

export const projectSchema = z.object({
  id,
  slug,
  title: nonEmpty,
  /**
   * `scenario` describes a representative job type and makes no claim about a
   * specific client. `case-study` is reserved for verified, approved work.
   */
  kind: z.enum(['scenario', 'case-study']),
  serviceIds: z.array(id).min(1),
  propertyType: nonEmpty,
  brief: sentence,
  challenge: paragraph,
  approach: paragraph,
  outcome: paragraph,
  scopeItems: z.array(nonEmpty).min(2),
  imageId: id.optional(),
  order: z.number().int(),
  published: z.boolean(),
});

export const projectsFileSchema = z.array(projectSchema);
export type Project = z.infer<typeof projectSchema>;

/* -------------------------------------------------------------- testimonials */

export const testimonialSchema = z.object({
  id,
  quote: sentence,
  attribution: nonEmpty,
  locationLabel: nonEmpty,
  serviceIds: z.array(id),
  /**
   * Only verified, permissioned feedback may be published. Unverified entries
   * never render and are never expressed as Review or AggregateRating schema.
   */
  verified: z.boolean(),
  published: z.boolean(),
});

export const testimonialsFileSchema = z.array(testimonialSchema);
export type Testimonial = z.infer<typeof testimonialSchema>;

/* ------------------------------------------------------------ internal links */

export const internalLinksFileSchema = z.object({
  /** Editorially chosen guide links per service. */
  serviceToGuides: z.record(id, z.array(slug)),
  /** Editorially chosen service links per guide. */
  guideToServices: z.record(slug, z.array(id)),
  /** Named clusters that keep related pages mutually reachable. */
  clusters: z.array(
    z.object({
      id,
      label: nonEmpty,
      paths: z.array(z.string().startsWith('/')).min(2),
    }),
  ),
  /** Hand-written links that the algorithmic engine would not infer. */
  manualLinks: z.array(
    z.object({
      from: z.string().startsWith('/'),
      to: z.string().startsWith('/'),
      anchor: nonEmpty,
      context: sentence,
    }),
  ),
});

export type InternalLinksFile = z.infer<typeof internalLinksFileSchema>;

/* ----------------------------------------------------------- search intents */

export const SEARCH_INTENT_MODULE_IDS = [
  'benefits',
  'features',
  'applications',
  'materials',
  'installation',
  'safety',
  'maintenance',
  'quality',
  'pricingFactors',
] as const;

export const searchIntentScopeSchema = z.enum([
  'global',
  'service',
  'location',
  'pricing',
  'maintenance',
]);

/**
 * Facet families an intent can belong to.
 *
 * The dimension is what makes two intents on the same service genuinely
 * different pages rather than synonyms: it selects which extra content module
 * the engine renders (a material page gets grade comparisons, an audience page
 * gets procurement and handover detail, and so on).
 */
export const INTENT_DIMENSIONS = [
  'commercial',
  'pricing',
  'property-type',
  'opening',
  'material',
  'benefit',
  'audience',
  'speed',
  'trust',
  'stage',
  'design',
  'decision',
] as const;

export const intentDimensionSchema = z.enum(INTENT_DIMENSIONS);
export type IntentDimension = (typeof INTENT_DIMENSIONS)[number];

/**
 * Crawl-budget tier.
 *
 * 1 = worth a page in every city and every locality, 2 = cities plus
 * localities in tier 1–2 cities, 3 = city level only. This is the lever that
 * lets the intent table grow without minting a locality page for every
 * long-tail modifier.
 */
export const intentTierSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export type IntentTier = z.infer<typeof intentTierSchema>;

export const searchIntentSchema = z.object({
  id,
  slug,
  label: nonEmpty,
  /** Used in `<title>` after the service name. */
  titlePhrase: nonEmpty,
  /** Used in the H1 after the service name. */
  h1Phrase: nonEmpty,
  /** Intent-specific opening copy (shared across locations; locality facts follow). */
  lede: paragraph,
  focusModules: z.array(z.enum(SEARCH_INTENT_MODULE_IDS)).min(1),
  faqScopes: z.array(searchIntentScopeSchema).min(1),
  /** Facet family. Defaults to the commercial modifiers the table started with. */
  dimension: intentDimensionSchema.default('commercial'),
  /** Location depth this intent earns a page at. */
  tier: intentTierSchema.default(1),
  /** When present, the intent only applies to these service slugs. */
  serviceSlugs: z.array(slug).min(1).optional(),
  /** Extra facet-specific detail rows rendered on the page. */
  facetPoints: z.array(titledDetailSchema).optional(),
  published: z.boolean(),
});

export const searchIntentsFileSchema = z.array(searchIntentSchema).min(1);
export type SearchIntent = z.infer<typeof searchIntentSchema>;
export type SearchIntentModuleId = (typeof SEARCH_INTENT_MODULE_IDS)[number];
