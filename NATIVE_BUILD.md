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
- `appId`: `com.doxazo.expressions`
- `appName`: `Doxazo Expressions`
- `webDir`: `dist`
- No live-reload `server.url` is present for release/TestFlight builds; native loads bundled production assets.

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

`capacitor.config.ts` is already release-safe: it has no `server.url` block. Re-run `npx cap sync` after every pull/build.

### Android (AAB)

1. In Android Studio: Build → Generate Signed Bundle → Android App Bundle
2. Create/upload a keystore (store it safely — losing it locks you out of Play updates)
3. Build variant: `release`
4. Output: `android/app/release/app-release.aab`

### iOS (IPA)

1. Open `ios/App/App.xcworkspace` in Xcode
2. Signing & Capabilities → select your Apple Developer team
3. Confirm capability: **Push Notifications**, **Background Modes → Remote notifications**
4. Product → Archive → Distribute App → App Store Connect → Upload
5. Must build with iOS 26 SDK (Xcode 26+) per Apple's April 28, 2026 requirement.

## 6. Native push delivery (FCM + APNs) — server side is LIVE

Web push (VAPID) and native fan-out are both wired server-side. The flow:

1. App registers via `@capacitor/push-notifications` → `registration` event fires.
2. `src/lib/native.ts` POSTs `{ token, platform, device_info }` to the `register-device-token` edge function.
3. The function upserts into `public.device_tokens` keyed by `token`.
4. The `send-push` edge function reads `push_subscriptions` (web), and `device_tokens` (android/ios), then fans out to **VAPID + FCM HTTP v1 + APNs HTTP/2** in a single call. Invalid tokens (FCM 400/404, APNs 410) are auto-pruned.

Required secrets (add in Lovable Cloud → Secrets):

| Secret | Where to get it |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase Console → Project Settings → Service accounts → Generate new private key. Paste the **entire JSON file** as the secret value. |
| `APNS_KEY_P8` | Apple Developer → Keys → "+" → enable APNs → download the `.p8`. Paste the file contents (including `-----BEGIN PRIVATE KEY-----` lines). |
| `APNS_KEY_ID` | 10-char Key ID shown alongside the .p8 in Apple Developer. |
| `APNS_TEAM_ID` | Apple Developer → Membership → Team ID (10 chars). |
| `APNS_BUNDLE_ID` | Bundle ID of the iOS app: `com.doxazo.expressions`. |
| `APNS_PRODUCTION` | `"false"` for TestFlight/dev, `"true"` for App Store release. |

Until each set is configured, `send-push` skips that channel cleanly and reports `skipped: "..."` in the response — web push keeps working.

**Native project wiring (one-time, local):**

- **Android (FCM):**
  - Firebase Console → add Android app with package `app.lovable.7c926cd50e074118871e5ab8fb64751c`.
  - Download `google-services.json` → `android/app/google-services.json`.
  - In `android/build.gradle` add `classpath 'com.google.gms:google-services:4.4.2'` to dependencies.
  - In `android/app/build.gradle` add `apply plugin: 'com.google.gms.google-services'` at the bottom.
- **iOS (APNs):**
  - `ios/App/App/App.entitlements` includes `aps-environment` (`development` for Debug, `production` for Release/TestFlight).
  - `ios/App/App/Info.plist` includes `UIBackgroundModes → remote-notification`.
  - The App Store provisioning profile must be regenerated after Push Notifications are enabled, so the signed IPA contains `aps-environment=production`.
  - No client SDK needed — we call APNs directly from the edge function with the .p8 key.

**Verify end-to-end:** sign in on the device → grant notification prompt → `device_tokens` row appears → hit "Send test push" in `/admin` → notification arrives → tap routes via `path` payload.

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
- `capacitor.config.ts` with app ID, name, dark splash/status bar, and bundled production assets
- `src/lib/native.ts` bridge: status bar, splash hide, deep-link routing, push registration + token upload + tap-to-route, native share
- `device_tokens` table with RLS (users manage their own; service role full access)
- `register-device-token` edge function — auth-gated, upserts by token
- `send-push` edge function — admin-gated, fans out web push (VAPID) + Android (FCM HTTP v1) + iOS (APNs HTTP/2) and prunes dead tokens
- This runbook

## 11. What still needs your hands

- Run `npx cap add ios && npx cap add android` locally (sandbox can't create native projects)
- Generate icons/splash from your 1024² source art with `@capacitor/assets`
- Add FCM secrets + `google-services.json`; add APNs secrets and use a push-capable App Store provisioning profile (see §6)
- Build signed AAB + archive IPA
- Fill store listings and upload
