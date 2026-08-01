import { p, section, type Section } from './expand-guides-depth-types';

export const INSTALL_DEPTH_B: Section[] = [
  section('Mobilisation checklist for multi-bay apartment installs', [
    p(
      'Multi-bay flats fail handover when crews run out of one anchor size mid-shift and improvise with mismatched fasteners to finish before lift booking expires.',
      'Mobilisation lists should match surveyed counts for anchors, turnbuckles, panel IDs, and sealant cartridges per bay before vans leave the workshop.',
      'Supervisors carry spare anchor sets for the surveyed substrate class, not a random mixed box that invites galvanic pairs at the last hole.',
    ),
    p(
      'Flat owners should confirm which bays are in scope day one versus day two so furniture moves happen once, not repeatedly across a week of partial visits.',
    ),
  ]),
  section('Rain protocols: when to stop drilling and when to tent', [
    p(
      'Active rain and uncured epoxy are incompatible — continuing to drill to meet arbitrary deadlines creates leak paths that surface months later as “grill leaks.”',
      'Install protocols should name rainfall thresholds, tenting options for light drizzle on horizontal parapets, and who decides go/no-go on site.',
      'Owners deserve honest pauses even when travel costs repeat; pausing beats sealing wet holes.',
    ),
    p(
      'Monsoon installs can proceed on dry windows with pre-cut frames staged indoors, but anchor cure times still govern when tension is applied.',
    ),
  ]),
  section('Invisible grill alignment with eye level and sight lines', [
    p(
      'Crews align frames to agreed reference lines — often door head or tile joint — not to whichever line is fastest with a short cable offcut.',
      'Misalignment of a few millimetres across a wide bay reads as a crooked grid from the sofa and triggers disproportionate dissatisfaction relative to structural safety.',
      'Install leads should pause for owner sight-line approval on the first vertical before repeating a pattern on remaining members.',
    ),
    p(
      'Camera photos from interior seated eye height belong in handover when owners cannot attend mid-install.',
    ),
  ]),
  section('Handling existing damage discovered mid-install', [
    p(
      'Spalled parapets and cracked sills appear when first holes are opened — stop protocols should require owner notification before expanding scope silently.',
      'Document discovered damage with photos and a short civil recommendation even when grill crew is not the civil contractor.',
      'Installing into knowingly weak edges without written acceptance creates liability nobody wants at handover.',
    ),
  ]),
  section('Net overlap rules at corners and top flaps', [
    p(
      'Bird and safety nets fail at corners when overlap length is shortened to save twine time.',
      'Install standards should specify overlap direction, minimum overlap length, and how top flaps close against chajja drip lines without trapping water.',
      'Corner photos at tensioning completion prove overlaps were executed before sign-off.',
    ),
  ]),
  section('Cladding penetration approvals on post-tension towers', [
    p(
      'Post-tension slabs sometimes restrict drill zones near tendons documented only on structural drawings.',
      'Install teams cross-check developer drawings or use scanning when available; shifting anchor patterns beats hitting tendon zones.',
      'Handover notes should mark any shifted points so future owners do not assume symmetry implies identical substrate.',
    ),
  ]),
  section('Fire stopping and shaft net interfaces', [
    p(
      'Duct nets near fire-rated assemblies may need approved penetration details — generic mesh cannot assume fire integrity is preserved.',
      'Install scope should clarify whether fire stopping is by others or included, because ambiguity delays occupancy certificates on commercial cores.',
    ),
  ]),
  section('Testing cable spacing after tension with go/no-go gauges', [
    p(
      'Spacing checks use go/no-go gauges at multiple heights, not a single measurement at mid-span while doors are closed.',
      'Child-safety targets fail when spacing widens near turnbuckles or at bottom rails where toddlers probe first.',
      'Record gauge pass locations on handover sheets so warranty reviews have objective baselines.',
    ),
  ]),
  section('Waste removal, screw cap collection, and neighbour courtesy', [
    p(
      'Swarf left on lower balconies becomes rust stains and neighbour complaints that overshadow quality work above.',
      'Crews vacuum drill zones, collect caps, and walk lower affected balconies before demobilising when work happened on upper floors.',
      'Society thank-you notes often follow neat demobilisation more than invisible technical perfection they cannot see.',
    ),
  ]),
  section('Training owners on adjuster access without voiding warranty', [
    p(
      'Brief owners on which adjusters they may touch for minor seasonal checks versus which changes require technician visits.',
      'Over-tightening one corner to fix a hum can crack anchors — training is part of install completion, not optional chit-chat.',
      'Leave a short printed guide keyed to bay photos when owners are not present at handover.',
    ),
  ]),
  section('Close-out meetings with facility teams on towers', [
    p(
      'Tower handover should include facility staff who will approve future vendor access and store bay-type drawings.',
      'Walk one sample flat per bay type, not only the penthouse showcase unit committees photographed for brochures.',
      'Facility contacts receive digital packs so tenant move-in/out does not lose specification history.',
    ),
  ], {
    callout:
      'Install quality is proven at handover gauges and photos, not promised during sales. Close-out meetings lock that proof in building records.',
  }),
];

