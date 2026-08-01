import { LINK_LIMITS, VARIATION_SEED } from '@/config/constants';
import { STATIC_ROUTES } from '@/config/routes';
import { SERVICE_TAXONOMY, taxonomyLabelFor } from '@/config/service-taxonomy';
import {
  getAdjacentAreas,
  getAreasByCity,
  getCitiesByDistrict,
  getCitiesByState,
  getDistrictById,
  getDistrictsByState,
  getGuideBySlug,
  getInternalLinkGraph,
  getNeighbouringCities,
  getSearchIntents,
  getServices,
  getServicesByIds,
  getStateById,
  getStates,
} from '@/lib/data/repository';
import { intentsForServiceInArea, intentsForServiceInCity } from '@/lib/routing/facets';
import {
  areaPath,
  cityPath,
  districtPath,
  guidePath,
  servicePath,
  serviceIntentPath,
  serviceInAreaIntentPath,
  serviceInAreaPath,
  serviceInCityIntentPath,
  serviceInCityPath,
  serviceInDistrictPath,
  statePath,
} from '@/lib/routing/url';
import type { City } from '@/lib/data/schemas';
import { orderDeterministic } from '@/lib/utils/hash';
import { lowerFirst } from '@/lib/utils/text';
import type { ContextualLink, LinkGroup, PageTarget } from '@/types/routing';

/**
 * The internal link engine.
 *
 * Its job is to make every generated page reachable and to give a reader a
 * sensible next step, without turning the bottom of the page into a link dump.
 * Links are contextual (each carries the reason it is being offered), capped by
 * `LINK_LIMITS`, and deduplicated against the current page so a page never links
 * to itself.
 *
 * Orphan prevention is structural: a state page always links its cities, a city
 * page always links its areas and services, and every service-in-location page
 * links back up to both its parents. That guarantees a crawl path from the home
 * page to the deepest URL.
 */

/** Stable but varied ordering, so long lists do not always start the same way. */
function order<T>(items: readonly T[], seed: string, keyOf: (item: T) => string): readonly T[] {
  return orderDeterministic(items, `${VARIATION_SEED}:${seed}`, keyOf);
}

function editorialGuideLinks(target: PageTarget): readonly ContextualLink[] {
  const service = target.service;
  if (!service) return [];

  const graph = getInternalLinkGraph();
  const slugs = graph.serviceToGuides[service.id] ?? [];

  return slugs
    .map((slug) => getGuideBySlug(slug))
    .filter((guide): guide is NonNullable<typeof guide> => guide !== undefined)
    .slice(0, LINK_LIMITS.relatedGuides)
    .map((guide) => ({
      href: guidePath(guide),
      label: guide.heading,
      context: guide.excerpt,
    }));
}

function relatedServiceLinks(target: PageTarget): readonly ContextualLink[] {
  const service = target.service;
  if (!service) return [];

  const location = target.location;
  // Prefer declared related services, then fill with every remaining service so
  // no service is missing from the location graph.
  const preferred = getServicesByIds(service.relatedServiceIds);
  const preferredIds = new Set(preferred.map((entry) => entry.id));
  const rest = getServices().filter(
    (entry) => entry.id !== service.id && !preferredIds.has(entry.id),
  );
  const related = [...preferred, ...rest].slice(0, LINK_LIMITS.relatedServices);

  return related.map((entry) => ({
    href: locationAwareServicePath(entry, target),
    label: location ? `${entry.name} in ${placeName(target)}` : entry.name,
    context: entry.summary,
  }));
}

/** Keeps a related-service link at the same location depth as the current page. */
function locationAwareServicePath(
  service: Parameters<typeof servicePath>[0],
  target: PageTarget,
): string {
  const location = target.location;
  if (location?.area && location.city) {
    return serviceInAreaPath(service, location.state, location.city, location.area);
  }
  if (location?.district && !location.city) {
    return serviceInDistrictPath(service, location.state, location.district);
  }
  if (location?.city) return serviceInCityPath(service, location.state, location.city);
  return servicePath(service);
}

