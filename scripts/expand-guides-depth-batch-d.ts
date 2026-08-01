import { p, section, type Section } from './expand-guides-depth-types';

export const BUYING_DEPTH_D: Section[] = [
  section('Complete bay-by-bay specification template for homeowners', [
    p(
      'Copy this structure for each opening: bay ID and room name, measured width at top and bottom, measured height at left and right, substrate notes from survey, product type chosen, stainless or polymer grade, spacing or aperture target, anchor type, access method assumed, association approval status, warranty years and inspection duties, and named decision owner.',
      'Filling one row per bay forces vendors to quote the same units and prevents the common trick where one vague total hides three different grades across similar-looking windows.',
      'Attach photos filenames to each bay row so email threads stay searchable when you revisit quotes three weeks later.',
    ),
    p(
      'For corner units, add wind exposure note and furniture plan sketch even if rough — climb paths are bay-specific.',
      'For duct openings, add bird versus debris primary hazard and whether interior access exists for future panel swaps without cradle days.',
      'For terrace sports areas, add sport type, pole footing assumption, and confirmation that fall barriers on adjacent balcony faces stay separate products.',
    ),
    p(
      'When the template is complete, remove any vendor quote that cannot map line items to bay rows without hand-waving.',
      'That filter alone saves committees dozens of hours on towers where fifty flats share ten bay types.',
    ),
    p(
      'Store the template with handover packs after install so maintenance vendors inherit the same bay language instead of reinventing measurements.',
    ),
  ]),
  section('Negotiating timelines without compressing cure and inspection steps', [
    p(
      'Festival move-in dates and school calendars create real deadline pressure, but epoxy cure, sealant cure, and gauge documentation have minimum durations physics does not waive.',
      'Buying should negotiate parallel prep — fabrication while association approves — rather than skipping cure to meet a symbolic possession date.',
      'Vendors who agree to impossible same-day structural completion on multi-bay flats without stating assumptions should be asked what they will skip in writing.',
    ),
    p(
      'Temporary securing can legitimately bridge a guest visit if spacing and supervision match the temporary scope — permanent install still follows cure rules.',
      'Distinguish temporary scope in contracts so warranty lines do not attach to interim hardware meant for days, not years.',
    ),
    p(
      'Tower lift curfews compress install hours; pricing and timelines must reflect actual available hours, not best-case uninterrupted days that never happen on occupied buildings.',
    ),
  ]),
  section('How committees evaluate vendor stability for ten-year estates', [
    p(
      'Committees should weigh local service depth, spare parts habits, documented bay-type libraries, and ticket response patterns — not brochure age or unrelated project photos from other states.',
      'Ask how many re-tension visits the vendor performed last monsoon season in your city microclimate; silence is data.',
      'Stability also means install crew identity: rotating anonymous subcontractors complicate warranty continuity when anchor batches fail in one wing.',
    ),
    p(
      'Request reference flats you can visit unannounced style — scheduled visits still beat stock images — and speak to facility managers, not only happy owners from year one.',
      'Evaluate whether the vendor maintains readable records keyed to bay ID; estates without records pay remobilisation for every mystery flat.',
    ),
  ]),
  section('Buying invisible grills when society mandates matching facade colour', [
    p(
      'Colour matching adds lead time for powder coat batches and touch-up kits for future scratches — specify RAL or approved sample chip, not verbal “match the window”.',
      'Coastal colour specs should include chalking expectations so committees do not reject legitimate UV fade as defect when chemistry was predictable.',
      'Dark coats run hotter; pair colour choice with grade and inspection cadence on south faces.',
    ),
    p(
      'Some societies ban visible verticals on street-facing facades while allowing interior-offset planes — buying must confirm which architectural plane is approved before fabrication offsets are cut wrong.',
    ),
  ]),
  section('Integrated duct, balcony, and terrace package governance', [
    p(
      'Large owners sometimes bundle duct nets, balcony cables, terrace sports, and building covering nets in one tender.',
      'Governance splits maintenance budgets: common area ducts versus flat-private balconies versus terrace rights — buying documents who owns each line item after handover.',
      'Mixed tenders fail when victory goes to lowest total but maintenance funding sits with a committee that did not approve spacing on private bays.',
    ),
    p(
      'Unbundle maintenance responsibility in the purchase phase even when install is bundled — ten-year cost lives in maintenance ownership clarity.',
    ),
  ]),
  section('Final depth checklist linking buying guide to survey booking', [
    p(
      'Before you book a survey on a local service page, confirm: hazard priority per bay, template rows filled, association path understood, grade and spacing targets written, access assumptions stated, warranty duties realistic, red-flag vendors removed, and decision owner named.',
      'That checklist converts this long guide into action without repeating phone sales calls that skip specifications.',
      'After survey, update template rows with measured numbers — buying continues until handover gauges match the updated template.',
    ),
    p(
      'Keep comparing vendors on updated templates only; early rough quotes were planning tools, not final comparators.',
    ),
  ], {
    callout:
      'Ten thousand words of guide material still ends in one page of numbers on your template. That page is what you pay for.',
  }),
];

