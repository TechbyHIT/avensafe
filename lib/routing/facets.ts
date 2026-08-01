import type { City, SearchIntent, Service } from '@/lib/data/schemas';

/**
 * Facet gating.
 *
 * The intent table is the widest dimension on the site, so it is also the one
 * most able to mint pages nobody searches for. Two rules are applied here and
 * nowhere else:
 *
 *  - an intent only combines with the services it makes sense for (a cricket
 *    net has no pet-safety page, a cloth hanger has no bird-protection page);
 *  - an intent only reaches locality depth if its tier says the long tail is
 *    real there, so niche modifiers stay at city level instead of multiplying
 *    across every colony.
 *
 * The sitemap, the route inventory and `generateStaticParams` all read from
 * these helpers, which is what keeps the crawlable set and the rendered set in
 * agreement.
 */

/** True when the intent is declared for this service (no list = all services). */
export function intentAppliesToService(intent: SearchIntent, service: Service): boolean {
  if (!intent.serviceSlugs) return true;
  return intent.serviceSlugs.includes(service.slug);
}

/** Every intent earns a city page; tier only restricts locality depth. */
export function intentAllowedInCity(_intent: SearchIntent, _city: City): boolean {
  return true;
}

/**
 * Locality depth by tier: tier 1 everywhere, tier 2 only in tier 1–2 cities,
 * tier 3 never below city level.
 */
export function intentAllowedInArea(intent: SearchIntent, city: City): boolean {
  if (intent.tier === 3) return false;
  if (intent.tier === 2) return city.tier <= 2;
  return true;
}

export function intentsForServiceInCity(
  intents: readonly SearchIntent[],
  service: Service,
  city: City,
): readonly SearchIntent[] {
  return intents.filter(
    (intent) => intentAppliesToService(intent, service) && intentAllowedInCity(intent, city),
  );
}

export function intentsForServiceInArea(
  intents: readonly SearchIntent[],
  service: Service,
  city: City,
): readonly SearchIntent[] {
  return intents.filter(
    (intent) => intentAppliesToService(intent, service) && intentAllowedInArea(intent, city),
  );
}
