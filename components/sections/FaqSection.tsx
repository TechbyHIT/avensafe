import Image from 'next/image';
import { Accordion } from '@/components/ui/Accordion';
import { Section } from '@/components/ui/Section';
import { getImageById } from '@/lib/data/repository';
import type { Faq, ImageRecord } from '@/lib/data/schemas';

export interface FaqSectionProps {
  readonly faqs: readonly Faq[];
  readonly heading?: string;
  readonly lede?: string;
  readonly image?: ImageRecord | undefined;
}

/**
 * FAQ block. The matching `FAQPage` structured data is emitted from the same
 * array by the schema engine, so the markup and the page always agree.
 */
export function FaqSection({
  faqs,
  heading = 'Questions we are asked most',
  lede,
  image,
}: FaqSectionProps) {
  if (faqs.length === 0) return null;

  const sideImage =
    image ?? getImageById('img-invisible-grills-09') ?? getImageById('img-safety-nets-06');

  return (
    <Section id="faq" tone="muted" width="wide" heading={heading} {...(lede ? { lede } : {})}>
      <div className="grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        {sideImage ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-(--radius-media) bg-ink-100 shadow-(--shadow-card) lg:sticky lg:top-28">
            <Image
              src={sideImage.src}
              alt={sideImage.alt}
              fill
              sizes="(min-width: 1024px) 35vw, 100vw"
              className="object-cover"
              loading="lazy"
            />
          </div>
        ) : null}
        <Accordion
          items={faqs.map((faq) => ({ id: faq.id, question: faq.question, answer: faq.answer }))}
        />
      </div>
    </Section>
  );
}
