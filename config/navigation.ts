import { STATIC_ROUTES } from '@/config/routes';
import type { FooterColumn, NavGroup } from '@/types/navigation';

/**
 * Primary nav labels (Hiranya-style). Services and Areas use mega-menus
 * populated from `config/mega-menu.ts` in the Header component.
 */
export const PRIMARY_NAV: readonly NavGroup[] = [
  { label: 'Home', href: STATIC_ROUTES.home },
  { label: 'About', href: STATIC_ROUTES.about },
  {
    label: 'Services',
    href: STATIC_ROUTES.services,
    dynamicSource: 'services',
  },
  {
    label: 'Areas',
    href: STATIC_ROUTES.serviceAreas,
    dynamicSource: 'states',
  },
  { label: 'Gallery', href: STATIC_ROUTES.gallery },
  { label: 'Blog', href: STATIC_ROUTES.blog },
  { label: 'Contact', href: STATIC_ROUTES.contact },
];

export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  { heading: 'Popular services', dynamicSource: 'services' },
  { heading: 'Top cities', dynamicSource: 'featuredCities' },
  { heading: 'Service areas', dynamicSource: 'states' },
  {
    heading: 'Guides',
    items: [
      { label: 'Compare systems', href: STATIC_ROUTES.compare },
      { label: 'Buying guide', href: STATIC_ROUTES.buyingGuide },
      { label: 'Pricing guide', href: STATIC_ROUTES.pricingGuide },
      { label: 'Installation guide', href: STATIC_ROUTES.installationGuide },
      { label: 'Maintenance guide', href: STATIC_ROUTES.maintenanceGuide },
      { label: 'FAQ & troubleshooting', href: STATIC_ROUTES.faqTroubleshootingGuide },
      { label: 'Materials guide', href: STATIC_ROUTES.materialsGuide },
      { label: 'Safety guide', href: STATIC_ROUTES.safetyGuide },
      { label: 'All guides', href: STATIC_ROUTES.guides },
    ],
  },
  {
    heading: 'Company',
    items: [
      { label: 'About us', href: STATIC_ROUTES.about },
      { label: 'Installations', href: STATIC_ROUTES.projects },
      { label: 'Gallery', href: STATIC_ROUTES.gallery },
      { label: 'Blog', href: STATIC_ROUTES.blog },
      { label: 'FAQ', href: STATIC_ROUTES.faq },
      { label: 'Contact', href: STATIC_ROUTES.contact },
    ],
  },
];

/** Priority cities for footer / homepage race against EverSafe hubs. */
export const FEATURED_CITY_SLUGS = [
  'hyderabad',
  'bengaluru',
  'chennai',
  'visakhapatnam',
  'vijayawada',
  'mysuru',
  'coimbatore',
  'pune',
] as const;
