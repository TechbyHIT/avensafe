/**
 * Services mega-menu: main heading → service hub; each subsection → its own
 * `/services/{service}/{intent}` page (unique content, then all states).
 */

import { SERVICE_TAXONOMY } from '@/config/service-taxonomy';

export interface MegaMenuLink {
  readonly label: string;
  readonly href: string;
}

export interface MegaMenuColumn {
  readonly heading: string;
  readonly href: string;
  readonly links: readonly MegaMenuLink[];
}

const BLR = '/karnataka/bengaluru';
const MYS = '/karnataka/mysuru';
const CHN = '/tamil-nadu/chennai';
const PUN = '/maharashtra/pune';
const MUM = '/maharashtra/mumbai';
const VIZ = '/andhra-pradesh/visakhapatnam';
const HYD = '/telangana/hyderabad';

/** Services mega-menu — every subsection is its own hub URL. */
export const SERVICES_MEGA_MENU: readonly MegaMenuColumn[] = SERVICE_TAXONOMY.map((family) => ({
  heading: family.heading,
  href: `/services/${family.serviceSlug}`,
  links: family.children.map((child) => ({
    label: child.label,
    href: `/services/${family.serviceSlug}/${child.intentSlug}`,
  })),
}));

export interface AreaMegaCity {
  readonly name: string;
  readonly href: string;
  readonly areas: readonly MegaMenuLink[];
}

/** Areas mega-menu — city hubs + sample locality / service deep links. */
export const AREAS_MEGA_MENU: readonly AreaMegaCity[] = [
  {
    name: 'Hyderabad',
    href: HYD,
    areas: [
      { label: 'Invisible Grills in Hyderabad', href: `${HYD}/invisible-grills` },
      { label: 'Safety Nets in Hyderabad', href: `${HYD}/safety-nets` },
      { label: 'Balcony Nets in Hyderabad', href: `${HYD}/balcony-nets` },
      { label: 'Bird & Pigeon Nets in Hyderabad', href: `${HYD}/bird-pigeon-nets` },
      { label: 'Gachibowli', href: `${HYD}/gachibowli` },
      { label: 'Kondapur', href: `${HYD}/kondapur` },
      { label: 'Madhapur', href: `${HYD}/madhapur` },
      { label: 'All Hyderabad areas', href: HYD },
    ],
  },
  {
    name: 'Bengaluru',
    href: BLR,
    areas: [
      { label: 'Invisible Grills in Bengaluru', href: `${BLR}/invisible-grills` },
      { label: 'Safety Nets in Bengaluru', href: `${BLR}/safety-nets` },
      { label: 'Balcony Nets in Bengaluru', href: `${BLR}/balcony-nets` },
      { label: 'Whitefield', href: `${BLR}/whitefield` },
      { label: 'HSR Layout', href: `${BLR}/hsr-layout` },
      { label: 'Koramangala', href: `${BLR}/koramangala` },
      { label: 'All Bengaluru areas', href: BLR },
    ],
  },
  {
    name: 'Mysuru',
    href: MYS,
    areas: [
      { label: 'Invisible Grills in Mysuru', href: `${MYS}/invisible-grills` },
      { label: 'Safety Nets in Mysuru', href: `${MYS}/safety-nets` },
      { label: 'Cloth Hangers in Mysuru', href: `${MYS}/cloth-hangers` },
      { label: 'Mysuru city hub', href: MYS },
    ],
  },
  {
    name: 'Chennai',
    href: CHN,
    areas: [
      { label: 'Invisible Grills in Chennai', href: `${CHN}/invisible-grills` },
      { label: 'Safety Nets in Chennai', href: `${CHN}/safety-nets` },
      { label: 'Bird & Pigeon Nets in Chennai', href: `${CHN}/bird-pigeon-nets` },
      { label: 'Chennai city hub', href: CHN },
    ],
  },
  {
    name: 'Pune',
    href: PUN,
    areas: [
      { label: 'Invisible Grills in Pune', href: `${PUN}/invisible-grills` },
      { label: 'Safety Nets in Pune', href: `${PUN}/safety-nets` },
      { label: 'Pune city hub', href: PUN },
    ],
  },
  {
    name: 'Mumbai',
    href: MUM,
    areas: [
      { label: 'Invisible Grills in Mumbai', href: `${MUM}/invisible-grills` },
      { label: 'Safety Nets in Mumbai', href: `${MUM}/safety-nets` },
      { label: 'Mumbai city hub', href: MUM },
    ],
  },
  {
    name: 'Visakhapatnam',
    href: VIZ,
    areas: [
      { label: 'Invisible Grills in Vizag', href: `${VIZ}/invisible-grills` },
      { label: 'Safety Nets in Vizag', href: `${VIZ}/safety-nets` },
      { label: 'Vizag city hub', href: VIZ },
    ],
  },
];

export function serviceHubPath(serviceSlug: string): string {
  return `/services/${serviceSlug}`;
}
