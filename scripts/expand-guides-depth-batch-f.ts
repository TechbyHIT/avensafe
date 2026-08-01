import { p, section, type Section } from './expand-guides-depth-types';

export const INSTALL_DEPTH_F: Section[] = [
  section('Tower wing repeatability: install QA sampling strategy', [
    p(
      'On repeating bay types, QA should sample every nth flat for full gauge documentation while spot-checking others for anchor caps and overlap corners — 100% full documentation on fifty identical bays wastes lift hours without improving safety if type-one sample was perfect and crews unchanged.',
      'Change crews or substrate class on a wing and reset sampling to 100% until the new crew proves repeatability.',
      'Facility maps record which flats have full gauge packs versus spot checks so warranty reviews know evidence depth.',
      'Sampling is not an excuse to skip gauges on fall-critical first instances of each type — first of type always fully documented.',
    ),
  ]),
  section('Install liability boundaries: owner-supplied tiles, paints, and civil patches', [
    p(
      'When owners supply matching tiles or paints for make-good, install teams document colour batch and cure before adjacent anchors are loaded — mismatch disputes fade when batches are named on handover.',
      'Civil patches executed by others must cure before final tension — installers refuse final sign-off when patch cure is immature and note refusal in writing to protect all parties.',
    ),
  ]),
  section('Extended handover training for help staff and family members', [
    p(
      'Five-minute training covers: do not hang heavy wet loads on cables, do not pressure-wash turnbuckles, do not add hooks, report slack or streaks immediately, and keep furniture away from climb paths.',
      'Printed pictorial guides on utility doors outperform assuming everyone read email handover packs.',
    ),
  ]),
  section('Install depth closure: five-thousand-word standard in practice', [
    p(
      'Survey truth, substrate honesty, gauge records, cure respect, and documentation before payment — install depth is complete when those five appear on your flat file, not when screws are merely driven.',
      'Re-run this checklist after any vendor revisit so partial repairs inherit the same standard as day-one install.',
    ),
  ], {
    callout:
      'Partial installs should never skip gauge documentation on “finished” bays while other bays wait — document what is complete per bay ID.',
  }),
];

export const PRICING_DEPTH_F: Section[] = [
  section('Sensitivity analysis: which line items move totals most on towers', [
    p(
      'Access and idle time often move tower totals more than stainless grade within the same city when lift rules are strict — sensitivity analysis means repricing the quote with plus-one cradle day and minus-one grade step to see which lever committees actually pulled.',
      'Corner variant counts move totals nonlinearly — pricing models that assume 10% corners when drawings show 35% corner-heavy wings mislead budgets.',
      'Civil remedial assumptions dominate low-rise small flats — sensitivity there beats arguing cable brand.',
    ),
  ]),
  section('Procurement ethics: depots, associations, and transparent exclusions', [
    p(
      'Ethical quotations list exclusions where they belong — shaft nesting clearance, owner-supplied finishes, third-party scaffold — rather than winning on incomplete scope.',
      'Associations respect vendors who lose tenders but leave clearer specs behind — reputational economics matter on multi-phase towers.',
    ),
  ]),
  section('Pricing for mixed-vintage retrofits on occupied towers', [
    p(
      'Retrofits mix old iron, prior nets, and new cables — pricing should include assessment days per wing before promising uniform per-flat rates.',
      'Vintage diversity destroys single-rate illusions; honest pricing says assess first, rate table second.',
    ),
  ]),
  section('Pricing depth closure: five-thousand-word literacy', [
    p(
      'You are price-literate when you can explain your total as sum of specified lines — area, grade, spacing, access, civil, documentation, maintenance horizon — without referring to forum folklore.',
      'Teach one committee member this literacy and tenders improve for years.',
    ),
  ], {
    bullets: [
      'Sensitivity-test access and corner counts',
      'List exclusions explicitly in comparisons',
      'Assess vintage wings before flat rates',
      'Explain totals as specified sums',
    ],
  }),
];

