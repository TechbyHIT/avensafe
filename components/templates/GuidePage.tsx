import type { Metadata } from 'next';
import { EditorialPage } from '@/components/templates/EditorialPage';
import { guidePageProps, requireGuide } from '@/lib/content/editorial';
import { buildMetadata } from '@/lib/seo/metadata';

/**
 * Wrapper so the four cornerstone guide routes are one line each.
 *
 * Those guides are published at the site root for SEO reasons but are ordinary
 * records in `guides.json`, and `/guides/[slug]` refuses their slugs, so each is
 * reachable at exactly one URL.
 */
export function GuidePage({ slug }: { readonly slug: string }) {
  return <EditorialPage {...guidePageProps(requireGuide(slug))} />;
}

export function guideMetadata(slug: string): Metadata {
  const guide = requireGuide(slug);
  const props = guidePageProps(guide);

  return buildMetadata({
    title: guide.title,
    description: guide.description,
    path: props.path,
    image: props.image,
    type: 'article',
    publishedTime: guide.publishedAt,
    modifiedTime: guide.updatedAt,
    authors: [guide.author],
  });
}
