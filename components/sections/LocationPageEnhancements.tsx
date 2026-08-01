import Image from 'next/image';
import Link from 'next/link';
import { ContactActions } from '@/components/layout/ContactActions';
import { PricingToolkit } from '@/components/sections/PricingToolkit';
import { Container } from '@/components/ui/Container';
import { STATIC_ROUTES } from '@/config/routes';
import {
  getImageById,
  getPrimaryImageForService,
  getServices,
} from '@/lib/data/repository';
import { serviceInAreaPath, serviceInCityPath } from '@/lib/routing/url';
import type { PageTarget } from '@/types/routing';

/** Compact trust chips under the hero (FeatherGuard-style reassurance row). */
export function PageTrustStrip() {
  const items = [
    'Photo estimate on WhatsApp',
    'Written quotation after survey',
    'Named material grades',
    'Eight-state coverage',
  ] as const;

  return (
    <div className="border-b border-ink-200 bg-white">
      <Container width="wide">
        <ul className="grid grid-cols-2 gap-px bg-ink-200 sm:grid-cols-4">
          {items.map((item) => (
            <li
              key={item}
              className="bg-white px-3 py-3.5 text-center text-xs font-semibold tracking-wide text-ink-700 uppercase sm:text-[13px] sm:normal-case sm:tracking-normal"
            >
              {item}
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}

/** Soft mid-page CTA: one photo + city is enough to start (WhatsApp-first). */
export function EnquiryPhotoCallout({
  placeLabel,
  enquiryContext,
}: {
  readonly placeLabel: string;
  readonly enquiryContext?: string;
}) {
  const photo =
    getImageById('img-invisible-grills-03') ??
    getImageById('img-safety-nets-03') ??
    getImageById('img-hero-home');

  return (
    <div className="border-y border-brand-200 bg-brand-50/80">
      <Container width="wide" className="py-10 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr_0.9fr] lg:items-center">
          {photo ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-(--radius-media) bg-ink-100 shadow-(--shadow-card)">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 28vw, 100vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
          ) : null}
          <div>
            <p className="text-xs font-semibold tracking-widest text-brand-800 uppercase">
              Photo → WhatsApp estimate
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ink-900 sm:text-2xl">
              Send a clear photo of the opening{placeLabel ? ` in ${placeLabel}` : ''}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-700">
              One wide shot and a close-up of the fixing surface are enough to confirm coverage,
              suggest the right system, and outline what should appear on a written quotation
              before you book a survey. Firm totals still follow measurement on site.
            </p>
            <ul className="mt-4 grid gap-1.5 text-sm text-ink-700 sm:grid-cols-2">
              <li>✓ City / PIN in the message</li>
              <li>✓ Priority: kids, birds, view, or monkeys</li>
              <li>✓ Rough width × height if known</li>
              <li>✓ Floor / society access notes</li>
            </ul>
          </div>
          <ContactActions
            size="lg"
            layout="stack"
            emphasis="photo"
            {...(enquiryContext ? { enquiryContext } : {})}
          />
        </div>
      </Container>
    </div>
  );
}

/**
 * Every service for the current city/area — always shown so no service page
 * is orphaned from the location graph (FeatherGuard-style service chip row).
 */
export function LocationServicesNav({ target }: { readonly target: PageTarget }) {
  const location = target.location;
  if (!location?.city) return null;

  const services = getServices();
  const { state, city, area } = location;
  const place = area?.name ?? city.name;
  const currentServiceId = target.service?.id;

  return (
    <div className="bg-ink-50 py-10 lg:py-12">
      <Container width="wide">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-accent-700 uppercase">
              All services in {place}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-ink-600">
              Every service below has its own page for {place} — open any to compare systems.
            </p>
          </div>
          <Link
            href={STATIC_ROUTES.services}
            className="text-sm font-semibold text-brand-800 no-underline hover:underline"
          >
            All services hub →
          </Link>
        </div>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const href = area
              ? serviceInAreaPath(service, state, city, area)
              : serviceInCityPath(service, state, city);
            const active = service.id === currentServiceId;
            const image = getPrimaryImageForService(service.id);
            return (
              <li key={service.id}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  data-no-underline=""
                  className={
                    active
                      ? 'block overflow-hidden rounded-(--radius-card) border-2 border-brand-700 bg-white no-underline shadow-(--shadow-raised)'
                      : 'block overflow-hidden rounded-(--radius-card) border border-ink-200/80 bg-white no-underline shadow-(--shadow-card) transition-shadow hover:shadow-(--shadow-raised)'
                  }
                >
                  {image ? (
                    <div className="relative aspect-[16/10] bg-ink-100">
                      <Image
                        src={image.src}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 18vw, 45vw"
                        className="object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : null}
                  <div className="px-3.5 py-3">
                    <p className="text-sm font-bold text-ink-900">{service.shortName}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-ink-600">{service.summary}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </div>
  );
}

/**
 * Transparent price drivers — no fabricated ₹/sq ft rates.
 * Uses the shared PricingToolkit (units + checklist + photo CTA) so geo pages
 * beat a thin “four factor cards” pricing band.
 */
export function PriceFactorsPanel({
  serviceName,
  placeLabel,
  enquiryContext,
}: {
  readonly serviceName?: string;
  readonly placeLabel: string;
  readonly enquiryContext?: string;
}) {
  return (
    <PricingToolkit
      placeLabel={placeLabel}
      {...(serviceName ? { serviceName } : {})}
      {...(enquiryContext ? { enquiryContext } : {})}
      tone="embed"
    />
  );
}

export function CompactInstallProcess() {
  const steps = [
    {
      title: 'Share photo',
      detail: 'City + opening photo is enough to start',
      imageId: 'img-invisible-grills-03',
    },
    {
      title: 'Site survey',
      detail: 'Measure openings and check fixing surface',
      imageId: 'img-duct-area-safety-nets-03',
    },
    {
      title: 'Written quote',
      detail: 'Grade, spacing, and scope in writing',
      imageId: 'img-cloth-hangers-02',
    },
    {
      title: 'Install & hand over',
      detail: 'Fit, tension check, and walkthrough',
      imageId: 'img-building-covering-safety-nets-02',
    },
  ] as const;

  return (
    <div className="border-b border-ink-200 bg-white py-8 lg:py-10">
      <Container width="wide">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-widest text-brand-800 uppercase">
              How it works
            </p>
            <h2 className="mt-1 text-lg font-semibold text-ink-900 sm:text-xl">
              Typical installation path
            </h2>
          </div>
        </div>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const image = getImageById(step.imageId);
            return (
              <li
                key={step.title}
                className="overflow-hidden rounded-(--radius-card) border border-ink-200/80 bg-ink-50/60"
              >
                {image ? (
                  <div className="relative aspect-[16/10] bg-ink-100">
                    <Image
                      src={image.src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 18vw, 45vw"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <div className="px-4 py-4">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-800 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="mt-3 text-sm font-semibold text-ink-900">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-600">{step.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Container>
    </div>
  );
}
