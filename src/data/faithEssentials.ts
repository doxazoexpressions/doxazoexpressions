// Faith Essentials — index over the 30 authored day files (src/data/devotional-day-01..30.ts).
// kat_4_2_minimum: true
//
// Scheduling note: the authored day files carry an original authoring date
// (2026-01-01 …), which must NOT be presented to readers — it would look like
// stale content. The set is instead presented as a continuous 30-day cycle
// anchored on the reader's own local date, so "today" always resolves to a real
// authored day and every card shows a real calendar date.
import type { DevotionalDay } from "./types";
import day01 from "./devotional-day-01";
import day02 from "./devotional-day-02";
import day03 from "./devotional-day-03";
import day04 from "./devotional-day-04";
import day05 from "./devotional-day-05";
import day06 from "./devotional-day-06";
import day07 from "./devotional-day-07";
import day08 from "./devotional-day-08";
import day09 from "./devotional-day-09";
import day10 from "./devotional-day-10";
import day11 from "./devotional-day-11";
import day12 from "./devotional-day-12";
import day13 from "./devotional-day-13";
import day14 from "./devotional-day-14";
import day15 from "./devotional-day-15";
import day16 from "./devotional-day-16";
import day17 from "./devotional-day-17";
import day18 from "./devotional-day-18";
import day19 from "./devotional-day-19";
import day20 from "./devotional-day-20";
import day21 from "./devotional-day-21";
import day22 from "./devotional-day-22";
import day23 from "./devotional-day-23";
import day24 from "./devotional-day-24";
import day25 from "./devotional-day-25";
import day26 from "./devotional-day-26";
import day27 from "./devotional-day-27";
import day28 from "./devotional-day-28";
import day29 from "./devotional-day-29";
import day30 from "./devotional-day-30";

export const faithEssentialDays: DevotionalDay[] = [
  day01, day02, day03, day04, day05, day06, day07, day08, day09, day10,
  day11, day12, day13, day14, day15, day16, day17, day18, day19, day20,
  day21, day22, day23, day24, day25, day26, day27, day28, day29, day30,
];

export const todayIso = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Formats an ISO date as e.g. "Mon, Aug 24" using the visitor's locale calendar. */
export const formatDayDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

/** Local-midnight day index, used to advance the cycle exactly once per day. */
const dayIndexFor = (iso: string) =>
  Math.floor(new Date(`${iso}T12:00:00`).getTime() / 86400000);

const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return todayIso(d);
};

/** A day paired with the real calendar date it is being read on. */
export type ScheduledDay = { day: DevotionalDay; date: string; isToday: boolean };

/** Index within the authored set that today maps to (stable per calendar day). */
export const todayIndex = (iso = todayIso()): number => {
  const len = faithEssentialDays.length;
  return ((dayIndexFor(iso) % len) + len) % len;
};

/** Today's authored day, paired with today's real date. */
export const resolveTodayDay = (iso = todayIso()): ScheduledDay => ({
  day: faithEssentialDays[todayIndex(iso)],
  date: iso,
  isToday: true,
});

/**
 * The reading window: today plus the previous `size - 1` days, newest first,
 * so nothing in the list is dated in the future.
 */
export const recentWindow = (size = 7, iso = todayIso()): ScheduledDay[] => {
  const len = faithEssentialDays.length;
  const start = todayIndex(iso);
  const out: ScheduledDay[] = [];
  for (let i = 0; i < Math.min(size, len); i++) {
    out.push({
      day: faithEssentialDays[((start - i) % len + len) % len],
      date: addDays(iso, -i),
      isToday: i === 0,
    });
  }
  return out;
};

/** Authored days not present in the current window (for "view earlier"). */
export const earlierDays = (window: ScheduledDay[]): DevotionalDay[] =>
  faithEssentialDays.filter((d) => !window.some((w) => w.day.day_id === d.day_id));
