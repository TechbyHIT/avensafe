/**
 * Build a circular favicon / app icon from the Avensafe mark.
 * Run: npx tsx scripts/make-favicon.ts
 */
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(process.cwd());
const markPath = resolve(root, 'public/brand/avensafe-mark.png');

async function circleIcon(size: number, outPath: string) {
  mkdirSync(dirname(outPath), { recursive: true });
  const padded = Math.round(size * 0.82);
  const resized = await sharp(markPath)
    .resize(padded, padded, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer();

  const onCanvas = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([
      {
        input: resized,
        left: Math.round((size - padded) / 2),
        top: Math.round((size - padded) / 2),
      },
    ])
    .png()
    .toBuffer();

  const mask = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`,
  );

  await sharp(onCanvas)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toFile(outPath);
}

async function main() {
  await circleIcon(512, resolve(root, 'public/brand/avensafe-favicon.png'));
  await circleIcon(192, resolve(root, 'app/icon.png'));
  await circleIcon(180, resolve(root, 'app/apple-icon.png'));
  await sharp(resolve(root, 'public/brand/avensafe-favicon.png'))
    .resize(32, 32)
    .png()
    .toFile(resolve(root, 'public/favicon.png'));
  console.log('Wrote circular favicon assets');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
