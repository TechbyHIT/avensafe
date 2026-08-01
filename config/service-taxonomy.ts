/**
 * The eight main service families. Every child maps to a unique intent slug so
 * `/services/{service}/{intent}` is a distinct page (no shared hub for all
 * subsections). Mega-menu, coverage UI, and inventory all read from here.
 */

export interface TaxonomyChild {
  readonly label: string;
  /** Intent slug under the parent service. Required for a dedicated page. */
  readonly intentSlug: string;
}

export interface ServiceFamily {
  readonly heading: string;
  readonly serviceSlug: string;
  readonly children: readonly TaxonomyChild[];
}

export const SERVICE_TAXONOMY: readonly ServiceFamily[] = [
  {
    heading: 'Invisible Grills',
    serviceSlug: 'invisible-grills',
    children: [
      { label: 'Balcony Invisible Grills', intentSlug: 'for-balcony' },
      { label: 'Window Invisible Grills', intentSlug: 'for-windows' },
      { label: 'Invisible Grills for Apartments', intentSlug: 'for-apartments' },
      { label: 'Invisible Grills for Societies', intentSlug: 'for-society' },
      { label: 'Invisible Grills for Villas', intentSlug: 'for-villas' },
      { label: 'Child Safety Invisible Grills', intentSlug: 'child-safety' },
      { label: 'Pet Safety Invisible Grills', intentSlug: 'pet-safety' },
      { label: 'Stainless Steel Invisible Grills', intentSlug: 'stainless-steel' },
      { label: 'Invisible Grill Installation', intentSlug: 'installation' },
      { label: 'Invisible Grill Price', intentSlug: 'price' },
      { label: 'High Rise Invisible Grills', intentSlug: 'for-high-rise' },
    ],
  },
  {
    heading: 'Safety Nets',
    serviceSlug: 'safety-nets',
    children: [
      { label: 'Balcony Safety Nets', intentSlug: 'for-balcony' },
      { label: 'Kids Safety Nets', intentSlug: 'kids-safety' },
      { label: 'Children Safety Nets', intentSlug: 'child-safety' },
      { label: 'Pet Safety Nets', intentSlug: 'pet-safety' },
      { label: 'Society Safety Nets', intentSlug: 'for-society' },
      { label: 'Terrace Safety Nets', intentSlug: 'for-terrace' },
      { label: 'High Rise Safety Nets', intentSlug: 'for-high-rise' },
      { label: 'Fall Protection Nets', intentSlug: 'fall-protection' },
      { label: 'Monkey Safety Nets', intentSlug: 'monkey-protection' },
      { label: 'Staircase Safety Nets', intentSlug: 'for-staircase' },
      { label: 'Safety Net Installation', intentSlug: 'installation' },
      { label: 'Safety Net Price', intentSlug: 'price' },
      { label: 'Safety Net Repair', intentSlug: 'repair' },
    ],
  },
  {
    heading: 'Balcony Nets',
    serviceSlug: 'balcony-nets',
    children: [
      { label: 'Balcony Protection Nets', intentSlug: 'for-balcony' },
      { label: 'Apartment Balcony Nets', intentSlug: 'for-apartments' },
      { label: 'Society Balcony Nets', intentSlug: 'for-society' },
      { label: 'High Rise Balcony Nets', intentSlug: 'for-high-rise' },
      { label: 'Balcony Children Safety', intentSlug: 'child-safety' },
      { label: 'Balcony Pet Safety', intentSlug: 'pet-safety' },
      { label: 'Transparent Balcony Nets', intentSlug: 'transparent-nets' },
      { label: 'Monkey Balcony Nets', intentSlug: 'monkey-protection' },
      { label: 'Staircase Side Nets', intentSlug: 'for-staircase' },
      { label: 'Villa Balcony Nets', intentSlug: 'for-villas' },
      { label: 'Balcony Net Installation', intentSlug: 'installation' },
      { label: 'Balcony Net Quote', intentSlug: 'quote' },
      { label: 'Mosquito Nets', intentSlug: 'mosquito-nets' },
    ],
  },
  {
    heading: 'Bird & Pigeon Nets',
    serviceSlug: 'bird-pigeon-nets',
    children: [
      { label: 'Pigeon Safety Nets', intentSlug: 'pigeon-control' },
      { label: 'Anti Bird Nets', intentSlug: 'bird-control' },
      { label: 'Balcony Bird Nets', intentSlug: 'for-balcony' },
      { label: 'Window Bird Nets', intentSlug: 'for-windows' },
      { label: 'Duct Area Bird Nets', intentSlug: 'for-ducts' },
      { label: 'Bird Net Installation', intentSlug: 'installation' },
      { label: 'Pigeon Net Price', intentSlug: 'price' },
      { label: 'Bird Spikes', intentSlug: 'bird-spikes' },
      { label: 'Society Bird Nets', intentSlug: 'for-society' },
    ],
  },
  {
    heading: 'Sports Nets',
    serviceSlug: 'sports-nets',
    children: [
      { label: 'Cricket Practice Nets', intentSlug: 'cricket-nets' },
      { label: 'Sports Containment Nets', intentSlug: 'containment' },
      { label: 'Playground Safety Nets', intentSlug: 'playground' },
      { label: 'Sports Net Installation', intentSlug: 'installation' },
      { label: 'Sports Net Price', intentSlug: 'price' },
      { label: 'Sports Nets for Schools', intentSlug: 'for-schools' },
    ],
  },
  {
    heading: 'Cloth Hangers',
    serviceSlug: 'cloth-hangers',
    children: [
      { label: 'Ceiling Cloth Hangers', intentSlug: 'ceiling' },
      { label: 'Balcony Cloth Hangers', intentSlug: 'for-balcony' },
      { label: 'Wall Mounted Cloth Hangers', intentSlug: 'wall-mounted' },
      { label: 'Pulley Cloth Hangers', intentSlug: 'pulley' },
      { label: 'Stainless Steel Cloth Hangers', intentSlug: 'stainless-steel' },
      { label: 'Cloth Hanger Installation', intentSlug: 'installation' },
      { label: 'Cloth Hanger Price', intentSlug: 'price' },
    ],
  },
  {
    heading: 'Duct Area Nets',
    serviceSlug: 'duct-area-safety-nets',
    children: [
      { label: 'Duct Area Safety Nets', intentSlug: 'for-ducts' },
      { label: 'Shaft Safety Nets', intentSlug: 'shaft' },
      { label: 'Commercial Duct Nets', intentSlug: 'for-offices' },
      { label: 'Duct Net Installation', intentSlug: 'installation' },
      { label: 'Duct Net Price', intentSlug: 'price' },
    ],
  },
  {
    heading: 'Building Covering',
    serviceSlug: 'building-covering-safety-nets',
    children: [
      { label: 'Building Covering Nets', intentSlug: 'for-high-rise' },
      { label: 'Construction Safety Nets', intentSlug: 'construction' },
      { label: 'Facade Debris Nets', intentSlug: 'facade-debris' },
      { label: 'Covering Net Installation', intentSlug: 'installation' },
      { label: 'Covering Net Price', intentSlug: 'price' },
    ],
  },
] as const;

/** Every service×intent pair that must have its own hub page. */
export function taxonomyServiceIntentPairs(): readonly {
  readonly serviceSlug: string;
  readonly intentSlug: string;
  readonly label: string;
}[] {
  return SERVICE_TAXONOMY.flatMap((family) =>
    family.children.map((child) => ({
      serviceSlug: family.serviceSlug,
      intentSlug: child.intentSlug,
      label: child.label,
    })),
  );
}

export function siblingServiceSlugs(serviceSlug: string): readonly string[] {
  return SERVICE_TAXONOMY.map((family) => family.serviceSlug).filter(
    (slug) => slug !== serviceSlug,
  );
}

export function taxonomyLabelFor(
  serviceSlug: string,
  intentSlug: string,
): string | undefined {
  const family = SERVICE_TAXONOMY.find((entry) => entry.serviceSlug === serviceSlug);
  return family?.children.find((child) => child.intentSlug === intentSlug)?.label;
}
