import Image from 'next/image';
import Link from 'next/link';
import { business, primaryPhone, telHref } from '@/config/business';
import { STATIC_ROUTES } from '@/config/routes';
import { Container } from '@/components/ui/Container';
import type { ImageRecord } from '@/lib/data/schemas';

export interface AboutShowcaseProps {
  readonly images: readonly ImageRecord[];
  readonly statsLabel?: string;
}

const PILLARS = [
  {
    title: 'Our Vision',
    detail: 'Make every home safer with premium, near-invisible solutions.',
  },
  {
    title: 'Our Mission',
    detail: 'Honest pricing, premium materials and clean installation, every time.',
  },
  {
    title: 'Our Promise',
    detail: 'Neat finishing, on-time service and dependable after-sales support.',
  },
] as const;

/**
 * Hiranya-style about band: staggered photography + vision cards + dual CTAs.
 */
export function AboutShowcase({ images, statsLabel }: AboutShowcaseProps) {
  const left = images[0];
  const right = images[1] ?? images[0];

  return (
    <section id="about" className="bg-ink-50 py-(--spacing-section) lg:py-(--spacing-section-lg)">
      <Container width="wide">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {left ? (
                <div className="relative aspect-[3/4] overflow-hidden rounded-(--radius-media) bg-ink-200 shadow-(--shadow-card)">
                  <Image
                    src={left.src}
                    alt={left.alt}
                    fill
                    sizes="(min-width: 1024px) 22vw, 45vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div aria-hidden="true" className="aspect-[3/4] rounded-(--radius-media) bg-ink-200" />
              )}
              {right ? (
                <div className="relative mt-8 aspect-[3/4] overflow-hidden rounded-(--radius-media) bg-ink-200 shadow-(--shadow-raised) sm:mt-12">
                  <Image
                    src={right.src}
                    alt={right.alt}
                    fill
                    sizes="(min-width: 1024px) 22vw, 45vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <p className="inline-flex rounded-full bg-accent-500/15 px-3 py-1 text-[11px] font-bold tracking-widest text-accent-700 uppercase">
              About {business.shortName}
            </p>
            <h2 className="mt-4 text-3xl leading-tight font-bold tracking-tight text-ink-900 sm:text-4xl">
              Premium safety solutions, built around your family
            </h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-ink-600">
              <p>
                We design, supply and install invisible grills, safety nets and bird protection for
                homes, apartments and commercial spaces
                {statsLabel ? ` across ${statsLabel}` : ''}.
              </p>
              <p>
                At {business.name}, safety is never a compromise on style. Our team uses surveyed
                openings, climate-matched materials and proven fixing methods — without blocking your
                view, light or airflow.
              </p>
            </div>

            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {PILLARS.map((item) => (
                <li
                  key={item.title}
                  className="rounded-2xl border border-ink-200/80 bg-white px-4 py-4 shadow-(--shadow-card)"
                >
                  <h3 className="text-sm font-bold text-accent-700">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink-600 sm:text-sm">
                    {item.detail}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={STATIC_ROUTES.about}
                data-no-underline=""
                className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3.5 text-sm font-bold text-white no-underline hover:bg-ink-800"
              >
                Learn More
                <span aria-hidden="true">→</span>
              </Link>
              <a
                href={telHref(primaryPhone)}
                data-no-underline=""
                className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-6 py-3.5 text-sm font-bold text-accent-ink no-underline shadow-(--shadow-accent) hover:bg-accent-600"
              >
                <PhoneIcon />
                Call Now
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M3.7 1.5a1.3 1.3 0 0 1 1.8.3l1.2 1.7c.3.4.3 1 0 1.4l-.7.9c-.2.2-.2.5 0 .8.5.9 1.5 1.9 2.4 2.4.3.2.6.2.8 0l.9-.7c.4-.3 1-.3 1.4 0l1.7 1.2c.6.4.7 1.2.3 1.8l-.6.8c-.5.7-1.4 1-2.2.8-1.9-.5-3.7-1.6-5.1-3C4.2 9.2 3.1 7.4 2.6 5.5c-.2-.8.1-1.7.8-2.2l.3-.2Z" />
    </svg>
  );
}
