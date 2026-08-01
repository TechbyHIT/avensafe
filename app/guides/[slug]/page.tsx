import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EditorialPage } from '@/components/templates/EditorialPage';
import { guidePageProps } from '@/lib/content/editorial';
import { getGuideBySlug, getGuides } from '@/lib/data/repository';
import { isCornerstoneGuideSlug } from '@/lib/routing/url';
import { buildMetadata } from '@/lib/seo/metadata';

/**
 * Non-cornerstone guides.
 *
 * Cornerstone slugs are rejected here because those guides are published at the
 * site root. Without that check the same content would be reachable at two URLs
 * with two canonicals, which is the duplication this route exists to avoid.
 */
export const revalidate = 43200; // REVALIDATE.editorial

interface RouteParams {
  readonly params: Promise<{ readonly slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return getGuides()
    .filter((guide) => !guide.cornerstone)
    .map((guide) => ({ slug: guide.slug }));
}

function resolveGuide(slug: string) {
  if (isCornerstoneGuideSlug(slug)) return undefined;
  return getGuideBySlug(slug);
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const guide = resolveGuide(slug);
  if (!guide) return { title: 'Guide not found', robots: { index: false, follow: false } };

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

export default async function GuideDetailPage({ params }: RouteParams) {
  const { slug } = await params;
  const guide = resolveGuide(slug);
  if (!guide) notFound();

  return <EditorialPage {...guidePageProps(guide)} />;
}
