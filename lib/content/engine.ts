import { business } from '@/config/business';
import { LINK_LIMITS } from '@/config/constants';
import { taxonomyLabelFor } from '@/config/service-taxonomy';
import {
  composeEntityModules,
  composePageFaqs,
  contentFingerprint,
  pageSeed,
} from '@/lib/content/entity-composer';
import {
  areaEnquirySteps,
  areaMaintenanceParagraph,
  areaNeighbourhoodParagraph,
  areaPricingParagraph,
  areaServiceCoverageItems,
  areaServiceFitParagraph,
  cityEnquirySteps,
  cityLandmarkParagraph,
  cityMaintenanceParagraph,
  cityPricingParagraph,
  cityServiceClimateNote,
  cityServiceCoverageItems,
  intentLocalParagraph,
  serviceLocationQuoteParagraph,
  stateInstallationRhythm,
} from '@/lib/content/local-depth';
import { orderDeterministic } from '@/lib/utils/hash';
import {
  AREA_BUILT_FORM_GUIDANCE,
  AREA_PROFILE_GUIDANCE,
  CITY_BUILT_FORM_GUIDANCE,
  CITY_TIER_ACCESS_NOTE,
} from '@/lib/content/vocabulary';
import {
  findFaqs,
  getAdjacentAreas,
  getAreasByCity,
  getCitiesByDistrict,
  getCitiesByState,
  getDistrictById,
  getDistrictsByState,
  getServices,
  getStates,
} from '@/lib/data/repository';
import type { District, Faq, SearchIntentModuleId, Service, TraitKey } from '@/lib/data/schemas';
import { locationLabel, shortLocationLabel } from '@/lib/routing/resolve';
import { buildPageCopy } from '@/lib/seo/copy';
import { countWords, joinWithAnd, lowerFirst, unique } from '@/lib/utils/text';
import type { ContentBlock, ContentModule, PageContent } from '@/types/content';
import type { PageTarget } from '@/types/routing';

/**
 * The content engine.
 *
 * Pages are assembled from reusable modules rather than written per URL, but
 * the inputs to those modules differ by service and by the environmental traits
 * of the place, so the output differs in substance and not just in place names.
 * `assessContent` then measures how much of each page is genuinely its own,
 * which is what the publishing gate uses to refuse thin pages.
 */

function prose(paragraphs: readonly string[]): ContentBlock {
  return { type: 'prose', paragraphs };
}

function makeModule(
  id: ContentModule['id'],
  heading: string,
  blocks: readonly ContentBlock[],
  options: { readonly specific?: boolean; readonly callout?: string } = {},
): ContentModule {
  return {
    id,
    heading,
    blocks,
    specific: options.specific ?? false,
    ...(options.callout ? { callout: options.callout } : {}),
  };
}

/**
 * Selects the service's technical guidance for the traits actually in force,
 * falling back to its default when a location declares no traits.
 */
function traitGuidance(
  service: Service,
  traits: readonly TraitKey[],
  limit = 2,
): readonly string[] {
  const matched: string[] = [];
  for (const trait of traits) {
    const paragraph = service.environmentalGuidance[trait];
    if (paragraph) matched.push(paragraph);
    if (matched.length >= limit) break;
  }
  if (matched.length === 0) matched.push(service.environmentalGuidance.default);
  return unique(matched);
}

/* ------------------------------------------------------- shared service modules */

function serviceDetailModules(
  service: Service,
  options: { readonly sharedCatalogue?: boolean } = {},
): readonly ContentModule[] {
  /** Shared catalogue copy must not inflate location specificity scores. */
  const specific = options.sharedCatalogue ? false : true;
  return [
    makeModule(
      'benefits',
      'What you get from it',
      [{ type: 'definitions', items: service.benefits }],
      { specific },
    ),
    makeModule(
      'features',
      'How the system is built',
      [{ type: 'definitions', items: service.features }],
      { specific },
    ),
    makeModule(
      'applications',
      'Where it is used',
      [{ type: 'definitions', items: service.applications }],
      { specific },
    ),
    makeModule('materials', 'Materials we specify', [{ type: 'specs', items: service.materials }], {
      specific,
    }),
    makeModule(
      'installation',
      'How the installation runs',
      [
        prose([
          service.installation.surveyRequired
            ? `This is survey-led work. A typical job takes ${service.installation.typicalDurationHours[0]} to ${service.installation.typicalDurationHours[1]} hours on site once the specification is settled.`
            : `No separate survey visit is needed for most jobs. Installation typically takes ${service.installation.typicalDurationHours[0]} to ${service.installation.typicalDurationHours[1]} hours.`,
        ]),
        { type: 'steps', items: service.installation.steps },
        { type: 'list', items: service.installation.sitePreparation },
      ],
      { specific },
    ),
    makeModule(
      'safety',
      'Safety and standards',
      [
        { type: 'list', items: service.safety.standards },
        { type: 'definitions', items: service.safety.notes },
      ],
      { specific },
    ),
    makeModule(
      'maintenance',
      'Keeping it working',
      [
        prose([
          `We recommend an inspection every ${service.maintenance.inspectionIntervalMonths} months. Most of it is straightforward enough to do yourself.`,
        ]),
        { type: 'definitions', items: service.maintenance.tasks },
      ],
      { specific },
    ),
    makeModule(
      'quality',
      'Quality checks and warranty',
      [
        prose([
          service.quality.warrantyYears > 0
            ? `This product carries a ${service.quality.warrantyYears}-year warranty on materials and workmanship, on the basis that the recommended inspection is carried out.`
            : 'This is temporary works, so it carries a workmanship guarantee for the duration of the programme rather than a multi-year warranty.',
        ]),
        { type: 'list', items: service.quality.checks },
      ],
      { specific },
    ),
    makeModule(
      'pricingFactors',
      'What drives the price',
      [{ type: 'definitions', items: service.pricingFactors }],
      {
        specific,
        callout:
          'We do not publish a rate per square foot, because the same area can differ in price by a factor of two depending on grade, spacing and access. Every quotation states these explicitly.',
      },
    ),
  ];
}

/* --------------------------------------------------------------- page builders */

function buildServicePage(target: PageTarget): readonly ContentModule[] {
  const service = target.service;
  if (!service) return [];

  return [
    makeModule(
      'overview',
      // `shortName` is sentence-cased in the data, so lowercasing its first
      // character yields "invisible grills" rather than "invisible Grills".
      `What ${lowerFirst(service.shortName)} are for`,
      [prose([service.intro, service.problemSolved])],
      { specific: true },
    ),
    ...serviceDetailModules(service),
  ];
}

