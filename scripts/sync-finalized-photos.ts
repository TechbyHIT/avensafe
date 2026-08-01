/**
 * Copies finalized photography into `public/images/portfolio/` and regenerates
 * `data/images.json`, `data/gallery.json`, and service `imageIds`.
 *
 * Usage: npm run sync:photos
 *        npm run sync:photos -- --dry-run
 */
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, extname, join } from 'node:path';
import { classifyPhotoFile, SERVICE_LABEL } from '../lib/images/classify-photo';
import { slugify } from '../lib/utils/text';

const ROOT = process.cwd();
const IMAGE_ROOT = join(ROOT, 'images');
const PUBLIC_PORTFOLIO = join(ROOT, 'public', 'images', 'portfolio');
const MIN_BYTES = 18_000;

interface SourceFile {
  readonly absolutePath: string;
  readonly fileName: string;
  readonly size: number;
}

interface Dimensions {
  readonly width: number;
  readonly height: number;
}

function finalizedDirs(): string[] {
  return readdirSync(IMAGE_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('FINIALIZED'))
    .map((entry) => join(IMAGE_ROOT, entry.name));
}

function collectSources(): SourceFile[] {
  const byName = new Map<string, SourceFile>();
  for (const dir of finalizedDirs()) {
    walk(dir, byName);
  }
  return [...byName.values()];
}

function walk(dir: string, byName: Map<string, SourceFile>): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, byName);
      continue;
    }
    if (!/\.(jpe?g|png|webp)$/i.test(entry.name)) continue;
    const size = statSync(full).size;
    if (size < MIN_BYTES) continue;
    const existing = byName.get(entry.name.toLowerCase());
    if (!existing || size > existing.size) {
      byName.set(entry.name.toLowerCase(), { absolutePath: full, fileName: entry.name, size });
    }
  }
}

function readDimensions(filePath: string): Dimensions {
  const buffer = readFileSync(filePath);
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (marker === 0xc0 || marker === 0xc2) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }
      offset += 2 + length;
    }
  }
  if (buffer.toString('ascii', 0, 8).includes('PNG')) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }
  return { width: 1600, height: 1067 };
}

function publicName(original: string, serviceId: string, index: number): string {
  const ext = extname(original).toLowerCase() || '.jpg';
  const hash = createHash('sha1').update(original).digest('hex').slice(0, 8);
  const slug = slugify(basename(original, extname(original))).slice(0, 40);
  const serviceSlug = serviceId.replace('svc-', '');
  return `${serviceSlug}-${index}-${slug}-${hash}${ext}`;
}

function altFor(serviceId: string, fileName: string, index: number): string {
  const label = SERVICE_LABEL[serviceId] ?? 'Safety installation';
  const base = basename(fileName, extname(fileName)).replace(/\s+/g, ' ').trim();
  return `${label} installation photo ${index + 1} — ${base}`.slice(0, 180);
}

interface ImageRecordOut {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  serviceIds: string[];
  tags: string[];
  placeholder: boolean;
}

const dryRun = process.argv.includes('--dry-run');
const PER_SERVICE = 14;
const GALLERY_PER_SERVICE = 10;

