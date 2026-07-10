// Central filter for "currently live" devotionals.
// A devotional is live when:
//   - status = 'published', OR
//   - status = 'scheduled' AND publish_at <= now  (safety net between cron ticks)
// The server-side cron job promotes scheduled → published every minute; this
// client filter ensures the correct item appears immediately at its publish_at
// even if the cron has not yet fired.
export function liveDevotionalOr(nowIso: string = new Date().toISOString()): string {
  return `status.eq.published,and(status.eq.scheduled,publish_at.lte.${nowIso})`;
}
