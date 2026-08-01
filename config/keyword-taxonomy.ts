/**
 * Maps long-tail search phrases to canonical programmatic URLs.
 *
 * We do not create one page per keyword line — Google treats that as duplicate
 * spam. Synonyms and plural forms collapse to:
 *
 *   /{state}/{city}/{service}           — primary service-in-city
 *   /{state}/{city}/{service}/{intent}  — high-intent modifier
 *
 * Run `npm run report:keywords` to measure how many sample phrases resolve.
 */

export interface KeywordProductRule {
  readonly serviceSlug: string;
  /** Substrings matched case-insensitively (longest product checked first). */
  readonly phrases: readonly string[];
}

/** Longest phrases first so "balcony invisible grill" beats "invisible grill". */
export const KEYWORD_PRODUCTS: readonly KeywordProductRule[] = [
  {
    serviceSlug: 'duct-area-safety-nets',
    phrases: ['duct area safety net', 'duct area safety nets', 'duct area net', 'duct area nets'],
  },
  {
    serviceSlug: 'building-covering-safety-nets',
    phrases: ['building covering safety net', 'building covering safety nets'],
  },
  {
    serviceSlug: 'sports-nets',
    phrases: [
      'cricket practice net',
      'cricket practice nets',
      'cricket net for practice',
      'cricket practice',
      'cricket net',
      'cricket nets',
      'sports netting',
      'sports net',
      'sports nets',
    ],
  },
  {
    serviceSlug: 'cloth-hangers',
    phrases: [
      'ceiling cloth hanger',
      'ceiling cloth hangers',
      'balcony cloth hanger',
      'cloth drying hanger',
      'clothes drying hanger',
      'clothes hanger',
      'clothes hangers',
      'cloth drying hanger',
      'cloth hanger',
      'cloth hangers',
    ],
  },
  {
    serviceSlug: 'safety-nets',
    phrases: [
      'balcony safety nets',
      'balcony safety net',
      'balcony net for child safety',
      'balcony net for kids safety',
      'balcony net for pets',
      'balcony net for cats',
      'balcony net for dogs',
      'balcony net for pigeons',
      'balcony bird net',
      'balcony nets',
      'balcony net',
      'safety net for balcony',
      'window safety net',
      'terrace safety net',
      'staircase safety net',
      'kids safety net',
      'child safety net',
      'children safety net',
      'baby safety net',
      'pet safety net',
      'safety net',
      'safety nets',
    ],
  },
  {
    serviceSlug: 'invisible-grills',
    phrases: [
      '316 stainless steel invisible grill',
      '316 ss invisible grill',
      'stainless steel invisible grill',
      'ss invisible grill',
      'invisible grill for balcony',
      'invisible grill for window',
      'invisible balcony grill',
      'invisible window grill',
      'balcony invisible grill',
      'window invisible grill',
      'transparent balcony grill',
      'transparent window grill',
      'transparent grill',
      'balcony grill design',
      'window grill design',
      'invisible grill design',
      'invisible grill designs',
      'modern balcony grill',
      'modern window grill',
      'balcony safety grill',
      'window safety grill',
      'invisible grill wire',
      'invisible grill cable',
      'invisible grill',
      'invisible grills',
    ],
  },
];

/**
 * Intent slug chosen when a phrase contains any of these tokens (first match wins).
 * Application modifiers are checked before pricing and commercial modifiers.
 */
