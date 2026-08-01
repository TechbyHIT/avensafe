/**
 * Validates every JSON module in `data/` against its Zod contract.
 *
 * Run via `npm run validate:data`. Also checks referential integrity between
 * files, which Zod alone cannot express: a city must point at a real state, a
 * gallery item at a real image, and so on.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { z } from 'zod';
import { RESERVED_ROOT_SEGMENTS } from '../config/routes';
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
} from '../lib/data/schemas';

const DATA_DIR = join(process.cwd(), 'data');

const errors: string[] = [];
const notes: string[] = [];

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(join(DATA_DIR, file), 'utf8'));
}

function parseFile<T extends z.ZodTypeAny>(file: string, schema: T): z.infer<T> | null {
  let raw: unknown;
  try {
    raw = readJson(file);
  } catch (error) {
    errors.push(`${file}: could not be read or is not valid JSON — ${String(error)}`);
    return null;
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push(`${file}: ${issue.path.join('.') || '(root)'} — ${issue.message}`);
    }
    return null;
  }

  notes.push(`${file}: valid`);
  return result.data;
}

const services = parseFile('services.json', servicesFileSchema);
const states = parseFile('states.json', statesFileSchema);
const districts = parseFile('districts.json', districtsFileSchema);
const cities = parseFile('cities.json', citiesFileSchema);
const areas = parseFile('areas.json', areasFileSchema);
const faqs = parseFile('faqs.json', faqsFileSchema);
const images = parseFile('images.json', imagesFileSchema);
const gallery = parseFile('gallery.json', galleryFileSchema);
const blogs = parseFile('blogs.json', blogsFileSchema);
const guides = parseFile('guides.json', guidesFileSchema);
const projects = parseFile('projects.json', projectsFileSchema);
const testimonials = parseFile('testimonials.json', testimonialsFileSchema);
const internalLinks = parseFile('internal-links.json', internalLinksFileSchema);
const searchIntents = parseFile('search-intents.json', searchIntentsFileSchema);

/* --------------------------------------------------- referential integrity */

function assertUnique(label: string, values: readonly string[]): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) errors.push(`${label}: duplicate value "${value}"`);
    seen.add(value);
  }
}

function assertRefs(
  label: string,
  refs: readonly string[],
  pool: ReadonlySet<string>,
  poolLabel: string,
): void {
  for (const ref of refs) {
    if (!pool.has(ref)) errors.push(`${label}: "${ref}" does not exist in ${poolLabel}`);
  }
}

const serviceIds = new Set((services ?? []).map((service) => service.id));
const stateIds = new Set((states ?? []).map((state) => state.id));
const districtIds = new Set((districts ?? []).map((district) => district.id));
const cityIds = new Set((cities ?? []).map((city) => city.id));
const areaIds = new Set((areas ?? []).map((area) => area.id));
const imageIds = new Set((images ?? []).map((image) => image.id));
const faqIds = new Set((faqs ?? []).map((faq) => faq.id));
const guideSlugs = new Set((guides ?? []).map((guide) => guide.slug));

if (services) {
  assertUnique('services.json ids', services.map((service) => service.id));
  assertUnique('services.json slugs', services.map((service) => service.slug));
  for (const service of services) {
    assertRefs(
      `services.json[${service.slug}].relatedServiceIds`,
      service.relatedServiceIds,
      serviceIds,
      'services.json',
    );
    assertRefs(
      `services.json[${service.slug}].imageIds`,
      service.imageIds,
      imageIds,
      'images.json',
    );
    if (service.relatedServiceIds.includes(service.id)) {
      errors.push(`services.json[${service.slug}]: lists itself as a related service`);
    }
  }
}

if (states) {
  assertUnique('states.json ids', states.map((state) => state.id));
  assertUnique('states.json slugs', states.map((state) => state.slug));
  // State slugs occupy the site root, so they must not shadow a static route.
  for (const state of states) {
    if (RESERVED_ROOT_SEGMENTS.has(state.slug)) {
      errors.push(
        `states.json[${state.slug}]: slug is a reserved root segment and would be shadowed by a static route`,
      );
    }
  }
}