/**
 * Neighbouring cities frequently sit across a state border — Khammam neighbours
 * Vijayawada, for instance — so a neighbour's URL must be built from its own
 * state rather than the current page's.
 */
function neighbourLinks(
  cities: readonly City[],
  labelFor: (city: City) => string,
): readonly ContextualLink[] {
  return cities.flatMap((city) => {
    const state = getStateById(city.stateId);
    if (!state) return [];
    return [{ href: cityPath(state, city), label: labelFor(city) }];
  });
}

function placeName(target: PageTarget): string {
  const location = target.location;
  if (!location) return '';
  return location.area?.name ?? location.city?.name ?? location.district?.name ?? location.state.name;
}

function allServiceLinksForLocation(target: PageTarget): readonly ContextualLink[] {
  const location = target.location;
  if (!location) return [];

  // Include every service (current page href is skipped later by the seen-set).
  return getServices().map((service) => ({
    href: locationAwareServicePath(service, target),
    label: `${service.name} in ${placeName(target)}`,
    context: service.summary,
  }));
}

/* ---------------------------------------------------------------- per-kind sets */

function serviceGroups(target: PageTarget): readonly LinkGroup[] {
  const service = target.service;
  if (!service) return [];

  const family = SERVICE_TAXONOMY.find((entry) => entry.serviceSlug === service.slug);
  const subsectionLinks =
    family?.children.map((child) => ({
      href: serviceIntentPath(service, { slug: child.intentSlug }),
      label: child.label,
      context: 'Separate national hub with its own copy, then every state.',
    })) ?? [];

  const states = getStates();
  const stateGroupsLinks: LinkGroup[] = states.map((state) => {
    const cities = getCitiesByState(state.id);
    return {
      heading: `${service.name} in ${state.name}`,
      links: [
        {
          href: statePath(state),
          label: `${state.name} hub`,
          context: state.climateContext,
        },
        ...cities.map((city) => ({
          href: serviceInCityPath(service, state, city),
          label: `${service.shortName} in ${city.name}`,
          context: city.localConsiderations,
        })),
      ],
    };
  });

  return [
    ...(subsectionLinks.length > 0
      ? [{ heading: `${service.name} subsections`, links: subsectionLinks }]
      : []),
    ...stateGroupsLinks,
    {
      heading: 'Related services',
      links: relatedServiceLinks(target),
    },
    {
      heading: 'Read before you decide',
      links: editorialGuideLinks(target),
    },
    {
      heading: 'Next step',
      links: [
        {
          href: STATIC_ROUTES.serviceAreas,
          label: 'Browse all service areas',
          context: `Local conditions change how ${lowerFirst(service.shortName)} are specified.`,
        },
        {
          href: STATIC_ROUTES.contact,
          label: 'Arrange a site survey',
          context: 'A twenty-minute visit is what turns an estimate into a firm price.',
        },
      ],
    },
  ];
}

function serviceIntentGroups(target: PageTarget): readonly LinkGroup[] {
  const service = target.service;
  const intent = target.intent;
  if (!service || !intent) return [];

  const label = taxonomyLabelFor(service.slug, intent.slug) ?? intent.label;
  const family = SERVICE_TAXONOMY.find((entry) => entry.serviceSlug === service.slug);
  const siblingSubsections =
    family?.children
      .filter((child) => child.intentSlug !== intent.slug)
      .map((child) => ({
        href: serviceIntentPath(service, { slug: child.intentSlug }),
        label: child.label,
      })) ?? [];

  const states = getStates();
  const stateGroupsLinks: LinkGroup[] = states.map((state) => {
    const cities = getCitiesByState(state.id);
    return {
      heading: `${label} in ${state.name}`,
      links: cities.map((city) => ({
        href: serviceInCityIntentPath(service, state, city, intent),
        label: `${label} in ${city.name}`,
        context: city.localConsiderations,
      })),
    };
  });

  return [
    {
      heading: 'Parent service',
      links: [
        {
          href: servicePath(service),
          label: service.name,
          context: 'All subsections and state coverage for this product family.',
        },
      ],
    },
    ...(siblingSubsections.length > 0
      ? [{ heading: 'Other subsections', links: siblingSubsections }]
      : []),
    ...stateGroupsLinks,
    {
      heading: 'Read before you decide',
      links: editorialGuideLinks(target),
    },
  ];
}

