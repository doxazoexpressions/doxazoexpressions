# Analytics & Crash Monitoring

Doxazo Expressions ships analytics on two channels:

- **Web** — Google Analytics 4 (`gtag.js`), loaded only when `VITE_GA4_MEASUREMENT_ID` is set.
- **iOS** — Firebase Analytics + Firebase Crashlytics via the official Capacitor plugins.

Both channels go through a single wrapper: `src/lib/analytics.ts` (`track`, `trackPageView`, `setAnalyticsUser`, `reportError`).

---

## Audit findings (before this change)

| Item | Status |
| --- | --- |
| GA4 installed | ❌ Not installed. `src/lib/analytics.ts` only forwarded to `window.gtag` if present. |
| Duplicate pageviews | ❌ N/A (no GA loaded). Now prevented by `send_page_view: false` + manual SPA tracking. |
| SPA route changes tracked | ❌ Missing. Added via `<RouteAnalytics />`. |
| Firebase Analytics on iOS | ❌ Not installed. |
| Crashlytics on iOS | ❌ Not installed. |
| Existing events available | Only 8 legacy names (`cta_*`, `devotional_open`, `search_submit`, `contact_submit`, `category_open`, `devotional_share`). |
| Risks | None from this change: providers auto-noop when SDKs are absent, so the current app stability is unaffected. |

---

## Changelog

- `src/lib/analytics.ts` — unified GA4 + Firebase Analytics wrapper. Adds `trackPageView`, `setAnalyticsUser`, `reportError`. Auto-loads GA4 only when `VITE_GA4_MEASUREMENT_ID` is set. Expanded event union.
- `src/components/RouteAnalytics.tsx` — fires `page_view` on every React Router navigation (single-fire, deduped). Also emits `app_open` once per session.
- `src/App.tsx` — mounts `<RouteAnalytics />` inside `<BrowserRouter>`.
- `ios/App/App/AppDelegate.swift` — calls `FirebaseApp.configure()` at launch, guarded with `#if canImport(FirebaseCore)` so builds without the plist still compile.
- `package.json` — adds `@capacitor-firebase/analytics` and `@capacitor-firebase/crashlytics`.

No UI, branding, or business-logic changes.

---

## Manual setup required

### 1. GA4 (web)
1. Create a GA4 property in the Google Analytics dashboard.
2. Copy the Measurement ID (`G-XXXXXXXX`).
3. Add it as a **build-time env var** to the project: set `VITE_GA4_MEASUREMENT_ID=G-XXXXXXXX` in your Lovable environment (or `.env` locally).
4. Redeploy. GA4 script is injected automatically at runtime; without the var, nothing is loaded.

