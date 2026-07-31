// Faith Essentials — index over the 30 authored day files (src/data/devotional-day-01..30.ts).
// kat_4_2_minimum: true
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

/** Formats a day's date with the en-US locale, matching existing tab labels. */
export const formatDayDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

export type ResolvedDay = { day: DevotionalDay; isFallback: boolean };

/**
 * Picks the day scheduled for today. If today's date cannot be matched
 * against the authored set, falls back to day_01 (flagged so the UI can
 * show a visible "Day 1" label).
 */
export const resolveTodayDay = (iso = todayIso()): ResolvedDay => {
  const exact = faithEssentialDays.find((d) => d.date === iso);
  if (exact) return { day: exact, isFallback: false };
  return { day: faithEssentialDays[0], isFallback: true };
};

/** 7-day window starting at the resolved day, wrapping within the authored set. */
export const dayWindow = (startIndex: number, size = 7): DevotionalDay[] => {
  const out: DevotionalDay[] = [];
  for (let i = 0; i < size; i++) {
    out.push(faithEssentialDays[(startIndex + i) % faithEssentialDays.length]);
  }
  return out;
};
