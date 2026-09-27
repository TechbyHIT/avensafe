import Image from 'next/image';
import Link from 'next/link';
import { SERVICE_TAXONOMY } from '@/config/service-taxonomy';
import { Container } from '@/components/ui/Container';
import {
  getImageById,
  getImagesForService,
  getPrimaryImageForService,
  getServices,
} from '@/lib/data/repository';
import type { ImageRecord, Service } from '@/lib/data/schemas';
import { locationLabel } from '@/lib/routing/resolve';
import {
  serviceInAreaIntentPath,
  serviceInAreaPath,
  serviceInCityIntentPath,
  serviceInCityPath,
  serviceIntentPath,
  servicePath,
} from '@/lib/routing/url';
import type { PageTarget } from '@/types/routing';

export const STATIC_HERO_CHIPS = [
  'A fit for your opening — measurements, edges and fixing points',
  'Options for everyday living — view, access and purpose',
  'Find your local team — city and neighbourhood pages',
] as const;

const DEFAULT_FITTING_POINTS = [
  {
    title: 'Materials chosen for the intended use',
    detail: 'Cable grade, mesh denier, and hardware are named for the job — view, children, birds, or sports — not a generic pack.',
  },
  {
    title: 'A plan for edges, corners and access',
    detail: 'Fixing surfaces, returns, and how you will open or clean the space are decided before anyone starts drilling.',
  },
  {
    title: 'Clear fitting scope before work begins',
    detail: 'The written quote lists measured openings, included labour, and exclusions so you can compare vendors fairly.',
  },
] as const;

