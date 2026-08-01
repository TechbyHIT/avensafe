import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

const widths = {
  prose: 'max-w-3xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
} as const;

export interface ContainerProps {
  readonly children: ReactNode;
  readonly width?: keyof typeof widths;
  readonly className?: string;
}

/** Horizontal gutter and max width. The only place page width is decided. */
export function Container({ children, width = 'default', className }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', widths[width], className)}>
      {children}
    </div>
  );
}
