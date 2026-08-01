import type { Metadata } from 'next';
import { business } from '@/config/business';
import {
  ROBOTS_INDEXABLE,
  ROBOTS_NOINDEX,
  SEARCH_CONSOLE_VERIFICATION,
  SEO_DEFAULTS,
} from '@/config/seo';
import type { ImageRecord } from '@/lib/data/schemas';
import { absoluteUrl } from '@/lib/routing/url';

/**
 * The metadata engine.
 *
 * Every page's `<head>` is produced here, so canonical URLs, robots directives
 * and social cards are consistent by construction. Pages never assemble
 * metadata themselves, which is what prevents duplicate canonicals and
 * inconsistent titles across 700-plus URLs.
 */

export interface MetadataInput {
  readonly title: string;
  readonly description: string;
  /** Site-relative path; the canonical is derived from it. */
  readonly path: string;
  readonly indexable?: boolean;
  readonly image?: ImageRecord | undefined;
  readonly type?: 'website' | 'article';
  readonly publishedTime?: string;
  readonly modifiedTime?: string;
  readonly authors?: readonly string[];
}

function openGraphImage(image: ImageRecord | undefined) {
  if (image) {
    return [{ url: absoluteUrl(image.src), width: image.width, height: image.height, alt: image.alt }];
  }
  const fallback = business.openGraphImage;
  return [
    {
      url: absoluteUrl(fallback.src),
      width: fallback.width,
      height: fallback.height,
      alt: fallback.alt,
    },
  ];
}

export function buildMetadata({
  title,
  description,
  path,
  indexable = true,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
}: MetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const images = openGraphImage(image);

  return {
    // Absolute so the title template never double-appends the brand name.
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: indexable ? ROBOTS_INDEXABLE : ROBOTS_NOINDEX,
    openGraph: {
      type,
      url: canonical,
      siteName: SEO_DEFAULTS.siteName,
      locale: SEO_DEFAULTS.locale,
      title,
      description,
      images,
      ...(type === 'article' && publishedTime ? { publishedTime } : {}),
      ...(type === 'article' && modifiedTime ? { modifiedTime } : {}),
      ...(type === 'article' && authors ? { authors: [...authors] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((entry) => entry.url),
      ...(SEO_DEFAULTS.twitterSite ? { site: SEO_DEFAULTS.twitterSite } : {}),
      ...(SEO_DEFAULTS.twitterCreator ? { creator: SEO_DEFAULTS.twitterCreator } : {}),
    },
    ...(Object.keys(SEARCH_CONSOLE_VERIFICATION).length > 0
      ? { verification: { other: SEARCH_CONSOLE_VERIFICATION } }
      : {}),
  };
}
