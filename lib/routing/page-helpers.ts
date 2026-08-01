import type { Metadata } from 'next';
import { loadPage } from '@/lib/routing/page-bundle';
import { buildMetadata } from '@/lib/seo/metadata';

/**
 * Metadata for a generated page, resolved from its path.
 *
 * Every dynamic route calls this, so canonical URLs and robots directives are
 * derived identically everywhere. Inventory pages are indexable; only
 * structurally broken resolutions are marked `noindex, follow`.
 */
export function metadataForPath(path: string): Metadata {
  const bundle = loadPage(path);

  if (!bundle) {
    // The route will call notFound(); tell crawlers not to index the 404.
    return { title: 'Page not found', robots: { index: false, follow: false } };
  }

  return buildMetadata({
    title: bundle.copy.title,
    description: bundle.copy.description,
    path: bundle.target.path,
    indexable: bundle.decision.indexable,
    image: bundle.primaryImage,
  });
}
