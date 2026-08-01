import {
  getImagesByIds,
  getStates,
  getTestimonials,
} from '@/lib/data/repository';
import type { PageBundle } from '@/lib/routing/page-bundle';
import { absoluteUrl } from '@/lib/routing/url';
import {
  breadcrumbSchema,
  faqPageSchema,
  howToSchema,
  imageObjectSchema,
  reviewSchema,
  serviceSchema,
  webPageSchema,
} from '@/lib/schema/builders';
import { buildGraph, type JsonLdGraph } from '@/lib/schema/graph';

/**
 * Selects the structured data appropriate to a generated page.
 *
 * Only schema the page can substantiate is included: `Service` appears when the
 * page is about a service, `FAQPage` only when FAQs are actually rendered,
 * `Review` only for verified testimonials, and `areaServed` names real places.
 */

function areaServedFor(bundle: PageBundle): readonly string[] {
  const location = bundle.target.location;
  if (!location) return getStates().map((state) => state.name);

  const places = [location.state.name];
  if (location.district) places.push(location.district.name);
  if (location.city) places.push(location.city.name);
  if (location.area) places.push(`${location.area.name}, ${location.city?.name ?? ''}`.trim());
  return places;
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

export function buildPageGraph(bundle: PageBundle): JsonLdGraph {
  const { target, copy, content, crumbs, primaryImage } = bundle;
  const serviceNodeId = `${absoluteUrl(target.path)}#service`;

  const galleryImages =
    target.service && isServiceLocationKind(target.kind)
      ? getImagesByIds(target.service.imageIds).slice(0, 8)
      : [];

  const testimonials =
    target.service && isServiceLocationKind(target.kind)
      ? getTestimonials()
          .filter(
            (entry) =>
              entry.serviceIds.length === 0 || entry.serviceIds.includes(target.service!.id),
          )
          .slice(0, 10)
      : [];

  return buildGraph([
    webPageSchema({
      name: copy.title,
      description: copy.description,
      path: target.path,
      primaryImage,
    }),
    breadcrumbSchema(crumbs, target.path),
    target.service
      ? serviceSchema({
          service: target.service,
          path: target.path,
          description: copy.description,
          areaServed: areaServedFor(bundle),
        })
      : undefined,
    faqPageSchema(content.faqs, target.path),
    isServiceLocationKind(target.kind) && target.service
      ? howToSchema({
          name: `How ${target.service.name} installation works${
            target.location?.city ? ` in ${target.location.city.name}` : ''
          }`,
          description: copy.description,
          path: target.path,
        })
      : undefined,
    ...galleryImages.map((image) => imageObjectSchema(image)),
    ...testimonials.map((entry) => reviewSchema(entry, target.path, serviceNodeId)),
  ]);
}
