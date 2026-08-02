"use client";

import React, { useMemo } from "react";
import {
  TripStop,
  generateDayPlan,
  stopTypeLabel,
  STOP_TIME_OPTIONS,
  STOP_DIRECTION_OPTIONS,
} from "@/types/tripBuilder";

// Same inline-stroke-SVG convention used everywhere else — no emoji icons.
const TYPE_ICON_PATHS: Record<string, React.ReactNode> = {
  stay: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></>,
  lunch: <><path d="M3 2v7c0 1.1.9 2 2 2s2-.9 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></>,
  viewpoint: <path d="m8 3 4 8 5-5 5 15H2L8 3z" />,
  activity: <path d="M12 2a3 3 0 0 0-3 3c0 1.5 1 2 1 3.5V10H8a2 2 0 0 0-2 2v1c0 3 2 5 2 8h8c0-3 2-5 2-8v-1a2 2 0 0 0-2-2h-2V8.5c0-1.5 1-2 1-3.5a3 3 0 0 0-3-3Z" />,
  pickup: <><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" /><circle cx="6.5" cy="16.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" /></>,
  drop: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
  "local-experience": <><path d="M12 2v4" /><path d="m6.4 6.4 2.8 2.8" /><path d="M2 12h4" /><path d="m6.4 17.6 2.8-2.8" /><circle cx="12" cy="12" r="4" /></>,
  "sacred-place": <><path d="M12 2 8 8h8l-4-6Z" /><path d="M6 22V10h12v12" /><path d="M10 22v-6h4v6" /></>,
  rest: <><path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /><line x1="6" x2="6" y1="1" y2="4" /><line x1="10" x2="10" y1="1" y2="4" /><line x1="14" x2="14" y1="1" y2="4" /></>,
};

function TypeIcon({ type, className = "" }: { type: string; className?: string }) {
  const path = TYPE_ICON_PATHS[type];
  if (!path) return null;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {path}
    </svg>
  );
}

function CompassIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

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
        <CompassIcon className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
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
                <TypeIcon type={s.type} className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
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
