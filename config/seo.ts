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
  /** Handle from the X profile in `config/business.ts`. No separate creator account. */
  twitterSite: '@AvenSolution' as string | null,
  twitterCreator: null as string | null,
  twitterCard: 'summary_large_image',
} as const;

/**
 * Default robots directives for indexable pages. Only structurally broken
 * resolutions are served with `noindex, follow` instead.
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
 * Google Search Console HTML tag.
 * Set `GOOGLE_SITE_VERIFICATION` (the content value from GSC) in the env.
 */
export function googleSiteVerification(): string | undefined {
  const token = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  return token && token.length > 0 ? token : undefined;
}

/**
 * Search Console work this codebase can support. None of these steps claim
 * that a URL is indexed or that a ranking has changed.
 */
export const SEARCH_CONSOLE_PLAN = [
  {
    id: 'verify',
    detail:
      'Set GOOGLE_SITE_VERIFICATION to the HTML-tag token. The root layout emits the verification meta only when that variable is present.',
  },
  {
    id: 'sitemaps',
    detail: `Submit ${business.url}/sitemap.xml, ${business.url}/sitemap-long-tail.xml, ${business.url}/sitemap-more.xml, and ${business.url}/sitemap-intents.xml.`,
  },
  {
    id: 'coverage',
    detail:
      'Review excluded and noindex URLs before requesting indexing. Unpublished states stay out of the sitemap because their pages are not built from published data.',
  },
  {
    id: 'queries',
    detail:
      'Compare queries with impressions and a weak click-through rate against the title and description limits in SEO_LIMITS. Change the page that already owns that query rather than publishing a second URL.',
  },
  {
    id: 'vitals',
    detail:
      'Read Core Web Vitals from the Search Console experience report and a field tool such as PageSpeed Insights. Do not treat a local Lighthouse run as the field result.',
  },
] as const;
