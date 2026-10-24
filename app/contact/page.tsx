import type { Metadata } from 'next';
import Link from 'next/link';
import { business, mailtoHref, telHref } from '@/config/business';
import { STATIC_ROUTES } from '@/config/routes';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ContactActions } from '@/components/layout/ContactActions';
import { JsonLd } from '@/components/layout/JsonLd';
import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { CityContactGrid } from '@/components/sections/CityContactGrid';
import { HeroPromiseChips, STATIC_HERO_CHIPS } from '@/components/sections/EverSafeBlocks';
import { Hero } from '@/components/sections/Hero';
import { PageTrustStrip } from '@/components/sections/LocationPageEnhancements';
import { StaticConversionRail } from '@/components/sections/StaticConversionRail';
import { Container } from '@/components/ui/Container';
import { findFaqs, getCities, getServices, getStates } from '@/lib/data/repository';
import { breadcrumbSchema, contactPageSchema } from '@/lib/schema/builders';
import { buildGraph } from '@/lib/schema/graph';
import { buildMetadata } from '@/lib/seo/metadata';
import { joinWithAnd } from '@/lib/utils/text';

export const revalidate = 43200; // REVALIDATE.static

const TITLE = `Contact ${business.name}`;
const DESCRIPTION =
  'Call, WhatsApp or send us the details of your job. We survey before quoting, and the survey takes about twenty minutes.';

const CRUMBS = [
  { label: 'Home', href: STATIC_ROUTES.home },
  { label: 'Contact', href: STATIC_ROUTES.contact },
];

const FEATURED_CITY_SLUGS = [
  'visakhapatnam',
  'vijayawada',
  'guntur',
  'tirupati',
  'nellore',
  'kakinada',
  'rajahmundry',
  'kurnool',
] as const;

export function generateMetadata(): Metadata {
  return buildMetadata({ title: TITLE, description: DESCRIPTION, path: STATIC_ROUTES.contact });
}

export default function ContactPage() {
  const services = getServices();
  const states = getStates();
  const stateNames = states.map((state) => state.name);
  const citiesBySlug = new Map(getCities().map((city) => [city.slug, city]));
  const cityContacts = FEATURED_CITY_SLUGS.flatMap((slug) => {
    const city = citiesBySlug.get(slug);
    if (!city) return [];
    const state = states.find((entry) => entry.id === city.stateId);
    if (!state) return [];
    return [{ state, city }];
  });
  const contactFaqs = findFaqs({ scopes: ['global', 'pricing', 'location'] }).slice(0, 6);

  return (
    <>
      <JsonLd
        graph={buildGraph([
          contactPageSchema(DESCRIPTION),
          breadcrumbSchema(CRUMBS, STATIC_ROUTES.contact),
        ])}
      />
      <Breadcrumbs crumbs={CRUMBS} />

      <Hero
        eyebrow="Contact"
        heading="Let's plan your safety net installation"
        lede="Tell us what you need to protect. Call or WhatsApp with your city and opening details — balcony safety nets, pigeon nets, invisible grills, and related installations across Andhra Pradesh."
        variant="split"
        ctaEmphasis="photo"
        enquiryContext="Contact page enquiry"
      >
        <HeroPromiseChips items={STATIC_HERO_CHIPS} inverse />
      </Hero>

      <PageTrustStrip />

      <div className="bg-linear-to-b from-ink-50 to-white py-14">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[3fr_2fr]">
            <div>
              <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">
                Send your safety net requirement
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-600">
                Add your city, area, service need, and preferred visit time. We open WhatsApp with
                your details ready, or you can submit the form below.
              </p>

              <p className="mt-4 text-base text-ink-600">
                Not sure what you need yet? Read{' '}
                <Link href={STATIC_ROUTES.pricingGuide} className="font-medium text-brand-800">
                  what drives the cost of a job
                </Link>{' '}
                first.
              </p>

              <div className="mt-8 rounded-(--radius-card) border border-ink-200 bg-white p-6 shadow-(--shadow-card)">
                <EnquiryForm
                  services={services.map((service) => ({
                    slug: service.slug,
                    name: service.name,
                  }))}
                  variant="quote"
                  submitLabel="Send enquiry"
                />
              </div>
            </div>

            <aside className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-ink-900">Fast help without extra steps</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                  Phone, WhatsApp, or email during working hours — we call back if you reach us
                  outside them.
                </p>
                <div className="mt-4">
                  <ContactActions layout="stack" emphasis="photo" enquiryContext="Contact page" />
                </div>
              </div>

              <div className="rounded-(--radius-card) border border-ink-200 bg-white p-6">
                <h2 className="text-base font-semibold">All contact details</h2>
                <dl className="mt-4 space-y-4 text-sm">
                  <div>
                    <dt className="text-xs tracking-wide text-ink-500 uppercase">Phone</dt>
                    <dd className="mt-1 space-y-1.5">
                      {business.phones.map((phone) => (
                        <div key={phone.e164}>
                          <a href={telHref(phone)} className="font-medium text-brand-800">
                            {phone.display}
                          </a>
                          <span className="block text-xs text-ink-500">{phone.label}</span>
                        </div>
                      ))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs tracking-wide text-ink-500 uppercase">Email</dt>
                    <dd className="mt-1">
                      <a
                        href={mailtoHref('Website enquiry')}
                        className="font-medium text-brand-800"
                      >
                        {business.email}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs tracking-wide text-ink-500 uppercase">Hours</dt>
                    <dd className="mt-1 space-y-0.5 text-ink-600">
                      {business.openingHours.map((hours) => (
                        <div key={hours.days.join('-')}>
                          {hours.days.length > 1
                            ? `${hours.days[0]} to ${hours.days[hours.days.length - 1]}`
                            : hours.days[0]}
                          , {hours.opens}–{hours.closes}
                        </div>
                      ))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs tracking-wide text-ink-500 uppercase">Coverage</dt>
                    <dd className="mt-1 leading-relaxed text-ink-600">
                      {joinWithAnd(stateNames)}.{' '}
                      <Link href={STATIC_ROUTES.serviceAreas} className="text-brand-800">
                        See cities and localities
                      </Link>
                      .
                    </dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        </Container>
      </div>

      <CityContactGrid entries={cityContacts} heading="City & branch contacts" />

      <StaticConversionRail
        enquiryContext="Contact page enquiry"
        faqs={contactFaqs}
        faqHeading="Safety net enquiry questions"
        processVariant="compact"
        showTrustStrip={false}
        ctaHeading="WhatsApp a photo or call us"
        ctaBody="Share your city, photos of the opening, and what the installation should solve. We confirm availability and what belongs on a written quotation."
      />
    </>
  );
}