### 2. Firebase Analytics + Crashlytics (iOS)
1. In Firebase Console, create an iOS app with bundle ID `app.lovable.7c926cd50e074118871e5ab8fb64751c` (or your production bundle ID).
2. Download `GoogleService-Info.plist` and drop it into `ios/App/App/` in Xcode (make sure it's added to the App target).
3. Run:
   ```
   npx cap sync ios
   ```
   This registers `@capacitor-firebase/analytics` and `@capacitor-firebase/crashlytics` with the iOS SPM package manifest and pulls in `FirebaseCore`, `FirebaseAnalytics`, and `FirebaseCrashlytics`.
4. In the Xcode target's **Build Phases**, add a new **Run Script** for Crashlytics symbol upload:
   ```
   "${BUILD_DIR%/Build/*}/SourcePackages/checkouts/firebase-ios-sdk/Crashlytics/run"
   ```
   with input file `$(SRCROOT)/$(BUILT_PRODUCTS_DIR)/$(INFOPLIST_PATH)`.
5. Archive & upload a TestFlight build; verify:
   - Analytics: Firebase DebugView shows `app_open` + `page_view`.
   - Crashlytics: force a test crash once with `FirebaseCrashlytics.crash()` from JS, confirm it appears in the console.

Until the plist is added, both plugins silently no-op — the app runs normally.

### 3. Web crash monitoring
**Not added.** The user asked for it only if lightweight. Adding Sentry / Bugsnag adds 40–70 KB and a persistent network channel; we skipped it to keep the site fast. Crashlytics still covers the iOS surface, which is the priority for App Store submission. Revisit if/when a real signal gap appears in production.

---

## Event tracking plan

| Event | Platform | Trigger | Parameters | Business purpose |
| --- | --- | --- | --- | --- |
| `page_view` | Web + iOS | React Router change | `page_path`, `page_title`, `page_location` | Traffic, session flow |
| `app_open` | Web + iOS | First mount per session | `source` | DAU / MAU |
| `onboarding_started` | iOS | Splash → onboarding | — | Onboarding funnel |
| `onboarding_completed` | iOS | Final onboarding step | — | Activation |
| `devotional_opened` | Web + iOS | Open devotional page | `id`, `slug`, `category`, `series`, `from` | Content engagement |
| `devotional_completed` | iOS | Scroll depth ≥ 90% or CTA click | `id`, `category` | Read-through rate |
| `devotional_share` | Web + iOS | Share button | `id`, `channel` | Virality |
| `archive_opened` | Web + iOS | `/archive` visit | — | Archive usage |
| `theme_browse_opened` | Web + iOS | `/categories` visit | — | Discovery |
| `category_open` | Web + iOS | Category card click | `slug` | Category demand |
| `audio_started` | Web + iOS | Play tapped | `id`, `narrator` | Audio adoption |
| `audio_paused` | Web + iOS | Pause tapped | `id`, `position_s` | Drop-off |
| `audio_completed` | Web + iOS | Track ends | `id`, `narrator` | Retention |
| `sleep_timer_used` | iOS | Sleep timer set | `duration_min` | Bedtime usage |
| `sign_in_started` | Web + iOS | Auth page submit | `method` | Signup funnel |
| `sign_in_completed` | Web + iOS | Session hydrated | `method` | Conversion |
| `journal_cta_clicked` | Web + iOS | Journal CTA on devotional | `id` | Feature discovery |
| `journal_entry_created` | Web + iOS | Save new journal | `devotional_id` | Deep engagement |
| `journal_entry_updated` | Web + iOS | Edit journal | `devotional_id` | Repeat engagement |
| `highlight_created` | Web + iOS | Save verse highlight | `devotional_id`, `reference` | Study behavior |
| `plan_opened` | Web + iOS | Plan detail visit | `plan_slug` | Plan interest |
| `plan_started` | Web + iOS | Start plan | `plan_slug` | Commitment |
| `plan_completed` | Web + iOS | Finish plan | `plan_slug`, `days` | Retention |
| `streak_viewed` | iOS | Streak card impression | `days` | Habit signal |
| `goals_opened` | Web + iOS | `/goals` visit | — | Goal feature usage |
| `scripture_search_used` | Web + iOS | Scripture lookup | `query_len` | Bible engagement |
| `search_submit` | Web + iOS | Search page submit | `query_len` | Search demand |
| `group_opened` | Web + iOS | Group page visit | `group_id` | Community usage |
| `group_joined` | Web + iOS | Join via code | `group_id` | Community growth |
| `notification_enabled` | iOS | Push permission granted | — | Retention channel |
| `widget_opened` | iOS | Widget deep-link open | `variant` | Widget value |
| `shortcut_used` | iOS | Siri Shortcut fired | `name` | Shortcut adoption |
| `outbound_click` | Web | External link click | `href` | Referral tracking |
| `scroll_depth` | Web | 25/50/75/100 % on devotional | `id`, `percent` | Content depth |

Call sites already exist for the legacy names (`cta_*`, `devotional_open`, `devotional_share`, `search_submit`, `category_open`, `contact_submit`); those keep working and were added to the union so TypeScript still compiles. New events above can be wired incrementally — nothing breaks if they're not all firing on day one.

---

## Still pending

- Wiring the new event names into existing call sites (audio player, plans, journal, groups, onboarding, widget/shortcut deep links). The plumbing is ready; each surface just needs a `track("event_name", { ... })` call. Do this in follow-up passes so we don't touch UI in this stabilization change.
- `GoogleService-Info.plist` from the Firebase console (manual, see above).
- Optional: outbound-click + scroll-depth listeners — small additions we can drop into `RouteAnalytics.tsx` when needed.
