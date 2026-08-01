/**
 * Enterprise Explore / Related Pages hub.
 *
 * Builds topic-clustered internal links for programmatic pages, rotates
 * section order per URL seed, and never emits empty clusters. UI rendering
 * lives in `ExploreHub`; this module owns crawlable link selection.
 */
import { LINK_LIMITS } from '@/config/constants';
import { STATIC_ROUTES } from '@/config/routes';
import { SERVICE_TAXONOMY } from '@/config/service-taxonomy';
import { pageSeed } from '@/lib/content/entity-composer';
import {
  getAdjacentAreas,
  getAreasByCity,
  getDistrictsByState,
  getNeighbouringCities,
  getSearchIntents,
  getServices,
  getStates,
} from '@/lib/data/repository';
import type { Area } from '@/lib/data/schemas';
import {
  areaPath,
  cityPath,
  districtPath,
  serviceInAreaPath,
  serviceInCityIntentPath,
  serviceInCityPath,
  serviceIntentPath,
  servicePath,
  statePath,
} from '@/lib/routing/url';
import { orderDeterministic, pickVariant } from '@/lib/utils/hash';
import type { ContextualLink, ExploreCluster, LinkGroup, PageTarget } from '@/types/routing';

const PER_SECTION = 8;
const MAX_SECTIONS = 14;

type LocationKind = NonNullable<Area['locationKind']>;

interface KindBucket {
  readonly id: string;
  readonly heading: string;
  readonly description: string;
  readonly kinds: readonly LocationKind[];
  readonly cluster: ExploreCluster;
}

const GEO_KIND_BUCKETS: readonly KindBucket[] = [
  {
    id: 'nearbyAreas',
    heading: 'Nearby areas',
    description: 'Adjacent service areas with their own specification pages.',
    kinds: ['area', 'residential-area', 'nagar', 'other'],
    cluster: 'geo',
  },
  {
    id: 'nearbyLocalities',
    heading: 'Nearby localities',
    description: 'Local neighbourhood pages for the same city.',
    kinds: ['locality'],
    cluster: 'geo',
  },
  {
    id: 'nearbyColonies',
    heading: 'Nearby colonies',
    description: 'Colony-level pages with opening and access notes.',
    kinds: ['colony'],
    cluster: 'geo',
  },
  {
    id: 'nearbyLayouts',
    heading: 'Nearby layouts',
    description: 'Plotted layouts and housing projects nearby.',
    kinds: ['layout'],
    cluster: 'geo',
  },
  {
    id: 'nearbyApartments',
    heading: 'Nearby apartments',
    description: 'Apartment and high-rise society pages close by.',
    kinds: ['apartment'],
    cluster: 'geo',
  },
  {
    id: 'nearbySocieties',
    heading: 'Nearby societies',
    description: 'Gated communities and apartment societies we cover.',
    kinds: ['society', 'gated-community', 'township'],
    cluster: 'geo',
  },
  {
    id: 'nearbyWards',
    heading: 'Nearby wards',
    description: 'Municipal ward pages for broader city coverage.',
    kinds: ['ward'],
    cluster: 'geo',
  },
  {
    id: 'nearbyVillages',
    heading: 'Nearby villages',
    description: 'Village and gram-panchayat service pages.',
    kinds: ['village', 'gram-panchayat'],
    cluster: 'geo',
  },
  {
    id: 'nearbyTowns',
    heading: 'Nearby towns',
    description: 'Town and census-town hubs in the same region.',
    kinds: ['town', 'census-town', 'municipality', 'nagar-panchayat'],
    cluster: 'geo',
  },
  {
    id: 'nearbyCommercialAreas',
    heading: 'Nearby commercial areas',
    description: 'Commercial corridors where office and shop openings differ.',
    kinds: ['commercial-area'],
    cluster: 'geo',
  },
  {
    id: 'nearbyIndustrialAreas',
    heading: 'Nearby industrial areas',
    description: 'Industrial estates and factory-adjacent localities.',
    kinds: ['industrial-area', 'sez'],
    cluster: 'geo',
  },
  {
    id: 'nearbyItParks',
    heading: 'Nearby IT parks',
    description: 'IT park and campus neighbourhoods with tower stock.',
    kinds: ['it-park'],
    cluster: 'geo',
  },
  {
    id: 'nearbyLandmarks',
    heading: 'Nearby landmarks',
    description: 'Landmark-anchored localities for easier wayfinding.',
    kinds: ['landmark'],
    cluster: 'geo',
  },
  {
    id: 'nearbyMetroStations',
    heading: 'Nearby metro stations',
    description: 'Metro-adjacent localities with balcony and duct work.',
    kinds: ['metro-station'],
    cluster: 'geo',
  },
] as const;

