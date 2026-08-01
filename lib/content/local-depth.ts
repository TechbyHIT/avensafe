import type { Area, City, SearchIntent, Service, State, TraitKey } from '@/lib/data/schemas';
import { TRAIT_LABELS } from '@/lib/content/vocabulary';
import { joinWithAnd, lowerFirst } from '@/lib/utils/text';
import { pickVariant } from '@/lib/utils/hash';

/**
 * Extra location-specific prose so programmatic pages differ in substance,
 * not only in swapped place names.
 */

export function areaNeighbourhoodParagraph(area: Area, city: City): string {
  const landmarkPhrase =
    area.landmarks.length > 0
      ? `Installations near ${joinWithAnd(area.landmarks.slice(0, 3))} follow the same specification rules as the rest of ${area.name}, but access and neighbour coordination can differ street by street.`
      : `Within ${area.name}, ${city.name}, substrate quality and association rules vary block by block more than the map suggests.`;

  const profileLine = pickVariant(`${area.id}:profile`, [
    `Most enquiries here are ${area.profile === 'commercial' ? 'from offices and retail frontages' : area.profile === 'industrial' ? 'from workshops and plant areas' : 'from apartment towers and independent houses'}, which shapes how we schedule drilling and lifting.`,
    `Because ${area.name} is mainly ${area.profile}, we plan each visit around working hours, lift access, and how much dust and noise neighbouring units will tolerate.`,
    `The ${area.profile} character of ${area.name} means we confirm fixing surfaces and approval paths before quoting, not after arriving on site.`,
    `Facility managers and residents in ${area.name} often ask for written method statements because of the ${area.profile} mix of uses in the same block.`,
  ]);

  return `${landmarkPhrase} ${profileLine}`;
}

export function areaServiceFitParagraph(service: Service, area: Area, city: City): string {
  const key = `${area.id}:${service.id}`;
  const built =
    area.builtForm === 'gated-apartments'
      ? 'gated blocks where association approval and lift booking often set the calendar'
      : area.builtForm === 'high-rise'
        ? 'tall towers where wind load rather than impact governs cable spacing and anchor count'
        : area.builtForm === 'commercial-towers'
          ? 'commercial towers where work moves to shafts, plant decks, and after-hours slots'
          : 'houses and low-rise blocks where ground access keeps the job straightforward';

  return pickVariant(key, [
    `${service.shortName} in ${area.name} is most often requested for ${built}. ${service.problemSolved} We measure the opening on site because even identical floor plans in ${city.name} can fix into different wall types.`,
    `For ${lowerFirst(service.name)} work in ${area.name}, the deciding factor is usually ${built}. ${service.summary}`,
    `Residents and facility teams in ${area.name} typically ask about ${service.shortName} when ${lowerFirst(service.problemSolved)} Our quotation states cable grade, mesh spec, or hanger load rating so comparisons stay fair.`,
    `Around ${area.name}, ${service.shortName} enquiries cluster on ${built}. We document spacing, grade, and anchor type on the quote because ${lowerFirst(service.problemSolved)}`,
    `${area.name} jobs for ${service.shortName} rarely fail on product choice — they fail on fixing depth or access. ${service.problemSolved}`,
    `When we survey ${service.shortName} openings in ${area.name}, we note ${built} first, then confirm ${lowerFirst(service.summary)}`,
  ]);
}

export function areaServiceCoverageItems(
  area: Area,
  city: City,
  services: readonly Service[],
): readonly { readonly title: string; readonly detail: string }[] {
  return services.map((service) => ({
    title: `${service.name} in ${area.name}`,
    detail: areaServiceFitParagraph(service, area, city),
  }));
}

export function areaEnquirySteps(area: Area): readonly { readonly title: string; readonly detail: string }[] {
  const key = area.id;
  return [
    {
      title: 'Photograph the full opening',
      detail: pickVariant(`${key}:step1`, [
        `Include the top and side fixing surfaces in ${area.name}, not only the railing gap.`,
        `Capture the balcony or window bay in ${area.name} from inside so we can see height and width together.`,
        `One wide shot of the opening plus a close-up of the parapet or frame in ${area.name} is enough to start.`,
        `For ${area.name}, add a photo of the lift lobby or access route if frames must travel in one piece.`,
      ]),
    },
    {
      title: 'Note the building type',
      detail: pickVariant(`${key}:step2`, [
        area.builtForm === 'gated-apartments'
          ? 'Mention the society name if you need help with association submission drawings.'
          : 'Tell us the floor level and whether lift access is available for long frame sections.',
        `Confirm whether ${area.name} is a tower, villa, or commercial unit so we bring the right access plan.`,
        'Share any existing approval conditions from the owners association or facility office.',
        `Pincode ${area.pincode ? area.pincode : 'if known'} helps us confirm we are routing the right crew to ${area.name}.`,
      ]),
    },
    {
      title: 'State the main concern',
      detail: pickVariant(`${key}:step3`, [
        'Children, pets, pigeons, sports practice, drying space, or facade containment — the priority changes the specification.',
        'Let us know if visibility, airflow, or load rating matters most for your opening.',
        'If you already have a quotation elsewhere, tell us what grade and spacing were quoted so we can compare like for like.',
        `Tell us if the opening in ${area.name} is used daily or only seasonally — that changes mesh and cable inspection intervals.`,
      ]),
    },
  ];
}