export const PRICING_DEPTH_B: Section[] = [
  section('Unit-rate transparency for associations versus flat owners', [
    p(
      'Associations prefer rate tables per bay drawing; flat owners prefer lump sums per home.',
      'Both can be fair when underlying assumptions are identical — grade, spacing, substrate class, and access method written once and referenced everywhere.',
      'Pricing disputes on towers often trace to mixing association rate tables with owner quotes that silently assumed different substrate classes on corner units.',
    ),
  ]),
  section('Cost of delay: idle crew, lift no-shows, and remobilisation', [
    p(
      'Lift no-shows and society gate delays bill idle crew time on some contracts — understand idle clauses before signing tight festival timelines.',
      'Remobilisation after a paused monsoon week may exceed incremental material cost on small flats; pricing should show remobilisation lines explicitly on tower jobs.',
    ),
  ]),
  section('Photography, as-built, and documentation fees', [
    p(
      'Documentation labour is real: bay photos, gauge logs, and digital packs take technician time after physical install completes.',
      'Some vendors include documentation; others price it separately — compare inclusively so cheap install quotes do not omit the pack you need for warranty.',
    ),
  ]),
  section('Variant premiums: corner, duplex, and non-standard angles', [
    p(
      'Corner and duplex variants should carry named premiums on rate cards instead of surprise surcharges at survey.',
      'Non-standard angles increase waste in cable cut lists and powder-coat touch-up time — pricing honesty here prevents committee distrust mid-project.',
    ),
  ]),
  section('Seasonal demand and scheduling priority', [
    p(
      'Pre-monsoon and pre-school-year peaks may affect scheduling priority rather than unit material cost — clarify whether peak surcharges exist or only longer lead times.',
      'Paying for priority scheduling is valid when risk is time-bound; hiding it inside inflated material rates is not.',
    ),
  ]),
  section('Comparing quotes with different implied lifetimes', [
    p(
      'A quote with 316 hardware and modular nets implies different five-year cost than 304 with monolithic terrace panels — spreadsheet lifetimes, not only day-one totals.',
      'Maintenance visit inclusion changes lifetime cost more than small differences in headline install totals.',
    ),
  ]),
  section('Owner versus association payment flows and retention', [
    p(
      'Retention held by associations until punch-list closure protects collective interests; flat-owner direct contracts should mimic retention on handover milestones instead of paying 100% on first visit.',
      'Pricing documents should map who holds retention and for how long so vendors price cash-flow realistically without inflating material to compensate.',
    ),
  ]),
  section('Scope gaps: painting touch-up, tile repair, and civil make-good', [
    p(
      'Drilling disturbs paint and tile edges — quotes should state whether make-good includes matching paint supply or only basic patching.',
      'Scope gaps here generate “hidden cost” feelings even when safety hardware price was fair.',
    ),
  ]),
  section('Multi-vendor towers: pricing coordination on shared scaffold', [
    p(
      'When facade, HVAC, and grill vendors share scaffold, grill pricing may include shared day charges or exclude them assuming society scaffold — mismatches inflate totals if not aligned.',
      'Committee buyers should publish a shared access calendar so vendors price the same number of mobilisations.',
    ),
  ]),
  section('Price reasonableness without published rate cards', [
    p(
      'Reasonableness comes from specified grade and spacing, measured openings, and itemised access — not from anonymous forum averages that omit height and substrate.',
      'Use this guide’s factor list to normalise quotes before calling any vendor expensive or cheap.',
    ),
  ], {
    bullets: [
      'Itemise access, civil prep, and documentation',
      'Model five-year life, not install day only',
      'Match retention rules to payment schedules',
      'Align variant premiums across tower drawings',
    ],
  }),
];

