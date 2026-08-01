/**
 * Official Indian administrative / geographic hierarchy for programmatic SEO.
 *
 * Not every level becomes an indexable URL. Pages are generated only for levels
 * marked `generatesPages: true` when a real, validated data row exists and the
 * publishing gate clears. Deeper levels (streets, societies, PIN codes) attach
 * as fields or `locationKind` on locality rows until they have enough unique
 * content to stand alone.
 *
 * Canonical service×locality URL (current, stable):
 *   /{state}/{city}/{area}/{service}
 *
 * District hubs (added):
 *   /{state}/district/{district}
 *   /{state}/district/{district}/{service}
 *
 * Nested /{state}/{district}/{city}/… migration is deferred: city and district
 * slugs collide (e.g. Hyderabad), and rewriting ~250k+ URLs needs a redirect map.
 */

export const LOCATION_HIERARCHY = [
  { level: 'country', label: 'Country', generatesPages: false, dataFile: null },
  { level: 'state', label: 'State / Union Territory', generatesPages: true, dataFile: 'states.json' },
  { level: 'region', label: 'Region', generatesPages: false, dataFile: null },
  { level: 'district', label: 'District', generatesPages: true, dataFile: 'districts.json' },
  { level: 'revenue-division', label: 'Revenue Division', generatesPages: false, dataFile: null },
  { level: 'sub-division', label: 'Sub-Division', generatesPages: false, dataFile: null },
  { level: 'mandal', label: 'Mandal / Taluk / Tehsil / Block', generatesPages: false, dataFile: null },
  { level: 'municipal-corporation', label: 'Municipal Corporation', generatesPages: false, dataFile: null },
  { level: 'municipality', label: 'Municipality', generatesPages: false, dataFile: null },
  { level: 'nagar-panchayat', label: 'Nagar Panchayat', generatesPages: false, dataFile: null },
  { level: 'cantonment-board', label: 'Cantonment Board', generatesPages: false, dataFile: null },
  { level: 'city', label: 'City', generatesPages: true, dataFile: 'cities.json' },
  { level: 'town', label: 'Town', generatesPages: false, dataFile: 'areas.json' },
  { level: 'census-town', label: 'Census Town', generatesPages: false, dataFile: 'areas.json' },
  { level: 'village', label: 'Village', generatesPages: false, dataFile: 'areas.json' },
  { level: 'gram-panchayat', label: 'Gram Panchayat', generatesPages: false, dataFile: null },
  { level: 'ward', label: 'Ward', generatesPages: false, dataFile: 'areas.json' },
  { level: 'area', label: 'Area / Locality', generatesPages: true, dataFile: 'areas.json' },
  { level: 'locality', label: 'Locality', generatesPages: false, dataFile: 'areas.json' },
  { level: 'colony', label: 'Colony', generatesPages: false, dataFile: 'areas.json' },
  { level: 'layout', label: 'Layout', generatesPages: false, dataFile: 'areas.json' },
  { level: 'residential-area', label: 'Residential Area', generatesPages: false, dataFile: 'areas.json' },
  { level: 'commercial-area', label: 'Commercial Area', generatesPages: false, dataFile: 'areas.json' },
  { level: 'industrial-area', label: 'Industrial Area', generatesPages: false, dataFile: 'areas.json' },
  { level: 'it-park', label: 'IT Park', generatesPages: false, dataFile: 'areas.json' },
  { level: 'sez', label: 'SEZ', generatesPages: false, dataFile: 'areas.json' },
  { level: 'apartment', label: 'Apartment', generatesPages: false, dataFile: 'areas.json' },
  { level: 'gated-community', label: 'Gated Community', generatesPages: false, dataFile: 'areas.json' },
  { level: 'society', label: 'Society', generatesPages: false, dataFile: 'areas.json' },
  { level: 'street', label: 'Street', generatesPages: false, dataFile: null },
  { level: 'road', label: 'Road', generatesPages: false, dataFile: null },
  { level: 'landmark', label: 'Landmark', generatesPages: false, dataFile: 'areas.json' },
  { level: 'pincode', label: 'PIN Code', generatesPages: false, dataFile: null },
  { level: 'service', label: 'Service', generatesPages: true, dataFile: 'services.json' },
] as const;

export type HierarchyLevel = (typeof LOCATION_HIERARCHY)[number]['level'];

/** Labels stored on area / future admin rows (`locationKind`). */
export const LOCATION_KINDS = [
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
] as const;

export type LocationKind = (typeof LOCATION_KINDS)[number];
