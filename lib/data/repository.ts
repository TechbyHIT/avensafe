import areasJson from '@/data/areas.json';
import blogsJson from '@/data/blogs.json';
import citiesJson from '@/data/cities.json';
import districtsJson from '@/data/districts.json';
import faqsJson from '@/data/faqs.json';
import galleryJson from '@/data/gallery.json';
import guidesJson from '@/data/guides.json';
import imagesJson from '@/data/images.json';
import internalLinksJson from '@/data/internal-links.json';
import searchIntentsJson from '@/data/search-intents.json';
import projectsJson from '@/data/projects.json';
import servicesJson from '@/data/services.json';
import statesJson from '@/data/states.json';
import testimonialsJson from '@/data/testimonials.json';
import {
  areasFileSchema,
  blogsFileSchema,
  citiesFileSchema,
  districtsFileSchema,
  faqsFileSchema,
  galleryFileSchema,
  guidesFileSchema,
  imagesFileSchema,
  internalLinksFileSchema,
  projectsFileSchema,
  searchIntentsFileSchema,
  servicesFileSchema,
  statesFileSchema,
  testimonialsFileSchema,
  type Area,
  type BlogPost,
  type City,
  type District,
  type Faq,
  type GalleryItem,
  type Guide,
  type ImageRecord,
  type InternalLinksFile,
  type Project,
  type SearchIntent,
  type Service,
  type State,
  type Testimonial,
  type TraitKey,
} from '@/lib/data/schemas';

/**
 * The read layer over `data/`.
 *
 * JSON is imported (so it is bundled and needs no filesystem at runtime),
 * validated once through Zod, then indexed into lookup maps.
 *
 * Import this only from Server Components, route handlers, Server Actions and
 * build scripts. Client components must receive data as props instead, so the
 * content corpus never reaches the browser bundle. (`server-only` is not used
 * as a guard here because the validation scripts import this module from plain
 * Node, where that package throws.)
 */

/** Validates and memoizes a JSON module on first access. */
function once<T>(load: () => T): () => T {
  let value: T | undefined;
  let loaded = false;
  return () => {
    if (!loaded) {
      value = load();
      loaded = true;
    }
    return value as T;
  };
}

const allServices = once(() => servicesFileSchema.parse(servicesJson));
const allStates = once(() => statesFileSchema.parse(statesJson));
const allDistricts = once(() => districtsFileSchema.parse(districtsJson));
const allCities = once(() => citiesFileSchema.parse(citiesJson));
const allAreas = once(() => areasFileSchema.parse(areasJson));
const allFaqs = once(() => faqsFileSchema.parse(faqsJson));
const allImages = once(() => imagesFileSchema.parse(imagesJson));
const allGallery = once(() => galleryFileSchema.parse(galleryJson));
const allBlogs = once(() => blogsFileSchema.parse(blogsJson));
const allGuides = once(() => guidesFileSchema.parse(guidesJson));
const allProjects = once(() => projectsFileSchema.parse(projectsJson));
const allTestimonials = once(() => testimonialsFileSchema.parse(testimonialsJson));
const links = once(() => internalLinksFileSchema.parse(internalLinksJson));
const allSearchIntents = once(() => searchIntentsFileSchema.parse(searchIntentsJson));

/* ------------------------------------------------------------------ services */

const publishedServices = once(() =>
  allServices().filter((service) => service.published),
);
const serviceBySlugIndex = once(
  () => new Map(publishedServices().map((service) => [service.slug, service])),
);
const serviceByIdIndex = once(() => new Map(allServices().map((service) => [service.id, service])));

export function getServices(): readonly Service[] {
  return publishedServices();
}

export function getFeaturedServices(): readonly Service[] {
  return publishedServices().filter((service) => service.featured);
}

export function getServiceBySlug(slug: string): Service | undefined {
  return serviceBySlugIndex().get(slug);
}

export function getServiceById(id: string): Service | undefined {
  return serviceByIdIndex().get(id);
}

export function getServicesByIds(ids: readonly string[]): readonly Service[] {
  return ids
    .map((id) => getServiceById(id))
    .filter((service): service is Service => service !== undefined && service.published);
}

/* -------------------------------------------------------------------- states */

