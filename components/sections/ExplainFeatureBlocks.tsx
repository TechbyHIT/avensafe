import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import type { ImageRecord } from '@/lib/data/schemas';

export interface ExplainFeatureBlock {
  readonly eyebrow: string;
  readonly title: string;
  readonly body?: string;
  readonly points: readonly string[];
  readonly href: string;
  readonly ctaLabel: string;
  readonly image?: ImageRecord | undefined;
}

export interface ExplainFeatureBlocksProps {
  readonly blocks: readonly ExplainFeatureBlock[];
}

/**
 * Alternating image + explain-copy bands (Hiranya "Most Popular" pattern).
 */
export function ExplainFeatureBlocks({ blocks }: ExplainFeatureBlocksProps) {
  if (blocks.length === 0) return null;

  return (
    <section className="bg-surface-elevated py-(--spacing-section) lg:py-(--spacing-section-lg)">
      <Container width="wide">
        <ul className="space-y-10 lg:space-y-16">
          {blocks.map((block, index) => {
            const imageLeft = index % 2 === 0;
            return (
              <li key={block.href + block.title}>
                <article className="grid items-center gap-8 overflow-hidden rounded-(--radius-card) border border-ink-200/80 bg-ink-50 lg:grid-cols-2 lg:gap-0">
                  <div
                    className={
                      imageLeft
                        ? 'relative aspect-[4/3] bg-ink-200 lg:aspect-auto lg:min-h-[22rem]'
                        : 'relative order-first aspect-[4/3] bg-ink-200 lg:order-last lg:aspect-auto lg:min-h-[22rem]'
                    }
                  >
                    {block.image ? (
                      <Image
                        src={block.image.src}
                        alt={block.image.alt}
                        fill
                        sizes="(min-width: 1024px) 40vw, 100vw"
                        className="object-cover"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                  <div className="p-6 sm:p-8 lg:p-10">
                    <p className="inline-flex rounded-full bg-accent-500/15 px-3 py-1 text-[11px] font-bold tracking-widest text-accent-700 uppercase">
                      {block.eyebrow}
                    </p>
                    <h2 className="mt-4 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
                      {block.title}
                    </h2>
                    {block.body ? (
                      <p className="mt-3 text-base leading-relaxed text-ink-600">{block.body}</p>
                    ) : null}
                    <ul className="mt-5 space-y-2.5">
                      {block.points.map((point) => (
                        <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-ink-700">
                          <span className="mt-0.5 font-bold text-accent-600" aria-hidden="true">
                            ✓
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={block.href}
                      data-no-underline=""
                      className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-3 text-sm font-bold text-white no-underline hover:bg-ink-800"
                    >
                      {block.ctaLabel}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
