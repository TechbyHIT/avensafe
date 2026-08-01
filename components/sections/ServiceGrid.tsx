import Image from 'next/image';
import Link from 'next/link';
import { primaryPhone, telHref } from '@/config/business';
import { getPrimaryImageForService } from '@/lib/data/repository';
import type { Service } from '@/lib/data/schemas';

export interface ServiceGridProps {
  readonly services: readonly Service[];
  /**
   * Builds each card's href. Passing this in lets the same grid render links to
   * the service hub or to a service-in-location page without duplicating markup.
   */
  readonly hrefFor: (service: Service) => string;
  /** Appended to the card title, e.g. " in Hyderabad". */
  readonly titleSuffix?: string;
}

export function ServiceGrid({ services, hrefFor, titleSuffix }: ServiceGridProps) {
  if (services.length === 0) return null;

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => {
        const image = getPrimaryImageForService(service.id);
        const href = hrefFor(service);
        const title = titleSuffix ? `${service.name}${titleSuffix}` : service.name;

        return (
          <li key={service.id}>
            <article className="flex h-full flex-col overflow-hidden rounded-(--radius-card) border border-ink-200/80 bg-white shadow-(--shadow-card) transition-shadow hover:shadow-(--shadow-raised)">
              {image ? (
                <div className="relative aspect-[4/3] bg-ink-100">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-5">
                {service.category === 'safety' ? (
                  <p className="text-[11px] font-bold tracking-widest text-accent-700 uppercase">
                    Safety
                  </p>
                ) : null}
                <h3 className="mt-1 text-lg font-bold text-ink-900">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600">
                  {service.summary}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={href}
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
                    Call
                  </a>
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
