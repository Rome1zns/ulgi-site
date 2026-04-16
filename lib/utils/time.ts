import { kk } from "@/lib/locale/kk";

export function relativeTime(input: number | string): string {
  const ms = typeof input === "number" ? input : new Date(input).getTime();
  const now = Date.now();
  const diff = now - ms;
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return kk.feed.justNow;
  if (minutes < 60) return `${minutes} ${kk.feed.minutesAgo}`;
  if (hours < 24) return `${hours} ${kk.feed.hoursAgo}`;
  if (days < 2) return kk.feed.yesterday;
  return `${days} ${kk.feed.daysAgo}`;
}
