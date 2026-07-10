# Doxazo Expressions — App Review Recovery (iOS Resubmission)

This document captures every change made to address the App Store rejection
covering **Guideline 2.3.8 (Accurate Metadata / App Icon)** and
**Guideline 4.2 (Minimum Functionality)**. Use the "Reviewer notes" section
verbatim in App Store Connect on resubmission.

---

## 1. Icon (Guideline 2.3.8) — DONE

- Replaced `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`
  with a finalized production icon (open book with radiant light on deep navy,
  premium quality render).
- Regenerated PWA / web / Android icons from the same master so the brand mark
  is consistent everywhere:
  - `public/app-icon-192.png`, `public/app-icon-512.png`, `public/apple-touch-icon.png`
  - `android/app/src/main/res/mipmap-*/ic_launcher(.round)?.png`
  - `android/app/src/main/res/mipmap-*/ic_launcher_foreground.png` (adaptive)
- App Store Connect: upload the same 1024×1024 marketing icon (same file used
  in the asset catalog). No placeholder assets remain in the iOS bundle.

## 2. Minimum Functionality (Guideline 4.2) — DONE

The native shell no longer renders the marketing website. When Doxazo is
launched inside the iOS/Android app, the user sees a purpose-built devotional
companion:

- **First-run onboarding** (`src/components/NativeOnboarding.tsx`) — 4 slides
  that explain the daily rhythm, saving/continuity, and offer a notification
  opt-in tied specifically to the devotional habit (not marketing).
- **Native home dashboard** (`src/components/NativeHome.tsx`) — mobile-first
  surface with:
  - **Today's Word** hero card (date, title, scripture, excerpt, deep-link into today)
  - **Continue reading** card driven by on-device reading history
  - Quick tiles for **Saved**, **Archive**, **Themes**, **Rhythm** (settings)
  - Horizontal **Recently read** rail (device-local history)
  - **Themes for this season** chip row
  - **Latest devotionals** list
  - Offline banner when the device is offline
- **Reading continuity** (`src/lib/readingHistory.ts`) — every devotional read
  is stored on-device so "Continue reading" and "Recently read" survive
  restarts and offline sessions.
- **Offline reading** already caches today's + recent devotionals in
  `src/lib/offlineCache.ts`; native home + article both read from cache first
  and surface an offline banner. Settings screen exposes cache status.
- **Favorites** already sync locally + to the account when signed in
  (`src/hooks/useFavorites.tsx`); native home surfaces them as a "Your saved"
  strip.
- **Native share** (`src/lib/native.ts` → `shareNative`) uses the iOS share
  sheet from every devotional's `ShareButton`.
- **Push notifications** (`src/lib/nativePush.ts`) — permission prompt lives
  inside the onboarding *and* the Settings screen, framed as a devotional
  habit nudge only.

The marketing website (`Hero`, `DevotionalHighlight`, `CategoriesPreview`,
`AboutPreview`, `Testimonials`, `CTA`) is now only shown to browser visitors;
`src/pages/Index.tsx` branches on `Capacitor.isNativePlatform()`.

## 3. Build impact

- Shared `src/` updates — 100% of the UX work.
- iOS-specific — icon catalog only.
- App Store metadata text — no changes required; reviewer notes updated (below).
- A **new build must be uploaded** so both the icon change and the native-first
  UX ship.

## 4. Resubmission checklist

- [x] Production icon replaces placeholder-looking asset in `AppIcon.appiconset`
- [x] Native-only onboarding implemented and gated to first launch
- [x] Native home dashboard (Today / Continue / Saved / Themes) replaces the
      marketing landing inside the app shell
- [x] Reading continuity persisted on-device
- [x] Favorites, offline cache, native share, notifications all reachable from
      the native home
- [x] Reviewer notes drafted (below)
- [ ] `npm run build && npx cap sync ios`
- [ ] Archive in Xcode with the bumped build number, upload to TestFlight
- [ ] Verify the new icon appears in TestFlight and on the home screen
- [ ] Submit for review with the notes below

## 5. Reviewer notes (paste into App Store Connect)

> Thank you for the previous review. This build addresses both items:
>
> **App Icon (2.3.8):** The app icon has been fully replaced with our
> finalized production brand mark (open book with radiant light on navy).
> The same 1024×1024 icon is used in the App Store listing and the app bundle.
>
> **Minimum Functionality (4.2):** The app is no longer a web view of the
> website. On launch, users now see a native onboarding flow that explains
> the daily devotional rhythm and (optionally) enables a habit-forming
> morning notification. The home screen inside the app is a purpose-built
> devotional dashboard with:
>
> • Today's Word card (date, scripture, excerpt, one-tap open)
> • Continue Reading card driven by on-device history
> • Saved / Archive / Themes / Rhythm quick tiles
> • Recently Read horizontal rail (device-local, works offline)
> • Themes chips and Latest devotionals list
>
> Native platform value: on-device reading history, offline caching of
> today's + recent devotionals with an offline banner, favorites that sync
> to the user's account, native iOS share sheet integration from every
> devotional, and push notifications scoped only to new devotional
> publications. None of these surfaces exist on the marketing website —
> the website is a separate marketing experience that has been removed
> from the native shell.
>
> Test account (if requested): (add via App Store Connect)
>
> Thank you for taking another look.

---

## 6. Reviewer-facing differentiation summary (bullets)

- Native onboarding flow, not a landing page
- Mobile-first devotional dashboard (Today / Continue / Saved / Themes)
- On-device reading history and continue-reading state
- Offline reading with cached devotionals + offline banner
- Favorites that sync to a signed-in account
- iOS share sheet integration from every devotional
- Push notifications scoped strictly to new devotional publications
- Native status bar / splash / safe-area handling via Capacitor