export const INSTALL_DEPTH_D: Section[] = [
  section('Install crew roles: measurer, driller, tensioner, documenter', [
    p(
      'Clear roles reduce the failure mode where the best driller leaves before gauges are recorded and a junior finishes tension by feel.',
      'Documenter role captures photos and gauge passes while bays are still accessible — not after lift booking ends and furniture returned.',
      'Supervisor signs only when all four functions completed per bay ID.',
    ),
    p(
      'Owners watching install should know which role to speak with — design questions to supervisor, documentation to documenter — to avoid conflicting mid-day instructions.',
    ),
  ]),
  section('Re-work policy when substrate differs from survey assumption', [
    p(
      'Honest re-work stops install, notifies owner, prices remedial scope, and reschedules if needed.',
      'Hidden re-work into weak concrete without notification produces callbacks that exceed remedial price would have cost upfront.',
    ),
  ]),
  section('Seasonal heat and cold effects on same-day tensioning', [
    p(
      'Mid-day tension on hot metal frames may read differently at cool evening — document temperature band at tension time when extremes exceed seasonal norms.',
      'Re-gauge recommendations after first full heat cycle belong on handover in extreme climates inland and on dark-coated south faces.',
    ),
  ]),
  section('Install documentation archive structure for towers', [
    p(
      'Archive by wing, floor, bay type, and flat ID with consistent filenames — facility searches “B-wing-type-3” and finds photos, gauges, and specs instantly.',
      'Chaotic phone galleries from multiple crew members without naming convention die when staff turnover hits.',
    ),
  ], {
    bullets: [
      'One documenter per active crew on tower days',
      'Stop on substrate surprise with written notice',
      'Note temperature band at tension when extreme',
      'Filename convention agreed before tower start',
    ],
  }),
];

export const PRICING_DEPTH_D: Section[] = [
  section('Labour productivity assumptions that change quotes', [
    p(
      'Quotes assume productive hours after lift wait, security sign-in, and tool setup — low productivity assumptions raise labour fairly; hidden assumptions raise disputes.',
      'Ask vendors what daily bay count they assumed for your flat type; unrealistic counts show up as rushed installs or mid-project change orders.',
    ),
  ]),
  section('Civil make-good pricing when tiles crack during drilling', [
    p(
      'Tile repair pricing should reference who supplies replacement tiles and whether pattern matching is owner or vendor scope.',
      'Undefined make-good becomes emotional cost after install even when safety hardware price was fair.',
    ),
  ]),
  section('Bundled AMC pricing versus pay-per-visit maintenance', [
    p(
      'Annual maintenance contracts smooth cash flow for societies; pay-per-visit suits owner-occupied flats with low height and easy access.',
      'Compare AMC inclusion of re-tension, spare clips, and travel — not only visit count headlines.',
    ),
  ]),
  section('Pricing transparency for remeasure after owner-led renovation', [
    p(
      'Renovation remeasure fees should be stated upfront — they are cheaper than fabricating wrong frames.',
      'Price remeasure as professional service, not apology discount, when owners changed openings after original survey.',
    ),
  ]),
  section('Whole-guide pricing recap: factors in one narrative list', [
    p(
      'Area, grade, spacing, substrate, access, height, association soft costs, documentation, civil prep, maintenance horizon, and payment milestones interact — no single multiplier captures them.',
      'Use this recap when someone sends you a one-line “what should it cost” message — answer with factors, not fake rupees.',
    ),
  ], {
    callout:
      'Fair pricing is specified work priced honestly. Unspecified work priced low is a loan against your future change orders.',
  }),
];