function stateGroups(target: PageTarget): readonly LinkGroup[] {
  const state = target.location?.state;
  if (!state) return [];

  const cities = order(
    getCitiesByState(state.id),
    `state:${state.id}`,
    (city) => city.id,
  ).slice(0, LINK_LIMITS.citiesOnStatePage);

  return [
    {
      heading: `Cities in ${state.name}`,
      links: cities.map((city) => ({
        href: cityPath(state, city),
        label: city.name,
        context: city.localConsiderations,
      })),
    },
    {
      heading: 'Services',
      links: getServices().map((service) => ({
        href: servicePath(service),
        label: service.name,
        context: service.summary,
      })),
    },
  ];
}

function cityGroups(target: PageTarget): readonly LinkGroup[] {
  const location = target.location;
  const city = location?.city;
  if (!location || !city) return [];

  const areas = order(getAreasByCity(city.id), `city:${city.id}`, (area) => area.id).slice(
    0,
    LINK_LIMITS.areasOnCityPage,
  );
  const nearby = getNeighbouringCities(city).slice(0, LINK_LIMITS.nearbyCities);

  const groups: LinkGroup[] = [
    {
      heading: `All services in ${city.name}`,
      priority: 0,
      links: getServices().map((service) => ({
        href: serviceInCityPath(service, location.state, city),
        label: `${service.name} in ${city.name}`,
        context: service.summary,
      })),
    },
  ];

  if (areas.length > 0) {
    groups.push({
      heading: `Localities in ${city.name}`,
      priority: 50,
      links: areas.map((area) => ({
        href: areaPath(location.state, city, area),
        label: area.name,
        context: area.notes,
      })),
    });

    // Every service × first N localities so no service-area pair is orphaned.
    for (const service of getServices()) {
      groups.push({
        heading: `${service.shortName} in ${city.name} localities`,
        priority: 55,
        links: areas.slice(0, 24).map((area) => ({
          href: serviceInAreaPath(service, location.state, city, area),
          label: `${service.shortName} in ${area.name}`,
        })),
      });
    }
  }

  if (nearby.length > 0) {
    groups.push({
      heading: 'Nearby cities',
      priority: 30,
      links: neighbourLinks(nearby, (entry) => entry.name),
    });
  }

  groups.push({
    heading: 'Also useful',
    links: [
      {
        href: statePath(location.state),
        label: `All of ${location.state.name}`,
        context: 'State-wide conditions and the cities we cover.',
      },
      { href: STATIC_ROUTES.pricingGuide, label: 'What drives the cost of a job' },
    ],
  });

  return groups;
}

function areaGroups(target: PageTarget): readonly LinkGroup[] {
  const location = target.location;
  const area = location?.area;
  const city = location?.city;
  if (!location || !area || !city) return [];

  const adjacent = getAdjacentAreas(area).slice(0, LINK_LIMITS.nearbyAreas);

  const groups: LinkGroup[] = [
    {
      heading: `All services in ${area.name}`,
      priority: 0,
      links: getServices().map((service) => ({
        href: serviceInAreaPath(service, location.state, city, area),
        label: `${service.name} in ${area.name}`,
        context: service.summary,
      })),
    },
    {
      heading: 'Also useful',
      priority: 1,
      links: [
        {
          href: cityPath(location.state, city),
          label: `All of ${city.name}`,
          context: 'City-wide conditions and every locality we cover.',
        },
        { href: statePath(location.state), label: location.state.name },
        { href: STATIC_ROUTES.contact, label: 'Arrange a site survey' },
      ],
    },
  ];

  if (adjacent.length > 0) {
    groups.push({
      heading: 'Nearby localities',
      priority: 40,
      links: adjacent.map((entry) => ({
        href: areaPath(location.state, city, entry),
        label: entry.name,
        context: entry.notes,
      })),
    });

    // Dense cross-links: every service × nearest localities (capped neighbours).
    const nearSlice = adjacent.slice(0, 8);
    for (const service of getServices()) {
      groups.push({
        heading: `${service.shortName} in nearby localities`,
        priority: 45,
        links: nearSlice.map((entry) => ({
          href: serviceInAreaPath(service, location.state, city, entry),
          label: `${service.shortName} in ${entry.name}`,
        })),
      });
    }
  }

  const moreLocalities = getAreasByCity(city.id)
    .filter((entry) => entry.id !== area.id && !adjacent.some((near) => near.id === entry.id))
    .slice(0, LINK_LIMITS.areasOnCityPage);
  if (moreLocalities.length > 0) {
    groups.push({
      heading: `More localities in ${city.name}`,
      priority: 60,
      links: moreLocalities.map((entry) => ({
        href: areaPath(location.state, city, entry),
        label: entry.name,
        context: entry.notes,
      })),
    });
  }

  return groups;
}

