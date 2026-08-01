/**
 * Tag balcony / bird services onto existing portfolio photos and ensure every
 * non-placeholder image appears in gallery.json so the site uses the full set.
 *
 * Run: npx tsx scripts/tag-service-images.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const imagesPath = resolve(root, 'data/images.json');
const galleryPath = resolve(root, 'data/gallery.json');

type ImageRow = {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  serviceIds: string[];
  tags: string[];
  placeholder: boolean;
};

type GalleryRow = {
  id: string;
  imageId: string;
  title: string;
  description: string;
  serviceId: string;
  category: string;
  order: number;
  published: boolean;
};

const BALCONY_IDS = [
  'img-safety-nets-03',
  'img-safety-nets-05',
  'img-safety-nets-06',
  'img-safety-nets-08',
  'img-safety-nets-11',
  'img-safety-nets-12',
  'img-safety-nets-14',
] as const;

const BIRD_IDS = [
  'img-safety-nets-02',
  'img-safety-nets-04',
  'img-safety-nets-07',
  'img-safety-nets-09',
  'img-safety-nets-10',
  'img-safety-nets-13',
  'img-duct-area-safety-nets-02',
  'img-duct-area-safety-nets-04',
  'img-duct-area-safety-nets-06',
] as const;

const CATEGORY: Record<string, string> = {
  'svc-invisible-grills': 'Invisible grills',
  'svc-safety-nets': 'Safety nets',
  'svc-balcony-nets': 'Balcony nets',
  'svc-bird-pigeon-nets': 'Bird and pigeon nets',
  'svc-sports-nets': 'Sports nets',
  'svc-cloth-hangers': 'Cloth hangers',
  'svc-duct-area-safety-nets': 'Duct area nets',
  'svc-building-covering-safety-nets': 'Building covering nets',
};

function addService(image: ImageRow, serviceId: string, ...tags: string[]) {
  if (!image.serviceIds.includes(serviceId)) image.serviceIds.push(serviceId);
  for (const tag of tags) {
    if (!image.tags.includes(tag)) image.tags.push(tag);
  }
}

const images = JSON.parse(readFileSync(imagesPath, 'utf8')) as ImageRow[];
const byId = new Map(images.map((image) => [image.id, image]));

for (const id of BALCONY_IDS) {
  const image = byId.get(id);
  if (!image) throw new Error(`Missing image ${id}`);
  addService(image, 'svc-balcony-nets', 'balcony-nets', 'balcony');
}

for (const id of BIRD_IDS) {
  const image = byId.get(id);
  if (!image) throw new Error(`Missing image ${id}`);
  addService(image, 'svc-bird-pigeon-nets', 'bird-pigeon-nets', 'bird');
}

writeFileSync(imagesPath, `${JSON.stringify(images, null, 2)}\n`, 'utf8');

const existingGallery = JSON.parse(readFileSync(galleryPath, 'utf8')) as GalleryRow[];
const galleryKeys = new Set(existingGallery.map((row) => `${row.serviceId}:${row.imageId}`));

let order = existingGallery.reduce((max, row) => Math.max(max, row.order), 0);

function pushGallery(imageId: string, serviceId: string) {
  const key = `${serviceId}:${imageId}`;
  if (galleryKeys.has(key)) return;
  galleryKeys.add(key);
  order += 1;
  const category = CATEGORY[serviceId] ?? 'Installations';
  existingGallery.push({
    id: `gal-${serviceId.replace(/^svc-/, '')}-${imageId.replace(/^img-/, '')}`,
    imageId,
    title: `${category} — site photo`,
    description: `Real installation photography for ${category.toLowerCase()} projects.`,
    serviceId,
    category,
    order,
    published: true,
  });
}

// Prefer primary service tag first for each image, then every tagged service.
for (const image of images) {
  if (image.placeholder) continue;
  for (const serviceId of image.serviceIds) {
    pushGallery(image.id, serviceId);
  }
}

// Keep hero in catalog even if never a gallery primary.
if (byId.has('img-hero-home')) {
  pushGallery('img-hero-home', 'svc-invisible-grills');
  pushGallery('img-hero-home', 'svc-safety-nets');
}

existingGallery.sort((a, b) => a.order - b.order);
writeFileSync(galleryPath, `${JSON.stringify(existingGallery, null, 2)}\n`, 'utf8');

const counts = new Map<string, number>();
for (const image of images) {
  for (const serviceId of image.serviceIds) {
    counts.set(serviceId, (counts.get(serviceId) ?? 0) + 1);
  }
}
console.log('Images per service:');
for (const [serviceId, count] of [...counts.entries()].sort()) {
  console.log(`  ${serviceId}: ${count}`);
}
console.log(`Gallery items: ${existingGallery.length}`);
