import type { Metadata } from 'next';
import Link from 'next/link';
import { business } from '@/config/business';
import { STATIC_ROUTES } from '@/config/routes';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/layout/JsonLd';
import { CtaSection } from '@/components/sections/CtaSection';
import { Hero } from '@/components/sections/Hero';
import {
  FeaturedCities,
  InstallProcess,
  NeedSelector,
  ProductCompare,
} from '@/components/sections/MarketingSections';
import { EnquiryPhotoCallout } from '@/components/sections/LocationPageEnhancements';
import { Section } from '@/components/ui/Section';
import { getCities, getCitiesByState, getCorpusStats, getImageById, getServices, getStates } from '@/lib/data/repository';
import { cityPath, statePath } from '@/lib/routing/url';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema/builders';
import { buildGraph } from '@/lib/schema/graph';
import { buildMetadata } from '@/lib/seo/metadata';

/**
 * The hub for the whole location tree. Its purpose is as much structural as
 * editorial: it gives every state page a parent, which is what keeps the deep
 * location URLs reachable from the home page in three clicks.
 */
export const revalidate = 43200; // REVALIDATE.static

const TITLE = `Service Areas | ${business.shortName}`;
const DESCRIPTION =
  'The states, cities and localities we install in across South and West India, and how local climate and building types change what we specify.';

const CRUMBS = [
  { label: 'Home', href: STATIC_ROUTES.home },
  { label: 'Service areas', href: STATIC_ROUTES.serviceAreas },
];

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: STATIC_ROUTES.serviceAreas,
  });
}

export default function ServiceAreasPage() {
  const states = getStates();
  const stats = getCorpusStats();
  const services = getServices();

  const citiesBySlug = new Map(getCities().map((city) => [city.slug, city]));
  const featuredSlugs = ['hyderabad', 'bengaluru', 'chennai', 'pune', 'mumbai', 'visakhapatnam'] as const;
  const featuredCities = featuredSlugs.flatMap((slug) => {
    const city = citiesBySlug.get(slug);
    if (!city) return [];
    const state = states.find((entry) => entry.id === city.stateId);
    if (!state) return [];
    return [{ name: city.name, href: cityPath(state, city), note: city.localConsiderations }];
  });

  return (
    <>
      <JsonLd
        graph={buildGraph([
          webPageSchema({
            name: TITLE,
            description: DESCRIPTION,
            path: STATIC_ROUTES.serviceAreas,
          }),
          breadcrumbSchema(CRUMBS, STATIC_ROUTES.serviceAreas),
        ])}
      />
      <Breadcrumbs crumbs={CRUMBS} />

      <Hero
        eyebrow="Coverage"
        heading="Where we work, and why location changes the specification"
        lede={`We cover ${stats.states} states, ${stats.cities} cities and ${stats.areas} localities. Coastal salt, monsoon intensity and building height each change the hardware we specify, so every state and city page explains what differs there rather than repeating a national pitch.`}
        image={getImageById('img-hero-home')}
      />

      <EnquiryPhotoCallout placeLabel="your city" enquiryContext="Service areas enquiry" />

      <NeedSelector services={services} />

      {featuredCities.length > 0 ? <FeaturedCities cities={featuredCities} /> : null}

      <ProductCompare />

      <InstallProcess />

      {states.map((state) => {
        const cities = getCitiesByState(state.id);
        return (
          <Section key={state.id} heading={state.name} width="wide">
            <p className="mb-6 max-w-3xl text-base leading-relaxed text-ink-600">
              {state.climateContext}
            </p>
            <p className="mb-6">
              <Link href={statePath(state)} className="text-sm font-medium text-brand-800">
                Read the full {state.name} page
              </Link>
            </p>
            <ul className="flex flex-wrap gap-2">
              {cities.map((city) => (
                <li key={city.id}>
                  <Link
                    href={cityPath(state, city)}
                    data-no-underline=""
                    className="inline-block rounded-(--radius-control) border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700 no-underline hover:border-brand-300 hover:text-brand-800"
                  >
                    {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        );
      })}

      <CtaSection />
    </>
  );
}
