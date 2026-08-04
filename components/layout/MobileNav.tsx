'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import type { NavItem } from '@/types/navigation';

export interface MobileNavGroup {
  readonly label: string;
  readonly href: string;
  readonly items: readonly NavItem[];
}

export interface MobileNavProps {
  readonly groups: readonly MobileNavGroup[];
}

/** Keep the drawer useful without dumping every locality into the RSC payload. */
const MAX_ITEMS = {
  Services: 12,
  Areas: 12,
  default: 8,
} as const;

/**
 * Mobile drawer — hub link plus capped service / area lists from primary nav.
 * Full mega-menu matrices stay desktop-only to limit HTML weight.
 */
export function MobileNav({ groups }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="inline-flex items-center gap-2 rounded-(--radius-control) border border-ink-300 px-3 py-2 text-sm font-medium text-ink-700 xl:hidden"
      >
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path d="M2 4h12M2 8h12M2 12h12" strokeLinecap="round" />
        </svg>
        Menu
      </button>

      {open ? (
        <Dialog open={open} onClose={() => setOpen(false)} title="Site navigation" variant="drawer">
          <nav aria-label="Site navigation" className="max-h-[75vh] overflow-y-auto pr-1">
            <ul className="space-y-6">
              {groups.map((group) => {
                const cap =
                  group.label === 'Services'
                    ? MAX_ITEMS.Services
                    : group.label === 'Areas'
                      ? MAX_ITEMS.Areas
                      : MAX_ITEMS.default;
                const items = group.items.slice(0, cap);
                const remaining = group.items.length - items.length;
                const showItems = items.length > 0;

                return (
                  <li key={group.label}>
                    <Link
                      href={group.href}
                      className="block text-sm font-semibold tracking-wide text-ink-900 uppercase"
                    >
                      {group.label}
                    </Link>

                    {showItems ? (
                      <ul className="mt-2 space-y-1 border-l border-ink-200 pl-3">
                        {items.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className="block py-1.5 text-sm text-ink-600 hover:text-brand-800"
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                        {remaining > 0 || group.label === 'Services' || group.label === 'Areas' ? (
                          <li>
                            <Link
                              href={group.href}
                              className="block py-1.5 text-sm font-medium text-brand-800 hover:text-brand-900"
                            >
                              {remaining > 0
                                ? `+${remaining} more →`
                                : group.label === 'Services'
                                  ? 'All services hub →'
                                  : group.label === 'Areas'
                                    ? 'Browse all service areas →'
                                    : 'View all →'}
                            </Link>
                          </li>
                        ) : null}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>
        </Dialog>
      ) : null}
    </>
  );
}
