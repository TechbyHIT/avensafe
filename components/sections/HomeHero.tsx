import Image from 'next/image';
import Link from 'next/link';
import {
  business,
  primaryPhone,
  telHref,
  whatsappHref,
  whatsappPhone,
} from '@/config/business';
import { STATIC_ROUTES } from '@/config/routes';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import type { ImageRecord } from '@/lib/data/schemas';

export interface HomeHeroProps {
  readonly image?: ImageRecord | undefined;
}

/**
 * Full-bleed conversion hero: photo-estimate first, then call, then city finder.
 */
export function HomeHero({ image }: HomeHeroProps) {
  const message = `Hello ${business.shortName}, I want an estimate for invisible grills / safety nets. I will share a photo of the opening and my city/PIN.`;

  return (
    <section className="relative isolate min-h-[min(92vh,52rem)] overflow-hidden bg-brand-950 text-white">
      {image ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-cover object-[70%_45%]"
        />
      ) : null}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-r from-brand-950/90 via-brand-950/65 to-brand-900/25"
      />

      <Container width="wide" className="relative z-10 flex min-h-[min(92vh,52rem)] items-center py-16 lg:py-24">
        <div className="max-w-3xl">
          <p className="inline-flex rounded-full bg-accent-500 px-3 py-1 text-[11px] font-bold tracking-wide text-accent-ink uppercase">
            {business.shortName} · survey before any firm price
          </p>

          <Heading
            level={1}
            className="mt-5 text-3xl leading-tight font-bold text-white sm:text-4xl lg:text-[2.85rem]"
          >
            Invisible grills, safety nets and cloth hangers in Andhra Pradesh
          </Heading>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
            Balcony safety nets, pigeon protection, and slim cable grills planned around your
            opening, your view, and how you use the home — with locality-level pages across Andhra
            Pradesh, not a thin national brochure.
          </p>

          <ul className="mt-5 space-y-2 text-sm text-white/90">
            {[
              'A fit for your opening — measurements, edges, and fixing points',
              'Options for everyday living — view, access, birds, children, or sports',
              'Find your city — thousands of locality pages with real specification notes',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-0.5 text-accent-400">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={whatsappHref(message, whatsappPhone)}
              className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-6 py-3.5 text-sm font-bold text-accent-ink no-underline hover:bg-accent-600"
            >
              Send a Photo for Estimate
              <span aria-hidden="true">→</span>
            </a>
            <a
              href={telHref(primaryPhone)}
              className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-black/25 px-6 py-3.5 text-sm font-bold text-white no-underline hover:bg-black/40"
            >
              Call {primaryPhone.display}
            </a>
            <Link
              href={STATIC_ROUTES.serviceAreas}
              className="inline-flex items-center gap-2 px-2 py-3.5 text-sm font-semibold text-white underline-offset-4 hover:underline"
            >
              Find your service city
            </Link>
          </div>

          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-white/95">
            {business.phones.map((phone) => (
              <li key={phone.e164}>
                <a
                  href={telHref(phone)}
                  className="inline-flex items-center gap-1.5 no-underline hover:text-accent-400"
                >
                  <span aria-hidden="true" className="text-accent-400">
                    ☎
                  </span>
                  {phone.display}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
