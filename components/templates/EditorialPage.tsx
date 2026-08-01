import Image from 'next/image';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/layout/JsonLd';
import { CtaSection } from '@/components/sections/CtaSection';
import { EditorialArticle } from '@/components/sections/EditorialArticle';
import { FaqSection } from '@/components/sections/FaqSection';
import { Hero } from '@/components/sections/Hero';
import { PricingToolkit } from '@/components/sections/PricingToolkit';
import { Section } from '@/components/ui/Section';
import { STATIC_ROUTES } from '@/config/routes';
import { getPrimaryImageForService } from '@/lib/data/repository';
import type { BlogPost, Faq, Guide, ImageRecord, Service } from '@/lib/data/schemas';
import { servicePath } from '@/lib/routing/url';
import {
  articleSchema,
  breadcrumbSchema,
  faqPageSchema,
  webPageSchema,
} from '@/lib/schema/builders';
import { buildGraph } from '@/lib/schema/graph';
import type { Crumb } from '@/types/routing';

export interface EditorialPageProps {
  readonly entry: Guide | BlogPost;
  readonly path: string;
  readonly crumbs: readonly Crumb[];
  readonly image: ImageRecord | undefined;
  readonly faqs: readonly Faq[];
  readonly relatedServices: readonly Service[];
  readonly articleType: 'Article' | 'BlogPosting';
  readonly eyebrow: string;
}

/**
 * Shared renderer for guides and blog posts.
 *
 * Both content types have the same shape, so they share one template and one
 * structured-data path. `articleType` is the only real difference: guides are
 * `Article`, posts are `BlogPosting`.
 */
export function EditorialPage({
  entry,
  path,
  crumbs,
  image,
  faqs,
  relatedServices,
  articleType,
  eyebrow,
}: EditorialPageProps) {
  const published = new Date(entry.publishedAt);
  const updated = new Date(entry.updatedAt);
  const wasUpdated = entry.updatedAt !== entry.publishedAt;

  return (
    <>
      <JsonLd
        graph={buildGraph([
          webPageSchema({
            name: entry.title,
            description: entry.description,
            path,
            primaryImage: image,
          }),
          breadcrumbSchema(crumbs, path),
          articleSchema({ entry, path, image, articleType }),
          faqPageSchema(faqs, path),
        ])}
      />
      <Breadcrumbs crumbs={crumbs} />

      <Hero
        eyebrow={eyebrow}
        heading={entry.heading}
        lede={entry.excerpt}
        image={image}
        variant={image ? 'split' : 'editorial'}
        {...(path === STATIC_ROUTES.pricingGuide ? { ctaEmphasis: 'photo' as const } : {})}
        {...(path === STATIC_ROUTES.pricingGuide
          ? { enquiryContext: 'pricing guide — photo estimate' }
          : {})}
      >
        <p className={image ? 'text-sm text-white/80' : 'text-sm text-ink-500'}>
          {entry.readingMinutes} min read · Published{' '}
          <time dateTime={entry.publishedAt}>
            {published.toLocaleDateString('en-IN', { dateStyle: 'long' })}
          </time>
          {wasUpdated ? (
            <>
              {' '}
              · Updated{' '}
              <time dateTime={entry.updatedAt}>
                {updated.toLocaleDateString('en-IN', { dateStyle: 'long' })}
              </time>
            </>
          ) : null}
        </p>
      </Hero>

      {path === STATIC_ROUTES.pricingGuide ? (
        <PricingToolkit
          enquiryContext="pricing guide — photo estimate"
          showGuideLink={false}
          tone="page"
        />
      ) : null}

      <EditorialArticle sections={entry.sections} />

      <FaqSection
        faqs={faqs}
        heading="Related questions"
        {...(image ? { image } : {})}
      />

      {relatedServices.length > 0 ? (
        <Section tone="muted" heading="Services this applies to" width="wide">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedServices.map((service) => {
              const serviceImage = getPrimaryImageForService(service.id);
              return (
                <li key={service.id}>
                  <Link
                    href={servicePath(service)}
                    data-no-underline=""
                    className="block overflow-hidden rounded-(--radius-card) border border-ink-200/80 bg-white no-underline shadow-(--shadow-card) transition-shadow hover:shadow-(--shadow-raised)"
                  >
                    {serviceImage ? (
                      <div className="relative aspect-[16/10] bg-ink-100">
                        <Image
                          src={serviceImage.src}
                          alt={serviceImage.alt}
                          fill
                          sizes="(min-width: 1024px) 30vw, 50vw"
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : null}
                    <div className="p-5">
                      <h3 className="text-base font-semibold text-ink-900">{service.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-600">{service.summary}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>
      ) : null}

      <CtaSection />
    </>
  );
}

export interface EditorialIndexEntry {
  readonly id: string;
  readonly href: string;
  readonly heading: string;
  readonly excerpt: string;
  readonly meta: string;
  readonly image?: ImageRecord | undefined;
}

/** Image-forward index cards for blogs and guides. */
export function EditorialIndexList({
  entries,
}: {
  readonly entries: readonly EditorialIndexEntry[];
}) {
  if (entries.length === 0) {
    return (
      <p className="text-base text-ink-600">
        Nothing published here yet. In the meantime,{' '}
        <Link href="/services" className="font-medium text-brand-800">
          browse the service pages
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {entries.map((entry) => (
        <li key={entry.id}>
          <article className="flex h-full flex-col overflow-hidden rounded-(--radius-card) border border-ink-200/80 bg-white shadow-(--shadow-card) transition-shadow hover:shadow-(--shadow-raised)">
            {entry.image ? (
              <Link href={entry.href} className="relative block aspect-[16/10] bg-ink-100">
                <Image
                  src={entry.image.src}
                  alt={entry.image.alt}
                  fill
                  sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw"
                  className="object-cover"
                  loading="lazy"
                />
              </Link>
            ) : null}
            <div className="flex flex-1 flex-col p-5">
              <p className="text-[11px] font-bold tracking-widest text-accent-700 uppercase">
                {entry.meta}
              </p>
              <h3 className="mt-2 text-lg font-bold text-ink-900">
                <Link
                  href={entry.href}
                  data-no-underline=""
                  className="no-underline hover:text-brand-800"
                >
                  {entry.heading}
                </Link>
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600">{entry.excerpt}</p>
              <Link
                href={entry.href}
                data-no-underline=""
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-800 no-underline"
              >
                Read article
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
