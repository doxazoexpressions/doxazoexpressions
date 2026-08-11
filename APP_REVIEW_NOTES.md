# Doxazo Expressions — App Review Notes (copy/paste ready)

---

## 1. "App Review Information → Notes" (paste this)

Doxazo Expressions is a daily Christian devotional and personal spiritual-journaling app.

NO SIGN-IN REQUIRED to review the app. All reading, plans, journaling, highlights,
audio narration, goals and offline downloads work without an account. Sign-in
(Apple / Google / email) is optional and only syncs a user's own saved content.

Demo account (optional, only if you want to test sync):
  Email: review@doxazoexpressions.com
  Password: DoxazoReview2026!

Where to find the differentiated functionality (Guideline 4.2):
1. Today tab — daily devotional with multi-voice audio narration, background
   music bed, lock-screen / Control Center playback controls, adjustable Bible
   translation (KJV / WEB / ASV), highlightable verses, share and image export.
2. Plans tab — multi-day reading plans with per-day progress state that persists
   across launches and syncs when signed in.
3. Journal tab — private text AND voice journaling. Tap the microphone to record
   an audio reflection (this is why the app requests microphone access); entries
   are saved locally and, when signed in, to the user's private account only.
4. More → Highlights, Goals & Streaks, Scripture lookup/search, Favorites,
   Offline downloads, Groups.
5. More → Settings — notification preferences, translation preference, and
   "Delete my account".

Microphone usage: only used for user-initiated voice journal recordings. No
background or passive recording.

Account deletion (Guideline 5.1.1(v)): Settings → Delete my account. This runs a
server-side deletion of the auth user and all related rows (journal entries,
audio journal files, highlights, favorites, plan progress, device tokens), and
also calls Apple's token revocation endpoint for Sign in with Apple users.

Privacy: PrivacyInfo.xcprivacy is included. No tracking, no third-party ad SDKs,
no data sold or shared. Analytics are first-party product analytics only.

Content: all devotional writing is original content authored by us. We hold the
rights to all text, artwork, and the audio narration/music used in the app.

Support URL: https://www.doxazoexpressions.com/support
Privacy Policy: https://www.doxazoexpressions.com/privacy

---

## 2. "What's New in This Version" (release notes, public)

This build significantly deepens the app beyond daily reading:

• Voice + text journaling — record spoken reflections, saved privately
• Reading plans with saved day-by-day progress
• Verse highlighting and a personal Highlights library
• Audio narration with background playback and lock-screen controls
• Choose your Bible translation (KJV, WEB, ASV)
• Goals and reading streaks
• Scripture lookup and full-text search across all devotionals
• Offline downloads
• Delete-account support in Settings
• Reliability fixes to sign-in, search, and layout on iPhone

---

## 3. Resolved-rejection summary (optional, add under Notes if resubmitting)

Since the previous submission we addressed:
- 4.2 Minimum Functionality — added journaling (text + audio), verse
  highlighting, reading plans with persistent progress, goals/streaks,
  scripture search, offline reading, widget, and Siri shortcuts. The app is no
  longer a reading-only experience.
- 5.1.1(v) — in-app account deletion with server-side data removal and Apple
  token revocation.
- 5.1 — added PrivacyInfo.xcprivacy with required API usage reasons.
- 2.1(a) — /support and OAuth callback routes now resolve correctly.

---

## 4. Screenshots — do you need new ones?

YES, replace them. The current screenshots predate the new features and Apple
judges 4.2 partly from screenshots. Provide 6 for iPhone 6.7" (1290×2796):

1. Today's devotional (serif reading view, audio player visible)
2. Audio playing with lock-screen controls visible
3. Plans — a plan with days completed (progress visible)
4. Journal — list with one voice entry and one text entry
5. Highlights — 3-4 saved verses
6. Goals / streak screen

Rules: portrait, dark mode, real content (no lorem), no device frame required,
no "coming soon" states. Keep the same app icon (1024×1024, no alpha).
App icon and splash do NOT need changing.
