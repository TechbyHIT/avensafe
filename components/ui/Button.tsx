import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

const variants = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900',
  secondary: 'bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950',
  outline: 'border border-ink-300 bg-white text-ink-800 hover:bg-ink-50 active:bg-ink-100',
  ghost: 'text-brand-700 hover:bg-brand-50 active:bg-brand-100',
  inverse: 'bg-white text-brand-900 hover:bg-brand-50 active:bg-brand-100',
  accent:
    'bg-accent-500 text-accent-ink shadow-(--shadow-accent) hover:bg-accent-600 active:bg-accent-700',
  whatsapp: 'bg-wa-500 text-white hover:bg-wa-600 active:bg-wa-700',
  dark: 'bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950',
  heroOutline:
    'border border-white/70 bg-black/25 text-white hover:bg-black/40 active:bg-black/50',
} as const;

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
} as const;

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold ' +
  'transition-[colors,box-shadow,transform] duration-150 no-underline ' +
  'disabled:pointer-events-none disabled:opacity-50';

export interface ButtonStyleProps {
  readonly variant?: keyof typeof variants;
  readonly size?: keyof typeof sizes;
  readonly fullWidth?: boolean;
  readonly className?: string;
}

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
}: ButtonStyleProps = {}): string {
  return cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className);
}

export interface ButtonProps extends ButtonStyleProps, Omit<ComponentProps<'button'>, 'className'> {
  readonly children: ReactNode;
}

export function Button({ children, variant, size, fullWidth, className, ...rest }: ButtonProps) {
  return (
    <button className={buttonClasses({ variant, size, fullWidth, className })} {...rest}>
      {children}
    </button>
  );
}

export interface ButtonLinkProps extends ButtonStyleProps {
  readonly href: string;
  readonly children: ReactNode;
  readonly prefetch?: boolean;
  /** Set for `tel:`, `mailto:` and external URLs, which must not use next/link. */
  readonly external?: boolean;
  readonly ariaLabel?: string;
}

/**
 * Link styled as a button. External and protocol links render a plain anchor,
 * since next/link's client navigation does not apply to them.
 */
export function ButtonLink({
  href,
  children,
  variant,
  size,
  fullWidth,
  className,
  prefetch,
  external,
  ariaLabel,
}: ButtonLinkProps) {
  const classes = buttonClasses({ variant, size, fullWidth, className });
  const isProtocolLink = /^(tel:|mailto:|https?:)/u.test(href);

  if (external || isProtocolLink) {
    return (
      <a
        href={href}
        className={classes}
        data-no-underline=""
        {...(ariaLabel ? { 'aria-label': ariaLabel } : {})}
        {...(href.startsWith('http') ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={classes}
      data-no-underline=""
      {...(prefetch === false ? { prefetch: false } : {})}
      {...(ariaLabel ? { 'aria-label': ariaLabel } : {})}
    >
      {children}
    </Link>
  );
}