/**
 * National subsection hub: unique intent-led copy + service detail modules
 * reordered by focus, plus a state matrix so pages are not Hyderabad clones.
 */
function buildServiceIntentPage(target: PageTarget): readonly ContentModule[] {
  const service = target.service;
  const intent = target.intent;
  if (!service || !intent) return [];

  const label = taxonomyLabelFor(service.slug, intent.slug) ?? intent.label;
  const states = getStates();

  const stateRows = states.map((state) => {
    const cities = getCitiesByState(state.id);
    return {
      title: state.name,
      detail: `${label} is available across ${cities.length} mapped ${cities.length === 1 ? 'city' : 'cities'} in ${state.name}, including ${joinWithAnd(cities.slice(0, 6).map((city) => city.name))}. Open a city page for climate-specific grade and spacing notes — ${state.climateContext.slice(0, 160)}${state.climateContext.length > 160 ? '…' : ''}`,
    };
  });

  const intentIntro = makeModule(
    'intentFocus',
    label,
    [
      prose([
        intent.lede,
        `${service.summary} This hub is only for ${label}; sibling subsections (price, installation, balcony, and so on) keep their own URLs so crawlers do not see the same body pasted under different headings.`,
        `Below, every published state links onward to city pages for ${lowerFirst(service.shortName)}. Locality and intent pages under those cities carry place-specific notes rather than repeating this national overview.`,
      ]),
    ],
    { specific: true },
  );

  const facetModule =
    intent.facetPoints && intent.facetPoints.length > 0
      ? makeModule(
          'facetDetail',
          `What makes ${label} different`,
          [
            {
              type: 'definitions',
              items: intent.facetPoints.map((point) => ({
                title: point.title,
                detail: point.detail,
              })),
            },
          ],
          { specific: true },
        )
      : null;

  const coverage = makeModule(
    'coverage',
    `${label} by state`,
    [
      prose([
        `Use this matrix to reach a city-level ${lowerFirst(service.shortName)} page. Each state row summarises coverage; city pages then diverge by climate and building stock.`,
      ]),
      { type: 'definitions', items: stateRows },
    ],
    { specific: true },
  );

  const why = makeModule(
    'whyChoose',
    `Why ${business.shortName} for ${label}`,
    [
      {
        type: 'definitions',
        items: [
          ...business.proofPoints.slice(0, 4),
          {
            title: 'Variant-specific quotation',
            detail: `Quotes for ${label} name the intent-relevant spacing, mesh, or hanger detail — not a generic ${lowerFirst(service.shortName)} lump sum.`,
          },
        ],
      },
    ],
    { specific: true },
  );

  const base = reorderModules(serviceDetailModules(service), intent.focusModules);
  return [intentIntro, ...(facetModule ? [facetModule] : []), coverage, ...base, why];
}

function reorderModules(
  modules: readonly ContentModule[],
  focus: readonly SearchIntentModuleId[],
): readonly ContentModule[] {
  const focusSet = new Set<string>(focus);
  const focused = modules.filter((entry) => focusSet.has(entry.id));
  const rest = modules.filter((entry) => !focusSet.has(entry.id));
  return [...focused, ...rest];
}

function landingIntroduction(
  target: PageTarget,
  service: Service,
  place: string,
  fullPlace: string,
): ContentModule {
  const { location, traits } = target;
  const city = location?.city;
  const area = location?.area;
  const state = location?.state;

  const fit =
    area && city
      ? areaServiceFitParagraph(service, area, city)
      : city && state
        ? cityServiceClimateNote(city, state, service)
        : location?.district && state
          ? `${location.district.intro} ${location.district.localConsiderations}`
          : service.intro;

  const localProblem =
    area?.notes ??
    city?.localConsiderations ??
    location?.district?.localConsiderations ??
    state?.climateContext ??
    service.problemSolved;

  const traitNotes = traitGuidance(service, traits, 2);
  const landmarkLine =
    area && area.landmarks.length > 0
      ? `Landmarks such as ${joinWithAnd(area.landmarks.slice(0, 3))} help crews route visits, but the specification still follows the measured opening rather than the map pin.`
      : city && city.landmarks.length > 0
        ? `Across ${city.name}, work near ${joinWithAnd(city.landmarks.slice(0, 3))} still starts with the same survey checklist: substrate, spacing, and access.`
        : location?.district
          ? `Across ${location.district.name}, headquarters at ${location.district.headquarters} is a routing anchor, but every quotation still follows measured openings and association rules.`
          : `In ${place}, we confirm association rules and access before locking materials on the quotation.`;

  const whyUs = `${business.name} installs ${lowerFirst(service.shortName)} with graded materials named on a written quote, so ${fullPlace} customers can compare specification rather than brochure language.`;

  return makeModule(
    'introduction',
    `${service.name} in ${place}`,
    [
      prose([
        fit,
        `${service.summary} ${service.problemSolved}`,
        `${localProblem} ${traitNotes.join(' ')}`,
        landmarkLine,
        whyUs,
      ]),
    ],
    { specific: true },
  );
}

function landingFeatureRows(service: Service): readonly { title: string; detail: string }[] {
  const materialNames = service.materials.map((entry) => entry.name);
  const [minHours, maxHours] = service.installation.typicalDurationHours;
  return [
    {
      title: 'Material',
      detail: `${joinWithAnd(materialNames)}. ${service.materials[0]?.detail ?? 'Grade and construction are named on every quotation.'}`,
    },
    {
      title: 'Mesh size / spacing',
      detail:
        service.features[0]?.detail ??
        'Spacing and aperture are set on survey for child safety, pet safety, or bird control as required by the opening.',
    },
    {
      title: 'Warranty',
      detail:
        service.quality.warrantyYears > 0
          ? `${service.quality.warrantyYears}-year cover on materials and workmanship when recommended inspections are kept.`
          : 'Workmanship cover matches the programme duration for temporary works; permanent systems carry the product warranty on the quote.',
    },
    {
      title: 'Life expectancy',
      detail:
        'Service life depends on grade, UV exposure, and inspection — coastal and high-rise openings need the higher-spec materials listed in the materials section.',
    },
    {
      title: 'Installation time',
      detail: `Typical on-site time is ${minHours}–${maxHours} hours once measurement and material selection are settled${service.installation.surveyRequired ? ', after a survey visit' : ''}.`,
    },
    {
      title: 'Available colours / finish',
      detail:
        service.features.find((entry) => /colour|color|finish|frame/i.test(entry.title))
          ?.detail ??
        'Frame and mesh colours are confirmed on survey so the finish suits the facade rather than a stock photo.',
    },
    {
      title: 'Maintenance',
      detail: `Inspect every ${service.maintenance.inspectionIntervalMonths} months; ${service.maintenance.tasks[0]?.detail ?? 're-tension and edge checks keep the barrier effective.'}`,
    },
  ];
}