function districtGroups(target: PageTarget): readonly LinkGroup[] {
  const location = target.location;
  const district = location?.district;
  if (!location || !district) return [];

  const state = location.state;
  const cities = order(
    getCitiesByDistrict(district.id),
    `district:${district.id}`,
    (city) => city.id,
  ).slice(0, LINK_LIMITS.citiesOnDistrictPage);

  const linked = district.neighbouringDistrictIds
    .map((id) => getDistrictById(id))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== undefined);
  const siblings =
    linked.length > 0
      ? linked
      : getDistrictsByState(state.id).filter((entry) => entry.id !== district.id).slice(0, 12);

  const groups: LinkGroup[] = [
    {
      heading: `Services in ${district.name}`,
      links: getServices().map((service) => ({
        href: serviceInDistrictPath(service, state, district),
        label: `${service.name} in ${district.name}`,
        context: service.summary,
      })),
    },
  ];

  if (cities.length > 0) {
    groups.push({
      heading: `Cities in ${district.name}`,
      links: cities.map((city) => ({
        href: cityPath(state, city),
        label: city.name,
        context: city.localConsiderations,
      })),
    });
  }

  if (siblings.length > 0) {
    groups.push({
      heading: `Nearby districts in ${state.name}`,
      links: siblings.map((entry) => ({
        href: districtPath(state, entry),
        label: entry.name,
        context: entry.localConsiderations,
      })),
    });
  }

  groups.push({
    heading: 'Also useful',
    links: [
      {
        href: statePath(state),
        label: `All of ${state.name}`,
        context: 'State-wide climate and every district we map.',
      },
      { href: STATIC_ROUTES.pricingGuide, label: 'What drives the cost of a job' },
    ],
  });

  return groups;
}

