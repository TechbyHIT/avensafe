import Image from 'next/image';
import { ContactActions } from '@/components/layout/ContactActions';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { STATIC_ROUTES } from '@/config/routes';
import { getImageById } from '@/lib/data/repository';
import type { CtaEmphasis } from '@/lib/layout/recipes';

export interface CtaSectionProps {
  readonly heading?: string;
  readonly body?: string;
  /** Prefills the WhatsApp enquiry with what the visitor was reading about. */
  readonly enquiryContext?: string;
  readonly emphasis?: CtaEmphasis;
}

const COPY: Record<
  CtaEmphasis,
  {
    readonly eyebrow: string;
    readonly defaultHeading: string;
    readonly defaultBody: string;
    readonly imageId: string;
  }
> = {
  photo: {
    eyebrow: 'Photo estimate',
    defaultHeading: 'Send a clear photo of the opening',
    defaultBody:
      'WhatsApp a balcony, window, or duct photo with your city. We reply with the system options that fit and what a written quote should include — no rate-card guesswork.',
    imageId: 'img-invisible-grills-03',
  },
  call: {
    eyebrow: 'Talk to a planner',
    defaultHeading: 'Call now if you need a visit this week',
    defaultBody:
      'Speak with the team about access, floor, and opening type. We schedule a short survey and send the quotation in writing after measuring on site.',
    imageId: 'img-safety-nets-03',
  },
  survey: {
    eyebrow: 'Free survey',
    defaultHeading: 'Get a firm price after a twenty-minute survey',
    defaultBody:
      'We measure every bay, check what we are fixing into, and quote the grade and spacing in writing. No rate per square foot, because it would be wrong for most properties.',
    imageId: 'img-invisible-grills-07',
  },
  explore: {
    eyebrow: 'Next step',
    defaultHeading: 'Still comparing options? Ask a specific question',
    defaultBody:
      'Tell us the opening type, floor, and what you are trying to solve. We point you to the right system page or book a survey when you are ready.',
    imageId: 'img-safety-nets-05',
  },
};

export function CtaSection({
  heading,
  body,
  enquiryContext,
  emphasis = 'survey',
}: CtaSectionProps) {
  const copy = COPY[emphasis];
  const image = getImageById(copy.imageId) ?? getImageById('img-hero-home');

  return (
    <div className="bg-brand-900 py-(--spacing-section)">
      <Container width="wide">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
            <p className="text-xs font-semibold tracking-widest text-accent-400 uppercase">
              {copy.eyebrow}
            </p>
            <h2 className="mt-2 text-2xl text-white sm:text-3xl">
              {heading ?? copy.defaultHeading}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-brand-100 lg:mx-0">
              {body ?? copy.defaultBody}
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 lg:items-start">
              <ContactActions
                variant="inverse"
                size="lg"
                emphasis={emphasis}
                {...(enquiryContext ? { enquiryContext } : {})}
              />
              {emphasis !== 'explore' ? (
                <ButtonLink
                  href={STATIC_ROUTES.contact}
                  variant="ghost"
                  className="text-brand-100 hover:bg-brand-800"
                >
                  Or send the details in a form
                </ButtonLink>
              ) : (
                <ButtonLink
                  href={STATIC_ROUTES.services}
                  variant="ghost"
                  className="text-brand-100 hover:bg-brand-800"
                >
                  Browse all services
                </ButtonLink>
              )}
            </div>
          </div>
          {image ? (
            <div className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-(--radius-media) border border-white/15 shadow-(--shadow-raised) lg:max-w-none">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
          ) : null}
        </div>
      </Container>
    </div>
  );
}
