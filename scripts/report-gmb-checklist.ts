/**
 * Prints the GMB launch checklist for priority Avensafe cities.
 *
 *   npm run report:gmb
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { business, primaryPhone, whatsappPhone } from '../config/business';

interface GmbProfile {
  citySlug: string;
  cityName: string;
  stateName: string;
  priority: number;
  suggestedCategories: string[];
  primaryServiceAreaNote: string;
  serviceRadiusKm: number;
  napChecklist: string[];
}

const profiles = JSON.parse(
  readFileSync(resolve('data/gmb-city-profiles.json'), 'utf8'),
) as GmbProfile[];

console.log(`\nAvensafe GMB launch pack`);
console.log(`Brand: ${business.name}`);
console.log(`Primary: ${primaryPhone.display} · WhatsApp: ${whatsappPhone.display}`);
console.log(`Site: ${business.url}`);
console.log(`Address on file: ${business.address ? 'YES' : 'NO — add verified address before LocalBusiness schema'}`);
console.log('');

for (const profile of profiles.sort((a, b) => a.priority - b.priority)) {
  console.log(`────────────────────────────────────────`);
  console.log(`P${profile.priority}  ${profile.cityName}, ${profile.stateName}`);
  console.log(`Area: ${profile.primaryServiceAreaNote}`);
  console.log(`Radius: ~${profile.serviceRadiusKm} km`);
  console.log(`Categories: ${profile.suggestedCategories.join(' · ')}`);
  console.log(`Checklist:`);
  for (const item of profile.napChecklist) {
    console.log(`  [ ] ${item}`);
  }
  console.log('');
}

console.log(`Create one GMB profile per city (or service-area profile where Google allows).`);
console.log(`Keep NAP identical to the website. Do not invent street addresses.\n`);
