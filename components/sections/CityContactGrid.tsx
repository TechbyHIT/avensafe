import Link from 'next/link';
import type { ReactNode } from 'react';
import { business, primaryPhone, telHref, whatsappHref, whatsappPhone } from '@/config/business';
import { Container } from '@/components/ui/Container';
import { cityPath } from '@/lib/routing/url';
import type { City, State } from '@/lib/data/schemas';

export interface CityContactEntry {
  readonly state: State;
  readonly city: City;
}

export interface CityContactGridProps {
  readonly entries: readonly CityContactEntry[];
  readonly heading?: string;
}

/**
 * Branch-style city contacts (EverSafe pattern) without publishing unverified
 * street addresses — each card links to the city hub plus direct call/WhatsApp.
 */
export function CityContactGrid({
  entries,
  heading = 'City teams & service areas',
}: CityContactGridProps) {
  if (entries.length === 0) return null;

  return (
    <SectionShell heading={heading}>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(({ state, city }) => {
          const href = cityPath(state, city);
          const message = `Hello ${business.shortName}, I need an installation in ${city.name}, ${state.name}. I will share a photo of the opening.`;
          return (
            <li key={city.id}>
              <article className="flex h-full flex-col rounded-(--radius-card) border border-ink-200/80 bg-white p-5 shadow-(--shadow-card)">
                <p className="text-[11px] font-bold tracking-widest text-brand-700 uppercase">
                  {state.name}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-ink-900">
                  <Link href={href} className="text-brand-900 no-underline hover:text-brand-700">
                    {city.name}
                  </Link>
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600">
                  {city.localConsiderations}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={telHref(primaryPhone)}
                    className="inline-flex rounded-full border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-800 no-underline hover:border-brand-400"
                  >
                    Call
                  </a>
                  <a
                    href={whatsappHref(message, whatsappPhone)}
                    className="inline-flex rounded-full bg-wa-500 px-3 py-1.5 text-xs font-semibold text-white no-underline hover:bg-wa-600"
                  >
                    WhatsApp {city.name}
                  </a>
                  <Link
                    href={href}
                    className="inline-flex rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800 no-underline hover:bg-brand-100"
                  >
                    City page →
                  </Link>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}

function SectionShell({
  heading,
  children,
}: {
  readonly heading: string;
  readonly children: ReactNode;
}) {
  return (
    <div className="border-t border-ink-200 bg-ink-50 py-12 lg:py-14">
      <Container width="wide">
        <h2 className="text-2xl font-bold text-ink-900">{heading}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600">
          Pick the metro closest to you, then share your locality or PIN on WhatsApp so we can
          confirm coverage and route the survey team.
        </p>
        <div className="mt-8">{children}</div>
      </Container>
    </div>
  );
}
