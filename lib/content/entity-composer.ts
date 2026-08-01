/**
 * Entity-driven uniqueness composer.
 *
 * Builds location×service sections and FAQs from real place/service fields only.
 * No invented prices, reviews, or certifications. Phrasing varies by page seed
 * so two pages with similar builtForm still diverge in structure and emphasis.
 */
import { business } from '@/config/business';
import {
  getAdjacentAreas,
  getAreasByCity,
  getNeighbouringCities,
} from '@/lib/data/repository';
import type { Area, City, Faq, Service, TraitKey } from '@/lib/data/schemas';
import { locationLabel, shortLocationLabel } from '@/lib/routing/resolve';
import { hashString, orderDeterministic, pickVariant } from '@/lib/utils/hash';
import { joinWithAnd, lowerFirst } from '@/lib/utils/text';
import type { ContentModule } from '@/types/content';
import type { PageTarget } from '@/types/routing';

function prose(paragraphs: readonly string[]): ContentModule['blocks'][number] {
  return { type: 'prose', paragraphs };
}

function module(
  id: ContentModule['id'],
  heading: string,
  blocks: ContentModule['blocks'],
  specific = true,
): ContentModule {
  return { id, heading, blocks, specific };
}

export function pageSeed(target: PageTarget): string {
  const parts = [
    target.kind,
    target.path,
    target.service?.id ?? '',
    target.intent?.id ?? '',
    target.location?.area?.id ?? '',
    target.location?.city?.id ?? '',
    target.location?.district?.id ?? '',
    target.location?.state.id ?? '',
    target.traits.join(','),
  ];
  return parts.join('|');
}

function landmarkList(area?: Area, city?: City): readonly string[] {
  const fromArea = area?.landmarks ?? [];
  const fromCity = city?.landmarks ?? [];
  return [...fromArea, ...fromCity].filter(Boolean);
}

function climateClause(traits: readonly TraitKey[], place: string): string {
  if (traits.includes('coastal')) {
    return pickVariant(`${place}:climate:coastal`, [
      `Salt air around ${place} pushes stainless grade and sealed anchors ahead of painted mild steel.`,
      `Coastal moisture near ${place} is the reason quotations name corrosion-aware hardware before mesh colour.`,
      `Openings facing the coast at ${place} need fixings that survive humid, salt-laden seasons.`,
    ]);
  }
  if (traits.includes('humid') || traits.includes('monsoonHeavy')) {
    return pickVariant(`${place}:climate:humid`, [
      `Humidity and monsoon wetting around ${place} favour UV-stable nets and inspection after heavy rain.`,
      `In ${place}, damp seasons matter as much as wind when choosing mesh and checking tension later.`,
      `${place} weather cycles mean aftercare intervals should follow the monsoon calendar, not a generic annual reminder.`,
    ]);
  }
  if (traits.includes('arid')) {
    return pickVariant(`${place}:climate:arid`, [
      `Dry inland air at ${place} rarely leads with corrosion; wind load and UV on open balconies drive the specification instead.`,
      `Around ${place}, dust and sun exposure usually matter more than salt, so UV rating and cable tension get the attention.`,
      `${place}'s arid profile means we still plan for heat on west-facing rails even when rust risk is lower.`,
    ]);
  }
  if (traits.includes('highRise')) {
    return pickVariant(`${place}:climate:hr`, [
      `High-rise stock in ${place} makes wind pressure and service-lift access part of every survey note.`,
      `Upper floors around ${place} need tension and access planning before materials are cut.`,
      `Tower work in ${place} is paced by association lift slots as much as by balcony size.`,
    ]);
  }
  return pickVariant(`${place}:climate:default`, [
    `Local climate and building stock in ${place} decide grade, spacing, and access more than a brochure default.`,
    `Specification for ${place} follows what the survey finds on substrate, exposure, and how the opening is used.`,
    `We write ${place} quotations from measured openings and access rules, not a one-size catalogue line.`,
  ]);
}

