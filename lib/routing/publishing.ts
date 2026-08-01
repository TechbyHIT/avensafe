import { CONTENT_THRESHOLDS } from '@/config/constants';
import type { PageContent } from '@/types/content';
import type { PageTarget } from '@/types/routing';

/**
 * The publishing gate.
 *
 * Inventory URLs listed in the sitemap are indexable by default. We only block
 * indexing when the route is structurally broken (missing service / location /
 * intent). Content depth thresholds are recorded as soft notes for reports —
 * they do not flip a sitemap URL to `noindex`.
 */

export interface PublishingDecision {
  readonly indexable: boolean;
  /** Why the page failed hard checks, or soft content notes for reports. */
  readonly reasons: readonly string[];
  /** Soft content shortfalls — never used alone to set noindex. */
  readonly softReasons: readonly string[];
  readonly wordCount: number;
  readonly specificityRatio: number;
}

function thresholdsFor(target: PageTarget): {
  readonly minWords: number;
  readonly minModules: number;
  readonly minFaqs: number;
} {
  switch (target.kind) {
    case 'serviceInArea':
      return {
        minWords: CONTENT_THRESHOLDS.minWordsServiceInArea,
        minModules: CONTENT_THRESHOLDS.minModulesServiceInArea,
        minFaqs: CONTENT_THRESHOLDS.minFaqsServiceLocation,
      };
    case 'serviceInCity':
      return {
        minWords: CONTENT_THRESHOLDS.minWordsServiceInCity,
        minModules: CONTENT_THRESHOLDS.minModulesServiceInCity,
        minFaqs: CONTENT_THRESHOLDS.minFaqsServiceLocation,
      };
    case 'city':
      return {
        minWords: CONTENT_THRESHOLDS.minWordsCity,
        minModules: CONTENT_THRESHOLDS.minModulesCity,
        minFaqs: CONTENT_THRESHOLDS.minFaqs,
      };
    case 'district':
      return {
        minWords: CONTENT_THRESHOLDS.minWordsDistrict,
        minModules: CONTENT_THRESHOLDS.minModulesDistrict,
        minFaqs: CONTENT_THRESHOLDS.minFaqs,
      };
    case 'serviceInDistrict':
      return {
        minWords: CONTENT_THRESHOLDS.minWordsServiceInDistrict,
        minModules: CONTENT_THRESHOLDS.minModulesServiceInDistrict,
        minFaqs: CONTENT_THRESHOLDS.minFaqsServiceLocation,
      };
    case 'serviceIntent':
      return {
        minWords: CONTENT_THRESHOLDS.minWordsServiceIntent,
        minModules: CONTENT_THRESHOLDS.minModulesServiceIntent,
        minFaqs: CONTENT_THRESHOLDS.minFaqsServiceLocation,
      };
    case 'state':
      return {
        minWords: CONTENT_THRESHOLDS.minWordsState,
        minModules: CONTENT_THRESHOLDS.minModulesState,
        minFaqs: CONTENT_THRESHOLDS.minFaqs,
      };
    default:
      return {
        minWords: CONTENT_THRESHOLDS.minWords,
        minModules: CONTENT_THRESHOLDS.minModules,
        minFaqs: CONTENT_THRESHOLDS.minFaqs,
      };
  }
}

export function evaluatePublishing(
  target: PageTarget,
  content: PageContent,
): PublishingDecision {
  const hardReasons: string[] = [];
  const softReasons: string[] = [];
  const thresholds = thresholdsFor(target);

  const specificityRatio =
    content.wordCount === 0 ? 0 : content.specificWordCount / content.wordCount;

  if (content.wordCount < thresholds.minWords) {
    softReasons.push(
      `only ${content.wordCount} words of body content, below the advisory minimum of ${thresholds.minWords}`,
    );
  }

  if (content.modules.length < thresholds.minModules) {
    softReasons.push(
      `only ${content.modules.length} content modules, below the advisory minimum of ${thresholds.minModules}`,
    );
  }

  if (content.faqs.length < thresholds.minFaqs) {
    softReasons.push(
      `only ${content.faqs.length} FAQs, below the advisory minimum of ${thresholds.minFaqs}`,
    );
  }

  if (specificityRatio < CONTENT_THRESHOLDS.minSpecificityRatio) {
    softReasons.push(
      `only ${(specificityRatio * 100).toFixed(0)}% of the content is specific to this page, below the advisory minimum of ${(
        CONTENT_THRESHOLDS.minSpecificityRatio * 100
      ).toFixed(0)}%`,
    );
  }

  // Structural faults only — these pages must not be indexed.
  if (
    target.kind !== 'service' &&
    target.kind !== 'serviceIntent' &&
    !target.location
  ) {
    hardReasons.push('location page resolved without a location');
  }

  if (
    (target.kind === 'service' || target.kind === 'serviceIntent') &&
    !target.service
  ) {
    hardReasons.push('service page resolved without a service');
  }

  if (target.kind === 'serviceIntent' && !target.intent) {
    hardReasons.push('service intent page resolved without an intent');
  }

  return {
    indexable: hardReasons.length === 0,
    reasons: hardReasons,
    softReasons,
    wordCount: content.wordCount,
    specificityRatio,
  };
}
