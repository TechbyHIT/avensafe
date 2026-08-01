/**
 * Expands cornerstone guides toward the long-form depth targets.
 * Location pages stay short; these guides carry buying/install/price/maintenance/FAQ depth.
 *
 *   npx tsx scripts/expand-cornerstone-guides.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type Section = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  callout?: string;
};

type Guide = {
  id: string;
  slug: string;
  title: string;
  heading: string;
  description: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  readingMinutes: number;
  cornerstone: boolean;
  topic: string;
  sections: Section[];
  serviceIds: string[];
  faqIds: string[];
  published: boolean;
  imageId?: string;
};

const path = resolve('data/guides.json');
const guides = JSON.parse(readFileSync(path, 'utf8')) as Guide[];

function p(...parts: string[]): string {
  return parts.join(' ');
}

function section(heading: string, paragraphs: string[], extras?: Partial<Section>): Section {
  return { heading, paragraphs, ...extras };
}

const SERVICE_IDS = [
  'svc-invisible-grills',
  'svc-safety-nets',
  'svc-sports-nets',
  'svc-cloth-hangers',
  'svc-duct-area-safety-nets',
  'svc-building-covering-safety-nets',
];

const BUYING_EXTRA: Section[] = [
  section('Who this buying guide is for', [
    p(
      'This guide is for homeowners, apartment associations, facility managers, architects, and builders who need to choose a balcony or window safety system without drowning in brochure claims.',
      'It assumes you care about fall protection, pet safety, bird control, or drying convenience — and that you want a written specification you can compare across vendors.',
    ),
    p(
      'If you already know you want invisible grills or safety nets in a named locality, use the local service page for company details, photos, and a survey booking.',
      'Come back here when you need to understand grades, spacing, warranties, and red flags before you sign.',
    ),
  ]),
  section('Invisible grills vs safety nets vs iron grills', [
    p(
      'Invisible grills use tensioned stainless cables in a slim frame and preserve view and airflow while resisting falls when spacing and anchorage are correct.',
      'Safety nets close larger openings economically and suit bird control, duct shafts, and many mid-budget balconies where a soft mesh face is acceptable.',
    ),
    p(
      'Traditional iron or mild-steel grills block light, need paint cycles, and often fail through corrosion rather than sudden cable snap.',
      'Many homes combine products: cables on living balconies, nets on ducts or utility shafts, and cloth hangers where drying is the real problem.',
    ),
  ], {
    bullets: [
      'Choose invisible grills when view and child/pet fall protection dominate',
      'Choose safety nets when bird control or large cheap coverage dominates',
      'Keep iron grills only when society rules or heritage constraints force them',
    ],
  }),
  section('How to read a quotation like a professional', [
    p(
      'A usable quotation names measured openings, stainless or polymer grade, spacing or aperture, anchor type, what is included in labour, and the warranty basis.',
      'Totals without those lines are not comparable — two “same size” balconies can differ by a factor of two once access and grade are written down.',
    ),
    p(
      'Ask whether association drawings, debris removal, re-tension visits, and temporary securing are included.',
      'If a vendor refuses to put grade and spacing on paper, treat that as a selection signal, not a negotiation tactic.',
    ),
  ], {
    callout:
      'Compare specifications first and totals second. The cheapest line item is rarely the cheapest five-year outcome.',
  }),
  section('Spacing, child safety, and pet safety', [
    p(
      'Child safety is mostly about gap width, climb resistance, and maintenance — not slogans.',
      'Pet safety, especially for cats, usually needs tighter spacing and edge detailing that resists clawing at the perimeter.',
    ),
    p(
      'High-rise wind can force denser fixings even when the gap target stays the same.',
      'Agree the safety goal in writing: fall protection for toddlers, pet containment, bird exclusion, or a combination.',
    ),
  ]),
  section('Coastal vs inland material choices', [
    p(
      'Coastal and high-humidity belts reward SS316 or carefully specified polymers with UV stabilisation.',
      'Inland dry cities often perform well on verified SS304 for cables when association and warranty terms allow it.',
    ),
    p(
      'Do not accept “marine grade” as a verbal claim — ask for grade marks, mill certificates where relevant, and what happens if staining appears in the first monsoon.',
    ),
  ]),
  section('Association approvals and sample flats', [
    p(
      'Gated communities often need method statements, material specs, and a sample bay before drilling is allowed.',
      'Builders and associations should standardise bay types so every flat is not a one-off negotiation.',
    ),
    p(
      'Budget time for approval windows; they frequently exceed fabrication time on tower jobs.',
    ),
  ]),
  section('Warranty, inspections, and aftercare expectations', [
    p(
      'Warranty language should state what is covered, what voids cover, and how often you must inspect.',
      'Cables stretch; mesh abrades; anchors stain when water sits in incomplete seals — aftercare is part of the product.',
    ),
  ]),
  section('Red flags when choosing an installer', [
    p(
      'Cash-only lump sums with no scope, refusal to survey, recycled photos from other cities, and “lifetime warranty” with no inspection duties are common red flags.',
      'Prefer installers who document tension or mesh checks at handover and who will name a local contact for callbacks.',
    ),
  ], {
    bullets: [
      'No measured openings on the quote',
      'No grade or spacing written down',
      'Pressure to decide on a phone call without photos',
      'Warranty that excludes all monsoon and corrosion outcomes without explanation',
    ],
  }),
  section('Decision checklist before you book', [
    p(
      'Confirm product type, safety goal, grade, spacing, access plan, association needs, warranty, and survey date.',
      'Then book the local survey — the locality page is the right place to start the conversation; this guide is the right place to judge the paperwork.',
    ),
  ]),
];

const INSTALL_EXTRA: Section[] = [
  section('What a proper survey actually checks', [
    p(
      'A survey measures each opening, inspects substrate soundness, notes tile overhangs and frame conflicts, and records access routes for long sections.',
      'It also captures association rules: drilling hours, lift bookings, and whether external scaffolding is allowed.',
    ),
    p(
      'Photographs help, but they do not replace mid-span and corner measurements when quotations must be firm.',
    ),
  ]),
  section('Site preparation the day before install', [
    p(
      'Clear the balcony or window bay, protect floors, and confirm water and power if cutting or vacuuming is required.',
      'Tell neighbours when drilling will happen if society rules expect notice.',
    ),
  ], {
    bullets: [
      'Empty the working bay and remove loose planters',
      'Protect flooring and French-door tracks',
      'Confirm parking or loading access for frames and tools',
      'Keep pets and children away from the work zone',
    ],
  }),
  section('Fixing into different substrates', [
    p(
      'Sound concrete, hollow blocks, and stone cladding each need different anchors.',
      'Weak or spalling parapets must be repaired or bypassed with a written method — forcing a chemical anchor into crumbling edges is how early failures start.',
    ),
  ]),
  section('Tensioning invisible grill cables', [
    p(
      'Cables are tensioned evenly so mid-span deflection stays within the agreed limit.',
      'Turnbuckles or tensioners should remain reachable for later inspection without dismantling the whole bay.',
    ),
    p(
      'Over-tensioning into soft edges can crack plaster; under-tensioning leaves climbable slack. The survey notes which risk dominates on your opening.',
    ),
  ]),
  section('Net installation on balconies, ducts, and terraces', [
    p(
      'Nets need perimeter rope or cable support, correct aperture for the hazard, and overlaps that birds or debris cannot work open.',
      'Duct and shaft jobs add fall-object risk for lower floors — panel size and fixing density matter as much as polymer brand names.',
    ),
  ]),
  section('Quality checks before handover', [
    p(
      'Before leaving, crews should verify spacing or aperture, tension or mesh tautness, anchor seating, edge finishing, and debris cleanup.',
      'You should receive the installed specification in writing, matching the quotation lines.',
    ),
  ], {
    callout: 'If the handover sheet does not match the quote’s grade and spacing, stop and resolve before final payment.',
  }),
  section('Typical timelines and what delays installs', [
    p(
      'Fabrication is often faster than association approval or monsoon pauses.',
      'Same-day full installs without measurement are rare for multi-bay apartments; same-day surveys or emergency securing are more realistic when stock and access align.',
    ),
  ]),
  section('Working in occupied homes and offices', [
    p(
      'Dust control, shoe covers, and agreed quiet hours keep occupied installs civil.',
      'Commercial sites may need night work — that labour line should appear on the quote when required.',
    ),
  ]),
];

const PRICING_EXTRA: Section[] = [
  section('Building a fair comparison spreadsheet', [
    p(
      'List each vendor’s grade, spacing, included labour, access method, warranty years, and exclusions in columns.',
      'Only then compare totals. A lower number with coarser spacing is not the same product as a tighter child-safety pitch.',
    ),
  ]),
  section('Access equipment and height premiums', [
    p(
      'Cradles, rope access, and long-distance travel can exceed mesh cost on some towers.',
      'Ask whether access is itemised or buried — buried access is how “cheap” quotes expand after survey.',
    ),
  ]),
  section('Association and compliance costs', [
    p(
      'Drawings, sample flats, security deposits, and restricted drilling windows add soft cost even when material rates look low.',
      'Transparent vendors estimate those lines early rather than surprising you at the gate.',
    ),
  ]),
  section('When premium specification is worth it', [
    p(
      'Coastal salt air, high wind floors, pet pressure, and toddler fall risk justify denser spacing or higher grades.',
      'Inland low balconies used only for plants may not need the same package — and should not be sold as if they do.',
    ),
  ]),
  section('Payment schedules that protect both sides', [
    p(
      'A modest booking after survey, a fabrication milestone, and a balance on handover with the specification sheet is a common fair pattern.',
      'Avoid paying the full amount before materials are on site and openings are measured.',
    ),
  ]),
  section('Maintenance cost over five years', [
    p(
      'Factor inspection time, possible re-tension visits, and cleaning — not only day-one install price.',
      'Nets in harsh sun may need earlier panel replacement than inland stainless cable systems.',
    ),
  ]),
  section('Quotes for associations and multi-flat packages', [
    p(
      'Repeating bay types should reduce per-flat cost, but only when sample approvals and standardised specs are real.',
      'Demand a rate card tied to bay drawings, not a vague “per flat” number that ignores corner units and duplex voids.',
    ),
  ]),
];

const MAINTENANCE_EXTRA: Section[] = [
  section('Monthly visual checks anyone can do', [
    p(
      'Look for slack at mid-span, rust weeping at anchors, frayed mesh, loose rope ends, and debris holding water against frames.',
      'Photograph anything new so you can compare month to month.',
    ),
  ]),
  section('After every heavy monsoon or cyclone warning', [
    p(
      'Walk the openings once weather clears. Wind-driven rain finds incomplete seals and loose perimeter rope faster than calm seasons do.',
      'Book a professional inspection if you see movement, staining streaks that grow, or mesh holes.',
    ),
  ]),
  section('Cleaning without damaging coatings', [
    p(
      'Mild soap and water usually suffice. Avoid chlorinated bleaches on stainless and harsh solvents on polymers unless the manufacturer allows them.',
      'Do not stand on nets or cables to reach higher floors.',
    ),
  ]),
  section('Re-tensioning cables', [
    p(
      'Slight settling is normal. Re-tensioning should restore mid-span firmness without cracking plaster at the anchors.',
      'If one cable repeatedly loosens, the issue may be substrate or termination design — not a DIY turn of the buckle.',
    ),
  ]),
  section('When to call for repair vs replacement', [
    p(
      'Localised mesh tears, single-cable damage, or one failed anchor often warrant repair.',
      'Widespread corrosion, systemic under-spacing for your current household risk, or frames that no longer match remodelled openings may warrant replacement.',
    ),
  ]),
  section('Records to keep with your warranty', [
    p(
      'Store the quotation, handover sheet, photos at install, and dates of inspections.',
      'Warranty claims without a paper trail are harder for everyone — including conscientious installers.',
    ),
  ]),
  section('Facility manager checklist for towers', [
    p(
      'Log each flat’s product type, last inspection, and known association constraints.',
      'Batch re-inspections by wing so travel and access bookings stay efficient.',
    ),
  ], {
    bullets: [
      'Maintain a bay-type map for the society',
      'Schedule post-monsoon sweeps',
      'Escalate rust streaks within one week of notice',
      'Never allow unvetted vendors to drill without method statements',
    ],
  }),
];

const FAQ_GUIDE: Guide = {
  id: 'gd-faq-troubleshooting',
  slug: 'faq-troubleshooting-guide',
  title: 'Invisible Grills and Safety Nets FAQ & Troubleshooting',
  heading: 'FAQ and troubleshooting for balcony safety systems',
  description:
    'Practical answers to common questions about invisible grills, safety nets, spacing, rust, maintenance, warranties, and when to call for repair — written for homeowners and facility teams.',
  excerpt:
    'Start here when something looks wrong, or when you need a straight answer before booking a survey.',
  publishedAt: '2025-11-02',
  updatedAt: '2026-08-01',
  author: 'Avensafe Solutions',
  readingMinutes: 28,
  cornerstone: true,
  topic: 'faq',
  serviceIds: SERVICE_IDS,
  faqIds: [],
  published: true,
  sections: [
    section('How to use this FAQ guide', [
      p(
        'Skim the headings for your symptom or question. Local service pages still handle booking, photos, and area-specific access notes; this guide handles the recurring technical questions that should not be rewritten on every locality URL.',
      ),
    ]),
    section('Are invisible grills safe for children?', [
      p(
        'They can be, when spacing, anchorage, and maintenance match a child-safety goal.',
        'Safety is not automatic from the product name — ask for the gap target in writing and re-check after the first monsoon.',
      ),
    ]),
    section('Can pets push through nets or cables?', [
      p(
        'Cats and small dogs test edges and gaps. Tighter spacing and robust perimeter detailing matter more than marketing photos of open views.',
        'Tell the surveyor about pets before the quote is locked.',
      ),
    ]),
    section('Why is there rust staining under an anchor?', [
      p(
        'Staining can come from non-stainless fasteners, contaminated swarf left in plaster, or water sitting against carbon-steel accessories.',
        'True cable pitting is different from cosmetic streaks — a site visit distinguishes them.',
      ),
    ]),
    section('The cables feel looser than on install day', [
      p(
        'Some settling is expected. If slack is visible or climbable, schedule a re-tension check rather than forcing the turnbuckle without inspecting anchors.',
      ),
    ]),
    section('Birds are still landing on my ledge', [
      p(
        'Bird control fails when aperture, overlaps, or ledge coverage leave landing spots.',
        'A repair may mean extending coverage, not only replacing a torn panel.',
      ),
    ]),
    section('How long does installation take?', [
      p(
        'Many single-bay jobs finish in a few hours after survey and fabrication; multi-bay towers depend on lift bookings and approvals.',
        'Emergency securing can be faster than a full cosmetic finish.',
      ),
    ]),
    section('Do I need association approval?', [
      p(
        'Most gated apartments do. Bring the written specification and method notes; we prepare survey-based paperwork when societies require it.',
      ),
    ]),
    section('What voids a warranty?', [
      p(
        'Unapproved modifications, skipped inspections when required, chemical abuse, and impact damage outside normal use are common exclusions.',
        'Read your handover sheet — verbal “lifetime” claims without duties are not a plan.',
      ),
    ]),
    section('Invisible grills vs mosquito mesh vs zip screens', [
      p(
        'These solve different problems. Mosquito mesh is insect control; zip screens are shading and insect control; invisible grills are structural fall barriers.',
        'Do not substitute one for the other when the risk is a fall from height.',
      ),
    ]),
    section('When to call for an emergency visit', [
      p(
        'Call when a cable has failed, a net has opened a climbable gap, or an opening cannot wait for a routine slot because of children, pets, or active bird nesting that creates hygiene risk.',
        'We prioritise temporary securing, then a measured permanent repair.',
      ),
    ], {
      callout: 'If anyone is at immediate risk of falling, keep people away from the opening and call without waiting for email quotes.',
    }),
    section('Still stuck? What to send us', [
      p(
        'Send locality, floor, clear photos of the full opening and close-ups of the problem, and whether children or pets use the space.',
        'That package is enough to schedule the right visit instead of a blind sales call.',
      ),
    ]),
  ],
};

function wordCount(guide: Guide): number {
  return guide.sections.reduce(
    (total, s) =>
      total +
      s.paragraphs.reduce((sum, para) => sum + para.split(/\s+/u).length, 0) +
      (s.bullets?.reduce((sum, b) => sum + b.split(/\s+/u).length, 0) ?? 0) +
      (s.callout ? s.callout.split(/\s+/u).length : 0),
    0,
  );
}

function upsertExtras(slug: string, extras: Section[], cornerstone = true): void {
  const guide = guides.find((entry) => entry.slug === slug);
  if (!guide) throw new Error(`Missing guide ${slug}`);
  const existingHeadings = new Set(guide.sections.map((s) => s.heading));
  for (const extra of extras) {
    if (!existingHeadings.has(extra.heading)) guide.sections.push(extra);
  }
  guide.cornerstone = cornerstone;
  guide.updatedAt = '2026-08-01';
  guide.readingMinutes = Math.max(guide.readingMinutes, Math.round(wordCount(guide) / 180));
}

upsertExtras('balcony-safety-buying-guide', BUYING_EXTRA, true);
upsertExtras('installation-guide', INSTALL_EXTRA, true);
upsertExtras('pricing-guide', PRICING_EXTRA, true);
upsertExtras('net-and-cable-maintenance-guide', MAINTENANCE_EXTRA, true);

if (!guides.some((g) => g.slug === FAQ_GUIDE.slug)) {
  guides.push(FAQ_GUIDE);
} else {
  upsertExtras(FAQ_GUIDE.slug, FAQ_GUIDE.sections, true);
}

writeFileSync(path, `${JSON.stringify(guides, null, 2)}\n`, 'utf8');

for (const guide of guides) {
  console.log(`${guide.slug}: ~${wordCount(guide)} words, sections=${guide.sections.length}, cornerstone=${guide.cornerstone}`);
}
