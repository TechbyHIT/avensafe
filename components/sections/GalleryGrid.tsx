import Image from 'next/image';
import type { GalleryItem, ImageRecord } from '@/lib/data/schemas';

export interface GalleryEntry {
  readonly item: GalleryItem;
  readonly image: ImageRecord;
}

export interface GalleryGridProps {
  readonly entries: readonly GalleryEntry[];
}

/**
 * Image grid.
 *
 * Every image has explicit dimensions so the grid reserves its space and nothing
 * shifts as images arrive, and all of them lazy-load because the gallery is
 * always below the fold.
 */
export function GalleryGrid({ entries }: GalleryGridProps) {
  if (entries.length === 0) return null;

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(({ item, image }) => (
        <li key={item.id}>
          <figure className="overflow-hidden rounded-(--radius-card) border border-ink-200 bg-white shadow-(--shadow-card)">
            <div className="bg-ink-100">
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading="lazy"
                sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 100vw"
                className="h-auto w-full object-cover"
              />
            </div>
            <figcaption className="p-4">
              <p className="text-xs font-medium tracking-wide text-brand-700 uppercase">
                {item.category}
              </p>
              <p className="mt-1 text-sm font-semibold text-ink-900">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-600">{item.description}</p>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
