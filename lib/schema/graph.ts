import type { JsonLdNode } from '@/lib/schema/builders';
import {
  localBusinessSchema,
  organizationSchema,
  websiteSchema,
} from '@/lib/schema/builders';

/**
 * Assembles JSON-LD nodes into a single `@graph` document.
 *
 * One script tag per page keeps the markup clean and lets nodes cross-reference
 * by `@id`. Undefined entries are dropped, which is how optional schema —
 * `LocalBusiness` without a verified address, `FAQPage` without FAQs — simply
 * does not appear rather than being emitted empty.
 */

export interface JsonLdGraph {
  readonly '@context': 'https://schema.org';
  readonly '@graph': readonly JsonLdNode[];
}

export function buildGraph(nodes: readonly (JsonLdNode | undefined)[]): JsonLdGraph {
  const global = [organizationSchema(), websiteSchema(), localBusinessSchema()];
  const all = [...global, ...nodes].filter((node): node is JsonLdNode => node !== undefined);

  // Guard against the same node being contributed twice by different builders.
  const seen = new Set<string>();
  const deduped: JsonLdNode[] = [];
  for (const node of all) {
    const id = typeof node['@id'] === 'string' ? node['@id'] : undefined;
    if (id) {
      if (seen.has(id)) continue;
      seen.add(id);
    }
    deduped.push(node);
  }

  return { '@context': 'https://schema.org', '@graph': deduped };
}
