import { p, section, type Section } from './expand-guides-depth-types';

export const INSTALL_DEPTH: Section[] = [
  section('Lift bookings, loading docks, and material staging', [
    p(
      'Tower installs fail schedules when lift capacity or booking windows were never on the quotation.',
      'Survey notes should record maximum frame length, whether service lifts accept diagonal loads, and where materials may stage overnight without blocking fire lanes.',
    ),
    p(
      'Ground-plus-twenty projects sometimes require split deliveries: frames one day, mesh and tension hardware the next.',
      'Install leads should confirm parking for vans with ladder racks before crews depart the workshop.',
    ),
  ]),
  section('Pre-drill marking and owner walk-through', [
    p(
      'Marking drill points on finished plaster lets owners see conflicts with concealed conduits before holes are permanent.',
      'Walk the marks together when possible, especially on renovated flats where as-built differs from developer drawings.',
    ),
    p(
      'Laser lines across tile joints reduce the “it looked straight from inside” disputes after sun glare reveals a drift.',
      'Photograph marked bays before drilling starts — handover albums should include this step.',
    ),
  ]),
  section('Concrete cores, rebound tests, and anchor selection', [
    p(
      'When cores are permitted, one core near a proposed anchor beats guessing M20 from tap sound alone.',
      'Where cores are forbidden, calibrated pull tests on sacrificial anchors in low-visibility corners provide comparable confidence.',
    ),
    p(
      'Hollow block requires through-bolts or epoxy systems rated for void geometry — expansion anchors alone are a common shortcut on weak webs.',
      'Install teams should stop and escalate when block crumbles during pilot holes instead of forcing longer screws.',
    ),
  ]),
  section('Stone cladding, tile facades, and stand-off brackets', [
    p(
      'Fixing through decorative stone without cracking requires stand-offs designed for the stone thickness and flex.',
      'Installers map joints to avoid drilling through weak mortar lines that look solid from inside the balcony.',
    ),
    p(
      'Stand-off depth changes the visual plane — owners approve offset mock-ups on one corner before full runs proceed.',
    ),
  ]),
  section('Waterproofing integration at parapet tops', [
    p(
      'Parapet caps and groove details must be restored after anchors penetrate horizontal surfaces.',
      'Install method should name sealant type, backer rod use, and cure time before exposing anchors to monsoon spray.',
    ),
    p(
      'Leaks attributed to grills are often uncapped pilot holes — crews carry cap plugs and sealant kits as standard, not optional extras.',
    ),
  ]),
  section('Cable routing at mullions and structural columns', [
    p(
      'Routing cables around columns without kinks requires factory bends or controlled field bending within manufacturer radius limits.',
      'Over-bending work-hardens some grades and creates future fracture points visible only after years of vibration.',
    ),
    p(
      'Document which cables are continuous versus terminated at mullions so future maintenance does not assume a single run.',
    ),
  ]),
  section('Net panel sizing for future replacement', [
    p(
      'Oversized single panels look efficient on install day and expensive when one tear requires replacing an entire face.',
      'Install plans should use manageable panel modules with labelled lacing points so partial replacement stays practical.',
    ),
    p(
      'Label panel IDs on the frame inner face with UV-stable tags facility teams can read without dismantling rope borders.',
    ),
  ]),
  section('Duct and shaft installs with fall-object controls', [
    p(
      'Working over occupied lower floors requires debris nets and tool tethering beyond personal harness rules.',
      'Install supervisors brief residents about brief access closures and confirm society signage at lobby level.',
    ),
    p(
      'Shaft panels should be tensioned so wind suction does not slap mesh against rotating equipment inside the duct where present.',
    ),
  ]),
  section('Sports net poles, footings, and slab protection', [
    p(
      'Weighted bases need neoprene or mat interfaces approved by waterproofing vendors on terrace slabs.',
      'Bolt-down poles require explicit structural sign-off — installers do not guess slab thickness at corners.',
    ),
    p(
      'Net height and pole setback should match the sport; cricket nets need more run-back than badminton, affecting anchor layout on shared terraces.',
    ),
  ]),
  section('Cloth hanger embed plates and slab scanning', [
    p(
      'Ceiling hanger installs benefit from rebar scanners or developer slab drawings to avoid cutting tendons in post-tension flats.',
      'When scanning is unavailable, shift anchor patterns to known safe zones even if the layout is less symmetric.',
    ),
    p(
      'Embed plates should be torqued to spec and cover plates finished flush so water does not sit in recesses.',
    ),
  ]),
  section('Electrical isolation and hidden conduits', [
    p(
      'Balcony light conduits and AC lines often run inside parapet cores where drill depth exceeds visual plaster thickness.',
      'Install crews use non-contact detectors and stop when readings conflict — rerouting beats emergency electrician calls.',
    ),
    p(
      'Document any avoided drill points on the handover sheet so future owners do not assume “no hole here” means weak concrete.',
    ),
  ]),
  section('Torque, tension gauges, and recorded settings', [
    p(
      'Reputable cable installs record initial tension or turn counts per corner on the handover sheet.',
      'That baseline makes year-one re-tension visits objective instead of subjective “feels fine” assessments.',
    ),
    p(
      'Over-torque into friable edges is prevented by torque limits on drivers, not by installer feel alone on long shifts.',
    ),
  ]),
  section('Edge finishing, end caps, and snag lists', [
    p(
      'Exposed cut ends and sharp bracket edges snag clothing and children’s skin — finishing is part of structural safety, not cosmetics.',
      'Snag lists should include cap presence, screw orientation away from grab zones, and smooth rope melts on net perimeters.',
    ),
    p(
      'Owners walk snag lists before final payment; installers close items with photos when owners are remote.',
    ),
  ]),
  section('Post-install curing before load and use', [
    p(
      'Epoxy anchors and some sealants need cure windows before full tension or heavy planter loads apply.',
      'Handover should state earliest date for hanging wet laundry on new ceiling rails or placing large pots against frames.',
    ),
    p(
      'Children and pets should stay off fresh net panels until perimeter lacing is confirmed settled after first night’s temperature drop.',
    ),
  ]),
  section('As-built drawings and digital handover packs', [
    p(
      'As-built sketches with bay IDs, grade, spacing, and anchor type beat verbal memory when associations audit years later.',
      'Digital packs with dated photos, torque notes, and warranty duties belong in email to owners and facility mailboxes.',
    ),
    p(
      'Store copies where tenancy changes — new renters rarely inherit paper folders left in kitchen drawers.',
    ),
  ], {
    callout:
      'Handover is incomplete without a specification that matches the quotation line by line. Treat mismatches as open items, not invoice triggers.',
  }),
];

