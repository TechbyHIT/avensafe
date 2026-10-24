import type { ReactNode } from 'react';

/**
 * Semantic headings. The `level` is the HTML element (`h1`–`h6`).
 * Appearance stays in `className` so a heading is never a styled div.
 */
const TAGS = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
} as const;

export type HeadingLevel = keyof typeof TAGS;

export interface HeadingProps {
  readonly level: HeadingLevel;
  readonly children: ReactNode;
  readonly className?: string;
  readonly id?: string;
}

export function Heading({ level, children, className, id }: HeadingProps) {
  const Tag = TAGS[level];
  return (
    <Tag {...(id ? { id } : {})} {...(className ? { className } : {})}>
      {children}
    </Tag>
  );
}

/**
 * First level that skips a step in document order (h2 followed by h4).
 * An empty list, or a list that starts below h1, is not itself a skip.
 */
export function firstSkippedHeadingLevel(
  levels: readonly HeadingLevel[],
): HeadingLevel | undefined {
  let previous = 0;
  for (const level of levels) {
    if (previous > 0 && level > previous + 1) return level;
    previous = level;
  }
  return undefined;
}
