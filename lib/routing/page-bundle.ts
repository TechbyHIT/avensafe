import { cache } from 'react';
import { buildPageContent } from '@/lib/content/engine';
import {
  getHomeGalleryImages,
  getImageById,
  getImagesByIds,
  getImagesForService,
} from '@/lib/data/repository';
import type { ImageRecord } from '@/lib/data/schemas';
import { pickVariant } from '@/lib/utils/hash';
import { buildExploreHub } from '@/lib/links/explore-hub';
import {
  buildCrumbs,
  resolveCityPage,
  resolveDistrictPage,
  resolveFourthSegment,
  resolveServiceInAreaIntentPage,
  resolveServiceInDistrictPage,
  resolveServiceIntentPage,
  resolveServicePage,
  resolveStatePage,
  resolveThirdSegment,
} from '@/lib/routing/resolve';
import { evaluatePublishing, type PublishingDecision } from '@/lib/routing/publishing';
import { buildPageCopy, type PageCopy } from '@/lib/seo/copy';
import type { PageContent } from '@/types/content';
import type { Crumb, LinkGroup, PageTarget } from '@/types/routing';

/**
 * Resolves a URL path into everything a page needs, once.
 *
 * `generateMetadata` and the page component both run for every request, and both
 * need the resolved target, its copy and its publishing decision. Keying this on
 * the path string (a primitive) lets React's `cache` dedupe the work, so content
 * is composed a single time per request rather than twice.
 */

export interface PageBundle {
  readonly target: PageTarget;
  readonly copy: PageCopy;
  readonly content: PageContent;
  readonly decision: PublishingDecision;
  readonly crumbs: readonly Crumb[];
  readonly linkGroups: readonly LinkGroup[];
  readonly primaryImage: ImageRecord | undefined;
}

function resolveByPath(path: string): PageTarget | null {
  const segments = path.split('/').filter((segment) => segment.length > 0);

  if (segments[0] === 'services' && segments[1]) {
    if (segments.length === 2) return resolveServicePage(segments[1]);
    if (segments.length === 3 && segments[2]) {
      return resolveServiceIntentPage(segments[1], segments[2]);
    }
  }

  const [first, second, third, fourth] = segments;

  if (first && second === 'district') {
    if (segments.length === 3 && third) return resolveDistrictPage(first, third);
    if (segments.length === 4 && third && fourth) {
      return resolveServiceInDistrictPage(first, third, fourth);
    }
    return null;
  }

  if (segments.length === 1 && first) return resolveStatePage(first);
  if (segments.length === 2 && first && second) return resolveCityPage(first, second);
  if (segments.length === 3 && first && second && third) {
    return resolveThirdSegment(first, second, third);
  }
  if (segments.length === 4 && first && second && third && fourth) {
    return resolveFourthSegment(first, second, third, fourth);
  }
  const fifth = segments[4];
  if (segments.length === 5 && first && second && third && fourth && fifth) {
    return resolveServiceInAreaIntentPage(first, second, third, fourth, fifth);
  }

  return null;
}

function primaryImageFor(target: PageTarget): ImageRecord | undefined {
  if (target.service) {
    const fromIds = getImagesByIds(target.service.imageIds);
    const pool =
      fromIds.length > 0 ? fromIds : getImagesForService(target.service.id, 12);
    if (pool.length > 0) {
      return pickVariant(`${target.path}:hero-image`, pool);
    }
  }

  // Area / society / city hubs: rotate portfolio so pages are not image-blank.
  const gallery = getHomeGalleryImages(16);
  if (gallery.length > 0) {
    return pickVariant(`${target.path}:hero-image`, gallery);
  }
  return getImageById('img-hero-home');
}

export const loadPage = cache((path: string): PageBundle | null => {
  const target = resolveByPath(path);
  if (!target) return null;

  const copy = buildPageCopy(target);
  const content = buildPageContent(target);
  const decision = evaluatePublishing(target, content);

  return {
    target,
    copy,
    content,
    decision,
    crumbs: buildCrumbs(target),
    linkGroups: buildExploreHub(target),
    primaryImage: primaryImageFor(target),
  };
});

/** Builds the canonical path for a set of route segments. */
export function pathFromSegments(segments: readonly string[]): string {
  return `/${segments.filter((segment) => segment.length > 0).join('/')}`;
}
