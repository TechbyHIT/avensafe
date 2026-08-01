/**
 * Adds Balcony Nets and Bird & Pigeon Nets as published main services,
 * clones structure from Safety Nets, and updates relatedServiceIds.
 *
 *   npx tsx scripts/add-taxonomy-services.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type Service = Record<string, unknown> & {
  id: string;
  slug: string;
  name: string;
  relatedServiceIds: string[];
};

const path = resolve('data/services.json');
const services = JSON.parse(readFileSync(path, 'utf8')) as Service[];

function cloneFromSafety(
  base: Service,
  overrides: Partial<Service> &
    Pick<Service, 'id' | 'slug' | 'name'> & {
      shortName: string;
      summary: string;
      intro: string;
      problemSolved: string;
      searchTerms: string[];
    },
): Service {
  return {
    ...structuredClone(base),
    ...overrides,
    featured: overrides.slug === 'balcony-nets',
    published: true,
    imageIds: base.imageIds,
  };
}

const safety = services.find((s) => s.slug === 'safety-nets');
if (!safety) throw new Error('safety-nets missing');

const extras: Service[] = [];

if (!services.some((s) => s.slug === 'balcony-nets')) {
  extras.push(
    cloneFromSafety(safety, {
      id: 'svc-balcony-nets',
      slug: 'balcony-nets',
      name: 'Balcony Nets',
      shortName: 'Balcony nets',
      category: 'safety',
      summary:
        'Purpose-built balcony enclosure nets for apartments, villas, and high-rise bays — sized for child safety, pet containment, and everyday fall protection.',
      intro:
        'Balcony nets are safety nets specified specifically for residential balcony openings rather than shafts or construction facades. The mesh, perimeter rope, and anchor spacing are chosen for how families actually use a balcony: drying laundry, plants, children, and pets. We treat balcony nets as their own product family so quotations stay focused on parapet geometry, society rules, and the safety goal you name at survey — not a generic “netting” lump sum.',
      problemSolved:
        'Closes apartment and villa balcony openings against falls, pets escaping, and everyday dropped objects while keeping light and airflow.',
      searchTerms: [
        'balcony nets',
        'balcony protection nets',
        'apartment balcony nets',
        'high rise balcony nets',
        'balcony children safety',
        'balcony pet safety',
        'villa balcony nets',
        'balcony net installation',
        'balcony net quote',
        'balcony net price',
      ],
      relatedServiceIds: [
        'svc-safety-nets',
        'svc-invisible-grills',
        'svc-bird-pigeon-nets',
        'svc-cloth-hangers',
      ],
    }),
  );
}

if (!services.some((s) => s.slug === 'bird-pigeon-nets')) {
  extras.push(
    cloneFromSafety(safety, {
      id: 'svc-bird-pigeon-nets',
      slug: 'bird-pigeon-nets',
      name: 'Bird & Pigeon Nets',
      shortName: 'Bird and pigeon nets',
      category: 'safety',
      summary:
        'Fine-mesh bird and pigeon exclusion nets for balconies, windows, ledges, and duct mouths — specified to deny nesting without pretending to be a fall-arrest system.',
      intro:
        'Bird and pigeon nets solve a hygiene and maintenance problem: droppings, nesting, and noise on ledges, utility balconies, and duct openings. Mesh aperture and overlap detailing matter more than brand names — birds exploit any gap at corners and service penetrations. We keep this as a dedicated service so you get a written exclusion specification, not a recycled fall-net quote with the wrong mesh.',
      problemSolved:
        'Stops pigeons and other birds from perching and nesting on balconies, windows, ledges, and duct areas without blocking daylight.',
      searchTerms: [
        'bird nets',
        'pigeon nets',
        'pigeon safety nets',
        'anti bird nets',
        'balcony bird nets',
        'window bird nets',
        'duct area bird nets',
        'bird net installation',
        'pigeon net price',
        'pigeon netting',
      ],
      relatedServiceIds: [
        'svc-safety-nets',
        'svc-balcony-nets',
        'svc-duct-area-safety-nets',
        'svc-invisible-grills',
      ],
      benefits: [
        {
          title: 'Stops nesting cycles',
          detail:
            'Correct aperture and closed corners deny perching so you are not cleaning the same ledge every monsoon.',
        },
        {
          title: 'Keeps daylight',
          detail:
            'Fine mesh reads as a light haze rather than a solid screen, so rooms behind the opening stay usable.',
        },
        {
          title: 'Hygiene first',
          detail:
            'Excluding birds cuts droppings, parasites, and odour at the source instead of relying on temporary spikes alone.',
        },
        {
          title: 'Honest duty rating',
          detail:
            'We do not sell a light bird mesh as a fall barrier — if fall risk exists, we specify a rated product separately.',
        },
      ],
      applications: [
        {
          title: 'Balcony bird exclusion',
          detail:
            'Utility and living balconies where pigeons roost on railings and AC units.',
        },
        {
          title: 'Window and ledge protection',
          detail:
            'Ledges and window reveals that collect nests above pavements or neighbouring flats.',
        },
        {
          title: 'Duct and shaft mouths',
          detail:
            'Openings that draw birds into building services — coordinated with duct-area netting when fall objects are also a risk.',
        },
        {
          title: 'Terrace and plant decks',
          detail:
            'Open terraces where birds land on equipment and create hygiene issues for facility teams.',
        },
      ],
    }),
  );
}

if (extras.length === 0) {
  console.log('Taxonomy services already present.');
  process.exit(0);
}

// Cross-link existing services to the new ones.
for (const service of services) {
  if (service.slug === 'safety-nets') {
    for (const id of ['svc-balcony-nets', 'svc-bird-pigeon-nets']) {
      if (!service.relatedServiceIds.includes(id)) service.relatedServiceIds.push(id);
    }
  }
  if (service.slug === 'invisible-grills' && !service.relatedServiceIds.includes('svc-balcony-nets')) {
    service.relatedServiceIds.push('svc-balcony-nets');
  }
  if (
    service.slug === 'duct-area-safety-nets' &&
    !service.relatedServiceIds.includes('svc-bird-pigeon-nets')
  ) {
    service.relatedServiceIds.push('svc-bird-pigeon-nets');
  }
}

const insertAt = services.findIndex((s) => s.slug === 'safety-nets') + 1;
services.splice(insertAt, 0, ...extras);

writeFileSync(path, `${JSON.stringify(services, null, 2)}\n`, 'utf8');
console.log(
  `Added ${extras.map((s) => s.slug).join(', ')}. Total services: ${services.length}.`,
);