const APPLICATION_INTENTS = [
  { id: 'appBalcony', slug: 'for-balcony', heading: 'Balcony applications' },
  { id: 'appWindow', slug: 'for-windows', heading: 'Window applications' },
  { id: 'appTerrace', slug: 'for-terrace', heading: 'Terrace applications' },
  { id: 'appDuct', slug: 'for-ducts', heading: 'Duct area applications' },
  { id: 'appHighRise', slug: 'for-high-rise', heading: 'High-rise applications' },
] as const;

const PROPERTY_INTENTS = [
  { id: 'propApartments', slug: 'for-apartments', heading: 'Apartments' },
  { id: 'propVillas', slug: 'for-villas', heading: 'Villas' },
  { id: 'propSociety', slug: 'for-society', heading: 'Societies & gated communities' },
] as const;

function enrich(
  partial: Omit<LinkGroup, 'links'> & { readonly links: LinkGroup['links'] },
): LinkGroup | null {
  if (partial.links.length === 0) return null;
  return partial;
}

function areaHref(target: PageTarget, area: Area): string | null {
  const city = target.location?.city;
  const state = target.location?.state;
  if (!city || !state) return null;
  if (target.service) {
    return serviceInAreaPath(target.service, state, city, area);
  }
  return areaPath(state, city, area);
}

function kindGroups(target: PageTarget): readonly LinkGroup[] {
  const city = target.location?.city;
  if (!city) return [];

  const seed = pageSeed(target);
  const areas = orderDeterministic(
    getAreasByCity(city.id),
    `${seed}:areas`,
    (area) => area.id,
  );

  const out: LinkGroup[] = [];

  for (const bucket of GEO_KIND_BUCKETS) {
    const kindSet = new Set<string>(bucket.kinds);
    const matched = areas
      .filter((area) => area.locationKind && kindSet.has(area.locationKind))
      .slice(0, PER_SECTION);

    // Fallback: untyped localities feed the generic nearbyAreas / nearbyLocalities buckets.
    const fallback =
      matched.length === 0 && (bucket.id === 'nearbyAreas' || bucket.id === 'nearbyLocalities')
        ? areas.filter((area) => !area.locationKind).slice(0, PER_SECTION)
        : matched;

    const links = fallback.flatMap((area) => {
      const href = areaHref(target, area);
      if (!href) return [];
      return [
        {
          href,
          label: target.service
            ? `${target.service.shortName} in ${area.name}`
            : area.name,
          context: area.notes,
        },
      ];
    });

    const group = enrich({
      id: bucket.id,
      heading: bucket.heading,
      description: bucket.description,
      cluster: bucket.cluster,
      priority: 40,
      span: bucket.id === 'nearbySocieties' || bucket.id === 'nearbyApartments' ? 2 : 1,
      viewAllHref: target.location
        ? cityPath(target.location.state, city)
        : undefined,
      links,
    });
    if (group) out.push(group);
  }

  // Adjacent areas (graph-based) when present.
  if (target.location?.area) {
    const adjacent = getAdjacentAreas(target.location.area).slice(0, PER_SECTION);
    const links = adjacent.flatMap((area) => {
      const href = areaHref(target, area);
      if (!href) return [];
      return [
        {
          href,
          label: target.service
            ? `${target.service.shortName} in ${area.name}`
            : area.name,
          context: 'Adjacent locality',
        },
      ];
    });
    const group = enrich({
      id: 'continueNearby',
      heading: 'Continue nearby',
      description: 'Next localities along the same corridor.',
      cluster: 'geo',
      priority: 35,
      span: 2,
      links,
    });
    if (group) out.push(group);
  }

  return out;
}