const publishedStates = once(() => allStates().filter((state) => state.published));
const stateBySlugIndex = once(() => new Map(publishedStates().map((state) => [state.slug, state])));
const stateByIdIndex = once(() => new Map(allStates().map((state) => [state.id, state])));

export function getStates(): readonly State[] {
  return publishedStates();
}

export function getStateBySlug(slug: string): State | undefined {
  return stateBySlugIndex().get(slug);
}

export function getStateById(id: string): State | undefined {
  return stateByIdIndex().get(id);
}

/* ----------------------------------------------------------------- districts */

const publishedDistricts = once(() =>
  allDistricts().filter(
    (district) => district.published && getStateById(district.stateId)?.published === true,
  ),
);
const districtByIdIndex = once(() => new Map(allDistricts().map((d) => [d.id, d])));
const districtsByStateIndex = once(() => {
  const index = new Map<string, District[]>();
  for (const district of publishedDistricts()) {
    const bucket = index.get(district.stateId);
    if (bucket) bucket.push(district);
    else index.set(district.stateId, [district]);
  }
  for (const bucket of index.values()) bucket.sort((a, b) => a.name.localeCompare(b.name));
  return index;
});
const districtBySlugIndex = once(
  () =>
    new Map(publishedDistricts().map((district) => [`${district.stateId}::${district.slug}`, district])),
);

export function getDistricts(): readonly District[] {
  return publishedDistricts();
}

export function getDistrictsByState(stateId: string): readonly District[] {
  return districtsByStateIndex().get(stateId) ?? [];
}

export function getDistrictBySlug(stateId: string, slug: string): District | undefined {
  return districtBySlugIndex().get(`${stateId}::${slug}`);
}

export function getDistrictById(id: string): District | undefined {
  return districtByIdIndex().get(id);
}

/* -------------------------------------------------------------------- cities */

const publishedCities = once(() =>
  allCities().filter((city) => city.published && getStateById(city.stateId)?.published === true),
);
const cityByIdIndex = once(() => new Map(allCities().map((city) => [city.id, city])));
const citiesByStateIndex = once(() => {
  const index = new Map<string, City[]>();
  for (const city of publishedCities()) {
    const bucket = index.get(city.stateId);
    if (bucket) bucket.push(city);
    else index.set(city.stateId, [city]);
  }
  for (const bucket of index.values()) {
    bucket.sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
  }
  return index;
});
/** Keyed `stateId::citySlug`, since a city slug is only unique within a state. */
const cityBySlugIndex = once(
  () => new Map(publishedCities().map((city) => [`${city.stateId}::${city.slug}`, city])),
);

export function getCities(): readonly City[] {
  return publishedCities();
}

export function getCitiesByState(stateId: string): readonly City[] {
  return citiesByStateIndex().get(stateId) ?? [];
}

export function getCityBySlug(stateId: string, slug: string): City | undefined {
  return cityBySlugIndex().get(`${stateId}::${slug}`);
}

export function getCityById(id: string): City | undefined {
  return cityByIdIndex().get(id);
}

export function getNeighbouringCities(city: City): readonly City[] {
  return city.neighbouringCityIds
    .map((id) => getCityById(id))
    .filter((entry): entry is City => entry !== undefined && entry.published);
}

export function getCitiesByDistrict(districtId: string): readonly City[] {
  return publishedCities().filter((city) => city.districtId === districtId);
}

/* --------------------------------------------------------------------- areas */

const publishedAreas = once(() =>
  allAreas().filter((area) => area.published && getCityById(area.cityId)?.published === true),
);
const areaByIdIndex = once(() => new Map(allAreas().map((area) => [area.id, area])));
const areasByCityIndex = once(() => {
  const index = new Map<string, Area[]>();
  for (const area of publishedAreas()) {
    const bucket = index.get(area.cityId);
    if (bucket) bucket.push(area);
    else index.set(area.cityId, [area]);
  }
  for (const bucket of index.values()) bucket.sort((a, b) => a.name.localeCompare(b.name));
  return index;
});
const areaBySlugIndex = once(
  () => new Map(publishedAreas().map((area) => [`${area.cityId}::${area.slug}`, area])),
);

export function getAreas(): readonly Area[] {
  return publishedAreas();
}

export function getAreasByCity(cityId: string): readonly Area[] {
  return areasByCityIndex().get(cityId) ?? [];
}

