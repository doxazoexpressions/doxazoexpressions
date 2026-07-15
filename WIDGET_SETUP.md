# iOS Home Screen Widget — one-time Xcode setup

The widget source lives at `ios/App/TodayWidget/`. Add it as a Widget Extension
target once, then Xcode will build and ship it with every future TestFlight
build automatically.

## 1. Add the Widget Extension target

1. Open `ios/App/App.xcworkspace` in Xcode.
2. **File → New → Target… → Widget Extension**.
3. Product Name: **TodayWidget** — uncheck "Include Configuration Intent",
   uncheck "Include Live Activity". Team: your Apple Dev team.
4. When Xcode asks to activate the new scheme, click **Activate**.

Xcode creates a `TodayWidget/` folder with placeholder Swift files. Replace
them with our checked-in files:

- Delete Xcode's generated `TodayWidget.swift` from the target.
- In the Project navigator, right-click the `TodayWidget` group → **Add Files
  to "App"…** and add `ios/App/TodayWidget/TodayWidget.swift` (uncheck "Copy
  items if needed"; check the **TodayWidget** target only).
- Do the same for `ios/App/TodayWidget/Info.plist` — but instead of adding it,
  point the target's **Info.plist File** build setting at
  `TodayWidget/Info.plist` (or leave Xcode's default and merge the keys).

## 2. Bundle identifier & signing

- Set the widget target's Bundle Identifier to
  `com.doxazo.expressions.TodayWidget`.
- Signing: Automatic, same team as the main app.
- Deployment target: iOS 16.0 or later.

## 3. Build & run

`Product → Scheme → App` (not TodayWidget) → Run on device. Long-press the
Home Screen → **+** → search "Doxazo" → add the small or medium widget.

## 4. What it does

- Fetches `https://fjqrvkxhcydhyvtocoaa.functions.supabase.co/widget-today`
  once per hour.
- Tapping the widget opens `doxazo://devotional/<slug>`, which is handled
  in `src/lib/native.ts` and routed to the DailyDevotional page.

No further work is needed for App Store submission — the widget ships inside
the main `.ipa`.
