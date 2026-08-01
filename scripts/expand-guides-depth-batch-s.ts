import { p, section, type Section } from './expand-guides-depth-types';

export const MAINTENANCE_DEPTH_S: Section[] = [
  section('One-line monthly reminder for fall-critical bays', [
    p(
      'If this month lacks a log line for each fall-critical bay, add one today — two minutes of notes beat another season of assumed safety.',
    ),
  ]),
];

export const FAQ_DEPTH_S: Section[] = [
  section('One-line reminder before sending support email', [
    p(
      'If the template block is not pasted, do not send yet — incomplete tickets get incomplete answers and slower visits.',
    ),
  ]),
];
