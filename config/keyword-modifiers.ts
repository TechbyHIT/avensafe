/**
 * Ultimate local SEO keyword modifier catalog.
 *
 * Rules for programmatic SEO:
 * - Synonyms alias to one canonical intent (no duplicate pages).
 * - Trust/legal modifiers never invent certificates in page copy.
 * - Tier controls locality depth (see lib/routing/facets.ts).
 * - Location words (near metro, in {area}) are resolved from geo data,
 *   not minted as intent slugs.
 */

export type ModifierGroup =
  | 'local'
  | 'quality'
  | 'buying'
  | 'service'
  | 'property'
  | 'audience'
  | 'feature'
  | 'trust'
  | 'action'
  | 'location'
  | 'comparison';

export interface ServiceKeywordRoot {
  readonly label: string;
  readonly serviceSlug: string;
  /** Extra product phrases that resolve to this service. */
  readonly phrases: readonly string[];
  /** Optional default intent when the phrase itself implies one. */
  readonly defaultIntentSlug?: string;
}

export interface KeywordModifier {
  readonly label: string;
  readonly group: ModifierGroup;
  /** Canonical published intent slug (must exist or be synced). */
  readonly intentSlug: string;
  /** Alternate search phrases that roll up to the same intent. */
  readonly aliases?: readonly string[];
  /**
   * When false, the modifier only helps keyword resolution — it does not
   * justify a dedicated URL segment beyond the aliased intent.
   */
  readonly mintPage?: boolean;
  readonly tier?: 1 | 2 | 3;
  readonly dimension?: string;
  /** Restrict to these services; omit = all (subject to intent.serviceSlugs). */
  readonly serviceSlugs?: readonly string[];
}

/** Product roots from the market list → existing service inventory. */
export const SERVICE_KEYWORD_ROOTS: readonly ServiceKeywordRoot[] = [
  {
    label: 'Invisible Grills',
    serviceSlug: 'invisible-grills',
    phrases: [
      'invisible grills',
      'invisible grill',
      'transparent grill',
      'balcony invisible grill',
      'window invisible grill',
      'stainless steel invisible grill',
    ],
  },
  {
    label: 'Safety Nets',
    serviceSlug: 'safety-nets',
    phrases: [
      'safety nets',
      'safety net',
      'kids safety net',
      'children safety net',
      'pet safety net',
      'fall protection net',
    ],
  },
  {
    label: 'Balcony Safety Nets',
    serviceSlug: 'balcony-nets',
    defaultIntentSlug: 'for-balcony',
    phrases: [
      'balcony safety nets',
      'balcony safety net',
      'balcony nets',
      'balcony net',
      'balcony protection net',
    ],
  },
  {
    label: 'Bird Nets',
    serviceSlug: 'bird-pigeon-nets',
    defaultIntentSlug: 'bird-control',
    phrases: [
      'bird nets',
      'bird net',
      'anti bird net',
      'anti-bird net',
      'bird protection net',
    ],
  },
  {
    label: 'Pigeon Nets',
    serviceSlug: 'bird-pigeon-nets',
    defaultIntentSlug: 'pigeon-control',
    phrases: [
      'pigeon nets',
      'pigeon net',
      'pigeon safety net',
      'pigeon control net',
    ],
  },
  {
    label: 'Bird Spikes',
    serviceSlug: 'bird-pigeon-nets',
    defaultIntentSlug: 'bird-spikes',
    phrases: ['bird spikes', 'bird spike', 'pigeon spikes', 'anti bird spikes'],
  },
  {
    label: 'Mosquito Nets',
    serviceSlug: 'balcony-nets',
    defaultIntentSlug: 'mosquito-nets',
    phrases: [
      'mosquito nets',
      'mosquito net',
      'balcony mosquito net',
      'window mosquito net',
    ],
  },
  {
    label: 'Sports Nets',
    serviceSlug: 'sports-nets',
    phrases: ['sports nets', 'sports net', 'sports netting', 'playground safety net'],
  },
  {
    label: 'Cricket Nets',
    serviceSlug: 'sports-nets',
    defaultIntentSlug: 'cricket-nets',
    phrases: [
      'cricket nets',
      'cricket net',
      'cricket practice nets',
      'cricket practice net',
      'box cricket net',
    ],
  },
  {
    label: 'Cloth Hangers',
    serviceSlug: 'cloth-hangers',
    phrases: [
      'cloth hangers',
      'cloth hanger',
      'clothes hanger',
      'clothes hangers',
      'balcony cloth hanger',
    ],
  },
  {
    label: 'Ceiling Cloth Dryers',
    serviceSlug: 'cloth-hangers',
    defaultIntentSlug: 'ceiling',
    phrases: [
      'ceiling cloth dryers',
      'ceiling cloth dryer',
      'ceiling cloth hangers',
      'ceiling cloth hanger',
      'ceiling clothes hanger',
      'pulley cloth dryer',
    ],
  },
] as const;