export function getAreaBySlug(cityId: string, slug: string): Area | undefined {
  return areaBySlugIndex().get(`${cityId}::${slug}`);
}

export function getAreaById(id: string): Area | undefined {
  return areaByIdIndex().get(id);
}

export function getAdjacentAreas(area: Area): readonly Area[] {
  const explicit = area.adjacentAreaIds
    .map((id) => getAreaById(id))
    .filter((entry): entry is Area => entry !== undefined && entry.published);

  if (explicit.length > 0) return explicit;

  // Fallback so every locality stays linked into the city graph even when
  // adjacency was never curated in JSON.
  const inCity = getAreasByCity(area.cityId);
  if (inCity.length < 2) return [];
  const sorted = [...inCity].sort((a, b) => a.name.localeCompare(b.name));
  const pivot = Math.max(
    0,
    sorted.findIndex((entry) => entry.id === area.id),
  );
  const picks: Area[] = [];
  for (const offset of [-2, -1, 1, 2, 3]) {
    const neighbour = sorted[(pivot + offset + sorted.length * 3) % sorted.length];
    if (
      neighbour &&
      neighbour.id !== area.id &&
      !picks.some((entry) => entry.id === neighbour.id)
    ) {
      picks.push(neighbour);
    }
  }
  return picks;
}

/* ---------------------------------------------------------------------- FAQs */

const faqByIdIndex = once(() => new Map(allFaqs().map((faq) => [faq.id, faq])));

export function getFaqById(id: string): Faq | undefined {
  return faqByIdIndex().get(id);
}

export function getFaqsByIds(ids: readonly string[]): readonly Faq[] {
  return ids.map((id) => getFaqById(id)).filter((faq): faq is Faq => faq !== undefined);
}

export interface FaqQuery {
  readonly scopes?: readonly Faq['scope'][];
  readonly serviceId?: string;
  readonly traits?: readonly TraitKey[];
}

/**
 * Selects FAQs relevant to a page. A `location`-scoped FAQ carrying traits is
 * only returned when the page's location actually has one of those traits,
 * which is how two city pages end up with genuinely different FAQ sets.
 */
export function findFaqs({ scopes, serviceId, traits = [] }: FaqQuery): readonly Faq[] {
  return allFaqs()
    .filter((faq) => (scopes ? scopes.includes(faq.scope) : true))
    .filter((faq) => {
      if (faq.scope !== 'service') return true;
      return serviceId !== undefined && faq.serviceIds.includes(serviceId);
    })
    .filter((faq) => {
      if (faq.traits.length === 0) return true;
      return faq.traits.some((trait) => traits.includes(trait));
    })
    .sort((a, b) => a.order - b.order);
}

/**
 * Every FAQ in the given scopes, ignoring trait and service filtering.
 *
 * Used by the site-wide FAQ page, which is not location-specific and should list
 * the whole corpus rather than the subset relevant to one place.
 */
export function getFaqsByScope(scopes: readonly Faq['scope'][]): readonly Faq[] {
  return allFaqs()
    .filter((faq) => scopes.includes(faq.scope))
    .sort((a, b) => a.order - b.order);
}

/* -------------------------------------------------------------------- images */

const imageByIdIndex = once(() => new Map(allImages().map((image) => [image.id, image])));

export function getImages(): readonly ImageRecord[] {
  return allImages();
}

export function getImageById(id: string): ImageRecord | undefined {
  return imageByIdIndex().get(id);
}

export function getImagesByIds(ids: readonly string[]): readonly ImageRecord[] {
  return ids
    .map((id) => getImageById(id))
    .filter((image): image is ImageRecord => image !== undefined);
}

/* ------------------------------------------------------------------- gallery */

export function getGalleryItems(): readonly GalleryItem[] {
  return allGallery()
    .filter((item) => item.published)
    .sort((a, b) => a.order - b.order);
}

export function getGalleryItemsForService(serviceId: string): readonly GalleryItem[] {
  return getGalleryItems().filter((item) => item.serviceId === serviceId);
}

/**
 * Mixed portfolio shots for mosaics — round-robins across services so one
 * family does not dominate, and unused catalog photos still appear.
 */
