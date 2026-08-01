import type { Metadata } from 'next';
import { business } from '@/config/business';
import { STATIC_ROUTES } from '@/config/routes';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/layout/JsonLd';
import { CtaSection } from '@/components/sections/CtaSection';
import { Hero } from '@/components/sections/Hero';
import { ProjectList, type ProjectEntry } from '@/components/sections/ProjectList';
import { Section } from '@/components/ui/Section';
import { getImageById, getProjects, getServicesByIds } from '@/lib/data/repository';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema/builders';
import { buildGraph } from '@/lib/schema/graph';
import { buildMetadata } from '@/lib/seo/metadata';

/**
 * Installation scenarios.
 *
 * These describe representative job types rather than named client work. Nothing
 * on this page claims to be a specific customer's project, which is why the
 * records are marked `scenario` and the page says so explicitly.
 */
export const revalidate = 43200; // REVALIDATE.static

const TITLE = `Installation Scenarios | ${business.shortName}`;
const DESCRIPTION =
  'Representative job types we handle, from high-rise cable retrofits to shaft enclosure and facade containment, with the real difficulty in each explained.';

const CRUMBS = [
  { label: 'Home', href: STATIC_ROUTES.home },
  { label: 'Installations', href: STATIC_ROUTES.projects },
];

export function generateMetadata(): Metadata {
  return buildMetadata({ title: TITLE, description: DESCRIPTION, path: STATIC_ROUTES.projects });
}

export default function ProjectsPage() {
  const entries: ProjectEntry[] = getProjects().map((project) => ({
    project,
    image: project.imageId ? getImageById(project.imageId) : undefined,
    serviceNames: getServicesByIds(project.serviceIds).map((service) => service.name),
  }));

  return (
    <>
      <JsonLd
        graph={buildGraph([
          webPageSchema({
            name: TITLE,
            description: DESCRIPTION,
            path: STATIC_ROUTES.projects,
            primaryImage: entries[0]?.image,
          }),
          breadcrumbSchema(CRUMBS, STATIC_ROUTES.projects),
        ])}
      />
      <Breadcrumbs crumbs={CRUMBS} />

      <Hero
        eyebrow="Installations"
        heading="The job types we handle, and what is actually hard about each"
        lede="These are representative scenarios rather than named client projects. Each sets out the real difficulty, how we approach it and what the finished installation achieves, which is more useful than a photograph with a company name attached."
      />

      <Section width="wide">
        <ProjectList entries={entries} />
      </Section>

      <CtaSection />
    </>
  );
}