/**
 * Commercial / local modifiers. Aliases collapse synonyms onto one page intent.
 * mintPage:false means resolution-only (already covered by another intent).
 */
export const KEYWORD_MODIFIERS: readonly KeywordModifier[] = [
  // —— Local intent ——
  {
    label: 'Near Me',
    group: 'local',
    intentSlug: 'near-me',
    aliases: [
      'nearby',
      'around me',
      'close by',
      'local',
      'nearest',
      'nearest shop',
      'nearest dealer',
      'nearest company',
      'nearest installer',
      'nearest supplier',
      'nearest service',
      'within 1 km',
      'within 5 km',
    ],
    tier: 2,
    dimension: 'commercial',
  },
  {
    label: 'Same Day',
    group: 'local',
    intentSlug: 'same-day',
    aliases: [
      'open now',
      'available now',
      'today',
      '24 hours',
      '24 hour',
      'fast service',
    ],
    tier: 3,
    dimension: 'speed',
  },
  {
    label: 'Emergency',
    group: 'local',
    intentSlug: 'emergency',
    aliases: ['urgent'],
    tier: 3,
    dimension: 'speed',
  },
  {
    label: 'Doorstep Service',
    group: 'local',
    intentSlug: 'installation',
    aliases: ['doorstep service', 'home visit', 'on site', 'onsite'],
    mintPage: false,
  },

  // —— Quality intent ——
  {
    label: 'Best',
    group: 'quality',
    intentSlug: 'best',
    aliases: [
      'no.1',
      'number one',
      'leading',
      'quality',
      'popular',
      'highly rated',
      'best rated',
      'google rated',
      '5 star rated',
      'customer choice',
      'award winning',
      'most trusted',
    ],
    tier: 1,
  },
  {
    label: 'Top',
    group: 'quality',
    intentSlug: 'top',
    aliases: ['top rated'],
    tier: 1,
  },
  {
    label: 'Trusted',
    group: 'quality',
    intentSlug: 'trusted',
    aliases: ['reliable', 'verified', 'recommended'],
    tier: 2,
  },
  {
    label: 'Professional',
    group: 'quality',
    intentSlug: 'experts',
    aliases: [
      'professional',
      'experienced',
      'expert',
      'specialist',
      'certified',
    ],
    mintPage: false,
  },
  {
    label: 'Premium',
    group: 'quality',
    intentSlug: 'premium',
    aliases: ['luxury', 'premium finish'],
    tier: 2,
  },

  // —— Buying intent ——
  {
    label: 'Price',
    group: 'buying',
    intentSlug: 'price',
    aliases: ['lowest price', 'best price'],
    tier: 1,
  },
  {
    label: 'Cost',
    group: 'buying',
    intentSlug: 'cost',
    tier: 1,
  },
  {
    label: 'Charges',
    group: 'buying',
    intentSlug: 'charges',
    tier: 2,
  },
  {
    label: 'Quote',
    group: 'buying',
    intentSlug: 'quote',
    aliases: ['quotation', 'deal', 'offer', 'discount'],
    tier: 1,
  },
  {
    label: 'Estimate',
    group: 'buying',
    intentSlug: 'estimate',
    aliases: ['budget'],
    tier: 2,
  },
  {
    label: 'Affordable',
    group: 'buying',
    intentSlug: 'affordable',
    aliases: ['cheap'],
    tier: 2,
  },
  {
    label: 'Free Quote',
    group: 'buying',
    intentSlug: 'free-site-visit',
    aliases: [
      'free quote',
      'free estimate',
      'free inspection',
      'free site visit',
    ],
    mintPage: false,
  },
  {
    label: 'Installation Cost',
    group: 'buying',
    intentSlug: 'installation-cost',
    tier: 2,
  },
  {
    label: 'AMC',
    group: 'buying',
    intentSlug: 'amc',
    aliases: ['maintenance cost', 'annual maintenance'],
    tier: 3,
    dimension: 'commercial',
  },
  {
    label: 'Repair Cost',
    group: 'buying',
    intentSlug: 'repair',
    aliases: ['repair cost', 'replacement cost'],
    mintPage: false,
  },

  // —— Service intent ——
  {
    label: 'Installation',
    group: 'service',
    intentSlug: 'installation',
    tier: 1,
  },
  {
    label: 'Repair',
    group: 'service',
    intentSlug: 'repair',
    tier: 1,
  },
  {
    label: 'Replacement',
    group: 'service',
    intentSlug: 'replacement',
    tier: 2,
  },
  {
    label: 'Maintenance',
    group: 'service',
    intentSlug: 'maintenance',
    tier: 1,
  },
  {
    label: 'Cleaning',
    group: 'service',
    intentSlug: 'cleaning',
    tier: 3,
    dimension: 'commercial',
  },
  {
    label: 'Inspection',
    group: 'service',
    intentSlug: 'inspection',
    aliases: ['consultation'],
    tier: 3,
    dimension: 'commercial',
  },
  {
    label: 'Dealer',
    group: 'service',
    intentSlug: 'dealer',
    aliases: ['distributor', 'retailer', 'agency'],
    tier: 2,
  },
  {
    label: 'Supplier',
    group: 'service',
    intentSlug: 'supplier',
    aliases: ['wholesaler', 'exporter'],
    tier: 2,
  },
  {
    label: 'Manufacturer',
    group: 'service',
    intentSlug: 'manufacturer',
    tier: 2,
  },
  {
    label: 'Contractor',
    group: 'service',
    intentSlug: 'contractor',
    tier: 1,
  },
  {
    label: 'Company',
    group: 'service',
    intentSlug: 'company',
    aliases: ['service center', 'service centre'],
    tier: 1,
  },
  {
    label: 'Shop',
    group: 'service',
    intentSlug: 'shop',
    aliases: ['store'],
    tier: 2,
  },
  {
    label: 'Installers',
    group: 'service',
    intentSlug: 'installers',
    tier: 2,
  },

  // —— Property intent ——
  {
    label: 'Apartment',
    group: 'property',
    intentSlug: 'for-apartments',
    aliases: ['flat', 'for apartments', 'for flats'],
    tier: 1,
  },
  {
    label: 'Villa',
    group: 'property',
    intentSlug: 'for-villas',
    aliases: ['duplex'],
    tier: 1,
  },
  {
    label: 'Independent House',
    group: 'property',
    intentSlug: 'for-homes',
    aliases: ['independent house', 'residential', 'for homes'],
    mintPage: false,
  },
  {
    label: 'Office',
    group: 'property',
    intentSlug: 'for-offices',
    aliases: ['commercial', 'office building', 'for offices'],
    tier: 2,
  },
  {
    label: 'School',
    group: 'property',
    intentSlug: 'for-schools',
    aliases: ['college', 'for schools'],
    tier: 2,
  },
  {
    label: 'Hospital',
    group: 'property',
    intentSlug: 'for-hospitals',
    tier: 3,
  },
  {
    label: 'Hotel',
    group: 'property',
    intentSlug: 'for-hotels',
    aliases: ['restaurant'],
    tier: 3,
  },
  {
    label: 'Factory',
    group: 'property',
    intentSlug: 'for-factories',
    aliases: ['warehouse', 'industrial area', 'for factories'],
    tier: 3,
    dimension: 'property-type',
  },
  {
    label: 'High Rise',
    group: 'property',
    intentSlug: 'for-high-rise',
    aliases: ['high rise building', 'construction site'],
    tier: 1,
  },
  {
    label: 'Society',
    group: 'property',
    intentSlug: 'for-society',
    aliases: ['gated community', 'township', 'mall', 'showroom'],
    tier: 2,
    dimension: 'property-type',
  },

  // —— Audience intent ——
  {
    label: 'For Kids',
    group: 'audience',
    intentSlug: 'kids-safety',
    aliases: ['for kids', 'for children'],
    tier: 1,
    serviceSlugs: ['safety-nets', 'balcony-nets', 'invisible-grills'],
  },
  {
    label: 'Child Safety',
    group: 'audience',
    intentSlug: 'child-safety',
    aliases: ['child safe'],
    tier: 1,
  },
  {
    label: 'For Pets',
    group: 'audience',
    intentSlug: 'pet-safety',
    aliases: ['for pets', 'for cats', 'for dogs', 'pet safe'],
    tier: 1,
  },
  {
    label: 'For Birds',
    group: 'audience',
    intentSlug: 'bird-control',
    aliases: ['for birds', 'bird proof', 'pigeon proof'],
    mintPage: false,
    serviceSlugs: ['bird-pigeon-nets', 'safety-nets', 'balcony-nets'],
  },
  {
    label: 'For Families',
    group: 'audience',
    intentSlug: 'for-families',
    aliases: ['for senior citizens', 'for families'],
    tier: 3,
    dimension: 'audience',
  },
  {
    label: 'For Balconies',
    group: 'audience',
    intentSlug: 'for-balcony',
    aliases: ['for balconies', 'for balcony'],
    tier: 1,
  },
  {
    label: 'For Windows',
    group: 'audience',
    intentSlug: 'for-windows',
    aliases: ['for windows'],
    tier: 1,
  },
  {
    label: 'For Terraces',
    group: 'audience',
    intentSlug: 'for-terrace',
    aliases: ['for terraces', 'for terrace'],
    tier: 1,
  },

  // —— Feature intent ——
  {
    label: 'Stainless Steel',
    group: 'feature',
    intentSlug: 'stainless-steel',
    tier: 1,
  },
  {
    label: 'SS316',
    group: 'feature',
    intentSlug: 'ss316',
    tier: 2,
  },
  {
    label: 'SS304',
    group: 'feature',
    intentSlug: 'ss304',
    tier: 2,
  },
  {
    label: 'Nylon',
    group: 'feature',
    intentSlug: 'nylon',
    tier: 2,
    serviceSlugs: [
      'safety-nets',
      'balcony-nets',
      'bird-pigeon-nets',
      'sports-nets',
      'duct-area-safety-nets',
    ],
  },
  {
    label: 'HDPE',
    group: 'feature',
    intentSlug: 'hdpe',
    tier: 2,
    serviceSlugs: [
      'safety-nets',
      'balcony-nets',
      'bird-pigeon-nets',
      'sports-nets',
      'duct-area-safety-nets',
      'building-covering-safety-nets',
    ],
  },
  {
    label: 'UV Protected',
    group: 'feature',
    intentSlug: 'uv-protected',
    aliases: ['weather resistant'],
    tier: 3,
    dimension: 'material',
  },
  {
    label: 'Rust Proof',
    group: 'feature',
    intentSlug: 'stainless-steel',
    aliases: ['rust proof', 'rust-proof'],
    mintPage: false,
  },
  {
    label: 'Heavy Duty',
    group: 'feature',
    intentSlug: 'heavy-duty',
    aliases: ['high strength'],
    tier: 3,
    dimension: 'material',
  },
  {
    label: 'Monkey Proof',
    group: 'feature',
    intentSlug: 'monkey-protection',
    aliases: ['monkey proof'],
    mintPage: false,
  },
  {
    label: 'Custom Size',
    group: 'feature',
    intentSlug: 'custom-size',
    aliases: ['modern design', 'custom size'],
    tier: 3,
    dimension: 'design',
  },
  {
    label: 'Bird Spikes',
    group: 'feature',
    intentSlug: 'bird-spikes',
    tier: 2,
    dimension: 'benefit',
    serviceSlugs: ['bird-pigeon-nets'],
  },
  {
    label: 'Mosquito Nets',
    group: 'feature',
    intentSlug: 'mosquito-nets',
    tier: 2,
    dimension: 'benefit',
    serviceSlugs: ['balcony-nets', 'safety-nets', 'invisible-grills'],
  },

  // —— Brand trust (pages explain evidence — never invent certificates) ——
  {
    label: 'ISO Certified',
    group: 'trust',
    intentSlug: 'iso-certified',
    aliases: [
      'licensed',
      'government approved',
      'gst registered',
      'trusted brand',
      'best reviews',
      'top reviews',
      'highest rated',
      'since 2010',
      '10+ years experience',
      '20+ years experience',
      '1000+ projects',
      '5000+ happy customers',
    ],
    tier: 3,
    dimension: 'trust',
  },

  // —— Action keywords ——
  {
    label: 'Book Now',
    group: 'action',
    intentSlug: 'booking',
    aliases: [
      'call now',
      'get quote',
      'contact now',
      'whatsapp now',
      'enquire now',
      'schedule visit',
      'request callback',
      'order now',
      'hire now',
    ],
    tier: 3,
  },

  // —— Comparison ——
  {
    label: 'Top Companies',
    group: 'comparison',
    intentSlug: 'company',
    aliases: [
      'top companies',
      'top dealers',
      'top installers',
      'top brands',
      'top suppliers',
      'top manufacturers',
      'price comparison',
      'best vs cheap',
      'premium vs standard',
    ],
    mintPage: false,
  },
] as const;

