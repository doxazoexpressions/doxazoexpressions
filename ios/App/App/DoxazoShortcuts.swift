// Siri Shortcuts / App Intents for Doxazo Expressions.
//
// Requires iOS 16+. Register this file with the main App target in Xcode.
// After running `npx cap sync ios`, add this file to the App target and rebuild.
//
// Users can invoke via Siri:
//   "Hey Siri, Today's Word"
//   "Hey Siri, Read my devotional"
//   "Hey Siri, Open Scripture"
//
// This uses the app-scheme deep link that AppDelegate already handles
// (doxazo://) plus a universal-link fallback.

import AppIntents
import UIKit

@available(iOS 16.0, *)
struct OpenTodayDevotionalIntent: AppIntent {
    static var title: LocalizedStringResource = "Today's Devotional"
    static var description = IntentDescription("Open today's word from Doxazo Expressions.")
    static var openAppWhenRun: Bool = true

    @MainActor
    func perform() async throws -> some IntentResult {
        if let url = URL(string: "doxazo://devotional") {
            await UIApplication.shared.open(url)
        }
        return .result()
    }
}

@available(iOS 16.0, *)
struct OpenPrayerListIntent: AppIntent {
    static var title: LocalizedStringResource = "Open Prayer List"
    static var description = IntentDescription("Open your private prayer list.")
    static var openAppWhenRun: Bool = true

    @MainActor
    func perform() async throws -> some IntentResult {
        if let url = URL(string: "doxazo://prayers") {
            await UIApplication.shared.open(url)
        }
        return .result()
    }
}

@available(iOS 16.0, *)
struct OpenScriptureLookupIntent: AppIntent {
    static var title: LocalizedStringResource = "Look Up Scripture"
    static var description = IntentDescription("Open the Scripture lookup tool.")
    static var openAppWhenRun: Bool = true

    @MainActor
    func perform() async throws -> some IntentResult {
        if let url = URL(string: "doxazo://scripture") {
            await UIApplication.shared.open(url)
        }
        return .result()
    }
}

@available(iOS 16.0, *)
struct DoxazoShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: OpenTodayDevotionalIntent(),
            phrases: [
                "Today's word in \(.applicationName)",
                "Read my devotional in \(.applicationName)",
                "Open today's devotional in \(.applicationName)",
            ],
            shortTitle: "Today's Word",
            systemImageName: "sun.max.fill"
        )
        AppShortcut(
            intent: OpenPrayerListIntent(),
            phrases: [
                "Open my prayer list in \(.applicationName)",
                "Show prayers in \(.applicationName)",
            ],
            shortTitle: "Prayer List",
            systemImageName: "hands.sparkles.fill"
        )
        AppShortcut(
            intent: OpenScriptureLookupIntent(),
            phrases: [
                "Look up scripture in \(.applicationName)",
                "Open scripture in \(.applicationName)",
            ],
            shortTitle: "Scripture",
            systemImageName: "book.fill"
        )
    }
}