function builtFormClause(builtForm: string, place: string, notes: string): string {
  const noteBit = notes.length > 40 ? notes.slice(0, 160).replace(/\s+\S*$/u, '') : notes;
  return pickVariant(`${place}:${builtForm}:bf`, [
    `${place} is dominated by ${builtForm.replace(/-/gu, ' ')} stock — ${noteBit}.`,
    `Because ${place} leans ${builtForm.replace(/-/gu, ' ')}, survey notes start from that pattern: ${noteBit}.`,
    `Built form in ${place} (${builtForm.replace(/-/gu, ' ')}) shapes both fixing detail and association timing. Local note: ${noteBit}.`,
  ]);
}

function audienceFor(
  seed: string,
  service: Service,
  place: string,
  landmarks: readonly string[],
  builtForm: string,
): readonly { title: string; detail: string }[] {
  const landmark = landmarks[0];
  const pool: readonly { title: string; detail: string }[] = [
    {
      title: 'Apartment families',
      detail: landmark
        ? `Flats near ${landmark} in ${place} often need fall control that keeps daylight — ${lowerFirst(service.shortName)} is surveyed against rail height and side returns.`
        : `Apartment openings in ${place} need measured fall and pet control without darkening rooms.`,
    },
    {
      title: 'Society committees',
      detail: `Associations managing ${builtForm.replace(/-/gu, ' ')} stock in ${place} usually want uniform colour, written approval, and lift bookings before multi-flat work starts.`,
    },
    {
      title: 'Pet owners',
      detail: `Pets that use balcony rails in ${place} change lower-gap spacing; we confirm climb points on survey rather than guessing from photos alone.`,
    },
    {
      title: 'Bird-pressure homes',
      detail: landmarks[1]
        ? `Ledges and AC trays toward ${landmarks[1]} collect roosts — bird mesh and full-opening coverage are checked separately from living-room view sides.`
        : `Where pigeons return to ${place} utility decks, we treat bird mesh as its own decision, not an afterthought on the view balcony.`,
    },
    {
      title: 'Villa and plot owners',
      detail: `Independent houses around ${place} vary in wall construction, so anchors follow substrate tests rather than a tower template.`,
    },
    {
      title: 'Commercial facility teams',
      detail: `Offices and mixed-use decks in ${place} need after-hours access plans and containment facility staff can inspect later.`,
    },
  ];
  const ordered = orderDeterministic(pool, seed, (item) => item.title);
  return ordered.slice(0, 4);
}

function installSteps(
  seed: string,
  service: Service,
  place: string,
  area?: Area,
  city?: City,
): readonly { title: string; detail: string }[] {
  const [minH, maxH] = service.installation.typicalDurationHours;
  const access = area?.notes ?? city?.localConsiderations ?? `access rules in ${place}`;
  const variants = [
    [
      {
        title: 'Open with a photo + PIN',
        detail: `Send a wide shot of the opening in ${place} and your PIN so we can confirm whether a visit can be scheduled before materials are discussed.`,
      },
      {
        title: 'On-site measure',
        detail: `We measure returns and substrate in ${place}, noting: ${access.slice(0, 140)}.`,
      },
      {
        title: 'Written scope',
        detail: `The quotation lists ${lowerFirst(service.shortName)} grade, spacing, labour, and finish for ${place} — not a single invented rate.`,
      },
      {
        title: 'Fit and hand over',
        detail: `Typical on-site time is ${minH}–${maxH} hours once stock is ready; we walk through tension checks before leaving.`,
      },
    ],
    [
      {
        title: 'Confirm the job',
        detail: `Tell us whether ${place} priority is children, pets, birds, or clear view so the first survey brings the right sample set.`,
      },
      {
        title: 'Survey the opening',
        detail: `Fixing surface and association constraints in ${place} are recorded before cutting cable or mesh.`,
      },
      {
        title: 'Agree the quotation',
        detail: `You compare itemised lines for ${lowerFirst(service.name)} against other quotes using the same measured area.`,
      },
      {
        title: 'Install when access is free',
        detail: `Work proceeds in the ${minH}–${maxH} hour window once lift slots or parking for ${place} are clear.`,
      },
    ],
    [
      {
        title: 'Share context',
        detail: `City, floor, and a close-up of the rail in ${place} are enough to start a useful conversation.`,
      },
      {
        title: 'Check access + substrate',
        detail: `High-rise or gated access around ${place} is planned with the same care as mesh size.`,
      },
      {
        title: 'Lock the specification',
        detail: `${service.name} materials and spacing for ${place} are written down before install day.`,
      },
      {
        title: 'Complete and inspect',
        detail: `We tension, trim edges, and show what to re-check after the first monsoon or dusty season.`,
      },
    ],
  ] as const;
  return pickVariant(`${seed}:steps`, variants);
}

