# Doxazo Expressions — Native Build & Store Submission Runbook (Phase 4)

The Lovable sandbox cannot run Xcode, Android Studio, or sign/upload store builds.
Everything below runs **on your local machine** after you Export to GitHub and `git pull`.

---

## 1. One-time local setup

```bash
git pull
npm install
npx cap add ios
npx cap add android
```

App identity is already configured in `capacitor.config.ts`:
- `appId`: `app.lovable.7c926cd50e074118871e5ab8fb64751c`
- `appName`: `Doxazo Expressions`
- `webDir`: `dist`
- Live-reload `server.url` points at the Lovable preview (remove before release builds — see §5).

## 2. Iterating

After every `git pull`:

```bash
npm install
npm run build
npx cap sync
```

Run on device/emulator:

```bash
npx cap run ios       # macOS + Xcode required
npx cap run android   # Android Studio required
```

## 3. Native plugins already wired

- `@capacitor/app` — deep links (`appUrlOpen` → React Router navigate)
- `@capacitor/splash-screen` — dark splash, hidden after boot
- `@capacitor/status-bar` — dark style, navy background
- `@capacitor/share` — native share sheet (fallback to Web Share on web)
- `@capacitor/push-notifications` — requests permission, registers for APNs/FCM

Bridge entry point: `src/lib/native.ts` → call `initNative(navigate)` from a top-level effect when you wire it into `App.tsx` (kept out of the web bundle path by dynamic imports).

## 4. App icons & splash

Place source artwork (1024×1024 PNG) at `resources/icon.png` and `resources/splash.png` locally, then:

```bash
npx @capacitor/assets generate --iconBackgroundColor '#0f1a2b' --splashBackgroundColor '#0f1a2b'
```

This populates `ios/App/App/Assets.xcassets` and `android/app/src/main/res/`.

## 5. Release builds

**Before building for release**, edit `capacitor.config.ts` and remove the `server` block (it's only for live-reload during dev). Re-run `npx cap sync`.

### Android (AAB)

1. In Android Studio: Build → Generate Signed Bundle → Android App Bundle
2. Create/upload a keystore (store it safely — losing it locks you out of Play updates)
3. Build variant: `release`
4. Output: `android/app/release/app-release.aab`

### iOS (IPA)

1. Open `ios/App/App.xcworkspace` in Xcode
2. Signing & Capabilities → select your Apple Developer team
3. Add capability: **Push Notifications**, **Background Modes → Remote notifications**
4. Product → Archive → Distribute App → App Store Connect → Upload
5. Must build with iOS 26 SDK (Xcode 26+) per Apple's April 28, 2026 requirement.

## 6. Native push delivery (FCM + APNs)

Web push (VAPID) is live and verified. For store apps, native delivery requires:

**Android (FCM):**
- Create Firebase project, add Android app with package `app.lovable.7c926cd50e074118871e5ab8fb64751c`
- Download `google-services.json` → place at `android/app/google-services.json`
- Add Google Services Gradle plugin (Capacitor docs)

**iOS (APNs):**
- Apple Developer → Keys → create APNs Auth Key (.p8)
- Upload .p8 to Firebase (if using FCM for both) OR call APNs directly

**Server side (next code task, not done in this phase):** create an edge function `register-device-token` that stores `{ user_id, platform, token }` in a new `device_tokens` table, then extend `send-push` to fan out to FCM/APNs in addition to VAPID. Say the word and I'll build it.

## 7. Deep linking

- Custom scheme `doxazo://devotional/<id>` works out of the box via `appUrlOpen`.
- Universal Links (iOS) / App Links (Android) to `doxazoexpressions.com/devotional/*` require:
  - iOS: `apple-app-site-association` file hosted at `https://doxazoexpressions.com/.well-known/apple-app-site-association`
  - Android: `assetlinks.json` at `https://doxazoexpressions.com/.well-known/assetlinks.json`
- Both need the app's team ID / SHA-256 cert fingerprint, generated after first signed build.

## 8. QA matrix (run before submission)

| Scenario | iOS | Android |
|---|---|---|
| Cold launch lands on /devotional | | |
| Splash → app, no white flash | | |
| Status bar legible in dark | | |
| Safe-area: no clipping on notch / gesture bar | | |
| Read latest, archive, categories | | |
| Favorite + unfavorite persists | | |
| Share opens native sheet | | |
| Offline cached devotional loads | | |
| Notification permission prompt | | |
| Test push delivered + tap opens correct screen | | |
| Auth login (if used) | | |
| Privacy + Terms pages reachable from Footer | | |

## 9. Store submission checklist

### Google Play
- [ ] Signed AAB
- [ ] App title: **Doxazo Expressions**
- [ ] Short description (≤80 chars)
- [ ] Full description (≤4000 chars)
- [ ] App icon 512×512
- [ ] Feature graphic 1024×500
- [ ] Phone screenshots ×4 minimum (1080×1920 portrait)
- [ ] Privacy policy URL: `https://doxazoexpressions.com/privacy`
- [ ] Content rating questionnaire
- [ ] Data safety form
- [ ] Internal testing track → Closed → Production

### Apple App Store
- [ ] App Store Connect record (bundle ID matches `capacitor.config.ts`)
- [ ] App name + subtitle (30 chars)
- [ ] Description, keywords (100 chars)
- [ ] App icon 1024×1024 (no alpha)
- [ ] iPhone screenshots: 6.7" (1290×2796) and 6.5" (1284×2778) — 3 minimum
- [ ] Support URL + Privacy URL
- [ ] App Privacy "nutrition label" answers
- [ ] Demo account credentials in reviewer notes if `/admin` or any auth flow is gated
- [ ] Account deletion path in-app (required if you offer account creation)
- [ ] TestFlight build verified
- [ ] Build with Xcode 26 / iOS 26 SDK

## 10. What's done in this commit

- Capacitor + iOS + Android + 5 plugins installed
- `capacitor.config.ts` with app ID, name, dark splash/status bar, live-reload URL
- `src/lib/native.ts` bridge: status bar, splash hide, deep-link routing, push registration + tap-to-route, native share
- This runbook

## 11. What still needs your hands

- Run `npx cap add ios && npx cap add android` locally (sandbox can't create native projects)
- Generate icons/splash from your 1024² source art with `@capacitor/assets`
- Wire FCM (`google-services.json`) + APNs key
- Build signed AAB + archive IPA
- Fill store listings and upload
