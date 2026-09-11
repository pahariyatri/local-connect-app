/**
 * Guest exploration history — a lightweight, client-only "recently viewed"
 * list keyed to this browser (same `lc_anon_id` identity sessionService.ts
 * already uses). Read-fast for the UI (no API round trip); the
 * server-side `session_events` table (sessionTracker.track()) remains the
 * source of truth for cross-device/analytics purposes — this is purely a
 * rendering convenience, not a second identity/history system.
 *
 * No personal information is stored — just what was viewed (type/id/title/
 * image/href) and when, capped and expired below.
 */

export type RecentViewType = 'service' | 'vendor' | 'destination' | 'package';

export interface RecentView {
  type: RecentViewType;
  id: string;
  title: string;
  image?: string | null;
  href: string;
  viewedAt: string;
}

const KEY = 'lc_recent_views';
const MAX_ITEMS = 20;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function getRecentViews(): RecentView[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - MAX_AGE_MS;
    return parsed.filter((v): v is RecentView => v && typeof v === 'object' && typeof v.viewedAt === 'string' && new Date(v.viewedAt).getTime() >= cutoff);
  } catch {
    return [];
  }
}

/** Adds/moves an entry to the front, deduped by (type, id), capped at MAX_ITEMS. */
export function addRecentView(entry: Omit<RecentView, 'viewedAt'>): void {
  try {
    const existing = getRecentViews().filter((v) => !(v.type === entry.type && v.id === entry.id));
    const next = [{ ...entry, viewedAt: new Date().toISOString() }, ...existing].slice(0, MAX_ITEMS);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable (private mode, quota) — recency is a nice-to-have, never block the real view.
  }
}
