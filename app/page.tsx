import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { business, primaryPhone, telHref, whatsappHref, whatsappPhone } from '@/config/business';
import { STATIC_ROUTES } from '@/config/routes';
import { JsonLd } from '@/components/layout/JsonLd';
import { AboutShowcase } from '@/components/sections/AboutShowcase';
import { CtaSection } from '@/components/sections/CtaSection';
import { ExplainFeatureBlocks } from '@/components/sections/ExplainFeatureBlocks';
import { FaqSection } from '@/components/sections/FaqSection';
import { HomeHero } from '@/components/sections/HomeHero';
import {
  FeaturedCities,
  InstallProcess,
  NeedSelector,
  PhotoMosaic,
  ProductCompare,
} from '@/components/sections/MarketingSections';
import {
  buildCoreServiceCards,
  buildTaxonomyServiceCards,
  ServiceImageCards,
} from '@/components/sections/ServiceImageCards';
import { ServiceTaxonomy } from '@/components/sections/ServiceTaxonomy';
import { Testimonials } from '@/components/sections/Testimonials';
import { LinkCard } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import {
  findFaqs,
  getCities,
  getCornerstoneGuides,
  getCorpusStats,
  getHomeGalleryImages,
  getImageById,
  getPrimaryImageForService,
  getServices,
  getStates,
  getTestimonials,
} from '@/lib/data/repository';
import { cityPath, guidePath, servicePath, statePath } from '@/lib/routing/url';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema/builders';
import { buildGraph } from '@/lib/schema/graph';

export const revalidate = 21600;

const TITLE = `Premium Invisible Grills & Safety Nets | ${business.shortName}`;
const DESCRIPTION =
  'Professional invisible grills, balcony safety nets, pigeon nets, sports nets and cloth hangers — measured, specified and installed across South and West India. Free site inspection and written quotes.';

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: STATIC_ROUTES.home,
    image: getImageById('img-invisible-grills-05') ?? getImageById('img-hero-home'),
  });
}

const FEATURED_CITY_SLUGS = [
  'hyderabad',
  'warangal',
  'karimnagar',
  'nizamabad',
  'khammam',
  'bengaluru',
  'mysuru',
  'mangaluru',
  'hubballi',
  'belagavi',
  'chennai',
  'coimbatore',
  'madurai',
  'tiruchirappalli',
  'salem',
  'tiruppur',
  'kochi',
  'thiruvananthapuram',
  'kozhikode',
  'thrissur',
  'pune',
  'mumbai',
  'thane',
  'navi-mumbai',
  'nashik',
  'nagpur',
  'aurangabad',
  'visakhapatnam',
  'vijayawada',
  'guntur',
  'tirupati',
  'kakinada',
  'nellore',
  'bhubaneswar',
  'cuttack',
  'berhampur',
  'rourkela',
  'sambalpur',
  'panaji',
  'margao',
] as const;

const WHY_US = [
  {
    title: 'Installing since 2016',
    detail: 'Survey and fixing habits built from years of real openings — not a product brochure alone.',
    imageId: 'img-invisible-grills-01',
  },
  {
    title: 'Eight-state coverage',
    detail: 'AP, Telangana, Karnataka, Tamil Nadu, Kerala, Maharashtra, Odisha, and Goa with city-level pages.',
    imageId: 'img-hero-home',
  },
  {
    title: 'Problem-first fitting',
    detail: 'View, children, birds, monkeys, sports, or laundry — we route you to the right system first.',
    imageId: 'img-sports-nets-01',
  },
  {
    title: 'Named materials on quote',
    detail: 'Cable grade, mesh polymer, and hardware are written down — not left as generic “stainless”.',
    imageId: 'img-invisible-grills-07',
  },
  {
    title: 'Survey before firm price',
    detail: 'Itemised quotes after measurement so grade, spacing, access, and warranty stay comparable.',
    imageId: 'img-duct-area-safety-nets-01',
  },
  {
    title: 'Locality-level guidance',
    detail: 'Thousands of area pages explain building stock and climate — not one recycled city blurb.',
    imageId: 'img-building-covering-safety-nets-01',
  },
  {
    title: 'Family safety options',
    detail: 'Child-safe and pet-safe spacing designed around how you actually use the balcony.',
    imageId: 'img-safety-nets-08',
  },
  {
    title: 'After-sales support',
    detail: 'Re-tension and maintenance guidance when materials and access allow a return visit.',
    imageId: 'img-cloth-hangers-02',
  },
] as const;

