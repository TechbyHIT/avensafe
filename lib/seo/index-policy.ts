import type { PageTarget } from '@/types/routing';

/**
 * URLs Search Console is asked to index.
 *
 * Every other generated URL still resolves (200) so existing links keep working,
 * but it is `noindex, follow` and omitted from the sitemap. Submitting the full
 * locality × intent matrix made Google discover hundreds of thousands of URLs
 * and then refuse to index them.
 *
 * Kept:
 * - state, districts, cities, service hubs, and every service × city page
 * - tier-1 localities (Visakhapatnam, Vijayawada) and those localities × the
 *   three priority services
 * - installation and price hubs for those three services, including the same
 *   pair on tier-1 and tier-2 cities
 */

export const RANKING_SERVICE_SLUGS = ['invisible-grills', 'safety-nets', 'cloth-hangers'] as const;

export const RANKING_INTENT_SLUGS = ['installation', 'price'] as const;

const rankingServices = new Set<string>(RANKING_SERVICE_SLUGS);
const rankingIntents = new Set<string>(RANKING_INTENT_SLUGS);

export function isRankingServiceSlug(slug: string): boolean {
  return rankingServices.has(slug);
}

export function isRankingIntentSlug(slug: string): boolean {
  return rankingIntents.has(slug);
}

/** Locality hubs and locality × service pages. Tier 1 cities only. */
export function cityTierIndexesLocality(tier: number): boolean {
  return tier <= 1;
}

/** City × installation/price pages. Tier 1 and tier 2 cities. */
export function cityTierIndexesCityIntent(tier: number): boolean {
  return tier <= 2;
}

export function isSearchIndexTarget(target: PageTarget): boolean {
  switch (target.kind) {
    case 'serviceInDistrict':
    case 'serviceInAreaIntent':
      return false;
    case 'area': {
      const tier = target.location?.city?.tier;
      return tier !== undefined && cityTierIndexesLocality(tier);
    }
    case 'serviceInArea': {
      const tier = target.location?.city?.tier;
      const slug = target.service?.slug;
      return (
        tier !== undefined &&
        slug !== undefined &&
        cityTierIndexesLocality(tier) &&
        isRankingServiceSlug(slug)
      );
    }
    case 'serviceIntent': {
      const service = target.service?.slug;
      const intent = target.intent?.slug;
      return (
        service !== undefined &&
        intent !== undefined &&
        isRankingServiceSlug(service) &&
        isRankingIntentSlug(intent)
      );
    }
    case 'serviceInCityIntent': {
      const tier = target.location?.city?.tier;
      const service = target.service?.slug;
      const intent = target.intent?.slug;
      return (
        tier !== undefined &&
        service !== undefined &&
        intent !== undefined &&
        cityTierIndexesCityIntent(tier) &&
        isRankingServiceSlug(service) &&
        isRankingIntentSlug(intent)
      );
    }
    default:
      return true;
  }
}