export const MAINTENANCE_DEPTH_F: Section[] = [
  section('Corrosion streak triage matrix for facility managers', [
    p(
      'Streak at single screw on trim: monitor monthly, photograph, likely cosmetic if isolated.',
      'Streak at multiple anchors same bay: schedule inspection within one week, reduce loading, check fastener family.',
      'Streak wing-wide same install month: escalate batch callback discussion with vendor and handover batch photos.',
      'Streak after facade pressure wash: inspect cap seals first, then anchors — washing often reveals weak seals rather than new grade failure.',
    ),
  ]),
  section('Cable slack triage matrix for owners', [
    p(
      'Uniform slight settle year one: normal if handover noted re-tension window — book seasonal visit.',
      'Visible drape mid-span: treat as climb risk for children — professional gauge before owner turns buckles.',
      'One cable notably looser than neighbours: inspect termination and substrate at that anchor before equalizing tension blindly.',
    ),
  ]),
  section('Net damage triage matrix for owners', [
    p(
      'Small tear away from border: patch if aperture still meets goal after patch shrinkage check.',
      'Border fray or knot slip: panel swap likely — patch masks structural border compromise.',
      'Multiple tears after impact event: assess full panel plus pole or frame contact points — impact may have bent frame subtly.',
    ),
  ]),
  section('Maintenance depth closure: five-thousand-word habits', [
    p(
      'Logbook, triage matrices, batched professional visits, and honest polymer replacement schedules — maintenance depth succeeds when habits are boring and repeatable.',
      'Exciting maintenance is almost always expensive maintenance.',
    ),
  ], {
    callout:
      'After cyclone warnings named by IMD for your district, walk openings even if annual visit is months away.',
  }),
];

export const FAQ_DEPTH_F: Section[] = [
  section('More symptoms: condensation, smells, and mesh discolouration', [
    p(
      'Musty smells near nets may mean trapped debris holding moisture — clean gently and inspect border for rot in organic debris, not necessarily polymer failure.',
      'Condensation on glass behind nets is ventilation and interior humidity physics — not solved by tightening cables unless stand-off traps air pockets designed wrong.',
      'Uniform discolouration on polymer may be UV chalking — compare bend brittleness at knot versus new sample twine if available from maintainer.',
    ),
  ]),
  section('More symptoms: society painting cycles and anchor burial', [
    p(
      'Fresh facade paint burying anchor caps needs cap exposure restored — paint over caps is a common post-painting callback root cause.',
      'Ask painters to mask anchors using bay photos before society-wide repaint tenders.',
    ),
  ]),
  section('More symptoms: vibration after metro or road construction', [
    p(
      'Ground-borne vibration rarely loosens sound anchors immediately but may crack weak substrate over months — new cracks radiating from anchors after construction deserve inspection even if cables feel unchanged.',
    ),
  ]),
  section('FAQ depth closure: five-thousand-word support hygiene', [
    p(
      'Build a support email template with bay ID, symptom branch, photos, hazard users, and last service date — paste monthly until it is habit.',
      'Good support hygiene reduces repeat visits and speeds warranty good faith on all sides.',
    ),
  ], {
    bullets: [
      'Debris smells: clean and inspect borders',
      'Paint cycles: mask anchors before repaint',
      'New anchor cracks after construction: inspect',
      'Use a fixed support email template',
    ],
  }),
];

export const BUYING_DEPTH_F: Section[] = [
  section('Ten-thousand-word buying depth: what you should carry into every vendor call', [
    p(
      'Carry hazard-ranked bay template, association status, substrate notes, access assumptions, grade and spacing targets, warranty duty realism, red-flag filters, and decision owner name — vendor calls without that list become performances, not procurement.',
      'Ask vendors to read back bay IDs they priced — mismatch between quote appendix and template rows catches omissions before deposits.',
      'Record calls with notes keyed to template rows when committees audit later — memory fails; row IDs persist.',
    ),
  ]),
];

export const MATERIALS_DEPTH_F: Section[] = [
  section('Two-thousand-word materials depth: invoice lines that matter', [
    p(
      'Invoice must carry AISI grade for stainless runs, polymer family and twine size for nets, coat system for frames, fastener family matching grade, and replacement horizon notes for sun-exposed polymers — if any line is missing, materials depth has not yet converted to purchase protection.',
      'Keep sample hardware photo in flat file — future maintainers inherit truth when invoices are lost.',
    ),
  ]),
];

export const SAFETY_DEPTH_F: Section[] = [
  section('Two-thousand-word safety depth: household rules that complement hardware', [
    p(
      'No unsupervised toddlers on fall-critical bays, no heavy laundry on cables, no climbing furniture at rails, storm walks after named warnings, professional gauges on schedule, and immediate securing calls when strands part — rules plus hardware beat hardware alone on real Indian balconies.',
      'Post rules where help staff and grandparents see them — safety culture is local, not only technical.',
    ),
  ]),
];
