/**
 * Trip date maths shared by the trip builder and direct booking.
 *
 * Business rules (one source of truth):
 *  - Nights = calendar days between check-in and check-out. Dec 4 → Dec 6 is
 *    2 nights / 3 days. The builder used to count `diffDays + 1` stays, which
 *    priced one extra night (₹6,000 instead of ₹4,000 for the same stay).
 *  - A stay is needed on every day EXCEPT the last (you leave that day).
 *  - Same-day trip (start = end) = a 1-day trip with 0 nights → no stay.
 *  - End before start, or an unparseable date → invalid (callers must not
 *    price it; the builder shows 1 day and no stays).
 *  - Dates are calendar dates ("YYYY-MM-DD"); maths is done in UTC on the
 *    date parts so timezone/DST can never shift a day (see lib/travelDate.ts).
 */

const DAY_MS = 86_400_000;
export const MAX_TRIP_DAYS = 14;

/** UTC midnight (ms) for the calendar date in `value`, or null if unparseable. */
export function dateOnlyUtc(value: string | Date | null | undefined): number | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
  }
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const ms = Date.UTC(y, mo - 1, d);
  const check = new Date(ms);
  // Reject impossible dates like 2026-02-30 (Date.UTC would roll them over).
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) return null;
  return ms;
}

/** Calendar nights between two dates; null when invalid or end < start. */
export function nightsBetween(start: string | Date | null | undefined, end: string | Date | null | undefined): number | null {
  const a = dateOnlyUtc(start);
  const b = dateOnlyUtc(end);
  if (a == null || b == null || b < a) return null;
  return Math.round((b - a) / DAY_MS);
}

export interface TripShape {
  /** Itinerary days, 1-indexed: [1, 2, 3] for Dec 4–6. */
  days: number[];
  /** Nights that need a stay (always days.length - 1, or 0). */
  nights: number;
  valid: boolean;
  /** True when the trip is longer than MAX_TRIP_DAYS and was cut. */
  truncated: boolean;
}

export function tripShape(start: string | Date | null | undefined, end: string | Date | null | undefined, maxDays = MAX_TRIP_DAYS): TripShape {
  const n = nightsBetween(start, end);
  if (n == null) return { days: [1], nights: 0, valid: false, truncated: false };
  const dayCount = Math.min(n + 1, maxDays);
  return {
    days: Array.from({ length: dayCount }, (_, i) => i + 1),
    nights: dayCount - 1,
    valid: true,
    truncated: n + 1 > maxDays,
  };
}

/** Whether itinerary `day` needs a place to sleep (every day but the departure day). */
export function dayNeedsStay(day: number, shape: TripShape): boolean {
  return day >= 1 && day <= shape.nights;
}