export const KEYWORD_INTENT_RULES: readonly {
  readonly intentSlug: string;
  readonly patterns: readonly RegExp[];
}[] = [
  {
    intentSlug: 'for-child-safety',
    patterns: [
      /\bfor kids safety\b/u,
      /\bfor child safety\b/u,
      /\bfor baby safety\b/u,
      /\bkids safety\b/u,
      /\bchild safety\b/u,
      /\bbaby safety\b/u,
    ],
  },
  {
    intentSlug: 'for-pets',
    patterns: [/\bfor pets\b/u, /\bfor cats\b/u, /\bfor dogs\b/u, /\bpet safety\b/u],
  },
  {
    intentSlug: 'for-pigeon-protection',
    patterns: [
      /\bfor pigeon protection\b/u,
      /\bfor bird protection\b/u,
      /\bpigeon protection\b/u,
      /\bbird protection\b/u,
      /\bpigeon control\b/u,
      /\bbird control\b/u,
    ],
  },
  {
    intentSlug: 'for-fall-protection',
    patterns: [/\bfor fall protection\b/u, /\bfall protection\b/u],
  },
  {
    intentSlug: 'for-balcony',
    patterns: [/\bfor balcony\b/u, /\bfor balconies\b/u, /\bbalcony installation\b/u],
  },
  {
    intentSlug: 'for-windows',
    patterns: [/\bfor window\b/u, /\bfor windows\b/u],
  },
  {
    intentSlug: 'for-terrace',
    patterns: [/\bfor terrace\b/u],
  },
  {
    intentSlug: 'for-flats',
    patterns: [/\bfor flats\b/u, /\bfor apartment\b/u, /\bfor apartments\b/u],
  },
  {
    intentSlug: 'for-high-rise',
    patterns: [/\bfor high rise building\b/u, /\bfor high rise\b/u, /\bhigh rise\b/u],
  },
  {
    intentSlug: 'without-drilling',
    patterns: [/\bwithout drilling\b/u],
  },
  {
    intentSlug: 'stainless-steel',
    patterns: [/\b316 ss\b/u, /\b316 stainless\b/u, /\bstainless steel\b/u, /\bss invisible\b/u],
  },
  {
    intentSlug: 'anti-rust',
    patterns: [/\banti rust\b/u, /\banti-rust\b/u],
  },
  {
    intentSlug: 'per-sq-ft',
    patterns: [
      /\bper sq ft\b/u,
      /\bper square feet\b/u,
      /\bcost per square feet\b/u,
      /\bper sq ft price\b/u,
    ],
  },
  {
    intentSlug: 'price-list',
    patterns: [/\bprice list\b/u],
  },
  {
    intentSlug: 'installation-cost',
    patterns: [/\binstallation cost\b/u],
  },
  {
    intentSlug: 'quote',
    patterns: [/\bquote\b/u, /\bestimate\b/u, /\bbooking\b/u],
  },
  {
    intentSlug: 'rate',
    patterns: [/\brate\b/u, /\bcharges\b/u],
  },
  {
    intentSlug: 'cost',
    patterns: [/\bcost\b/u, /\blow cost\b/u],
  },
  {
    intentSlug: 'price',
    patterns: [/\bprice\b/u],
  },
  {
    intentSlug: 'installers',
    patterns: [/\binstallers\b/u, /\binstaller\b/u],
  },
  {
    intentSlug: 'shop',
    patterns: [/\bshop\b/u, /\bstore\b/u, /\bonline\b/u],
  },
  {
    intentSlug: 'affordable',
    patterns: [/\baffordable\b/u, /\bcheap\b/u],
  },
  {
    intentSlug: 'premium',
    patterns: [/\bpremium\b/u, /\bhigh quality\b/u, /\bdurable\b/u, /\bstrong\b/u, /\btop\b/u],
  },
  {
    intentSlug: 'best',
    patterns: [/\bbest\b/u, /\bsafe\b/u],
  },
  {
    intentSlug: 'design',
    patterns: [/\bdesigns\b/u, /\bdesign\b/u, /\bideas\b/u],
  },
  {
    intentSlug: 'material',
    patterns: [/\bmaterial\b/u, /\baccessories\b/u, /\bnylon\b/u, /\bhdpe\b/u],
  },
  {
    intentSlug: 'fitting',
    patterns: [/\bfitting\b/u, /\bfixing\b/u, /\bsetup\b/u],
  },
  {
    intentSlug: 'installation',
    patterns: [
      /\bprofessional installation\b/u,
      /\bwith installation\b/u,
      /\bhome installation\b/u,
      /\bapartment installation\b/u,
      /\binstallation\b/u,
    ],
  },
  {
    intentSlug: 'maintenance',
    patterns: [/\bmaintenance\b/u],
  },
  {
    intentSlug: 'replacement',
    patterns: [/\breplacement\b/u],
  },
  {
    intentSlug: 'repair',
    patterns: [/\brepair\b/u],
  },
  {
    intentSlug: 'contractor',
    patterns: [/\bcontractors\b/u, /\bcontractor\b/u],
  },
  {
    intentSlug: 'company',
    patterns: [/\bcompanies\b/u, /\bcompany\b/u],
  },
  {
    intentSlug: 'dealer',
    patterns: [/\bdealers\b/u, /\bdealer\b/u],
  },
  {
    intentSlug: 'supplier',
    patterns: [/\bsuppliers\b/u, /\bsupplier\b/u],
  },
  {
    intentSlug: 'manufacturer',
    patterns: [/\bmanufacturers\b/u, /\bmanufacturer\b/u],
  },
  {
    intentSlug: 'installers',
    patterns: [/\binstallers\b/u, /\binstaller\b/u, /\bservices\b/u, /\bservice\b/u],
  },
  {
    intentSlug: 'residential',
    patterns: [/\bresidential\b/u, /\bfor home\b/u, /\bfor house\b/u],
  },
  {
    intentSlug: 'commercial',
    patterns: [/\bcommercial\b/u],
  },
  {
    intentSlug: 'custom',
    patterns: [/\bcustomized\b/u, /\bcustom\b/u, /\bsolution\b/u, /\bsolutions\b/u],
  },
];