function landingInstallationSteps(
  service: Service,
  place: string,
): readonly { title: string; detail: string }[] {
  return [
    {
      title: '1. Inspection',
      detail: `We inspect the opening in ${place}, note substrate condition, and flag access or association constraints before any material is ordered.`,
    },
    {
      title: '2. Measurement',
      detail: 'Every bay is measured on site so the quotation matches the real opening, not a floor-plan guess.',
    },
    {
      title: '3. Material selection',
      detail: `Grade, spacing, and hardware are chosen for local climate and use — ${service.materials.map((entry) => entry.name).slice(0, 2).join(' or ')} as specified on the quote.`,
    },
    {
      title: '4. Installation',
      detail:
        service.installation.steps[0]?.detail ??
        `Fixings and tensioning follow the written method for ${lowerFirst(service.shortName)}, with dust control around occupied homes.`,
    },
    {
      title: '5. Quality check',
      detail: service.quality.checks.slice(0, 2).join(' '),
    },
    {
      title: '6. Final handover',
      detail:
        'You receive the installed specification, warranty basis, and inspection interval so aftercare is clear when we leave.',
    },
  ];
}

function whyChooseModule(service: Service, place: string): ContentModule {
  const localPoint = {
    title: `Local coverage in ${place}`,
    detail: `Surveys and installs for ${lowerFirst(service.shortName)} in ${place} are scheduled with travel batched across nearby localities so access windows stay predictable.`,
  };
  return makeModule(
    'whyChoose',
    `Why choose ${business.shortName} in ${place}`,
    [
      {
        type: 'definitions',
        items: [...business.proofPoints, localPoint],
      },
    ],
    { specific: true },
  );
}

function coverageModule(target: PageTarget, service: Service): ContentModule | null {
  const city = target.location?.city;
  const area = target.location?.area;
  const state = target.location?.state;
  if (!city || !state) return null;

  if (area) {
    const nearby = getAdjacentAreas(area).slice(0, LINK_LIMITS.nearbyAreas);
    const extras = getAreasByCity(city.id)
      .filter((entry) => entry.id !== area.id && !nearby.some((near) => near.id === entry.id))
      .slice(0, Math.max(0, LINK_LIMITS.nearbyAreas - nearby.length));
    const names = [...nearby, ...extras].map((entry) => entry.name);
    if (names.length === 0) return null;
    return makeModule(
      'coverage',
      `Service areas near ${area.name}`,
      [
        prose([
          `We also install ${lowerFirst(service.shortName)} across nearby localities in ${city.name}, including ${joinWithAnd(names.slice(0, LINK_LIMITS.nearbyAreas))}${names.length > LINK_LIMITS.nearbyAreas ? `, and ${names.length - LINK_LIMITS.nearbyAreas} more listed in the links below` : ''}.`,
        ]),
        { type: 'list', items: names.slice(0, LINK_LIMITS.nearbyAreas) },
      ],
      { specific: true },
    );
  }

  const areas = getAreasByCity(city.id).slice(0, LINK_LIMITS.areasOnCityPage);
  if (areas.length === 0) return null;
  return makeModule(
    'coverage',
    `Service areas across ${city.name}`,
    [
      prose([
        `${business.shortName} covers ${areas.length} ${areas.length === 1 ? 'locality' : 'localities'} in ${city.name} for ${lowerFirst(service.shortName)}, including ${joinWithAnd(areas.slice(0, 10).map((entry) => entry.name))}${areas.length > 10 ? ', and the wider list below' : ''}.`,
      ]),
      { type: 'list', items: areas.map((entry) => entry.name) },
    ],
    { specific: true },
  );
}

/**
 * Locality landing — entity composer first; catalogue benefits only as shared mass.
 */
function buildServiceInAreaLanding(target: PageTarget): readonly ContentModule[] {
  const { service, location } = target;
  const area = location?.area;
  const city = location?.city;
  if (!service || !location || !area || !city) return [];

  const place = shortLocationLabel(location);
  const entity = [...composeEntityModules(target)];
  const shared = makeModule(
    'benefits',
    `Core ${lowerFirst(service.shortName)} outcomes`,
    [{ type: 'definitions', items: service.benefits.slice(0, 4) }],
    { specific: false },
  );
  const fit = makeModule(
    'neighbourhood',
    `Fit check for ${place}`,
    [
      prose([
        areaServiceFitParagraph(service, area, city),
        areaNeighbourhoodParagraph(area, city),
        areaPricingParagraph(area, city),
      ]),
    ],
    { specific: true },
  );

  return [...entity, fit, shared];
}

/** City service landing — entity composer + city-specific reinforcement modules. */
function buildServiceInCityLanding(target: PageTarget): readonly ContentModule[] {
  const { service, location, traits } = target;
  const city = location?.city;
  if (!service || !location || !city) return [];

  const place = shortLocationLabel(location);
  const fullPlace = locationLabel(location);
  const seed = pageSeed(target);

  const entity = [...composeEntityModules(target)];
  const modules: ContentModule[] = [
    ...entity,
    makeModule(
      'overview',
      `City brief for ${place}`,
      [
        prose([
          ...landingIntroduction(target, service, place, fullPlace).blocks.flatMap((block) =>
            block.type === 'prose' ? block.paragraphs : [],
          ),
          ...traitGuidance(service, traits),
          CITY_BUILT_FORM_GUIDANCE[city.builtForm],
          CITY_TIER_ACCESS_NOTE[city.tier],
          cityLandmarkParagraph(city, location.state),
          cityServiceClimateNote(city, location.state, service),
          cityPricingParagraph(city),
          cityMaintenanceParagraph(city),
          serviceLocationQuoteParagraph(service, place, `${city.id}:${service.id}`, traits),
        ]),
      ],
      { specific: true },
    ),
    makeModule(
      'materials',
      `Material notes for ${city.name}`,
      [{ type: 'specs', items: service.materials }],
      { specific: false },
    ),
    makeModule(
      'benefits',
      `Catalogue outcomes (${lowerFirst(service.shortName)})`,
      [{ type: 'definitions', items: orderDeterministic(service.benefits, seed, (b) => b.title) }],
      { specific: false },
    ),
    makeModule(
      'programme',
      `What to send before we survey in ${city.name}`,
      [{ type: 'steps', items: cityEnquirySteps(city) }],
      { specific: true },
    ),
  ];

  const coverage = coverageModule(target, service);
  if (coverage) {
    modules.push({ ...coverage, specific: true });
  }

  return modules;
}

