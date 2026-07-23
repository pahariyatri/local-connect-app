"use client";

import React, { useMemo } from "react";
import {
  TripStop,
  generateDayPlan,
  stopTypeIcon,
  stopTypeLabel,
  STOP_TIME_OPTIONS,
  STOP_DIRECTION_OPTIONS,
} from "@/types/tripBuilder";

interface PlanPreviewProps {
  origin: string;
  destinationLabels: string[];
  stops: TripStop[];
  /** Compact hides time/direction meta — used as an inline summary. */
  compact?: boolean;
}

function timeLabel(v: string): string {
  return STOP_TIME_OPTIONS.find((o) => o.value === v)?.label ?? v;
}
function directionLabel(v: string): string {
  return STOP_DIRECTION_OPTIONS.find((o) => o.value === v)?.label ?? v;
}

export default function PlanPreview({ origin, destinationLabels, stops, compact = false }: PlanPreviewProps) {
  const dayPlan = useMemo(() => generateDayPlan(stops), [stops]);
  const destination = destinationLabels.join(", ");

  if (stops.length === 0) {
    return (
      <div className="rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
        <div className="text-2xl mb-1.5">🧭</div>
        <p className="text-slate-900 font-bold text-sm">Your day-by-day plan will appear here</p>
        <p className="text-slate-400 text-xs mt-1">
          Add a few stops above and we&apos;ll shape them into a clean day-wise plan — no itinerary writing needed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {dayPlan.map((group) => (
        <div key={group.key} className="rounded-[1.5rem] border border-slate-100 bg-white overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{group.label}</span>
            <span className="text-slate-400 text-[11px] font-medium truncate">
              {origin && group.key === "day-1" ? `${origin} → ` : ""}
              {group.stops.map((s) => s.name).join(" → ")}
              {destination && (group.key === "return" || group.key === dayPlan[dayPlan.length - 1].key) ? ` → ${destination}` : ""}
            </span>
          </div>
          <ul className="divide-y divide-slate-100">
            {group.stops.map((s) => (
              <li key={s.id} className="flex items-start gap-3 px-4 py-3">
                <span className="text-lg leading-none mt-0.5" aria-hidden="true">{stopTypeIcon(s.type)}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 text-sm truncate">{s.name}</p>
                  <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide">
                    {stopTypeLabel(s.type)}
                    {!compact && ` · ${timeLabel(s.timePreference)} · ${directionLabel(s.direction)}`}
                  </p>
                  {!compact && s.notes ? <p className="text-slate-500 text-xs mt-1 leading-snug">{s.notes}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