function serviceClusterGroups(target: PageTarget): readonly LinkGroup[] {
  const service = target.service;
  const out: LinkGroup[] = [];

  if (service) {
    const family = SERVICE_TAXONOMY.find((entry) => entry.serviceSlug === service.slug);
    const variations =
      family?.children
        .filter((child) => child.intentSlug !== target.intent?.slug)
        .slice(0, PER_SECTION)
        .map((child) => ({
          href: serviceIntentPath(service, { slug: child.intentSlug }),
          label: child.label,
          context: `Continue with ${service.shortName}`,
        })) ?? [];

    const continueGroup = enrich({
      id: 'continueThisService',
      heading: `Continue with ${service.shortName}`,
      description: 'Popular variations and intent pages for this product family.',
      cluster: 'service',
      priority: 2,
      span: 2,
      viewAllHref: servicePath(service),
      links: variations,
    });
    if (continueGroup) out.push(continueGroup);
  }

  const related = getServices()
    .filter((entry) => entry.id !== service?.id)
    .slice(0, PER_SECTION)
    .map((entry) => {
      const location = target.location;
      const href =
        location?.area && location.city
          ? serviceInAreaPath(entry, location.state, location.city, location.area)
          : location?.city
            ? serviceInCityPath(entry, location.state, location.city)
            : servicePath(entry);
      return {
        href,
        label: location ? `${entry.name} in ${location.area?.name ?? location.city?.name}` : entry.name,
        context: entry.summary,
      };
    });

  const relatedGroup = enrich({
    id: 'relatedServices',
    heading: 'Related services',
    description: 'Other systems people compare before booking a survey.',
    cluster: 'service',
    priority: 3,
    span: 2,
    viewAllHref: STATIC_ROUTES.services,
    links: related,
  });
  if (relatedGroup) out.push(relatedGroup);

  const categories = SERVICE_TAXONOMY.slice(0, PER_SECTION).map((family) => ({
    href: `/services/${family.serviceSlug}`,
    label: family.heading,
    context: `${family.children.length} dedicated subsection pages`,
  }));
  const categoryGroup = enrich({
    id: 'serviceCategories',
    heading: 'Service categories',
    description: 'Browse every product family from the national hubs.',
    cluster: 'service',
    priority: 4,
    viewAllHref: STATIC_ROUTES.services,
    links: categories,
  });
  if (categoryGroup) out.push(categoryGroup);

  if (service) {
    const popular = SERVICE_TAXONOMY.find((entry) => entry.serviceSlug === service.slug)
      ?.children.slice(0, 6)
      .map((child) => ({
        href: target.location?.city
          ? serviceInCityIntentPath(
              service,
              target.location.state,
              target.location.city,
              { slug: child.intentSlug },
            )
          : serviceIntentPath(service, { slug: child.intentSlug }),
        label: child.label,
        context: 'Popular variation',
      }));

    const popularGroup = enrich({
      id: 'popularVariations',
      heading: 'Popular variations',
      description: 'High-intent modifiers readers open most often.',
      cluster: 'service',
      priority: 5,
      span: 2,
      links: popular ?? [],
    });
    if (popularGroup) out.push(popularGroup);
  }

  return out;
}