/** Location phrase templates — filled from published geo inventory. */
export const LOCATION_KEYWORD_TEMPLATES = [
  'in {area}',
  'in {city}',
  'in {district}',
  'in {state}',
  'near {landmark}',
  'near metro',
  'near railway station',
  'near airport',
  'near bus stand',
  'near mall',
  'near hospital',
  'near school',
  'near college',
  'near temple',
  'near it park',
  'near industrial area',
  'near highway',
  'near junction',
] as const;

/** Patterns that tend to sound unnatural when stacked — skip in corpus gen. */
export const UNNATURAL_MODIFIER_PAIRS: readonly (readonly [string, string])[] = [
  ['near-me', 'same-day'],
  ['near-me', 'emergency'],
  ['affordable', 'premium'],
  ['cheap', 'luxury'],
  ['iso-certified', 'affordable'],
  ['booking', 'price'],
  ['shop', 'installation'],
];

export function modifiersToRegexPatterns(): readonly {
  readonly pattern: RegExp;
  readonly intentSlug: string;
}[] {
  const rows: { pattern: RegExp; intentSlug: string }[] = [];
  for (const modifier of KEYWORD_MODIFIERS) {
    const phrases = [modifier.label, ...(modifier.aliases ?? [])]
      .map((phrase) => phrase.trim().toLowerCase())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);

    for (const phrase of phrases) {
      const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&').replace(/\s+/gu, '\\s+');
      rows.push({
        pattern: new RegExp(`\\b${escaped}\\b`, 'u'),
        intentSlug: modifier.intentSlug,
      });
    }
  }
  return rows;
}

export function productPhrasesForResolver(): readonly {
  readonly phrase: string;
  readonly serviceSlug: string;
  readonly defaultIntentSlug?: string;
}[] {
  return SERVICE_KEYWORD_ROOTS.flatMap((root) =>
    root.phrases.map((phrase) => ({
      phrase: phrase.toLowerCase(),
      serviceSlug: root.serviceSlug,
      defaultIntentSlug: root.defaultIntentSlug,
    })),
  ).sort((a, b) => b.phrase.length - a.phrase.length);
}
