/**
 * Scaffold for importing Local Government Directory (LGD) rows into `data/`.
 *
 * This script does not download or fabricate mandals, villages, wards, or other
 * admin units. Run it to see the expected workflow before wiring a real import.
 *
 * Recommended steps when you are ready:
 *  1. Obtain the official LGD export (CSV/XML) from the Ministry of Panchayati Raj.
 *  2. Map LGD state / district / sub-district codes to existing `states.json` and
 *     `districts.json` ids (use optional `sourceCode` on district rows).
 *  3. Extend or add JSON files for mandals, villages, wards — with Zod schemas in
 *     `lib/data/schemas.ts` and getters in `lib/data/repository.ts`.
 *  4. Set `locationKind` on `areas.json` rows (or new files) per `config/location-hierarchy.ts`.
 *  5. Run `npm run validate:data` after every import batch.
 *
 * Do not commit unverified third-party dumps or invent geographic rows here.
 */

console.log(`
LGD import scaffold (no data written)

Next steps:
  • Add an importer under scripts/ that reads your LGD file path from argv.
  • Reconcile codes against data/districts.json before creating area rows.
  • Keep city URLs at /{state}/{city}/… — district hubs stay at /{state}/district/{district}.
  • Re-run: npm run validate:data && npm run typecheck
`);

process.exit(0);
