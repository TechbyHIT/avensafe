import { CONTENT_THRESHOLDS } from '@/config/constants';
import type { PageContent } from '@/types/content';
import type { PageTarget } from '@/types/routing';

/**
 * The publishing gate.
 *
 * This is what stops a large programmatic site becoming a large thin site. A
 * URL resolves and renders whether or not it passes; what changes is whether it
 * is marked indexable and whether it appears in a sitemap. Pages that fail are
 * served with `noindex, follow`, so a visitor who follows a link still gets a
 * useful page and crawlers are not invited to index it.
 */

export interface PublishingDecision {
  readonly indexable: boolean;
  /** Why the page failed, in a form suitable for the validation report. */
  readonly reasons: readonly string[];
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
  const reasons: string[] = [];
  const thresholds = thresholdsFor(target);

  const specificityRatio =
    content.wordCount === 0 ? 0 : content.specificWordCount / content.wordCount;

  if (content.wordCount < thresholds.minWords) {
    reasons.push(
      `only ${content.wordCount} words of body content, below the minimum of ${thresholds.minWords}`,
    );
  }

  if (content.modules.length < thresholds.minModules) {
    reasons.push(
      `only ${content.modules.length} content modules, below the minimum of ${thresholds.minModules}`,
    );
  }

  if (content.faqs.length < thresholds.minFaqs) {
    reasons.push(
      `only ${content.faqs.length} FAQs, below the minimum of ${thresholds.minFaqs}`,
    );
  }

  if (specificityRatio < CONTENT_THRESHOLDS.minSpecificityRatio) {
    reasons.push(
      `only ${(specificityRatio * 100).toFixed(0)}% of the content is specific to this page, below the minimum of ${(
        CONTENT_THRESHOLDS.minSpecificityRatio * 100
      ).toFixed(0)}%`,
    );
  }

  // A location page with no resolved place, or a service page with no service,
  // indicates a routing fault rather than a content shortfall.
  // National hubs (`service`, `serviceIntent`) are intentionally location-free.
  if (
    target.kind !== 'service' &&
    target.kind !== 'serviceIntent' &&
    !target.location
  ) {
    reasons.push('location page resolved without a location');
  }

  if (
    (target.kind === 'service' || target.kind === 'serviceIntent') &&
    !target.service
  ) {
    reasons.push('service page resolved without a service');
  }

  if (target.kind === 'serviceIntent' && !target.intent) {
    reasons.push('service intent page resolved without an intent');
  }

  return {
    indexable: reasons.length === 0,
    reasons,
    wordCount: content.wordCount,
    specificityRatio,
  };
}