function buildServiceLocationPage(target: PageTarget): readonly ContentModule[] {
  if (target.kind === 'serviceInDistrict') {
    return buildServiceInDistrictLanding(target);
  }
  if (target.kind === 'serviceInArea' || target.location?.area) {
    return buildServiceInAreaLanding(target);
  }
  return buildServiceInCityLanding(target);
}

function buildServiceLocationIntentPage(target: PageTarget): readonly ContentModule[] {
  const intent = target.intent;
  const service = target.service;
  const location = target.location;
  if (!intent || !service || !location) return [];

  const place = shortLocationLabel(location);
  const localNote =
    location.area?.notes ?? location.city?.localConsiderations ?? location.state.climateContext;

  const intentIntro = makeModule(
    'intentFocus',
    intent.label,
    [
      prose([
        intentLocalParagraph(intent, service, place, target.path, localNote),
      ]),
    ],
    { specific: true },
  );

  const facetModule =
    intent.facetPoints && intent.facetPoints.length > 0
      ? makeModule(
          'facetDetail',
          `${intent.label} details for ${place}`,
          [
            {
              type: 'definitions',
              items: intent.facetPoints.map((point) => ({
                title: point.title,
                detail: point.detail,
              })),
            },
          ],
          { specific: true },
        )
      : null;

  const thinBase: ContentModule[] = [
    makeModule(
      'localConditions',
      `Local conditions in ${place}`,
      [
        prose([
          ...(location.area
            ? [location.area.notes, AREA_BUILT_FORM_GUIDANCE[location.area.builtForm]]
            : location.city
              ? [
                  location.city.localConsiderations,
                  CITY_BUILT_FORM_GUIDANCE[location.city.builtForm],
                ]
              : [location.state.climateContext]),
          ...traitGuidance(service, target.traits, 1),
        ]),
      ],
      { specific: true },
    ),
    makeModule(
      'benefits',
      'What you get',
      [{ type: 'definitions', items: service.benefits.slice(0, 4) }],
      { specific: true },
    ),
    makeModule(
      'installation',
      'How installation runs',
      [{ type: 'steps', items: landingInstallationSteps(service, place).slice(0, 4) }],
      { specific: true },
    ),
    makeModule(
      'pricingFactors',
      'What drives the price',
      [{ type: 'definitions', items: service.pricingFactors.slice(0, 4) }],
      { specific: true },
    ),
    whyChooseModule(service, place),
    makeModule('materials', 'Materials', [{ type: 'specs', items: service.materials }], {
      specific: true,
    }),
  ];

  return [
    intentIntro,
    ...(facetModule ? [facetModule] : []),
    ...reorderModules(thinBase, intent.focusModules),
  ];
}

