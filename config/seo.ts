import { business } from '@/config/business';

/**
 * SEO configuration. Templates and defaults live here; the logic that turns
 * them into a `Metadata` object lives in `lib/seo/`.
 */

export const SEO_DEFAULTS = {
  siteName: business.name,
  locale: 'en_IN',
  htmlLang: 'en-IN',
  titleSeparator: ' | ',
  /** Applied to every page except those that set an absolute title. */
  titleTemplate: `%s${' | '}${business.name}`,
  defaultTitle: `${business.name} — Invisible Grills & Safety Nets Installation`,
  defaultDescription: business.shortDescription,
  themeColor: '#0f1f33',
  /** No verified X/Twitter account on file, so no `creator` tag is emitted. */
  twitterSite: null as string | null,
  twitterCreator: null as string | null,
  twitterCard: 'summary_large_image',
} as const;

/**
 * Default robots directives for indexable pages. Pages that fail the
 * publishing gate are served with `noindex, follow` instead.
 */
export const ROBOTS_INDEXABLE = {
  index: true,
  follow: true,
  nocache: false,
  googleBot: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
} as const;

export const ROBOTS_NOINDEX = {
  index: false,
  follow: true,
  googleBot: {
    index: false,
    follow: true,
  },
} as const;

/** Paths crawlers should never spend budget on. */
export const ROBOTS_DISALLOW: readonly string[] = ['/api/'];

/**
 * Verification tokens. Left empty so no invalid `<meta>` tags are emitted;
 * fill in when the properties are claimed.
 */
export const SEARCH_CONSOLE_VERIFICATION: Readonly<Record<string, string>> = {};