function serviceLocationGroups(target: PageTarget): readonly LinkGroup[] {
  const location = target.location;
  const service = target.service;
  if (!location || !service) return [];

  const city = location.city;
  const area = location.area;
  const district = location.district;
  const groups: LinkGroup[] = [];

  // Priority 0–10: must never be starved by locality dumps.
  groups.push({
    heading: `All services in ${placeName(target)}`,
    priority: 0,
    links: allServiceLinksForLocation(target),
  });

  const related = relatedServiceLinks(target);
  if (related.length > 0) {
    groups.push({ heading: 'Related services here', priority: 1, links: related });
  }

  if (
    city &&
    !target.intent &&
    (target.kind === 'serviceInCity' || target.kind === 'serviceInArea')
  ) {
    const intents = area
      ? intentsForServiceInArea(getSearchIntents(), service, city)
      : intentsForServiceInCity(getSearchIntents(), service, city);
    if (intents.length > 0) {
      groups.push({
        heading: `More about ${service.name} in ${placeName(target)}`,
        priority: 2,
        links: intents.slice(0, LINK_LIMITS.taxonomyIntents).map((intent) => ({
          href:
            area && city
              ? serviceInAreaIntentPath(service, location.state, city, area, intent)
              : serviceInCityIntentPath(service, location.state, city, intent),
          label: `${service.name} ${intent.titlePhrase}`,
        })),
      });
    }

    const family = SERVICE_TAXONOMY.find((entry) => entry.serviceSlug === service.slug);
    const allowedSlugs = new Set(intents.map((intent) => intent.slug));
    if (family) {
      const taxonomyLinks = family.children
        .filter((child) => child.intentSlug && allowedSlugs.has(child.intentSlug))
        .slice(0, LINK_LIMITS.taxonomyIntents)
        .map((child) => ({
          href:
            area && city
              ? serviceInAreaIntentPath(service, location.state, city, area, {
                  slug: child.intentSlug!,
                })
              : serviceInCityIntentPath(service, location.state, city, {
                  slug: child.intentSlug!,
                }),
          label: child.label,
        }));
      if (taxonomyLinks.length > 0) {
        groups.push({
          heading: `${family.heading} options in ${placeName(target)}`,
          priority: 3,
          links: taxonomyLinks,
        });
      }
    }
  }

  if (city && target.intent && (target.kind === 'serviceInCityIntent' || target.kind === 'serviceInAreaIntent')) {
    const allowed = area
      ? intentsForServiceInArea(getSearchIntents(), service, city)
      : intentsForServiceInCity(getSearchIntents(), service, city);
    const siblings = allowed.filter((entry) => entry.slug !== target.intent?.slug);
    if (siblings.length > 0) {
      groups.push({
        heading: `Related searches in ${placeName(target)}`,
        priority: 2,
        links: siblings.slice(0, LINK_LIMITS.taxonomyIntents).map((intent) => ({
          href:
            area && city
              ? serviceInAreaIntentPath(service, location.state, city, area, intent)
              : serviceInCityIntentPath(service, location.state, city, intent),
          label: `${service.name} ${intent.titlePhrase}`,
        })),
      });
    }
  }

  if (target.kind === 'serviceInDistrict' && district) {
    const cities = order(
      getCitiesByDistrict(district.id),
      `svc-dist:${district.id}`,
      (entry) => entry.id,
    ).slice(0, LINK_LIMITS.citiesOnDistrictPage);
    if (cities.length > 0) {
      groups.push({
        heading: `${service.name} in ${district.name} cities`,
        priority: 20,
        links: cities.map((entry) => ({
          href: serviceInCityPath(service, location.state, entry),
          label: `${service.name} in ${entry.name}`,
          context: entry.localConsiderations,
        })),
      });
    }

    const linked = district.neighbouringDistrictIds
      .map((id) => getDistrictById(id))
      .filter((entry): entry is NonNullable<typeof entry> => entry !== undefined);
    const siblings =
      linked.length > 0
        ? linked
        : getDistrictsByState(location.state.id)
            .filter((entry) => entry.id !== district.id)
            .slice(0, 8);
    if (siblings.length > 0) {
      groups.push({
        heading: `${service.name} in nearby districts`,
        priority: 25,
        links: siblings.map((entry) => ({
          href: serviceInDistrictPath(service, location.state, entry),
          label: `${service.name} in ${entry.name}`,
        })),
      });
    }
  }

  // Lateral locality graph — after critical service/intent groups.
  if (area && city) {
    const adjacent = getAdjacentAreas(area).slice(0, LINK_LIMITS.nearbyAreas);
    if (adjacent.length > 0) {
      groups.push({
        heading: `${service.name} in nearby localities`,
        priority: 40,
        links: adjacent.map((entry) => ({
          href: serviceInAreaPath(service, location.state, city, entry),
          label: `${service.name} in ${entry.name}`,
        })),
      });
    }

    const moreInCity = order(
      getAreasByCity(city.id).filter(
        (entry) => entry.id !== area.id && !adjacent.some((near) => near.id === entry.id),
      ),
      `svc-area-more:${city.id}:${service.id}`,
      (entry) => entry.id,
    ).slice(0, LINK_LIMITS.areasOnCityPage);
    if (moreInCity.length > 0) {
      groups.push({
        heading: `${service.name} across ${city.name}`,
        priority: 60,
        links: moreInCity.map((entry) => ({
          href: serviceInAreaPath(service, location.state, city, entry),
          label: `${service.name} in ${entry.name}`,
          context: entry.notes,
        })),
      });
    }
  }

  if (!area && city) {
    const localities = order(
      getAreasByCity(city.id),
      `svc-loc:${city.id}:${service.id}`,
      (entry) => entry.id,
    ).slice(0, LINK_LIMITS.areasOnCityPage);
    if (localities.length > 0) {
      groups.push({
        heading: `${service.name} across ${city.name} localities`,
        priority: 50,
        links: localities.map((entry) => ({
          href: serviceInAreaPath(service, location.state, city, entry),
          label: `${service.name} in ${entry.name}`,
          context: entry.notes,
        })),
      });
    }

    const nearby = getNeighbouringCities(city).slice(0, LINK_LIMITS.nearbyCities);
    const links = nearby.flatMap((entry) => {
      const entryState = getStateById(entry.stateId);
      if (!entryState) return [];
      return [
        {
          href: serviceInCityPath(service, entryState, entry),
          label: `${service.name} in ${entry.name}`,
        },
      ];
    });

    if (links.length > 0) {
      groups.push({ heading: `${service.name} in nearby cities`, priority: 30, links });
    }
  }

  const guides = editorialGuideLinks(target);
  if (guides.length > 0) {
    groups.push({ heading: 'Read before you decide', priority: 5, links: guides });
  }

  // Parent links, which are what stop deep pages becoming orphans.
  const parents: ContextualLink[] = [];
  if (area && city) {
    parents.push({
      href: areaPath(location.state, city, area),
      label: `Everything we do in ${area.name}`,
    });
    parents.push({
      href: serviceInCityPath(service, location.state, city),
      label: `${service.name} across ${city.name}`,
    });
  } else if (city) {
    parents.push({
      href: cityPath(location.state, city),
      label: `Everything we do in ${city.name}`,
    });
    parents.push({ href: servicePath(service), label: `${service.name} explained in full` });
  } else if (district && target.kind === 'serviceInDistrict') {
    parents.push({
      href: districtPath(location.state, district),
      label: `Everything we do in ${district.name}`,
    });
    parents.push({ href: servicePath(service), label: `${service.name} explained in full` });
    parents.push({ href: statePath(location.state), label: location.state.name });
  }
  parents.push({ href: STATIC_ROUTES.contact, label: 'Arrange a site survey' });

  groups.push({ heading: 'Up a level', priority: 1, links: parents });

  return groups;
}

