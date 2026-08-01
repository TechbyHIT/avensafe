'use client';

import Image from 'next/image';
import {
  business,
  primaryPhone,
  telHref,
  whatsappHref,
  whatsappPhone,
} from '@/config/business';

/**
 * Circular floating Call + Quote buttons with the Avensafe mark.
 */
export function StickyMobileCta() {
  const message = `Hello ${business.shortName}, I want a free quotation. I will share a photo of the opening and my city/PIN.`;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 p-4 md:hidden">
      <div className="pointer-events-auto ml-auto flex w-fit flex-col items-end gap-3">
        <a
          href={whatsappHref(message, whatsappPhone)}
          aria-label={`Get a quotation from ${business.name} on WhatsApp`}
          data-no-underline=""
          className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-full border-2 border-wa-500 bg-white no-underline shadow-[0_8px_24px_rgb(37_211_102/0.35)] transition-transform active:scale-95"
        >
          <Image
            src="/brand/avensafe-mark.png"
            alt=""
            width={40}
            height={40}
            className="h-9 w-9 object-contain"
          />
          <span className="absolute -right-0.5 -bottom-0.5 grid h-6 w-6 place-items-center rounded-full bg-wa-500 text-white shadow-sm">
            <WhatsAppBadge />
          </span>
          <span className="sr-only">WhatsApp quotation</span>
        </a>
        <a
          href={telHref(primaryPhone)}
          aria-label={`Call ${business.name} on ${primaryPhone.display}`}
          data-no-underline=""
          className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-full border-2 border-brand-800 bg-white no-underline shadow-[0_8px_24px_rgb(15_31_51/0.35)] transition-transform active:scale-95"
        >
          <Image
            src="/brand/avensafe-mark.png"
            alt=""
            width={40}
            height={40}
            className="h-9 w-9 object-contain"
          />
          <span className="absolute -right-0.5 -bottom-0.5 grid h-6 w-6 place-items-center rounded-full bg-brand-800 text-accent-400 shadow-sm">
            <PhoneBadge />
          </span>
          <span className="sr-only">Call {primaryPhone.display}</span>
        </a>
      </div>
    </div>
  );
}

function PhoneBadge() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M3.7 1.5a1.3 1.3 0 0 1 1.8.3l1.2 1.7c.3.4.3 1 0 1.4l-.7.9c-.2.2-.2.5 0 .8.5.9 1.5 1.9 2.4 2.4.3.2.6.2.8 0l.9-.7c.4-.3 1-.3 1.4 0l1.7 1.2c.6.4.7 1.2.3 1.8l-.6.8c-.5.7-1.4 1-2.2.8-1.9-.5-3.7-1.6-5.1-3C4.2 9.2 3.1 7.4 2.6 5.5c-.2-.8.1-1.7.8-2.2l.3-.2Z" />
    </svg>
  );
}

function WhatsAppBadge() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 1.3a6.6 6.6 0 0 0-5.7 10l-.9 3.3 3.4-.9A6.6 6.6 0 1 0 8 1.3Zm3.8 9.3c-.2.5-1 .9-1.4.9-.4 0-1.5-.2-2.9-1.4-1.4-1.2-1.8-2.2-1.9-2.6-.1-.4.2-1.2.6-1.5.2-.1.4-.1.5 0l.6 1c.1.2.1.3 0 .4l-.3.4c-.1.1-.1.2 0 .4.3.5.9 1 1.4 1.3.2.1.3.1.4 0l.4-.4c.1-.1.3-.1.4 0l1 .5c.2.1.2.3.2.5Z" />
    </svg>
  );
}