function buildStatePage(target: PageTarget): readonly ContentModule[] {
  const state = target.location?.state;
  if (!state) return [];

  const services = getServices();
  const cities = getCitiesByState(state.id);
  const majorCities = cities.filter((city) => city.tier <= 2);
  const otherCities = cities.filter((city) => city.tier > 2);

  const cityServiceMatrix = cities.flatMap((city) =>
    services.map((service) => ({
      title: `${service.name} in ${city.name}`,
      detail: cityServiceClimateNote(city, state, service),
    })),
  );

  const cityClimateRows = cities.map((city) => ({
    title: `${city.name} — climate and stock`,
    detail: `${city.localConsiderations} ${city.intro} Built form focus: ${city.builtForm.replace(/-/gu, ' ')}. Tier ${city.tier} access note: ${CITY_TIER_ACCESS_NOTE[city.tier]}`,
  }));

  const serviceDecisionRows = services.map((service) => ({
    title: `When to choose ${service.name}`,
    detail: `${service.problemSolved} ${service.summary} Typical site time after survey: ${service.installation.typicalDurationHours[0]}–${service.installation.typicalDurationHours[1]} hours. Materials and spacing still follow the survey in each ${state.name} city.`,
  }));

  return [
    makeModule('introduction', `Working in ${state.name}`, [
      prose([
        state.intro,
        `${business.name} installs invisible grills, safety nets, sports nets, cloth hangers, duct-area nets, and building covering nets across ${state.name}, with specifications written for local climate and building stock rather than a single national package.`,
        `This state hub is the map: climate and building context, city coverage, service choices, pricing drivers, install rhythm, and aftercare. Deep buying, installation, pricing, and maintenance essays live in the cornerstone guides so locality pages can stay short and conversion-focused.`,
      ]),
    ], { specific: true }),
    makeModule('localConditions', `Building types and climate in ${state.name}`, [
      prose([
        state.buildingContext,
        state.climateContext,
        `Those two paragraphs decide most of the engineering: grade of stainless or polymer, spacing for wind or fall protection, and whether access equipment belongs on the quotation. City pages below translate this into neighbourhood-level practice.`,
        `When you compare vendors across ${state.name}, ask how their specification changes between the wettest coastal or monsoon-facing belts and the driest inland cities — a single “standard package” usually means someone is guessing.`,
      ]),
    ], { specific: true }),
    makeModule(
      'localities',
      `Cities we cover in ${state.name}`,
      [
        prose([
          cities.length > 0
            ? `We cover ${cities.length} ${cities.length === 1 ? 'city' : 'cities'} across ${state.name}, including ${joinWithAnd(cities.slice(0, 12).map((city) => city.name))}. Tier-1 and tier-2 cities usually have denser high-rise stock and stricter association rules; smaller cities often mix independent houses with mid-rise blocks.`
            : `We are expanding coverage across ${state.name}. Tell us your address and we will confirm reach before arranging a survey.`,
        ]),
        {
          type: 'definitions',
          items: [
            ...majorCities.map((city) => ({
              title: `${city.name} (tier ${city.tier})`,
              detail: `${city.localConsiderations} ${city.intro}`,
            })),
            ...otherCities.map((city) => ({
              title: city.name,
              detail: city.localConsiderations,
            })),
          ],
        },
      ],
      { specific: true },
    ),
    makeModule(
      'coverage',
      `Services across ${state.name}`,
      [
        prose([
          `Every service we offer is available across ${state.name}. What changes is not the product name but the grade, spacing, and access plan written after survey.`,
        ]),
        {
          type: 'definitions',
          items: services.map((entry) => ({
            title: entry.name,
            detail: `${entry.summary} ${entry.problemSolved}`,
          })),
        },
      ],
      { specific: true },
    ),
    makeModule(
      'applications',
      `How each city changes every service`,
      [
        prose([
          `The same balcony product behaves differently in a coastal tower, an inland IT corridor, and a district town. The matrix below covers every service we offer in each mapped city of ${state.name}; open the city page when you need neighbourhood-level access notes.`,
        ]),
        { type: 'definitions', items: cityServiceMatrix },
      ],
      { specific: true },
    ),
    makeModule(
      'audience',
      `City-by-city climate reading for ${state.name}`,
      [
        prose([
          `Use this section when you are choosing between cities or briefing a facility team that manages stock in more than one ${state.name} market. Each row restates the local considerations that change grade, spacing, and access — not a directory dump.`,
        ]),
        { type: 'definitions', items: cityClimateRows },
      ],
      { specific: true },
    ),
    makeModule(
      'features',
      `Choosing a product across ${state.name}`,
      [
        prose([
          `Most households in ${state.name} start with one hazard: child fall risk, pets, birds, drying clutter, duct debris, or façade protection during works. Match the product to that hazard first, then let the city climate push grade and spacing.`,
          `Hybrid packages are common — cables on living balconies, nets on ducts, hangers where drying is the real complaint. The buying guide walks the trade-offs in depth; the rows below are the short statewide decision map.`,
        ]),
        { type: 'definitions', items: serviceDecisionRows },
      ],
      { specific: true },
    ),
    makeModule('pricingFactors', `Pricing across ${state.name}`, [
      prose([
        `Cost in ${state.name} is driven by measured openings, hardware grade, cable or mesh spacing, height and access difficulty, and substrate condition. Coastal and high-humidity belts usually push stainless grade and inspection frequency up; dry inland cities more often allow 304 where the opening and association rules allow it.`,
        'Two openings with the same area can still differ sharply when one needs cradle access and the other is ladder-reachable from inside. That is why every firm quotation follows a site survey.',
        `Association sample flats, security deposits, and restricted drilling windows add soft cost in many ${state.name} societies. Ask vendors to estimate those lines early rather than burying them after the gatekeeper says no.`,
        `For factor-by-factor national guidance without city names, read the pricing guide. This state page only frames what ${state.name} climate and building stock tend to change.`,
      ]),
      {
        type: 'definitions',
        items: services.flatMap((service) =>
          service.pricingFactors.map((factor) => ({
            title: `${service.shortName}: ${factor.title}`,
            detail: factor.detail,
          })),
        ),
      },
    ], { specific: true }),
    makeModule('installation', `Installation programme in ${state.name}`, [
      prose([stateInstallationRhythm(state)]),
      {
        type: 'steps',
        items: [
          {
            title: 'Confirm city and locality',
            detail: `We route crews by city cluster so travel across ${state.name} does not inflate every small job.`,
          },
          {
            title: 'Survey and written scope',
            detail: 'Grade, spacing, fixings, and access method are written before fabrication.',
          },
          {
            title: 'Install and handover',
            detail: 'Tension or mesh checks and warranty basis are explained before we leave.',
          },
        ],
      },
    ], { specific: true }),
    makeModule('maintenance', `Inspection and aftercare in ${state.name}`, [
      prose([
        `Aftercare in ${state.name} follows climate as much as product type. Press cables or net at mid-span for slack, inspect anchors for rust weeping or hairline cracking, and wash surfaces. Heavy-monsoon and cyclone-exposed belts need an extra check after the season; arid inland cities can usually keep to the standard interval if the first monsoon after install looks clean.`,
        'Each city page notes the local inspection rhythm so residents and facility teams know what to book.',
      ]),
    ], { specific: true }),
    makeModule('programme', `How we schedule work in ${state.name}`, [
      prose([
        stateInstallationRhythm(state),
        `Association drilling windows, festival blackouts, and monsoon pauses all affect calendars in ${state.name}. We confirm those constraints at survey so the quotation’s labour line matches reality.`,
      ]),
    ], { specific: true }),
    makeModule(
      'whyChoose',
      `Why choose ${business.shortName} in ${state.name}`,
      [
        {
          type: 'definitions',
          items: [
            ...business.proofPoints,
            {
              title: `${cities.length} cities mapped`,
              detail: `City and locality pages across ${state.name} keep specifications local instead of copying one metro template statewide.`,
            },
          ],
        },
      ],
      { specific: true },
    ),
    makeModule(
      'safety',
      `Safety priorities across ${state.name}`,
      [
        prose([
          `Fall protection, pet containment, bird exclusion, and duct-object control show up in different ratios across ${state.name}. Coastal towers emphasise corrosion-aware hardware; inland high-rises emphasise wind and association process; district towns often mix independent houses with a few mid-rise blocks.`,
          `Use city pages for local stock notes and the buying guide when you are still choosing between invisible grills, nets, and hybrid packages. Locality pages stay short so residents searching “in {area}” can reach a survey booking without scrolling past unrelated statewide essays.`,
        ]),
        {
          type: 'definitions',
          items: services.map((service) => ({
            title: `${service.name} — safety notes`,
            detail: service.safety.notes.map((note) => `${note.title}: ${note.detail}`).join(' '),
          })),
        },
      ],
      { specific: true },
    ),
    makeModule(
      'quality',
      `Quality and warranty expectations in ${state.name}`,
      [
        prose([
          `Across ${state.name}, handover should always include the installed grade, spacing or aperture, and inspection interval. Warranty years differ by product; what should not differ is the habit of writing those facts down.`,
          `Facility teams managing multiple societies in ${state.name} should keep a bay-type register so repeat work does not restart from zero every time a new block is handed over.`,
        ]),
      ],
      { specific: true },
    ),
  ];
}