export function getHomeGalleryImages(limit = 8): readonly ImageRecord[] {
  const byService = new Map<string, ImageRecord[]>();
  for (const image of getImages()) {
    if (image.placeholder) continue;
    const primary = image.serviceIds[0];
    if (!primary) continue;
    const list = byService.get(primary) ?? [];
    list.push(image);
    byService.set(primary, list);
  }

  const queues = [...byService.values()].filter((list) => list.length > 0);
  const out: ImageRecord[] = [];
  const seen = new Set<string>();
  let progress = true;
  while (out.length < limit && progress) {
    progress = false;
    for (const list of queues) {
      while (list.length > 0) {
        const next = list.shift();
        if (!next || seen.has(next.id)) continue;
        seen.add(next.id);
        out.push(next);
        progress = true;
        break;
      }
      if (out.length >= limit) break;
    }
  }
  return out;
}

export function getPrimaryImageForService(serviceId: string): ImageRecord | undefined {
  return getImagesForService(serviceId, 1)[0];
}

/** All non-placeholder photos tagged to a service (gallery first, then catalog). */
export function getImagesForService(serviceId: string, limit = 12): readonly ImageRecord[] {
  const seen = new Set<string>();
  const out: ImageRecord[] = [];

  for (const item of getGalleryItemsForService(serviceId)) {
    const image = getImageById(item.imageId);
    if (!image || image.placeholder || seen.has(image.id)) continue;
    seen.add(image.id);
    out.push(image);
    if (out.length >= limit) return out;
  }

  for (const image of getImages()) {
    if (image.placeholder || !image.serviceIds.includes(serviceId) || seen.has(image.id)) continue;
    seen.add(image.id);
    out.push(image);
    if (out.length >= limit) break;
  }

  return out;
}

/* ----------------------------------------------------------------- editorial */

const publishedGuides = once(() => allGuides().filter((guide) => guide.published));
const guideBySlugIndex = once(
  () => new Map(publishedGuides().map((guide) => [guide.slug, guide])),
);

export function getGuides(): readonly Guide[] {
  return [...publishedGuides()].sort(
    (a, b) => Number(b.cornerstone) - Number(a.cornerstone) || a.title.localeCompare(b.title),
  );
}

export function getCornerstoneGuides(): readonly Guide[] {
  return publishedGuides().filter((guide) => guide.cornerstone);
}

export function getGuideBySlug(slug: string): Guide | undefined {
  return guideBySlugIndex().get(slug);
}

const publishedPosts = once(() => allBlogs().filter((post) => post.published));
const postBySlugIndex = once(() => new Map(publishedPosts().map((post) => [post.slug, post])));

export function getBlogPosts(): readonly BlogPost[] {
  return [...publishedPosts()].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return postBySlugIndex().get(slug);
}

/* ------------------------------------------------------- projects and social */

export function getProjects(): readonly Project[] {
  return allProjects()
    .filter((project) => project.published)
    .sort((a, b) => a.order - b.order);
}

/**
 * Only verified, permissioned feedback is ever returned, so no unverified
 * quote can reach a page or be expressed as Review structured data.
 */
export function getTestimonials(): readonly Testimonial[] {
  return allTestimonials().filter((entry) => entry.published && entry.verified);
}

export function getInternalLinkGraph(): InternalLinksFile {
  return links();
}

/* ----------------------------------------------------------- search intents */

export function getSearchIntents(): readonly SearchIntent[] {
  return allSearchIntents().filter((intent) => intent.published);
}

export function getSearchIntentBySlug(slug: string): SearchIntent | undefined {
  const intent = allSearchIntents().find((entry) => entry.slug === slug);
  if (!intent || !intent.published) return undefined;
  return intent;
}

export function getAllSearchIntentsRaw(): readonly SearchIntent[] {
  return allSearchIntents();
}

/* --------------------------------------------------------------------- stats */

export interface CorpusStats {
  readonly services: number;
  readonly states: number;
  readonly cities: number;
  readonly areas: number;
  readonly guides: number;
  readonly posts: number;
}

export function getCorpusStats(): CorpusStats {
  return {
    services: publishedServices().length,
    states: publishedStates().length,
    cities: publishedCities().length,
    areas: publishedAreas().length,
    guides: publishedGuides().length,
    posts: publishedPosts().length,
  };
}
