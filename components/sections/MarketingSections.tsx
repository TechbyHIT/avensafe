import Link from 'next/link';
import Image from 'next/image';
import { STATIC_ROUTES } from '@/config/routes';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { getImageById, getPrimaryImageForService } from '@/lib/data/repository';
import { serviceIntentPath, servicePath } from '@/lib/routing/url';
import type { ImageRecord, Service } from '@/lib/data/schemas';

export interface ServiceShowcaseProps {
  readonly services: readonly Service[];
  readonly imageForService: (serviceId: string) => ImageRecord | undefined;
}

/**
 * Service cards with photography — similar information scent to a service hub,
 * but with visual proof on each card.
 */
export function ServiceShowcase({ services, imageForService }: ServiceShowcaseProps) {
  return (
    <Section
      id="service-showcase"
      heading="Start with the result you need, then compare the fitting"
      lede="Each service page explains where it fits, what to measure, and what belongs on a written quotation before you confirm installation."
    >
      <ul className="grid gap-8 lg:grid-cols-2">
        {services.map((service) => {
          const image = imageForService(service.id);
          return (
            <li key={service.id}>
              <article className="group relative overflow-hidden rounded-(--radius-card) border border-ink-200 bg-white shadow-(--shadow-card) transition-shadow hover:shadow-(--shadow-raised)">
                {image ? (
                  <div className="relative aspect-[16/10] overflow-hidden bg-ink-100">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      sizes="(min-width: 1024px) 40rem, 100vw"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                ) : null}
                <div className="p-6">
                  <p className="text-xs font-semibold tracking-widest text-brand-700 uppercase">
                    {service.category === 'safety' ? 'Safety' : 'Utility'}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-ink-900">
                    <Link
                      href={servicePath(service)}
                      className="no-underline after:absolute after:inset-0 group-hover:text-brand-800"
                    >
                      {service.name}
                    </Link>
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-600">{service.summary}</p>
                  <p className="mt-4 text-sm font-medium text-brand-800">Compare {service.name}</p>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

export interface NeedSelectorProps {
  readonly services: readonly Service[];
}

type NeedChip = {
  readonly label: string;
  readonly href: string;
};

type NeedCard = {
  readonly title: string;
  readonly detail: string;
  readonly chips: readonly NeedChip[];
  readonly image?: ImageRecord | undefined;
};

function buildNeedCards(services: readonly Service[]): readonly NeedCard[] {
  const bySlug = new Map(services.map((service) => [service.slug, service]));
  const invisible = bySlug.get('invisible-grills');
  const nets = bySlug.get('safety-nets');
  const balcony = bySlug.get('balcony-nets');
  const birds = bySlug.get('bird-pigeon-nets');
  const sports = bySlug.get('sports-nets');
  const cloth = bySlug.get('cloth-hangers');

  return [
    {
      title: 'Keep the view open',
      detail:
        'Cable grills and transparent nets for front-facing balconies and windows where daylight and outlook matter as much as safety.',
      image:
        (invisible ? getPrimaryImageForService(invisible.id) : undefined) ??
        getImageById('img-invisible-grills-05'),
      chips: [
        ...(invisible
          ? [
              { label: invisible.shortName, href: servicePath(invisible) },
              {
                label: 'Balcony invisible grills',
                href: serviceIntentPath(invisible, { slug: 'for-balcony' }),
              },
            ]
          : []),
        ...(balcony
          ? [
              {
                label: 'Transparent balcony nets',
                href: serviceIntentPath(balcony, { slug: 'transparent-nets' }),
              },
            ]
          : []),
      ],
    },
    {
      title: 'Protect children or pets',
      detail:
        'Fall barriers planned around rail height, side returns, stair voids, and how kids or pets actually use the opening.',
      image: getImageById('img-safety-nets-08') ?? (nets ? getPrimaryImageForService(nets.id) : undefined),
      chips: [
        ...(invisible
          ? [
              {
                label: 'Child safety grills',
                href: serviceIntentPath(invisible, { slug: 'child-safety' }),
              },
              {
                label: 'Pet safety grills',
                href: serviceIntentPath(invisible, { slug: 'pet-safety' }),
              },
            ]
          : []),
        ...(nets
          ? [
              {
                label: 'Children safety nets',
                href: serviceIntentPath(nets, { slug: 'child-safety' }),
              },
              {
                label: 'Staircase nets',
                href: serviceIntentPath(nets, { slug: 'for-staircase' }),
              },
            ]
          : []),
      ],
    },
    {
      title: 'Stop birds returning',
      detail:
        'Full-opening nets and ledge control for balconies, ducts, and AC lines where pigeons keep nesting.',
      image:
        getImageById('img-safety-nets-05') ??
        (birds ? getPrimaryImageForService(birds.id) : undefined) ??
        (balcony ? getPrimaryImageForService(balcony.id) : undefined),
      chips: [
        ...(birds
          ? [
              { label: birds.shortName, href: servicePath(birds) },
              {
                label: 'Pigeon control',
                href: serviceIntentPath(birds, { slug: 'pigeon-control' }),
              },
              {
                label: 'Bird spikes',
                href: serviceIntentPath(birds, { slug: 'bird-spikes' }),
              },
            ]
          : []),
      ],
    },
    {
      title: 'Handle monkeys or hard outdoor pressure',
      detail:
        'Heavier mesh and corner fixings for homes near trees, hills, or open plots where light bird netting is not enough.',
      image: getImageById('img-safety-nets-03') ?? (nets ? getPrimaryImageForService(nets.id) : undefined),
      chips: [
        ...(nets
          ? [
              {
                label: 'Monkey safety nets',
                href: serviceIntentPath(nets, { slug: 'monkey-protection' }),
              },
            ]
          : []),
        ...(balcony
          ? [
              {
                label: 'Monkey balcony nets',
                href: serviceIntentPath(balcony, { slug: 'monkey-protection' }),
              },
            ]
          : []),
      ],
    },
    {
      title: 'Sports practice or laundry space',
      detail:
        'Containment nets for terrace practice and pulley cloth hangers that free floor space without a messy DIY look.',
      image:
        (sports ? getPrimaryImageForService(sports.id) : undefined) ??
        (cloth ? getPrimaryImageForService(cloth.id) : undefined) ??
        getImageById('img-cloth-hangers-01'),
      chips: [
        ...(sports
          ? [
              {
                label: 'Cricket practice nets',
                href: serviceIntentPath(sports, { slug: 'cricket-nets' }),
              },
            ]
          : []),
        ...(cloth
          ? [
              { label: cloth.shortName, href: servicePath(cloth) },
              {
                label: 'Ceiling hangers',
                href: serviceIntentPath(cloth, { slug: 'ceiling' }),
              },
            ]
          : []),
      ],
    },
    {
      title: 'Understand the price',
      detail:
        'Unit clarity, a written-quote checklist, and photo estimates — not a fake national ₹/sq ft band that pretends every balcony is the same.',
      image: getImageById('img-invisible-grills-07') ?? getImageById('img-hero-home'),
      chips: [
        { label: 'Pricing guide + checklist', href: STATIC_ROUTES.pricingGuide },
        { label: 'Compare systems', href: STATIC_ROUTES.compare },
        ...(invisible
          ? [
              {
                label: 'Invisible grill price factors',
                href: serviceIntentPath(invisible, { slug: 'price' }),
              },
            ]
          : []),
      ],
    },
  ];
}

export function NeedSelector({ services }: NeedSelectorProps) {
  const needs = buildNeedCards(services);

  return (
    <Section
      id="needs"
      tone="muted"
      width="wide"
      heading="What do you want the installation to solve?"
      lede="Choosing by the problem is faster than comparing product names. Pick the closest need; mesh size, cable spacing, and fixing are confirmed after measurement — then open the city or locality page for your building stock."
    >
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {needs.map((need) => (
          <li
            key={need.title}
            className="overflow-hidden rounded-(--radius-card) border border-ink-200/80 bg-white shadow-(--shadow-card)"
          >
            {need.image ? (
              <div className="relative aspect-[16/9] bg-ink-100">
                <Image
                  src={need.image.src}
                  alt={need.image.alt}
                  fill
                  sizes="(min-width: 640px) 45vw, 100vw"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            ) : null}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-ink-900">{need.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{need.detail}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {need.chips.map((chip) => (
                  <li key={`${need.title}-${chip.href}`}>
                    <Link
                      href={chip.href}
                      className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800 no-underline hover:bg-brand-100"
                    >
                      {chip.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export interface PhotoMosaicProps {
  readonly images: readonly ImageRecord[];
}

export function PhotoMosaic({ images }: PhotoMosaicProps) {
  if (images.length === 0) return null;

  const featured = images.slice(0, 12);

  return (
    <Section
      id="gallery-preview"
      tone="muted"
      width="wide"
      heading="A glimpse of our recent installations"
      lede="Clean finishing and premium materials on every project — real site photography across balconies, windows, ducts and terraces."
    >
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {featured.map((image, index) => (
          <li
            key={`${image.id}-${index}`}
            className={index === 0 ? 'col-span-2 row-span-2' : ''}
          >
            <div
              className={
                index === 0
                  ? 'relative aspect-[4/3] h-full min-h-[14rem] overflow-hidden rounded-(--radius-media) border border-ink-200/80 bg-ink-100 shadow-(--shadow-card) sm:min-h-[18rem]'
                  : 'relative aspect-[4/3] overflow-hidden rounded-(--radius-card) border border-ink-200/80 bg-ink-100 shadow-(--shadow-card)'
              }
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={index === 0 ? '(min-width: 1024px) 40vw, 100vw' : '(min-width: 768px) 25vw, 50vw'}
                className="object-cover"
                loading={index < 2 ? 'eager' : 'lazy'}
              />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-center">
        <Link
          href={STATIC_ROUTES.gallery}
          data-no-underline=""
          className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-3 text-sm font-bold text-white no-underline hover:bg-ink-800"
        >
          Browse the full gallery
          <span aria-hidden="true">→</span>
        </Link>
      </p>
    </Section>
  );
}

const PROCESS = [
  {
    step: '01',
    title: 'Share the opening',
    detail: 'Send a clear photo, your city, and whether the priority is children, pets, birds, visibility, or sports use.',
    imageId: 'img-invisible-grills-03',
  },
  {
    step: '02',
    title: 'Measure and check',
    detail: 'We confirm dimensions, fixing surfaces, access, and how the space is used day to day.',
    imageId: 'img-duct-area-safety-nets-03',
  },
  {
    step: '03',
    title: 'Compare the estimate',
    detail: 'Review material grade, spacing, included installation, warranty terms, and the price unit in writing.',
    imageId: 'img-cloth-hangers-02',
  },
  {
    step: '04',
    title: 'Install and inspect',
    detail: 'Fit the chosen system, check edges and tension, and walk through basic care before handover.',
    imageId: 'img-building-covering-safety-nets-02',
  },
] as const;

export function InstallProcess() {
  return (
    <Section id="process" tone="muted" heading="From one photo to a checked fitting" width="wide">
      <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PROCESS.map((item) => {
          const image = getImageById(item.imageId);
          return (
            <li
              key={item.step}
              className="overflow-hidden rounded-(--radius-card) border border-ink-200/80 bg-white shadow-(--shadow-card)"
            >
              {image ? (
                <div className="relative aspect-[4/3] bg-ink-100">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1024px) 20vw, 50vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
              ) : null}
              <div className="p-5">
                <p className="text-xs font-bold tracking-widest text-brand-700">{item.step}</p>
                <h3 className="mt-2 text-base font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{item.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

const COMPARE = [
  {
    name: 'Invisible grill',
    use: 'Balconies and windows where the view matters most',
    look: 'Slim vertical stainless cables in a powder-coated frame',
    imageId: 'img-invisible-grills-05',
  },
  {
    name: 'Transparent balcony net',
    use: 'Fall or bird control with lower visual weight than standard mesh',
    look: 'Low-visibility strands in a square pattern',
    imageId: 'img-safety-nets-08',
  },
  {
    name: 'Balcony / child safety net',
    use: 'Everyday fall-risk openings and denser rail coverage',
    look: 'Visible mesh with a bordered perimeter rope',
    imageId: 'img-safety-nets-01',
  },
  {
    name: 'Pigeon / anti-bird net',
    use: 'Balconies, ducts, shafts, and ledges where birds return',
    look: 'Fine full-opening mesh around entry points',
    imageId: 'img-safety-nets-05',
  },
  {
    name: 'Monkey-grade net',
    use: 'Homes near trees, hills, or open plots with animal pressure',
    look: 'Heavier denier mesh with reinforced corners',
    imageId: 'img-safety-nets-03',
  },
  {
    name: 'Sports containment net',
    use: 'Terraces, turf grounds, and practice lanes',
    look: 'Heavy braided panels on galvanised posts with impact zones',
    imageId: 'img-sports-nets-01',
  },
  {
    name: 'Ceiling cloth hanger',
    use: 'Utility areas and balconies without floor space for drying',
    look: 'Pulley rails or retractable lines fixed to slab or wall',
    imageId: 'img-cloth-hangers-01',
  },
] as const;

export function ProductCompare() {
  return (
    <Section
      id="compare"
      width="wide"
      heading="Compare the look and the job it needs to do"
      lede="Pick by the opening and the outcome — then confirm grade and spacing on survey."
    >
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {COMPARE.map((row) => {
          const image = getImageById(row.imageId);
          return (
            <li
              key={row.name}
              className="overflow-hidden rounded-(--radius-card) border border-ink-200/80 bg-white shadow-(--shadow-card)"
            >
              {image ? (
                <div className="relative aspect-[16/10] bg-ink-100">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1280px) 20vw, (min-width: 640px) 40vw, 100vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
              ) : null}
              <div className="p-4">
                <h3 className="text-base font-semibold text-ink-900">{row.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{row.use}</p>
                <p className="mt-2 text-xs leading-relaxed text-ink-500">{row.look}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-base text-ink-700">
        Ask for mesh or cable size, anchor method, included installation, minimum job charge, and warranty
        terms before confirming any price.{' '}
        <Link href={STATIC_ROUTES.compare} className="font-semibold text-brand-800">
          Open the full compare hub
        </Link>
        .
      </p>
    </Section>
  );
}

export interface FeaturedCitiesProps {
  readonly cities: readonly {
    readonly name: string;
    readonly href: string;
    readonly note: string;
    readonly image?: ImageRecord | undefined;
  }[];
}

const CITY_IMAGE_ROTATION = [
  'img-hero-home',
  'img-invisible-grills-05',
  'img-safety-nets-03',
  'img-invisible-grills-03',
  'img-safety-nets-05',
  'img-invisible-grills-01',
  'img-cloth-hangers-01',
  'img-duct-area-safety-nets-01',
  'img-sports-nets-01',
  'img-building-covering-safety-nets-01',
  'img-invisible-grills-08',
  'img-safety-nets-08',
  'img-cloth-hangers-03',
  'img-duct-area-safety-nets-05',
  'img-invisible-grills-12',
  'img-safety-nets-12',
  'img-sports-nets-02',
  'img-building-covering-safety-nets-03',
  'img-cloth-hangers-06',
  'img-duct-area-safety-nets-10',
  'img-invisible-grills-14',
  'img-safety-nets-14',
  'img-cloth-hangers-08',
  'img-duct-area-safety-nets-14',
] as const;

export function FeaturedCities({ cities }: FeaturedCitiesProps) {
  return (
    <Section
      id="featured-cities"
      tone="muted"
      width="wide"
      heading="Find installation support in your city"
      lede="Each city page groups the services and localities we cover — including Andhra Pradesh belts from Visakhapatnam to Nellore."
    >
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city, index) => {
          const image =
            city.image ?? getImageById(CITY_IMAGE_ROTATION[index % CITY_IMAGE_ROTATION.length]!);
          return (
            <li key={city.href}>
              <Link
                href={city.href}
                data-no-underline=""
                className="block overflow-hidden rounded-(--radius-card) border border-ink-200/80 bg-white no-underline shadow-(--shadow-card) transition-shadow hover:shadow-(--shadow-raised)"
              >
                {image ? (
                  <div className="relative aspect-[16/10] bg-ink-100">
                    <Image
                      src={image.src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 30vw, 50vw"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-ink-900">
                    Safety installations in {city.name}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-600">
                    {city.note}
                  </p>
                  <p className="mt-3 text-sm font-medium text-brand-800">
                    Explore {city.name} areas and services →
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-6">
        <Link href={STATIC_ROUTES.serviceAreas} className="font-medium text-brand-800">
          View all service cities
        </Link>
      </p>
    </Section>
  );
}

export function PageImageGallery({
  images,
  heading = 'Project gallery',
  maxImages = 16,
}: {
  readonly images: readonly ImageRecord[];
  readonly heading?: string;
  readonly maxImages?: number;
}) {
  if (images.length === 0) return null;

  const shown = images.slice(0, maxImages);

  return (
    <div className="border-y border-ink-200 bg-ink-50">
      <Container width="wide" className="py-12 lg:py-16">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold tracking-widest text-accent-700 uppercase">
            Our work
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            {heading}
          </h2>
          <p className="mt-2 text-sm text-ink-600">
            Installation photography from comparable openings — used to judge finish quality before you book a survey.
          </p>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {shown.map((image, index) => (
            <li
              key={`${image.id}-${index}`}
              className={
                index === 0
                  ? 'relative col-span-2 aspect-[16/10] overflow-hidden rounded-(--radius-media) border border-ink-200/80 bg-ink-100 shadow-(--shadow-card) md:col-span-2'
                  : 'relative aspect-[4/3] overflow-hidden rounded-(--radius-card) border border-ink-200/80 bg-ink-100 shadow-(--shadow-card)'
              }
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={
                  index === 0
                    ? '(min-width: 1024px) 40vw, 100vw'
                    : '(min-width: 1024px) 20vw, 50vw'
                }
                className="object-cover"
                loading="lazy"
              />
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