export default function HomePage() {
  const services = getServices();
  const states = getStates();
  const guides = getCornerstoneGuides();
  const stats = getCorpusStats();
  const faqs = findFaqs({ scopes: ['global', 'pricing', 'service'] }).slice(0, 10);
  const mosaicImages = getHomeGalleryImages(12);
  const heroImage =
    getImageById('img-invisible-grills-05') ?? getImageById('img-hero-home');
  const aboutImages = [
    getImageById('img-invisible-grills-01'),
    getImageById('img-invisible-grills-05'),
    getImageById('img-hero-home'),
  ].filter((image): image is NonNullable<typeof image> => Boolean(image));
  const coreServiceCards = buildCoreServiceCards(services);
  const taxonomyServiceCards = buildTaxonomyServiceCards(12);

  const citiesBySlug = new Map(getCities().map((city) => [city.slug, city]));
  const featuredCities = FEATURED_CITY_SLUGS.flatMap((slug) => {
    const city = citiesBySlug.get(slug);
    if (!city) return [];
    const state = states.find((entry) => entry.id === city.stateId);
    if (!state) return [];
    return [
      {
        name: city.name,
        href: cityPath(state, city),
        note: city.localConsiderations,
      },
    ];
  });

  const invisible = services.find((entry) => entry.slug === 'invisible-grills');
  const safetyNets = services.find((entry) => entry.slug === 'safety-nets');

  const explainBlocks = [
    invisible
      ? {
          eyebrow: 'Most popular',
          title: 'Invisible Grills – uninterrupted views, total safety',
          body: 'Premium stainless cable systems that protect balconies and windows without blocking your view.',
          points: [
            'Marine-grade SS 316 high-tension cables where coastal air demands it',
            'Child-safe & pet-safe spacing options',
            'Almost invisible from a few feet away',
            'Rust-resistant, low-maintenance framing',
            'Custom-fitted for balconies, windows & high-rises',
          ],
          href: servicePath(invisible),
          ctaLabel: `Explore ${invisible.name}`,
          image: getPrimaryImageForService(invisible.id),
        }
      : null,
    safetyNets
      ? {
          eyebrow: 'Family favourite',
          title: 'Safety Nets – affordable protection that blends in',
          body: 'UV-stabilised nets for balconies, terraces and open areas to protect family and property.',
          points: [
            'UV-stabilised HDPE & nylon nets',
            'Ideal for children, pets and bird control',
            'Transparent mesh that preserves daylight',
            'Corrosion-resistant hooks and even tensioning',
            'Quick, clean and budget-friendly installation',
          ],
          href: servicePath(safetyNets),
          ctaLabel: `Explore ${safetyNets.name}`,
          image: getPrimaryImageForService(safetyNets.id),
        }
      : null,
  ].filter((block): block is NonNullable<typeof block> => Boolean(block));

  return (
    <>
      <JsonLd
        graph={buildGraph([
          webPageSchema({
            name: TITLE,
            description: DESCRIPTION,
            path: STATIC_ROUTES.home,
            primaryImage: heroImage,
            hasBreadcrumb: false,
          }),
          breadcrumbSchema([{ label: 'Home', href: STATIC_ROUTES.home }], STATIC_ROUTES.home),
        ])}
      />

      <HomeHero image={heroImage} />

      <NeedSelector services={services} />

      <AboutShowcase
        images={aboutImages}
        statsLabel={`${stats.states} states and ${stats.cities} cities`}
      />

      <ServiceImageCards
        cards={coreServiceCards}
        eyebrow="Core services"
        heading="Eight product families with real install photos"
        lede="Invisible grills, balcony and bird nets, sports nets, cloth hangers, duct and building covering — each card opens its own hub."
        id="core-services"
      />

      <ServiceImageCards
        cards={taxonomyServiceCards}
        eyebrow="Popular solutions"
        heading="Complete home & building safety solutions"
        lede="From invisible grills to safety nets, bird protection and cloth hangers — compare the right fit, then book a free survey."
        id="services"
      />

      <ExplainFeatureBlocks blocks={explainBlocks} />

      <ServiceTaxonomy />

      <ProductCompare />

      <Section id="why-us" tone="muted" heading="Trusted by families & businesses" width="wide">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_US.map((item) => {
            const image = getImageById(item.imageId);
            return (
              <li
                key={item.title}
                className="overflow-hidden rounded-(--radius-card) border border-ink-200/80 bg-white shadow-(--shadow-card)"
              >
                {image ? (
                  <div className="relative aspect-[16/10] bg-ink-100">
                    <Image
                      src={image.src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 22vw, 50vw"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <div className="p-5">
                  <h3 className="text-base font-bold text-ink-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">{item.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Section>

      <InstallProcess />

      {featuredCities.length > 0 ? <FeaturedCities cities={featuredCities} /> : null}

      <PhotoMosaic
        images={
          mosaicImages.length > 0
            ? mosaicImages
            : (() => {
                const hero = getImageById('img-hero-home');
                return hero ? [hero] : [];
              })()
        }
      />

      <Testimonials testimonials={getTestimonials()} />

      <Section
        id="guides"
        tone="muted"
        heading="Read before you decide"
        lede="Guides covering pricing, materials, installation and safety — useful whether or not you buy from us."
      >
        <ul className="grid gap-5 sm:grid-cols-2">
          {guides.map((guide) => (
            <li key={guide.id}>
              <LinkCard
                href={guidePath(guide)}
                title={guide.heading}
                description={guide.excerpt}
                meta={`${guide.readingMinutes} min read`}
              />
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="areas"
        heading="Where we work"
        lede="Each state page explains climate and building stock; city and locality pages carry unique specification guidance."
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {states.map((state) => (
            <li key={state.id}>
              <LinkCard href={statePath(state)} title={state.name} />
            </li>
          ))}
        </ul>
      </Section>

      <FaqSection faqs={faqs} heading="Frequently asked questions" />

      <Section id="quote-cta" tone="muted" width="wide">
        <div className="rounded-(--radius-card) bg-brand-900 px-6 py-10 text-white shadow-(--shadow-raised) sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Request your free quote</h2>
              <p className="mt-3 max-w-xl text-base text-white/85">
                Send a photo of the opening and your city. We reply on WhatsApp or call you back with
                the right system and what should appear on a written quotation.
              </p>
              <ul className="mt-5 grid grid-cols-2 gap-2 text-sm text-white/90">
                <li>✓ Free site inspection</li>
                <li>✓ Transparent itemised pricing</li>
                <li>✓ Premium materials</li>
                <li>✓ Certified technicians</li>
              </ul>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a
                href={whatsappHref(
                  `Hello ${business.shortName}, I want an estimate. I will share a photo of the opening and my city/PIN.`,
                  whatsappPhone,
                )}
                className="inline-flex items-center justify-center rounded-full bg-accent-500 px-6 py-3.5 text-center text-sm font-bold text-accent-ink no-underline shadow-(--shadow-accent) hover:bg-accent-600"
              >
                Send a Photo for Estimate
              </a>
              <a
                href={telHref(primaryPhone)}
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3.5 text-center text-sm font-bold text-white no-underline hover:bg-white/10"
              >
                Call {primaryPhone.display}
              </a>
              <Link
                href={STATIC_ROUTES.contact}
                className="text-center text-sm font-semibold text-white/90 underline-offset-4 hover:underline"
              >
                Or use the enquiry form
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <CtaSection enquiryContext="Homepage enquiry" />
    </>
  );
}
