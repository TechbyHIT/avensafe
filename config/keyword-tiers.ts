/**
 * 11-tier commercial / local keyword system for lead-gen SEO.
 *
 * Templates expand with {Service} and location tokens. Synonyms always map to
 * one canonical intent slug so programmatic pages stay unique.
 */

export type KeywordTierId =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11;

export type KeywordBucket =
  | 'primary'
  | 'secondary'
  | 'commercial'
  | 'transactional'
  | 'local'
  | 'nearMe'
  | 'price'
  | 'installation'
  | 'property'
  | 'problemSolving'
  | 'longTail'
  | 'question'
  | 'lsi'
  | 'semantic'
  | 'related'
  | 'autosuggest'
  | 'peopleAlsoSearch';

export interface KeywordTemplate {
  readonly pattern: string;
  readonly tier: KeywordTierId;
  readonly bucket: KeywordBucket;
  /** Canonical intent; omit = base service page (no intent segment). */
  readonly intentSlug?: string;
  readonly buyingIntent: number;
  readonly commercialIntent: number;
  readonly localIntent: number;
  /** When false, phrase is for clustering/reports only — no new URL. */
  readonly mintPage?: boolean;
}

export const KEYWORD_TIER_LABELS: Record<KeywordTierId, string> = {
  1: 'Highest buying intent',
  2: 'Local SEO',
  3: 'Commercial',
  4: 'Price',
  5: 'Installation',
  6: 'Problem solving',
  7: 'Long tail',
  8: 'Near me',
  9: 'Transactional',
  10: 'Property type',
  11: 'Application',
};

