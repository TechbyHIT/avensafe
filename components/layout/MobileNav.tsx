'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SERVICES_MEGA_MENU, type AreaMegaCity } from '@/config/mega-menu';
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
  readonly areasMegaMenu: readonly AreaMegaCity[];
}

export function MobileNav({ groups, areasMegaMenu }: MobileNavProps) {
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
                  <div className="mt-3 space-y-4 border-l border-ink-200 pl-3">
                    {SERVICES_MEGA_MENU.map((column) => (
                      <div key={column.heading}>
                        <Link
                          href={column.href}
                          className="text-sm font-semibold text-brand-900 hover:text-accent-700"
                        >
                          {column.heading}
                        </Link>
                        <ul className="mt-1.5 space-y-1">
                          {column.links.map((link) => (
                            <li key={`${column.heading}-${link.label}`}>
                              <Link
                                href={link.href}
                                className="block py-1 text-sm text-ink-600 hover:text-brand-800"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <Link
                      href={STATIC_ROUTES.services}
                      className="block text-sm font-medium text-brand-800"
                    >
                      View all services →
                    </Link>
                  </div>
                ) : null}

                {group.label === 'Areas' ? (
                  <div className="mt-3 space-y-4 border-l border-ink-200 pl-3">
                    {areasMegaMenu.map((city) => (
                      <div key={city.name}>
                        <Link
                          href={city.href}
                          className="text-sm font-semibold text-brand-900 hover:text-accent-700"
                        >
                          {city.name}
                        </Link>
                        <ul className="mt-1.5 space-y-1">
                          {city.areas.map((link) => (
                            <li key={`${city.name}-${link.label}`}>
                              <Link
                                href={link.href}
                                className="block py-1 text-sm text-ink-600 hover:text-brand-800"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <Link
                      href={STATIC_ROUTES.serviceAreas}
                      className="block text-sm font-medium text-brand-800"
                    >
                      Browse all service areas →
                    </Link>
                  </div>
                ) : null}

                {group.label !== 'Services' &&
                group.label !== 'Areas' &&
                group.items.length > 0 ? (
                  <ul className="mt-2 space-y-1 border-l border-ink-200 pl-3">
                    {group.items.map((item) => (
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
    </>
  );
}
