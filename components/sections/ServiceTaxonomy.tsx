import Image from 'next/image';
import Link from 'next/link';
import { SERVICE_TAXONOMY } from '@/config/service-taxonomy';
import { Container } from '@/components/ui/Container';
import { getPrimaryImageForService, getServiceBySlug } from '@/lib/data/repository';

/**
 * Eight-family directory: each subsection links to its own national hub page,
 * with a service photo on every family card.
 */
export function ServiceTaxonomy() {
  return (
    <section className="border-t border-ink-200 bg-surface-elevated py-(--spacing-section) lg:py-(--spacing-section-lg)">
      <Container width="wide">
        <div className="max-w-2xl">
          <p className="inline-flex rounded-full bg-accent-500/15 px-3 py-1 text-[11px] font-bold tracking-widest text-accent-700 uppercase">
            Full directory
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Every subsection has its own page — then every state
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-600">
            Price, balcony, child safety, and installation are separate URLs with their own
            copy. From each hub, open any state and city for local specification pages.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_TAXONOMY.map((family) => {
            const service = getServiceBySlug(family.serviceSlug);
            const image = service ? getPrimaryImageForService(service.id) : undefined;
            return (
              <div
                key={family.serviceSlug}
                className="overflow-hidden rounded-(--radius-card) border border-ink-200/80 bg-ink-50 shadow-(--shadow-card)"
              >
                {image ? (
                  <Link
                    href={`/services/${family.serviceSlug}`}
                    className="relative block aspect-[16/10] bg-ink-200"
                    aria-label={family.heading}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 1024px) 22vw, 50vw"
                      className="object-cover"
                      loading="lazy"
                    />
                  </Link>
                ) : null}
                <div className="p-5">
                  <Link
                    href={`/services/${family.serviceSlug}`}
                    className="text-base font-bold text-ink-900 no-underline hover:text-brand-800"
                  >
                    {family.heading}
                  </Link>
                  <ul className="mt-4 space-y-2.5 border-t border-ink-200 pt-4">
                    {family.children.map((child) => (
                      <li key={`${family.serviceSlug}:${child.intentSlug}:${child.label}`}>
                        <Link
                          href={`/services/${family.serviceSlug}/${child.intentSlug}`}
                          className="text-sm leading-snug text-ink-600 no-underline hover:text-brand-800"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
