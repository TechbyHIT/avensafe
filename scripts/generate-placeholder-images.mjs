/**
 * Generates placeholder PNGs for every record in `data/images.json`.
 *
 * These exist so the site builds and lays out correctly before photography is
 * available. They are real raster images, so `next/image` optimises them into
 * AVIF/WebP exactly as it will the final photographs, and every record is
 * flagged `placeholder: true` in the data so they are easy to find and replace.
 *
 * The PNG encoder is hand-rolled against Node's zlib rather than pulling in an
 * image library for a build-time utility.
 *
 * Usage: node scripts/generate-placeholder-images.mjs
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const ROOT = process.cwd();
const PUBLIC_DIR = join(ROOT, 'public');

/* ------------------------------------------------------------- PNG encoding */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let crc = -1;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buffer[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([length, typeAndData, crc]);
}

function encodePng(width, height, pixelAt) {
  const bytesPerRow = width * 3;
  const raw = Buffer.alloc((bytesPerRow + 1) * height);

  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (bytesPerRow + 1);
    raw[rowStart] = 0; // filter type: none
    for (let x = 0; x < width; x += 1) {
      const [r, g, b] = pixelAt(x, y);
      const offset = rowStart + 1 + x * 3;
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ------------------------------------------------------------------ patterns */

const PALETTE = {
  deep: [15, 118, 110], // brand-700
  mid: [45, 212, 191], // brand-400
  pale: [204, 251, 241], // brand-100
  ink: [30, 41, 59], // ink-800
  line: [226, 232, 240], // ink-200
};

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/**
 * Picks a pattern that suggests the subject: vertical lines for cable systems,
 * crosshatch for netting, horizontal rails for drying systems.
 */
function patternFor(tags) {
  if (tags.includes('invisible-grills')) return 'cables';
  if (tags.includes('cloth-hangers')) return 'rails';
  if (
    tags.includes('safety-nets') ||
    tags.includes('sports-nets') ||
    tags.includes('duct-nets') ||
    tags.includes('building-covering')
  ) {
    return 'mesh';
  }
  return 'gradient';
}

function makePixelFn(pattern, width, height) {
  return (x, y) => {
    // Base: soft diagonal gradient from deep teal to pale.
    const t = (x / width) * 0.55 + (y / height) * 0.45;
    let colour = mix(PALETTE.deep, PALETTE.pale, t);

    // A darker band along the bottom reads as a floor line and gives the image
    // an implied horizon rather than being a flat swatch.
    if (y > height * 0.82) {
      colour = mix(colour, PALETTE.ink, (y - height * 0.82) / (height * 0.18) * 0.55);
    }

    const spacing = Math.max(8, Math.round(width / 42));

    if (pattern === 'cables' && y < height * 0.82) {
      if (x % spacing === 0 || x % spacing === 1) colour = mix(colour, PALETTE.line, 0.75);
    }

    if (pattern === 'rails' && y < height * 0.82) {
      const railSpacing = Math.max(10, Math.round(height / 12));
      if (y % railSpacing === 0 || y % railSpacing === 1) {
        colour = mix(colour, PALETTE.line, 0.8);
      }
    }

    if (pattern === 'mesh' && y < height * 0.82) {
      const meshSpacing = Math.max(7, Math.round(width / 60));
      if ((x + y) % meshSpacing === 0 || (x - y + width) % meshSpacing === 0) {
        colour = mix(colour, PALETTE.line, 0.55);
      }
    }

    if (pattern === 'gradient') {
      const blockSpacing = Math.max(24, Math.round(width / 16));
      if (x % blockSpacing === 0) colour = mix(colour, PALETTE.mid, 0.3);
    }

    return colour;
  };
}

/* ---------------------------------------------------------------------- main */

const images = JSON.parse(readFileSync(join(ROOT, 'data', 'images.json'), 'utf8'));

/**
 * Brand assets referenced from `config/business.ts` rather than from the content
 * corpus, so they are listed here instead of in `images.json`.
 */
const brandAssets = [
  { src: '/brand/opengraph-default.png', width: 1200, height: 630, tags: ['invisible-grills'] },
  { src: '/brand/apple-touch-icon.png', width: 180, height: 180, tags: ['invisible-grills'] },
];

let written = 0;
for (const image of [...images, ...brandAssets]) {
  const target = join(PUBLIC_DIR, image.src.replace(/^\//, ''));
  mkdirSync(dirname(target), { recursive: true });

  const pattern = patternFor(image.tags ?? []);
  const png = encodePng(image.width, image.height, makePixelFn(pattern, image.width, image.height));
  writeFileSync(target, png);
  written += 1;
  console.log(`  ${image.src}  ${image.width}x${image.height}  (${pattern})`);
}

console.log(`\nWrote ${written} placeholder image(s) to public/.`);
console.log('Replace these with real photography; the records are flagged placeholder: true.\n');
