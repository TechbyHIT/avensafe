import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import type { Crumb } from '@/types/routing';

export interface BreadcrumbsProps {
  readonly crumbs: readonly Crumb[];
}

/**
 * Visible breadcrumb trail. The matching `BreadcrumbList` structured data is
 * emitted by the schema engine from the same `crumbs` array, so the two can
 * never disagree.
 */
export function Breadcrumbs({ crumbs }: BreadcrumbsProps) {
  if (crumbs.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className="border-b border-ink-200 bg-ink-50">
      <Container>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 py-3 text-sm text-ink-500">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <li key={crumb.href} className="flex items-center gap-2">
                {isLast ? (
                  <span aria-current="page" className="font-medium text-ink-700">
                    {crumb.label}
                  </span>
                ) : (
                  <Link href={crumb.href} className="hover:text-brand-800">
                    {crumb.label}
                  </Link>
                )}
                {isLast ? null : (
                  <span aria-hidden="true" className="text-ink-300">
                    /
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </Container>
    </nav>
  );
}
