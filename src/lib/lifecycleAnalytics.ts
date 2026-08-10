/**
 * Lifecycle analytics: install, onboarding, first-open, retention returns.
 *
 * Every event here is fired AT MOST ONCE for its scope. The dedupe ledger lives
 * in localStorage so it survives reloads, cold starts and native relaunches —
 * a session-only guard would double-count on every app resume.
 */
import { track, type AnalyticsEvent } from "@/lib/analytics";

const LEDGER = "doxazo.analytics.ledger.v1";
const INSTALL = "doxazo.analytics.install.v1";

type Ledger = Record<string, string>;

const readLedger = (): Ledger => {
  try {
    return JSON.parse(localStorage.getItem(LEDGER) || "{}");
  } catch {
    return {};
  }
};

const writeLedger = (l: Ledger) => {
  try {
    localStorage.setItem(LEDGER, JSON.stringify(l));
  } catch {
    /* storage full / private mode */
  }
};

/** Fire `event` only the first time this `key` is ever seen on this device. */
export function trackOnce(key: string, event: AnalyticsEvent, params?: Record<string, unknown>) {
  const ledger = readLedger();
  if (ledger[key]) return false;
  ledger[key] = new Date().toISOString();
  writeLedger(ledger);
  track(event, params);
  return true;
}

export function hasFired(key: string) {
  return Boolean(readLedger()[key]);
}

const dayIndexSinceInstall = (installedAt: string) => {
  const start = new Date(installedAt);
  const a = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const now = new Date();
  const b = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((b - a) / 86_400_000);
};

/**
 * Called once per app/session start. Emits:
 *   - app_install (first ever launch on this device)
 *   - day_2_return / day_7_return (retention checkpoints, once each)
 */
export function trackLaunchLifecycle(platform: string) {
  if (typeof window === "undefined") return;
  let installedAt = "";
  try {
    installedAt = localStorage.getItem(INSTALL) || "";
  } catch {
    return;
  }

  if (!installedAt) {
    installedAt = new Date().toISOString();
    try {
      localStorage.setItem(INSTALL, installedAt);
    } catch {}
    trackOnce("app_install", "app_install", { platform });
    return; // day-0: no return events possible
  }

  const day = dayIndexSinceInstall(installedAt);
  if (day >= 1) trackOnce("day_2_return", "day_2_return", { platform, day_index: day });
  if (day >= 6) trackOnce("day_7_return", "day_7_return", { platform, day_index: day });
}

/** First devotional a user ever opens (once per device) + per-devotional open. */
export function trackDevotionalOpened(id: string, extra?: Record<string, unknown>) {
  trackOnce("first_devotional_opened", "first_devotional_opened", { id, ...extra });
  track("devotional_opened", { id, ...extra });
}

/** Read-through completion — once per devotional, not once per scroll tick. */
export function trackDevotionalCompleted(id: string, extra?: Record<string, unknown>) {
  trackOnce(`devotional_completed:${id}`, "devotional_completed", { id, ...extra });
}

export function trackOnboardingCompleted(params?: Record<string, unknown>) {
  trackOnce("onboarding_completed", "onboarding_completed", params);
}

export function trackAccountCreated(method: string) {
  trackOnce("account_created", "account_created", { method });
}

export function trackReminderOptIn(channel: string) {
  trackOnce(`reminder_opt_in:${channel}`, "reminder_opt_in", { channel });
}
