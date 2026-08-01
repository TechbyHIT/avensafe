import type { Metadata } from 'next';
import { business } from '@/config/business';
import { STATIC_ROUTES } from '@/config/routes';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/layout/JsonLd';
import { CtaSection } from '@/components/sections/CtaSection';
import { Hero } from '@/components/sections/Hero';
import { EditorialIndexList } from '@/components/templates/EditorialPage';
import { Section } from '@/components/ui/Section';
import { getGuides, getImageById } from '@/lib/data/repository';
import { guidePath } from '@/lib/routing/url';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema/builders';
import { buildGraph } from '@/lib/schema/graph';
import { buildMetadata } from '@/lib/seo/metadata';

export const revalidate = 43200; // REVALIDATE.editorial

const TITLE = `Guides | ${business.shortName}`;
const DESCRIPTION =
  'Practical guides to pricing, materials, installation and safety for invisible grills, safety nets and drying systems. Written to be useful whether or not you buy from us.';

const CRUMBS = [
  { label: 'Home', href: STATIC_ROUTES.home },
  { label: 'Guides', href: STATIC_ROUTES.guides },
];

export function generateMetadata(): Metadata {
  return buildMetadata({ title: TITLE, description: DESCRIPTION, path: STATIC_ROUTES.guides });
}

export default function GuidesIndexPage() {
  const guides = getGuides();
  const cornerstone = guides.filter((guide) => guide.cornerstone);
  const others = guides.filter((guide) => !guide.cornerstone);

  const toEntry = (guide: (typeof guides)[number]) => ({
    id: guide.id,
    href: guidePath(guide),
    heading: guide.heading,
    excerpt: guide.excerpt,
    meta: `${guide.readingMinutes} min read`,
    image: guide.imageId ? getImageById(guide.imageId) : undefined,
  });

  return (
    <>
      <JsonLd
        graph={buildGraph([
          webPageSchema({ name: TITLE, description: DESCRIPTION, path: STATIC_ROUTES.guides }),
          breadcrumbSchema(CRUMBS, STATIC_ROUTES.guides),
        ])}
      />
      <Breadcrumbs crumbs={CRUMBS} />

      <Hero
        eyebrow="Guides"
        heading="What to know before you commission safety work"
        lede="These are the questions we get asked most, answered properly rather than in a paragraph. If you read only one, read the pricing guide: it explains why quotations for the same balcony can differ by a factor of two."
      />

      <Section heading="Start here">
        <EditorialIndexList entries={cornerstone.map(toEntry)} />
      </Section>

      {others.length > 0 ? (
        <Section tone="muted" heading="More guides">
          <EditorialIndexList entries={others.map(toEntry)} />
        </Section>
      ) : null}

      <CtaSection />
    </>
  );
}
