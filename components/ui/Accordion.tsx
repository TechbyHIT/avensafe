import { cn } from '@/lib/utils/cn';

export interface AccordionItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

export interface AccordionProps {
  readonly items: readonly AccordionItem[];
  readonly className?: string;
}

/**
 * FAQ accordion built on native `<details>`.
 *
 * Deliberately not a client component: the browser gives us keyboard support,
 * correct semantics and expand-on-find-in-page for free, and the content is
 * present in the HTML for crawlers without any JavaScript.
 */
export function Accordion({ items, className }: AccordionProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn('divide-y divide-ink-200 rounded-(--radius-card) border border-ink-200', className)}>
      {items.map((item) => (
        <details key={item.id} className="group px-5 py-4 open:bg-ink-50/60">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left font-medium text-ink-900 marker:content-none">
            <span>{item.question}</span>
            <span
              aria-hidden="true"
              className="mt-1 shrink-0 text-brand-700 transition-transform duration-150 group-open:rotate-45"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M8 3v10M3 8h10" strokeLinecap="round" />
              </svg>
            </span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-ink-600">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
