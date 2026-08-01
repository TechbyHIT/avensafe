/**
 * Dynamic layout recipes for programmatic pages.
 *
 * ## Layout system (implementation contract)
 *
 * **Selection inputs:** page kind, intent dimension/slug, word count, module
 * count, and content flags (gallery, testimonials, locality directory, coverage).
 *
 * **Profiles**
 * - `commercial` — geo×service and transactional intents: trust → proof → quote
 * - `local` — state/city/area/district hubs: locality, services nav, maps of coverage
 * - `service` — national service hubs: expertise, process, coverage ladder, FAQs
 * - `informational` — material/benefit/trust/design intents: education first
 *
 * **Hero variants:** `fullBleed` | `split` | `compact` | `editorial`
 * (seeded per URL so sibling pages diverge).
 *
 * **CTA emphasis:** `photo` | `call` | `survey` | `explore` — reorders and
 * relabels ContactActions + CtaSection copy for journey stage.
 *
 * **Density:** `airy` | `balanced` | `dense` from word count (data attribute on
 * the page shell for future spacing tuning).
 *
 * **Sticky TOC:** only when wordCount ≥ 1800 and ≥ 8 modules (desktop).
 *
 * **Rules:** never force empty sections; never render placeholders; rotate
 * section order within each profile so two pages rarely share the same flow;
 * brand tokens (color, type, spacing, components) stay shared.
 *
 * Empty slots are omitted at compose time and again at render if data vanishes.
 */
import { pageSeed } from '@/lib/content/entity-composer';
import { pickVariant } from '@/lib/utils/hash';
import type { PageContent } from '@/types/content';
import type { PageKind } from '@/config/routes';
import type { PageTarget } from '@/types/routing';

export type HeroVariant = 'fullBleed' | 'split' | 'compact' | 'editorial';
export type CtaEmphasis = 'photo' | 'call' | 'survey' | 'explore';
export type Density = 'airy' | 'balanced' | 'dense';

export type LayoutSectionId =
  | 'trustStrip'
  | 'compactProcess'
  | 'servicesNav'
  | 'content'
  | 'gallery'
  | 'priceFactors'
  | 'photoEnquiry'
  | 'serviceCoverage'
  | 'localityDirectory'
  | 'testimonials'
  | 'installProcess'
  | 'faq'
  | 'cta'
  | 'relatedLinks';

export interface LayoutRecipe {
  readonly heroVariant: HeroVariant;
  readonly ctaEmphasis: CtaEmphasis;
  readonly density: Density;
  readonly showStickyToc: boolean;
  /** Ordered sections to render; omit anything without data at render time. */
  readonly sections: readonly LayoutSectionId[];
  readonly intentProfile: 'commercial' | 'local' | 'informational' | 'service';
}

function intentProfileFor(target: PageTarget): LayoutRecipe['intentProfile'] {
  if (target.kind === 'service' || target.kind === 'serviceIntent') return 'service';
  if (
    target.kind === 'state' ||
    target.kind === 'city' ||
    target.kind === 'area' ||
    target.kind === 'district'
  ) {
    return 'local';
  }
  if (target.intent) {
    const dim = target.intent.dimension;
    // Educational facets: materials, benefits, trust signals, design explainers.
    if (dim === 'material' || dim === 'benefit' || dim === 'trust' || dim === 'design') {
      return 'informational';
    }
  }
  return 'commercial';
}

function baseOrder(profile: LayoutRecipe['intentProfile']): readonly LayoutSectionId[] {
  switch (profile) {
    case 'informational':
      return [
        'content',
        'gallery',
        'compactProcess',
        'faq',
        'relatedLinks',
        'photoEnquiry',
        'cta',
        'servicesNav',
        'trustStrip',
      ];
    case 'local':
      return [
        'trustStrip',
        'photoEnquiry',
        'servicesNav',
        'content',
        'priceFactors',
        'localityDirectory',
        'gallery',
        'faq',
        'relatedLinks',
        'cta',
        'testimonials',
      ];
    case 'service':
      return [
        'trustStrip',
        'content',
        'installProcess',
        'priceFactors',
        'gallery',
        'serviceCoverage',
        'photoEnquiry',
        'faq',
        'cta',
        'relatedLinks',
        'testimonials',
      ];
    case 'commercial':
    default:
      return [
        'trustStrip',
        'compactProcess',
        'servicesNav',
        'content',
        'priceFactors',
        'gallery',
        'photoEnquiry',
        'localityDirectory',
        'testimonials',
        'faq',
        'cta',
        'relatedLinks',
      ];
  }
}

