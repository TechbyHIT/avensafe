import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import {
  getImageById,
  getAreasByCity,
  getPrimaryImageForService,
} from '@/lib/data/repository';
import type { Area, City, Service, State } from '@/lib/data/schemas';
import { areaPath, serviceInAreaPath } from '@/lib/routing/url';

export interface LocalityDirectoryProps {
  readonly state: State;
  readonly city: City;
  readonly service?: Service;
  readonly heading?: string;
}

const SOCIETY_KINDS = new Set([
  'society',
  'apartment',
  'gated-community',
  'township',
]);

const MANDAL_KINDS = new Set(['mandal', 'town', 'village', 'gram-panchayat']);

function hrefFor(
  area: Area,
  state: State,
  city: City,
  service: Service | undefined,
): string {
  return service
    ? serviceInAreaPath(service, state, city, area)
    : areaPath(state, city, area);
}

/**
 * Full locality directory for a city — societies/apartments and mandals
 * highlighted, then every other published area.
 */
export function LocalityDirectory({
  state,
  city,
  service,
  heading,
}: LocalityDirectoryProps) {
  const areas = [...getAreasByCity(city.id)].sort((a, b) => a.name.localeCompare(b.name));
  if (areas.length === 0) return null;

  const societies = areas.filter(
    (area) => area.locationKind && SOCIETY_KINDS.has(area.locationKind),
  );
  const mandals = areas.filter(
    (area) => area.locationKind && MANDAL_KINDS.has(area.locationKind),
  );
  const localities = areas.filter(
    (area) =>
      !area.locationKind ||
      (!SOCIETY_KINDS.has(area.locationKind) && !MANDAL_KINDS.has(area.locationKind)),
  );

  const title =
    heading ??
    (service
      ? `${service.name} in every ${city.name} locality`
      : `All localities in ${city.name}`);

  const banner =
    (service ? getPrimaryImageForService(service.id) : undefined) ??
    getImageById('img-hero-home') ??
    getImageById('img-invisible-grills-05');

  return (
    <section
      className="border-t border-ink-200 bg-white py-(--spacing-section)"
      aria-labelledby="locality-directory-heading"
    >
      <Container width="wide">
        <div className="grid items-end gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-widest text-brand-800 uppercase">
              Local coverage
            </p>
            <h2 id="locality-directory-heading" className="mt-2 text-2xl text-ink-900 sm:text-3xl">
              {title}
            </h2>
            <p className="mt-3 text-base text-ink-600">
              {areas.length} published localities
              {societies.length > 0
                ? ` including ${societies.length} apartment / society pages`
                : ''}
              {mandals.length > 0 ? ` and ${mandals.length} mandal / town pages` : ''}
              — each has its own URL
              {service ? ` for ${service.shortName}` : ' and all services'}.
            </p>
          </div>
          {banner ? (
            <div className="relative aspect-[16/10] overflow-hidden rounded-(--radius-media) border border-ink-200/80 bg-ink-100 shadow-(--shadow-card)">
              <Image
                src={banner.src}
                alt={banner.alt}
                fill
                sizes="(min-width: 1024px) 30vw, 100vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
          ) : null}
        </div>

        {societies.length > 0 ? (
          <div className="mt-10">
            <h3 className="text-sm font-semibold tracking-wide text-ink-500 uppercase">
              Apartments &amp; societies
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {societies.map((area) => (
                <li key={area.id}>
                  <Link
                    href={hrefFor(area, state, city, service)}
                    className="inline-block rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-900 no-underline hover:border-brand-400"
                  >
                    {area.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {mandals.length > 0 ? (
          <div className="mt-8">
            <h3 className="text-sm font-semibold tracking-wide text-ink-500 uppercase">
              Mandals, towns &amp; rural belts
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {mandals.map((area) => (
                <li key={area.id}>
                  <Link
                    href={hrefFor(area, state, city, service)}
                    className="inline-block rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1.5 text-sm font-medium text-ink-900 no-underline hover:border-accent-600"
                  >
                    {area.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {localities.length > 0 ? (
          <ul className="mt-8 columns-2 gap-x-8 gap-y-2 sm:columns-3 lg:columns-4">
            {localities.map((area: Area) => (
              <li key={area.id} className="mb-2 break-inside-avoid">
                <Link
                  href={hrefFor(area, state, city, service)}
                  className="text-sm text-ink-700 no-underline hover:text-brand-800"
                >
                  {area.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </Container>
    </section>
  );
}