function caseStudyRows(
  seed: string,
  service: Service,
  place: string,
  landmarks: readonly string[],
): readonly { title: string; detail: string }[] {
  const apps = service.applications.slice(0, 6);
  return apps.map((app, index) => {
    const landmark = landmarks[index % Math.max(landmarks.length, 1)];
    const detail = landmark
      ? pickVariant(`${seed}:uc:${app.title}`, [
          `${app.detail} In ${place}, jobs near ${landmark} often surface this use first.`,
          `${app.title} work around ${landmark} in ${place}: ${app.detail}`,
          `For ${place} openings linked to ${landmark}, ${lowerFirst(app.title)} usually means: ${app.detail}`,
        ])
      : pickVariant(`${seed}:uc:${app.title}:x`, [
          `${app.detail} That pattern shows up across ${place} more than brochure photos suggest.`,
          `In ${place}, ${lowerFirst(app.title)} is specified when: ${app.detail}`,
        ]);
    return { title: app.title, detail };
  });
}

function prosCons(
  seed: string,
  service: Service,
  place: string,
  traits: readonly TraitKey[],
): readonly { title: string; detail: string }[] {
  const coastal = traits.includes('coastal');
  return orderDeterministic(
    [
      {
        title: `Strength of ${lowerFirst(service.shortName)} in ${place}`,
        detail: pickVariant(`${seed}:pro`, [
          `Measured fit keeps daylight while addressing the safety or bird job the opening actually has.`,
          `Survey-led spacing avoids over-building ${place} openings that only needed a lighter mesh.`,
          `Itemised quotes make it easier to compare like-for-like workmanship in ${place}.`,
        ]),
      },
      {
        title: 'Limitation to plan for',
        detail: coastal
          ? `Coastal air near ${place} shortens the life of cheap mild hardware — higher-grade stainless is a cost line, not an upsell slogan.`
          : pickVariant(`${seed}:con`, [
              `Association drilling windows in ${place} can stretch schedules even when the balcony itself is simple.`,
              `Photos alone cannot prove substrate strength in ${place}; a survey still decides anchors.`,
              `View-priority cables and dense bird mesh are different jobs — bundling them without measuring creates weak edges.`,
            ]),
      },
      {
        title: 'Honest alternative',
        detail: pickVariant(`${seed}:alt`, [
          `If ${place} only needs temporary containment, a short programme net may beat a permanent grill — we say so when survey shows it.`,
          `Some ${place} openings are better served by a different Avensafe system; we route you there instead of forcing one product.`,
          `When budget is the constraint, we still refuse unsafe spacing rather than matching an under-specified quote.`,
        ]),
      },
    ],
    seed,
    (row) => row.title,
  );
}

function nearbyNames(city: City, area?: Area): { areas: string[]; cities: string[] } {
  const areas = area
    ? getAdjacentAreas(area)
        .slice(0, 6)
        .map((entry) => entry.name)
    : getAreasByCity(city.id)
        .slice(0, 8)
        .map((entry) => entry.name);
  const cities = getNeighbouringCities(city)
    .slice(0, 5)
    .map((entry) => entry.name);
  return { areas, cities };
}

