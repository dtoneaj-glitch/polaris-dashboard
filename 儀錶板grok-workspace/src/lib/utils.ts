import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function nid() {
  return crypto.randomUUID();
}

export function startOfDay(ts = Date.now()) {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function isoDay(ts = Date.now()) {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function daysSince(ts: number, now = Date.now()) {
  return Math.max(0, Math.round((startOfDay(now) - startOfDay(ts)) / 86_400_000));
}

export function touchLabel(ts: number, now = Date.now()) {
  const n = daysSince(ts, now);
  if (n <= 0) return "今天";
  if (n === 1) return "昨天";
  return `${n} 天前`;
}

export function weekdayLong(ts = Date.now()) {
  return new Intl.DateTimeFormat("zh-Hant", { weekday: "long" }).format(new Date(ts));
}

export function dateHeadline(ts = Date.now()) {
  return new Intl.DateTimeFormat("zh-Hant", {
    month: "long",
    day: "numeric",
  }).format(new Date(ts));
}
