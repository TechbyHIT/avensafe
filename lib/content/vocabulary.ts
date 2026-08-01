import type { Area, City } from '@/lib/data/schemas';

/**
 * Editorial vocabulary for the content engine.
 *
 * Each entry is a distinct piece of technical guidance, not a template with a
 * placeholder. Two pages that differ in built form or profile therefore get
 * materially different advice rather than the same sentence with a swapped
 * place name, which is the whole difference between a useful page and a
 * doorway page.
 */

export const CITY_BUILT_FORM_GUIDANCE: Readonly<Record<City['builtForm'], string>> = {
  'high-rise':
    'Because the building stock here runs to genuine towers, most jobs are governed by wind pressure rather than impact loading. That means a higher fixing density than the same balcony would need lower down, anchors set back from slab edges so the concrete cannot spall, and frame sections fabricated short enough to travel in a service lift. Expect the approval and lift-booking arrangements to take longer than the installation itself.',
  'mid-rise':
    'Mid-rise blocks are the most straightforward buildings we work on. Access is usually possible from inside the balcony without external equipment, the parapets are typically sound concrete, and a single bay can normally be surveyed, fabricated and fitted without a return visit. The main variable is whether the building has an association process for external alterations.',
  'independent-houses':
    'With independent houses the work is nearly always reachable from ground level or a short ladder, so there is no access equipment to price in. What varies instead is the wall itself: plot-built houses use a wide range of constructions, and the fixing method has to follow what we find rather than a standard detail. That is why the survey looks closely at the wall before quoting.',
  mixed:
    'The building stock here is genuinely mixed, so two addresses a street apart can need quite different approaches. We survey each property on its own terms rather than applying a neighbourhood-wide specification, because an older independent house and a recent tower in the same locality share almost nothing beyond the postcode.',
};

export const AREA_BUILT_FORM_GUIDANCE: Readonly<Record<Area['builtForm'], string>> = {
  'gated-apartments':
    'In gated developments the technical work is rarely the constraint. Written approval from the owners association, a booked drilling window and service-lift access usually set the programme, so we prepare the drawings and material specification you will need to submit and plan the visit around the hours the estate permits.',
  'high-rise':
    'Tower balconies here are high enough that wind pressure, not impact, decides the anchorage. We increase the number of fixings, keep net panels smaller so one failure cannot open a wide gap, and position turnbuckles so the installation can be re-tensioned from inside rather than from the outside face.',
  'independent-houses':
    'Independent houses in this locality are almost all accessible without external equipment, which keeps labour down and usually confines a job to a single visit. The variable worth surveying is the wall construction, since anchor selection has to suit what is actually there.',
  'commercial-towers':
    'Commercial buildings shift the work away from balconies and towards service shafts, plant decks and facade containment. Those jobs are programmed outside business hours, need permits for at-height work, and have to leave designed access so building services can still be maintained afterwards.',
  mixed:
    'This locality has a mix of older and newer buildings, so we treat each property individually. Substrate quality is the main thing that varies, and it is the single factor most likely to change the anchor method once we have seen the wall.',
};

export const AREA_PROFILE_GUIDANCE: Readonly<Record<Area['profile'], string>> = {
  residential:
    'Work in a residential locality is planned around people living there. We keep drilling to agreed hours, sheet floors before starting, and clear away offcuts and swarf before we leave, because a balcony that has to be re-cleaned is a poor result whatever the installation is like.',
  commercial:
    'On commercial premises the constraint is continuity of operation. Netting and containment work is programmed for evenings or weekends, access is coordinated with building management, and panel layouts are designed so services can be reached later without cutting anything open.',
  mixed:
    'A mixed locality means adjoining residential and commercial properties, so working hours and access arrangements are agreed per address. It also means neighbouring occupiers are affected by dust and noise, which we plan for rather than treat as an afterthought.',
  industrial:
    'Industrial sites bring their own safety regime. Work is scheduled around shifts or shutdowns, permits are arranged before anyone goes to height, and netting is specified for abrasion and dropped-object duty rather than for appearance. Panel layouts have to leave plant access clear.',
};

export const CITY_TIER_ACCESS_NOTE: Readonly<Record<City['tier'], string>> = {
  1: 'As a major metro, this city is covered by our own installation teams with same-week survey slots in most localities, and we hold common cable and net sizes locally so straightforward jobs do not wait on material.',
  2: 'We cover this city on a regular scheduled rota rather than on daily standby, so survey and installation are usually offered as a paired visit. Grouping work in one trip is what keeps travel out of the price.',
  3: 'This city sits on our periodic route, so we combine the survey and installation into a single visit wherever the job allows, and we will tell you plainly at the enquiry stage which week we can reach you.',
};

/** Trait labels used in headings and supporting copy. */
export const TRAIT_LABELS = {
  coastal: 'coastal salt exposure',
  humid: 'sustained high humidity',
  arid: 'dry, high-ultraviolet conditions',
  highRise: 'high-rise wind loading',
  monsoonHeavy: 'heavy monsoon rainfall',
  industrial: 'industrial atmospheres',
} as const;