/** Unique modules for service × city / area / district landings. */
export function composeEntityModules(target: PageTarget): readonly ContentModule[] {
  const { service, location, traits } = target;
  if (!service || !location) return [];
  if (!location.city && !location.district) return [];

  const seed = pageSeed(target);
  const city = location.city;
  const area = location.area;
  const district = location.district;
  const state = location.state;
  const place = shortLocationLabel(location);
  const fullPlace = locationLabel(location);
  const cityName = city?.name ?? district?.name ?? place;
  const landmarks = landmarkList(area, city);
  const notes =
    area?.notes ??
    city?.localConsiderations ??
    district?.localConsiderations ??
    state.climateContext;
  const builtForm = area?.builtForm ?? city?.builtForm ?? 'mixed';
  const nearby = city
    ? nearbyNames(city, area)
    : { areas: [] as string[], cities: [] as string[] };

  const introHeadings = [
    `${service.name} for how ${place} actually builds`,
    `Reading ${place} before choosing ${lowerFirst(service.shortName)}`,
    `What changes ${lowerFirst(service.shortName)} work in ${place}`,
    `${place} openings: starting from survey, not a catalogue`,
  ] as const;

  const modules: ContentModule[] = [
    module(
      'introduction',
      pickVariant(`${seed}:h-intro`, introHeadings),
      [
        prose([
          pickVariant(`${seed}:intro1`, [
            `${service.problemSolved} In ${fullPlace}, that starts with how people use balconies and utility decks day to day.`,
            `People searching ${lowerFirst(service.name)} in ${place} usually have a concrete opening problem — fall risk, birds, pets, or a society rule — not a generic product browse.`,
            `${business.shortName} treats ${place} jobs as measured installs: the brief is the opening, the climate, and the association clock.`,
          ]),
          notes,
          climateClause(traits, place),
          builtFormClause(builtForm, place, notes),
        ]),
      ],
    ),
    module(
      'localConditions',
      pickVariant(`${seed}:h-local`, [
        `Conditions that shape installs in ${place}`,
        `${place} climate, stock, and access`,
        `What the survey looks for around ${place}`,
      ]),
      [
        prose([
          city?.localConsiderations ?? district?.localConsiderations ?? notes,
          area
            ? `Locality note for ${area.name}: ${area.notes}`
            : city
              ? `City-wide pattern: ${city.intro.slice(0, 220)}${city.intro.length > 220 ? '…' : ''}`
              : district
                ? `District pattern for ${district.name}: ${district.intro.slice(0, 220)}${district.intro.length > 220 ? '…' : ''}`
                : notes,
          landmarks.length > 0
            ? pickVariant(`${seed}:lm`, [
                `Routing context includes ${joinWithAnd(landmarks.slice(0, 3))} — useful when describing where vans and materials can stage.`,
                `Landmarks residents name most often: ${joinWithAnd(landmarks.slice(0, 4))}. We use them only as access and orientation cues.`,
                `Jobs described as “near ${landmarks[0]}” still need a PIN and floor number before a visit is confirmed.`,
              ])
            : `Share a PIN and floor for ${place} so the first visit is booked against a real address, not a neighbourhood nickname.`,
        ]),
      ],
    ),
    module(
      'audience',
      pickVariant(`${seed}:h-aud`, [
        `Who books ${lowerFirst(service.shortName)} in ${place}`,
        `${place} customers we plan for`,
        `Typical ${place} briefs for this system`,
      ]),
      [{ type: 'definitions', items: audienceFor(seed, service, place, landmarks, builtForm) }],
    ),
    module(
      'applications',
      pickVariant(`${seed}:h-use`, [
        `Use cases we see in ${place}`,
        `Where ${lowerFirst(service.shortName)} fits around ${place}`,
        `${place} openings this system is asked to solve`,
      ]),
      [{ type: 'definitions', items: caseStudyRows(seed, service, place, landmarks) }],
    ),
    module(
      'features',
      pickVariant(`${seed}:h-feat`, [
        `Specification choices for ${place}`,
        `What gets decided on a ${place} survey`,
        `Build details that matter in ${place}`,
      ]),
      [
        {
          type: 'definitions',
          items: [
            {
              title: 'Materials',
              detail: `${joinWithAnd(service.materials.map((m) => m.name))}. ${climateClause(traits, place)}`,
            },
            {
              title: 'Spacing / aperture',
              detail:
                service.features[0]?.detail ??
                `Spacing for ${place} follows child, pet, or bird priority confirmed on site.`,
            },
            {
              title: 'Warranty frame',
              detail:
                service.quality.warrantyYears > 0
                  ? `${service.quality.warrantyYears}-year cover when inspection intervals in the quotation are kept — still not a substitute for storm checks in ${place}.`
                  : `Programme-length workmanship cover applies; permanent systems carry the product warranty named on the ${place} quote.`,
            },
            {
              title: 'Time on site',
              detail: `Expect about ${service.installation.typicalDurationHours[0]}–${service.installation.typicalDurationHours[1]} hours after measurement, subject to ${place} access.`,
            },
          ],
        },
      ],
    ),
    module(
      'installation',
      pickVariant(`${seed}:h-inst`, [
        `How a ${place} installation is run`,
        `From photo to fitting in ${place}`,
        `${place} install sequence`,
      ]),
      [
        prose([
          pickVariant(`${seed}:inst-lead`, [
            `Installation in ${place} is survey-led so association rules and substrate surprises show up before materials arrive.`,
            `We do not cut mesh or cable for ${place} until measurements and access windows are written down.`,
          ]),
        ]),
        { type: 'steps', items: installSteps(seed, service, place, area, city) },
      ],
    ),
    module(
      'pricingFactors',
      pickVariant(`${seed}:h-price`, [
        `What changes the ${place} quotation`,
        `Price factors for ${lowerFirst(service.shortName)} in ${place}`,
        `Reading a ${place} estimate fairly`,
      ]),
      [
        prose([
          pickVariant(`${seed}:price`, [
            `We do not publish a fake ₹/sq ft for ${place}. The written quote after survey is the number you can compare.`,
            `Cost in ${place} moves with measured area, grade, access, and finish — not a homepage sticker price.`,
          ]),
        ]),
        {
          type: 'definitions',
          items: orderDeterministic(
            service.pricingFactors,
            seed,
            (item) => item.title,
          ).slice(0, 5),
        },
      ],
    ),
    module(
      'safety',
      pickVariant(`${seed}:h-safe`, [
        `Safety notes for ${place} openings`,
        `What we refuse to under-specify in ${place}`,
        `${place} safety recommendations`,
      ]),
      [
        {
          type: 'definitions',
          items: [
            ...service.safety.notes.slice(0, 2),
            {
              title: `Local caution for ${place}`,
              detail: pickVariant(`${seed}:safe`, [
                `If a ${place} quote skips spacing or anchor detail, treat that as a risk signal — not a bargain.`,
                `Child and pet gaps in ${place} are measured at the rail, not guessed from a living-room photo.`,
              ]),
            },
          ],
        },
      ],
    ),
    module(
      'maintenance',
      pickVariant(`${seed}:h-care`, [
        `Keeping the system effective in ${place}`,
        `Aftercare rhythm for ${place}`,
        `${place} maintenance expectations`,
      ]),
      [
        prose([
          `Inspect about every ${service.maintenance.inspectionIntervalMonths} months; ${service.maintenance.tasks[0]?.detail ?? 're-tension and edge checks keep the barrier working.'}`,
          climateClause(traits, place),
        ]),
      ],
    ),
    module(
      'whyChoose',
      pickVariant(`${seed}:h-why`, [
        `Why ${business.shortName} for ${place}`,
        `How we work in ${place}`,
        `${place} service stance`,
      ]),
      [
        {
          type: 'definitions',
          items: [
            ...orderDeterministic(business.proofPoints, seed, (p) => p.title).slice(0, 3),
            {
              title: `Local coverage`,
              detail: `We survey and install ${lowerFirst(service.shortName)} across ${place}${
                nearby.areas[0] ? `, including corridors toward ${nearby.areas[0]}` : ''
              }.`,
            },
            {
              title: 'Experience since 2016',
              detail: `Operating since ${business.foundingYear}, we write ${place} scopes from repeated balcony and duct patterns — not from a one-visit script.`,
            },
          ],
        },
      ],
    ),
    module(
      'quality',
      pickVariant(`${seed}:h-cmp`, [
        `Trade-offs to weigh in ${place}`,
        `Pros, limits, and alternatives for ${place}`,
        `Decision notes before you book in ${place}`,
      ]),
      [{ type: 'definitions', items: prosCons(seed, service, place, traits) }],
    ),
  ];

  if (nearby.areas.length > 0 || nearby.cities.length > 0) {
    modules.push(
      module(
        'coverage',
        pickVariant(`${seed}:h-cov`, [
          `Nearby coverage from ${place}`,
          `${place} links across the local map`,
          `Areas and cities around ${place}`,
        ]),
        [
          prose([
            nearby.areas.length > 0
              ? `Nearby localities often discussed with ${place} jobs: ${joinWithAnd(nearby.areas)}.`
              : `Locality lists for ${cityName} continue to expand as surveyed notes are added.`,
            nearby.cities.length > 0
              ? `Neighbouring cities on the service graph: ${joinWithAnd(nearby.cities)}.`
              : `${state.name} city pages carry the wider matrix beyond ${cityName}.`,
          ]),
        ],
      ),
    );
  }

  modules.push(
    module(
      'enquiry',
      pickVariant(`${seed}:h-cta`, [
        `Send a ${place} photo for estimate`,
        `Start a ${place} survey conversation`,
        `What to share before we visit ${place}`,
      ]),
      [
        {
          type: 'steps',
          items: [
            {
              title: 'Photo',
              detail: `One wide shot and one close-up of the fixing edge in ${place}.`,
            },
            {
              title: 'Context',
              detail: `City/PIN, floor, and whether the priority is children, pets, birds, or view.`,
            },
            {
              title: 'Reply path',
              detail: `WhatsApp or call — we outline system options and what the written quotation should list.`,
            },
          ],
        },
      ],
    ),
  );

  return modules;
}