/** All tier patterns — duplicates collapse via normalize+intent map. */
export const KEYWORD_TEMPLATES: readonly KeywordTemplate[] = [
  // —— TIER 1 — highest buying intent ——
  { pattern: '{Service} Near Me', tier: 1, bucket: 'nearMe', intentSlug: 'near-me', buyingIntent: 10, commercialIntent: 9, localIntent: 10 },
  { pattern: 'Best {Service} Near Me', tier: 1, bucket: 'nearMe', intentSlug: 'near-me', buyingIntent: 10, commercialIntent: 10, localIntent: 10 },
  { pattern: 'Top {Service} Near Me', tier: 1, bucket: 'nearMe', intentSlug: 'near-me', buyingIntent: 9, commercialIntent: 9, localIntent: 10 },
  { pattern: '{Service} Installation Near Me', tier: 1, bucket: 'installation', intentSlug: 'installation', buyingIntent: 10, commercialIntent: 10, localIntent: 10 },
  { pattern: '{Service} Installers Near Me', tier: 1, bucket: 'nearMe', intentSlug: 'installers', buyingIntent: 10, commercialIntent: 10, localIntent: 10 },
  { pattern: '{Service} Company Near Me', tier: 1, bucket: 'commercial', intentSlug: 'company', buyingIntent: 9, commercialIntent: 10, localIntent: 10 },
  { pattern: '{Service} Dealer Near Me', tier: 1, bucket: 'commercial', intentSlug: 'dealer', buyingIntent: 9, commercialIntent: 10, localIntent: 10 },
  { pattern: '{Service} Contractor Near Me', tier: 1, bucket: 'commercial', intentSlug: 'contractor', buyingIntent: 9, commercialIntent: 10, localIntent: 10 },
  { pattern: '{Service} Supplier Near Me', tier: 1, bucket: 'commercial', intentSlug: 'supplier', buyingIntent: 8, commercialIntent: 9, localIntent: 10 },
  { pattern: '{Service} Manufacturer Near Me', tier: 1, bucket: 'commercial', intentSlug: 'manufacturer', buyingIntent: 8, commercialIntent: 9, localIntent: 9 },
  { pattern: '{Service} Price', tier: 1, bucket: 'price', intentSlug: 'price', buyingIntent: 10, commercialIntent: 10, localIntent: 6 },
  { pattern: '{Service} Price Near Me', tier: 1, bucket: 'price', intentSlug: 'price', buyingIntent: 10, commercialIntent: 10, localIntent: 10 },
  { pattern: '{Service} Cost', tier: 1, bucket: 'price', intentSlug: 'cost', buyingIntent: 10, commercialIntent: 10, localIntent: 6 },
  { pattern: '{Service} Quote', tier: 1, bucket: 'transactional', intentSlug: 'quote', buyingIntent: 10, commercialIntent: 10, localIntent: 7 },
  { pattern: '{Service} Quotation', tier: 1, bucket: 'transactional', intentSlug: 'quote', buyingIntent: 10, commercialIntent: 10, localIntent: 7 },
  { pattern: '{Service} Estimate', tier: 1, bucket: 'price', intentSlug: 'estimate', buyingIntent: 9, commercialIntent: 9, localIntent: 7 },
  { pattern: 'Book {Service}', tier: 1, bucket: 'transactional', intentSlug: 'booking', buyingIntent: 10, commercialIntent: 10, localIntent: 6 },
  { pattern: 'Buy {Service}', tier: 1, bucket: 'transactional', intentSlug: 'booking', buyingIntent: 10, commercialIntent: 10, localIntent: 5 },
  { pattern: 'Hire {Service}', tier: 1, bucket: 'transactional', intentSlug: 'booking', buyingIntent: 10, commercialIntent: 10, localIntent: 6 },
  { pattern: 'Get {Service}', tier: 1, bucket: 'transactional', intentSlug: 'booking', buyingIntent: 9, commercialIntent: 9, localIntent: 5 },
  { pattern: 'Call {Service}', tier: 1, bucket: 'transactional', intentSlug: 'booking', buyingIntent: 10, commercialIntent: 10, localIntent: 7 },
  { pattern: 'WhatsApp {Service}', tier: 1, bucket: 'transactional', intentSlug: 'booking', buyingIntent: 10, commercialIntent: 10, localIntent: 8 },
  { pattern: 'Free Site Inspection', tier: 1, bucket: 'transactional', intentSlug: 'free-site-visit', buyingIntent: 10, commercialIntent: 9, localIntent: 8 },
  { pattern: 'Book Free Inspection', tier: 1, bucket: 'transactional', intentSlug: 'free-site-visit', buyingIntent: 10, commercialIntent: 9, localIntent: 8 },
  { pattern: 'Same Day Installation', tier: 1, bucket: 'installation', intentSlug: 'same-day', buyingIntent: 9, commercialIntent: 9, localIntent: 8 },
  { pattern: 'Same Day Inspection', tier: 1, bucket: 'transactional', intentSlug: 'same-day', buyingIntent: 9, commercialIntent: 8, localIntent: 8 },

  // —— TIER 2 — local SEO ——
  { pattern: '{Service} in {Area}', tier: 2, bucket: 'local', buyingIntent: 9, commercialIntent: 8, localIntent: 10 },
  { pattern: '{Service} in {Locality}', tier: 2, bucket: 'local', buyingIntent: 9, commercialIntent: 8, localIntent: 10 },
  { pattern: '{Service} in {Colony}', tier: 2, bucket: 'local', buyingIntent: 8, commercialIntent: 7, localIntent: 10 },
  { pattern: '{Service} in {Ward}', tier: 2, bucket: 'local', buyingIntent: 8, commercialIntent: 7, localIntent: 10 },
  { pattern: '{Service} in {Village}', tier: 2, bucket: 'local', buyingIntent: 8, commercialIntent: 7, localIntent: 10 },
  { pattern: '{Service} in {Town}', tier: 2, bucket: 'local', buyingIntent: 8, commercialIntent: 8, localIntent: 10 },
  { pattern: '{Service} in {City}', tier: 2, bucket: 'local', buyingIntent: 9, commercialIntent: 8, localIntent: 10 },
  { pattern: '{Service} in {District}', tier: 2, bucket: 'local', buyingIntent: 7, commercialIntent: 7, localIntent: 9 },
  { pattern: '{Service} in {State}', tier: 2, bucket: 'local', buyingIntent: 6, commercialIntent: 6, localIntent: 8 },
  { pattern: 'Best {Service} in {Area}', tier: 2, bucket: 'local', intentSlug: 'best', buyingIntent: 10, commercialIntent: 10, localIntent: 10 },
  { pattern: 'Top {Service} in {Area}', tier: 2, bucket: 'local', intentSlug: 'top', buyingIntent: 9, commercialIntent: 9, localIntent: 10 },
  { pattern: 'Affordable {Service} in {Area}', tier: 2, bucket: 'local', intentSlug: 'affordable', buyingIntent: 9, commercialIntent: 9, localIntent: 10 },
  { pattern: 'Premium {Service} in {Area}', tier: 2, bucket: 'local', intentSlug: 'premium', buyingIntent: 8, commercialIntent: 9, localIntent: 10 },
  { pattern: '{Service} Installation in {Area}', tier: 2, bucket: 'installation', intentSlug: 'installation', buyingIntent: 10, commercialIntent: 10, localIntent: 10 },
  { pattern: '{Service} Installation in {City}', tier: 2, bucket: 'installation', intentSlug: 'installation', buyingIntent: 10, commercialIntent: 10, localIntent: 10 },
  { pattern: '{Service} Price in {Area}', tier: 2, bucket: 'price', intentSlug: 'price', buyingIntent: 10, commercialIntent: 10, localIntent: 10 },
  { pattern: '{Service} Cost in {Area}', tier: 2, bucket: 'price', intentSlug: 'cost', buyingIntent: 10, commercialIntent: 10, localIntent: 10 },
  { pattern: '{Service} Company in {Area}', tier: 2, bucket: 'commercial', intentSlug: 'company', buyingIntent: 9, commercialIntent: 10, localIntent: 10 },
  { pattern: '{Service} Dealer in {Area}', tier: 2, bucket: 'commercial', intentSlug: 'dealer', buyingIntent: 9, commercialIntent: 10, localIntent: 10 },
  { pattern: '{Service} Contractor in {Area}', tier: 2, bucket: 'commercial', intentSlug: 'contractor', buyingIntent: 9, commercialIntent: 10, localIntent: 10 },
  { pattern: '{Service} Supplier in {Area}', tier: 2, bucket: 'commercial', intentSlug: 'supplier', buyingIntent: 8, commercialIntent: 9, localIntent: 10 },
  { pattern: '{Service} Shop in {Area}', tier: 2, bucket: 'commercial', intentSlug: 'shop', buyingIntent: 8, commercialIntent: 9, localIntent: 10 },
  { pattern: '{Service} Near {Area}', tier: 2, bucket: 'nearMe', intentSlug: 'near-me', buyingIntent: 9, commercialIntent: 8, localIntent: 10 },
  { pattern: '{Service} Near Me {City}', tier: 2, bucket: 'nearMe', intentSlug: 'near-me', buyingIntent: 10, commercialIntent: 9, localIntent: 10 },

  // —— TIER 3 — commercial ——
  { pattern: 'Buy {Service}', tier: 3, bucket: 'commercial', intentSlug: 'booking', buyingIntent: 10, commercialIntent: 10, localIntent: 4 },
  { pattern: 'Book {Service}', tier: 3, bucket: 'commercial', intentSlug: 'booking', buyingIntent: 10, commercialIntent: 10, localIntent: 5 },
  { pattern: 'Hire {Service}', tier: 3, bucket: 'commercial', intentSlug: 'booking', buyingIntent: 10, commercialIntent: 10, localIntent: 5 },
  { pattern: 'Professional {Service}', tier: 3, bucket: 'commercial', intentSlug: 'experts', buyingIntent: 8, commercialIntent: 9, localIntent: 5 },
  { pattern: 'Premium {Service}', tier: 3, bucket: 'commercial', intentSlug: 'premium', buyingIntent: 8, commercialIntent: 9, localIntent: 5 },
  { pattern: 'Affordable {Service}', tier: 3, bucket: 'commercial', intentSlug: 'affordable', buyingIntent: 9, commercialIntent: 9, localIntent: 5 },
  { pattern: 'Top {Service}', tier: 3, bucket: 'commercial', intentSlug: 'top', buyingIntent: 8, commercialIntent: 9, localIntent: 4 },
  { pattern: 'Trusted {Service}', tier: 3, bucket: 'commercial', intentSlug: 'trusted', buyingIntent: 8, commercialIntent: 9, localIntent: 5 },
  { pattern: 'Certified {Service}', tier: 3, bucket: 'commercial', intentSlug: 'iso-certified', buyingIntent: 7, commercialIntent: 8, localIntent: 4, mintPage: false },
  { pattern: 'Authorized {Service}', tier: 3, bucket: 'commercial', intentSlug: 'trusted', buyingIntent: 7, commercialIntent: 8, localIntent: 4, mintPage: false },
  { pattern: 'Leading {Service}', tier: 3, bucket: 'commercial', intentSlug: 'best', buyingIntent: 7, commercialIntent: 8, localIntent: 4, mintPage: false },
  { pattern: 'No.1 {Service}', tier: 3, bucket: 'commercial', intentSlug: 'best', buyingIntent: 8, commercialIntent: 9, localIntent: 4, mintPage: false },
  { pattern: 'Best Rated {Service}', tier: 3, bucket: 'commercial', intentSlug: 'best', buyingIntent: 8, commercialIntent: 9, localIntent: 5 },

  // —— TIER 4 — price ——
  { pattern: '{Service} Price', tier: 4, bucket: 'price', intentSlug: 'price', buyingIntent: 10, commercialIntent: 10, localIntent: 5 },
  { pattern: '{Service} Cost', tier: 4, bucket: 'price', intentSlug: 'cost', buyingIntent: 10, commercialIntent: 10, localIntent: 5 },
  { pattern: '{Service} Charges', tier: 4, bucket: 'price', intentSlug: 'charges', buyingIntent: 9, commercialIntent: 9, localIntent: 5 },
  { pattern: '{Service} Price List', tier: 4, bucket: 'price', intentSlug: 'price-list', buyingIntent: 9, commercialIntent: 9, localIntent: 5 },
  { pattern: '{Service} Price Per Sq Ft', tier: 4, bucket: 'price', intentSlug: 'per-sq-ft', buyingIntent: 9, commercialIntent: 10, localIntent: 5 },
  { pattern: '{Service} Price Calculator', tier: 4, bucket: 'price', intentSlug: 'price', buyingIntent: 8, commercialIntent: 9, localIntent: 4, mintPage: false },
  { pattern: '{Service} Estimate', tier: 4, bucket: 'price', intentSlug: 'estimate', buyingIntent: 9, commercialIntent: 9, localIntent: 5 },
  { pattern: '{Service} Quotation', tier: 4, bucket: 'price', intentSlug: 'quote', buyingIntent: 10, commercialIntent: 10, localIntent: 5 },
  { pattern: 'Cheap {Service}', tier: 4, bucket: 'price', intentSlug: 'affordable', buyingIntent: 8, commercialIntent: 8, localIntent: 4 },
  { pattern: 'Affordable {Service}', tier: 4, bucket: 'price', intentSlug: 'affordable', buyingIntent: 9, commercialIntent: 9, localIntent: 4 },
  { pattern: 'Premium {Service}', tier: 4, bucket: 'price', intentSlug: 'premium', buyingIntent: 7, commercialIntent: 8, localIntent: 4 },
  { pattern: 'Best Price {Service}', tier: 4, bucket: 'price', intentSlug: 'price', buyingIntent: 9, commercialIntent: 9, localIntent: 4 },

  // —— TIER 5 — installation ——
  { pattern: '{Service} Installation', tier: 5, bucket: 'installation', intentSlug: 'installation', buyingIntent: 10, commercialIntent: 10, localIntent: 5 },
  { pattern: 'Professional {Service} Installation', tier: 5, bucket: 'installation', intentSlug: 'installation', buyingIntent: 9, commercialIntent: 9, localIntent: 5 },
  { pattern: 'Expert {Service} Installation', tier: 5, bucket: 'installation', intentSlug: 'installation', buyingIntent: 9, commercialIntent: 9, localIntent: 5 },
  { pattern: 'Same Day {Service} Installation', tier: 5, bucket: 'installation', intentSlug: 'same-day', buyingIntent: 9, commercialIntent: 9, localIntent: 7 },
  { pattern: 'Fast {Service} Installation', tier: 5, bucket: 'installation', intentSlug: 'same-day', buyingIntent: 8, commercialIntent: 8, localIntent: 6 },
  { pattern: 'Emergency {Service} Installation', tier: 5, bucket: 'installation', intentSlug: 'emergency', buyingIntent: 9, commercialIntent: 9, localIntent: 7 },
  { pattern: 'Apartment {Service} Installation', tier: 5, bucket: 'installation', intentSlug: 'for-apartments', buyingIntent: 9, commercialIntent: 9, localIntent: 6 },
  { pattern: 'Villa {Service} Installation', tier: 5, bucket: 'installation', intentSlug: 'for-villas', buyingIntent: 8, commercialIntent: 8, localIntent: 6 },
  { pattern: 'Balcony {Service} Installation', tier: 5, bucket: 'installation', intentSlug: 'for-balcony', buyingIntent: 10, commercialIntent: 9, localIntent: 6 },
  { pattern: 'Window {Service} Installation', tier: 5, bucket: 'installation', intentSlug: 'for-windows', buyingIntent: 9, commercialIntent: 9, localIntent: 6 },
  { pattern: 'Terrace {Service} Installation', tier: 5, bucket: 'installation', intentSlug: 'for-terrace', buyingIntent: 8, commercialIntent: 8, localIntent: 6 },
  { pattern: 'Duct {Service} Installation', tier: 5, bucket: 'installation', intentSlug: 'for-ducts', buyingIntent: 8, commercialIntent: 8, localIntent: 6 },
  { pattern: 'Commercial {Service} Installation', tier: 5, bucket: 'installation', intentSlug: 'for-offices', buyingIntent: 8, commercialIntent: 9, localIntent: 5 },
  { pattern: 'High Rise {Service} Installation', tier: 5, bucket: 'installation', intentSlug: 'for-high-rise', buyingIntent: 9, commercialIntent: 9, localIntent: 6 },

  // —— TIER 6 — problem solving ——
  { pattern: 'Child Safety {Service}', tier: 6, bucket: 'problemSolving', intentSlug: 'child-safety', buyingIntent: 9, commercialIntent: 8, localIntent: 5 },
  { pattern: 'Kids Safety {Service}', tier: 6, bucket: 'problemSolving', intentSlug: 'kids-safety', buyingIntent: 9, commercialIntent: 8, localIntent: 5 },
  { pattern: 'Pet Safety {Service}', tier: 6, bucket: 'problemSolving', intentSlug: 'pet-safety', buyingIntent: 9, commercialIntent: 8, localIntent: 5 },
  { pattern: 'Fall Protection {Service}', tier: 6, bucket: 'problemSolving', intentSlug: 'fall-protection', buyingIntent: 9, commercialIntent: 8, localIntent: 5 },
  { pattern: 'Bird Protection {Service}', tier: 6, bucket: 'problemSolving', intentSlug: 'bird-protection', buyingIntent: 8, commercialIntent: 8, localIntent: 5 },
  { pattern: 'Pigeon Protection {Service}', tier: 6, bucket: 'problemSolving', intentSlug: 'pigeon-control', buyingIntent: 8, commercialIntent: 8, localIntent: 5 },
  { pattern: 'Monkey Protection {Service}', tier: 6, bucket: 'problemSolving', intentSlug: 'monkey-protection', buyingIntent: 8, commercialIntent: 8, localIntent: 5 },
  { pattern: 'Anti Rust {Service}', tier: 6, bucket: 'problemSolving', intentSlug: 'stainless-steel', buyingIntent: 7, commercialIntent: 7, localIntent: 4 },
  { pattern: 'Rust Proof {Service}', tier: 6, bucket: 'problemSolving', intentSlug: 'stainless-steel', buyingIntent: 7, commercialIntent: 7, localIntent: 4 },
  { pattern: 'Weather Resistant {Service}', tier: 6, bucket: 'problemSolving', intentSlug: 'uv-protected', buyingIntent: 7, commercialIntent: 7, localIntent: 4 },
  { pattern: 'UV Resistant {Service}', tier: 6, bucket: 'problemSolving', intentSlug: 'uv-protected', buyingIntent: 7, commercialIntent: 7, localIntent: 4 },
  { pattern: 'Marine Grade {Service}', tier: 6, bucket: 'problemSolving', intentSlug: 'ss316', buyingIntent: 8, commercialIntent: 8, localIntent: 5 },
  { pattern: 'SS304 {Service}', tier: 6, bucket: 'problemSolving', intentSlug: 'ss304', buyingIntent: 7, commercialIntent: 8, localIntent: 4 },
  { pattern: 'SS316 {Service}', tier: 6, bucket: 'problemSolving', intentSlug: 'ss316', buyingIntent: 8, commercialIntent: 8, localIntent: 4 },

  // —— TIER 7 — long tail ——
  { pattern: 'Best {Service} Installers Near Me', tier: 7, bucket: 'longTail', intentSlug: 'installers', buyingIntent: 10, commercialIntent: 10, localIntent: 10 },
  { pattern: 'Best {Service} Company', tier: 7, bucket: 'longTail', intentSlug: 'company', buyingIntent: 9, commercialIntent: 10, localIntent: 5 },
  { pattern: 'Best {Service} Contractor', tier: 7, bucket: 'longTail', intentSlug: 'contractor', buyingIntent: 9, commercialIntent: 10, localIntent: 5 },
  { pattern: 'Best {Service} Dealer', tier: 7, bucket: 'longTail', intentSlug: 'dealer', buyingIntent: 9, commercialIntent: 10, localIntent: 5 },
  { pattern: 'Best {Service} Supplier', tier: 7, bucket: 'longTail', intentSlug: 'supplier', buyingIntent: 8, commercialIntent: 9, localIntent: 5 },
  { pattern: 'Free {Service} Inspection', tier: 7, bucket: 'longTail', intentSlug: 'free-site-visit', buyingIntent: 10, commercialIntent: 9, localIntent: 7 },
  { pattern: 'Book {Service} Inspection', tier: 7, bucket: 'longTail', intentSlug: 'inspection', buyingIntent: 10, commercialIntent: 9, localIntent: 7 },
  { pattern: '{Service} Quote Near Me', tier: 7, bucket: 'longTail', intentSlug: 'quote', buyingIntent: 10, commercialIntent: 10, localIntent: 10 },
  { pattern: 'Affordable {Service} Near Me', tier: 7, bucket: 'longTail', intentSlug: 'affordable', buyingIntent: 9, commercialIntent: 9, localIntent: 10 },
  { pattern: 'Premium {Service} Near Me', tier: 7, bucket: 'longTail', intentSlug: 'premium', buyingIntent: 8, commercialIntent: 9, localIntent: 10 },
  { pattern: 'Trusted {Service} Near Me', tier: 7, bucket: 'longTail', intentSlug: 'trusted', buyingIntent: 9, commercialIntent: 9, localIntent: 10 },

  // —— TIER 8 — near me variants ——
  { pattern: 'Closest {Service}', tier: 8, bucket: 'nearMe', intentSlug: 'near-me', buyingIntent: 9, commercialIntent: 8, localIntent: 10 },
  { pattern: 'Nearby {Service}', tier: 8, bucket: 'nearMe', intentSlug: 'near-me', buyingIntent: 9, commercialIntent: 8, localIntent: 10 },
  { pattern: 'Nearby {Service} Company', tier: 8, bucket: 'nearMe', intentSlug: 'company', buyingIntent: 9, commercialIntent: 9, localIntent: 10 },
  { pattern: 'Nearby {Service} Dealer', tier: 8, bucket: 'nearMe', intentSlug: 'dealer', buyingIntent: 9, commercialIntent: 9, localIntent: 10 },
  { pattern: 'Nearby {Service} Contractor', tier: 8, bucket: 'nearMe', intentSlug: 'contractor', buyingIntent: 9, commercialIntent: 9, localIntent: 10 },
  { pattern: 'Nearby {Service} Installers', tier: 8, bucket: 'nearMe', intentSlug: 'installers', buyingIntent: 10, commercialIntent: 10, localIntent: 10 },
  { pattern: 'Local {Service}', tier: 8, bucket: 'nearMe', intentSlug: 'near-me', buyingIntent: 8, commercialIntent: 8, localIntent: 10 },
  { pattern: 'Local {Service} Company', tier: 8, bucket: 'nearMe', intentSlug: 'company', buyingIntent: 9, commercialIntent: 9, localIntent: 10 },
  { pattern: 'Local {Service} Dealer', tier: 8, bucket: 'nearMe', intentSlug: 'dealer', buyingIntent: 9, commercialIntent: 9, localIntent: 10 },
  { pattern: 'Local {Service} Contractor', tier: 8, bucket: 'nearMe', intentSlug: 'contractor', buyingIntent: 9, commercialIntent: 9, localIntent: 10 },
  { pattern: 'Local {Service} Experts', tier: 8, bucket: 'nearMe', intentSlug: 'experts', buyingIntent: 8, commercialIntent: 9, localIntent: 10 },

  // —— TIER 9 — transactional CTAs (clustered; resolve to booking/quote) ——
  { pattern: 'Call Now', tier: 9, bucket: 'transactional', intentSlug: 'booking', buyingIntent: 10, commercialIntent: 10, localIntent: 6, mintPage: false },
  { pattern: 'Book Now', tier: 9, bucket: 'transactional', intentSlug: 'booking', buyingIntent: 10, commercialIntent: 10, localIntent: 6, mintPage: false },
  { pattern: 'Contact Now', tier: 9, bucket: 'transactional', intentSlug: 'booking', buyingIntent: 10, commercialIntent: 10, localIntent: 6, mintPage: false },
  { pattern: 'WhatsApp Now', tier: 9, bucket: 'transactional', intentSlug: 'booking', buyingIntent: 10, commercialIntent: 10, localIntent: 7, mintPage: false },
  { pattern: 'Get Quote', tier: 9, bucket: 'transactional', intentSlug: 'quote', buyingIntent: 10, commercialIntent: 10, localIntent: 6, mintPage: false },
  { pattern: 'Request Quote', tier: 9, bucket: 'transactional', intentSlug: 'quote', buyingIntent: 10, commercialIntent: 10, localIntent: 6, mintPage: false },
  { pattern: 'Free Estimate', tier: 9, bucket: 'transactional', intentSlug: 'estimate', buyingIntent: 10, commercialIntent: 9, localIntent: 6, mintPage: false },
  { pattern: 'Schedule Inspection', tier: 9, bucket: 'transactional', intentSlug: 'inspection', buyingIntent: 10, commercialIntent: 9, localIntent: 7, mintPage: false },
  { pattern: 'Book Site Visit', tier: 9, bucket: 'transactional', intentSlug: 'free-site-visit', buyingIntent: 10, commercialIntent: 9, localIntent: 7, mintPage: false },
  { pattern: 'Free Consultation', tier: 9, bucket: 'transactional', intentSlug: 'free-site-visit', buyingIntent: 9, commercialIntent: 8, localIntent: 6, mintPage: false },
  { pattern: 'Contact Installers', tier: 9, bucket: 'transactional', intentSlug: 'installers', buyingIntent: 10, commercialIntent: 10, localIntent: 7, mintPage: false },

  // —— TIER 10 — property ——
  { pattern: '{Service} for Apartments', tier: 10, bucket: 'property', intentSlug: 'for-apartments', buyingIntent: 9, commercialIntent: 8, localIntent: 5 },
  { pattern: '{Service} for Flats', tier: 10, bucket: 'property', intentSlug: 'for-flats', buyingIntent: 9, commercialIntent: 8, localIntent: 5 },
  { pattern: '{Service} for Villas', tier: 10, bucket: 'property', intentSlug: 'for-villas', buyingIntent: 8, commercialIntent: 8, localIntent: 5 },
  { pattern: '{Service} for Independent Houses', tier: 10, bucket: 'property', intentSlug: 'for-homes', buyingIntent: 8, commercialIntent: 8, localIntent: 5 },
  { pattern: '{Service} for Duplex', tier: 10, bucket: 'property', intentSlug: 'for-villas', buyingIntent: 7, commercialIntent: 7, localIntent: 5 },
  { pattern: '{Service} for Commercial Buildings', tier: 10, bucket: 'property', intentSlug: 'for-offices', buyingIntent: 8, commercialIntent: 9, localIntent: 5 },
  { pattern: '{Service} for Offices', tier: 10, bucket: 'property', intentSlug: 'for-offices', buyingIntent: 8, commercialIntent: 9, localIntent: 5 },
  { pattern: '{Service} for Schools', tier: 10, bucket: 'property', intentSlug: 'for-schools', buyingIntent: 7, commercialIntent: 8, localIntent: 5 },
  { pattern: '{Service} for Hospitals', tier: 10, bucket: 'property', intentSlug: 'for-hospitals', buyingIntent: 7, commercialIntent: 8, localIntent: 5 },
  { pattern: '{Service} for Hotels', tier: 10, bucket: 'property', intentSlug: 'for-hotels', buyingIntent: 7, commercialIntent: 8, localIntent: 5 },

  // —— TIER 11 — application ——
  { pattern: '{Service} for Balcony', tier: 11, bucket: 'property', intentSlug: 'for-balcony', buyingIntent: 10, commercialIntent: 9, localIntent: 5 },
  { pattern: '{Service} for Window', tier: 11, bucket: 'property', intentSlug: 'for-windows', buyingIntent: 9, commercialIntent: 9, localIntent: 5 },
  { pattern: '{Service} for Terrace', tier: 11, bucket: 'property', intentSlug: 'for-terrace', buyingIntent: 8, commercialIntent: 8, localIntent: 5 },
  { pattern: '{Service} for Staircase', tier: 11, bucket: 'property', intentSlug: 'for-homes', buyingIntent: 7, commercialIntent: 7, localIntent: 5 },
  { pattern: '{Service} for Duct Area', tier: 11, bucket: 'property', intentSlug: 'for-ducts', buyingIntent: 8, commercialIntent: 8, localIntent: 5 },
  { pattern: '{Service} for Utility Area', tier: 11, bucket: 'property', intentSlug: 'for-ducts', buyingIntent: 7, commercialIntent: 7, localIntent: 5 },
  { pattern: '{Service} for Child Safety', tier: 11, bucket: 'problemSolving', intentSlug: 'child-safety', buyingIntent: 9, commercialIntent: 8, localIntent: 5 },
  { pattern: '{Service} for Pet Safety', tier: 11, bucket: 'problemSolving', intentSlug: 'pet-safety', buyingIntent: 9, commercialIntent: 8, localIntent: 5 },
  { pattern: '{Service} for Fall Protection', tier: 11, bucket: 'problemSolving', intentSlug: 'fall-protection', buyingIntent: 9, commercialIntent: 8, localIntent: 5 },
  { pattern: '{Service} for Pigeon Control', tier: 11, bucket: 'problemSolving', intentSlug: 'pigeon-control', buyingIntent: 8, commercialIntent: 8, localIntent: 5 },
] as const;

export function templatesByTier(tier: KeywordTierId): readonly KeywordTemplate[] {
  return KEYWORD_TEMPLATES.filter((template) => template.tier === tier);
}