export function HeroPromiseChips({
  items,
  inverse = false,
}: {
  readonly items: readonly string[];
  readonly inverse?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <li
          key={item}
          className={
            inverse
              ? 'rounded-(--radius-card) border border-white/20 bg-black/20 px-3 py-3 text-sm leading-snug text-white/90'
              : 'rounded-(--radius-card) border border-ink-200 bg-white px-3 py-3 text-sm leading-snug text-ink-700'
          }
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export function heroPromiseItems(target: PageTarget): readonly string[] {
  const place = locationLabel(target.location);
  const service = target.service?.shortName;

  return [
    service
      ? `${service} measured to your opening, edges and fixing points`
      : 'A fit for your opening — measurements, edges and fixing points',
    'Options for everyday living — view, access, children, birds or sports',
    place
      ? `Local specification notes for ${place}`
      : 'Find your city and neighbourhood pages',
  ];
}

export interface ThoughtfulFittingProps {
  readonly service?: Service | undefined;
  readonly placeLabel?: string;
  readonly image?: ImageRecord | undefined;
}

/**
 * EverSafe “thoughtful fitting” band — purpose-first, then materials and access.
 */
export function ThoughtfulFitting({ service, placeLabel, image }: ThoughtfulFittingProps) {
  const photo =
    image ??
    (service ? getPrimaryImageForService(service.id) : undefined) ??
    getImageById('img-invisible-grills-05') ??
    getImageById('img-hero-home');

  const heading = service
    ? `Thoughtful ${service.shortName.toLowerCase()} fitting. A space that still feels like yours.`
    : 'Thoughtful fitting. A space that still feels like yours.';

  const lede = service
    ? `A balcony, a window and a utility opening each need a different ${service.shortName.toLowerCase()} approach${
        placeLabel ? ` in ${placeLabel}` : ''
      }. We consider how you use the space, where the fitting can be secured, and how you will access it afterwards.`
    : 'A balcony, a utility opening and a practice area each need a different approach. We consider how the space is used, where the fitting can be secured and how you will access it afterwards.';

  const points =
    service && service.benefits.length > 0
      ? service.benefits.slice(0, 3).map((benefit) => ({
          title: benefit.title,
          detail: benefit.detail,
        }))
      : DEFAULT_FITTING_POINTS;

  return (
    <section id="thoughtful-fitting" className="border-y border-ink-200 bg-white py-14 lg:py-16">
      <Container width="wide">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold tracking-widest text-brand-800 uppercase">
              Planned around your opening
            </p>
            <h2 className="mt-2 text-2xl font-bold text-ink-900 sm:text-3xl">{heading}</h2>
            <p className="mt-4 text-base leading-relaxed text-ink-600">{lede}</p>
            <ul className="mt-6 space-y-4">
              {points.map((point) => (
                <li key={point.title} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-500 text-xs font-bold text-accent-ink"
                  >
                    ✓
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{point.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-600">{point.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {photo ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-(--radius-media) bg-ink-100 shadow-(--shadow-raised)">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

function fittingHref(target: PageTarget, service: Service, intentSlug?: string): string {
  const { state, city, area } = target.location ?? {};
  if (intentSlug) {
    if (state && city && area) {
      return serviceInAreaIntentPath(service, state, city, area, { slug: intentSlug });
    }
    if (state && city) {
      return serviceInCityIntentPath(service, state, city, { slug: intentSlug });
    }
    return serviceIntentPath(service, { slug: intentSlug });
  }
  if (state && city && area) return serviceInAreaPath(service, state, city, area);
  if (state && city) return serviceInCityPath(service, state, city);
  return servicePath(service);
}

function blurbFor(label: string, service: Service): string {
  const lower = label.toLowerCase();
  if (lower.includes('child') || lower.includes('kids')) {
    return `Fitting options for balcony, window and staircase openings in family homes.`;
  }
  if (lower.includes('pet') || lower.includes('cat')) {
    return `Netting or cables planned around railings and openings your pet actually uses.`;
  }
  if (lower.includes('pigeon') || lower.includes('bird')) {
    return `Full-opening bird netting for balconies, ducts, terraces and utility spaces.`;
  }
  if (lower.includes('monkey')) {
    return `Outdoor netting for monkey-prone openings, with attachments assessed for the site.`;
  }
  if (lower.includes('cloth') || lower.includes('hanger')) {
    return `Ceiling-mounted rods and pulley systems that free floor space for everyday drying.`;
  }
  if (lower.includes('cricket') || lower.includes('sports')) {
    return `Side and overhead netting for batting and bowling practice at home or school.`;
  }
  if (lower.includes('staircase')) {
    return `Netting measured for open stair sides, railing gaps and internal voids.`;
  }
  if (lower.includes('duct')) {
    return `Coverage for shafts, ventilation spaces and utility openings where birds enter.`;
  }
  if (lower.includes('transparent')) {
    return `Lower-visibility netting where light and the view are part of the fitting plan.`;
  }
  return service.summary;
}

export interface RelatedFittingWaysProps {
  readonly target: PageTarget;
  readonly compact?: boolean;
}

/**
 * EverSafe “more ways to make your space work” — taxonomy variants or sibling
 * services, linked to the current city/area when the URL has one.
 */
export function RelatedFittingWays({ target, compact = false }: RelatedFittingWaysProps) {
  const service = target.service;
  const place = locationLabel(target.location);
  const limit = compact ? 6 : 9;
  const usedImages = new Set<string>();

  const cards: {
    readonly title: string;
    readonly detail: string;
    readonly href: string;
    readonly image?: ImageRecord;
  }[] = [];

  if (service) {
    const family = SERVICE_TAXONOMY.find((entry) => entry.serviceSlug === service.slug);
    const pool = getImagesForService(service.id, 16);
    const children = family?.children.filter((child) => child.intentSlug !== target.intent?.slug) ?? [];

    for (const child of children) {
      if (cards.length >= limit) break;
      const image = pool.find((entry) => !usedImages.has(entry.id)) ?? pool[cards.length % Math.max(pool.length, 1)];
      if (image) usedImages.add(image.id);
      cards.push({
        title: child.label,
        detail: blurbFor(child.label, service),
        href: fittingHref(target, service, child.intentSlug),
        ...(image ? { image } : {}),
      });
    }
  }

  if (cards.length < 4) {
    for (const sibling of getServices()) {
      if (cards.length >= limit) break;
      if (sibling.id === service?.id) continue;
      const image = getPrimaryImageForService(sibling.id);
      cards.push({
        title: sibling.name,
        detail: sibling.summary,
        href: fittingHref(target, sibling),
        ...(image ? { image } : {}),
      });
    }
  }

  if (cards.length === 0) return null;

  return (
    <section id="related-ways" className="border-b border-ink-200 bg-ink-50 py-14 lg:py-16">
      <Container width="wide">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-widest text-brand-800 uppercase">
            More ways to make your space work
          </p>
          <h2 className="mt-2 text-2xl font-bold text-ink-900 sm:text-3xl">
            {service
              ? `${service.shortName} options${place ? ` in ${place}` : ''}`
              : 'Explore all our home, building and practice-area services'}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-600">
            Start with the job the opening needs to do. Each page keeps its own specification notes
            — not a copied national paragraph.
          </p>
        </div>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <li key={card.href}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-(--radius-card) border border-ink-200/80 bg-white shadow-(--shadow-card) transition-shadow hover:shadow-(--shadow-raised)">
                {card.image ? (
                  <div className="relative aspect-[16/10] bg-ink-100">
                    <Image
                      src={card.image.src}
                      alt={card.image.alt}
                      fill
                      sizes="(min-width: 1024px) 30vw, 50vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-semibold text-ink-900">
                    <Link
                      href={card.href}
                      data-no-underline=""
                      className="no-underline after:absolute after:inset-0 hover:text-brand-800"
                    >
                      {card.title}
                    </Link>
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600">{card.detail}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
