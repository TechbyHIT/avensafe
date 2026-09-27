import { CtaSection } from '@/components/sections/CtaSection';
import { ThoughtfulFitting } from '@/components/sections/EverSafeBlocks';
import { FaqSection } from '@/components/sections/FaqSection';
import { InstallProcess } from '@/components/sections/MarketingSections';
import {
  CompactInstallProcess,
  EnquiryPhotoCallout,
  PageTrustStrip,
  PriceFactorsPanel,
} from '@/components/sections/LocationPageEnhancements';
import type { Faq, ImageRecord, Service } from '@/lib/data/schemas';

export interface StaticConversionRailProps {
  readonly enquiryContext?: string;
  readonly placeLabel?: string;
  readonly faqs?: readonly Faq[];
  readonly faqHeading?: string;
  /** Full 4-step gallery process vs compact row (EverSafe-style mid pages). */
  readonly processVariant?: 'compact' | 'full';
  readonly ctaHeading?: string;
  readonly ctaBody?: string;
  readonly showTrustStrip?: boolean;
  readonly service?: Service;
  readonly fittingImage?: ImageRecord;
}

/**
 * EverSafe-style conversion stack: trust → thoughtful fitting → process →
 * pricing literacy → photo estimate → optional FAQ → closing CTA.
 */
export function StaticConversionRail({
  enquiryContext = 'Website enquiry',
  placeLabel = 'your city',
  faqs,
  faqHeading = 'Helpful answers before you book',
  processVariant = 'compact',
  ctaHeading,
  ctaBody,
  showTrustStrip = true,
  service,
  fittingImage,
}: StaticConversionRailProps) {
  return (
    <>
      {showTrustStrip ? <PageTrustStrip /> : null}
      <ThoughtfulFitting
        placeLabel={placeLabel}
        {...(service ? { service } : {})}
        {...(fittingImage ? { image: fittingImage } : {})}
      />
      {processVariant === 'full' ? <InstallProcess /> : <CompactInstallProcess />}
      <PriceFactorsPanel placeLabel={placeLabel} enquiryContext={enquiryContext} />
      <EnquiryPhotoCallout placeLabel={placeLabel} enquiryContext={enquiryContext} />
      {faqs && faqs.length > 0 ? <FaqSection faqs={faqs} heading={faqHeading} /> : null}
      <CtaSection
        emphasis="photo"
        enquiryContext={enquiryContext}
        {...(ctaHeading ? { heading: ctaHeading } : {})}
        {...(ctaBody ? { body: ctaBody } : {})}
      />
    </>
  );
}
