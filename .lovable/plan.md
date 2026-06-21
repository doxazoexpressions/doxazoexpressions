
# Doxazo Expressions — MVP Wrap-Up Plan

Scope: bring the site to MVP-ready per the handoff checklist. Devotional-first only. Prayers/Teachings/Speaking remain in DB/Admin but stay hidden from public.

## Phase 1 — Messaging & Homepage alignment
- Rewrite hero subcopy + mission section to remove references to prayers/teachings/speaking. Keep "daily discipleship companion" tone.
- Filter Testimonies on homepage to only those tagged as devotional-related (or rewrite generic ones).
- Add a third entry point in hero/homepage: **Explore Categories** (tertiary CTA, lower emphasis than Today's Devotional + Browse Archive).
- Tighten vertical spacing and mobile hero contrast (overlay + larger headline tracking on `sm:`).

## Phase 2 — Devotional content model (DB migration)
Add to `devotionals` table:
- `category` (enum: series, divine_relationship, destiny_purpose, blessings, prayers, life_relationships)
- `series` (text, nullable)
- `excerpt` (text, nullable — auto-derived if blank)
- `audio_url` (text, nullable)
- `seo_title`, `seo_description` (text, nullable)
- `scheduled_for` (timestamptz, nullable) — for publish scheduling
- Index on `(published, publish_date desc)` and on `category`.

A scheduled job (cron via pg_cron) flips `published=true` when `scheduled_for <= now()`. (Or compute "is live" at query time — simpler, no cron needed for MVP. Use query-time filter: `published=true AND (scheduled_for IS NULL OR scheduled_for <= now())`.)

## Phase 3 — Pages

### Today's Devotional (`/devotional`)
- Improve typography: max-w-prose, larger leading, blockquote styling for scripture, faith-declaration card.
- Add **Share button** (Web Share API with clipboard fallback).
- Graceful empty state with link to archive.

### Archive (`/archive` — new route, or repurpose existing archive grid)
- Chronological list, paginated (12/page).
- Card shows: title, date, excerpt, category badge, series (if any).
- Filter chips by category at top.

### Categories (`/categories` and `/categories/:slug` — new)
- Hub page lists 6 founder-defined categories with counts.
- Detail page = filtered archive view.

### Search (`/search` — new + navbar input)
- Input in navbar (desktop) + dedicated page.
- Postgres `ilike` on title/scripture/body OR `tsvector` if available.
- Results: title, date, excerpt, category, highlighted matches.
- Empty/no-results state with suggestions.

### Contact (`/contact`)
- Add **type** select: General / Partnership / Testimony / Prayer Request.
- Persist to `contact_messages.type` (add column).

## Phase 4 — CMS / Admin
- Admin devotional form: add category select, series, excerpt, audio_url, SEO fields, scheduled_for.
- Show "Scheduled" badge for future-dated entries.
- Keep existing prayers/teachings admin tabs untouched.

## Phase 5 — Analytics
- Add lightweight event tracker (`src/lib/analytics.ts`) — wraps `window.plausible` / `gtag` if present, no-ops otherwise.
- Fire: `cta_today_devotional`, `cta_browse_archive`, `cta_explore_categories`, `devotional_open`, `devotional_share`, `search_submit`, `category_open`.

## Phase 6 — Performance / A11y / QA
- Lazy-load non-critical images, add `loading="lazy"` and explicit width/height.
- Preload hero image in `index.html`.
- Audit contrast tokens, add alt text, ensure focus rings on all interactive elements.
- Verify keyboard nav through hero CTAs, navbar, search.

## Out of scope (Phase 2 / future)
- Audio TTS generation pipeline (field exists; player UI deferred unless audio_url set).
- Editor/reviewer workflow (single-admin publishing for now).
- Full-text ranking; `ilike` is acceptable at MVP volume.

## Technical notes
- New routes registered in `src/App.tsx`: `/archive`, `/categories`, `/categories/:slug`, `/search`.
- New components: `CategoriesPreview`, `ShareButton`, `SearchInput`, `CategoryBadge`, `DevotionalCard`.
- DB migration runs first (must be approved before code consuming new columns lands).
- Types regen happens automatically post-migration.

## Suggested build order
1. DB migration (devotionals new columns + contact_messages.type).
2. Admin form updates.
3. Public pages: Archive → Categories → Search → Devotional polish + Share.
4. Homepage messaging + Categories CTA + Testimonies filter.
5. Analytics wrapper + event wiring.
6. Mobile/a11y/perf pass + QA.

This is a large scope (~2–3 build iterations). I'll execute it in the order above, pausing for migration approval and after each major phase so you can sanity-check.
