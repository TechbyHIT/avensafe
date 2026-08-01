import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-(--radius-card) border border-ink-200/80 bg-white p-6 shadow-(--shadow-card)',
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface LinkCardProps {
  readonly href: string;
  readonly title: string;
  readonly description?: string;
  readonly meta?: string;
  readonly className?: string;
}

/**
 * A card that is entirely one link. The whole surface is clickable, but only the
 * title is inside the anchor, so assistive technology announces a single link
 * with a meaningful name rather than the full body text.
 */
export function LinkCard({ href, title, description, meta, className }: LinkCardProps) {
  return (
    <div
      className={cn(
        'group relative rounded-(--radius-card) border border-ink-200/80 bg-white p-5',
        'shadow-(--shadow-card) transition-shadow duration-200 hover:shadow-(--shadow-raised)',
        'focus-within:ring-2 focus-within:ring-brand-700 focus-within:ring-offset-2',
        className,
      )}
    >
      {meta ? (
        <p className="mb-2 text-xs font-medium tracking-wide text-brand-700 uppercase">{meta}</p>
      ) : null}
      <h3 className="text-base font-semibold text-ink-900">
        <Link
          href={href}
          data-no-underline=""
          className="no-underline after:absolute after:inset-0 after:content-[''] group-hover:text-brand-800"
        >
          {title}
        </Link>
      </h3>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-ink-600">{description}</p>
      ) : null}
    </div>
  );
}