if (districts) {
  assertUnique('districts.json ids', districts.map((district) => district.id));
  for (const district of districts) {
    assertRefs(
      `districts.json[${district.slug}].stateId`,
      [district.stateId],
      stateIds,
      'states.json',
    );
    assertRefs(
      `districts.json[${district.slug}].neighbouringDistrictIds`,
      district.neighbouringDistrictIds,
      districtIds,
      'districts.json',
    );
    if (district.neighbouringDistrictIds.includes(district.id)) {
      errors.push(`districts.json[${district.slug}]: lists itself as a neighbour`);
    }
  }
  const perStateDistrict = new Map<string, Set<string>>();
  for (const district of districts) {
    const bucket = perStateDistrict.get(district.stateId) ?? new Set<string>();
    if (bucket.has(district.slug)) {
      errors.push(
        `districts.json: duplicate slug "${district.slug}" within state ${district.stateId}`,
      );
    }
    bucket.add(district.slug);
    perStateDistrict.set(district.stateId, bucket);
  }
}

if (cities) {
  assertUnique('cities.json ids', cities.map((city) => city.id));
  for (const city of cities) {
    assertRefs(`cities.json[${city.slug}].stateId`, [city.stateId], stateIds, 'states.json');
    assertRefs(
      `cities.json[${city.slug}].districtId`,
      [city.districtId],
      districtIds,
      'districts.json',
    );
    if (city.slug === 'district') {
      errors.push(
        `cities.json[${city.slug}]: slug "district" is reserved for district hub URLs under /{state}/district/{district}`,
      );
    }
    assertRefs(
      `cities.json[${city.slug}].neighbouringCityIds`,
      city.neighbouringCityIds,
      cityIds,
      'cities.json',
    );
    if (city.neighbouringCityIds.includes(city.id)) {
      errors.push(`cities.json[${city.slug}]: lists itself as a neighbour`);
    }
  }
  // City slugs only need to be unique within their state, since the URL is
  // /<state>/<city>.
  const perState = new Map<string, Set<string>>();
  for (const city of cities) {
    const bucket = perState.get(city.stateId) ?? new Set<string>();
    if (bucket.has(city.slug)) {
      errors.push(`cities.json: duplicate slug "${city.slug}" within state ${city.stateId}`);
    }
    bucket.add(city.slug);
    perState.set(city.stateId, bucket);
  }
}

if (areas) {
  assertUnique('areas.json ids', areas.map((area) => area.id));
  for (const area of areas) {
    assertRefs(`areas.json[${area.slug}].cityId`, [area.cityId], cityIds, 'cities.json');
    assertRefs(
      `areas.json[${area.slug}].adjacentAreaIds`,
      area.adjacentAreaIds,
      areaIds,
      'areas.json',
    );
  }
  const perCity = new Map<string, Set<string>>();
  for (const area of areas) {
    const bucket = perCity.get(area.cityId) ?? new Set<string>();
    if (bucket.has(area.slug)) {
      errors.push(`areas.json: duplicate slug "${area.slug}" within city ${area.cityId}`);
    }
    bucket.add(area.slug);
    perCity.set(area.cityId, bucket);
  }
}

// The URL `/state/city/<segment>` is resolved as a service before an area, so a
// collision between the two slug spaces would make an area page unreachable.
if (services && areas) {
  const serviceSlugs = new Set(services.map((service) => service.slug));
  for (const area of areas) {
    if (serviceSlugs.has(area.slug)) {
      errors.push(
        `areas.json[${area.slug}]: slug collides with a service slug, which would make this area unreachable at /state/city/${area.slug}`,
      );
    }
  }
}

// A city slug colliding with a service slug would break `/state/<segment>`
// resolution in the same way.
if (services && cities) {
  const serviceSlugs = new Set(services.map((service) => service.slug));
  for (const city of cities) {
    if (serviceSlugs.has(city.slug)) {
      errors.push(`cities.json[${city.slug}]: slug collides with a service slug`);
    }
  }
}

if (faqs) {
  assertUnique('faqs.json ids', faqs.map((faq) => faq.id));
  for (const faq of faqs) {
    assertRefs(`faqs.json[${faq.id}].serviceIds`, faq.serviceIds, serviceIds, 'services.json');
    if (faq.scope === 'service' && faq.serviceIds.length === 0) {
      errors.push(`faqs.json[${faq.id}]: scope is "service" but no serviceIds are listed`);
    }
  }
  const questions = new Map<string, string>();
  for (const faq of faqs) {
    const key = faq.question.trim().toLowerCase();
    const existing = questions.get(key);
    if (existing) errors.push(`faqs.json: "${faq.question}" duplicated by ${existing}`);
    questions.set(key, faq.id);
  }
}