export const PRICING_DEPTH: Section[] = [
  section('Labour bands: measurement, fabrication, and install', [
    p(
      'Split quotations into measurement, shop work, and site labour so you see where cheap bids hide missing steps.',
      'A quote with material but no measured labour often explodes after “complexity” surcharges on install day.',
    ),
    p(
      'Night or weekend labour for occupied offices carries legitimate multipliers — they should appear as named lines, not mystery fees.',
    ),
  ]),
  section('Travel, city zones, and multi-site portfolios', [
    p(
      'Vendors serving multiple cities price travel differently: some absorb within a radius, others itemise per visit.',
      'Portfolio owners managing flats in two cities should ask for survey batching to avoid duplicate mobilisation charges.',
    ),
    p(
      'Tower phases may need multiple mobilisations as wings hand over — price phases explicitly instead of one lump sum that stalls.',
    ),
  ]),
  section('Scaffold, cradle, and rope-access economics', [
    p(
      'External cradles rent by day with minimum hire even when work finishes in hours.',
      'Compare cradle days across vendors only when bay counts and safety tie-off points are identical.',
    ),
    p(
      'Rope access suits narrow faces where scaffold erection damages landscaping — skill premiums belong in open labour lines.',
    ),
  ]),
  section('Remedial civil before anchor acceptance', [
    p(
      'Parapet rebuild, grout injection, and crack stitching are civil lines separate from grill material.',
      'Transparent quotes list remedial scope with unit assumptions; opaque quotes discover weak concrete at first drill.',
    ),
    p(
      'Paying civil first hurts cash flow but prevents paying twice when grills are removed to fix substrate later.',
    ),
  ]),
  section('Change orders after survey versus before fabrication', [
    p(
      'Changes before cut are cheaper than changes after powder coat or cable cut-to-length.',
      'Contracts should define cut-off dates and how spacing changes repricing — especially when child-safety spacing tightens late.',
    ),
    p(
      'Association-mandated spacing changes after sample approval are common — budget contingency for committee feedback.',
    ),
  ]),
  section('Warranty pricing and inspection visit fees', [
    p(
      'Some warranties include one re-tension visit; others bill travel after year one.',
      'Compare total cost of ownership by reading inspection duties, not only year count on the headline.',
    ),
    p(
      'Extended warranties without defined inspection intervals are marketing — price them accordingly.',
    ),
  ]),
  section('Bulk tower pricing and true economies of scale', [
    p(
      'Bulk discounts appear when bay drawings repeat and crews stay on site for weeks.',
      'Fake bulk pricing quotes one low flat rate then custom-prices every corner unit — watch variant counts.',
    ),
    p(
      'Societies should negotiate rate tables tied to approved drawings, with pre-agreed premiums for variants above a threshold count.',
    ),
  ]),
  section('Comparing imported hardware versus local fabrication', [
    p(
      'Imported kits may save shop time but add freight and duty swings.',
      'Local fabrication flexes when survey reveals odd angles — compare lead time risk, not only material invoice.',
    ),
    p(
      'Hardware origin does not replace grade labels; verify AISI markings on received batches before bulk install payments.',
    ),
  ]),
  section('Tax, invoice structure, and milestone GST clarity', [
    p(
      'Milestone invoices should describe work completed, not vague “progress” percentages disputed at handover.',
      'Associations paying from corpus need line items societies can audit — ask for split material and labour where required locally.',
    ),
    p(
      'We do not publish tax advice; we do recommend readable invoices that match scope paragraphs.',
    ),
  ]),
  section('Emergency securing versus full install pricing', [
    p(
      'Temporary securing uses stock hardware and shorter spacing guarantees — price should be lower and scope narrower.',
      'Full install quotes should not bundle temporary work without labelling it, or owners pay premium rates for interim fixes.',
    ),
    p(
      'Credit temporary fees toward permanent work only when written up front — verbal promises disappear after staff turnover.',
    ),
  ]),
  section('Cloth hanger and combo-package bundling traps', [
    p(
      'Bundles discount hangers when safety scope is healthy; they obscure safety cuts when hanger margin subsidises missing anchors.',
      'Unbundle mentally: price hangers as if bought alone, then compare safety lines across vendors.',
    ),
    p(
      'Ceiling hanger complexity on post-tension slabs may exceed grill cost on small utility bays — bundles hide that imbalance.',
    ),
  ]),
  section('Net replacement cycles in total cost models', [
    p(
      'Sun-exposed polymer nets may need replacement years before stainless cables on the same tower.',
      'Five-year models should include net panel replacement allowance on terraces even when balconies stay stainless-only.',
    ),
    p(
      'Cheaper twine saves day one but shifts cost to year three — spreadsheet it honestly.',
    ),
  ]),
  section('Negotiation without trading away gap control', [
    p(
      'Valid negotiations shift timing, payment milestones, or grade where environment allows — not spacing on toddler balconies.',
      'Vendors who offer “child safe spacing at economy price” without denser fix counts are trading invisible risk.',
    ),
    p(
      'Ask what changed when price drops: access method, grade, spacing, or warranty visits — one of them moved.',
    ),
  ], {
    bullets: [
      'Never accept wider gaps to match a competitor total',
      'Document any grade downgrade in writing with environment rationale',
      'Keep excluded civil remedials visible in comparisons',
    ],
  }),
];

