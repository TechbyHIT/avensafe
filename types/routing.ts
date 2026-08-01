import type { PageKind } from '@/config/routes';
import type {
  Area,
  City,
  District,
  SearchIntent,
  Service,
  State,
  TraitKey,
} from '@/lib/data/schemas';

/**
 * A resolved location, from state down to as much specificity as the URL
 * carries. `state` is always present because every location URL begins there.
 */
export interface LocationTarget {
  readonly state: State;
  readonly district?: District;
  readonly city?: City;
  readonly area?: Area;
}

/**
 * The normalized description of any page the dynamic engines render.
 *
 * The SEO, schema, content, linking and sitemap engines all take a `PageTarget`
 * rather than route params, so each of them has exactly one input shape no
 * matter which of the dynamic routes produced it.
 */
export interface PageTarget {
  readonly kind: PageKind;
  readonly path: string;
  readonly service?: Service;
  readonly location?: LocationTarget;
  /**
   * Environmental traits in force for this page, resolved to the most specific
   * level that declares any. Drives which technical guidance is selected.
   */
  readonly traits: readonly TraitKey[];
  /** When set, the page targets a specific search intent (installation, price, …). */
  readonly intent?: SearchIntent;
}

/** The label and href pair used for breadcrumbs and contextual links. */
export interface Crumb {
  readonly label: string;
  readonly href: string;
}

export interface ContextualLink {
  readonly href: string;
  readonly label: string;
  /** Short reason the link is being offered, shown as supporting text. */
  readonly context?: string;
}

/** Explore-hub cluster families used for UI grouping and rotation. */
export type ExploreCluster =
  | 'service'
  | 'geo'
  | 'journey'
  | 'property'
  | 'application'
  | 'content'
  | 'conversion';

export interface LinkGroup {
  readonly heading: string;
  readonly links: readonly ContextualLink[];
  /**
   * Lower number = assembled earlier and protected from budget starvation.
   * Critical nav (all services, intents, parents) should be 0–10; long locality
   * dumps should be 50+.
   */
  readonly priority?: number;
  /** Stable section id for rotation and analytics (e.g. nearbySocieties). */
  readonly id?: string;
  /** Short lede under the card heading. */
  readonly description?: string;
  /** Optional “View all” destination for the cluster. */
  readonly viewAllHref?: string;
  readonly cluster?: ExploreCluster;
  /** Desktop grid span hint: 1 = normal, 2 = wide, 3 = featured. */
  readonly span?: 1 | 2 | 3;
}
