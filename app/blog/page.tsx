import type { Metadata } from 'next';
import { business } from '@/config/business';
import { STATIC_ROUTES } from '@/config/routes';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/layout/JsonLd';
import { CtaSection } from '@/components/sections/CtaSection';
import { Hero } from '@/components/sections/Hero';
import { EditorialIndexList } from '@/components/templates/EditorialPage';
import { Section } from '@/components/ui/Section';
import { getBlogPosts, getImageById } from '@/lib/data/repository';
import { blogPath } from '@/lib/routing/url';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema/builders';
import { buildGraph } from '@/lib/schema/graph';
import { buildMetadata } from '@/lib/seo/metadata';

export const revalidate = 43200; // REVALIDATE.editorial

const TITLE = `Blog | ${business.shortName}`;
const DESCRIPTION =
  'Field notes on balcony safety, invisible grills, bird control, monsoon care and what actually causes installations to fail early.';

const CRUMBS = [
  { label: 'Home', href: STATIC_ROUTES.home },
  { label: 'Blog', href: STATIC_ROUTES.blog },
];

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: STATIC_ROUTES.blog,
    image: getImageById('img-hero-home'),
  });
}

export default function BlogIndexPage() {
  const posts = [...getBlogPosts()].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const heroImage =
    getImageById('img-hero-home') ??
    (posts[0]?.imageId ? getImageById(posts[0].imageId) : undefined);

  return (
    <>
      <JsonLd
        graph={buildGraph([
          webPageSchema({
            name: TITLE,
            description: DESCRIPTION,
            path: STATIC_ROUTES.blog,
            primaryImage: heroImage,
          }),
          breadcrumbSchema(CRUMBS, STATIC_ROUTES.blog),
        ])}
      />
      <Breadcrumbs crumbs={CRUMBS} />

      <Hero
        eyebrow="Blog"
        heading="Notes from the field"
        lede="Shorter pieces on balcony safety, materials, bird control and the failures we keep being called out to inspect — each with real installation photography."
        image={heroImage}
        variant="split"
      />

      <Section
        heading="Latest posts"
        lede={`${posts.length} articles with practical checks you can use before you compare quotes.`}
        width="wide"
        tone="muted"
      >
        <EditorialIndexList
          entries={posts.map((post) => ({
            id: post.id,
            href: blogPath(post),
            heading: post.heading,
            excerpt: post.excerpt,
            meta: `${post.category} · ${post.readingMinutes} min read`,
            image: post.imageId ? getImageById(post.imageId) : undefined,
          }))}
        />
      </Section>

      <CtaSection enquiryContext="Blog enquiry" />
    </>
  );
}
