# Doxazo Expressions — Android Build & Play Store Runbook

The Lovable sandbox cannot run Android Studio, Gradle, or the Android
emulator. Everything below runs **on your local Windows/Mac PC** after you
Export to GitHub and `git pull`. This runbook is optimized for
**emulator-first testing** — you do not need a physical Android phone until
the very end.

App identity (already configured in `capacitor.config.ts`):
- `appId` / package: `com.doxazo.expressions`
- `appName`: `Doxazo Expressions`
- `webDir`: `dist`
- No `server.url` (release-safe: native loads bundled production assets)

---

## 1. One-time local setup

Prerequisites: Node 20+, JDK 17, Android Studio Quail (2026.1.x), Android
SDK Platform 35 (API 35) + build tools, an emulator system image with
**Google Play Services** (needed for FCM push).

```bash
git pull
npm install
npx cap add android            # scaffolds the android/ project (only if missing)
npm run build
npx cap sync android
```

Open the project in Android Studio → **Open** → select the `android/`
folder in the repo. Let Gradle sync finish. First sync can take 5–10 min.

If Gradle sync fails with a JDK error: File → Settings → Build, Execution,
Deployment → Build Tools → Gradle → Gradle JDK → select the bundled JDK 17.

## 2. Every iteration after that

```bash
git pull
npm install
npm run build
npx cap sync android
```

Then in Android Studio press **Run ▶** (emulator target).

## 3. Recommended emulator

