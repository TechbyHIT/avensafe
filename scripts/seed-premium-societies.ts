/**
 * Seeds named society / apartment community localities.
 * Idempotent: skips existing slugs. Neighbours resolved from live area IDs.
 *
 *   npm run seed:societies
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface AreaRow {
  id: string;
  slug: string;
  name: string;
  cityId: string;
  locationKind?: string;
  profile: string;
  builtForm: string;
  traits: string[];
  notes: string;
  landmarks: string[];
  pincode?: string;
  adjacentAreaIds: string[];
  published: boolean;
}

type Seed = Omit<AreaRow, 'id' | 'adjacentAreaIds'>;

const PATH = resolve('data/areas.json');

const SEEDS: Seed[] = [
  // —— Hyderabad (existing + expansion) ——
  {
    slug: 'my-home-bhooja',
    name: 'My Home Bhooja',
    cityId: 'ct-hyderabad',
    locationKind: 'society',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['arid', 'highRise'],
    notes:
      'My Home Bhooja towers sit in the Financial District belt where many balconies face open corridors and AC ledges. Association rules usually require written approval, daytime drilling windows, and consistent mesh or cable colour across floors so façades stay uniform from the podium up.',
    landmarks: ['Financial District', 'Gachibowli', 'ORR'],
    pincode: '500032',
    published: true,
  },
  {
    slug: 'aparna-sarovar-grande',
    name: 'Aparna Sarovar Grande',
    cityId: 'ct-hyderabad',
    locationKind: 'gated-community',
    profile: 'residential',
    builtForm: 'gated-apartments',
    traits: ['arid', 'highRise'],
    notes:
      'Aparna Sarovar Grande mixes tall towers with landscaped podiums; balcony returns and utility ducts are common pigeon roosts. Installations here are planned around lift bookings, neighbour-facing railings, and UV-stable nets that stay tidy in the dry western Hyderabad sun.',
    landmarks: ['Nallagandla', 'Tellapur Road'],
    pincode: '500019',
    published: true,
  },
  {
    slug: 'prestige-high-fields',
    name: 'Prestige High Fields',
    cityId: 'ct-hyderabad',
    locationKind: 'society',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['arid', 'highRise'],
    notes:
      'Prestige High Fields sits near the Hyderabad Outer Ring Road corridor with deep balconies and glass-heavy living rooms. Families often choose invisible grills on view sides and denser mesh on service balconies; wind exposure at height decides cable tension more than corrosion.',
    landmarks: ['Financial District', 'Nanakramguda'],
    pincode: '500032',
    published: true,
  },
  {
    slug: 'lodha-bellezza',
    name: 'Lodha Bellezza',
    cityId: 'ct-hyderabad',
    locationKind: 'society',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['arid', 'highRise'],
    notes:
      'Lodha Bellezza apartments use large glazed openings where owners want minimal visual clutter. Surveys focus on side returns, pet gaps at rail level, and how laundry or AC outdoor units change the netting plan on utility balconies.',
    landmarks: ['Kukatpally', 'KPHB'],
    pincode: '500072',
    published: true,
  },
  {
    slug: 'my-home-avatar',
    name: 'My Home Avatar',
    cityId: 'ct-hyderabad',
    locationKind: 'society',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['arid', 'highRise'],
    notes:
      'My Home Avatar towers in Narsingi face open western winds across the ORR. High balconies need cable tension checked for gust loads, while utility decks often need denser bird mesh behind outdoor units.',
    landmarks: ['Narsingi', 'ORR'],
    pincode: '500075',
    published: true,
  },
  {
    slug: 'aparna-cyber-commune',
    name: 'Aparna Cyber Commune',
    cityId: 'ct-hyderabad',
    locationKind: 'gated-community',
    profile: 'residential',
    builtForm: 'gated-apartments',
    traits: ['arid', 'highRise'],
    notes:
      'Aparna Cyber Commune sits in the IT corridor where weekday access is gated and noisy work is limited. Child-safe spacing and uniform cable colour are typically confirmed with the association before multi-flat drilling starts.',
    landmarks: ['Gachibowli', 'HITEC City'],
    pincode: '500081',
    published: true,
  },
  {
    slug: 'rajapushpa-provincia',
    name: 'Rajapushpa Provincia',
    cityId: 'ct-hyderabad',
    locationKind: 'township',
    profile: 'residential',
    builtForm: 'gated-apartments',
    traits: ['arid', 'highRise'],
    notes:
      'Rajapushpa Provincia spreads mid- and high-rise blocks with wide podium gardens. Installers plan batch surveys so balcony nets and cloth hangers do not clash with neighbour laundry lines or shared duct shafts.',
    landmarks: ['Tellapur', 'Nallagandla'],
    pincode: '502032',
    published: true,
  },
  {
    slug: 'auro-bindo-galaxy',
    name: 'Aurobindo Galaxy',
    cityId: 'ct-hyderabad',
    locationKind: 'society',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['arid', 'highRise'],
    notes:
      'Aurobindo Galaxy apartments near Raidurg/HITEC see heavy AC ledge bird pressure. Surveys separate view-side invisible grills from service-balcony pigeon nets so owners keep airflow without inviting roosts.',
    landmarks: ['Raidurg', 'HITEC City'],
    pincode: '500081',
    published: true,
  },
  {
    slug: 'sumadhura-acropolis',
    name: 'Sumadhura Acropolis',
    cityId: 'ct-hyderabad',
    locationKind: 'society',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['arid', 'highRise'],
    notes:
      'Sumadhura Acropolis in Nanakramguda mixes glass façades with deep utility balconies. Pet owners often need tighter lower gaps; coastal-grade stainless is rarely required, but UV-stable nets matter in the open western heat.',
    landmarks: ['Nanakramguda', 'Financial District'],
    pincode: '500032',
    published: true,
  },
  {
    slug: 'prestige-ivy-league',
    name: 'Prestige Ivy League',
    cityId: 'ct-hyderabad',
    locationKind: 'society',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['arid', 'highRise'],
    notes:
      'Prestige Ivy League towers near Tellapur have long balcony runs facing internal greens. Association preference for neat edge finishing decides whether cable ends and net borders stay hidden from podium view.',
    landmarks: ['Tellapur', 'Nallagandla'],
    pincode: '502032',
    published: true,
  },
  {
    slug: 'aliens-space-station',
    name: 'Aliens Space Station',
    cityId: 'ct-hyderabad',
    locationKind: 'gated-community',
    profile: 'residential',
    builtForm: 'gated-apartments',
    traits: ['arid', 'highRise'],
    notes:
      'Aliens Space Station in Gachibowli has tall towers where service-lift bookings control install day length. Monkey-prone terrace edges and pigeon AC trays are checked separately from child-safety balcony spans.',
    landmarks: ['Gachibowli', 'ORR'],
    pincode: '500032',
    published: true,
  },
  {
    slug: 'candeur-crescent',
    name: 'Candeur Crescent',
    cityId: 'ct-hyderabad',
    locationKind: 'society',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['arid', 'highRise'],
    notes:
      'Candeur Crescent near Miyapur/Bachupally sees newer towers with open railings. Families compare invisible grills for living-room balconies against denser nets where toddlers use the railing as a play edge.',
    landmarks: ['Miyapur', 'Bachupally'],
    pincode: '500049',
    published: true,
  },
  {
    slug: 'salarpuria-sattva-knowledge-city',
    name: 'Salarpuria Sattva Knowledge City',
    cityId: 'ct-hyderabad',
    locationKind: 'society',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['arid', 'highRise'],
    notes:
      'Salarpuria Sattva Knowledge City residences near Raidurg combine IT-corridor access rules with high wind on upper floors. Quotes list access time, grade, and whether bird mesh is needed on utility decks.',
    landmarks: ['Raidurg', 'Gachibowli'],
    pincode: '500081',
    published: true,
  },
  {
    slug: 'ramky-one-galaxy',
    name: 'Ramky One Galaxy',
    cityId: 'ct-hyderabad',
    locationKind: 'society',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['arid', 'highRise'],
    notes:
      'Ramky One Galaxy near Gachibowli has stacked utility balconies that pigeons treat as ledges. Install plans often split view cables and HDPE bird nets so the front elevation stays light.',
    landmarks: ['Gachibowli', 'Financial District'],
    pincode: '500032',
    published: true,
  },
  {
    slug: 'vasavi-mpm-grand',
    name: 'Vasavi MPM Grand',
    cityId: 'ct-hyderabad',
    locationKind: 'society',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['arid', 'highRise'],
    notes:
      'Vasavi MPM Grand near Attapur/Rajendranagar faces a mix of road noise and open balcony exposures. Surveys check railing height against child reach and whether cloth hangers share the same opening as safety mesh.',
    landmarks: ['Attapur', 'PVNR Expressway'],
    pincode: '500048',
    published: true,
  },
  {
    slug: 'aakriti-aeden',
    name: 'Aakriti Aeden',
    cityId: 'ct-hyderabad',
    locationKind: 'gated-community',
    profile: 'residential',
    builtForm: 'gated-apartments',
    traits: ['arid', 'highRise'],
    notes:
      'Aakriti Aeden near Tellapur prioritises landscaped podiums; associations often want colour-matched nets. Installers confirm side returns and duct openings so bird control does not leave gaps above AC trays.',
    landmarks: ['Tellapur', 'Nallagandla'],
    pincode: '502032',
    published: true,
  },
  {
    slug: 'manjeera-diamond-towers',
    name: 'Manjeera Diamond Towers',
    cityId: 'ct-hyderabad',
    locationKind: 'society',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['arid', 'highRise'],
    notes:
      'Manjeera Diamond Towers in Gachibowli put many living rooms behind glass with shallow balconies. Invisible grill spacing is planned for pets that squeeze under rails, with bird mesh reserved for service decks.',
    landmarks: ['Gachibowli', 'HITEC City'],
    pincode: '500032',
    published: true,
  },
  {
    slug: 'l-and-t-raintree-boulevard',
    name: 'L&T Raintree Boulevard',
    cityId: 'ct-hyderabad',
    locationKind: 'society',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['arid', 'highRise'],
    notes:
      'L&T Raintree Boulevard near Hebbal/ORR Hyderabad (west corridor) has long balcony edges facing internal courts. Uniform society finish and lift access windows drive how multi-flat safety net jobs are scheduled.',
    landmarks: ['ORR', 'Narsingi'],
    pincode: '500075',
    published: true,
  },

  // —— Bengaluru ——
  {
    slug: 'brigade-gateway',
    name: 'Brigade Gateway',
    cityId: 'ct-bengaluru',
    locationKind: 'gated-community',
    profile: 'mixed',
    builtForm: 'high-rise',
    traits: ['humid', 'highRise'],
    notes:
      'Brigade Gateway combines residential towers with mall and office traffic on the Malleswaram–Rajajinagar side. Humidity and monsoon wind push us toward UV-stable nets and stainless fixings; association security often controls when installers can use service lifts.',
    landmarks: ['World Trade Center Bengaluru', 'Orion Mall'],
    pincode: '560055',
    published: true,
  },
  {
    slug: 'prestige-shantiniketan',
    name: 'Prestige Shantiniketan',
    cityId: 'ct-bengaluru',
    locationKind: 'township',
    profile: 'residential',
    builtForm: 'gated-apartments',
    traits: ['humid', 'highRise'],
    notes:
      'Prestige Shantiniketan in Whitefield has long balcony runs facing IT park roads. Bird pressure on AC ledges is common; child-safe spacing and society colour rules are confirmed before any drilling so multi-flat jobs stay consistent.',
    landmarks: ['Whitefield', 'ITPL Road'],
    pincode: '560048',
    published: true,
  },
  {
    slug: 'purva-venezia',
    name: 'Purva Venezia',
    cityId: 'ct-bengaluru',
    locationKind: 'society',
    profile: 'residential',
    builtForm: 'gated-apartments',
    traits: ['humid', 'highRise'],
    notes:
      'Purva Venezia towers near Yelahanka see seasonal bird activity on open utility decks. Installations balance airflow for Bangalore humidity with mesh that still stops pigeons nesting behind AC trays.',
    landmarks: ['Yelahanka', 'Airport Road'],
    pincode: '560064',
    published: true,
  },
  {
    slug: 'brigade-orchards',
    name: 'Brigade Orchards',
    cityId: 'ct-bengaluru',
    locationKind: 'township',
    profile: 'residential',
    builtForm: 'gated-apartments',
    traits: ['humid', 'highRise'],
    notes:
      'Brigade Orchards near Devanahalli mixes mid-rise blocks with open greens. Monsoon moisture and cooler nights change how UV nets age; surveys note pet gaps on villa-style terraces versus apartment rails.',
    landmarks: ['Devanahalli', 'Airport Road'],
    pincode: '562110',
    published: true,
  },
  {
    slug: 'sobha-dream-acres',
    name: 'Sobha Dream Acres',
    cityId: 'ct-bengaluru',
    locationKind: 'township',
    profile: 'residential',
    builtForm: 'gated-apartments',
    traits: ['humid', 'highRise'],
    notes:
      'Sobha Dream Acres on Panathur/Varthur Road has many similar balcony footprints. Batch measuring and shared association guidelines keep invisible grill colour and net borders consistent across floors.',
    landmarks: ['Panathur', 'Varthur'],
    pincode: '560087',
    published: true,
  },
  {
    slug: 'prestige-lakeside-habitat',
    name: 'Prestige Lakeside Habitat',
    cityId: 'ct-bengaluru',
    locationKind: 'township',
    profile: 'residential',
    builtForm: 'gated-apartments',
    traits: ['humid', 'highRise'],
    notes:
      'Prestige Lakeside Habitat near Varthur lake edge sees damp air and bird activity around water. Fixings favour corrosion-aware stainless and UV mesh; balcony plans separate view sides from service decks.',
    landmarks: ['Varthur', 'Sarjapur Road'],
    pincode: '560087',
    published: true,
  },
  {
    slug: 'godrej-air',
    name: 'Godrej Air',
    cityId: 'ct-bengaluru',
    locationKind: 'society',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['humid', 'highRise'],
    notes:
      'Godrej Air on Hosur Road has tall towers with strong afternoon wind. Cable tension and pet-safe lower gaps are checked together so high-rise openings stay secure without darkening rooms.',
    landmarks: ['Hosur Road', 'Bommanahalli'],
    pincode: '560068',
    published: true,
  },
  {
    slug: 'total-environment-pursuit-of-a-radical-rhapsody',
    name: 'Total Environment Pursuit of a Radical Rhapsody',
    cityId: 'ct-bengaluru',
    locationKind: 'society',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['humid', 'highRise'],
    notes:
      'Total Environment’s Whitefield project emphasises large openings and landscape views. Owners often want near-invisible cables on living balconies and discreet bird nets only where AC ledges show droppings.',
    landmarks: ['Whitefield', 'ITPL'],
    pincode: '560066',
    published: true,
  },
  {
    slug: 'brigade-cornerstone-utopia',
    name: 'Brigade Cornerstone Utopia',
    cityId: 'ct-bengaluru',
    locationKind: 'township',
    profile: 'residential',
    builtForm: 'gated-apartments',
    traits: ['humid', 'highRise'],
    notes:
      'Brigade Cornerstone Utopia near Varthur/ORR has long internal roads and many identical towers. Society work is sequenced by block so lift bookings and colour standards stay predictable for nets and grills.',
    landmarks: ['Varthur', 'ORR Bengaluru'],
    pincode: '560087',
    published: true,
  },
  {
    slug: 'purva-westend',
    name: 'Purva Westend',
    cityId: 'ct-bengaluru',
    locationKind: 'society',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['humid', 'highRise'],
    notes:
      'Purva Westend near Mysore Road faces monsoon-driven humidity. Surveys check for rust-prone mild hardware on older rails and recommend UV-stable nets where laundry and bird pressure share the same balcony.',
    landmarks: ['Mysore Road', 'Kengeri'],
    pincode: '560059',
    published: true,
  },
  {
    slug: 'mantri-serenity',
    name: 'Mantri Serenity',
    cityId: 'ct-bengaluru',
    locationKind: 'gated-community',
    profile: 'residential',
    builtForm: 'gated-apartments',
    traits: ['humid', 'highRise'],
    notes:
      'Mantri Serenity near Kanakapura Road mixes apartments with greener edges that attract birds. Child-safe balcony nets and terrace edges are planned around how residents use outdoor seating in humid evenings.',
    landmarks: ['Kanakapura Road', 'Thalaghattapura'],
    pincode: '560062',
    published: true,
  },
  {
    slug: 'sobha-city',
    name: 'Sobha City',
    cityId: 'ct-bengaluru',
    locationKind: 'township',
    profile: 'residential',
    builtForm: 'gated-apartments',
    traits: ['humid', 'highRise'],
    notes:
      'Sobha City on Thanisandra has clustered towers where association rules prefer neat, uniform balcony finishes. Multi-flat invisible grill jobs are quoted with shared colour and spacing standards.',
    landmarks: ['Thanisandra', 'Hebbal'],
    pincode: '560077',
    published: true,
  },

  // —— Chennai ——
  {
    slug: 'casa-grande-apartments-omr',
    name: 'Casa Grande OMR Corridor',
    cityId: 'ct-chennai',
    locationKind: 'apartment',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['coastal', 'humid', 'highRise'],
    notes:
      'OMR corridor apartments face salt-laden air from the Bay of Bengal, so stainless grade and fixing protection matter as much as mesh size. Balcony nets and invisible grills are specified for coastal corrosion and monsoon-driven bird roosting on ledges.',
    landmarks: ['OMR', 'Sholinganallur'],
    pincode: '600119',
    published: true,
  },
  {
    slug: 'tvh-ouranya-bay',
    name: 'TVH Ouranya Bay',
    cityId: 'ct-chennai',
    locationKind: 'society',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['coastal', 'humid', 'highRise'],
    notes:
      'TVH Ouranya Bay sits in a coastal Chennai microclimate where SS316 and sealed anchors outperform painted mild-steel hardware. Many flats want clear-view protection on sea-facing sides and denser bird mesh on service balconies.',
    landmarks: ['ECR', 'Neelangarai'],
    pincode: '600115',
    published: true,
  },
  {
    slug: 'spr-city',
    name: 'SPR City',
    cityId: 'ct-chennai',
    locationKind: 'township',
    profile: 'residential',
    builtForm: 'gated-apartments',
    traits: ['humid', 'highRise'],
    notes:
      'SPR City clusters mid- and high-rise blocks with shared podiums. Multi-flat society work needs batch surveying, uniform detailing, and lift slots so child-safety nets and cloth hangers do not block neighbouring openings.',
    landmarks: ['Perambur', 'Chennai Central belt'],
    pincode: '600011',
    published: true,
  },
  {
    slug: 'casagrand-supremus',
    name: 'Casagrand Supremus',
    cityId: 'ct-chennai',
    locationKind: 'society',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['humid', 'highRise'],
    notes:
      'Casagrand Supremus near Sholinganallur/OMR sees humidity and IT-corridor access control. Quotes separate coastal-grade hardware needs from inland Chennai jobs a few kilometres west.',
    landmarks: ['Sholinganallur', 'OMR'],
    pincode: '600119',
    published: true,
  },
  {
    slug: 'prestige-bella-vista',
    name: 'Prestige Bella Vista',
    cityId: 'ct-chennai',
    locationKind: 'society',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['humid', 'highRise'],
    notes:
      'Prestige Bella Vista near Porur has deep balconies facing both road and courtyard. Families often split invisible grills on living sides from pigeon nets on utility decks where AC trays collect droppings in monsoon months.',
    landmarks: ['Porur', 'Mount Poonamallee Road'],
    pincode: '600116',
    published: true,
  },
  {
    slug: 'plaza-park-square',
    name: 'Appaswamy Plaza Park Square',
    cityId: 'ct-chennai',
    locationKind: 'society',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['humid', 'highRise'],
    notes:
      'Plaza Park Square near Guindy/Alnandur deals with dense urban bird pressure and limited street parking for install vans. Surveys confirm lift size for material and whether balcony returns face neighbouring towers.',
    landmarks: ['Guindy', 'Alandur'],
    pincode: '600016',
    published: true,
  },
  {
    slug: 'radiance-the-pride',
    name: 'Radiance The Pride',
    cityId: 'ct-chennai',
    locationKind: 'society',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['humid', 'highRise'],
    notes:
      'Radiance The Pride near Perungudi/OMR has stacked utility balconies that pigeons reuse after incomplete netting. Full-opening bird nets and sealed edges are preferred over partial panels.',
    landmarks: ['Perungudi', 'OMR'],
    pincode: '600096',
    published: true,
  },
  {
    slug: 'casa-grande-firstcity',
    name: 'Casa Grande First City',
    cityId: 'ct-chennai',
    locationKind: 'gated-community',
    profile: 'residential',
    builtForm: 'gated-apartments',
    traits: ['humid', 'highRise'],
    notes:
      'Casa Grande First City near Kelambakkam/OMR stretches across multiple blocks. Society-wide colour and spacing standards are agreed before drilling so balcony safety nets look consistent from the gate road.',
    landmarks: ['Kelambakkam', 'OMR'],
    pincode: '603103',
    published: true,
  },
  {
    slug: 'doshi-housing-etania',
    name: 'Doshi Etania',
    cityId: 'ct-chennai',
    locationKind: 'society',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['humid', 'highRise'],
    notes:
      'Doshi Etania near Medavakkam sees humid inland air rather than direct salt spray. Child-safe balcony nets and cloth hangers are planned so laundry lines do not sag into neighbour openings.',
    landmarks: ['Medavakkam', 'Velachery'],
    pincode: '600100',
    published: true,
  },
  {
    slug: 'landmark-apartment-t-nagar',
    name: 'Landmark Residences T. Nagar Belt',
    cityId: 'ct-chennai',
    locationKind: 'apartment',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['humid', 'highRise'],
    notes:
      'Central Chennai apartment belts near T. Nagar have tighter streets and older railings. Surveys check concrete strength for anchors and whether window safety nets are needed alongside balcony systems.',
    landmarks: ['T. Nagar', 'Nandanam'],
    pincode: '600017',
    published: true,
  },

  // —— Visakhapatnam ——
  {
    slug: 'vuda-colony-mvp',
    name: 'VUDA Colony MVP',
    cityId: 'ct-visakhapatnam',
    locationKind: 'colony',
    profile: 'residential',
    builtForm: 'mixed',
    traits: ['coastal', 'humid'],
    notes:
      'VUDA Colony MVP sits closer to the Vizag coast where salt air accelerates corrosion. Stainless grade and sealed fixings are prioritised for balcony nets and invisible grills on sea-influenced elevations.',
    landmarks: ['MVP Colony', 'Beach Road'],
    pincode: '530017',
    published: true,
  },
  {
    slug: 'seethammadhara-towers',
    name: 'Seethammadhara Apartment Cluster',
    cityId: 'ct-visakhapatnam',
    locationKind: 'apartment',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['coastal', 'humid', 'highRise'],
    notes:
      'Seethammadhara mid-rises catch humid Bay winds. Pigeon pressure on AC ledges is common; coastal SS specifications are written into quotes before install day.',
    landmarks: ['Seethammadhara', 'NAD Junction'],
    pincode: '530013',
    published: true,
  },
  {
    slug: 'madhurawada-gated-homes',
    name: 'Madhurawada Gated Homes',
    cityId: 'ct-visakhapatnam',
    locationKind: 'gated-community',
    profile: 'residential',
    builtForm: 'gated-apartments',
    traits: ['coastal', 'humid', 'highRise'],
    notes:
      'Madhurawada gated projects along the beach/IT corridor combine new towers with open terraces. Child-safe nets and bird control are surveyed together because utility decks face wind-driven roosting.',
    landmarks: ['Madhurawada', 'Beach Road north'],
    pincode: '530048',
    published: true,
  },
  {
    slug: 'gajuwaka-industrial-housing',
    name: 'Gajuwaka Industrial Housing Belt',
    cityId: 'ct-visakhapatnam',
    locationKind: 'residential-area',
    profile: 'mixed',
    builtForm: 'mixed',
    traits: ['coastal', 'industrial', 'humid'],
    notes:
      'Gajuwaka housing near industrial belts sees dust and bird activity around open ducts. Building covering and duct nets are often discussed alongside balcony safety for worker and family flats.',
    landmarks: ['Gajuwaka', 'Autonagar'],
    pincode: '530026',
    published: true,
  },
  {
    slug: 'rushikonda-hillside-apartments',
    name: 'Rushikonda Hillside Apartments',
    cityId: 'ct-visakhapatnam',
    locationKind: 'apartment',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['coastal', 'humid', 'highRise'],
    notes:
      'Rushikonda hillside apartments face salt mist and steep access roads. Material hoisting and SS316-class fixings are planned early; view-side grills are popular for Bay-facing balconies.',
    landmarks: ['Rushikonda', 'Beach Road'],
    pincode: '530045',
    published: true,
  },
  {
    slug: 'pm-palem-society-cluster',
    name: 'PM Palem Society Cluster',
    cityId: 'ct-visakhapatnam',
    locationKind: 'society',
    profile: 'residential',
    builtForm: 'gated-apartments',
    traits: ['coastal', 'humid', 'highRise'],
    notes:
      'PM Palem societies near the IT SEZ have many similar balconies. Batch surveys and association colour rules keep pigeon nets and child-safety installs consistent across towers.',
    landmarks: ['PM Palem', 'Madhurawada'],
    pincode: '530041',
    published: true,
  },
  {
    slug: 'dabagardens-apartment-belt',
    name: 'Dabagardens Apartment Belt',
    cityId: 'ct-visakhapatnam',
    locationKind: 'apartment',
    profile: 'residential',
    builtForm: 'mixed',
    traits: ['coastal', 'humid'],
    notes:
      'Dabagardens mid-city apartments have tighter streets and older railings. Anchor pull tests and coastal-grade hardware are checked before recommending invisible grills on street-facing balconies.',
    landmarks: ['Dabagardens', 'Jagadamba'],
    pincode: '530020',
    published: true,
  },
  {
    slug: 'yendada-coastal-residences',
    name: 'Yendada Coastal Residences',
    cityId: 'ct-visakhapatnam',
    locationKind: 'apartment',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['coastal', 'humid', 'highRise'],
    notes:
      'Yendada residences sit in a salt-air band where painted mild steel fails early. Quotes specify stainless and sealed edges; bird nets on utility decks are common alongside clear-view living balconies.',
    landmarks: ['Yendada', 'Beach Road'],
    pincode: '530045',
    published: true,
  },

  // —— Vijayawada ——
  {
    slug: 'benz-circle-apartment-cluster',
    name: 'Benz Circle Apartment Cluster',
    cityId: 'ct-vijayawada',
    locationKind: 'apartment',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['humid', 'highRise'],
    notes:
      'Benz Circle apartments sit in dense central Vijayawada traffic. Surveys account for street noise, limited parking for install vans, and balcony returns that face neighbouring towers.',
    landmarks: ['Benz Circle', 'MG Road'],
    pincode: '520010',
    published: true,
  },
  {
    slug: 'patamata-gated-towers',
    name: 'Patamata Gated Towers',
    cityId: 'ct-vijayawada',
    locationKind: 'gated-community',
    profile: 'residential',
    builtForm: 'gated-apartments',
    traits: ['humid', 'highRise'],
    notes:
      'Patamata gated towers see humid Krishna-belt weather. UV-stable nets and stainless fixings are preferred; associations often want uniform balcony finishes on podium-facing sides.',
    landmarks: ['Patamata', 'Auto Nagar'],
    pincode: '520007',
    published: true,
  },
  {
    slug: 'poranki-new-township',
    name: 'Poranki New Township Residences',
    cityId: 'ct-vijayawada',
    locationKind: 'township',
    profile: 'residential',
    builtForm: 'gated-apartments',
    traits: ['humid', 'highRise'],
    notes:
      'Poranki township growth brings new mid-rises with open rails. Child-safe balcony nets and cloth hangers are frequently requested together for young families moving outward from the city core.',
    landmarks: ['Poranki', 'Gannavaram Road'],
    pincode: '521137',
    published: true,
  },
  {
    slug: 'currency-nagar-societies',
    name: 'Currency Nagar Societies',
    cityId: 'ct-vijayawada',
    locationKind: 'society',
    profile: 'residential',
    builtForm: 'gated-apartments',
    traits: ['humid', 'highRise'],
    notes:
      'Currency Nagar societies have stacked utility balconies that attract pigeons in humid months. Full-opening bird nets plus measured child gaps on living balconies are planned in one site visit when possible.',
    landmarks: ['Currency Nagar', 'Guru Nanak Colony'],
    pincode: '520008',
    published: true,
  },
  {
    slug: 'kanuru-apartment-belt',
    name: 'Kanuru Apartment Belt',
    cityId: 'ct-vijayawada',
    locationKind: 'apartment',
    profile: 'residential',
    builtForm: 'mixed',
    traits: ['humid', 'highRise'],
    notes:
      'Kanuru’s apartment belt mixes older walk-ups and newer towers. Anchor suitability and railing type are verified before quoting invisible grills; bird mesh is common on open kitchen balconies.',
    landmarks: ['Kanuru', 'Penamaluru'],
    pincode: '520007',
    published: true,
  },
  {
    slug: 'ramavarappadu-ring-residences',
    name: 'Ramavarappadu Ring Residences',
    cityId: 'ct-vijayawada',
    locationKind: 'apartment',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['humid', 'highRise'],
    notes:
      'Ramavarappadu residences near the ring road see dust and wind on upper floors. Cable tension and UV nets are specified with access notes for highway-side towers.',
    landmarks: ['Ramavarappadu', 'NH16'],
    pincode: '521108',
    published: true,
  },
  {
    slug: 'gollapudi-riverside-apartments',
    name: 'Gollapudi Riverside Apartments',
    cityId: 'ct-vijayawada',
    locationKind: 'apartment',
    profile: 'residential',
    builtForm: 'high-rise',
    traits: ['humid', 'highRise'],
    notes:
      'Gollapudi apartments near the Krishna riverside belt deal with humidity and occasional flood-season moisture. Stainless hardware and sealed edges are preferred for long balcony nets.',
    landmarks: ['Gollapudi', 'Krishna River belt'],
    pincode: '521225',
    published: true,
  },
  {
    slug: 'labbipet-central-apartments',
    name: 'Labbipet Central Apartments',
    cityId: 'ct-vijayawada',
    locationKind: 'apartment',
    profile: 'residential',
    builtForm: 'mixed',
    traits: ['humid', 'highRise'],
    notes:
      'Labbipet central apartments have compact balconies and busy street access. Window safety nets and balcony child gaps are often surveyed together for families in older buildings.',
    landmarks: ['Labbipet', 'Governorpet'],
    pincode: '520010',
    published: true,
  },
];

function main() {
  const raw = readFileSync(PATH, 'utf8');
  const areas = JSON.parse(raw) as AreaRow[];
  const bySlug = new Set(areas.map((a) => a.slug));
  const byId = new Set(areas.map((a) => a.id));

  const neighboursByCity = new Map<string, string[]>();
  for (const area of areas) {
    if (!area.published) continue;
    const list = neighboursByCity.get(area.cityId) ?? [];
    if (list.length < 10) list.push(area.id);
    neighboursByCity.set(area.cityId, list);
  }

  let added = 0;
  let skipped = 0;

  for (const seed of SEEDS) {
    if (bySlug.has(seed.slug)) {
      skipped += 1;
      continue;
    }
    const id = `ar-soc-${seed.slug}`.slice(0, 80);
    if (byId.has(id)) {
      skipped += 1;
      continue;
    }

    const neighbours = (neighboursByCity.get(seed.cityId) ?? []).filter((nid) => nid !== id);

    areas.push({
      ...seed,
      id,
      adjacentAreaIds: neighbours.slice(0, 8),
    });
    bySlug.add(seed.slug);
    byId.add(id);
    added += 1;
    console.log(`+ ${seed.name}`);
  }

  writeFileSync(PATH, `${JSON.stringify(areas, null, 2)}\n`, 'utf8');
  console.log(`\nAdded ${added}, skipped ${skipped}. Total areas: ${areas.length}`);
  console.log(`Society seeds defined: ${SEEDS.length}`);
}

main();
