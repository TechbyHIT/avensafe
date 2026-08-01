import Image from 'next/image';
import Link from 'next/link';
import { primaryPhone, telHref } from '@/config/business';
import { SERVICE_TAXONOMY } from '@/config/service-taxonomy';
import { Container } from '@/components/ui/Container';
import { getImagesForService, getServiceBySlug } from '@/lib/data/repository';
import type { ImageRecord, Service } from '@/lib/data/schemas';
import { serviceIntentPath, servicePath } from '@/lib/routing/url';

export interface ServiceCardItem {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly image?: ImageRecord | undefined;
}

function blurbFor(label: string, service: Service): string {
  const lower = label.toLowerCase();
  if (lower.includes('child') || lower.includes('kids')) {
    return `Child-safe spacing and clean finishing for ${service.shortName.toLowerCase()} on balconies and windows.`;
  }
  if (lower.includes('pet') || lower.includes('cat') || lower.includes('dog')) {
    return `Pet-safe fittings planned around how animals use the opening — measured on site.`;
  }
  if (lower.includes('window')) {
    return `Slim, light-friendly ${service.shortName.toLowerCase()} for windows without heavy framing.`;
  }
  if (lower.includes('balcony')) {
    return `Custom-fitted ${service.shortName.toLowerCase()} for apartment and villa balconies.`;
  }
  if (lower.includes('price') || lower.includes('quote') || lower.includes('cost')) {
    return `What drives a written quotation for ${service.shortName.toLowerCase()} — area, grade, access and finish.`;
  }
  if (lower.includes('install')) {
    return `Survey-led ${service.shortName.toLowerCase()} installation with documented spacing and anchors.`;
  }
  if (lower.includes('pigeon') || lower.includes('bird')) {
    return `Full-opening bird control that keeps nests off ledges, ducts and railings.`;
  }
  return service.summary;
}

/** Pick the first unused photo from a pool so grids do not repeat the same shot. */
function pickDistinctImage(
  pool: readonly ImageRecord[],
  used: Set<string>,
): ImageRecord | undefined {
  const fresh = pool.find((image) => !used.has(image.id));
  const chosen = fresh ?? pool[0];
  if (chosen) used.add(chosen.id);
  return chosen;
}

/** Featured taxonomy leaves as Hiranya-style photo cards (≈12). */
export function buildTaxonomyServiceCards(limit = 12): readonly ServiceCardItem[] {
  const cards: ServiceCardItem[] = [];
  const usedImageIds = new Set<string>();

  for (const family of SERVICE_TAXONOMY) {
    const service = getServiceBySlug(family.serviceSlug);
    if (!service) continue;
    const pool = getImagesForService(service.id, 16);
    if (pool.length === 0) continue;

    for (const child of family.children.slice(0, 3)) {
      if (cards.length >= limit) return cards;
      cards.push({
        title: child.label,
        description: blurbFor(child.label, service),
        href: serviceIntentPath(service, { slug: child.intentSlug }),
        image: pickDistinctImage(pool, usedImageIds),
      });
    }
  }

  return cards;
}

export function buildCoreServiceCards(services: readonly Service[]): readonly ServiceCardItem[] {
  const usedImageIds = new Set<string>();
  return services.map((service) => {
    const pool = getImagesForService(service.id, 16);
    return {
      title: service.name,
      description: service.summary,
      href: servicePath(service),
      image: pickDistinctImage(pool, usedImageIds),
    };
  });
}

export interface ServiceImageCardsProps {
  readonly cards: readonly ServiceCardItem[];
  readonly eyebrow?: string;
  readonly heading?: string;
  readonly lede?: string;
  readonly id?: string;
}

/**
 * Image-forward service grid: photo, short explain copy, View Details + Call.
 */
export function ServiceImageCards({
  cards,
  eyebrow = 'Our Services',
  heading = 'Complete home & building safety solutions',
  lede = 'From invisible grills to safety nets, bird protection and cloth hangers — compare the right fit, then book a free survey.',
  id = 'services',
}: ServiceImageCardsProps) {
  if (cards.length === 0) return null;

  return (
    <section id={id} className="bg-ink-50 py-(--spacing-section) lg:py-(--spacing-section-lg)">
      <Container width="wide">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full bg-accent-500/15 px-3 py-1 text-[11px] font-bold tracking-widest text-accent-700 uppercase">
            {eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            {heading}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-600 sm:text-lg">{lede}</p>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <li key={`${card.href}-${card.title}`}>
              <article className="flex h-full flex-col overflow-hidden rounded-(--radius-card) border border-ink-200/80 bg-white shadow-(--shadow-card) transition-shadow duration-200 hover:shadow-(--shadow-raised)">
                {card.image ? (
                  <div className="relative aspect-[4/3] bg-ink-100">
                    <Image
                      src={card.image.src}
                      alt={card.image.alt}
                      fill
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold text-ink-900">{card.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600">
                    {card.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href={card.href}
                      data-no-underline=""
                      className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-4 py-2.5 text-xs font-bold text-white no-underline hover:bg-ink-800"
                    >
                      View Details
                      <span aria-hidden="true">→</span>
                    </Link>
                    <a
                      href={telHref(primaryPhone)}
                      data-no-underline=""
                      className="inline-flex items-center gap-1.5 rounded-full border border-ink-300 bg-white px-4 py-2.5 text-xs font-bold text-ink-800 no-underline hover:bg-ink-50"
                    >
                      <PhoneIcon />
                      Call
                    </a>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M3.7 1.5a1.3 1.3 0 0 1 1.8.3l1.2 1.7c.3.4.3 1 0 1.4l-.7.9c-.2.2-.2.5 0 .8.5.9 1.5 1.9 2.4 2.4.3.2.6.2.8 0l.9-.7c.4-.3 1-.3 1.4 0l1.7 1.2c.6.4.7 1.2.3 1.8l-.6.8c-.5.7-1.4 1-2.2.8-1.9-.5-3.7-1.6-5.1-3C4.2 9.2 3.1 7.4 2.6 5.5c-.2-.8.1-1.7.8-2.2l.3-.2Z" />
    </svg>
  );
}
