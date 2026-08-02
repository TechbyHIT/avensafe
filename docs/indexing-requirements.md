# Indexability & XML Sitemap Requirements

Maps the mandatory indexing checklist to Avensafe implementation. Inventory is
JSON-driven (~3.1M published URLs). Sitemaps are generated on demand from the
same inventory as routes — no manual sitemap editing.

## Architecture

```
data/*.json (published only)
        ↓
lib/routing/inventory.ts
        ↓
lib/sitemap/engine.ts  →  /sitemap.xml + /sitemaps/*.xml
lib/seo/metadata.ts    →  canonical + robots
lib/schema/*           →  JSON-LD + BreadcrumbList
lib/links/engine.ts    →  internal links (anti-orphan)
```

Validators:

- `npm run validate:sitemap` — full policy + protocol samples
- `npm run validate:sitemap:ci` — faster samples (used by `pm2-quick.sh`)
- `npm run validate:seo` — titles, H1s, schema, orphans, images
- `npm run verify` — data + ISR + types + lint + seo + sitemap

## Requirement map (#1–35)

| # | Requirement | Implementation |
|---|-------------|----------------|
| 1 | HTTP 200 | Valid inventory resolves via App Router; runtime health = nginx → PM2 `:3006`. Not re-proven for all 3.1M at build time. |
| 2 | In XML sitemap | [`lib/sitemap/engine.ts`](../lib/sitemap/engine.ts) buckets cover inventory + core/guides/blog |
| 3 | Referenced from index | [`app/sitemap.xml/route.ts`](../app/sitemap.xml/route.ts) → child locs |
| 4 | New pages auto-appear | Published JSON → inventory → sitemap on next request (no manual step) |
| 5 | Valid XML | `renderUrlset` / `renderSitemapIndex`; checked in `validate:sitemap` |
| 6 | Self-canonical | [`lib/seo/metadata.ts`](../lib/seo/metadata.ts) `alternates.canonical` |
| 7 | No noindex by default | [`lib/routing/publishing.ts`](../lib/routing/publishing.ts) — structural faults only |
| 8 | Not blocked in robots | [`app/robots.ts`](../app/robots.ts) — only `/api/` disallowed |
| 9 | Absolute HTTPS locs | `business.url` + `absoluteUrl()` |
| 10 | `<loc>` + `<lastmod>` | Required in engine; corpus lastmod via [`lib/sitemap/lastmod.ts`](../lib/sitemap/lastmod.ts) |
| 11 | lastmod on content change | `SITEMAP_CONTENT_VERSION` + inventory fingerprint; guides/blog use `updatedAt` |
| 12 | Remove deleted URLs | Unpublished rows filtered in repository → drop from inventory/sitemap |
| 13 | No redirects/broken/dups in sitemap | Published inventory only; batch dedupe by `loc` |
| 14–15 | Internal links / no orphans | [`lib/links/engine.ts`](../lib/links/engine.ts); orphan check in `validate:seo` |
| 16 | Unique title/desc/H1/canonical/schema | Composer + `validate:seo` duplicate detection (sampled at scale) |
| 17–18 | JSON-LD + breadcrumbs | [`lib/schema/page-graph.ts`](../lib/schema/page-graph.ts) |
| 19 | SEO-friendly URLs | [`lib/routing/url.ts`](../lib/routing/url.ts) builders |
| 20 | Mobile-friendly | Responsive layout / Tailwind; StickyMobileCta |
| 21 | SSR/SSG HTML | Next App Router SSG + ISR (`AVENSAFE_QUICK_BUILD` skips long-tail prerender only) |
| 22–23 | Crawlable images + alt | `public/` + image records; alt required in schemas; SEO validator samples files/alt |
| 24 | Fast / crawl budget | Batched sitemaps (5k), ISR, society-page weight reductions |
| 25 | Facets canonicalization | Intent/service URL builders + self-canonicals (no filter querystrings) |
| 26–27 | Auto regenerate / sync | Dynamic route handlers; index locs must match `listSitemapFileNames()` |
| 28 | No duplicate sitemap entries | `dedupeUrls` per batch |
| 29 | Discoverable via links + sitemap | Link engine + sitemap index |
| 30 | Zero manual maintenance | JSON publish = live inventory |
| 31 | Eligible for Google/Bing | Indexable robots + https + sitemap + SSR |
| 32 | Validate before deploy | `VALIDATE_SITEMAP=1` default in [`deploy/pm2-quick.sh`](../deploy/pm2-quick.sh) |
| 33 | Crawl efficiency | Sitemap index + 5k batches + priorities/changefreq |
| 34 | Prevent dupes/soft-404/conflicts | Publishing gate softReasons (advisory); structural noindex; unique canonicals |
| 35 | Search Essentials / sitemap protocol | This doc + validators |

## lastmod strategy

- Inventory/core: `corpusSitemapLastmod()` from `VARIATION_SEED` + `SITEMAP_CONTENT_VERSION` + inventory counts.
- Guides/blog: `max(entity.updatedAt, corpusLastmod)`.
- Bump [`SITEMAP_CONTENT_VERSION`](../config/constants.ts) when composer/templates change without count changes.

## Scale notes

- Full unique-title proof across 3.1M URLs is composer-driven; `validate:seo` walks `listAllTargets()` where feasible.
- Thin-content floors are **advisory** (`softReasons`) and do not set `noindex`.
- HTTP 200 for ISR long-tail depends on a healthy PM2 standalone (static + public present).

## Enterprise discovery checklist (summary)

| Area | Status |
|------|--------|
| XML sitemap index + partitioned children (≤5k) | Yes — dynamic handlers |
| Absolute HTTPS loc + lastmod on every entry | Yes — corpus fingerprint |
| No unpublished / noindex / robots-blocked URLs | Yes — repo filters + publishing gate + validator |
| Exactly one sitemap membership (light buckets) | Checked in `validate:sitemap` |
| Self-canonical HTTPS, OG/Twitter, robots meta | `buildMetadata` |
| JSON-LD WebPage + Breadcrumb + Service/FAQ | `lib/schema/*` |
| Internal links / orphan detection | `lib/links/engine.ts` + `validate:seo` |
| SSR/SSG/ISR HTML (not client-only SEO) | App Router |
| robots.txt → sitemap index; allow public pages | `app/robots.ts` |
| Clean lowercase hyphen slugs; no trailing slash | `normalizePath` + slug builders |
| Image alt + image sitemap gallery entry | schemas + images bucket |
| Pre-deploy sitemap validation | `VALIDATE_SITEMAP=1` on `pm2-quick.sh` |

Scale reality: long-tail uniqueness and HTTP 200 for ISR pages are enforced by
composer + healthy PM2 runtime; full 3.1M HTTP probing is not done at build time.

## Operators

```bash
npm run validate:sitemap:ci
# VPS quick deploy (validates sitemap by default):
bash deploy/pm2-quick.sh
# Skip gate if RAM/disk tight:
VALIDATE_SITEMAP=0 bash deploy/pm2-quick.sh
```
