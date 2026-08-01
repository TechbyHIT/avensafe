import type { Metadata } from 'next';
import Link from 'next/link';
import { business } from '@/config/business';
import { STATIC_ROUTES } from '@/config/routes';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/layout/JsonLd';
import { CtaSection } from '@/components/sections/CtaSection';
import { GalleryGrid, type GalleryEntry } from '@/components/sections/GalleryGrid';
import { Hero } from '@/components/sections/Hero';
import { Section } from '@/components/ui/Section';
import { getGalleryItems, getImageById } from '@/lib/data/repository';
import { breadcrumbSchema, imageObjectSchema, webPageSchema } from '@/lib/schema/builders';
import { buildGraph } from '@/lib/schema/graph';
import { buildMetadata } from '@/lib/seo/metadata';

export const revalidate = 43200; // REVALIDATE.static

const TITLE = `Gallery | ${business.shortName}`;
const DESCRIPTION =
  'Installation photography showing cable spacing, terminations, net tensioning and anchorage detail across balconies, shafts, grounds and facades.';

const CRUMBS = [
  { label: 'Home', href: STATIC_ROUTES.home },
  { label: 'Gallery', href: STATIC_ROUTES.gallery },
];

export function generateMetadata(): Metadata {
  return buildMetadata({ title: TITLE, description: DESCRIPTION, path: STATIC_ROUTES.gallery });
}

export default function GalleryPage() {
  const entries: GalleryEntry[] = getGalleryItems().flatMap((item) => {
    const image = getImageById(item.imageId);
    return image ? [{ item, image }] : [];
  });

  const categories = [...new Set(entries.map((entry) => entry.item.category))];

  return (
    <>
      <JsonLd
        graph={buildGraph([
          webPageSchema({
            name: TITLE,
            description: DESCRIPTION,
            path: STATIC_ROUTES.gallery,
            primaryImage: entries[0]?.image,
          }),
          breadcrumbSchema(CRUMBS, STATIC_ROUTES.gallery),
          // Each image is described so it can be understood and indexed on its own.
          ...entries.map((entry) => imageObjectSchema(entry.image)),
        ])}
      />
      <Breadcrumbs crumbs={CRUMBS} />

      <Hero
        eyebrow="Gallery"
        heading="The details that decide whether an installation lasts"
        lede="Most of what matters is close-up work: how a cable is terminated, how a net's border rope meets its anchor, how a shaft is closed at the head. These are the things worth looking at when comparing quotations."
        image={entries[0]?.image}
      />

      {categories.map((category, index) => (
        <Section
          key={category}
          tone={index % 2 === 1 ? 'muted' : 'default'}
          width="wide"
          heading={category}
        >
          <GalleryGrid entries={entries.filter((entry) => entry.item.category === category)} />
        </Section>
      ))}

      <Section width="prose" heading="What these jobs involved">
        <p className="text-base leading-relaxed text-ink-700">
          The written explanation of each job type, including the difficulty and how we approach it,
          is on the{' '}
          <Link href={STATIC_ROUTES.projects} className="font-medium text-brand-800">
            installation scenarios
          </Link>{' '}
          page.
        </p>
      </Section>

      <CtaSection />
    </>
  );
}