function buildCityPage(target: PageTarget): readonly ContentModule[] {
  const location = target.location;
  const city = location?.city;
  if (!location || !city) return [];

  const areas = getAreasByCity(city.id).slice(0, LINK_LIMITS.areasOnCityPage);
  const services = getServices();

  const serviceConditionItems = services.map((service) => ({
    title: service.name,
    detail: `${traitGuidance(service, target.traits, 1)[0] ?? service.environmentalGuidance.default} ${service.summary}`,
  }));

  const areaSpotlight =
    areas.length > 0
      ? areas.slice(0, 24).map((area) => ({
          title: area.name,
          detail: `${area.notes} Built form: ${area.builtForm.replace(/-/gu, ' ')}; profile: ${area.profile}.`,
        }))
      : [];

  return [
    makeModule('introduction', `Working in ${city.name}`, [
      prose([
        city.intro,
        `${business.name} covers ${services.length} services across ${city.name}, ${location.state.name}, with locality pages for neighbourhoods where building stock and access rules differ.`,
      ]),
    ], { specific: true }),
    makeModule(
      'landmarks',
      `How ${city.name} is built and used`,
      [prose([cityLandmarkParagraph(city, location.state), CITY_BUILT_FORM_GUIDANCE[city.builtForm]])],
      { specific: true },
    ),
    makeModule(
      'localConditions',
      `How conditions in ${city.name} change each installation`,
      [
        prose([
          city.localConsiderations,
          location.state.climateContext,
          CITY_TIER_ACCESS_NOTE[city.tier],
        ]),
        { type: 'definitions', items: serviceConditionItems },
      ],
      { specific: true },
    ),
    makeModule('access', `Access and building types in ${city.name}`, [
      prose([
        CITY_BUILT_FORM_GUIDANCE[city.builtForm],
        CITY_TIER_ACCESS_NOTE[city.tier],
        `Association approvals, lift bookings, and neighbour notice periods often set the calendar in ${city.name} more than fabrication time does.`,
      ]),
    ], { specific: true }),
    makeModule(
      'coverage',
      areas.length > 0 ? `Localities we cover in ${city.name}` : `Coverage in ${city.name}`,
      [
        prose([
          areas.length > 0
            ? `We work across ${areas.length} localities in ${city.name}, including ${joinWithAnd(areas.slice(0, 14).map((area) => area.name))}${areas.length > 14 ? ', and more listed below' : ''}. Each locality page stays short and practical; deep buying guides live separately.`
            : `We cover ${city.name} and surrounding localities. Tell us your address and we will confirm coverage before arranging a survey.`,
        ]),
        ...(areaSpotlight.length > 0
          ? [{ type: 'definitions' as const, items: areaSpotlight }]
          : []),
      ],
      { specific: true },
    ),
    makeModule(
      'applications',
      `Services in ${city.name}`,
      [
        prose([
          `Pick a service page for ${city.name} when you already know the product; use locality pages when you need neighbourhood-level access notes.`,
        ]),
        {
          type: 'definitions',
          items: cityServiceCoverageItems(city, location.state, services),
        },
      ],
      { specific: true },
    ),
    makeModule(
      'enquiry',
      `Starting an enquiry in ${city.name}`,
      [{ type: 'steps', items: cityEnquirySteps(city) }],
      { specific: true },
    ),
    makeModule('pricingFactors', `What a quotation depends on in ${city.name}`, [
      prose([
        cityPricingParagraph(city),
        'For factor-by-factor national guidance, read the pricing guide; this city page only calls out what local stock tends to change.',
      ]),
    ], { specific: true }),
    makeModule('installation', `How installs are scheduled in ${city.name}`, [
      prose([
        `Surveys in ${city.name} confirm openings, substrate, and association rules before fabrication. ${CITY_TIER_ACCESS_NOTE[city.tier]}`,
      ]),
      {
        type: 'steps',
        items: [
          {
            title: 'Share locality and photos',
            detail: `A clear bay photo from ${city.name} plus floor and access notes is enough to start scheduling.`,
          },
          {
            title: 'On-site measurement',
            detail: 'We measure each opening and write grade, spacing, and fixings on the quotation.',
          },
          {
            title: 'Install and handover',
            detail: 'Tension or mesh checks and aftercare intervals are explained before we leave.',
          },
        ],
      },
    ], { specific: true }),
    makeModule('maintenance', `Aftercare in ${city.name}`, [
      prose([cityMaintenanceParagraph(city)]),
    ], { specific: true }),
    makeModule(
      'whyChoose',
      `Why ${business.shortName} in ${city.name}`,
      [
        {
          type: 'definitions',
          items: [
            ...business.proofPoints.slice(0, 5),
            {
              title: `${areas.length || 'Local'} neighbourhood pages`,
              detail: `Locality URLs under ${city.name} keep access notes specific without turning this city hub into a doorway dump.`,
            },
          ],
        },
      ],
      { specific: true },
    ),
  ];
}

function neighbouringDistrictRows(
  district: District,
  state: NonNullable<PageTarget['location']>['state'],
): readonly { title: string; detail: string }[] {
  const linked = district.neighbouringDistrictIds
    .map((id) => getDistrictById(id))
    .filter((entry): entry is District => entry !== undefined);
  const peers =
    linked.length > 0
      ? linked
      : getDistrictsByState(state.id).filter((entry) => entry.id !== district.id).slice(0, 12);
  return peers.map((entry) => ({
    title: entry.name,
    detail: `${entry.localConsiderations} ${entry.intro}`,
  }));
}