function main(): void {
  const sources = collectSources();
  if (sources.length === 0) {
    console.error('No finalized photos found under images/FINIALIZED*');
    process.exit(1);
  }

  const buckets = new Map<string, SourceFile[]>();
  const heroes: SourceFile[] = [];

  for (const file of sources) {
    const classification = classifyPhotoFile(file.fileName);
    if (classification.role === 'skip') continue;
    if (classification.role === 'hero') heroes.push(file);
    const list = buckets.get(classification.serviceId) ?? [];
    list.push(file);
    buckets.set(classification.serviceId, list);
  }

  for (const [key, list] of buckets) {
    list.sort((a, b) => b.size - a.size);
    buckets.set(key, list.slice(0, PER_SERVICE));
  }

  heroes.sort((a, b) => b.size - a.size);

  if (!dryRun) {
    mkdirSync(PUBLIC_PORTFOLIO, { recursive: true });
  }

  const images: ImageRecordOut[] = [];
  const gallery: {
    id: string;
    imageId: string;
    title: string;
    description: string;
    serviceId: string;
    category: string;
    order: number;
    published: boolean;
  }[] = [];

  const serviceImageIds = new Map<string, string[]>();
  let order = 1;

  function ingest(
    file: SourceFile,
    serviceId: string,
    tags: string[],
    idPrefix: string,
    index: number,
    toGallery: boolean,
  ): string {
    const destName = publicName(file.fileName, serviceId, index);
    const destPath = join(PUBLIC_PORTFOLIO, destName);
    const src = `/images/portfolio/${destName}`;
    if (!dryRun) {
      copyFileSync(file.absolutePath, destPath);
    }
    const dims = readDimensions(file.absolutePath);
    const id = `${idPrefix}-${String(index + 1).padStart(2, '0')}`;
    images.push({
      id,
      src,
      width: dims.width,
      height: dims.height,
      alt: altFor(serviceId, file.fileName, index),
      caption: `${SERVICE_LABEL[serviceId] ?? 'Installation'} on site.`,
      serviceIds: [serviceId],
      tags: [...tags],
      placeholder: false,
    });
    const ids = serviceImageIds.get(serviceId) ?? [];
    ids.push(id);
    serviceImageIds.set(serviceId, ids);

    if (toGallery) {
      gallery.push({
        id: `gal-${id}`,
        imageId: id,
        title: `${SERVICE_LABEL[serviceId] ?? 'Installation'} — site ${index + 1}`,
        description: `Real installation photography for ${(SERVICE_LABEL[serviceId] ?? 'our work').toLowerCase()} projects.`,
        serviceId,
        category: SERVICE_LABEL[serviceId] ?? 'Installation',
        order: order++,
        published: true,
      });
    }
    return id;
  }

  if (heroes[0]) {
    const heroFile = heroes[0];
    const dims = readDimensions(heroFile.absolutePath);
    const destName = publicName(heroFile.fileName, 'svc-safety-nets', 0);
    if (!dryRun) {
      copyFileSync(heroFile.absolutePath, join(PUBLIC_PORTFOLIO, destName));
    }
    images.unshift({
      id: 'img-hero-home',
      src: `/images/portfolio/${destName}`,
      width: dims.width,
      height: dims.height,
      alt: 'Balcony safety installation with stainless cables and netting on a high-rise apartment',
      caption: 'Survey-led installations across South and West India.',
      serviceIds: ['svc-invisible-grills', 'svc-safety-nets'],
      tags: ['hero', 'home', 'balcony'],
      placeholder: false,
    });
  }

  for (const [serviceId, files] of buckets) {
    let galleryCount = 0;
    files.forEach((file, index) => {
      const classification = classifyPhotoFile(file.fileName);
      const toGallery = galleryCount < GALLERY_PER_SERVICE;
      if (toGallery) galleryCount += 1;
      ingest(
        file,
        serviceId,
        [...classification.tags],
        `img-${serviceId.replace('svc-', '')}`,
        index,
        toGallery,
      );
    });
  }

  const servicesPath = join(ROOT, 'data', 'services.json');
  type ServiceRow = { id: string; imageIds: string[] };
  const services = JSON.parse(readFileSync(servicesPath, 'utf8')) as ServiceRow[];

  for (const service of services) {
    const ids = serviceImageIds.get(service.id);
    if (ids && ids.length > 0) {
      service.imageIds = ids.slice(0, 6);
    }
  }

  const imagesPath = join(ROOT, 'data', 'images.json');
  const galleryPath = join(ROOT, 'data', 'gallery.json');

  console.log(`Photos considered: ${sources.length}`);
  console.log(`Catalogued images: ${images.length}`);
  console.log(`Gallery items: ${gallery.length}`);

  if (dryRun) {
    console.log('Dry run — no files written.');
    return;
  }

  writeFileSync(imagesPath, `${JSON.stringify(images, null, 2)}\n`, 'utf8');
  writeFileSync(galleryPath, `${JSON.stringify(gallery, null, 2)}\n`, 'utf8');
  writeFileSync(servicesPath, `${JSON.stringify(services, null, 2)}\n`, 'utf8');
  console.log('Updated data/images.json, data/gallery.json, data/services.json');
}


main();
