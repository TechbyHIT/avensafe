import type { Faq } from '@/lib/data/schemas';

/** The renderable content module identifiers the engine can emit. */
export const MODULE_IDS = [
  'overview',
  'introduction',
  'localConditions',
  'benefits',
  'applications',
  'features',
  'materials',
  'installation',
  'access',
  'safety',
  'maintenance',
  'quality',
  'pricingFactors',
  'coverage',
  'localities',
  'intentFocus',
  'facetDetail',
  'neighbourhood',
  'enquiry',
  'programme',
  'localQuote',
  'landmarks',
  'cityProgramme',
  'audience',
  'whyChoose',
] as const;

export type ModuleId = (typeof MODULE_IDS)[number];

export type ContentBlock =
  | { readonly type: 'prose'; readonly paragraphs: readonly string[] }
  | { readonly type: 'list'; readonly items: readonly string[] }
  | {
      readonly type: 'definitions';
      readonly items: readonly { readonly title: string; readonly detail: string }[];
    }
  | {
      readonly type: 'steps';
      readonly items: readonly { readonly title: string; readonly detail: string }[];
    }
  | {
      readonly type: 'specs';
      readonly items: readonly {
        readonly name: string;
        readonly spec: string;
        readonly detail: string;
      }[];
    };

export interface ContentModule {
  readonly id: ModuleId;
  readonly heading: string;
  readonly blocks: readonly ContentBlock[];
  readonly callout?: string;
  /**
   * True when the module's text is derived from this specific service or
   * location rather than from shared boilerplate. The publishing gate uses this
   * to measure how much of a page is genuinely its own.
   */
  readonly specific: boolean;
}

export interface PageContent {
  readonly h1: string;
  /** Opening paragraph rendered directly beneath the H1. */
  readonly lede: string;
  readonly modules: readonly ContentModule[];
  readonly faqs: readonly Faq[];
  readonly wordCount: number;
  readonly specificWordCount: number;
  /** Hash of entity-derived copy for uniqueness audits. */
  readonly fingerprint: string;
}
