/**
 * Quick diversity check for dynamic layout recipes.
 *   npx tsx scripts/smoke-layout-recipes.ts
 */
import { buildPageContent } from '../lib/content/engine';
import { composeLayoutRecipe } from '../lib/layout/recipes';
import {
  getAreasByCity,
  getCities,
  getSearchIntents,
  getServices,
  getStateById,
} from '../lib/data/repository';
import { cityPath, serviceInCityPath, servicePath } from '../lib/routing/url';
import type { PageTarget } from '../types/routing';

const city = getCities().find((entry) => entry.slug === 'hyderabad') ?? getCities()[0]!;
const state = getStateById(city.stateId)!;
const service = getServices().find((entry) => entry.slug === 'invisible-grills') ?? getServices()[0]!;
const materialIntent =
  getSearchIntents().find((entry) => entry.dimension === 'material') ?? getSearchIntents()[0]!;
const hasLocalityDir = getAreasByCity(city.id).length > 0;

const targets: PageTarget[] = [
  {
    kind: 'serviceInCity',
    path: serviceInCityPath(service, state, city),
    service,
    location: { state, city },
    traits: [...city.traits],
  },
  {
    kind: 'city',
    path: cityPath(state, city),
    location: { state, city },
    traits: [...city.traits],
  },
  {
    kind: 'service',
    path: servicePath(service),
    service,
    traits: [],
  },
  {
    kind: 'serviceInCityIntent',
    path: `${serviceInCityPath(service, state, city)}/${materialIntent.slug}`,
    service,
    intent: materialIntent,
    location: { state, city },
    traits: [...city.traits],
  },
];

for (const target of targets) {
  const content = buildPageContent(target);
  const recipe = composeLayoutRecipe(target, content, {
    hasGallery: Boolean(target.service?.imageIds.length),
    hasTestimonials: true,
    hasLocalityDir,
    hasCoverage: target.kind === 'service' || target.kind === 'serviceIntent',
  });
  console.log(
    [
      target.kind.padEnd(22),
      recipe.intentProfile.padEnd(14),
      recipe.heroVariant.padEnd(10),
      recipe.ctaEmphasis.padEnd(8),
      recipe.sections.join(' → '),
    ].join(' | '),
  );
}