/** District hub (target 1,500–3,000 words). */
function buildDistrictPage(target: PageTarget): readonly ContentModule[] {
  const location = target.location;
  const district = location?.district;
  if (!location || !district) return [];

  const state = location.state;
  const cities = getCitiesByDistrict(district.id).slice(0, LINK_LIMITS.citiesOnDistrictPage);
  const services = getServices();
  const neighbourRows = neighbouringDistrictRows(district, state);

  const citySpotlight = cities.map((city) => ({
    title: city.name,
    detail: `${city.localConsiderations} ${city.intro}`,
  }));

  const serviceRows = services.map((service) => ({
    title: service.name,
    detail: cities[0]
      ? `${service.summary} ${cityServiceClimateNote(cities[0], state, service)}`
      : `${service.summary} ${service.problemSolved}`,
  }));

  // When the district has no mapped cities yet, fall back to district + state context per service.
  const serviceCoverageItems = services.map((service) => ({
    title: `${service.name} in ${district.name}`,
    detail: cities[0]
      ? cityServiceClimateNote(cities[0], state, service)
      : `${district.localConsiderations} ${service.problemSolved}`,
  }));

  return [
    makeModule('introduction', `Working in ${district.name}`, [
      prose([
        district.intro,
        `${business.name} covers ${services.length} services across ${district.name}, ${state.name}, with city and locality pages where building stock differs within the district.`,
      ]),
    ], { specific: true }),
    makeModule(
      'localConditions',
      `District context in ${district.name}`,
      [
        prose([
          district.localConsiderations,
          state.climateContext,
          state.buildingContext,
          `Headquarters for the district is ${district.headquarters}; crews still route by city cluster and association rules rather than a single pin on the map.`,
        ]),
      ],
      { specific: true },
    ),
    makeModule(
      'coverage',
      cities.length > 0 ? `Cities in ${district.name}` : `Coverage in ${district.name}`,
      [
        prose([
          cities.length > 0
            ? `${district.name} includes ${cities.length} mapped ${cities.length === 1 ? 'city' : 'cities'}, including ${joinWithAnd(cities.slice(0, 10).map((city) => city.name))}. Open a city page when you need tier, built-form, and locality detail.`
            : `We are mapping cities inside ${district.name}. Tell us your address and we will confirm reach before arranging a survey.`,
        ]),
        ...(citySpotlight.length > 0
          ? [{ type: 'definitions' as const, items: citySpotlight }]
          : []),
      ],
      { specific: true },
    ),
    makeModule(
      'applications',
      `Services across ${district.name}`,
      [
        prose([
          `Every service we offer is available across ${district.name}. Grade, spacing, and access follow survey findings in each city cluster.`,
        ]),
        { type: 'definitions', items: serviceCoverageItems },
      ],
      { specific: true },
    ),
    makeModule(
      'features',
      `How ${state.name} climate shapes each product here`,
      [
        prose([
          `District pages sit between state-wide climate notes and city locality pages. The rows below tie each product to ${district.name} using the first mapped city's stock where one exists.`,
        ]),
        { type: 'definitions', items: serviceRows },
      ],
      { specific: true },
    ),
    makeModule(
      'localities',
      neighbourRows.length > 0 ? `Nearby districts in ${state.name}` : `More districts in ${state.name}`,
      [
        prose([
          neighbourRows.length > 0
            ? `Neighbouring districts share crews and travel patterns with ${district.name}. Compare local considerations when your site sits near a district border.`
            : `Other districts in ${state.name} are listed below for orientation; open each hub for its own city map.`,
        ]),
        { type: 'definitions', items: neighbourRows },
      ],
      { specific: true },
    ),
    makeModule('pricingFactors', `What quotations depend on in ${district.name}`, [
      prose([
        `Pricing in ${district.name} follows measured openings, hardware grade, access method, and substrate — not a single district-wide rate card. Coastal belts inside ${state.name} usually push stainless grade up; inland clusters may allow lighter grades where associations permit.`,
        'Two homes in the same district can still differ when one is high-rise and the other is independent-house stock. That is why every firm price follows a site survey.',
      ]),
      {
        type: 'definitions',
        items: services.flatMap((service) =>
          service.pricingFactors.slice(0, 2).map((factor) => ({
            title: `${service.shortName}: ${factor.title}`,
            detail: factor.detail,
          })),
        ),
      },
    ], { specific: true }),
    makeModule('installation', `Installation rhythm in ${district.name}`, [
      prose([stateInstallationRhythm(state)]),
      {
        type: 'steps',
        items: [
          {
            title: 'Confirm city and address',
            detail: `We batch travel across ${district.name} so small jobs are not penalised by district size.`,
          },
          {
            title: 'Survey and written scope',
            detail: 'Grade, spacing, fixings, and access are written before fabrication.',
          },
          {
            title: 'Install and handover',
            detail: 'Tension or mesh checks and warranty basis are explained before we leave.',
          },
        ],
      },
    ], { specific: true }),
    makeModule('maintenance', `Aftercare in ${district.name}`, [
      prose([
        `Inspection intervals follow ${state.name} climate: check anchors after heavy monsoon seasons in wet belts, and keep to the product interval elsewhere if the first season after install looks clean.`,
      ]),
    ], { specific: true }),
    makeModule(
      'whyChoose',
      `Why ${business.shortName} in ${district.name}`,
      [
        {
          type: 'definitions',
          items: [
            ...business.proofPoints.slice(0, 5),
            {
              title: `${cities.length || 'Mapped'} cities in ${district.name}`,
              detail: 'City and locality URLs stay specific instead of copying one metro template across the district.',
            },
          ],
        },
      ],
      { specific: true },
    ),
    makeModule('enquiry', `Starting an enquiry in ${district.name}`, [
      prose([
        `Share your city or town name inside ${district.name}, photos of each opening, and any association rules. That is enough to schedule a survey without guessing materials.`,
      ]),
      {
        type: 'steps',
        items: [
          {
            title: 'Send location and photos',
            detail: `Include floor level and lift access if you are in a high-rise cluster inside ${district.name}.`,
          },
          {
            title: 'Survey visit',
            detail: 'We measure each opening and write grade, spacing, and fixings on the quotation.',
          },
          {
            title: 'Install slot',
            detail: 'We confirm association drilling windows before locking the install date.',
          },
        ],
      },
    ], { specific: true }),
  ];
}

/** Service × district landing (target 1,400+ words). */
function buildServiceInDistrictLanding(target: PageTarget): readonly ContentModule[] {
  const { service, location, traits } = target;
  const district = location?.district;
  if (!service || !location || !district) return [];

  const state = location.state;
  const place = shortLocationLabel(location);
  const fullPlace = locationLabel(location);
  const cities = getCitiesByDistrict(district.id).slice(0, LINK_LIMITS.citiesOnDistrictPage);

  const modules: ContentModule[] = [
    ...composeEntityModules(target),
    landingIntroduction(target, service, place, fullPlace),
    makeModule(
      'localConditions',
      `Why ${district.name} changes the specification`,
      [
        prose([
          ...traitGuidance(service, traits),
          district.localConsiderations,
          state.climateContext,
          cities[0] ? cityServiceClimateNote(cities[0], state, service) : state.buildingContext,
        ]),
      ],
      { specific: true },
    ),
    makeModule(
      'benefits',
      `Catalogue outcomes (${lowerFirst(service.shortName)})`,
      [{ type: 'definitions', items: service.benefits }],
      { specific: false },
    ),
    makeModule(
      'features',
      `Features and specification for ${district.name}`,
      [{ type: 'definitions', items: landingFeatureRows(service) }],
      { specific: true },
    ),
    makeModule(
      'applications',
      `Where we install in ${district.name}`,
      [{ type: 'definitions', items: service.applications.slice(0, 6) }],
      { specific: true },
    ),
    makeModule('materials', `Materials we specify in ${district.name}`, [
      { type: 'specs', items: service.materials },
    ], { specific: true }),
    makeModule(
      'installation',
      `Installation process in ${district.name}`,
      [
        prose([
          `Installation in ${district.name} is survey-led. Typical on-site time is ${service.installation.typicalDurationHours[0]}–${service.installation.typicalDurationHours[1]} hours once the specification is settled.`,
        ]),
        { type: 'steps', items: landingInstallationSteps(service, place) },
      ],
      { specific: true },
    ),
    whyChooseModule(service, place),
    makeModule(
      'coverage',
      cities.length > 0 ? `Cities we cover in ${district.name}` : `Coverage in ${district.name}`,
      [
        prose([
          cities.length > 0
            ? `${service.name} is available across ${joinWithAnd(cities.slice(0, 14).map((city) => city.name))}${cities.length > 14 ? ', and other mapped cities in the district' : ''}.`
            : `Tell us your address inside ${district.name} and we will confirm coverage before arranging a survey.`,
        ]),
        ...(cities.length > 0
          ? [
              {
                type: 'definitions' as const,
                items: cities.map((city) => ({
                  title: city.name,
                  detail: cityServiceClimateNote(city, state, service),
                })),
              },
            ]
          : []),
      ],
      { specific: true },
    ),
    makeModule(
      'pricingFactors',
      `Pricing guide for ${district.name}`,
      [
        prose([
          `Quotations in ${district.name} depend on measured openings, grade, spacing, and access — ${district.localConsiderations}`,
        ]),
        { type: 'definitions', items: service.pricingFactors },
      ],
      {
        specific: true,
        callout:
          'We do not publish a fixed rate per square foot. Read the full pricing guide for factor-by-factor detail.',
      },
    ),
    makeModule(
      'localQuote',
      `Written quotations in ${district.name}`,
      [
        prose([
          serviceLocationQuoteParagraph(service, place, `${district.id}:${service.id}`, traits),
        ]),
      ],
      { specific: true },
    ),
  ];

  return modules;
}

