'use client';

import { useEffect, useState } from 'react';

export interface StickyPageTocItem {
  readonly id: string;
  readonly label: string;
}

export interface StickyPageTocProps {
  readonly items: readonly StickyPageTocItem[];
}

/**
 * In-page nav for long pages only. Hidden on short pages and below `lg`
 * so mobile keeps a clean reading path (sticky CTA already covers conversion).
 */
export function StickyPageToc({ items }: StickyPageTocProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '');

  useEffect(() => {
    if (items.length === 0) return;

    const nodes = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => Boolean(node));

    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0]?.target.id;
        if (top) setActiveId(top);
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0.1, 0.35, 0.6] },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 4) return null;

  return (
    <nav
      aria-label="On this page"
      className="sticky top-0 z-20 hidden border-b border-ink-200 bg-white/95 backdrop-blur-sm lg:block"
    >
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={
                active
                  ? 'shrink-0 rounded-md bg-brand-900 px-3 py-1.5 text-xs font-semibold text-white'
                  : 'shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-100 hover:text-ink-900'
              }
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