/** Page-local FAQs composed from entities + reordered catalogue FAQs. */
export function composePageFaqs(
  target: PageTarget,
  catalogue: readonly Faq[],
  limit: number,
): readonly Faq[] {
  const seed = pageSeed(target);
  const service = target.service;
  const location = target.location;
  if (!service || !location || (!location.city && !location.district)) {
    return orderDeterministic(catalogue, seed, (faq) => faq.id).slice(0, limit);
  }

  const place = shortLocationLabel(location);
  const area = location.area;
  const city = location.city;
  const landmarks = landmarkList(area, city);
  const traits = target.traits;
  const cityName = city?.name ?? location.district?.name ?? place;

  const generated: Faq[] = [
    {
      id: `gen-${hashString(seed)}-q1`,
      question: pickVariant(`${seed}:fq1`, [
        `How do you plan ${lowerFirst(service.shortName)} for ${place}?`,
        `What makes a ${place} ${lowerFirst(service.name)} survey different?`,
        `Is ${lowerFirst(service.name)} in ${place} measured on site?`,
      ]),
      answer: pickVariant(`${seed}:fa1`, [
        `Yes — we measure the opening in ${place}, note substrate and access${
          area ? ` (including notes for ${area.name}: ${area.notes.slice(0, 100)}…)` : ''
        }, then write grade and spacing into the quotation.`,
        `A ${place} job starts with photos and PIN, then a survey that records returns, rail type, and association constraints before materials are ordered.`,
      ]),
      scope: 'location',
      serviceIds: [service.id],
      traits: [],
      order: 1,
    },
    {
      id: `gen-${hashString(seed)}-q2`,
      question: pickVariant(`${seed}:fq2`, [
        `Will weather around ${place} change the materials?`,
        `Do ${place} climate conditions affect ${lowerFirst(service.shortName)}?`,
        `What climate factors matter for ${place}?`,
      ]),
      answer: climateClause(traits, place),
      scope: 'location',
      serviceIds: [service.id],
      traits: [...traits],
      order: 2,
    },
    {
      id: `gen-${hashString(seed)}-q3`,
      question: landmarks[0]
        ? pickVariant(`${seed}:fq3`, [
            `Do you cover openings near ${landmarks[0]} in ${cityName}?`,
            `Can you install around the ${landmarks[0]} side of ${cityName}?`,
          ])
        : `Which parts of ${cityName} do you cover for ${lowerFirst(service.shortName)}?`,
      answer: landmarks[0]
        ? `We use ${landmarks[0]} only as an orientation cue — the install address still needs a PIN and floor. Coverage follows surveyed ${cityName} localities, including ${place}.`
        : `Coverage is organised through ${cityName} pages. Share your PIN so we confirm whether ${place} can be scheduled.`,
      scope: 'location',
      serviceIds: [service.id],
      traits: [],
      order: 3,
    },
    {
      id: `gen-${hashString(seed)}-q4`,
      question: pickVariant(`${seed}:fq4`, [
        `How should I compare ${place} quotations?`,
        `What should a fair ${place} estimate include?`,
      ]),
      answer: `Compare measured area, material grade, spacing, access/labour, and finish. ${business.shortName} does not publish a single ${place} rate per square foot because openings and access differ.`,
      scope: 'pricing',
      serviceIds: [service.id],
      traits: [],
      order: 4,
    },
    {
      id: `gen-${hashString(seed)}-q5`,
      question: pickVariant(`${seed}:fq5`, [
        `How long does installation take in ${place}?`,
        `What is a typical ${place} install window?`,
      ]),
      answer: `On-site time is usually ${service.installation.typicalDurationHours[0]}–${service.installation.typicalDurationHours[1]} hours after measurement, subject to ${place} lift slots or street access.`,
      scope: 'service',
      serviceIds: [service.id],
      traits: [],
      order: 5,
    },
  ];

  const rotated = orderDeterministic(catalogue, seed, (faq) => faq.id);
  const merged = [...generated, ...rotated];
  const seen = new Set<string>();
  const uniqueFaqs: Faq[] = [];
  for (const faq of merged) {
    const key = faq.question.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueFaqs.push(faq);
    if (uniqueFaqs.length >= limit) break;
  }
  return uniqueFaqs;
}

/** Stable fingerprint of entity-derived body text for uniqueness audits. */
export function contentFingerprint(input: {
  readonly h1: string;
  readonly lede: string;
  readonly modules: readonly ContentModule[];
  readonly faqs: readonly Faq[];
}): string {
  const chunks: string[] = [input.h1, input.lede];
  for (const mod of input.modules) {
    if (!mod.specific) continue;
    chunks.push(mod.heading);
    for (const block of mod.blocks) {
      if (block.type === 'prose') chunks.push(...block.paragraphs);
      if (block.type === 'definitions' || block.type === 'steps') {
        for (const item of block.items) chunks.push(item.title, item.detail);
      }
      if (block.type === 'list') chunks.push(...block.items);
      if (block.type === 'specs') {
        for (const item of block.items) chunks.push(item.name, item.spec, item.detail);
      }
    }
  }
  for (const faq of input.faqs) chunks.push(faq.question, faq.answer);
  return hashString(chunks.join('\n')).toString(16);
}

export function stripPlaceTokens(text: string, places: readonly string[]): string {
  let out = text.toLowerCase();
  for (const place of places) {
    if (!place) continue;
    out = out.split(place.toLowerCase()).join(' ');
  }
  return out.replace(/\s+/gu, ' ').trim();
}
