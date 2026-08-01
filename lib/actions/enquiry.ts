'use server';

import { business, primaryPhone } from '@/config/business';
import {
  enquirySchema,
  type EnquiryFormState,
} from '@/lib/actions/enquiry-schema';

/**
 * Handles enquiry submissions.
 *
 * There is no database in this project by design, so a validated enquiry is
 * forwarded to whatever endpoint `LEAD_WEBHOOK_URL` points at (an email relay,
 * a CRM inbox, an automation service). When that is not configured the action
 * says so plainly and points the visitor at the phone number, rather than
 * showing a success message for a message that went nowhere.
 */
export async function submitEnquiry(
  _previous: EnquiryFormState,
  formData: FormData,
): Promise<EnquiryFormState> {
  const parsed = enquirySchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    email: formData.get('email') ?? '',
    service: formData.get('service') ?? undefined,
    location: formData.get('location') ?? '',
    propertyType: formData.get('propertyType') ?? undefined,
    message: formData.get('message'),
    consent: formData.get('consent') ?? '',
    company: formData.get('company') ?? '',
  });

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    return {
      status: 'invalid',
      message: 'Please correct the highlighted fields and try again.',
      errors: flattened.fieldErrors as Record<string, string[]>,
    };
  }

  const endpoint = process.env.LEAD_WEBHOOK_URL;

  if (!endpoint) {
    // Deliberately not a success state: nothing has been delivered.
    console.warn(
      '[enquiry] LEAD_WEBHOOK_URL is not configured; enquiry was validated but not delivered.',
    );
    return {
      status: 'unconfigured',
      message: `We could not submit the form because message delivery is not set up yet. Please call or WhatsApp us on ${primaryPhone.display} and we will pick it up straight away.`,
      errors: {},
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        receivedAt: new Date().toISOString(),
        site: business.url,
        enquiry: parsed.data,
      }),
      cache: 'no-store',
    });

    if (!response.ok) throw new Error(`Lead endpoint responded ${response.status}`);

    return {
      status: 'delivered',
      message: `Thank you. We have your enquiry and will call you on the number you gave us, usually the same working day.`,
      errors: {},
    };
  } catch (error) {
    console.error('[enquiry] delivery failed', error);
    return {
      status: 'error',
      message: `Something went wrong sending your enquiry. Please call or WhatsApp us on ${primaryPhone.display} instead.`,
      errors: {},
    };
  }
}
