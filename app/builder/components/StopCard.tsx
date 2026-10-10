"use client";

import React, { useState } from "react";
import {
  TripStop,
  STOP_DAY_OPTIONS,
  STOP_TYPE_OPTIONS,
  STOP_TIME_OPTIONS,
  STOP_DIRECTION_OPTIONS,
} from "@/types/tripBuilder";

interface StopCardProps {
  stop: TripStop;
  index: number;
  total: number;
  onChange: (patch: Partial<TripStop>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const fieldLabelClass = "block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2";

const iconBtnClass =
  "w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors";

// Same inline-stroke-SVG convention used everywhere else — no emoji icons.
// One path per StopType value; keys match types/tripBuilder.ts exactly.
const TYPE_ICON_PATHS: Record<string, React.ReactNode> = {
  stay: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></>,
  lunch: <><path d="M3 2v7c0 1.1.9 2 2 2s2-.9 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></>,
  viewpoint: <><path d="m8 3 4 8 5-5 5 15H2L8 3z" /></>,
  activity: <><path d="M12 2a3 3 0 0 0-3 3c0 1.5 1 2 1 3.5V10H8a2 2 0 0 0-2 2v1c0 3 2 5 2 8h8c0-3 2-5 2-8v-1a2 2 0 0 0-2-2h-2V8.5c0-1.5 1-2 1-3.5a3 3 0 0 0-3-3Z" /></>,
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

export default function StopCard({
  stop,
  index,
  total,
  onChange,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: StopCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm">
      {/* Header row: index + name + reorder/remove */}
      <div className="flex items-center gap-3 mb-4">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-900 text-white text-xs font-black flex items-center justify-center">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-black text-slate-900 text-sm truncate flex items-center gap-1.5">
            <TypeIcon type={stop.type} className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            {stop.name}
          </p>
        </div>
        <div className="flex items-center gap-0.5">
          <button type="button" onClick={onMoveUp} disabled={index === 0} aria-label="Move stop up" className={iconBtnClass}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
          </button>
          <button type="button" onClick={onMoveDown} disabled={index === total - 1} aria-label="Move stop down" className={iconBtnClass}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
          </button>
          <button type="button" onClick={onRemove} aria-label="Remove stop" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* Day — the one choice that actually matters: which day's plan this stop belongs to. */}
      <div>
        <label className={fieldLabelClass}>Which day?</label>
        <div className="flex flex-wrap gap-2">
          {STOP_DAY_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange({ day: o.value })}
              aria-pressed={stop.day === o.value}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                stop.day === o.value ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* More details — collapsed by default so the card isn't overwhelming. */}
      {expanded ? (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
          <div>
            <label className={fieldLabelClass}>What kind of stop?</label>
            <div className="flex flex-wrap gap-2">
              {STOP_TYPE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => onChange({ type: o.value })}
                  aria-pressed={stop.type === o.value}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    stop.type === o.value ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <TypeIcon type={o.value} className="w-3.5 h-3.5" />
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={`time-${stop.id}`} className={fieldLabelClass}>Time of day</label>
              <select
                id={`time-${stop.id}`}
                value={stop.timePreference}
                onChange={(e) => onChange({ timePreference: e.target.value as TripStop["timePreference"] })}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              >
                {STOP_TIME_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor={`dir-${stop.id}`} className={fieldLabelClass}>Direction</label>
              <select
                id={`dir-${stop.id}`}
                value={stop.direction}
                onChange={(e) => onChange({ direction: e.target.value as TripStop["direction"] })}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              >
                {STOP_DIRECTION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor={`notes-${stop.id}`} className={fieldLabelClass}>Notes</label>
            <textarea
              id={`notes-${stop.id}`}
              value={stop.notes ?? ""}
              onChange={(e) => onChange({ notes: e.target.value })}
              rows={2}
              placeholder="Anything the local should know — timing, group needs, preferences…"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-base text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 resize-none"
            />
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <button type="button" onClick={() => setExpanded((v) => !v)} className="text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors">
          {expanded ? "Hide details" : "More details"}
        </button>
        <button type="button" onClick={onDuplicate} className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
          Duplicate
        </button>
      </div>
    </li>
  );
}
