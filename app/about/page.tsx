import type { Metadata } from 'next';
import Link from 'next/link';
import { business } from '@/config/business';
import { STATIC_ROUTES } from '@/config/routes';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/layout/JsonLd';
import { CtaSection } from '@/components/sections/CtaSection';
import { Hero } from '@/components/sections/Hero';
import { Section } from '@/components/ui/Section';
import { getCorpusStats, getImageById } from '@/lib/data/repository';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema/builders';
import { buildGraph } from '@/lib/schema/graph';
import { buildMetadata } from '@/lib/seo/metadata';

export const revalidate = 43200; // REVALIDATE.static

const TITLE = `About ${business.name}`;
const DESCRIPTION =
  'How we specify and install safety and utility systems, what we will not compromise on, and why we survey before quoting.';

const CRUMBS = [
  { label: 'Home', href: STATIC_ROUTES.home },
  { label: 'About', href: STATIC_ROUTES.about },
];

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: STATIC_ROUTES.about,
    image: getImageById('img-safety-nets-03'),
  });
}

export default function AboutPage() {
  const stats = getCorpusStats();

  return (
    <>
      <JsonLd
        graph={buildGraph([
          webPageSchema({
            name: TITLE,
            description: DESCRIPTION,
            path: STATIC_ROUTES.about,
            primaryImage: getImageById('img-safety-nets-03'),
          }),
          breadcrumbSchema(CRUMBS, STATIC_ROUTES.about),
        ])}
      />
      <Breadcrumbs crumbs={CRUMBS} />

      <Hero
        eyebrow="About us"
        heading="We specify for the building in front of us, not from a price list"
        lede={`${business.name} installs invisible grills, safety nets, sports nets, cloth hangers and containment netting across ${stats.states} states. Most of what determines whether an installation lasts is invisible in a photograph, so this page explains how we work and what we will not cut.`}
        image={getImageById('img-safety-nets-03')}
      />

      <Section width="prose" heading="What we do">
        <div className="space-y-4 text-base leading-relaxed text-ink-700">
          <p>
            We install six things: cable barriers for balconies and windows, netting for balconies
            and shafts, containment netting for sports grounds, drying systems, service-duct netting,
            and facade sheeting for buildings under repair. Residential work is the majority of it,
            but a meaningful share is commercial and industrial, where the concerns are dropped
            objects and plant access rather than appearance.
          </p>
          <p>
            The common thread is that all six are judged on details nobody can see once the job is
            finished: the grade of the metal, the spacing of the infill, and what the anchors went
            into. That is the part of the trade where corners get cut, so it is the part we write
            into every quotation.
          </p>
        </div>
      </Section>

      <Section tone="muted" width="prose" heading="How we work">
        <ol className="space-y-6">
          {[
            {
              title: 'We survey before we price anything structural',
              detail:
                'An indicative range over the phone is fair. A fixed quotation without seeing the parapet is guesswork, because the strength of the finished assembly is set by what the anchors go into rather than by the cable.',
            },
            {
              title: 'The specification follows the location',
              detail:
                'Coastal air needs AISI 316 stainless; inland, 304 is entirely adequate and costs less. Above roughly the tenth floor, wind pressure rather than impact governs the anchorage. We adjust for both rather than selling one package everywhere.',
            },
            {
              title: 'We write down the things that matter',
              detail:
                'Every quotation states the measured area, the grade and diameter, the spacing in millimetres, the anchor type and the warranty. It also states what is excluded, which is less comfortable up front and much better later.',
            },
            {
              title: 'We hand over with the maintenance explained',
              detail:
                'The annual check takes ten minutes and you can do most of it yourself. We would rather show you than have you discover a slack cable two years later.',
            },
          ].map((item, index) => (
            <li key={item.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-sm font-semibold text-brand-800"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="text-base font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section width="prose" heading="What we will not do">
        <ul className="space-y-4">
          {[
            'Quote a rate per square foot as though grade, spacing and access did not exist.',
            'Supply a bird-exclusion mesh where there is a genuine fall risk, because it creates confidence that is not warranted.',
            'Fix a drying system into a false ceiling, whatever the ceiling looks like.',
            'Net over a shaft that still has nesting material in it.',
            'Sheet a scaffold without first checking that its design accounts for the wind load cladding it will create.',
          ].map((item) => (
            <li key={item} className="flex gap-3 text-base leading-relaxed text-ink-700">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-base leading-relaxed text-ink-700">
          If you want the detail behind any of this, the{' '}
          <Link href={STATIC_ROUTES.installationGuide} className="font-medium text-brand-800">
            installation guide
          </Link>{' '}
          walks through how a job runs from survey to handover, and the{' '}
          <Link href={STATIC_ROUTES.serviceAreas} className="font-medium text-brand-800">
            states and cities we cover
          </Link>{' '}
          set out what changes locally.
        </p>
      </Section>

      <CtaSection />
    </>
  );
}
