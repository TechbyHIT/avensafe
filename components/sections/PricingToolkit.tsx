import Image from 'next/image';
import Link from 'next/link';
import { ContactActions } from '@/components/layout/ContactActions';
import { Container } from '@/components/ui/Container';
import { STATIC_ROUTES } from '@/config/routes';
import {
  getHomeGalleryImages,
  getImageById,
  getServiceBySlug,
  getServices,
} from '@/lib/data/repository';
import { serviceIntentPath, servicePath } from '@/lib/routing/url';
import type { Service } from '@/lib/data/schemas';

/**
 * EverSafe-style pricing literacy — without invented ₹/sq ft bands.
 * Explains units, quote checklist, and photo-estimate CTA so buyers can
 * compare vendors fairly (including us).
 */

const UNIT_ROWS = [
  {
    system: 'Invisible grills',
    unit: 'Usually by fitted opening area (or bay count)',
    ask: 'Cable grade (304/316), spacing, frame finish, openable bays',
  },
  {
    system: 'Balcony / child safety nets',
    unit: 'Usually by fitted mesh area',
    ask: 'Denier/UV grade, aperture, border rope, return sides',
  },
  {
    system: 'Transparent / low-vis nets',
    unit: 'Usually by fitted mesh area',
    ask: 'Strand colour, denier, mesh size, edge treatment',
  },
  {
    system: 'Pigeon / anti-bird nets',
    unit: 'Usually by covered opening area',
    ask: 'Full-opening vs ledge-only, mesh size, duct returns',
  },
  {
    system: 'Bird spikes',
    unit: 'Usually by running length of ledge',
    ask: 'Base material, glue vs screw fix, bird species pressure',
  },
  {
    system: 'Monkey-grade nets',
    unit: 'Usually by fitted area + reinforcement extras',
    ask: 'Denier, corner plates, pull-tested anchors',
  },
  {
    system: 'Sports / cricket nets',
    unit: 'By lane size or panel set',
    ask: 'Impact rating, posts, shared-terrace rules',
  },
  {
    system: 'Cloth hangers',
    unit: 'By system (rails/lines), not balcony sq ft',
    ask: 'Ceiling vs wall, pulley count, stainless grade',
  },
] as const;

const CHECKLIST = [
  'Price unit stated (₹/sq ft of fitted area, per bay, per running metre, or per system)',
  'Measured openings listed bay by bay (W × H), not one guessed room total',
  'Material grade named (e.g. SS 304/316 cable, UV HDPE denier) — not only “stainless”',
  'Spacing or mesh aperture written in mm or inches',
  'Access notes (floor, scaffold/cradle, society time window)',
  'Inclusions: labour, hardware, finishing, GST line, warranty duration',
  'Exclusions: civil make-good, painting, association fees, remobilisation',
  'Minimum job charge (if any) shown separately from unit rate',
] as const;

const FACTORS = [
  {
    title: 'Measured size and shape',
    detail:
      'Width, height, returns, corners, and irregular edges decide quantity. Photos help shortlist; survey locks the number.',
    imageId: 'img-invisible-grills-03',
  },
  {
    title: 'Purpose and material',
    detail:
      'Child spacing, bird mesh, monkey-grade denier, and coastal 316 cable are different specs — not one generic “safety product”.',
    imageId: 'img-sports-nets-02',
  },
  {
    title: 'Access and fixing surface',
    detail:
      'Floor height, scaffold or gondola, railing type, and concrete vs metal change labour and hardware even at the same area.',
    imageId: 'img-duct-area-safety-nets-05',
  },
  {
    title: 'Finish and aftercare',
    detail:
      'Edge finishing, colour match, tension checks, warranty visits, and what must appear on the written quotation before install day.',
    imageId: 'img-cloth-hangers-04',
  },
] as const;

function priceIntentLinks(services: readonly Service[]) {
  const preferred = [
    'invisible-grills',
    'safety-nets',
    'balcony-nets',
    'bird-pigeon-nets',
    'sports-nets',
    'cloth-hangers',
  ] as const;

  return preferred.flatMap((slug) => {
    const service = services.find((entry) => entry.slug === slug) ?? getServiceBySlug(slug);
    if (!service) return [];
    return [
      {
        label: `${service.shortName} price factors`,
        href: serviceIntentPath(service, { slug: 'price' }),
      },
    ];
  });
}

