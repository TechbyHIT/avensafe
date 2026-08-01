export type Section = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  callout?: string;
};

export function p(...parts: string[]): string {
  return parts.join(' ');
}

export function section(
  heading: string,
  paragraphs: string[],
  extras?: Partial<Section>,
): Section {
  return { heading, paragraphs, ...extras };
}
