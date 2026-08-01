'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { business, primaryPhone, telHref, whatsappHref, whatsappPhone } from '@/config/business';
import { Container } from '@/components/ui/Container';
import type { ExploreCluster, LinkGroup } from '@/types/routing';

export type ExploreMosaicImage = {
  readonly id: string;
  readonly src: string;
  readonly alt: string;
};

function exploreClusterLabel(cluster: ExploreCluster): string {
  switch (cluster) {
    case 'service':
      return 'Services';
    case 'geo':
      return 'Locations';
    case 'journey':
      return 'Buyer journey';
    case 'property':
      return 'Property types';
    case 'application':
      return 'Applications';
    case 'content':
      return 'Resources';
    case 'conversion':
      return 'Next step';
    default:
      return 'Explore';
  }
}

export interface ExploreHubProps {
  readonly groups: readonly LinkGroup[];
  readonly currentPath?: string;
  /** Optional installation photos so the related-links band is not text-only. */
  readonly mosaic?: readonly ExploreMosaicImage[];
}

const CLUSTER_ORDER: readonly ExploreCluster[] = [
  'conversion',
  'service',
  'journey',
  'property',
  'application',
  'geo',
  'content',
];

/**
 * Premium Explore / Related Pages hub — docs-style cards, mobile accordions,
 * strong internal-link crawl surface without dumping every URL at once.
 */
