import type { JsonLdGraph } from '@/lib/schema/graph';

export interface JsonLdProps {
  readonly graph: JsonLdGraph;
}

/**
 * Emits the page's structured data as a single script tag.
 *
 * `<` is escaped so no string in the content corpus can terminate the script
 * element early, which is the one injection risk in serialising JSON-LD.
 */
export function JsonLd({ graph }: JsonLdProps) {
  const json = JSON.stringify(graph).replace(/</gu, '\\u003c');

  return (
    <script
      type="application/ld+json"
      // The payload is built by our own schema engine from validated data.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