- Device: **Pixel 8** (or Pixel 7)
- System image: **Android 14 (API 34) — Google Play** (must say "Google
  Play", not just "Google APIs" — needed for FCM push tokens on emulator)
- RAM: 4 GB, Internal storage: 4 GB
- Graphics: Hardware — GLES 2.0

Cold-boot the emulator once so Google Play Services finishes initializing,
then run the app.

## 4. App configuration (already set)

- Package: `com.doxazo.expressions`
- App name: `Doxazo Expressions` (in `capacitor.config.ts`; Android reads
  it from `android/app/src/main/res/values/strings.xml` after `cap sync`)
- `minSdkVersion` 23, `targetSdkVersion` 35 (Play requires 34+ in 2025+)
- Splash: dark navy `#0f1a2b`, immersive, 1.2s
- Status bar: dark, navy
- Notification small icon: `ic_stat_notify` (drawable), tint `#c9a24b`
- Orientation: default (portrait recommended in `AndroidManifest.xml` if
  you want to lock it — add `android:screenOrientation="portrait"` on the
  `MainActivity` `<activity>` tag)

To lock portrait, edit `android/app/src/main/AndroidManifest.xml` after
`cap add android`:

```xml
<activity
    android:name=".MainActivity"
    android:screenOrientation="portrait"
    ... >
```

## 5. Launcher icon (adaptive)

Place a 1024×1024 PNG at `resources/icon.png` and (optional)
`resources/splash.png`, then:

```bash
npx @capacitor/assets generate --android \
  --iconBackgroundColor '#0f1a2b' \
  --splashBackgroundColor '#0f1a2b'
```

This writes adaptive icons into `android/app/src/main/res/mipmap-*/`.
Rebuild in Android Studio to see the new launcher icon.

## 6. Push notifications on Android (FCM)

The client wiring (`src/lib/native.ts`, `src/lib/nativePush.ts`) and the
server fan-out (`supabase/functions/send-push`) already support Android.
You still need to complete these local steps:

### 6a. Firebase project + google-services.json

1. Firebase Console → **Add project** (or use existing).
2. Add Android app → package name **`com.doxazo.expressions`**.
3. Download **`google-services.json`** → place at
   `android/app/google-services.json`. Do NOT commit if the file contains
   restricted keys; Capacitor loads it at build time.
4. In `android/build.gradle` (project-level), inside `dependencies` of
   the `buildscript` block, add:

   ```gradle
   classpath 'com.google.gms:google-services:4.4.2'
   ```

5. In `android/app/build.gradle`, add at the very bottom:

   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```

6. Sync Gradle.

### 6b. Notification small icon

Android requires a white/transparent monochrome icon. Create a 96×96 PNG
named **`ic_stat_notify.png`** and drop it in
`android/app/src/main/res/drawable/` (also drawable-hdpi/xhdpi/xxhdpi for
crispness). `capacitor.config.ts` already references this icon name.

### 6c. Notification permission (Android 13+)

`@capacitor/push-notifications` requests `POST_NOTIFICATIONS` automatically
when `PushNotifications.requestPermissions()` is called (that's what the
Settings toggle does). No manifest edit needed — the plugin adds it.

### 6d. Server secrets

In Lovable Cloud → Secrets, add (once per project, same secret works for
iOS + Android):

- `FIREBASE_SERVICE_ACCOUNT_JSON` — Firebase Console → Project Settings →
  Service accounts → Generate new private key → paste the entire JSON.

Until this secret is present, `send-push` skips FCM and reports
`skipped: "fcm"` — web push still delivers.

### 6e. Verify end-to-end on the emulator

1. Boot Pixel 8 API 34 (Google Play image).
2. Install + launch the app from Android Studio.
3. Sign in.
4. Settings → Notifications → **Enable notifications** → grant the OS
   prompt. Status should flip to "Notifications enabled".
5. A row appears in `public.device_tokens` with `platform = 'android'`.
6. From `/admin` → **Send test push** → notification arrives on the
   emulator's status bar. Tap it → app opens on the correct route.

**Emulator limitations to be aware of:**
- Only Google Play system images can receive FCM. "Google APIs" images
  cannot.
- Battery-saver / doze behavior is not fully representative — final
  reliability testing (delivery when the app is force-killed, doze mode)
  should be done on a real device before Play launch.

## 7. Offline + settings parity

The web offline cache and the platform-aware Settings UI already work on
Android. The Settings status text now reads "Android Settings → Apps →
Doxazo Expressions → Notifications" when running on Android, and the
push-registration error copy mentions `google-services.json` when FCM is
misconfigured — no extra work needed.

## 8. Debug build (APK) for local testing

Android Studio → Build → Build Bundle(s)/APK(s) → **Build APK(s)**.
Output: `android/app/build/outputs/apk/debug/app-debug.apk`.
Drag onto the emulator window to install, or `adb install` it.

## 9. Release build (AAB) for Google Play

### 9a. Create a keystore (one-time)

```bash
keytool -genkey -v -keystore doxazo-release.keystore \
  -alias doxazo -keyalg RSA -keysize 2048 -validity 10000
```

**Back up the keystore + passwords in a password manager.** Losing them
locks you out of Play updates forever.

### 9b. Configure signing

Create `android/keystore.properties` (do NOT commit):

```
storeFile=/absolute/path/to/doxazo-release.keystore
storePassword=...
keyAlias=doxazo
keyPassword=...
```

In `android/app/build.gradle`, add above `android { ... }`:

```gradle
def keystoreProps = new Properties()
def kpFile = rootProject.file('keystore.properties')
if (kpFile.exists()) keystoreProps.load(new FileInputStream(kpFile))
```

Inside `android { ... }`:

```gradle
signingConfigs {
    release {
        if (keystoreProps['storeFile']) {
            storeFile file(keystoreProps['storeFile'])
            storePassword keystoreProps['storePassword']
            keyAlias keystoreProps['keyAlias']
            keyPassword keystoreProps['keyPassword']
        }
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
    }
}
```

### 9c. Build the AAB

Android Studio → Build → Generate Signed Bundle → **Android App Bundle**
→ pick the keystore → variant `release`. Output:
`android/app/release/app-release.aab`. This is what Google Play wants.

Alternatively: `cd android && ./gradlew bundleRelease`.

### 9d. Version bumps

Before each Play upload, bump in `android/app/build.gradle`:

```gradle
versionCode 2      // integer, +1 every upload
versionName "1.0.1"
```

## 10. Google Play Console readiness

- [ ] Signed AAB uploaded to Internal testing track first
- [ ] Play App Signing enrolled (Play generates + holds the signing key;
  your keystore becomes the "upload key")
- [ ] App title: **Doxazo Expressions** (≤30 chars)
- [ ] Short description (≤80 chars)
- [ ] Full description (≤4000 chars)
- [ ] App icon 512×512 PNG (no alpha)
- [ ] Feature graphic 1024×500
- [ ] Phone screenshots ×4 min (1080×1920 portrait) — capture from the
  emulator with the Camera icon in the emulator toolbar
- [ ] Privacy policy URL: `https://doxazoexpressions.com/privacy`
- [ ] Content rating questionnaire
- [ ] Data safety form: declare that you collect email (auth), push token
  (notification delivery), and no advertising IDs
- [ ] Target API level 34+ (Play requirement 2025) — set in
  `android/app/build.gradle` as `targetSdkVersion 35`
- [ ] Notification permission declared automatically by the push plugin
  (no separate Play declaration needed)
- [ ] Account deletion in-app: already implemented at `/settings/delete-
  account`
- [ ] Test on Internal → Closed → Production tracks

## 11. QA checklist (emulator-first)

| Scenario | Emulator | Real device |
|---|---|---|
| Cold launch → devotional | ✓ | ✓ |
| Splash → app, no white flash | ✓ | ✓ |
| Dark status bar legible | ✓ | ✓ |
| Portrait, no clipping on gesture bar | ✓ | ✓ |
| Read/archive/categories/favorites | ✓ | ✓ |
| Offline cached devotional loads | ✓ | ✓ |
| Share sheet | ✓ | ✓ |
| Notification permission prompt (Android 13+) | ✓ | ✓ |
| Test push received (app foreground) | ✓ (Play image) | ✓ |
| Test push received (app background) | ✓ (Play image) | ✓ |
| Test push received (app force-killed) | ⚠ unreliable | ✓ required |
| Tap notification → deep link route | ✓ | ✓ |
| Doze mode delivery latency | ✗ | ✓ required |
| Adaptive launcher icon on home screen | ✓ | ✓ |

## 12. Summary — what you must supply

1. `google-services.json` from Firebase (Android app, package
   `com.doxazo.expressions`) → `android/app/google-services.json`
2. `FIREBASE_SERVICE_ACCOUNT_JSON` secret in Lovable Cloud (also powers
   iOS)
3. 1024×1024 launcher icon at `resources/icon.png` (source art)
4. 96×96 monochrome `ic_stat_notify.png` in
   `android/app/src/main/res/drawable/`
5. Release keystore + passwords (kept in your password manager)
6. Play Console listing assets: icon 512, feature 1024×500,
   4 screenshots

## 13. Still requires a physical Android device

- Final push delivery reliability when the app is force-killed
- Doze/battery-saver behavior
- Real-network Wi-Fi ↔ cellular handover
- Final Play "Internal testing" install validation before Production

Everything else — build, sign, notifications happy-path, deep links,
offline cache, UI QA — is fully covered by the Pixel 8 API 34 (Google
Play) emulator.