function journeyGroups(target: PageTarget): readonly LinkGroup[] {
  const service = target.service;
  const intents = getSearchIntents();
  const bySlug = (slug: string) => intents.find((intent) => intent.slug === slug);

  const journeyLinks: ContextualLink[] = [
    {
      href: STATIC_ROUTES.pricingGuide,
      label: 'Price guides',
      context: 'What belongs on a written quotation.',
    },
    {
      href: STATIC_ROUTES.installationGuide,
      label: 'Installation guides',
      context: 'Survey, fixing and handover steps.',
    },
    {
      href: STATIC_ROUTES.materialsGuide,
      label: 'Material guide',
      context: 'Cable grades, mesh and fittings.',
    },
    {
      href: STATIC_ROUTES.compare,
      label: 'Comparison guide',
      context: 'Invisible grills vs nets and when each fits.',
    },
    {
      href: STATIC_ROUTES.buyingGuide,
      label: 'Buying guide',
      context: 'Questions to ask before you confirm.',
    },
    {
      href: STATIC_ROUTES.maintenanceGuide,
      label: 'Maintenance services',
      context: 'Care, re-tension and inspection intervals.',
    },
    {
      href: STATIC_ROUTES.safetyGuide,
      label: 'Safety tips',
      context: 'Spacing and opening checks that matter.',
    },
    {
      href: STATIC_ROUTES.faq,
      label: 'Popular questions',
      context: 'Answers readers ask before booking.',
    },
  ];

  if (service) {
    const price = bySlug('price');
    const repair = bySlug('repair');
    const install = bySlug('installation');
    if (price) {
      journeyLinks.unshift({
        href: serviceIntentPath(service, price),
        label: `${service.shortName} price factors`,
        context: 'Local quotation inputs for this system.',
      });
    }
    if (install) {
      journeyLinks.push({
        href: serviceIntentPath(service, install),
        label: `${service.shortName} installation`,
        context: 'How this system is measured and fitted.',
      });
    }
    if (repair) {
      journeyLinks.push({
        href: serviceIntentPath(service, repair),
        label: `${service.shortName} repair`,
        context: 'When repair is safer than full replacement.',
      });
    }
  }

  const group = enrich({
    id: 'buyerJourney',
    heading: 'Buyer journey',
    description: 'Guides that help you compare, specify and decide.',
    cluster: 'journey',
    priority: 8,
    span: 2,
    viewAllHref: STATIC_ROUTES.guides,
    links: journeyLinks.slice(0, PER_SECTION),
  });
  return group ? [group] : [];
}

function propertyAndApplicationGroups(target: PageTarget): readonly LinkGroup[] {
  const service = target.service;
  if (!service) return [];
  const city = target.location?.city;
  const state = target.location?.state;
  const out: LinkGroup[] = [];

  const propertyLinks = PROPERTY_INTENTS.flatMap((entry) => {
    const href =
      city && state
        ? serviceInCityIntentPath(service, state, city, { slug: entry.slug })
        : serviceIntentPath(service, { slug: entry.slug });
    return [
      {
        href,
        label: `${entry.heading}`,
        context: `${service.shortName} for ${entry.heading.toLowerCase()}`,
      },
    ];
  });

  const propertyGroup = enrich({
    id: 'propertyTypes',
    heading: 'Property types',
    description: 'Specify by building stock — apartments, villas, societies.',
    cluster: 'property',
    priority: 12,
    links: propertyLinks,
  });
  if (propertyGroup) out.push(propertyGroup);

  const appLinks = APPLICATION_INTENTS.map((entry) => {
    const href =
      city && state
        ? serviceInCityIntentPath(service, state, city, { slug: entry.slug })
        : serviceIntentPath(service, { slug: entry.slug });
    return {
      href,
      label: entry.heading,
      context: `Opening-specific ${service.shortName} pages`,
    };
  });

  const appGroup = enrich({
    id: 'applications',
    heading: 'Applications',
    description: 'Balcony, window, terrace, duct and high-rise openings.',
    cluster: 'application',
    priority: 13,
    span: 2,
    links: appLinks,
  });
  if (appGroup) out.push(appGroup);

  return out;
}

function contentGroups(): readonly LinkGroup[] {
  const group = enrich({
    id: 'relatedContent',
    heading: 'Related content',
    description: 'Projects, photography, FAQs and articles to browse next.',
    cluster: 'content',
    priority: 15,
    span: 2,
    links: [
      {
        href: STATIC_ROUTES.projects,
        label: 'Latest projects',
        context: 'Recent installation case notes.',
      },
      {
        href: STATIC_ROUTES.gallery,
        label: 'Project gallery',
        context: 'Real site photography by system.',
      },
      {
        href: STATIC_ROUTES.faq,
        label: 'FAQs',
        context: 'Answers before you book a survey.',
      },
      {
        href: STATIC_ROUTES.blog,
        label: 'Latest articles',
        context: 'Buying tips and safety explainers.',
      },
      {
        href: STATIC_ROUTES.guides,
        label: 'Buying tips',
        context: 'Cornerstone guides for specification.',
      },
      {
        href: STATIC_ROUTES.maintenanceGuide,
        label: 'Maintenance tips',
        context: 'How to keep nets and cables serviceable.',
      },
    ],
  });
  return group ? [group] : [];
}

