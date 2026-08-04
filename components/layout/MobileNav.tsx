'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { STATIC_ROUTES } from '@/config/routes';
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

/**
 * Mobile drawer lists hub links only. The desktop mega-menus already expose the
 * city/area matrix; duplicating them here doubled anchors + RSC payload on every
 * HTML page (~200 links × ~400 KB flight data across the fleet).
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
              {groups.map((group) => (
                <li key={group.label}>
                  <Link
                    href={group.href}
                    className="block text-sm font-semibold tracking-wide text-ink-900 uppercase"
                  >
                    {group.label}
                  </Link>

                  {group.label === 'Services' ? (
                    <ul className="mt-2 space-y-1 border-l border-ink-200 pl-3">
                      <li>
                        <Link
                          href={STATIC_ROUTES.services}
                          className="block py-1.5 text-sm font-medium text-brand-800 hover:text-brand-900"
                        >
                          All services hub →
                        </Link>
                      </li>
                    </ul>
                  ) : null}

                  {group.label === 'Areas' ? (
                    <ul className="mt-2 space-y-1 border-l border-ink-200 pl-3">
                      <li>
                        <Link
                          href={STATIC_ROUTES.serviceAreas}
                          className="block py-1.5 text-sm font-medium text-brand-800 hover:text-brand-900"
                        >
                          Browse all service areas →
                        </Link>
                      </li>
                    </ul>
                  ) : null}

                  {group.label !== 'Services' &&
                  group.label !== 'Areas' &&
                  group.items.length > 0 ? (
                    <ul className="mt-2 space-y-1 border-l border-ink-200 pl-3">
                      {group.items.slice(0, 8).map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="block py-1.5 text-sm text-ink-600 hover:text-brand-800"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>
        </Dialog>
      ) : null}
    </>
  );
}
