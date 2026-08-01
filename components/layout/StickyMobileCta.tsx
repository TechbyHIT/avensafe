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
 * Floating circular CTAs: WhatsApp (official glyph) + Call (Avensafe mark).
 */
export function StickyMobileCta() {
  const message = `Hello ${business.shortName}, I want a free quotation. I will share a photo of the opening and my city/PIN.`;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 p-3 sm:p-4 md:hidden">
      <div className="pointer-events-auto ml-auto flex w-fit flex-col items-end gap-3">
        {/* WhatsApp — brand-green circle, official WhatsApp logo, Avensafe mark badge */}
        <a
          href={whatsappHref(message, whatsappPhone)}
          aria-label={`WhatsApp ${business.name} for a quotation`}
          data-no-underline=""
          className="relative grid h-16 w-16 place-items-center rounded-full bg-[#25D366] text-white no-underline shadow-[0_10px_28px_rgb(37_211_102/0.5)] ring-2 ring-white transition-transform active:scale-95"
        >
          <WhatsAppLogo />
          <span className="absolute -top-1 -left-1 grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-white shadow-md ring-1 ring-ink-200">
            <Image
              src="/brand/avensafe-mark.png"
              alt=""
              width={26}
              height={26}
              className="h-[22px] w-[22px] object-contain"
            />
          </span>
          <span className="sr-only">WhatsApp</span>
        </a>

        {/* Call — Avensafe mark as the button face + phone badge */}
        <a
          href={telHref(primaryPhone)}
          aria-label={`Call ${business.name} on ${primaryPhone.display}`}
          data-no-underline=""
          className="relative grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-white no-underline shadow-[0_10px_28px_rgb(15_31_51/0.35)] ring-2 ring-brand-800 transition-transform active:scale-95"
        >
          <Image
            src="/brand/avensafe-mark.png"
            alt=""
            width={48}
            height={48}
            priority
            className="h-12 w-12 object-contain"
          />
          <span className="absolute -right-0.5 -bottom-0.5 grid h-7 w-7 place-items-center rounded-full bg-brand-800 text-accent-400 shadow-md ring-2 ring-white">
            <PhoneLogo />
          </span>
          <span className="sr-only">Call {primaryPhone.display}</span>
        </a>
      </div>
    </div>
  );
}

/** Official-style WhatsApp glyph (white on green). */
function WhatsAppLogo() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

function PhoneLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.62 10.79a15.15 15.15 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z" />
    </svg>
  );
}
