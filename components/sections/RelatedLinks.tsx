import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import type { LinkGroup } from '@/types/routing';

export interface RelatedLinksProps {
  readonly groups: readonly LinkGroup[];
}

/**
 * Renders the internal link engine's output.
 *
 * Each link carries the reason it is being offered, which is what makes this a
 * useful section rather than a footer link dump. The engine has already
 * deduplicated and capped the set before it reaches here.
 */
export function RelatedLinks({ groups }: RelatedLinksProps) {
  if (groups.length === 0) return null;

  return (
    <div className="border-t border-ink-200 bg-white py-(--spacing-section)">
      <Container width="wide">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-widest text-brand-800 uppercase">
            Explore nearby
          </p>
          <h2 className="mt-2 text-2xl text-ink-900 sm:text-3xl">
            Related pages worth opening next
          </h2>
        </div>
        <div className="mt-10 grid gap-10 sm:grid-cols-2 xl:grid-cols-4">
          {groups.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <h3 className="border-b border-ink-100 pb-3 text-sm font-semibold text-ink-900">
                {group.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={`${group.heading}:${link.href}`}>
                    <Link
                      href={link.href}
                      className="text-sm leading-snug text-ink-600 no-underline hover:text-brand-800"
                    >
                      {link.label}
                    </Link>
                    {link.context ? (
                      <p className="mt-0.5 text-xs leading-relaxed text-ink-400">{link.context}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </Container>
    </div>
  );
}
