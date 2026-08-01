'use client';

import { useEffect } from 'react';
import { primaryPhone, telHref } from '@/config/business';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

/**
 * Route-level error boundary. Client-side by necessity, since it receives the
 * `reset` callback and must render after hydration.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  useEffect(() => {
    console.error('[route error]', error);
  }, [error]);

  return (
    <Container width="prose">
      <div className="py-24">
        <h1 className="text-3xl sm:text-4xl">Something went wrong on this page</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-600">
          This is our fault rather than yours. Try again, and if it keeps happening please call us on{' '}
          <a href={telHref(primaryPhone)} className="font-medium text-brand-800">
            {primaryPhone.display}
          </a>{' '}
          and we will help directly.
        </p>

        {error.digest ? (
          <p className="mt-4 text-xs text-ink-500">
            Reference: <code>{error.digest}</code>
          </p>
        ) : null}

        <div className="mt-8">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
        </div>
      </div>
    </Container>
  );
}
