// ─── Travel Builder — structured stop model ──────────────────────────────────
// Used by Step 5 (stop builder) and Step 6 (day-wise plan preview). Kept
// framework-free so it can be imported by client components and helpers alike.

export type StopDay = "day-1" | "day-2" | "day-3" | "return" | "flexible";

export type StopType =
  | "lunch"
  | "stay"
  | "viewpoint"
  | "activity"
  | "pickup"
  | "drop"
  | "local-experience"
  | "sacred-place"
  | "rest";

export type StopTime = "morning" | "afternoon" | "evening" | "night" | "flexible";

export type StopDirection = "going" | "returning" | "during-stay";

export interface TripStop {
  id: string;
  name: string;
  day: StopDay;
  type: StopType;
  timePreference: StopTime;
  direction: StopDirection;
  notes?: string;
}

// Full builder state shape (reference for Phase 2 context work; Step 5 currently
// consumes the TripStop slice). Fields mirror the existing TripPlannerContext so
// the two can be reconciled without a breaking rewrite.
export interface TripBuilderState {
  startPoint: string;
  destination: string;
  tripDirection: "one-way" | "round-trip" | "not-sure";
  dateType: "this-week" | "next-week" | "this-month" | "custom" | "not-sure";
  customDates?: { start?: string; end?: string };
  peopleType: "solo" | "couple" | "friends-2-4" | "family" | "group";
  peopleCount?: number;
  needs: string[];
  stops: TripStop[];
}

// ─── Option metadata (labels + compact emoji for dropdowns/cards) ─────────────

export const STOP_DAY_OPTIONS: { value: StopDay; label: string }[] = [
  { value: "day-1", label: "Day 1" },
  { value: "day-2", label: "Day 2" },
  { value: "day-3", label: "Day 3" },
  { value: "return", label: "Return" },
  { value: "flexible", label: "Flexible" },
];

export const STOP_TYPE_OPTIONS: { value: StopType; label: string; icon: string }[] = [
  { value: "stay", label: "Stay", icon: "🏨" },
  { value: "lunch", label: "Lunch", icon: "🍛" },
  { value: "viewpoint", label: "Viewpoint", icon: "🏞️" },
  { value: "activity", label: "Activity", icon: "🥾" },
  { value: "local-experience", label: "Local experience", icon: "🪔" },
  { value: "sacred-place", label: "Temple / sacred", icon: "🛕" },
  { value: "pickup", label: "Pickup", icon: "🚕" },
  { value: "drop", label: "Drop", icon: "🎯" },
  { value: "rest", label: "Rest stop", icon: "☕" },
];

export const STOP_TIME_OPTIONS: { value: StopTime; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "night", label: "Night" },
  { value: "flexible", label: "Flexible" },
];

export const STOP_DIRECTION_OPTIONS: { value: StopDirection; label: string }[] = [
  { value: "going", label: "Going" },
  { value: "returning", label: "Returning" },
  { value: "during-stay", label: "During stay" },
];

const DAY_LABELS: Record<StopDay, string> = {
  "day-1": "Day 1",
  "day-2": "Day 2",
  "day-3": "Day 3",
  return: "Return",
  flexible: "Flexible",
};

export function stopTypeIcon(type: StopType): string {
  return STOP_TYPE_OPTIONS.find((o) => o.value === type)?.icon ?? "📍";
}

export function stopTypeLabel(type: StopType): string {
  return STOP_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? "Stop";
}

// Stable id without external deps (crypto.randomUUID where available).
function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `stop-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createTripStop(name: string, overrides: Partial<TripStop> = {}): TripStop {
  return {
    id: makeId(),
    name,
    day: "day-1",
    type: "stay",
    timePreference: "flexible",
    direction: "going",
    ...overrides,
  };
}

export function duplicateTripStop(stop: TripStop): TripStop {
  return { ...stop, id: makeId() };
}

export interface DayPlanGroup {
  key: StopDay;
  label: string;
  stops: TripStop[];
}

// Order days deterministically: numbered days first (in stop order), then any
// "flexible" bucket, then "return" last — matching how a real yatra reads.
const DAY_ORDER: StopDay[] = ["day-1", "day-2", "day-3", "flexible", "return"];

export function generateDayPlan(stops: TripStop[]): DayPlanGroup[] {
  const byDay = new Map<StopDay, TripStop[]>();
  stops.forEach((s) => {
    const list = byDay.get(s.day) ?? [];
    list.push(s);
    byDay.set(s.day, list);
  });
  return DAY_ORDER.filter((d) => byDay.has(d)).map((d) => ({
    key: d,
    label: DAY_LABELS[d],
    stops: byDay.get(d)!,
  }));
}
