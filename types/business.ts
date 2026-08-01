/**
 * Shapes for the centralized business configuration.
 *
 * These types exist so that `config/business.ts` is the only place business
 * facts are written, and every consumer (metadata, schema, components, forms)
 * reads a strongly typed view of them.
 */

export interface PhoneNumber {
  /** E.164 form, used for `tel:` links and schema. */
  readonly e164: string;
  /** Human readable form, used for on-screen display. */
  readonly display: string;
  readonly label: string;
  readonly isPrimary: boolean;
  readonly whatsapp: boolean;
}

export interface PostalAddress {
  readonly streetAddress: string;
  readonly addressLocality: string;
  readonly addressRegion: string;
  readonly postalCode: string;
  readonly addressCountry: string;
}

export interface GeoCoordinates {
  readonly latitude: number;
  readonly longitude: number;
}

export interface OpeningHours {
  readonly days: readonly string[];
  readonly opens: string;
  readonly closes: string;
}

export interface SocialProfile {
  readonly platform: string;
  readonly url: string;
}

export interface BrandImage {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
}

export interface ProofPoint {
  readonly title: string;
  readonly detail: string;
}

export interface BusinessConfig {
  readonly legalName: string;
  readonly name: string;
  readonly shortName: string;
  readonly tagline: string;
  readonly description: string;
  readonly shortDescription: string;
  readonly foundingYear: number;
  readonly url: string;
  readonly email: string;
  readonly phones: readonly PhoneNumber[];
  /**
   * Left `null` until a verifiable street address is supplied. The schema
   * engine only emits `LocalBusiness` when this is present, so we never
   * publish an invented address.
   */
  readonly address: PostalAddress | null;
  readonly geo: GeoCoordinates | null;
  readonly openingHours: readonly OpeningHours[];
  readonly socialProfiles: readonly SocialProfile[];
  readonly logo: BrandImage;
  readonly openGraphImage: BrandImage;
  readonly priceRange: string | null;
  readonly currency: string;
  readonly languages: readonly string[];
  /** Substantiated trust claims for landing pages — never invent counts here. */
  readonly proofPoints: readonly ProofPoint[];
}
