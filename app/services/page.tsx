import type { Metadata } from 'next';
import { business } from '@/config/business';
import { STATIC_ROUTES } from '@/config/routes';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/layout/JsonLd';
import { CtaSection } from '@/components/sections/CtaSection';
import { ExplainFeatureBlocks } from '@/components/sections/ExplainFeatureBlocks';
import { Hero } from '@/components/sections/Hero';
import { InstallProcess, PhotoMosaic } from '@/components/sections/MarketingSections';
import {
  buildCoreServiceCards,
  buildTaxonomyServiceCards,
  ServiceImageCards,
} from '@/components/sections/ServiceImageCards';
import { ServiceTaxonomy } from '@/components/sections/ServiceTaxonomy';
import { LinkCard } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import {
  getCornerstoneGuides,
  getHomeGalleryImages,
  getImageById,
  getPrimaryImageForService,
  getServices,
} from '@/lib/data/repository';
import { guidePath, servicePath } from '@/lib/routing/url';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema/builders';
import { buildGraph } from '@/lib/schema/graph';
import { buildMetadata } from '@/lib/seo/metadata';

export const revalidate = 43200; // REVALIDATE.serviceHub

const TITLE = `Our Services | ${business.shortName}`;
const DESCRIPTION =
  'Invisible grills, safety nets, balcony nets, bird and pigeon nets, sports nets, cloth hangers, duct area nets, and building covering — specified from survey across South and West India.';

const CRUMBS = [
  { label: 'Home', href: STATIC_ROUTES.home },
  { label: 'Services', href: STATIC_ROUTES.services },
];

export function generateMetadata(): Metadata {
  return buildMetadata({ title: TITLE, description: DESCRIPTION, path: STATIC_ROUTES.services });
}

export default function ServicesPage() {
  const guides = getCornerstoneGuides();
  const services = getServices();
  const taxonomyCards = buildTaxonomyServiceCards(12);
  const coreCards = buildCoreServiceCards(services);
  const mosaic = getHomeGalleryImages(12);

  const invisible = services.find((entry) => entry.slug === 'invisible-grills');
  const bird = services.find((entry) => entry.slug === 'bird-pigeon-nets');

  const explainBlocks = [
    invisible
      ? {
          eyebrow: 'Clear-view safety',
          title: 'Invisible grills specified to your opening',
          body: 'Cable grade, spacing and frame finish are confirmed after measurement — not guessed from a rate card.',
          points: [
            'Balcony, window, apartment and villa variants',
            'Child and pet spacing options',
            'Written quotation with grade and access notes',
          ],
          href: servicePath(invisible),
          ctaLabel: 'Open invisible grills',
          image: getPrimaryImageForService(invisible.id),
        }
      : null,
    bird
      ? {
          eyebrow: 'Bird control',
          title: 'Pigeon and bird nets that stay neat',
          body: 'Full-opening coverage for balconies, ducts and ledges where birds keep returning.',
          points: [
            'UV-stable mesh with even tension',
            'Duct, window and society-focused options',
            'Optional spikes where ledges need hard deterrents',
          ],
          href: servicePath(bird),
          ctaLabel: 'Open bird & pigeon nets',
          image: getPrimaryImageForService(bird.id),
        }
      : null,
  ].filter((block): block is NonNullable<typeof block> => Boolean(block));

  return (
    <>
      <JsonLd
        graph={buildGraph([
          webPageSchema({ name: TITLE, description: DESCRIPTION, path: STATIC_ROUTES.services }),
          breadcrumbSchema(CRUMBS, STATIC_ROUTES.services),
        ])}
      />
      <Breadcrumbs crumbs={CRUMBS} />

      <Hero
        eyebrow="Service library"
        heading="Eight product families — start with the job, finish with a survey"
        lede="Every family below opens into city and locality pages with written quotations — grade, spacing, and access — not a single national rate card."
        image={getImageById('img-invisible-grills-01') ?? getImageById('img-hero-home')}
        variant="split"
      />

      <ServiceImageCards
        cards={coreCards}
        eyebrow="Core services"
        heading="Start with the right product family"
        lede="Each card opens a full service hub with materials, process, FAQs and city coverage."
        id="core-services"
      />

      <ServiceImageCards
        cards={taxonomyCards}
        eyebrow="Popular solutions"
        heading="Complete home & building safety solutions"
        lede="From balcony invisible grills to kids safety nets and pigeon control — pick the closest match, then refine on the survey."
        id="popular-solutions"
      />

      <ExplainFeatureBlocks blocks={explainBlocks} />

      <ServiceTaxonomy />

      <PhotoMosaic images={mosaic} />

      <InstallProcess />

      <Section tone="muted" heading="Decide before you buy">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <li key={guide.id}>
              <LinkCard
                href={guidePath(guide)}
                title={guide.heading}
                description={guide.excerpt}
                meta={`${guide.readingMinutes} min read`}
              />
            </li>
          ))}
        </ul>
      </Section>

      <CtaSection />
    </>
  );
}