export const MAINTENANCE_DEPTH_B: Section[] = [
  section('Creating a balcony safety logbook for your household', [
    p(
      'A household logbook tracks monthly visual checks, professional visit dates, and storm events with photos — warranty teams resolve tickets faster when logs exist.',
      'One page per bay is enough: date, finding, action taken, and whether a professional visit is booked.',
      'Children and pet changes should be noted because spacing adequacy can change when behaviour changes even if hardware does not.',
    ),
  ]),
  section('Professional re-tension visits: what should happen on site', [
    p(
      'Technicians should re-gauge spacing after re-tension, inspect anchors for new cracks, and note which turnbuckles moved versus which were seized.',
      'Owners receive an updated handover addendum with date and baseline changes — verbal “all good” without records weakens future claims.',
    ),
  ]),
  section('Polymer net UV chalking versus structural failure', [
    p(
      'Chalking and colour fade precede structural failure on many polymers — schedule replacement at chalking thresholds defined with your installer rather than waiting for a visible hole.',
      'Terrace nets chalk faster than duct nets; maintenance calendars should differ by face exposure.',
    ),
  ]),
  section('Cable kinks from impact: footballs, workers, and moving furniture', [
    p(
      'Sharp kinks from impact reduce effective strand life even when tension looks normal.',
      'After impacts, photograph the kink zone and schedule inspection — DIY straightening is not appropriate on tensioned systems.',
    ),
  ]),
  section('Anchor sealant maintenance without disassembly', [
    p(
      'Periodic visual checks on cap seals and parapet tops catch cracks before water reaches embeds.',
      'Re-seal protocols should use compatible sealants — random silicone over epoxy caps creates adhesion failures.',
    ),
  ]),
  section('Facility manager KPIs for grill and net estates', [
    p(
      'Useful KPIs include open tickets by wing, mean time to re-tension after storm, repeat rust streak locations, and percentage of flats with current handover packs on file.',
      'KPIs turn maintenance from reactive neighbour complaints into scheduled programmes committees can budget.',
    ),
  ]),
  section('Tenant turnover inspections in rental towers', [
    p(
      'Inspect barriers at tenant move-in and move-out to document unauthorized drilling, removed panels, or furniture-induced climb paths.',
      'Deposit clauses tied to specification restoration reduce ad hoc damage that owners discover years later.',
    ),
  ]),
  section('Coordination with facade cleaners and pressure washers', [
    p(
      'Pressure washers directed at anchors strip coatings and drive water into holes — instruct facade vendors on stand-off distances and forbidden zones.',
      'Maintenance includes briefing cleaning crews annually, not only inspecting hardware yourself.',
    ),
  ]),
  section('End-of-life planning for frames and nets on aged towers', [
    p(
      'Twenty-year towers may need replacement when substrate cycles exceed hardware life — plan funding before systemic anchor failures cluster.',
      'End-of-life surveys differ from re-tension visits; price them as assessment work, not free sales calls.',
    ),
  ]),
  section('Integrating maintenance with cloth hanger and sports add-ons', [
    p(
      'Combined estates need separate checklists for hanger embeds, sports poles, and fall barriers — one quick walk can miss a loose pole foot while cables look fine.',
      'Schedule sports perimeter checks before seasonal leagues, not after first net tear.',
    ),
  ], {
    callout:
      'Treat maintenance spend as part of ownership cost, comparable to servicing lifts — deferral shows up as emergency visits and neighbour incidents.',
  }),
];

