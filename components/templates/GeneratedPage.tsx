import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/layout/JsonLd';
import { StickyPageToc } from '@/components/layout/StickyPageToc';
import { ContentModules } from '@/components/sections/ContentModules';
import { CtaSection } from '@/components/sections/CtaSection';
import { FaqSection } from '@/components/sections/FaqSection';
import { Hero } from '@/components/sections/Hero';
import { ExploreHub } from '@/components/sections/ExploreHub';
import { Testimonials } from '@/components/sections/Testimonials';
import { locationLabel } from '@/lib/routing/resolve';
import type { PageBundle } from '@/lib/routing/page-bundle';
import { buildPageGraph } from '@/lib/schema/page-graph';
import {
  getAreasByCity,
  getHomeGalleryImages,
  getImagesForService,
  getTestimonials,
} from '@/lib/data/repository';
import { InstallProcess, PageImageGallery } from '@/components/sections/MarketingSections';
import {
  CompactInstallProcess,
  EnquiryPhotoCallout,
  LocationServicesNav,
  PageTrustStrip,
  PriceFactorsPanel,
} from '@/components/sections/LocationPageEnhancements';
import { ServiceCoverage } from '@/components/sections/ServiceCoverage';
import { LocalityDirectory } from '@/components/sections/LocalityDirectory';
import { composeLayoutRecipe, type LayoutSectionId } from '@/lib/layout/recipes';
import type { ImageRecord } from '@/lib/data/schemas';
import type { ReactNode } from 'react';

export interface GeneratedPageProps {
  readonly bundle: PageBundle;
}

function isServiceLocationKind(kind: PageBundle['target']['kind']): boolean {
  return (
    kind === 'serviceInCity' ||
    kind === 'serviceInArea' ||
    kind === 'serviceInDistrict' ||
    kind === 'serviceInCityIntent' ||
    kind === 'serviceInAreaIntent'
  );
}

function isFullLandingKind(kind: PageBundle['target']['kind']): boolean {
  return kind === 'serviceInCity' || kind === 'serviceInArea';
}

/** Location-aware alts so gallery images stay unique per URL. */
function galleryImagesFor(
  images: readonly ImageRecord[],
  serviceName: string | undefined,
  place: string,
): readonly ImageRecord[] {
  if (!serviceName || !place) return images;
  return images.map((image, index) => ({
    ...image,
    id: `${image.id}-loc-${index}`,
    alt: `${serviceName} installation in ${place} — ${image.alt}`,
  }));
}

/**
 * Renders a programmatic page from a dynamic layout recipe.
 *
 * Section order, hero variant, CTA emphasis, and density are chosen per target
 * and available content — never a single universal template flow.
 */
