# Siri Shortcuts Setup (iOS 16+)

The file `ios/App/App/DoxazoShortcuts.swift` exposes three App Intents:

- **Today's Word** — opens the daily devotional
- **Prayer List** — opens the private prayer list
- **Scripture** — opens the Scripture lookup tool

## One-time Xcode steps

1. Run `npx cap sync ios`.
2. Open `ios/App/App.xcworkspace` in Xcode.
3. Right-click the `App` group → **Add Files to "App"…** → select
   `ios/App/App/DoxazoShortcuts.swift`. Ensure the **App** target is checked.
4. Confirm the deployment target is iOS 16 or later
   (`App` target → General → Minimum Deployments).
5. Build & run on a device. The shortcuts appear automatically in the
   Shortcuts app and are voice-invokable via Siri:

   - "Hey Siri, Today's Word"
   - "Hey Siri, open my prayer list"
   - "Hey Siri, look up scripture"

## Deep-link routes

The intents use the `doxazo://` custom scheme already handled by
`AppDelegate.swift` / `initNative` in `src/lib/native.ts`. Routes used:

- `doxazo://devotional`
- `doxazo://prayers`
- `doxazo://scripture`
