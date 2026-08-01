import Image from 'next/image';
import Link from 'next/link';
import { SERVICE_TAXONOMY, taxonomyLabelFor } from '@/config/service-taxonomy';
import { Container } from '@/components/ui/Container';
import {
  getCitiesByState,
  getImagesForService,
  getPrimaryImageForService,
  getStates,
} from '@/lib/data/repository';
import type { SearchIntent, Service } from '@/lib/data/schemas';
import {
  serviceInCityIntentPath,
  serviceInCityPath,
  serviceIntentPath,
  statePath,
} from '@/lib/routing/url';

export interface ServiceCoverageProps {
  readonly service: Service;
  /** When set, city links go to service × city × intent (subsection scale). */
  readonly intent?: SearchIntent;
}

const CITIES_PER_STATE = 8;

/**
 * FeatherGuard-style location ladder: states as clean columns, featured cities
 * first, remainder rolled up to the state hub so pages stay scannable.
 */
export function ServiceCoverage({ service, intent }: ServiceCoverageProps) {
  const states = getStates();
  const family = SERVICE_TAXONOMY.find((entry) => entry.serviceSlug === service.slug);
  const variantLabel = intent
    ? (taxonomyLabelFor(service.slug, intent.slug) ?? intent.label)
    : service.name;
  const coverImages = getImagesForService(service.id, 3);
  const primary =
    coverImages[0] ?? getPrimaryImageForService(service.id);

  return (
    <section
      id="coverage"
      className="border-t border-ink-200 bg-ink-50 py-(--spacing-section)"
      aria-labelledby="service-coverage-heading"
    >
      <Container width="wide">
        <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div className="max-w-3xl lg:mx-0">
            <p className="text-xs font-semibold tracking-widest text-brand-800 uppercase">
              Service areas
            </p>
            <h2
              id="service-coverage-heading"
              className="mt-2 text-2xl text-ink-900 sm:text-3xl"
            >
              {variantLabel} across every state we cover
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-600">
              Pick your city for climate-specific notes and local installation guidance — not one
              metro paragraph reused nationwide.
            </p>
          </div>
          {coverImages.length > 1 ? (
            <ul className="grid grid-cols-3 gap-2">
              {coverImages.map((image) => (
                <li
                  key={image.id}
                  className="relative aspect-[3/4] overflow-hidden rounded-(--radius-card) bg-ink-100 shadow-(--shadow-card)"
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
          ) : primary ? (
            <div className="relative aspect-[16/10] overflow-hidden rounded-(--radius-media) bg-ink-100 shadow-(--shadow-card)">
              <Image
                src={primary.src}
                alt={primary.alt}
                fill
                sizes="(min-width: 1024px) 35vw, 100vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
          ) : null}
        </div>

        {!intent && family ? (
          <div className="mt-10 rounded-(--radius-card) border border-ink-200 bg-white p-5 sm:p-6">
            <h3 className="text-sm font-semibold text-ink-900">Browse by subsection</h3>
            <p className="mt-1 text-sm text-ink-500">
              Each link is its own hub page with unique content, then the same state ladder.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {family.children.map((child) => (
                <li key={child.intentSlug + child.label}>
                  <Link
                    href={serviceIntentPath(service, { slug: child.intentSlug })}
                    className="inline-flex rounded-full border border-ink-200 bg-ink-50 px-3 py-1.5 text-sm font-medium text-ink-800 no-underline hover:border-brand-300 hover:bg-white hover:text-brand-800"
                  >
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div id="coverage-states" className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {states.map((state) => {
            const cities = [...getCitiesByState(state.id)].sort((a, b) => {
              if (a.tier !== b.tier) return a.tier - b.tier;
              return a.name.localeCompare(b.name);
            });
            const visible = cities.slice(0, CITIES_PER_STATE);
            const remaining = cities.length - visible.length;

            return (
              <div
                key={state.id}
                className="flex flex-col rounded-(--radius-card) border border-ink-200 bg-white p-5 shadow-(--shadow-card)"
              >
                <Link
                  href={statePath(state)}
                  className="text-base font-semibold text-ink-900 no-underline hover:text-brand-800"
                >
                  {state.name}
                </Link>
                <p className="mt-1 text-xs text-ink-500">
                  {cities.length} {cities.length === 1 ? 'city' : 'cities'}
                </p>
                <ul className="mt-4 flex-1 space-y-2 border-t border-ink-100 pt-4">
                  {visible.map((city) => (
                    <li key={city.id}>
                      <Link
                        href={
                          intent
                            ? serviceInCityIntentPath(service, state, city, intent)
                            : serviceInCityPath(service, state, city)
                        }
                        className="block text-sm leading-snug text-ink-700 no-underline hover:text-brand-800"
                      >
                        {city.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                {remaining > 0 ? (
                  <Link
                    href={statePath(state)}
                    className="mt-4 text-sm font-medium text-brand-800 no-underline hover:text-brand-900"
                  >
                    +{remaining} more in {state.name}
                  </Link>
                ) : (
                  <Link
                    href={statePath(state)}
                    className="mt-4 text-sm font-medium text-brand-800 no-underline hover:text-brand-900"
                  >
                    All areas in {state.name}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
