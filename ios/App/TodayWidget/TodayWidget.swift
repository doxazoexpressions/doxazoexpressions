// Doxazo Expressions — Today's Word widget (WidgetKit).
//
// Fetches https://<project>.functions.supabase.co/widget-today every hour and
// renders today's devotional on the Home Screen and Lock Screen. Tap opens the
// app via the `doxazo://devotional/<slug>` deep link handled in native.ts.
//
// See WIDGET_SETUP.md at the repo root for one-time Xcode setup.

import WidgetKit
import SwiftUI

// MARK: - Model

struct TodayEntry: TimelineEntry {
    let date: Date
    let title: String
    let scripture: String
    let excerpt: String
    let deeplink: URL?
}

// MARK: - Networking

// IMPORTANT: keep in sync with supabase project ref.
private let WIDGET_ENDPOINT = URL(string: "https://fjqrvkxhcydhyvtocoaa.functions.supabase.co/widget-today")!

private struct TodayPayload: Decodable {
    let title: String
    let scripture: String
    let excerpt: String
    let deeplink: String?
}

private func fetchToday(completion: @escaping (TodayEntry) -> Void) {
    var request = URLRequest(url: WIDGET_ENDPOINT)
    request.cachePolicy = .reloadIgnoringLocalCacheData
    request.timeoutInterval = 8

    URLSession.shared.dataTask(with: request) { data, _, _ in
        let now = Date()
        if let data = data,
           let payload = try? JSONDecoder().decode(TodayPayload.self, from: data) {
            completion(TodayEntry(
                date: now,
                title: payload.title,
                scripture: payload.scripture,
                excerpt: payload.excerpt,
                deeplink: payload.deeplink.flatMap(URL.init(string:))
            ))
        } else {
            completion(TodayEntry(
                date: now,
                title: "Doxazo Expressions",
                scripture: "",
                excerpt: "Open the app for today's word.",
                deeplink: URL(string: "doxazo://")
            ))
        }
    }.resume()
}

// MARK: - Provider

struct TodayProvider: TimelineProvider {
    func placeholder(in context: Context) -> TodayEntry {
        TodayEntry(
            date: Date(),
            title: "Today's Word",
            scripture: "Psalm 23:1",
            excerpt: "The Lord is my shepherd; I shall not want.",
            deeplink: URL(string: "doxazo://")
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (TodayEntry) -> Void) {
        fetchToday(completion: completion)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<TodayEntry>) -> Void) {
        fetchToday { entry in
            // Refresh once an hour, plus at midnight local.
            let next = Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date().addingTimeInterval(3600)
            completion(Timeline(entries: [entry], policy: .after(next)))
        }
    }
}

// MARK: - Views

private let navy = Color(red: 15/255, green: 26/255, blue: 43/255)
private let gold = Color(red: 201/255, green: 162/255, blue: 75/255)

struct TodayWidgetView: View {
    var entry: TodayEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        ZStack(alignment: .topLeading) {
            LinearGradient(colors: [navy, navy.opacity(0.85)], startPoint: .topLeading, endPoint: .bottomTrailing)
            VStack(alignment: .leading, spacing: 6) {
                Text("TODAY'S WORD")
                    .font(.system(size: 10, weight: .bold))
                    .tracking(2)
                    .foregroundColor(gold)
                Text(entry.title)
                    .font(.system(size: family == .systemSmall ? 15 : 18, weight: .bold, design: .serif))
                    .foregroundColor(.white)
                    .lineLimit(family == .systemSmall ? 3 : 2)
                if !entry.scripture.isEmpty {
                    Text(entry.scripture)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(gold)
                        .lineLimit(1)
                }
                if family != .systemSmall && !entry.excerpt.isEmpty {
                    Text(entry.excerpt)
                        .font(.system(size: 12))
                        .foregroundColor(.white.opacity(0.85))
                        .lineLimit(3)
                }
                Spacer(minLength: 0)
                Text("Open Doxazo →")
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(gold)
            }
            .padding(14)
        }
        .widgetURL(entry.deeplink)
    }
}

// MARK: - Widget

@main
struct TodayWidget: Widget {
    let kind: String = "TodayWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TodayProvider()) { entry in
            if #available(iOS 17.0, *) {
                TodayWidgetView(entry: entry)
                    .containerBackground(for: .widget) { navy }
            } else {
                TodayWidgetView(entry: entry)
            }
        }
        .configurationDisplayName("Today's Word")
        .description("A fresh devotional from Doxazo Expressions, on your Home Screen.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
