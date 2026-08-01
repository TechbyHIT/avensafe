import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { business } from '@/config/business';
import { STATIC_ROUTES } from '@/config/routes';
import { SERVICE_TAXONOMY } from '@/config/service-taxonomy';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/layout/JsonLd';
import { CtaSection } from '@/components/sections/CtaSection';
import { Hero } from '@/components/sections/Hero';
import { Section } from '@/components/ui/Section';
import { getPrimaryImageForService, getServiceBySlug } from '@/lib/data/repository';
import { serviceIntentPath, servicePath } from '@/lib/routing/url';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema/builders';
import { buildGraph } from '@/lib/schema/graph';
import { buildMetadata } from '@/lib/seo/metadata';

export const revalidate = 43200;

const TITLE = `Compare Invisible Grills vs Safety Nets | ${business.shortName}`;
const DESCRIPTION =
  'Compare invisible grills, balcony nets, pigeon nets, child/pet options, and cloth hangers by view, safety job, bird pressure, and price factors — then send a photo for a local estimate.';

const CRUMBS = [
  { label: 'Home', href: STATIC_ROUTES.home },
  { label: 'Compare', href: STATIC_ROUTES.compare },
];

const ROWS = [
  {
    question: 'Want the view almost untouched?',
    pick: 'Invisible grills',
    why: 'High-tension cables keep sightlines open on front balconies and living-room windows.',
    hrefService: 'invisible-grills',
    hrefIntent: 'for-balcony',
  },
  {
    question: 'Want mesh with less visual weight?',
    pick: 'Transparent balcony nets',
    why: 'Low-visibility strands when you want net coverage without a heavy square look.',
    hrefService: 'balcony-nets',
    hrefIntent: 'transparent-nets',
  },
  {
    question: 'Need denser child or pet coverage?',
    pick: 'Safety / balcony nets',
    why: 'Mesh closes smaller gaps at rail height and side returns where cables alone may not feel enough.',
    hrefService: 'safety-nets',
    hrefIntent: 'child-safety',
  },
  {
    question: 'Open staircase or void side?',
    pick: 'Staircase safety nets',
    why: 'Side gaps and rises need fall protection that stays clear of the walking line.',
    hrefService: 'safety-nets',
    hrefIntent: 'for-staircase',
  },
  {
    question: 'Pigeons keep returning to ledges?',
    pick: 'Bird & pigeon nets',
    why: 'Full-opening nets and spikes treat roosts, ducts, and AC trays — not only the sitting balcony.',
    hrefService: 'bird-pigeon-nets',
    hrefIntent: 'pigeon-control',
  },
  {
    question: 'Monkeys or hard outdoor pressure?',
    pick: 'Monkey-grade nets',
    why: 'Heavier mesh and corner fixings — light bird netting is the wrong spec here.',
    hrefService: 'safety-nets',
    hrefIntent: 'monkey-protection',
  },
  {
    question: 'Society wants one uniform look?',
    pick: 'Apartment / society intents',
    why: 'Multi-flat jobs need association rules, colour match, and lift slots planned once for many openings.',
    hrefService: 'invisible-grills',
    hrefIntent: 'for-society',
  },
  {
    question: 'Comparing quotes on cost?',
    pick: 'Price factors guide',
    why: 'Measured area, grade, access, and finish drive price — not a single invented ₹/sq ft number.',
    href: STATIC_ROUTES.pricingGuide,
  },
] as const;

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: STATIC_ROUTES.compare,
  });
}

export default function ComparePage() {
  return (
    <>
      <JsonLd
        graph={buildGraph([
          webPageSchema({
            name: TITLE,
            description: DESCRIPTION,
            path: STATIC_ROUTES.compare,
          }),
          breadcrumbSchema(CRUMBS, STATIC_ROUTES.compare),
        ])}
      />
      <Breadcrumbs crumbs={CRUMBS} />

      <Hero
        eyebrow="Compare before you buy"
        heading="Pick the system by the job — not by the product name"
        lede={`${business.shortName} keeps the choice on one hub: clear view, transparent mesh, children or pets, stairs, birds, monkeys, society rules, or price factors — then routes you to the right service and local page. Survey still decides the final grade.`}
        enquiryContext="compare systems"
      />

      <Section heading="Quick decision table" width="wide">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink-200 text-ink-500">
                <th className="py-3 pr-4 font-semibold">Your situation</th>
                <th className="py-3 pr-4 font-semibold">Usually choose</th>
                <th className="py-3 pr-4 font-semibold">Why</th>
                <th className="py-3 font-semibold">Next step</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => {
                const href =
                  'href' in row
                    ? row.href
                    : (() => {
                        const service = getServiceBySlug(row.hrefService);
                        if (!service) return STATIC_ROUTES.services;
                        return serviceIntentPath(service, { slug: row.hrefIntent });
                      })();
                return (
                  <tr key={row.question} className="border-b border-ink-100 align-top">
                    <td className="py-4 pr-4 font-medium text-ink-900">{row.question}</td>
                    <td className="py-4 pr-4 text-ink-800">{row.pick}</td>
                    <td className="py-4 pr-4 text-ink-600">{row.why}</td>
                    <td className="py-4">
                      <Link href={href} className="font-semibold text-brand-800">
                        Open guide →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section tone="muted" heading="All service families" width="wide">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_TAXONOMY.map((family) => {
            const service = getServiceBySlug(family.serviceSlug);
            if (!service) return null;
            const image = getPrimaryImageForService(service.id);
            return (
              <li
                key={family.serviceSlug}
                className="overflow-hidden rounded-(--radius-card) border border-ink-200 bg-white shadow-(--shadow-card)"
              >
                {image ? (
                  <Link href={servicePath(service)} className="relative block aspect-[16/10] bg-ink-100">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 1024px) 30vw, 50vw"
                      className="object-cover"
                      loading="lazy"
                    />
                  </Link>
                ) : null}
                <div className="p-5">
                  <h3 className="text-base font-semibold text-ink-900">
                    <Link href={servicePath(service)} className="no-underline hover:text-brand-800">
                      {family.heading}
                    </Link>
                  </h3>
                  <ul className="mt-3 space-y-1.5">
                    {family.children.slice(0, 6).map((child) => (
                      <li key={child.intentSlug}>
                        <Link
                          href={serviceIntentPath(service, { slug: child.intentSlug })}
                          className="text-sm text-ink-600 no-underline hover:text-brand-800"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-6 text-sm text-ink-600">
          Still unsure? Read the{' '}
          <Link href={STATIC_ROUTES.buyingGuide} className="font-medium text-brand-800">
            buying guide
          </Link>{' '}
          or the{' '}
          <Link href={STATIC_ROUTES.pricingGuide} className="font-medium text-brand-800">
            pricing guide
          </Link>
          , then send a photo for a local written estimate.
        </p>
      </Section>

      <CtaSection enquiryContext="compare systems" />
    </>
  );
}
