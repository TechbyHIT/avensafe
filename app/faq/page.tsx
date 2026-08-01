import type { Metadata } from 'next';
import Link from 'next/link';
import { business } from '@/config/business';
import { STATIC_ROUTES } from '@/config/routes';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/layout/JsonLd';
import { CtaSection } from '@/components/sections/CtaSection';
import { Hero } from '@/components/sections/Hero';
import { InstallProcess } from '@/components/sections/MarketingSections';
import { EnquiryPhotoCallout } from '@/components/sections/LocationPageEnhancements';
import { Accordion } from '@/components/ui/Accordion';
import { Section } from '@/components/ui/Section';
import { getFaqsByScope } from '@/lib/data/repository';
import type { Faq } from '@/lib/data/schemas';
import { breadcrumbSchema, faqPageSchema, webPageSchema } from '@/lib/schema/builders';
import { buildGraph } from '@/lib/schema/graph';
import { buildMetadata } from '@/lib/seo/metadata';

export const revalidate = 43200; // REVALIDATE.static

const TITLE = `Frequently Asked Questions | ${business.shortName}`;
const DESCRIPTION =
  'Straight answers on pricing, warranties, association approvals, load ratings, maintenance intervals and what each product can and cannot do.';

const CRUMBS = [
  { label: 'Home', href: STATIC_ROUTES.home },
  { label: 'FAQ', href: STATIC_ROUTES.faq },
];

const GROUPS: readonly {
  readonly heading: string;
  readonly scopes: readonly Faq['scope'][];
  readonly footnote?: 'services' | 'pricing';
}[] = [
  { heading: 'General', scopes: ['global'] },
  { heading: 'Pricing and quotations', scopes: ['pricing'], footnote: 'pricing' },
  { heading: 'Location and coverage', scopes: ['location'] },
  { heading: 'Maintenance and aftercare', scopes: ['maintenance'] },
  { heading: 'Product specific', scopes: ['service'], footnote: 'services' },
];

export function generateMetadata(): Metadata {
  return buildMetadata({ title: TITLE, description: DESCRIPTION, path: STATIC_ROUTES.faq });
}

export default function FaqPage() {
  const groups = GROUPS.map((group) => ({
    ...group,
    faqs: getFaqsByScope(group.scopes),
  })).filter((group) => group.faqs.length > 0);

  const everyFaq = groups.flatMap((group) => group.faqs);

  return (
    <>
      <JsonLd
        graph={buildGraph([
          webPageSchema({ name: TITLE, description: DESCRIPTION, path: STATIC_ROUTES.faq }),
          breadcrumbSchema(CRUMBS, STATIC_ROUTES.faq),
          faqPageSchema(everyFaq, STATIC_ROUTES.faq),
        ])}
      />
      <Breadcrumbs crumbs={CRUMBS} />

      <Hero
        eyebrow="FAQ"
        heading="Questions we are asked most, answered plainly"
        lede="Where a question deserves more than a paragraph, we have written a full guide and linked to it. Nothing here is hedged to avoid quoting a number we would rather not quote."
      />

      <EnquiryPhotoCallout placeLabel="your area" enquiryContext="FAQ enquiry" />

      <InstallProcess />

      {groups.map((group, index) => (
        <Section
          key={group.heading}
          id={`faq-${index}`}
          tone={index % 2 === 1 ? 'muted' : 'default'}
          width="prose"
          heading={group.heading}
        >
          <Accordion
            items={group.faqs.map((faq) => ({
              id: faq.id,
              question: faq.question,
              answer: faq.answer,
            }))}
          />

          {group.footnote === 'services' ? (
            <p className="mt-6 text-sm text-ink-600">
              Each service page carries the full detail for that product, including materials,
              method and warranty.{' '}
              <Link href={STATIC_ROUTES.services} className="font-medium text-brand-800">
                Browse the services
              </Link>
              .
            </p>
          ) : null}

          {group.footnote === 'pricing' ? (
            <p className="mt-6 text-sm text-ink-600">
              The{' '}
              <Link href={STATIC_ROUTES.pricingGuide} className="font-medium text-brand-800">
                pricing guide
              </Link>{' '}
              sets out every factor that moves a quotation, and where a cheaper specification is
              genuinely fine.
            </p>
          ) : null}
        </Section>
      ))}

      <CtaSection />
    </>
  );
}
