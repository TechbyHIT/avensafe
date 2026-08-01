import { z } from 'zod';

/**
 * Validation contract for enquiry submissions.
 *
 * Kept separate from the Server Action because a `'use server'` module may only
 * export async functions, and both the action and the client form need these
 * types.
 */

/** Accepts Indian mobile numbers with or without the country code or spacing. */
const phone = z
  .string()
  .trim()
  .min(10, 'Enter a phone number we can reach you on')
  .transform((value) => value.replace(/[\s\-()]/gu, ''))
  .refine((value) => /^(?:\+?91)?[6-9]\d{9}$/u.test(value), {
    message: 'Enter a valid 10-digit Indian mobile number',
  });

export const enquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please tell us your name')
    .max(80, 'Please use a shorter name'),
  phone,
  email: z
    .union([z.string().trim().email('Enter a valid email address'), z.literal('')])
    .optional()
    .transform((value) => (value === '' ? undefined : value)),
  /** Slug of the service being enquired about, when the form knows it. */
  service: z.string().trim().max(80).optional(),
  location: z
    .string()
    .trim()
    .max(120, 'Please keep the location short')
    .optional()
    .transform((value) => (value === '' ? undefined : value)),
  propertyType: z
    .enum(['apartment', 'independent-house', 'commercial', 'industrial', 'other'])
    .optional(),
  message: z
    .string()
    .trim()
    .min(10, 'A sentence or two about the job helps us quote accurately')
    .max(1200, 'Please keep the message under 1200 characters'),
  consent: z.literal('on', {
    errorMap: () => ({ message: 'Please confirm we may contact you about this enquiry' }),
  }),
  /** Honeypot. Bots fill hidden fields; people do not. */
  company: z.string().max(0).optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export type EnquiryStatus = 'idle' | 'delivered' | 'unconfigured' | 'invalid' | 'error';

export interface EnquiryFormState {
  readonly status: EnquiryStatus;
  readonly message: string;
  /** Field-level errors keyed by input name, for inline display. */
  readonly errors: Readonly<Record<string, readonly string[]>>;
}

export const initialEnquiryState: EnquiryFormState = {
  status: 'idle',
  message: '',
  errors: {},
};
