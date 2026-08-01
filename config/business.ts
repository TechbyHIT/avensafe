import type { BusinessConfig, PhoneNumber } from '@/types/business';

/**
 * THE single source of truth for business facts.
 *
 * Nothing in this file may be duplicated elsewhere. Pages, metadata, JSON-LD,
 * forms and components all read from here. When a detail changes, it changes
 * once, here.
 */
export const business: BusinessConfig = {
  legalName: 'Avensafe Solutions',
  name: 'Avensafe Solutions',
  shortName: 'Avensafe',
  tagline: 'Invisible grills, safety nets and cloth hangers, professionally installed.',
  description:
    'Avensafe Solutions provides professional installation of Invisible Grills, Safety Nets, Sports Nets, Cloth Hangers, Duct Area Safety Nets, and Building Covering Safety Nets for residential, commercial, and industrial properties across Andhra Pradesh, Telangana, Karnataka, Kerala, Tamil Nadu, Goa, Odisha, and Maharashtra.',
  shortDescription:
    'Professional installation of invisible grills, safety nets, sports nets and cloth hangers for homes, businesses and industrial sites across South and West India.',
  foundingYear: 2016,
  url: 'https://avensafesolutions.com',
  email: 'avensafesolutions@gmail.com',
  phones: [
    {
      e164: '+917702777307',
      display: '+91 77027 77307',
      label: 'Primary call / surveys',
      isPrimary: true,
      whatsapp: true,
    },
    {
      e164: '+917207256181',
      display: '+91 72072 56181',
      label: 'Primary enquiries',
      isPrimary: false,
      whatsapp: true,
    },
    {
      e164: '+919959976181',
      display: '+91 99599 76181',
      label: 'Service and maintenance',
      isPrimary: false,
      whatsapp: true,
    },
  ],
  // No verified street address on file. The schema engine skips LocalBusiness
  // while this is null so we never publish an address we cannot stand behind.
  address: null,
  geo: null,
  openingHours: [
    {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '19:00',
    },
    { days: ['Sunday'], opens: '10:00', closes: '14:00' },
  ],
  socialProfiles: [
    { platform: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61592560537179' },
    { platform: 'Instagram', url: 'https://www.instagram.com/avensafesolutions' },
    { platform: 'Threads', url: 'https://www.threads.com/@avensafesolutions' },
    { platform: 'YouTube', url: 'https://www.youtube.com/@avensafe' },
    { platform: 'X', url: 'https://x.com/AvenSolution' },
    { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/avensafe' },
    { platform: 'Pinterest', url: 'https://pin.it/17YDKbjHk' },
    { platform: 'GitHub', url: 'https://github.com/avensafesolutions' },
    { platform: 'Medium', url: 'https://medium.com/@avensafesolutions' },
    { platform: 'Reddit', url: 'https://www.reddit.com/user/avensafesolutions' },
    { platform: 'Quora', url: 'https://www.quora.com/profile/Aven-Safe' },
    { platform: 'Tumblr', url: 'https://www.tumblr.com/blog/avensafe' },
    { platform: 'Mastodon', url: 'https://mastodon.social/@avensafesolutions' },
    { platform: 'Snapchat', url: 'https://www.snapchat.com/@avensafe' },
    { platform: 'Gravatar', url: 'https://gravatar.com/avensafesolutions' },
  ],
  logo: {
    src: '/brand/avensafe-mark.png',
    width: 512,
    height: 512,
    alt: 'Avensafe Solutions logo',
  },
  openGraphImage: {
    src: '/brand/opengraph-default.png',
    width: 1200,
    height: 630,
    alt: 'Avensafe Solutions — invisible grills, safety nets and cloth hanger installation',
  },
  // No published price list. Pricing pages describe cost factors instead of
  // inventing numbers, and no `priceRange` is emitted in structured data.
  priceRange: null,
  currency: 'INR',
  languages: ['en-IN', 'hi-IN', 'te-IN', 'ta-IN', 'kn-IN', 'ml-IN', 'mr-IN'],
  proofPoints: [
    {
      title: 'Installing since 2016',
      detail:
        'Avensafe Solutions has specified and installed balcony and window safety systems since 2016, so survey and fixing habits are built from years of real openings rather than a product brochure.',
    },
    {
      title: 'Coverage across eight states',
      detail:
        'Crews work across Andhra Pradesh, Telangana, Karnataka, Kerala, Tamil Nadu, Goa, Odisha, and Maharashtra, with quotations written for local building stock and climate.',
    },
    {
      title: 'Survey before any firm price',
      detail:
        'Every firm quotation follows a measured visit: opening sizes, substrate, access, and society rules are written down so you can compare like for like.',
    },
    {
      title: 'Premium graded materials',
      detail:
        'Cable grade, mesh polymer, and hardware are named on the quotation — not left as generic “stainless” or “UV net” claims.',
    },
    {
      title: 'Fast scheduling after survey',
      detail:
        'When stock and association access align, installation can follow quickly after the survey; emergency securing is prioritised when an opening cannot wait.',
    },
    {
      title: 'Warranty and aftercare',
      detail:
        'Material and workmanship cover follows the product warranty on the quotation, with clear inspection intervals so tension and mesh stay effective after monsoon seasons.',
    },
  ],
};

/** The number used for the main call-to-action buttons. */
export const primaryPhone: PhoneNumber =
  business.phones.find((phone) => phone.isPrimary) ?? business.phones[0]!;

/** Numbers that accept WhatsApp messages. */
export const whatsappPhones: readonly PhoneNumber[] = business.phones.filter(
  (phone) => phone.whatsapp,
);

export const whatsappPhone: PhoneNumber = whatsappPhones[0] ?? primaryPhone;

/** `tel:` href for a stored number. */
export function telHref(phone: PhoneNumber = primaryPhone): string {
  return `tel:${phone.e164}`;
}

/** `mailto:` href for the business inbox. */
export function mailtoHref(subject?: string): string {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  return `mailto:${business.email}${query}`;
}

/**
 * WhatsApp deep link. `wa.me` expects the number without a leading `+`.
 */
export function whatsappHref(message?: string, phone: PhoneNumber = whatsappPhone): string {
  const digits = phone.e164.replace(/\D/g, '');
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${query}`;
}
