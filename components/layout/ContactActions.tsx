import type { ReactNode } from 'react';
import { business, primaryPhone, telHref, whatsappHref, whatsappPhone } from '@/config/business';
import { STATIC_ROUTES } from '@/config/routes';
import { ButtonLink, type ButtonStyleProps } from '@/components/ui/Button';
import type { CtaEmphasis } from '@/lib/layout/recipes';

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M3.7 1.5a1.3 1.3 0 0 1 1.8.3l1.2 1.7c.3.4.3 1 0 1.4l-.7.9c-.2.2-.2.5 0 .8.5.9 1.5 1.9 2.4 2.4.3.2.6.2.8 0l.9-.7c.4-.3 1-.3 1.4 0l1.7 1.2c.6.4.7 1.2.3 1.8l-.6.8c-.5.7-1.4 1-2.2.8-1.9-.5-3.7-1.6-5.1-3C4.2 9.2 3.1 7.4 2.6 5.5c-.2-.8.1-1.7.8-2.2l.3-.2Z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 1.3a6.6 6.6 0 0 0-5.7 10l-.9 3.3 3.4-.9A6.6 6.6 0 1 0 8 1.3Zm3.8 9.3c-.2.5-1 .9-1.4.9-.4 0-1.5-.2-2.9-1.4-1.4-1.2-1.8-2.2-1.9-2.6-.1-.4.2-1.2.6-1.5.2-.1.4-.1.5 0l.6 1c.1.2.1.3 0 .4l-.3.4c-.1.1-.1.2 0 .4.3.5.9 1 1.4 1.3.2.1.3.1.4 0l.4-.4c.1-.1.3-.1.4 0l1 .5c.2.1.2.3.2.5Z" />
  </svg>
);

export interface ContactActionsProps extends ButtonStyleProps {
  /** Prefills the WhatsApp message so the enquiry arrives with context. */
  readonly enquiryContext?: string;
  readonly layout?: 'row' | 'stack';
  /** Journey-aware primary action ordering and labels. */
  readonly emphasis?: CtaEmphasis;
}

type ActionKey = 'photo' | 'call' | 'quote';

function orderFor(emphasis: CtaEmphasis): readonly ActionKey[] {
  switch (emphasis) {
    case 'call':
      return ['call', 'photo', 'quote'];
    case 'survey':
      return ['quote', 'photo', 'call'];
    case 'explore':
      return ['quote', 'call', 'photo'];
    case 'photo':
    default:
      return ['photo', 'call', 'quote'];
  }
}

/**
 * Call and WhatsApp buttons. Numbers and links come from the business config, so
 * a phone number change is a one-line edit rather than a search across pages.
 */
export function ContactActions({
  enquiryContext,
  layout = 'row',
  variant = 'accent',
  size = 'md',
  className,
  emphasis = 'photo',
}: ContactActionsProps) {
  const message = enquiryContext
    ? `Hello ${business.shortName}, I want an estimate for ${enquiryContext}. I will share a photo of the opening and my city/PIN.`
    : `Hello ${business.shortName}, I want an estimate. I will share a photo of the opening and my city/PIN.`;

  const outlineVariant = variant === 'inverse' ? 'heroOutline' : 'outline';
  const callVariant = variant === 'primary' ? 'accent' : variant;

  const actions: Record<ActionKey, ReactNode> = {
    photo: (
      <ButtonLink
        key="photo"
        href={whatsappHref(message, whatsappPhone)}
        variant={emphasis === 'explore' ? outlineVariant : 'whatsapp'}
        size={size}
        className={className}
        ariaLabel={`Send a photo to ${business.name} on WhatsApp for an estimate`}
      >
        <WhatsAppIcon />
        {emphasis === 'explore' ? 'WhatsApp a photo' : 'Send Photo for Estimate'}
      </ButtonLink>
    ),
    call: (
      <ButtonLink
        key="call"
        href={telHref(primaryPhone)}
        variant={emphasis === 'call' ? (variant === 'inverse' ? 'accent' : callVariant) : outlineVariant}
        size={size}
        className={className}
        ariaLabel={`Call ${business.name} on ${primaryPhone.display}`}
      >
        <PhoneIcon />
        Call {primaryPhone.display}
      </ButtonLink>
    ),
    quote: (
      <ButtonLink
        key="quote"
        href={STATIC_ROUTES.contact}
        variant={
          emphasis === 'survey' || emphasis === 'explore'
            ? variant === 'inverse'
              ? 'accent'
              : 'primary'
            : outlineVariant
        }
        size={size}
        className={className}
        ariaLabel={
          emphasis === 'survey'
            ? `Book a free survey with ${business.name}`
            : `Get a free quote from ${business.name}`
        }
      >
        {emphasis === 'survey' ? 'Book Free Survey' : emphasis === 'explore' ? 'Ask a Question' : 'Get Free Quote'}
      </ButtonLink>
    ),
  };

  return (
    <div
      className={
        layout === 'row' ? 'flex flex-wrap items-center gap-3' : 'flex flex-col gap-3'
      }
    >
      {orderFor(emphasis).map((key) => actions[key])}
    </div>
  );
}