export const FAQ_DEPTH_B: Section[] = [
  section('Grill vibrates only at night — should I worry?', [
    p(
      'Night gusts often exceed daytime calm surveys remembered during buying.',
      'Intermittent vibration warrants a tension balance check — persistent contact with loose trim can work-harden strands over seasons.',
      'Send a short night video with wind audible if possible so technicians reproduce conditions.',
    ),
  ]),
  section('New gap appeared after diwali decoration removal', [
    p(
      'Temporary decoration hooks and tape removals sometimes bend lower rails or loosen end caps.',
      'Measure new gap height at the lowest reachable point and compare to handover gauge notes if they exist.',
      'Do not assume decorations were harmless if climb paths reopened.',
    ),
  ]),
  section('Is slight rust on one screw head an emergency?', [
    p(
      'Single screw surface rust may be cosmetic on isolated non-critical trim screws, but identical rust on anchor screws is different.',
      'Photograph the screw location on the frame map and schedule inspection — mixing trim and anchor rust in DIY judgment causes errors.',
    ),
  ]),
  section('Can housekeeping staff hose down grills daily?', [
    p(
      'Daily hosing without drying can concentrate chlorides if municipal water is hard or if cleaning chemicals are mixed in.',
      'Rinse cycles are fine on many inland installs; coastal installs need gentler cycles and attention to fastener families.',
      'Train staff to avoid aiming jets directly into turnbuckle threads.',
    ),
  ]),
  section('Net colour changed after one summer — is it failing?', [
    p(
      'Colour shift from UV is common before structural failure — compare chalking and brittleness at twine knots.',
      'Plan replacement on exposure schedules when colour shift is uniform on terrace faces.',
    ),
  ]),
  section('Installer offered to tighten for free after one year — accept?', [
    p(
      'Free visits are welcome if they include spacing gauges and anchor checks, not only a quarter-turn on one buckle.',
      'Ask for a written visit note added to your handover pack so the warranty file shows professional confirmation.',
    ),
  ]),
  section('Two vendors gave different spacing advice — who is right?', [
    p(
      'Spacing should follow written safety goal and gauge checks, not opinion.',
      'Third-party measurement with go/no-go gauges beats arguments — use the buying guide’s hazard priority when goals differ.',
    ),
  ]),
  section('Can I add hooks later to the same frame?', [
    p(
      'Unapproved hooks can bend rails and void warranty — ask manufacturer before drilling new holes in supplied frames.',
      'Dedicated hanger systems designed with the survey are safer than after-market hooks on tensioned members.',
    ),
  ]),
  section('Glass cleaner sprayed on cables — problem?', [
    p(
      'Chemical cleaners may leave residues that attract moisture — rinse cables if cleaners were oversprayed during window work.',
      'Long-term chemical abuse can appear in warranty exclusions — note product names if spills were heavy.',
    ),
  ]),
  section('Lift shutdown delayed install — who pays remobilisation?', [
    p(
      'Contract remobilisation clauses govern lift delays outside vendor control — read idle and remobilisation lines before disputing invoices.',
      'Societies sometimes absorb remobilisation on tower projects to keep vendors cooperative on warranty visits.',
    ),
  ]),
  section('Façade LED lights installed near anchors — concern?', [
    p(
      'Heat from LEDs is usually low, but drilling for light brackets near fresh anchors can disturb embeds — inspect anchors after adjacent trades finish.',
      'Coordinate trade sequence on renovated balconies to avoid silent damage.',
    ),
  ]),
  section('How to talk to committee when only your flat has a problem', [
    p(
      'Bring photos, handover specs, and professional visit notes showing whether issue is flat-local or systemic batch defect.',
      'Systemic patterns justify bulk callbacks; local substrate issues may be owner civil scope — documentation clarifies fairly.',
    ),
  ]),
  section('Should I cover grills with tarp during interior painting?', [
    p(
      'Breathable covers protect from paint overspray; plastic tarps trapping heat and moisture against stainless can accelerate staining.',
      'Remove covers after painting cures and inspect for overspray in turnbuckle threads.',
    ),
  ]),
  section('Baby visiting for a week — temporary measures?', [
    p(
      'Temporary furniture moves and supervised use beat rushed spacing changes for short visits when existing spacing meets gauge targets.',
      'If gauges fail, schedule professional securing before visit — do not rely on chairs blocking openings unsupervised.',
    ),
  ]),
  section('WhatsApp voice notes versus written tickets for support', [
    p(
      'Voice notes help urgency; written tickets with photos preserve detail for warranty teams.',
      'Send both when possible: voice for timing, email for bay ID and images.',
    ),
  ], {
    callout:
      'When symptoms affect children, pets, or open gaps after storms, escalate to a visit rather than collecting opinions in chat groups.',
  }),
];
