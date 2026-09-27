import Image from 'next/image';
import Link from 'next/link';
import { STATIC_ROUTES } from '@/config/routes';
import { Container } from '@/components/ui/Container';
import { getPrimaryImageForService } from '@/lib/data/repository';
import type { Service } from '@/lib/data/schemas';
import { servicePath } from '@/lib/routing/url';

export interface PrimaryServicesSpotlightProps {
  readonly services: readonly Service[];
}

/**
 * EverSafe-style numbered hero services (01–03) with photography — the first
 * decision layer before the full service grid.
 */
export function PrimaryServicesSpotlight({ services }: PrimaryServicesSpotlightProps) {
  const spotlight = services.slice(0, 3);
  if (spotlight.length === 0) return null;

  return (
    <section id="primary-services" className="border-b border-ink-200 bg-white py-14 lg:py-16">
      <Container width="wide">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-widest text-brand-800 uppercase">
            Your space · the right protection
          </p>
          <h2 className="mt-2 text-2xl font-bold text-ink-900 sm:text-3xl">
            Start with what the installation should do
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-600">
            Balcony safety, bird control, and slim cable grills are the three most common starting
            points. Each opens its own hub with photos, locality pages, and written-quote guidance —
            deeper than a single national brochure.
          </p>
        </div>

        <ol className="mt-10 grid gap-6 lg:grid-cols-3">
          {spotlight.map((service, index) => {
            const image = getPrimaryImageForService(service.id);
            const step = String(index + 1).padStart(2, '0');
            return (
              <li key={service.id}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-(--radius-card) border border-ink-200/80 bg-ink-50/40 shadow-(--shadow-card) transition-shadow hover:shadow-(--shadow-raised)">
                  {image ? (
                    <div className="relative aspect-[16/10] bg-ink-100">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(min-width: 1024px) 30vw, 100vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        loading={index === 0 ? 'eager' : 'lazy'}
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-6">
                    <span className="text-xs font-bold tracking-widest text-accent-700">{step}</span>
                    <h3 className="mt-2 text-xl font-semibold text-ink-900">
                      <Link
                        href={servicePath(service)}
                        data-no-underline=""
                        className="no-underline after:absolute after:inset-0 hover:text-brand-800"
                      >
                        {service.name}
                      </Link>
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-600">
                      {service.summary}
                    </p>
                    <p className="mt-4 text-sm font-semibold text-brand-800">
                      Explore {service.shortName} →
                    </p>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>

        <p className="mt-8 text-center text-sm text-ink-600">
          <Link
            href={STATIC_ROUTES.services}
            data-no-underline=""
            className="inline-flex items-center gap-2 rounded-full border border-ink-300 bg-white px-5 py-2.5 font-semibold text-brand-800 no-underline hover:border-brand-400"
          >
            All installation services
            <span aria-hidden="true">→</span>
          </Link>
        </p>
      </Container>
    </section>
  );
}