export function PricingToolkit({
  placeLabel,
  serviceName,
  enquiryContext,
  showGuideLink = true,
  tone = 'page',
}: {
  readonly placeLabel?: string;
  readonly serviceName?: string;
  readonly enquiryContext?: string;
  readonly showGuideLink?: boolean;
  /** `page` = full section; `embed` = tighter band for geo pages */
  readonly tone?: 'page' | 'embed';
}) {
  const services = getServices();
  const links = priceIntentLinks(services);
  const mosaic = getHomeGalleryImages(6);
  const context =
    enquiryContext ??
    (serviceName && placeLabel
      ? `${serviceName} pricing in ${placeLabel}`
      : placeLabel
        ? `pricing enquiry in ${placeLabel}`
        : 'pricing enquiry');

  const heading = serviceName
    ? `How ${serviceName} quotes are built${placeLabel ? ` in ${placeLabel}` : ''}`
    : `How safety quotes are built${placeLabel ? ` in ${placeLabel}` : ''}`;

  return (
    <div
      className={
        tone === 'embed'
          ? 'border-b border-ink-200 bg-white py-10 lg:py-12'
          : 'border-y border-ink-200 bg-ink-50/40 py-12 lg:py-16'
      }
    >
      <Container width="wide">
        <div className="grid items-end gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold tracking-widest text-brand-800 uppercase">
              Pricing that stays honest
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ink-900 sm:text-2xl lg:text-3xl">
              {heading}
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-700">
              We do not publish a fake national ₹/sq ft band that pretends every balcony is the same.
              Instead you get unit clarity, a quote checklist, and a photo estimate path — so you can
              compare any vendor (including us) without guessing.
            </p>
          </div>
          {mosaic.length > 0 ? (
            <ul className="grid grid-cols-3 gap-2">
              {mosaic.map((image) => (
                <li
                  key={image.id}
                  className="relative aspect-[4/3] overflow-hidden rounded-(--radius-card) bg-ink-100 shadow-(--shadow-card)"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1024px) 10vw, 30vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {FACTORS.map((factor) => {
            const image = getImageById(factor.imageId);
            return (
              <li
                key={factor.title}
                className="overflow-hidden rounded-(--radius-card) border border-ink-200 bg-white shadow-(--shadow-card)"
              >
                {image ? (
                  <div className="relative aspect-[16/9] bg-ink-100">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 640px) 40vw, 100vw"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <div className="px-5 py-5">
                  <h3 className="text-base font-semibold text-ink-900">{factor.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">{factor.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 overflow-hidden rounded-(--radius-card) border border-ink-200 bg-white shadow-(--shadow-card)">
          <div className="border-b border-ink-200 bg-ink-50 px-5 py-4">
            <h3 className="text-base font-semibold text-ink-900">
              Price units by system (ask for the unit first)
            </h3>
            <p className="mt-1 text-sm text-ink-600">
              Clearer units than a thin four-card price band — so quotes stay comparable.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-ink-200 text-ink-500">
                  <th className="px-5 py-3 font-semibold">System</th>
                  <th className="px-5 py-3 font-semibold">Typical unit</th>
                  <th className="px-5 py-3 font-semibold">Must be named on the quote</th>
                </tr>
              </thead>
              <tbody>
                {UNIT_ROWS.map((row) => (
                  <tr key={row.system} className="border-b border-ink-100 align-top">
                    <td className="px-5 py-3 font-medium text-ink-900">{row.system}</td>
                    <td className="px-5 py-3 text-ink-700">{row.unit}</td>
                    <td className="px-5 py-3 text-ink-600">{row.ask}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="rounded-(--radius-card) border border-ink-200 bg-white p-6 shadow-(--shadow-card)">
            <h3 className="text-base font-semibold text-ink-900">
              Written-quote checklist (use this on every vendor)
            </h3>
            <ol className="mt-4 space-y-2.5">
              {CHECKLIST.map((item, index) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-700">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-800 text-[11px] font-bold text-white">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
            {showGuideLink ? (
              <p className="mt-5 text-sm text-ink-600">
                Full depth:{' '}
                <Link href={STATIC_ROUTES.pricingGuide} className="font-semibold text-brand-800">
                  pricing guide
                </Link>
                {' · '}
                <Link href={STATIC_ROUTES.compare} className="font-semibold text-brand-800">
                  compare systems
                </Link>
              </p>
            ) : null}
          </div>

          <div className="rounded-(--radius-card) border border-brand-200 bg-brand-50/90 p-6 shadow-(--shadow-card)">
            <p className="text-xs font-semibold tracking-widest text-brand-800 uppercase">
              Photo estimate
            </p>
            <h3 className="mt-2 text-lg font-semibold text-ink-900">
              Send a photo{placeLabel ? ` from ${placeLabel}` : ''} for a local estimate
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              One wide shot + a close-up of the fixing surface is enough to shortlist the system and
              outline what your written quote should include. Firm totals follow survey.
            </p>
            <div className="mt-5">
              <ContactActions
                emphasis="photo"
                size="lg"
                layout="stack"
                enquiryContext={context}
              />
            </div>
            <ul className="mt-5 space-y-1.5 text-sm text-ink-700">
              {links.slice(0, 4).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-medium text-brand-800 no-underline hover:underline">
                    {link.label} →
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={STATIC_ROUTES.services}
                  className="font-medium text-brand-800 no-underline hover:underline"
                >
                  All services hub →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {tone === 'page' && services.length > 0 ? (
          <p className="mt-8 text-sm text-ink-600">
            Start from a service page such as{' '}
            {services.slice(0, 3).map((service, index) => (
              <span key={service.id}>
                {index > 0 ? ', ' : ''}
                <Link href={servicePath(service)} className="font-medium text-brand-800">
                  {service.shortName}
                </Link>
              </span>
            ))}{' '}
            and open its price intent for local factors.
          </p>
        ) : null}
      </Container>
    </div>
  );
}
