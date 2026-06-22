
# Doxazo Expressions — Phase 2 Build Plan

This is a very large scope (admin CMS + app-readiness + Capacitor prep). I'll build it in sequenced milestones across multiple turns rather than one giant commit, so each piece is verifiable and reviewable. Below is the full plan and the order I'll execute. Please approve and I'll start with Milestone 1.

## Milestone 1 — Admin Content Pipeline (Priority 1, unblocks content ops)

**Goal:** You can log in, see a real dashboard, and create / schedule / publish / bulk-import a full year of devotionals without developer help.

1. **Schema additions** (migration):
   - Add `status` enum (`draft` | `scheduled` | `published`), `publish_at` timestamptz, `slug`, `excerpt`, `seo_title`, `seo_description`, `prayer_section`, `decree_and_declare`, `inspiration_caption` to `devotionals` (only those not already present — I'll diff first).
   - Unique constraint on `devotional_date` to prevent duplicate-date conflicts.
   - RLS: keep current public-read for published; admin-only write (already scoped to `authenticated` from previous migration).
   - Update the "public visibility" policy to: `status = 'published' AND publish_at <= now()`.

2. **Admin dashboard** (`/admin`):
   - Big "Create New Devotional" button.
   - Summary cards: total / drafts / scheduled / published.
   - Tabs: All / Drafts / Scheduled / Published.
   - Filters: category, month; search by title / scripture.

3. **Devotional editor** (`/admin/devotionals/new` and `/admin/devotionals/:id/edit`):
   - All fields from spec, with validation (zod).
   - Actions: Save Draft, Schedule (date picker), Publish Now, Update, Delete, Preview.
   - Autosave drafts, unsaved-changes warning, duplicate-date warning, toasts.

4. **Bulk import** (`/admin/devotionals/import`):
   - CSV + JSON upload, row-level validation, summary report (success / failure / reasons), dry-run preview.

5. **Front-end publish logic update**:
   - `/devotional` query becomes `status='published' AND publish_at <= now()` ordered by `publish_at desc`.
   - Archive same filter.

## Milestone 2 — App-Worthy Features (Priority 2)

1. **Favorites**: `favorites` table (user-scoped via RLS) + localStorage fallback for anon. Bookmark icon on devotional cards / detail. `/favorites` page.
2. **Native share**: Web Share API with title + scripture + excerpt + canonical URL; copy-link fallback.
3. **Offline reading**: cache last 7 devotionals in IndexedDB (via `idb-keyval`); offline banner; show cached content when fetch fails.
4. **Loading / empty / offline / retry / error states**: skeletons + standardized state components reused across Devotional, Archive, Search, Favorites, Contact.
5. **Deep linking**: already mostly correct; verify `/devotional`, `/devotional/:id`, legacy `?id=` redirect, archive routes.
6. **Push notifications**: requires a provider decision — see Questions below. I'll scaffold the permission UI + `notification_settings` table + device-token table + edge function to send on publish, but the actual transport (Web Push VAPID vs Firebase Cloud Messaging vs OneSignal) depends on your answer.

## Milestone 3 — App Shell Polish (Priority 3)

1. **Dark mode default**: flip `ThemeToggle` initial state to dark, persist in localStorage, respect saved preference.
2. **Safe areas**: add `env(safe-area-inset-*)` padding to Navbar / Footer / page containers; viewport-fit=cover in `index.html`.
3. **App icon + splash + status bar**: generate icon set (1024 master + PWA sizes), splash image, `theme-color` meta, `apple-touch-icon`, manifest.webmanifest with dark theme.
4. **Privacy / Terms / Delete Account** pages: `/privacy`, `/terms`, and an in-app account deletion flow on the profile page (calls an edge function that uses service role to delete the user).
5. **Capacitor prep doc**: README section with the exact `npx cap` steps (no Capacitor install yet — kept as web-first until you confirm you want to wrap).

## Technical Details (for the technical reader)

- **Stack stays:** React 18 + Vite + Tailwind + shadcn + Lovable Cloud (Supabase). No framework swap.
- **No service worker for offline yet** — using IndexedDB cache is enough for "read last N devotionals offline" and avoids the PWA stale-cache risks in Lovable preview. If you later want true offline-app behavior I'll follow the PWA skill.
- **Push notifications**: I recommend **Web Push (VAPID)** for the web app + later FCM when wrapped in Capacitor. Needs one secret (VAPID private key) which I'll generate via `generate_secret`.
- **Admin role:** already uses `user_roles` + `has_role()` — I'll verify the production admin user has a row in `user_roles` and surface a clear "you are not an admin" message if not, instead of a blank page.
- **Bulk import format:** CSV with columns matching the schema; JSON as an array of the same shape. I'll include a downloadable template.

## Questions Before I Start

1. **Push notification provider** — Web Push (VAPID, free, works in browsers + Android Capacitor) **or** OneSignal (easier, free tier, requires account + API key) **or** defer push to a later phase and ship everything else now?
2. **Account model for favorites** — require login to save favorites, or anonymous-friendly with localStorage fallback (recommended)?
3. **Year-of-devotionals file** — do you already have the CSV/JSON ready, or should the import tool just be built and you'll load content later?
4. **Capacitor wrapping now or later?** — I'll prep the codebase regardless; question is whether to also add the Capacitor config + icons/splash this phase or wait until you're ready to build the native binary.

## Execution Order Across Turns

Because this is ~15+ files per milestone, I'll do one milestone per turn:

- **Turn A (next):** Milestone 1 schema migration → wait for approval → build admin UI files.
- **Turn B:** Milestone 2 features.
- **Turn C:** Milestone 3 polish + Capacitor doc.

Reply with answers to the 4 questions (or just "go with your recommendations") and I'll start Milestone 1 immediately.