function conversionGroup(): LinkGroup {
  return {
    id: 'conversion',
    heading: 'Get help now',
    description: 'Free inspection, written quote, WhatsApp or call — pick the next step.',
    cluster: 'conversion',
    priority: 1,
    span: 3,
    links: [
      {
        href: STATIC_ROUTES.contact,
        label: 'Free site inspection',
        context: 'Book a twenty-minute survey.',
      },
      {
        href: STATIC_ROUTES.contact,
        label: 'Get quote',
        context: 'Send opening photos and your city.',
      },
      {
        href: STATIC_ROUTES.contact,
        label: 'Request callback',
        context: 'We call back with system options.',
      },
      {
        href: STATIC_ROUTES.contact,
        label: 'Contact team',
        context: 'Talk to a planner before you decide.',
      },
    ],
  };
}

function cityDistrictStateGroups(target: PageTarget): readonly LinkGroup[] {
  const location = target.location;
  if (!location) return [];
  const out: LinkGroup[] = [];
  const seed = pageSeed(target);

  if (location.city) {
    const nearby = orderDeterministic(
      getNeighbouringCities(location.city),
      `${seed}:cities`,
      (city) => city.id,
    ).slice(0, PER_SECTION);

    const links = nearby.flatMap((city) => {
      const state = getStates().find((entry) => entry.id === city.stateId);
      if (!state) return [];
      const href = target.service
        ? serviceInCityPath(target.service, state, city)
        : cityPath(state, city);
      return [
        {
          href,
          label: target.service
            ? `${target.service.shortName} in ${city.name}`
            : city.name,
          context: city.localConsiderations,
        },
      ];
    });

    const group = enrich({
      id: 'nearbyCities',
      heading: 'Nearby cities',
      description: 'Neighbouring cities with the same service coverage.',
      cluster: 'geo',
      priority: 28,
      span: 2,
      viewAllHref: STATIC_ROUTES.serviceAreas,
      links,
    });
    if (group) out.push(group);
  }

  const districts = getDistrictsByState(location.state.id).slice(0, PER_SECTION);
  const districtGroup = enrich({
    id: 'nearbyDistricts',
    heading: 'Nearby districts',
    description: 'District hubs for broader regional coverage.',
    cluster: 'geo',
    priority: 45,
    links: districts.map((district) => ({
      href: districtPath(location.state, district),
      label: district.name,
      context: `${location.state.name} district hub`,
    })),
  });
  if (districtGroup) out.push(districtGroup);

  const states = getStates()
    .filter((state) => state.id !== location.state.id)
    .slice(0, PER_SECTION);
  const stateGroup = enrich({
    id: 'nearbyStates',
    heading: 'Nearby states',
    description: 'Other states where we survey and install.',
    cluster: 'geo',
    priority: 50,
    links: states.map((state) => ({
      href: statePath(state),
      label: state.name,
      context: state.climateContext,
    })),
  });
  if (stateGroup) out.push(stateGroup);

  // Landmark text chips — link to the area that lists them when possible.
  if (location.city) {
    const landmarkLinks = getAreasByCity(location.city.id)
      .flatMap((area) =>
        (area.landmarks ?? []).slice(0, 1).map((landmark) => ({
          area,
          landmark,
        })),
      )
      .slice(0, PER_SECTION)
      .flatMap(({ area, landmark }) => {
        const href = areaHref(target, area);
        if (!href) return [];
        return [
          {
            href,
            label: landmark,
            context: `Near ${area.name}`,
          },
        ];
      });

    const landmarkGroup = enrich({
      id: 'nearbyLandmarkRefs',
      heading: 'Nearby landmarks',
      description: 'Local landmarks used to find the right service page quickly.',
      cluster: 'geo',
      priority: 42,
      links: landmarkLinks,
    });
    if (landmarkGroup) out.push(landmarkGroup);
  }

  return out;
}

