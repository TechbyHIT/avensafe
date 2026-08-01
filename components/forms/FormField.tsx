import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface FormFieldProps {
  readonly id: string;
  readonly label: string;
  readonly children: ReactNode;
  readonly hint?: string;
  readonly errors?: readonly string[];
  readonly required?: boolean;
}

const controlClasses =
  'w-full rounded-(--radius-control) border border-ink-300 bg-white px-3 py-2.5 text-sm ' +
  'text-ink-900 placeholder:text-ink-400 aria-[invalid=true]:border-red-500';

export { controlClasses };

/**
 * Label, hint and error wiring for one control.
 *
 * The hint and error are linked with `aria-describedby` and errors are announced
 * via a live region, so a screen reader user hears why a submission failed
 * rather than only seeing red text.
 */
export function FormField({
  id,
  label,
  children,
  hint,
  errors,
  required = false,
}: FormFieldProps) {
  const hasError = Boolean(errors && errors.length > 0);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink-800">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-red-600">
            *
          </span>
        ) : (
          <span className="ml-1 text-xs font-normal text-ink-500">(optional)</span>
        )}
      </label>

      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-ink-500">
          {hint}
        </p>
      ) : null}

      <div className="mt-2">{children}</div>

      <p
        id={`${id}-error`}
        role={hasError ? 'alert' : undefined}
        className={cn('mt-1.5 text-xs text-red-600', !hasError && 'hidden')}
      >
        {errors?.join(' ')}
      </p>
    </div>
  );
}

/** Builds the `aria-describedby` value for a control with a hint and/or error. */
export function describedBy(id: string, hasHint: boolean, hasError: boolean): string | undefined {
  const ids = [hasHint ? `${id}-hint` : null, hasError ? `${id}-error` : null].filter(
    (value): value is string => value !== null,
  );
  return ids.length > 0 ? ids.join(' ') : undefined;
}