export function cityServiceClimateNote(city: City, state: State, service: Service): string {
  return pickVariant(`${city.id}:${service.id}:climate`, [
    `${service.shortName} in ${city.name} is specified against ${state.name}'s climate as well as the local building stock: ${city.localConsiderations}`,
    `Across ${city.name}, ${service.problemSolved} ${city.intro.split('.')[0]}.`,
    `What changes ${service.shortName} pricing in ${city.name} is rarely the product name — it is access, substrate, and ${city.traits.length > 0 ? 'local exposure' : 'fixing depth'}, which we confirm at survey.`,
    `${city.name} ${service.shortName} work usually starts with ${city.localConsiderations.toLowerCase()} ${lowerFirst(service.problemSolved)}`,
  ]);
}

export function cityServiceCoverageItems(
  city: City,
  state: State,
  services: readonly Service[],
): readonly { readonly title: string; readonly detail: string }[] {
  return services.map((service) => ({
    title: service.name,
    detail: cityServiceClimateNote(city, state, service),
  }));
}

export function cityLandmarkParagraph(city: City, state: State): string {
  const landmarks =
    city.landmarks.length > 0
      ? `Landmarks such as ${joinWithAnd(city.landmarks.slice(0, 4))} sit in the same wind and approval environment as the towers around them, but fixing surfaces on individual blocks still vary.`
      : `Across ${city.name}, ${state.name}, building age and association rules change faster than the map suggests.`;

  return pickVariant(`${city.id}:landmarks`, [
    `${landmarks} We treat each address on its own survey rather than assuming one detail for all of ${city.name}.`,
    `${city.name}'s ${city.builtForm.replace('-', ' ')} stock means access equipment is ${city.tier === 1 ? 'sometimes' : 'often'} the line item that moves the calendar, not the mesh or cable itself. ${landmarks}`,
    `Tier-${city.tier} coverage in ${city.name} is planned ${city.tier === 1 ? 'with local crews and common hardware on hand' : 'as paired survey-and-install visits to keep travel out of the price'}. ${landmarks}`,
  ]);
}

export function cityPricingParagraph(city: City): string {
  return pickVariant(`${city.id}:pricing`, [
    `In ${city.name}, quotations itemise measured area, stainless or polymer grade, spacing, access method, and substrate condition. Two identical openings on different floors can differ in price because of lift booking or wind load, not because the product name changed.`,
    `${city.name} jobs often share the same hardware list but different labour profiles — gated approvals, night shifts on commercial towers, or ladder-only access on older mid-rise blocks.`,
    `We do not publish a single rate for ${city.name} because ${city.localConsiderations.toLowerCase()} That is why every structural quote follows a site visit.`,
    `Compare quotes in ${city.name} by cable or mesh specification, anchor type, included installation, minimum visit charge, and warranty — not by headline area rate alone.`,
  ]);
}

export function areaPricingParagraph(area: Area, city: City): string {
  return pickVariant(`${area.id}:pricing`, [
    `In ${area.name}, ${city.name}, price moves with ${area.builtForm === 'high-rise' ? 'floor height and wind exposure' : area.builtForm === 'gated-apartments' ? 'association drilling windows and lift access' : 'wall condition and ladder reach'}, then with measured area and grade.`,
    `Quotations for ${area.name} state what is included: edge finishing, re-tension access, disposal of packaging, and whether a return visit is priced in for association inspection.`,
    `Two neighbours in ${area.name} can receive different quotes for the same product because substrate tests at survey showed different anchor options — that is normal, not an upsell.`,
    `${area.profile === 'commercial' ? 'Commercial' : 'Residential'} schedules in ${area.name} affect cost as much as mesh size; after-hours work is quoted separately when required.`,
  ]);
}

export function areaMaintenanceParagraph(area: Area, city: City): string {
  return pickVariant(`${area.id}:care`, [
    `After handover in ${area.name}, we explain the annual slack check and recommend a post-monsoon pass where ${city.name} sees heavy rain. Catching loose cables early avoids widening child-guard gaps.`,
    `${area.name} installations are handed over with a short care sheet: mid-span press test, anchor visual check, and gentle wash-down without abrasive pads on stainless.`,
    `We would rather ${area.name} residents call at the first sign of net belly or cable slack than wait for monsoon loading to finish the damage.`,
  ]);
}