function parentGroups(target: PageTarget): readonly LinkGroup[] {
  const location = target.location;
  const service = target.service;
  const links: ContextualLink[] = [];

  if (location?.area && location.city && service) {
    links.push({
      href: areaPath(location.state, location.city, location.area),
      label: `Everything we do in ${location.area.name}`,
    });
    links.push({
      href: serviceInCityPath(service, location.state, location.city),
      label: `${service.name} across ${location.city.name}`,
    });
  } else if (location?.city && service) {
    links.push({
      href: cityPath(location.state, location.city),
      label: `Everything we do in ${location.city.name}`,
    });
    links.push({
      href: servicePath(service),
      label: `${service.name} explained in full`,
    });
  } else if (location?.city) {
    links.push({
      href: cityPath(location.state, location.city),
      label: `${location.city.name} hub`,
    });
    links.push({
      href: statePath(location.state),
      label: location.state.name,
    });
  } else if (service) {
    links.push({
      href: servicePath(service),
      label: service.name,
    });
    links.push({
      href: STATIC_ROUTES.services,
      label: 'All services',
    });
  }

  links.push({
    href: STATIC_ROUTES.contact,
    label: 'Arrange a site survey',
  });

  const group = enrich({
    id: 'upALevel',
    heading: 'Up a level',
    description: 'Parent hubs that keep this page in the crawl path.',
    cluster: 'conversion',
    priority: 0,
    links,
  });
  return group ? [group] : [];
}

/**
 * Compose the Explore hub for a page: topic-cluster sections only (no empty
 * clusters), rotate order per URL seed, and cap section count for UX + build cost.
 */
export function buildExploreHub(target: PageTarget): readonly LinkGroup[] {
  const seed = pageSeed(target);

  const enriched = [
    conversionGroup(),
    ...parentGroups(target),
    ...serviceClusterGroups(target),
    ...journeyGroups(target),
    ...propertyAndApplicationGroups(target),
    ...kindGroups(target),
    ...cityDistrictStateGroups(target),
    ...contentGroups(),
  ];

  // Deduplicate by section id, then by heading.
  const seenIds = new Set<string>();
  const seenHrefsGlobal = new Set<string>([target.path]);
  const unique: LinkGroup[] = [];

  for (const group of enriched) {
    const key = group.id ?? group.heading;
    if (seenIds.has(key)) continue;
    seenIds.add(key);

    const links = group.links.filter((link) => {
      if (seenHrefsGlobal.has(link.href)) return false;
      // Allow conversion CTAs that share /contact by keeping distinct labels.
      if (group.cluster !== 'conversion') seenHrefsGlobal.add(link.href);
      return true;
    });

    if (links.length === 0) continue;
    unique.push({ ...group, links: links.slice(0, PER_SECTION) });
  }

  // Always keep conversion + continue/related service near the front after rotation of the rest.
  const pinned = unique.filter(
    (group) =>
      group.id === 'conversion' ||
      group.id === 'continueThisService' ||
      group.id === 'relatedServices',
  );
  const rotatable = unique.filter(
    (group) =>
      group.id !== 'conversion' &&
      group.id !== 'continueThisService' &&
      group.id !== 'relatedServices',
  );

  const rotated = orderDeterministic(rotatable, `${seed}:explore`, (group) => group.id ?? group.heading);

  // Pick a layout density variant so sibling pages do not share the same visual rhythm.
  const budget = pickVariant(`${seed}:explore-budget`, [10, 12, MAX_SECTIONS] as const);
  const body = rotated.slice(0, Math.max(0, budget - pinned.length));

  const assembled = [...pinned, ...body];

  // Soft budget on total links (legacy engine already capped heavily).
  let linkBudget = LINK_LIMITS.maxContextualLinksPerPage;
  const finalGroups: LinkGroup[] = [];
  for (const group of assembled) {
    if (linkBudget <= 0) break;
    const links = group.links.slice(0, Math.min(PER_SECTION, linkBudget));
    linkBudget -= links.length;
    if (links.length > 0) finalGroups.push({ ...group, links });
  }

  return finalGroups;
}

