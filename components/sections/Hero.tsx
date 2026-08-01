import Image from 'next/image';
import type { ReactNode } from 'react';
import { ContactActions } from '@/components/layout/ContactActions';
import { Container } from '@/components/ui/Container';
import type { CtaEmphasis, HeroVariant } from '@/lib/layout/recipes';
import type { ImageRecord } from '@/lib/data/schemas';

export interface HeroProps {
  /** The page's only `h1`. */
  readonly heading: string;
  readonly lede: string;
  readonly eyebrow?: string;
  readonly image?: ImageRecord | undefined;
  readonly enquiryContext?: string;
  readonly variant?: HeroVariant;
  readonly ctaEmphasis?: CtaEmphasis;
  readonly children?: ReactNode;
}

/**
 * Intent-aware hero. Variant is chosen by the layout recipe so commercial,
 * local, and informational pages do not share one visual flow.
 */
export function Hero({
  heading,
  lede,
  eyebrow,
  image,
  enquiryContext,
  variant = 'fullBleed',
  ctaEmphasis = 'photo',
  children,
}: HeroProps) {
  if (variant === 'editorial') {
    return (
      <div className="border-b border-ink-200 bg-ink-50">
        <Container width="wide">
          <div className="max-w-3xl py-12 sm:py-16 lg:py-20">
            {eyebrow ? (
              <p className="text-xs font-semibold tracking-widest text-brand-800 uppercase">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="mt-3 text-3xl leading-tight font-bold text-ink-900 sm:text-4xl lg:text-[2.5rem]">
              {heading}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-700 sm:text-lg">
              {lede}
            </p>
            {children ? <div className="mt-6">{children}</div> : null}
            <div className="mt-8">
              <ContactActions
                size="lg"
                emphasis={ctaEmphasis}
                {...(enquiryContext ? { enquiryContext } : {})}
              />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="relative isolate overflow-hidden border-b border-ink-200 bg-brand-950 text-white">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
        ) : null}
        <div aria-hidden="true" className="absolute inset-0 bg-brand-950/85" />
        <Container width="wide" className="relative z-10">
          <div className="max-w-3xl py-8 sm:py-10">
            {eyebrow ? (
              <p className="inline-flex rounded-full bg-accent-500 px-3 py-1 text-[11px] font-bold tracking-wide text-accent-ink uppercase">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="mt-3 text-2xl leading-tight font-bold text-white sm:text-3xl">
              {heading}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
              {lede}
            </p>
            <div className="mt-6">
              <ContactActions
                variant="inverse"
                size="md"
                emphasis={ctaEmphasis}
                {...(enquiryContext ? { enquiryContext } : {})}
              />
            </div>
            {children ? <div className="mt-6">{children}</div> : null}
          </div>
        </Container>
      </div>
    );
  }

  if (variant === 'split') {
    return (
      <div className="border-b border-ink-200 bg-brand-950 text-white">
        <Container width="wide">
          <div className="grid items-center gap-8 py-12 lg:grid-cols-2 lg:gap-12 lg:py-16">
            <div>
              {eyebrow ? (
                <p className="inline-flex rounded-full bg-accent-500 px-3 py-1 text-[11px] font-bold tracking-wide text-accent-ink uppercase">
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="mt-4 text-3xl leading-tight font-bold text-white sm:text-4xl">
                {heading}
              </h1>
              <p className="mt-5 text-base leading-relaxed text-white/90 sm:text-lg">{lede}</p>
              <div className="mt-8">
                <ContactActions
                  variant="inverse"
                  size="lg"
                  emphasis={ctaEmphasis}
                  {...(enquiryContext ? { enquiryContext } : {})}
                />
              </div>
              {children ? <div className="mt-8">{children}</div> : null}
            </div>
            {image ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-(--radius-card) border border-white/15 bg-brand-900">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div
                aria-hidden="true"
                className="hidden aspect-[4/3] rounded-(--radius-card) border border-white/10 bg-brand-900 lg:block"
              />
            )}
          </div>
        </Container>
      </div>
    );
  }

  // fullBleed (default)
  return (
    <div className="relative isolate overflow-hidden border-b border-ink-200 bg-brand-950 text-white">
      {image ? (
        <>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-r from-brand-950 via-brand-950/88 to-brand-900/55"
          />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-br from-brand-950 via-brand-900 to-brand-800"
        />
      )}

      <Container width="wide" className="relative z-10">
        <div className="max-w-3xl py-12 sm:py-16 lg:py-20">
          {eyebrow ? (
            <p className="inline-flex rounded-full bg-accent-500 px-3 py-1 text-[11px] font-bold tracking-wide text-accent-ink uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-4 text-3xl leading-tight font-bold text-white sm:text-4xl lg:text-[2.65rem]">
            {heading}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
            {lede}
          </p>

          <div className="mt-8">
            <ContactActions
              variant="inverse"
              size="lg"
              emphasis={ctaEmphasis}
              {...(enquiryContext ? { enquiryContext } : {})}
            />
          </div>

          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </Container>
    </div>
  );
}