export function cityMaintenanceParagraph(city: City): string {
  return pickVariant(`${city.id}:care`, [
    `Installations in ${city.name} include guidance on annual inspection and, where traits demand it, a seasonal re-tension reminder after the monsoon.`,
    `${city.name} coastal and high-rise pockets may need more frequent anchor checks; the handover note flags which applies to your address.`,
    `Slack in a cable or net in ${city.name} is a maintenance visit, not a full refit, if it is caught early — we explain what to look for at handover.`,
  ]);
}

export function serviceLocationQuoteParagraph(
  service: Service,
  placeLabel: string,
  pageKey: string,
  traits: readonly TraitKey[],
): string {
  const traitNote =
    traits.length > 0
      ? `Local exposure here includes ${traits.map((trait) => TRAIT_LABELS[trait]).join(', ')}.`
      : 'Local building type and access decide the line items on the quote.';

  return pickVariant(`${pageKey}:${service.id}:quote`, [
    `${service.name} quotations for ${placeLabel} list measured openings, ${lowerFirst(service.materials[0]?.name ?? 'materials')}, spacing, fixings, and installation labour. ${traitNote}`,
    `Before confirming ${service.shortName} in ${placeLabel}, ask for the price unit (per opening, per square metre, or lump sum), minimum visit charge, and warranty on both materials and workmanship. ${traitNote}`,
    `Our ${placeLabel} quotes for ${service.shortName} are survey-led because ${lowerFirst(service.problemSolved)} ${traitNote}`,
    `Compare ${service.shortName} offers in ${placeLabel} only when grade, spacing, anchor detail, and access allowance match — otherwise the cheaper figure often omits re-tension access or edge finishing.`,
  ]);
}

export function intentLocalParagraph(
  intent: SearchIntent,
  service: Service,
  placeLabel: string,
  pageKey: string,
  localNote: string | undefined,
): string {
  const base = pickVariant(`${pageKey}:${intent.id}`, [
    `${intent.label} for ${service.shortName} in ${placeLabel} starts with ${lowerFirst(intent.lede)}`,
    `When you are researching ${intent.titlePhrase} for ${service.shortName} in ${placeLabel}, ${lowerFirst(intent.lede)}`,
    `${placeLabel} enquiries about ${intent.label.toLowerCase()} usually need a measured opening first; ${lowerFirst(intent.lede)}`,
  ]);
  return localNote ? `${base} ${localNote}` : base;
}

export function stateInstallationRhythm(state: State): string {
  return pickVariant(state.id, [
    `${state.name}'s mix of coastal, inland, and high-rise stock means two sites in the same city can need different stainless grades and anchor patterns. We document both on the quotation.`,
    `Programmes in ${state.name} are planned around monsoon access windows and association rules as much as around hardware lead times.`,
    `We batch travel across ${state.name} on tiered routes so survey and installation can often share one trip outside the major metros.`,
    `State-wide work in ${state.name} is specified from local climate notes on each city page rather than from one national datasheet.`,
  ]);
}

export function cityEnquirySteps(city: City): readonly { readonly title: string; readonly detail: string }[] {
  const key = city.id;
  return [
    {
      title: 'Send the locality',
      detail: pickVariant(`${key}:cstep1`, [
        `Name the neighbourhood in ${city.name} and, if you know it, the society or building name.`,
        `A pin or landmark near your block in ${city.name} helps us confirm coverage before we schedule.`,
        `Tell us whether you are in a gated tower, villa street, or commercial block in ${city.name}.`,
      ]),
    },
    {
      title: 'Photograph the opening',
      detail: pickVariant(`${key}:cstep2`, [
        'Wide shot plus fixing surface close-ups are enough for a useful first estimate range.',
        `Include floor level for ${city.name} towers so we can plan lift or rope access.`,
        'If birds or sports use is the issue, show the full volume to be enclosed, not only the railing gap.',
      ]),
    },
    {
      title: 'Share the priority',
      detail: pickVariant(`${key}:cstep3`, [
        'Child safety, pigeons, view retention, sports containment, or drying space — the answer changes the spec.',
        'Mention any association approval already granted in writing.',
        'If comparing quotes, list the grade and spacing you were offered elsewhere.',
      ]),
    },
  ];
}

export function areaH1Variant(area: Area, city: City): string {
  return pickVariant(`${area.id}:h1`, [
    `Safety and utility installations in ${area.name}, ${city.name}`,
    `Invisible grills, safety nets and cloth hangers in ${area.name}, ${city.name}`,
    `Balcony safety and netting services in ${area.name}, ${city.name}`,
    `${area.name}, ${city.name} — installation and survey coverage`,
  ]);
}

export function cityH1Variant(city: City, state: State): string {
  return pickVariant(`${city.id}:h1`, [
    `Invisible grills, safety nets and cloth hangers in ${city.name}`,
    `Safety net and invisible grill installation in ${city.name}, ${state.name}`,
    `${city.name} — balcony safety, sports nets and utility fittings`,
    `Professional safety installations across ${city.name}`,
  ]);
}