/* ------------------------------------------------------------------- assembly */

/**
 * Builds the contextual link groups for a page, deduplicated against itself and
 * capped at `LINK_LIMITS.maxContextualLinksPerPage` in total.
 *
 * Groups are sorted by `priority` (low first) so “all services”, intents, and
 * parent links cannot be starved by large locality dumps.
 */
export function buildContextualLinks(target: PageTarget): readonly LinkGroup[] {
  let groups: readonly LinkGroup[];

  switch (target.kind) {
    case 'service':
      groups = serviceGroups(target);
      break;
    case 'serviceIntent':
      groups = serviceIntentGroups(target);
      break;
    case 'state':
      groups = stateGroups(target);
      break;
    case 'city':
      groups = cityGroups(target);
      break;
    case 'district':
      groups = districtGroups(target);
      break;
    case 'area':
      groups = areaGroups(target);
      break;
    case 'serviceInCity':
    case 'serviceInArea':
    case 'serviceInDistrict':
    case 'serviceInCityIntent':
    case 'serviceInAreaIntent':
      groups = serviceLocationGroups(target);
      break;
    default:
      groups = [];
  }

  const ordered = [...groups].sort(
    (left, right) => (left.priority ?? 100) - (right.priority ?? 100),
  );

  const seen = new Set<string>([target.path]);
  const capped: LinkGroup[] = [];
  let budget = LINK_LIMITS.maxContextualLinksPerPage;

  for (const group of ordered) {
    if (budget <= 0) break;
    const links: ContextualLink[] = [];
    for (const link of group.links) {
      if (budget <= 0) break;
      if (seen.has(link.href)) continue;
      seen.add(link.href);
      links.push(link);
      budget -= 1;
    }
    if (links.length > 0) capped.push({ heading: group.heading, links });
  }

  return capped;
}