if (images) {
  assertUnique('images.json ids', images.map((image) => image.id));
  assertUnique('images.json srcs', images.map((image) => image.src));
  for (const image of images) {
    assertRefs(
      `images.json[${image.id}].serviceIds`,
      image.serviceIds,
      serviceIds,
      'services.json',
    );
  }
}

if (gallery) {
  assertUnique('gallery.json ids', gallery.map((item) => item.id));
  for (const item of gallery) {
    assertRefs(`gallery.json[${item.id}].imageId`, [item.imageId], imageIds, 'images.json');
    assertRefs(`gallery.json[${item.id}].serviceId`, [item.serviceId], serviceIds, 'services.json');
  }
}

for (const [file, entries] of [
  ['blogs.json', blogs],
  ['guides.json', guides],
] as const) {
  if (!entries) continue;
  assertUnique(`${file} ids`, entries.map((entry) => entry.id));
  assertUnique(`${file} slugs`, entries.map((entry) => entry.slug));
  for (const entry of entries) {
    assertRefs(`${file}[${entry.slug}].serviceIds`, entry.serviceIds, serviceIds, 'services.json');
    assertRefs(`${file}[${entry.slug}].faqIds`, entry.faqIds, faqIds, 'faqs.json');
    if (entry.imageId) {
      assertRefs(`${file}[${entry.slug}].imageId`, [entry.imageId], imageIds, 'images.json');
    }
    if (Date.parse(entry.updatedAt) < Date.parse(entry.publishedAt)) {
      errors.push(`${file}[${entry.slug}]: updatedAt is earlier than publishedAt`);
    }
  }
}

if (projects) {
  assertUnique('projects.json ids', projects.map((project) => project.id));
  assertUnique('projects.json slugs', projects.map((project) => project.slug));
  for (const project of projects) {
    assertRefs(
      `projects.json[${project.slug}].serviceIds`,
      project.serviceIds,
      serviceIds,
      'services.json',
    );
    if (project.imageId) {
      assertRefs(
        `projects.json[${project.slug}].imageId`,
        [project.imageId],
        imageIds,
        'images.json',
      );
    }
  }
}

if (testimonials) {
  assertUnique('testimonials.json ids', testimonials.map((entry) => entry.id));
  for (const entry of testimonials) {
    assertRefs(
      `testimonials.json[${entry.id}].serviceIds`,
      entry.serviceIds,
      serviceIds,
      'services.json',
    );
    if (entry.published && !entry.verified) {
      errors.push(
        `testimonials.json[${entry.id}]: published without being verified — unverified feedback must not appear on the site`,
      );
    }
  }
}

if (internalLinks) {
  for (const [serviceId, slugs] of Object.entries(internalLinks.serviceToGuides)) {
    assertRefs('internal-links.json serviceToGuides key', [serviceId], serviceIds, 'services.json');
    assertRefs(`internal-links.json serviceToGuides[${serviceId}]`, slugs, guideSlugs, 'guides.json');
  }
  for (const [guideSlug, ids] of Object.entries(internalLinks.guideToServices)) {
    assertRefs('internal-links.json guideToServices key', [guideSlug], guideSlugs, 'guides.json');
    assertRefs(`internal-links.json guideToServices[${guideSlug}]`, ids, serviceIds, 'services.json');
  }
}

if (searchIntents) {
  assertUnique('search-intents.json ids', searchIntents.map((intent) => intent.id));
  assertUnique('search-intents.json slugs', searchIntents.map((intent) => intent.slug));
}

if (searchIntents && services) {
  const serviceSlugs = new Set(services.map((service) => service.slug));
  for (const intent of searchIntents) {
    if (serviceSlugs.has(intent.slug)) {
      errors.push(
        `search-intents.json[${intent.slug}]: slug collides with a service slug and would break /state/city/service/intent routing`,
      );
    }
  }
}

if (searchIntents && areas) {
  const intentSlugs = new Set(searchIntents.map((intent) => intent.slug));
  for (const area of areas) {
    if (intentSlugs.has(area.slug)) {
      errors.push(
        `areas.json[${area.slug}]: slug collides with a search-intent slug`,
      );
    }
  }
}

/* ----------------------------------------------------------------- reporting */

if (errors.length > 0) {
  console.error(`\nData validation failed with ${errors.length} problem(s):\n`);
  for (const error of errors) console.error(`  • ${error}`);
  console.error('');
  process.exit(1);
}

console.log(`\nData validation passed (${notes.length} file(s) checked).`);
for (const note of notes) console.log(`  • ${note}`);
console.log('');