export const MAINTENANCE_DEPTH_D: Section[] = [
  section('Annual professional visit scope for cable systems', [
    p(
      'Professional visits should include anchor inspection, turnbuckle function, gauge spacing at multiple heights, frame fastener spot check, and updated log entry — not only a visible sag glance from doorway.',
      'Owners receive written pass/fail notes per bay ID with photos of any flagged anchors.',
    ),
  ]),
  section('Annual professional visit scope for net systems', [
    p(
      'Net visits inspect border tension, corner knots, aperture drift from slippage, UV chalking stage, and attachment to substrate — panel IDs referenced in findings.',
      'Cleaning recommendations follow inspection, not generic pressure-wash advice that damages borders.',
    ),
  ]),
  section('Owner monthly checklist text you can pin on utility door', [
    p(
      'Month checklist: look for new rust streaks, visible slack mid-span, frayed twine, loose caps, water pooling on nets, squeaks under light hand pressure on rails, and furniture stacked into climb paths.',
      'Photograph anything new; compare to last month photo folder; book professional visit if two checklist items worsen on same bay.',
    ),
  ]),
  section('Maintenance handoff when selling the flat', [
    p(
      'Seller provides digital logbook, handover pack, and last professional report; buyer acknowledges spacing duties at registration conversation.',
      'Missing handoff should trigger buyer survey before move-in children and pets — maintenance story continues across ownership.',
    ),
  ]),
  section('Tower-wide maintenance tenders versus flat-by-flat chaos', [
    p(
      'Societies save cost with wing batched visits and shared access bookings — flat-by-flat ad hoc visits inflate travel and idle fees vendors embed in per-flat AMC quotes.',
      'Tender maintenance with bay-type map and shared calendar beats angry WhatsApp groups after storms.',
    ),
  ]),
  section('Closing maintenance depth: records beat heroics', [
    p(
      'Five thousand words on maintenance still reduce to dated photos and gauge notes — heroic last-minute fixes cost more than calendars everyone follows.',
      'Start logbook this month even if hardware is years old; baseline survey creates day one for your records.',
    ),
  ], {
    bullets: [
      'Professional visit scope written per product type',
      'Monthly owner checklist pinned visibly',
      'Seller handoff pack is part of sale',
      'Batch tower visits in maintenance tenders',
    ],
  }),
];

export const FAQ_DEPTH_D: Section[] = [
  section('Symptom tree: slack, rust, noise, birds, sag — start here', [
    p(
      'Slack without rust: schedule re-tension and gauge check.',
      'Rust streaks at anchors: photo, avoid loading bay, book inspection for substrate and fastener family.',
      'Noise in wind: tension balance and trim contact check.',
      'Birds persist: ledge ecology and aperture review, not only panel swap.',
      'Net sag centre-only: mid-support or panel replacement assessment.',
    ),
    p(
      'Use this tree before forum posts — symptoms combined matter more than single keywords.',
    ),
  ]),
  section('FAQ depth on association drilling bans on specific walls', [
    p(
      'When society bans drilling on certain faces, alternatives include interior-offset systems, clamp methods where approved, or structural remediation that creates approved fix zones — each priced separately after survey.',
      'Do not assume illegal drilling “everyone does” — committees enforce selectively after incidents.',
    ),
  ]),
  section('FAQ depth on combining old iron with new cables', [
    p(
      'Partial retention of iron may satisfy society aesthetics while cables handle spacing — survey defines load sharing and corrosion isolation between old iron and new stainless terminations.',
      'Mixed systems need maintenance plans for both materials — iron paint cycles do not pause because cables were added.',
    ),
  ]),
  section('FAQ depth on warranty when flat is rented out', [
    p(
      'Owner retains warranty duties to inspect; tenants must not modify hardware — lease should say so.',
      'Claims fail when unauthorized tenant hooks bend rails — document lease clauses referencing handover spec.',
    ),
  ]),
  section('FAQ depth on when to replace entire bay versus repair line', [
    p(
      'Replace bay when multiple anchors fail pull re-check, when spacing cannot meet hazard after adjustment, when frame is bent, or when product class was wrong from day one.',
      'Repair line when single cable, localized mesh tear, or one cap missing — technician confirms with gauges, not rule of thumb from phone photos alone.',
    ),
  ], {
    callout:
      'Send bay ID, symptom tree branch, and dated photos — answers get precise faster than generic “something is wrong” messages.',
  }),
];

export const MATERIALS_DEPTH_D: Section[] = [
  section('Material traceability folder for your flat file', [
    p(
      'Keep invoice grade lines, sample photos of anchors and clips, polymer batch labels if provided, and handover spec — traceability folder supports warranty and resale without claiming certifications you were never promised.',
      'Update folder when panels replaced so polymer age is honest per panel ID.',
    ),
  ]),
  section('When to step up from 304 to 316 on ambiguous microclimates', [
    p(
      'Step up when salt mist, industrial chloride fallout, persistent irrigation wetting, or failed 304 streaking appears within two monsoons on similar facing flats — environment trumps map inland labels.',
      'Step-up decisions should be written on change orders, not verbal afterthoughts.',
    ),
  ]),
  section('Material guide closing: specs you can defend in committee', [
    p(
      'Defensible specs name grade, polymer type, aperture, fastener family, coat system, and replacement horizon — two thousand words of materials depth should end in those lines on your template.',
    ),
  ]),
];

export const SAFETY_DEPTH_D: Section[] = [
  section('Safety guide closing: duties after handover', [
    p(
      'Monthly visual duty, storm walks, professional intervals, furniture discipline, and no unauthorized hooks — safety continues after install.',
      'Handover gauges are day zero; behaviour and logs are day one through year ten.',
    ),
  ]),
  section('Explaining safety scope to grandparents and help staff', [
    p(
      'Translate spacing goals into plain language for everyone using the balcony — hardware fails culturally when help staff use rails as drying anchors daily against design assumptions.',
      'Short printed pictorial guides on utility doors beat assuming everyone read the long safety guide.',
    ),
  ]),
];
