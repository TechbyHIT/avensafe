import { p, section, type Section } from './expand-guides-depth-types';

export const BUYING_DEPTH_O: Section[] = [
  section('Nine-thousand-eight-hundred-word gate: template attached to survey request', [
    p(
      'You cross the high-nine-thousand-word gate when survey requests attach the completed bay template — not when you finish reading another section.',
      'Vendors who refuse to reference template rows on reply should not receive deposit until they do or until you choose a vendor who will.',
    ),
  ]),
];

export const PRICING_DEPTH_O: Section[] = [
  section('Five-thousand-word pricing gate: defend one quote aloud in sixty seconds', [
    p(
      'If you cannot defend one chosen quote aloud in sixty seconds using grade, spacing, access, and exclusions without mentioning brand adjectives, pricing depth is not yet operational — open spreadsheet, not another PDF.',
      'Crossing five thousand words means that sixty-second defense is easy — practice it before committee or family payment arguments.',
    ),
  ]),
];

export const MAINTENANCE_DEPTH_O: Section[] = [
  section('Post-renovation remeasure triggers for maintenance baselines', [
    p(
      'Renovation that moves sills, drops ceilings, or changes balcony doors invalidates old gauge baselines — schedule professional remeasure before trusting pre-renovation handover for child fall decisions.',
      'Maintenance logs should note renovation date and new baseline report ID so warranty teams do not compare post-renovation slack to pre-renovation gauge photos unfairly.',
      'Facility towers should flag renovated flats on wing maps so batched visits include remeasure on changed units instead of spot-checking only legacy flats.',
    ),
  ]),
  section('Five-thousand-word maintenance gate: wing map or flat log both count', [
    p(
      'Estates cross five thousand words when wing maps show last professional pass date per bay type; flats cross when bay ID logs show same — scale differs, habit identical.',
      'Missing both map and log means maintenance depth remains reading exercise — create one today with photos dated this week.',
    ),
  ], {
    callout:
      'Renovation without baseline update is the silent way maintenance records become misleading.',
  }),
];

export const FAQ_DEPTH_O: Section[] = [
  section('FAQ: technician said “within tolerance” — ask for written gauge notes', [
    p(
      'Verbal tolerance claims without written gauge notes are not useful for warranty files or committee meetings — polite request for addendum to handover pack same visit.',
      'If tolerance exceeded child-safety goal on template, tolerance language does not override your written hazard priority — escalate specification review, not vocabulary debate.',
    ),
  ]),
  section('Five-thousand-word FAQ gate: last three tickets used same template', [
    p(
      'FAQ depth crosses five thousand words when your last three support interactions reused the structured template — if not, delete draft shortcuts and pin template at top of email client.',
      'Template reuse trains vendors to respond with bay-specific answers faster — everyone saves time except myth forums.',
    ),
  ], {
    bullets: [
      'Ask for written gauge addendum same visit',
      'Template hazard beats verbal tolerance slogans',
      'Reuse template on next three tickets',
    ],
  }),
];
