'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { controlClasses, describedBy, FormField } from '@/components/forms/FormField';
import { submitEnquiry } from '@/lib/actions/enquiry';
import { initialEnquiryState } from '@/lib/actions/enquiry-schema';
import { cn } from '@/lib/utils/cn';

export interface ServiceOption {
  readonly slug: string;
  readonly name: string;
}

export interface EnquiryFormProps {
  readonly services: readonly ServiceOption[];
  /** Preselects a service, e.g. on a service page. */
  readonly defaultService?: string;
  /** Prefills the location, e.g. on a city or area page. */
  readonly defaultLocation?: string;
  readonly submitLabel?: string;
  /** `quote` asks for property type; `contact` keeps the form short. */
  readonly variant?: 'quote' | 'contact';
}

/**
 * The single enquiry form implementation, driven by a Server Action.
 *
 * Validation lives in one Zod schema on the server, so the browser cannot bypass
 * it, and the same schema produces the inline field errors shown here. Native
 * `required` and `type` attributes give immediate client-side feedback without
 * duplicating the rules.
 */
export function EnquiryForm({
  services,
  defaultService,
  defaultLocation,
  submitLabel = 'Request a survey',
  variant = 'quote',
}: EnquiryFormProps) {
  const [state, formAction, isPending] = useActionState(submitEnquiry, initialEnquiryState);
  const { errors } = state;

  const banner =
    state.status === 'idle'
      ? null
      : {
          delivered: 'border-brand-600 bg-brand-50 text-brand-900',
          unconfigured: 'border-amber-500 bg-amber-50 text-amber-900',
          invalid: 'border-red-500 bg-red-50 text-red-900',
          error: 'border-red-500 bg-red-50 text-red-900',
          idle: '',
        }[state.status];

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {banner ? (
        <p
          role={state.status === 'delivered' ? 'status' : 'alert'}
          className={cn('rounded-(--radius-control) border px-4 py-3 text-sm', banner)}
        >
          {state.message}
        </p>
      ) : null}

      {/* Honeypot: hidden from people, tempting to bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="name" label="Your name" required errors={errors['name']}>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={controlClasses}
            aria-invalid={Boolean(errors['name'])}
            aria-describedby={describedBy('name', false, Boolean(errors['name']))}
          />
        </FormField>

        <FormField
          id="phone"
          label="Phone"
          required
          hint="We call back on this number."
          errors={errors['phone']}
        >
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="98765 43210"
            className={controlClasses}
            aria-invalid={Boolean(errors['phone'])}
            aria-describedby={describedBy('phone', true, Boolean(errors['phone']))}
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="email" label="Email" errors={errors['email']}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={controlClasses}
            aria-invalid={Boolean(errors['email'])}
            aria-describedby={describedBy('email', false, Boolean(errors['email']))}
          />
        </FormField>

        <FormField
          id="location"
          label="Locality or city"
          hint="Helps us confirm coverage and travel."
          errors={errors['location']}
        >
          <input
            id="location"
            name="location"
            type="text"
            defaultValue={defaultLocation}
            autoComplete="address-level2"
            className={controlClasses}
            aria-invalid={Boolean(errors['location'])}
            aria-describedby={describedBy('location', true, Boolean(errors['location']))}
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="service" label="Service needed" errors={errors['service']}>
          <select
            id="service"
            name="service"
            defaultValue={defaultService ?? ''}
            className={controlClasses}
            aria-invalid={Boolean(errors['service'])}
          >
            <option value="">Not sure yet</option>
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.name}
              </option>
            ))}
          </select>
        </FormField>

        {variant === 'quote' ? (
          <FormField id="propertyType" label="Property type" errors={errors['propertyType']}>
            <select id="propertyType" name="propertyType" className={controlClasses} defaultValue="">
              <option value="">Not specified</option>
              <option value="apartment">Apartment or gated community</option>
              <option value="independent-house">Independent house or villa</option>
              <option value="commercial">Commercial building</option>
              <option value="industrial">Industrial premises</option>
              <option value="other">Something else</option>
            </select>
          </FormField>
        ) : null}
      </div>

      <FormField
        id="message"
        label="What do you need?"
        required
        hint="Approximate balcony size, which floor, and what you are trying to prevent."
        errors={errors['message']}
      >
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className={controlClasses}
          aria-invalid={Boolean(errors['message'])}
          aria-describedby={describedBy('message', true, Boolean(errors['message']))}
        />
      </FormField>

      <FormField id="consent" label="Consent" required errors={errors['consent']}>
        <label htmlFor="consent" className="flex items-start gap-3 text-sm text-ink-600">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 rounded border-ink-300"
            aria-invalid={Boolean(errors['consent'])}
          />
          <span>
            You may contact me about this enquiry by phone, WhatsApp or email. We use these details
            only to respond to it.
          </span>
        </label>
      </FormField>

      <Button type="submit" size="lg" disabled={isPending} aria-disabled={isPending}>
        {isPending ? 'Sending…' : submitLabel}
      </Button>
    </form>
  );
}
