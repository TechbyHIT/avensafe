/**
 * Maps a finalized photo filename to a service and descriptive tags.
 * Used when syncing photography from the FINIALIZED PHOTOS folders.
 */

export interface PhotoClassification {
  readonly serviceId: string;
  readonly tags: readonly string[];
  readonly role: 'hero' | 'gallery' | 'skip';
}

const SERVICE = {
  invisibleGrills: 'svc-invisible-grills',
  safetyNets: 'svc-safety-nets',
  sportsNets: 'svc-sports-nets',
  clothHangers: 'svc-cloth-hangers',
  ductNets: 'svc-duct-area-safety-nets',
  buildingCovering: 'svc-building-covering-safety-nets',
} as const;

function baseName(fileName: string): string {
  return fileName.replace(/\.(jpe?g|png|webp)$/i, '').toLowerCase().trim();
}

/** Returns how a source file should be catalogued. */
export function classifyPhotoFile(fileName: string): PhotoClassification {
  const base = baseName(fileName);

  if (
    /^(hero|about|proc|process|why|what|test|client|cta|contact|gallery|gall|safe|window|mosq|slid|open|spik|acad|isto|img-|img_)/.test(
      base,
    ) ||
    base.startsWith('mum')
  ) {
    return { serviceId: SERVICE.safetyNets, tags: ['marketing'], role: 'skip' };
  }

  if (/^invi|^i\d|^balc.*grill|window.*grill|stainless/.test(base)) {
    return {
      serviceId: SERVICE.invisibleGrills,
      tags: ['invisible-grills', 'installation'],
      role: base.includes('hero') ? 'hero' : 'gallery',
    };
  }

  if (/^sp |^sp\d|^cric|^sport|^cricket|^football/.test(base)) {
    return {
      serviceId: SERVICE.sportsNets,
      tags: ['sports-nets', 'practice'],
      role: 'gallery',
    };
  }

  if (/^cloth|^fold|^ceil|^hanger|^balc.*cloth/.test(base)) {
    return {
      serviceId: SERVICE.clothHangers,
      tags: ['cloth-hangers', 'utility'],
      role: 'gallery',
    };
  }

  if (/^dc\d|^dc |^duct|^shaft/.test(base)) {
    return {
      serviceId: SERVICE.ductNets,
      tags: ['duct-nets', 'commercial'],
      role: 'gallery',
    };
  }

  if (/^cons|^indu|^build|^facade|^scaffold/.test(base)) {
    return {
      serviceId: SERVICE.buildingCovering,
      tags: ['building-covering', 'construction'],
      role: 'gallery',
    };
  }

  if (/^child|^pet |^pet-/.test(base)) {
    return {
      serviceId: SERVICE.safetyNets,
      tags: ['safety-nets', 'child-safety'],
      role: 'gallery',
    };
  }

  if (/^p\d|^pige|^bird|^monk|^spik|^terr|^stai|^balc|^n\d|^net|^car |^car\d/.test(base)) {
    return {
      serviceId: SERVICE.safetyNets,
      tags: ['safety-nets', 'balcony'],
      role: /^n1$|^hero/.test(base) ? 'hero' : 'gallery',
    };
  }

  return {
    serviceId: SERVICE.safetyNets,
    tags: ['safety-nets', 'general'],
    role: 'gallery',
  };
}

export const SERVICE_LABEL: Readonly<Record<string, string>> = {
  [SERVICE.invisibleGrills]: 'Invisible grills',
  [SERVICE.safetyNets]: 'Safety nets',
  [SERVICE.sportsNets]: 'Sports nets',
  [SERVICE.clothHangers]: 'Cloth hangers',
  [SERVICE.ductNets]: 'Duct area nets',
  [SERVICE.buildingCovering]: 'Building covering nets',
};
