import { p, section, type Section } from './expand-guides-depth-types';

export const BUYING_DEPTH_N: Section[] = [
  section('Pre-deposit checklist in one paragraph you can screenshot', [
    p(
      'Before deposit: every bay row filled; grade and spacing written; access and exclusions explicit; association path known; sample or survey date named; warranty duties realistic; red-flag vendor patterns rejected; decision owner signed; digital handover standard agreed.',
      'Screenshot this checklist into the group chat that approves money — ten-thousand-word guides compress to these lines at payment time.',
      'If any line is blank, you are not ready for deposit regardless of discount deadline pressure.',
    ),
  ]),
];

export const INSTALL_DEPTH_N: Section[] = [
  section('Five-thousand-word install threshold: one missing gauge equals incomplete', [
    p(
      'Install depth crosses five thousand words when your flat file has gauge notes at multiple heights per fall-critical bay — if any fall-critical bay lacks gauge notes, treat install as incomplete even when screws are flush and views look clean.',
    ),
  ]),
];

export const PRICING_DEPTH_N: Section[] = [
  section('Five-thousand-word pricing threshold: summed bays match declared total', [
    p(
      'Pricing depth crosses five thousand words when your spreadsheet sums bay lines to the declared total with grade and spacing unchanged — if you cannot sum it, you cannot defend it in committee or to your spouse.',
      'That summing habit matters more than any single factor name memorized from this guide.',
    ),
  ]),
];

export const MAINTENANCE_DEPTH_N: Section[] = [
  section('Seasonal furniture and planter moves after monsoon settles', [
    p(
      'Owners rearrange planters and furniture after first dry weeks — re-walk climb paths at child reach height whenever heavy furniture moves, because hardware unchanged plus new layout often reopens risk without any cable moving.',
      'Log furniture moves on bay ID notes so technicians understand new lean paths that gauges alone might not explain.',
      'Facility towers should remind residents in newsletter form — single flat habit scales to estate pattern when move-in season peaks.',
    ),
  ]),
  section('Maintenance five-thousand-word threshold: log dated this month', [
    p(
      'Maintenance depth crosses five thousand words when your log has a dated entry this month for each fall-critical bay — words without logs are unread maintenance; logs without words still beat silence.',
      'Professional reports belong beside owner logs — together they satisfy warranty duties and sane tower governance.',
      'Start now if hardware is years old: baseline survey plus first log entry closes the gap faster than another guide section.',
    ),
  ], {
    callout:
      'No log entry this month on fall-critical bays means maintenance depth is still theory — open the camera app.',
  }),
];

export const FAQ_DEPTH_N: Section[] = [
  section('FAQ: WhatsApp forwards about “mandatory spacing” without numbers', [
    p(
      'Forwarded messages rarely cite millimetre targets or product class — treat them as conversation starters, not specifications.',
      'Reply in your group with handover spacing lines or professional gauge date — facts beat forwards when committees panic after incidents.',
      'Support packages with bay ID beat forwarded chain messages when booking visits.',
    ),
  ]),
  section('FAQ five-thousand-word threshold: template sent last incident', [
    p(
      'FAQ depth crosses five thousand words when you actually sent the full support template on the last incident — if last incident was phone-only with no follow-up email, pin template and use it next time.',
      'Urgent securing still phones first; documentation email same day preserves warranty unity and technician context.',
    ),
  ], {
    bullets: [
      'Forwards are not specifications',
      'Counter forwards with handover numbers',
      'Phone urgent, email documented same day',
    ],
  }),
];
