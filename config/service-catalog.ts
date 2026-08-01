/**
 * Roadmap of services to model in `data/services.json`.
 *
 * Each entry needs full structured copy before `published: true`. The live site
 * only loads services from JSON; this file is the checklist for expansion toward
 * 15–20 SKUs without duplicating slugs or names in code.
 */
export const SERVICE_CATALOG = [
  { slug: 'invisible-grills', name: 'Invisible Grills', inData: true },
  { slug: 'safety-nets', name: 'Balcony Safety Nets', inData: true },
  { slug: 'sports-nets', name: 'Sports Nets', inData: true },
  { slug: 'cloth-hangers', name: 'Cloth Hangers', inData: true },
  { slug: 'duct-area-safety-nets', name: 'Duct Area Nets', inData: true },
  { slug: 'building-covering-safety-nets', name: 'Building Covering Nets', inData: true },
  { slug: 'bird-nets', name: 'Bird Nets', inData: false },
  { slug: 'pigeon-nets', name: 'Pigeon Nets', inData: false },
  { slug: 'monkey-nets', name: 'Monkey Nets', inData: false },
  { slug: 'cricket-nets', name: 'Cricket Nets', inData: false },
  { slug: 'football-nets', name: 'Football Nets', inData: false },
  { slug: 'coconut-tree-nets', name: 'Coconut Tree Nets', inData: false },
  { slug: 'motorized-cloth-hangers', name: 'Motorized Cloth Hangers', inData: false },
  { slug: 'zip-screens', name: 'Zip Screens', inData: false },
  { slug: 'motorized-zip-screens', name: 'Motorized Zip Screens', inData: false },
  { slug: 'mosquito-mesh', name: 'Mosquito Mesh', inData: false },
  { slug: 'bird-spikes', name: 'Bird Spikes', inData: false },
] as const;
