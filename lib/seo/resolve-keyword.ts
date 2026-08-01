import type { City, Service, State } from '@/lib/data/schemas';
import { serviceInCityPath } from '@/lib/routing/url';
import {
  normalizeKeywordPhrase,
  resolveKeywordPhrase,
  type KeywordResolution,
} from '@/lib/seo/keyword-resolver';

export type { KeywordResolution };

export interface ResolvedKeyword {
  readonly phrase: string;
  readonly serviceSlug: string;
  readonly intentSlug?: string;
  readonly service: Service;
}

/** @deprecated Prefer `normalizeKeywordPhrase` from `@/lib/seo/keyword-resolver`. */
export const normalizePhrase = normalizeKeywordPhrase;

/**
 * Resolves a Google-style phrase to a service and optional intent slug.
 * Returns null when the phrase does not match a product we install.
 */
export function resolveSearchPhrase(phrase: string): ResolvedKeyword | null {
  const result = resolveKeywordPhrase(phrase);
  if (!result.service) return null;

  return {
    phrase: result.phrase,
    serviceSlug: result.service.slug,
    intentSlug: result.intent?.slug,
    service: result.service,
  };
}

export function pathForResolvedKeyword(
  resolved: ResolvedKeyword,
  state: State,
  city: City,
): string {
  const full = resolveKeywordPhrase(resolved.phrase, { state, city });
  return full.examplePath ?? serviceInCityPath(resolved.service, state, city);
}