function heroFor(target: PageTarget, profile: LayoutRecipe['intentProfile']): HeroVariant {
  const seed = pageSeed(target);
  if (profile === 'informational') {
    return pickVariant(`${seed}:hero`, ['editorial', 'compact', 'split'] as const);
  }
  if (profile === 'local') {
    // Always photo heroes on city/area/society pages — never text-only editorial.
    return pickVariant(`${seed}:hero`, ['split', 'fullBleed'] as const);
  }
  if (profile === 'service') {
    return pickVariant(`${seed}:hero`, ['fullBleed', 'split'] as const);
  }
  // Commercial / geo×service
  if (target.kind === 'serviceInArea' || target.kind === 'serviceInAreaIntent') {
    return pickVariant(`${seed}:hero`, ['compact', 'split', 'fullBleed'] as const);
  }
  return pickVariant(`${seed}:hero`, ['fullBleed', 'split', 'compact'] as const);
}

function ctaFor(target: PageTarget, profile: LayoutRecipe['intentProfile']): CtaEmphasis {
  const seed = pageSeed(target);
  if (profile === 'informational') return 'explore';
  // City / area / district hubs: WhatsApp photo-first (conversion path).
  if (profile === 'local') return 'photo';
  if (target.intent?.slug === 'price' || target.intent?.slug === 'quote') return 'photo';
  if (target.intent?.slug === 'booking' || target.intent?.slug === 'near-me') return 'call';
  if (profile === 'service') return 'photo';
  return pickVariant(`${seed}:cta`, ['photo', 'call', 'survey'] as const);
}

function densityFor(content: PageContent, profile: LayoutRecipe['intentProfile']): Density {
  if (content.wordCount >= 2200) return profile === 'informational' ? 'balanced' : 'dense';
  if (content.wordCount <= 900) return 'airy';
  return 'balanced';
}

function eligible(
  id: LayoutSectionId,
  target: PageTarget,
  content: PageContent,
  flags: {
    readonly hasGallery: boolean;
    readonly hasTestimonials: boolean;
    readonly hasLocalityDir: boolean;
    readonly hasCoverage: boolean;
  },
): boolean {
  const kind = target.kind as PageKind;
  const isServiceLocation =
    kind === 'serviceInCity' ||
    kind === 'serviceInArea' ||
    kind === 'serviceInDistrict' ||
    kind === 'serviceInCityIntent' ||
    kind === 'serviceInAreaIntent';
  const isLocationHub =
    kind === 'city' || kind === 'area' || kind === 'state' || kind === 'district';
  const isServiceHub = kind === 'service' || kind === 'serviceIntent';
  const place = Boolean(target.location?.city || target.location?.area || target.location?.district);

  switch (id) {
    case 'trustStrip':
      return isServiceLocation || isLocationHub || isServiceHub;
    case 'compactProcess':
      return isServiceLocation || isLocationHub || (isServiceHub && content.wordCount < 2500);
    case 'servicesNav':
      return Boolean(target.location?.city) && (isServiceLocation || isLocationHub);
    case 'content':
      return content.modules.length > 0;
    case 'gallery':
      return flags.hasGallery;
    case 'priceFactors':
      // City/area hubs + geo×service pages (EverSafe-style pricing literacy).
      return (
        place &&
        (isServiceLocation ||
          kind === 'city' ||
          kind === 'area' ||
          (isServiceHub && Boolean(target.service)))
      );
    case 'photoEnquiry':
      // Always on location pages; also on national service hubs (photo estimate).
      return place || isServiceHub;
    case 'serviceCoverage':
      return flags.hasCoverage && isServiceHub && Boolean(target.service);
    case 'localityDirectory':
      // City hubs only — area/society pages are already a locality (keeps them fast).
      return flags.hasLocalityDir && kind !== 'area' && kind !== 'serviceInArea' && kind !== 'serviceInAreaIntent';
    case 'testimonials':
      return flags.hasTestimonials && (isServiceLocation || isLocationHub || isServiceHub);
    case 'installProcess':
      return isServiceHub && Boolean(target.service) && !place;
    case 'faq':
      return content.faqs.length > 0;
    case 'cta':
      return true;
    case 'relatedLinks':
      return true;
    default:
      return false;
  }
}