export function ExploreHub({ groups, currentPath, mosaic = [] }: ExploreHubProps) {
  const [openId, setOpenId] = useState<string | null>(groups[0]?.id ?? groups[0]?.heading ?? null);

  const clusters = useMemo(() => {
    const map = new Map<ExploreCluster, LinkGroup[]>();
    for (const group of groups) {
      const key = group.cluster ?? 'content';
      const list = map.get(key) ?? [];
      list.push(group);
      map.set(key, list);
    }
    return CLUSTER_ORDER.flatMap((cluster) => {
      const items = map.get(cluster);
      if (!items || items.length === 0) return [];
      return [{ cluster, items }];
    });
  }, [groups]);

  if (groups.length === 0) return null;

  const waMessage = `Hello ${business.shortName}, I want a free site inspection. I will share a photo of the opening and my city/PIN.`;

  return (
    <section
      id="explore-more"
      className="relative border-t border-ink-200 bg-[linear-gradient(180deg,#fdfcf8_0%,#ffffff_42%,#f7f4ec_100%)] py-(--spacing-section) lg:py-(--spacing-section-lg)"
      aria-labelledby="explore-more-heading"
    >
      <Container width="wide">
        <header className="grid items-end gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-ink-200 bg-white/80 px-3 py-1 text-[11px] font-bold tracking-widest text-accent-700 uppercase shadow-(--shadow-card) backdrop-blur">
              Explore more
            </p>
            <h2
              id="explore-more-heading"
              className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl"
            >
              Related pages &amp; topic clusters
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-600 sm:text-lg">
              Continue this service, compare nearby locations, or open a buyer guide — every
              cluster is unique to this page.
            </p>
          </div>
          {mosaic.length > 0 ? (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
              {mosaic.slice(0, 4).map((image) => (
                <li
                  key={image.id}
                  className="relative aspect-[4/3] overflow-hidden rounded-(--radius-card) bg-ink-100 shadow-(--shadow-card)"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1024px) 12vw, 25vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        {/* Desktop / laptop / tablet grid */}
        <div className="mt-12 hidden md:block">
          {clusters.map(({ cluster, items }) => (
            <div key={cluster} className="mb-12 last:mb-0">
              <div className="mb-5 flex items-end justify-between gap-4 border-b border-ink-200 pb-3">
                <h3 className="text-sm font-bold tracking-widest text-ink-500 uppercase">
                  {exploreClusterLabel(cluster)}
                </h3>
                <p className="text-xs text-ink-400">{items.length} sections</p>
              </div>

              <div className="grid grid-cols-3 gap-4 lg:grid-cols-5 xl:grid-cols-12 xl:gap-5">
                {items.map((group) => {
                  const span =
                    group.span === 3
                      ? 'col-span-3 lg:col-span-5 xl:col-span-12'
                      : group.span === 2
                        ? 'col-span-3 lg:col-span-3 xl:col-span-6'
                        : 'col-span-3 sm:col-span-1 lg:col-span-1 xl:col-span-3';

                  return (
                    <ExploreCard
                      key={group.id ?? group.heading}
                      group={group}
                      className={span}
                      currentPath={currentPath}
                      featured={group.cluster === 'conversion'}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile accordion */}
        <div className="mt-10 space-y-3 md:hidden">
          {groups.map((group) => {
            const id = group.id ?? group.heading;
            const open = openId === id;
            return (
              <div
                key={id}
                className="overflow-hidden rounded-(--radius-card) border border-ink-200/80 bg-white/90 shadow-(--shadow-card) backdrop-blur"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : id)}
                >
                  <span>
                    <span className="block text-[11px] font-bold tracking-widest text-accent-700 uppercase">
                      {exploreClusterLabel(group.cluster ?? 'content')}
                    </span>
                    <span className="mt-1 block text-base font-bold text-ink-900">
                      {group.heading}
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-ink-400">
                    {open ? '−' : '+'}
                  </span>
                </button>
                {open ? (
                  <div className="border-t border-ink-100 px-4 pb-4">
                    {group.description ? (
                      <p className="pt-3 text-sm text-ink-600">{group.description}</p>
                    ) : null}
                    <ul className="mt-3 space-y-2.5">
                      {group.links.map((link) => (
                        <li key={`${id}:${link.href}:${link.label}`}>
                          <Link
                            href={link.href}
                            aria-current={currentPath === link.href ? 'page' : undefined}
                            className={
                              currentPath === link.href
                                ? 'text-sm font-semibold text-brand-800'
                                : 'text-sm font-medium text-ink-800 no-underline hover:text-brand-800'
                            }
                          >
                            {link.label}
                          </Link>
                          {link.context ? (
                            <p className="mt-0.5 text-xs leading-relaxed text-ink-500">
                              {link.context}
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                    {group.viewAllHref ? (
                      <Link
                        href={group.viewAllHref}
                        className="mt-4 inline-flex text-sm font-bold text-brand-800 no-underline"
                      >
                        View all →
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Conversion strip */}
        <div className="mt-12 rounded-(--radius-card) border border-ink-200/80 bg-ink-900 px-5 py-6 text-white shadow-(--shadow-raised) sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-widest text-accent-400 uppercase">
                Conversion
              </p>
              <h3 className="mt-1 text-xl font-bold text-white">Ready for a free site inspection?</h3>
              <p className="mt-2 max-w-xl text-sm text-white/80">
                Send a photo, book a callback, or call the team — we reply with the right system
                options for your opening.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={whatsappHref(waMessage, whatsappPhone)}
                data-no-underline=""
                className="inline-flex items-center rounded-full bg-accent-500 px-5 py-3 text-sm font-bold text-accent-ink no-underline shadow-(--shadow-accent) hover:bg-accent-600"
              >
                WhatsApp
              </a>
              <a
                href={telHref(primaryPhone)}
                data-no-underline=""
                className="inline-flex items-center rounded-full border border-white/30 px-5 py-3 text-sm font-bold text-white no-underline hover:bg-white/10"
              >
                Call Now
              </a>
              <Link
                href="/contact"
                data-no-underline=""
                className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-bold text-ink-900 no-underline hover:bg-ink-100"
              >
                Book Inspection
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ExploreCard({
  group,
  className,
  currentPath,
  featured = false,
}: {
  readonly group: LinkGroup;
  readonly className?: string;
  readonly currentPath?: string;
  readonly featured?: boolean;
}) {
  return (
    <nav
      aria-label={group.heading}
      className={[
        'flex h-full flex-col rounded-(--radius-card) border p-5 shadow-(--shadow-card) transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-(--shadow-raised)',
        featured
          ? 'border-accent-500/40 bg-[linear-gradient(145deg,#0f1f33_0%,#1e3a5f_100%)] text-white'
          : 'border-ink-200/80 bg-white/90 backdrop-blur',
        className ?? '',
      ].join(' ')}
    >
      <p
        className={
          featured
            ? 'text-[11px] font-bold tracking-widest text-accent-400 uppercase'
            : 'text-[11px] font-bold tracking-widest text-accent-700 uppercase'
        }
      >
        {exploreClusterLabel(group.cluster ?? 'content')}
      </p>
      <h3
        className={
          featured
            ? 'mt-2 text-xl font-bold text-white'
            : 'mt-2 text-lg font-bold text-ink-900'
        }
      >
        {group.heading}
      </h3>
      {group.description ? (
        <p className={featured ? 'mt-2 text-sm text-white/75' : 'mt-2 text-sm text-ink-600'}>
          {group.description}
        </p>
      ) : null}

      <ul className="mt-4 flex-1 space-y-2.5">
        {group.links.map((link) => {
          const active = currentPath === link.href;
          return (
            <li key={`${group.id ?? group.heading}:${link.href}:${link.label}`}>
              <Link
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={
                  featured
                    ? 'text-sm font-semibold text-white no-underline hover:text-accent-400'
                    : active
                      ? 'text-sm font-semibold text-brand-800'
                      : 'text-sm font-medium text-ink-800 no-underline hover:text-brand-800'
                }
              >
                {link.label}
              </Link>
              {link.context ? (
                <p
                  className={
                    featured
                      ? 'mt-0.5 text-xs leading-relaxed text-white/55'
                      : 'mt-0.5 text-xs leading-relaxed text-ink-500'
                  }
                >
                  {link.context}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>

      {group.viewAllHref ? (
        <Link
          href={group.viewAllHref}
          className={
            featured
              ? 'mt-5 inline-flex text-sm font-bold text-accent-400 no-underline'
              : 'mt-5 inline-flex text-sm font-bold text-brand-800 no-underline'
          }
        >
          View all →
        </Link>
      ) : null}
    </nav>
  );
}
