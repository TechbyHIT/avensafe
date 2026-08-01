import type { Metadata } from 'next';
import Link from 'next/link';
import { business, mailtoHref, telHref } from '@/config/business';
import { STATIC_ROUTES } from '@/config/routes';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ContactActions } from '@/components/layout/ContactActions';
import { JsonLd } from '@/components/layout/JsonLd';
import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { getServices, getStates } from '@/lib/data/repository';
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

export function generateMetadata(): Metadata {
  return buildMetadata({ title: TITLE, description: DESCRIPTION, path: STATIC_ROUTES.contact });
}

export default function ContactPage() {
  const services = getServices();
  const stateNames = getStates().map((state) => state.name);

  return (
    <>
      <JsonLd
        graph={buildGraph([
          contactPageSchema(DESCRIPTION),
          breadcrumbSchema(CRUMBS, STATIC_ROUTES.contact),
        ])}
      />
      <Breadcrumbs crumbs={CRUMBS} />

      <div className="bg-linear-to-b from-ink-50 to-white py-14">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[3fr_2fr]">
            <div>
              <h1 className="text-3xl sm:text-4xl">Tell us about the job</h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-600">
                The more you can tell us up front — which floor, roughly how wide the balcony is, and
                what you are trying to prevent — the more useful our first reply will be. For
                anything structural we will still want to see it before quoting a firm price.
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
                <h2 className="text-lg">Faster by phone</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                  If you would rather talk it through, call or message us. We answer during working
                  hours and call back outside them.
                </p>
                <div className="mt-4">
                  <ContactActions layout="stack" />
                </div>
              </div>

              <div className="rounded-(--radius-card) border border-ink-200 bg-white p-6">
                <h2 className="text-base">All contact details</h2>
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

      <Section tone="muted" width="prose" heading="What happens after you get in touch">
        <ol className="space-y-5">
          {[
            {
              title: 'We call you back',
              detail:
                'Usually the same working day. We will ask a few questions to work out whether the job needs a survey or can be quoted from measurements.',
            },
            {
              title: 'Survey, if the work is structural',
              detail:
                'About twenty minutes. We measure every bay, check what we would be fixing into, and confirm whether your association needs to approve anything.',
            },
            {
              title: 'A written quotation',
              detail:
                'Stating the measured area, the hardware grade, the spacing in millimetres, the anchor type and the warranty — plus anything excluded, so there are no surprises later.',
            },
            {
              title: 'Installation and handover',
              detail:
                'We gauge the gaps, spot-check tension and show you the annual check before we leave. Cable systems get a follow-up tension check after they settle.',
            },
          ].map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-semibold text-brand-800"
              >
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-600">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