/** Rotate section order so sibling pages do not share the same visual flow. */
function rotateFlow(
  profile: LayoutRecipe['intentProfile'],
  sections: readonly LayoutSectionId[],
  seed: string,
): readonly LayoutSectionId[] {
  const commercial: readonly (readonly LayoutSectionId[])[] = [
    sections,
    [
      'servicesNav',
      'trustStrip',
      'content',
      'gallery',
      'priceFactors',
      'compactProcess',
      'photoEnquiry',
      'localityDirectory',
      'faq',
      'testimonials',
      'cta',
      'relatedLinks',
    ],
    [
      'compactProcess',
      'content',
      'priceFactors',
      'photoEnquiry',
      'gallery',
      'trustStrip',
      'servicesNav',
      'faq',
      'cta',
      'localityDirectory',
      'relatedLinks',
      'testimonials',
    ],
    [
      'content',
      'gallery',
      'servicesNav',
      'priceFactors',
      'faq',
      'photoEnquiry',
      'trustStrip',
      'localityDirectory',
      'cta',
      'relatedLinks',
      'testimonials',
      'compactProcess',
    ],
  ];

  const local: readonly (readonly LayoutSectionId[])[] = [
    sections,
    [
      'photoEnquiry',
      'servicesNav',
      'content',
      'priceFactors',
      'localityDirectory',
      'trustStrip',
      'gallery',
      'faq',
      'relatedLinks',
      'cta',
      'testimonials',
    ],
    [
      'trustStrip',
      'servicesNav',
      'photoEnquiry',
      'content',
      'localityDirectory',
      'priceFactors',
      'gallery',
      'faq',
      'cta',
      'relatedLinks',
      'testimonials',
    ],
  ];

  const service: readonly (readonly LayoutSectionId[])[] = [
    sections,
    [
      'content',
      'trustStrip',
      'gallery',
      'installProcess',
      'priceFactors',
      'photoEnquiry',
      'faq',
      'serviceCoverage',
      'cta',
      'relatedLinks',
      'testimonials',
    ],
    [
      'trustStrip',
      'photoEnquiry',
      'installProcess',
      'content',
      'priceFactors',
      'faq',
      'gallery',
      'cta',
      'serviceCoverage',
      'testimonials',
      'relatedLinks',
    ],
  ];

  const informational: readonly (readonly LayoutSectionId[])[] = [
    sections,
    [
      'content',
      'faq',
      'gallery',
      'relatedLinks',
      'compactProcess',
      'cta',
      'photoEnquiry',
      'servicesNav',
      'trustStrip',
    ],
    [
      'content',
      'compactProcess',
      'relatedLinks',
      'faq',
      'gallery',
      'cta',
      'servicesNav',
      'photoEnquiry',
      'trustStrip',
    ],
  ];

  const variants =
    profile === 'commercial'
      ? commercial
      : profile === 'local'
        ? local
        : profile === 'service'
          ? service
          : informational;

  return pickVariant(`${seed}:flow`, variants);
}

export function composeLayoutRecipe(
  target: PageTarget,
  content: PageContent,
  flags: {
    readonly hasGallery: boolean;
    readonly hasTestimonials: boolean;
    readonly hasLocalityDir: boolean;
    readonly hasCoverage: boolean;
  },
): LayoutRecipe {
  const profile = intentProfileFor(target);
  const seed = pageSeed(target);
  const order = rotateFlow(profile, baseOrder(profile), seed);
  const sections = order.filter((id) => eligible(id, target, content, flags));

  return {
    heroVariant: heroFor(target, profile),
    ctaEmphasis: ctaFor(target, profile),
    density: densityFor(content, profile),
    showStickyToc: content.wordCount >= 1800 && content.modules.length >= 8,
    sections,
    intentProfile: profile,
  };
}
