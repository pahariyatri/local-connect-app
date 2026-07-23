"use client";

import React, { useState } from "react";
import {
  TripStop,
  STOP_DAY_OPTIONS,
  STOP_TYPE_OPTIONS,
  STOP_TIME_OPTIONS,
  STOP_DIRECTION_OPTIONS,
  stopTypeIcon,
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

const selectClass =
  "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 appearance-none";

const fieldLabelClass = "block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1";

const iconBtnClass =
  "w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors";

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
  const [showNotes, setShowNotes] = useState(Boolean(stop.notes));

  return (
    <li className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm">
      {/* Header row: index + name + reorder/remove */}
      <div className="flex items-center gap-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-900 text-white text-xs font-black flex items-center justify-center">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-black text-slate-900 text-sm truncate flex items-center gap-1.5">
            <span aria-hidden="true">{stopTypeIcon(stop.type)}</span>
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

      {/* Dropdown grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
        <div>
          <label htmlFor={`day-${stop.id}`} className={fieldLabelClass}>Day</label>
          <select id={`day-${stop.id}`} value={stop.day} onChange={(e) => onChange({ day: e.target.value as TripStop["day"] })} className={selectClass}>
            {STOP_DAY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`type-${stop.id}`} className={fieldLabelClass}>Type</label>
          <select id={`type-${stop.id}`} value={stop.type} onChange={(e) => onChange({ type: e.target.value as TripStop["type"] })} className={selectClass}>
            {STOP_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.icon} {o.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`time-${stop.id}`} className={fieldLabelClass}>Time</label>
          <select id={`time-${stop.id}`} value={stop.timePreference} onChange={(e) => onChange({ timePreference: e.target.value as TripStop["timePreference"] })} className={selectClass}>
            {STOP_TIME_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`dir-${stop.id}`} className={fieldLabelClass}>Direction</label>
          <select id={`dir-${stop.id}`} value={stop.direction} onChange={(e) => onChange({ direction: e.target.value as TripStop["direction"] })} className={selectClass}>
            {STOP_DIRECTION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Notes (collapsible) */}
      {showNotes ? (
        <div className="mt-3">
          <label htmlFor={`notes-${stop.id}`} className={fieldLabelClass}>Notes</label>
          <textarea
            id={`notes-${stop.id}`}
            value={stop.notes ?? ""}
            onChange={(e) => onChange({ notes: e.target.value })}
            rows={2}
            placeholder="Anything the local should know — timing, group needs, preferences…"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 resize-none"
          />
        </div>
      ) : null}

      {/* Quick actions */}
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100">
        {!showNotes && (
          <button type="button" onClick={() => setShowNotes(true)} className="text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors">
            + Add note
          </button>
        )}
        {stop.type !== "stay" && (
          <button type="button" onClick={() => onChange({ type: "stay" })} className="text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors">
            Make stay
          </button>
        )}
        {stop.day !== "flexible" && (
          <button type="button" onClick={() => onChange({ day: "flexible", timePreference: "flexible" })} className="text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors">
            Mark flexible
          </button>
        )}
        <button type="button" onClick={onDuplicate} className="ml-auto text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
          Duplicate
        </button>
      </div>
    </li>
  );
}
