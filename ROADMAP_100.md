# Doxazo Expressions — 88 → 100 Completion Roadmap

Live status board for the remaining native-store work. Updated this turn.

---

## ✅ Done (already shipped)

- Capacitor core + iOS + Android platforms + 5 plugins installed
- `capacitor.config.ts` — app ID `com.doxazo.expressions`, dark splash, dark status bar, live-reload
- `src/lib/native.ts` — status bar, splash hide, deep-link routing, push registration, token upload, tap-to-route, native share
- `device_tokens` table + RLS
- `push_subscriptions` table + RLS (anonymous update vector closed)
- `register-device-token` edge function — auth-gated, upserts by token, deployed
- `send-push` edge function — admin-gated; **Web Push (VAPID) + Android (FCM HTTP v1)** live; **iOS (APNs HTTP/2)** code-complete, waiting on secrets
- Web Push end-to-end verified in `/admin` → "Send test push"
- VAPID public key in `.env`, private key + subject in secrets
- `FIREBASE_SERVICE_ACCOUNT_JSON` secret installed (Android server-side ready)
- Admin grant for `doxazoexpressions@gmail.com` applied
- PWA: manifest, icons (192/512/Apple), theme color, dark splash
- Legal: `/privacy`, `/terms`, linked in footer
- Devotional formatter (`DevotionalBody`) + Social Pack admin tab
- `NATIVE_BUILD.md` (runbook) + `STORE_SUBMISSION.md` (listings + assets) committed

---

## 🟡 In progress (server side is complete; needs your local machine)

| Item | What's done server-side | What you do locally |
|---|---|---|
| Android native build | FCM fan-out + token registration live | `git pull` → `npm i` → `npx cap add android` → drop `google-services.json` into `android/app/` → `npm run build && npx cap sync` → `npx cap run android` |
| Android push verification | `send-push` ready, token endpoint ready | Install on device → grant notification prompt → check `device_tokens` row → hit "Send test push" in `/admin` → confirm receipt → tap → confirm `/devotional` opens |
| iOS native build | Code path ready | After Apple Dev account active: `npx cap add ios` → open `ios/App/App.xcworkspace` → add **Push Notifications** + **Background Modes → Remote notifications** capabilities |

---

## 🔵 Waiting on you (small, isolated actions)

1. **Run the Android verification path above** — this moves Android from "prepared" to "verified." ~15 min.
2. **Complete Apple Developer Program payment** ($99/yr). Unblocks every iOS item below.
3. **Add "Delete account" UI** — Apple requirement (we support account creation). Tell me to build it and I'll ship the page + edge function in one turn; ~5 min of your time afterward to test.
4. **Capture 6 screenshots per the script in `STORE_SUBMISSION.md` §4** — once Android build runs, easiest to capture on device.
5. **Drop 1024² source art** at `resources/icon.png` and `resources/splash.png` locally, then run `npx @capacitor/assets generate ...` (one command, in `NATIVE_BUILD.md` §4).

---

## 🍎 Waiting on Apple (unblocked the moment your Developer account is active)

The five APNs values I need, and exactly where each one is pasted:

| # | Value | Where to find it | Where to paste it |
|---|---|---|---|
| 1 | `APNS_KEY_P8` | Apple Developer → **Keys** → "+" → enable **Apple Push Notifications service (APNs)** → Continue → Register → **Download** the `.p8` (one-time download). Open it in a text editor. | Lovable Cloud → Secrets. Paste the **entire file contents** including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines. |
| 2 | `APNS_KEY_ID` | Same Keys page — the 10-character ID shown next to the key you just made. | Lovable Cloud → Secrets. Plain 10-char string. |
| 3 | `APNS_TEAM_ID` | Apple Developer → **Membership** (top-right account menu) → "Team ID" — 10 chars. | Lovable Cloud → Secrets. Plain 10-char string. |
| 4 | `APNS_BUNDLE_ID` | Apple Developer → **Identifiers** → register an App ID with bundle `com.doxazo.expressions` (enable Push Notifications capability there). | Lovable Cloud → Secrets. Value: `com.doxazo.expressions` |
| 5 | `APNS_PRODUCTION` | N/A (it's a flag you choose). | Lovable Cloud → Secrets. `"false"` for TestFlight / dev builds, `"true"` after App Store release. Start with `"false"`. |

**Verification I will run the moment those five are in:**
1. `supabase--curl_edge_functions` against `/send-push` with `{ test: true }` — confirm response shows `apns: { sent: N, pruned: 0 }` instead of `apns: { skipped: ... }`.
2. Inspect `send-push` edge logs for APNs HTTP/2 200 responses.
3. Hand you the in-app verification script (install on iPhone → notification prompt → `device_tokens` row appears with `platform='ios'` → "Send test push" from `/admin` → notification arrives → tap → `/devotional` opens).

---

## 🧪 Ready for testing (right now, by you)

- **Android end-to-end push** — server side is 100%. Run §2 of `NATIVE_BUILD.md` and §"Android verification path" above.
- **Web Push on any browser** — `/settings` → enable → `/admin` → Send test push.
- **PWA install** — Chrome → Install app, verify icon + dark splash on phone home screen.
- **Deep links** — open `doxazo://devotional/<slug>` on the installed app, confirm it lands on that devotional.

---

## 📦 Ready for store upload (after the local builds run)

### Google Play
- [x] Listing copy drafted (`STORE_SUBMISSION.md` §2)
- [x] Privacy + Terms live
- [x] Data Safety answers prepared
- [ ] Signed AAB (Android Studio → Build → Generate Signed Bundle)
- [ ] Upload to Internal testing track → promote to Closed → Production

### Apple App Store
- [x] Listing copy drafted (`STORE_SUBMISSION.md` §3)
- [x] App Privacy answers prepared
- [ ] Apple Developer account active (in flight)
- [ ] APNs secrets pasted (table above)
- [ ] Bundle ID `com.doxazo.expressions` registered in Apple Developer → Identifiers, with Push enabled
- [ ] App Store Connect record created
- [ ] Account-deletion UI shipped
- [ ] Xcode 26 archive → upload → TestFlight → submit for review

---

## 🛣️ Final path from 88 → 100

| Pts | Item | Owner | Status |
|---:|---|---|---|
| +3 | Android verified on physical device | you (local) | ready to run |
| +1 | Account-deletion UI + edge function | me, on your go-ahead | not started |
| +3 | iOS APNs secrets pasted + server verified | you (5 secrets), me (verify) | waiting on Apple |
| +2 | iOS verified on physical device | you (local, after Apple) | waiting on Apple |
| +2 | Screenshots (6 per platform) captured | you (local) | ready to capture |
| +1 | Signed AAB + IPA uploaded to stores | you (local) | ready after build |
| **+12** | **= 100** | | |

---

## Operating note

Everything that can be done from the Lovable side is done or waiting on a single human input (Apple payment, your local `cap add` run, or one secret paste). The remaining items genuinely require Xcode, Android Studio, signed keystores, or a physical device — none of which exist inside this sandbox. The instant you (a) finish the Android device run, (b) give me the APNs five-pack, or (c) say "ship the account-deletion page," I push the next chunk immediately.
