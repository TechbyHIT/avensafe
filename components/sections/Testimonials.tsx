import { Section } from '@/components/ui/Section';
import type { Testimonial } from '@/lib/data/schemas';

export interface TestimonialsProps {
  readonly testimonials: readonly Testimonial[];
}

/**
 * Customer feedback.
 *
 * The repository only ever returns entries that are both published and verified,
 * so this section renders nothing until real, permissioned feedback exists.
 * Matching `Review` nodes are emitted in JSON-LD for those same entries only —
 * never `AggregateRating` without measured scores.
 */
export function Testimonials({ testimonials }: TestimonialsProps) {
  if (testimonials.length === 0) return null;

  return (
    <Section tone="muted" heading="What customers say">
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((entry) => (
          <li key={entry.id}>
            <figure className="flex h-full flex-col rounded-(--radius-card) border border-ink-200 bg-white p-6 shadow-(--shadow-card)">
              <blockquote className="flex-1 text-sm leading-relaxed text-ink-700">
                <p>“{entry.quote}”</p>
              </blockquote>
              <figcaption className="mt-4 border-t border-ink-200 pt-4 text-sm">
                <span className="font-semibold text-ink-900">{entry.attribution}</span>
                <span className="mt-0.5 block text-ink-500">{entry.locationLabel}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