export function GeneratedPage({ bundle }: GeneratedPageProps) {
  const { target, content, crumbs, linkGroups, primaryImage } = bundle;

  const place = locationLabel(target.location);
  const enquiryContext = target.service
    ? `${target.service.name}${place ? ` in ${place}` : ''}`
    : place || undefined;

  const eyebrow = target.service
    ? place || 'Service'
    : place
      ? 'Service area'
      : undefined;

  const isLocationHub =
    target.kind === 'city' ||
    target.kind === 'area' ||
    target.kind === 'state' ||
    target.kind === 'district';
  const isServiceHub = target.kind === 'service' || target.kind === 'serviceIntent';

  const fallbackGallery = getHomeGalleryImages(16);
  const serviceImages = target.service ? getImagesForService(target.service.id, 16) : [];
  /** Pad thin service catalogs so every content module / FAQ still rotates real photos. */
  const contentImages = (() => {
    if (serviceImages.length === 0) return [...fallbackGallery];
    if (serviceImages.length >= 8) return [...serviceImages];
    const seen = new Set(serviceImages.map((image) => image.id));
    const padded = [...serviceImages];
    for (const image of fallbackGallery) {
      if (padded.length >= 12) break;
      if (seen.has(image.id)) continue;
      seen.add(image.id);
      padded.push(image);
    }
    return padded;
  })();
  const galleryImages = isServiceLocationKind(target.kind)
    ? galleryImagesFor(contentImages, target.service?.name, place)
    : isLocationHub
      ? galleryImagesFor(
          fallbackGallery.length > 0 ? fallbackGallery : contentImages,
          'Installation',
          place,
        )
      : contentImages.length > 0
        ? contentImages
        : fallbackGallery;

  const testimonials = getTestimonials()
    .filter(
      (entry) =>
        !target.service ||
        entry.serviceIds.length === 0 ||
        entry.serviceIds.includes(target.service.id),
    )
    .slice(0, 6);

  const canShowLocalityDir = Boolean(
    target.location?.city &&
      target.location.state &&
      (target.kind === 'city' ||
        target.kind === 'area' ||
        target.kind === 'serviceInCity' ||
        target.kind === 'serviceInArea' ||
        target.kind === 'serviceInCityIntent' ||
        target.kind === 'serviceInAreaIntent') &&
      getAreasByCity(target.location.city.id).length > 0,
  );

  const recipe = composeLayoutRecipe(target, content, {
    hasGallery: galleryImages.length > 0,
    hasTestimonials: testimonials.length > 0,
    hasLocalityDir: canShowLocalityDir,
    hasCoverage: Boolean(isServiceHub && target.service),
  });

  const ctaHeading = isFullLandingKind(target.kind)
    ? `Get a free quote for ${target.service?.name ?? 'installation'} in ${place}`
    : isServiceHub
      ? `Book a survey for ${target.service?.name ?? 'installation'}`
      : undefined;
  const ctaBody = isFullLandingKind(target.kind)
    ? `Call, WhatsApp, or send the form — we measure openings in ${place}, confirm grade and spacing in writing, and schedule installation when access is ready.`
    : isServiceHub
      ? 'Share your city and a clear photo of the opening. We reply with the right system options and what a written quote should include.'
      : undefined;

  const faqHeading = place
    ? `Questions about ${target.service?.shortName ?? 'installation'} in ${place}`
    : undefined;

  const tocItems = [
    ...content.modules.slice(0, 10).map((module, index) => ({
      id: `module-${module.id}-${index}`,
      label: module.heading.length > 36 ? `${module.heading.slice(0, 34)}…` : module.heading,
    })),
    ...(content.faqs.length > 0 ? [{ id: 'faq', label: 'FAQs' }] : []),
    { id: 'page-cta', label: 'Get a quote' },
  ];

  const sectionMap: Record<LayoutSectionId, ReactNode> = {
    trustStrip: <PageTrustStrip />,
    compactProcess: <CompactInstallProcess />,
    servicesNav: <LocationServicesNav target={target} />,
    content: (
      <ContentModules
        modules={content.modules}
        images={contentImages.slice(0, 12)}
      />
    ),
    gallery: (
      <PageImageGallery
        images={galleryImages}
        {...(isServiceLocationKind(target.kind)
          ? {
              heading: `Project gallery — ${target.service?.name ?? 'installations'} in ${place}`,
            }
          : isLocationHub
            ? { heading: `Installation gallery — work like jobs in ${place}` }
            : isServiceHub
              ? { heading: `${target.service?.name ?? 'Project'} installation gallery` }
              : { heading: 'Installation gallery' })}
        maxImages={isFullLandingKind(target.kind) || isLocationHub ? 16 : 12}
      />
    ),
    priceFactors: place ? (
      <PriceFactorsPanel
        placeLabel={place}
        {...(target.service ? { serviceName: target.service.name } : {})}
        {...(enquiryContext ? { enquiryContext } : {})}
      />
    ) : target.service ? (
      <PriceFactorsPanel
        placeLabel="your city"
        serviceName={target.service.name}
        {...(enquiryContext ? { enquiryContext } : {})}
      />
    ) : null,
    photoEnquiry: place ? (
      <EnquiryPhotoCallout
        placeLabel={place}
        {...(enquiryContext ? { enquiryContext } : {})}
      />
    ) : target.service ? (
      <EnquiryPhotoCallout
        placeLabel="your city"
        enquiryContext={enquiryContext ?? target.service.name}
      />
    ) : null,
    serviceCoverage:
      target.service && isServiceHub ? (
        <ServiceCoverage
          service={target.service}
          {...(target.intent ? { intent: target.intent } : {})}
        />
      ) : null,
    localityDirectory:
      target.location?.city && target.location.state ? (
        <LocalityDirectory
          state={target.location.state}
          city={target.location.city}
          {...(target.service ? { service: target.service } : {})}
        />
      ) : null,
    testimonials:
      isServiceLocationKind(target.kind) || isLocationHub || isServiceHub ? (
        <Testimonials testimonials={testimonials} />
      ) : null,
    installProcess: target.service && !place ? <InstallProcess /> : null,
    faq: (
      <FaqSection
        faqs={content.faqs}
        {...(faqHeading ? { heading: faqHeading } : {})}
        {...(contentImages[0] ? { image: contentImages[0] } : {})}
      />
    ),
    cta: (
      <div id="page-cta">
        <CtaSection
          emphasis={recipe.ctaEmphasis}
          {...(enquiryContext ? { enquiryContext } : {})}
          {...(ctaHeading ? { heading: ctaHeading } : {})}
          {...(ctaBody ? { body: ctaBody } : {})}
        />
      </div>
    ),
    relatedLinks: (
      <ExploreHub
        groups={linkGroups}
        currentPath={target.path}
        mosaic={contentImages.slice(0, 4).map((image) => ({
          id: image.id,
          src: image.src,
          alt: image.alt,
        }))}
      />
    ),
  };

  return (
    <>
      <JsonLd graph={buildPageGraph(bundle)} />
      <Breadcrumbs crumbs={crumbs} />

      <Hero
        heading={content.h1}
        lede={content.lede}
        variant={recipe.heroVariant}
        ctaEmphasis={recipe.ctaEmphasis}
        image={primaryImage}
        {...(eyebrow ? { eyebrow } : {})}
        {...(enquiryContext ? { enquiryContext } : {})}
      />

      {recipe.showStickyToc ? <StickyPageToc items={tocItems} /> : null}

      <div
        data-layout-profile={recipe.intentProfile}
        data-layout-density={recipe.density}
        data-hero-variant={recipe.heroVariant}
      >
        {recipe.sections.map((id) => {
          const node = sectionMap[id];
          return node ? <div key={id}>{node}</div> : null;
        })}
      </div>
    </>
  );
}
