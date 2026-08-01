import { STATIC_ROUTES } from '@/config/routes';
import {
  getFaqsByIds,
  getGuideBySlug,
  getImageById,
  getServicesByIds,
} from '@/lib/data/repository';
import type { BlogPost, Guide } from '@/lib/data/schemas';
import { blogPath, guidePath } from '@/lib/routing/url';
import type { Crumb } from '@/types/routing';
import type { EditorialPageProps } from '@/components/templates/EditorialPage';

/**
 * Assembles the props an editorial page needs from a guide or post record.
 *
 * The four cornerstone guide routes and `/guides/[slug]` all call this, so a
 * guide rendered at the site root and one rendered under `/guides/` are
 * identical apart from the URL.
 */

export function guidePageProps(guide: Guide): EditorialPageProps {
  const path = guidePath(guide);

  const crumbs: Crumb[] = [
    { label: 'Home', href: STATIC_ROUTES.home },
    { label: 'Guides', href: STATIC_ROUTES.guides },
    { label: guide.title, href: path },
  ];

  return {
    entry: guide,
    path,
    crumbs,
    image: guide.imageId ? getImageById(guide.imageId) : undefined,
    faqs: getFaqsByIds(guide.faqIds),
    relatedServices: getServicesByIds(guide.serviceIds),
    articleType: 'Article',
    eyebrow: guide.cornerstone ? 'Cornerstone guide' : 'Guide',
  };
}

export function blogPageProps(post: BlogPost): EditorialPageProps {
  const path = blogPath(post);

  const crumbs: Crumb[] = [
    { label: 'Home', href: STATIC_ROUTES.home },
    { label: 'Blog', href: STATIC_ROUTES.blog },
    { label: post.title, href: path },
  ];

  return {
    entry: post,
    path,
    crumbs,
    image: post.imageId ? getImageById(post.imageId) : undefined,
    faqs: getFaqsByIds(post.faqIds),
    relatedServices: getServicesByIds(post.serviceIds),
    articleType: 'BlogPosting',
    eyebrow: post.category,
  };
}

/**
 * Looks up a cornerstone guide by slug and throws if the data is missing, since
 * a root-level guide route with no backing record is a build-time error rather
 * than a 404.
 */
export function requireGuide(slug: string): Guide {
  const guide = getGuideBySlug(slug);
  if (!guide) {
    throw new Error(
      `Guide "${slug}" is missing from data/guides.json but has a dedicated route.`,
    );
  }
  return guide;
}
