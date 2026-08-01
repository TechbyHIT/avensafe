import type { ReactNode } from 'react';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/utils/cn';

const tones = {
  default: 'bg-surface-elevated',
  muted: 'bg-ink-50',
  brand: 'bg-brand-900 text-brand-50',
} as const;

export interface SectionProps {
  readonly children: ReactNode;
  readonly tone?: keyof typeof tones;
  readonly width?: 'prose' | 'default' | 'wide';
  /** Rendered as the section heading, and used as its accessible label. */
  readonly heading?: string;
  readonly headingLevel?: 2 | 3;
  readonly lede?: string;
  readonly id?: string;
  readonly className?: string;
}

/**
 * A titled page section with consistent vertical rhythm.
 *
 * Owning the heading here is deliberate: it keeps the document outline correct
 * (sections render `h2` by default, never skipping a level) without every caller
 * having to remember which level it is at.
 */
export function Section({
  children,
  tone = 'default',
  width = 'default',
  heading,
  headingLevel = 2,
  lede,
  id,
  className,
}: SectionProps) {
  const HeadingTag = headingLevel === 2 ? 'h2' : 'h3';

  return (
    <section
      id={id}
      className={cn('py-(--spacing-section) lg:py-(--spacing-section-lg)', tones[tone], className)}
      {...(heading ? { 'aria-labelledby': id ? `${id}-heading` : undefined } : {})}
    >
      <Container width={width}>
        {heading ? (
          <div className="mb-10 max-w-3xl lg:mb-12">
            <HeadingTag
              {...(id ? { id: `${id}-heading` } : {})}
              className={cn(
                'text-2xl tracking-tight sm:text-3xl lg:text-[2.15rem]',
                tone === 'brand' ? 'text-white' : 'text-ink-900',
              )}
            >
              {heading}
            </HeadingTag>
            {lede ? (
              <p
                className={cn(
                  'mt-4 text-lg leading-relaxed',
                  tone === 'brand' ? 'text-brand-100' : 'text-ink-600',
                )}
              >
                {lede}
              </p>
            ) : null}
          </div>
        ) : null}
        {children}
      </Container>
    </section>
  );
}