export const MAINTENANCE_DEPTH: Section[] = [
  section('Quarterly checks for high-rise and coastal flats', [
    p(
      'Flats above open wind corridors or within five kilometres of salt air benefit from quarterly visual walks, not only annual ones.',
      'Look for new rust streaks, cable dimples at mid-span, and rope fuzz on net borders after each named storm.',
    ),
    p(
      'Log findings in a simple spreadsheet with photo links — patterns emerge faster than memory across monsoon seasons.',
    ),
  ]),
  section('Stainless care without chlorinated cleaners', [
    p(
      'Chlorinated balcony cleaners and pool chemicals misted by wind can attack stainless terminations even when cables look fine.',
      'Rinse frames after aggressive cleaning on neighbouring slabs if overspray is common on tight tower spacing.',
    ),
    p(
      'Passivation is not magic — it helps fresh installs but does not replace wrong grades or carbon-steel mix-ins.',
    ),
  ]),
  section('Lubricating adjusters and preventing seizure', [
    p(
      'Turnbuckles seized by salt and dust need gentle cleaning and manufacturer-approved lubricants — brute force wrenches round flats and hides cracked anchors.',
      'Facility teams schedule lubrication on accessible flats before monsoon so adjusters move during post-storm checks.',
    ),
    p(
      'Replace seized hardware in pairs where tension sharing matters; one free turnbuckle and one seized unit loads unevenly.',
    ),
  ]),
  section('Mesh patching versus panel swap decision tree', [
    p(
      'Small tears away from borders patch cleanly with compatible twine and knot discipline.',
      'Tears into border rope or multiple aligned holes mean panel swap — patching becomes climbable after shrinkage.',
    ),
    p(
      'Photograph patch date and twine batch so warranty reviewers see professional repair rather than DIY string.',
    ),
  ]),
  section('Bird nesting debris and hygiene cycles', [
    p(
      'Nesting material holds moisture against frames and accelerates corrosion under debris mats.',
      'Schedule gentle removal when seasons allow, using gloves and society hygiene rules for droppings.',
    ),
    p(
      'After removal, inspect aperture for widening from pecking — birds return to the same geometry unless it changes.',
    ),
  ]),
  section('Cloth hanger rails: sag, squeak, and anchor checks', [
    p(
      'Ceiling rails sag when anchors creep in soft plaster or when wet loads exceed design spread.',
      'Monthly light tug on each rail confirms embed security; squeaks often precede visible sag by a season.',
    ),
    p(
      'Retractable wall lines need periodic wipe and tension check on spring mechanisms exposed to salt air.',
    ),
  ]),
  section('Sports net tension after monsoon', [
    p(
      'Terrace sports nets lose tension when perimeter ropes absorb water and dry repeatedly.',
      'Re-tension sport perimeters separately from balcony safety nets — different loads and inspection standards apply.',
    ),
    p(
      'Inspect pole footings after storms for mat shift or bolt loosening before next play season.',
    ),
  ]),
  section('Building covering nets during long projects', [
    p(
      'Construction nets need weekly walks for tears caused by scaffolding movement.',
      'Replace panels that open fall paths immediately — temporary nets fail faster under UV and abrasion than permanent installs.',
    ),
    p(
      'Log removal date so temporary systems do not become permanent bird highways after handover delays.',
    ),
  ]),
  section('Corrosion mapping on multi-flat towers', [
    p(
      'Facility managers map rust streaks by elevation and wing to spot galvanic batches or single bad anchor lots.',
      'Batch callbacks are cheaper when maps show clustering on one install week rather than random flats.',
    ),
    p(
      'Share maps with original installers when warranty covers hardware batches — vague “some flats rust” delays action.',
    ),
  ]),
  section('Professional service intervals and owner duties', [
    p(
      'Warranties often require owner visual duty monthly and professional inspection annually — missing logs complicates good-faith claims.',
      'Book professional visits before monsoon when crews are busy, not after the first leak complaint.',
    ),
    p(
      'Keep children off openings until professional re-tension closes open snag items from the visit report.',
    ),
  ], {
    callout:
      'Maintenance is cheaper when records exist. Treat photos and dates as part of the product, not paperwork.',
  }),
];
