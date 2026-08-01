import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EditorialPage } from '@/components/templates/EditorialPage';
import { blogPageProps } from '@/lib/content/editorial';
import { getBlogPostBySlug, getBlogPosts } from '@/lib/data/repository';
import { buildMetadata } from '@/lib/seo/metadata';

export const revalidate = 43200; // REVALIDATE.editorial

interface RouteParams {
  readonly params: Promise<{ readonly slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: 'Post not found', robots: { index: false, follow: false } };

  const props = blogPageProps(post);
  return buildMetadata({
    title: post.title,
    description: post.description,
    path: props.path,
    image: props.image,
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    authors: [post.author],
  });
}

export default async function BlogPostPage({ params }: RouteParams) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  return <EditorialPage {...blogPageProps(post)} />;
}