function buildAreaPage(target: PageTarget): readonly ContentModule[] {
  const location = target.location;
  const area = location?.area;
  const city = location?.city;
  if (!location || !area || !city) return [];

  const services = getServices();
  const serviceConditionItems = services.slice(0, 4).map((service) => ({
    title: service.name,
    detail: traitGuidance(service, target.traits, 1)[0] ?? service.environmentalGuidance.default,
  }));

  return [
    makeModule(
      'introduction',
      `Installing in ${area.name}`,
      [prose([area.notes, city.intro])],
      { specific: true },
    ),
    makeModule(
      'localConditions',
      `What differs in ${area.name}`,
      [{ type: 'definitions', items: serviceConditionItems }],
      { specific: true },
    ),
    makeModule('access', `Access and working arrangements in ${area.name}`, [
      prose([AREA_BUILT_FORM_GUIDANCE[area.builtForm], AREA_PROFILE_GUIDANCE[area.profile]]),
    ]),
    makeModule(
      'coverage',
      `Services available in ${area.name}`,
      [
        prose([
          `All of our services are available in ${area.name}. ${
            area.landmarks.length > 0
              ? `We work throughout the locality, including around ${joinWithAnd(area.landmarks)}.`
              : ''
          }`.trim(),
        ]),
        {
          type: 'definitions',
          items: areaServiceCoverageItems(area, city, services),
        },
      ],
      { specific: true },
    ),
    makeModule('pricingFactors', `What affects the price in ${area.name}`, [
      prose([areaPricingParagraph(area, city)]),
    ], { specific: true }),
    makeModule('maintenance', 'Aftercare', [prose([areaMaintenanceParagraph(area, city)])], {
      specific: true,
    }),
    makeModule(
      'neighbourhood',
      `Living and working in ${area.name}`,
      [prose([areaNeighbourhoodParagraph(area, city)])],
      { specific: true },
    ),
    makeModule(
      'enquiry',
      `Starting an enquiry from ${area.name}`,
      [{ type: 'steps', items: areaEnquirySteps(area) }],
      { specific: true },
    ),
  ];
}

/* ------------------------------------------------------------------ assessment */

function blockWordCount(block: ContentBlock): number {
  switch (block.type) {
    case 'prose':
      return block.paragraphs.reduce((total, text) => total + countWords(text), 0);
    case 'list':
      return block.items.reduce((total, text) => total + countWords(text), 0);
    case 'definitions':
    case 'steps':
      return block.items.reduce(
        (total, item) => total + countWords(item.title) + countWords(item.detail),
        0,
      );
    case 'specs':
      return block.items.reduce(
        (total, item) =>
          total + countWords(item.name) + countWords(item.spec) + countWords(item.detail),
        0,
      );
  }
}

function moduleWordCount(entry: ContentModule): number {
  const body = entry.blocks.reduce((total, block) => total + blockWordCount(block), 0);
  return body + countWords(entry.heading) + (entry.callout ? countWords(entry.callout) : 0);
}

/* -------------------------------------------------------------------- assembly */

/**
 * Builds the full body content for a target, including the FAQ set selected for
 * its service and traits.
 */
export function buildPageContent(target: PageTarget): PageContent {
  const copy = buildPageCopy(target);

  let modules: readonly ContentModule[];
  switch (target.kind) {
    case 'service':
      modules = buildServicePage(target);
      break;
    case 'serviceIntent':
      modules = buildServiceIntentPage(target);
      break;
    case 'serviceInCity':
    case 'serviceInArea':
    case 'serviceInDistrict':
      modules = buildServiceLocationPage(target);
      break;
    case 'serviceInCityIntent':
    case 'serviceInAreaIntent':
      modules = buildServiceLocationIntentPage(target);
      break;
    case 'state':
      modules = buildStatePage(target);
      break;
    case 'city':
      modules = buildCityPage(target);
      break;
    case 'district':
      modules = buildDistrictPage(target);
      break;
    case 'area':
      modules = buildAreaPage(target);
      break;
    default:
      modules = [];
  }

  const faqScopes: readonly Faq['scope'][] = target.intent
    ? unique([
        ...target.intent.faqScopes,
        'global',
        'location',
        ...(target.service ? (['service'] as const) : []),
      ])
    : target.service
      ? (['service', 'global', 'pricing', 'maintenance', 'location'] as const)
      : (['global', 'location', 'pricing', 'maintenance'] as const);

  const catalogueFaqs = findFaqs({
    scopes: faqScopes,
    ...(target.service ? { serviceId: target.service.id } : {}),
    traits: target.traits,
  });

  const isServiceLocation =
    target.kind === 'serviceInCity' ||
    target.kind === 'serviceInArea' ||
    target.kind === 'serviceInDistrict' ||
    target.kind === 'serviceInCityIntent' ||
    target.kind === 'serviceInAreaIntent';

  const faqs = isServiceLocation
    ? composePageFaqs(target, catalogueFaqs, LINK_LIMITS.maxFaqsPerPage)
    : orderDeterministic(catalogueFaqs, pageSeed(target), (faq) => faq.id).slice(
        0,
        LINK_LIMITS.maxFaqsPerPage,
      );

  const wordCount =
    countWords(copy.lede) + modules.reduce((total, entry) => total + moduleWordCount(entry), 0);
  const specificWordCount =
    countWords(copy.lede) +
    modules
      .filter((entry) => entry.specific)
      .reduce((total, entry) => total + moduleWordCount(entry), 0);

  return {
    h1: copy.h1,
    lede: copy.lede,
    modules,
    faqs,
    wordCount,
    specificWordCount,
    fingerprint: contentFingerprint({
      h1: copy.h1,
      lede: copy.lede,
      modules,
      faqs,
    }),
  };
}

/** Human-readable place label, re-exported so pages need one import fewer. */
export { locationLabel };
