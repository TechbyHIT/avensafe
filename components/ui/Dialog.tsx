'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface DialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: ReactNode;
  /** `modal` centres a panel; `drawer` slides in from the right. */
  readonly variant?: 'modal' | 'drawer';
}

/**
 * Built on the native `<dialog>` element, which supplies focus trapping, focus
 * restoration, Escape-to-close and the top layer without us reimplementing any
 * of it. We only add the backdrop click and the presentation.
 */
export function Dialog({ open, onClose, title, children, variant = 'modal' }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  // `close` fires for Escape as well as programmatic closing, so parent state
  // stays in step however the dialog was dismissed.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleClose = () => onClose();
    element.addEventListener('close', handleClose);
    return () => element.removeEventListener('close', handleClose);
  }, [onClose]);

  const isDrawer = variant === 'drawer';

  return (
    <dialog
      ref={ref}
      aria-label={title}
      className={cn(
        'backdrop:bg-ink-950/50 m-0 max-h-none max-w-none bg-transparent p-0',
        isDrawer ? 'ml-auto h-full w-full max-w-sm' : 'mx-auto my-8 w-full max-w-lg',
      )}
      onClick={(event) => {
        // Clicks land on the dialog itself only when they hit the backdrop,
        // because the panel below stops propagation.
        if (event.target === ref.current) onClose();
      }}
    >
      <div
        className={cn(
          'flex flex-col bg-white shadow-(--shadow-raised)',
          isDrawer ? 'h-full' : 'rounded-(--radius-card)',
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-200 px-5 py-4">
          <h2 className="text-base font-semibold text-ink-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-(--radius-control) p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-800"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </dialog>
  );
}
