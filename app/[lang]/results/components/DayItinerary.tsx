"use client";

import React from "react";
import VendorSelectionCard, { Vendor } from "./VendorSelectionCard";
import Typography from "../../components/atoms/Typography";

// Same inline-stroke-SVG convention used everywhere else in the app — no
// emoji icons. Keyed by the category label already used throughout the
// builder/results flow (Stay/Taxi/Adventure/Meals).
const CATEGORY_ICON_PATHS: Record<string, React.ReactNode> = {
  Stay: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></>,
  Taxi: <><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" /><circle cx="6.5" cy="16.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" /></>,
  Adventure: <path d="m8 3 4 8 5-5 5 15H2L8 3z" />,
  Meals: <><path d="M3 2v7c0 1.1.9 2 2 2s2-.9 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></>,
};

function CategoryIcon({ category, className = "" }: { category: string; className?: string }) {
  const path = CATEGORY_ICON_PATHS[category];
  if (!path) return null;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {path}
    </svg>
  );
}

interface DayItineraryProps {
  day: number;
  title?: string;
  /** Route/stop context for this day (e.g. "Manali → Kasol") — shown next to the day title. */
  subtitle?: string;
  selections: {
    category: string;
    selectedVendorId?: string | null;
    options: Vendor[];
  }[];
  onVendorChange: (category: string, vendorId: string) => void;
  onRemove: (category: string) => void;
  onAdd: (category: string) => void;
  onViewAll?: (category: string) => void;
  readOnly?: boolean;
}

export default function DayItinerary({
  day,
  title,
  subtitle,
  selections,
  onVendorChange,
  onRemove,
  onAdd,
  onViewAll,
  readOnly = false,
}: DayItineraryProps) {
  return (
    <div className="relative pl-12 pb-12 last:pb-0 group">
      {/* Vertical Time Line */}
      <div className="absolute left-[19px] top-10 bottom-0 w-[2px] bg-indigo-100 group-last:hidden" />

      {/* Day Bubble */}
      <div className="absolute left-0 top-0 w-10 h-10 rounded-2xl bg-white border-2 border-indigo-500 shadow-xl shadow-indigo-100 flex items-center justify-center z-10">
        <span className="text-[10px] font-black text-indigo-600 uppercase">{title || `D${day}`}</span>
      </div>

      {subtitle && (
        <p className="text-sm font-bold text-slate-500 mb-6 -mt-1">{subtitle}</p>
      )}

      <div className="space-y-10">
        {selections.length === 0 && (
          <div className="p-4 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50 text-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nothing planned for this day yet</span>
          </div>
        )}
        {selections.map((selection, idx) => {
          const selectedVendor = selection.options.find(v => v.id === selection.selectedVendorId);
          // A category only auto-selects its first option when options exist, so
          // "no options" (nothing was ever available) and "removed" (the user
          // actively cleared a prior selection) are distinguishable by whether
          // options exist at all.
          const hasNoOptions = !selection.selectedVendorId && selection.options.length === 0;
          const wasRemoved = !selection.selectedVendorId && selection.options.length > 0;

          return (
            <div key={idx} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CategoryIcon category={selection.category} className="w-5 h-5 text-slate-400" />
                  <Typography variant="h3" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      {selection.category}
                  </Typography>
                </div>
                {wasRemoved && (
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">Removed</span>
                )}
                {hasNoOptions && (
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded">No options nearby</span>
                )}
              </div>

              {/* Selected Option */}
              {selectedVendor ? (
                <VendorSelectionCard
                  vendor={selectedVendor}
                  isSelected={true}
                  onSelect={() => {}}
                  onRemove={readOnly ? undefined : () => onRemove(selection.category)}
                />
              ) : readOnly ? null : (
                <div className="p-4 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-2 group/add hover:bg-white hover:border-emerald-300 transition-all cursor-pointer"
                     onClick={() => onAdd(selection.category)}
                >
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 group-hover/add:bg-emerald-500 group-hover/add:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/add:text-slate-900">Add {selection.category}</span>
                </div>
              )}

              {/* Alternatives — hidden in readOnly */}
              {!readOnly && (() => {
                const alternatives = selection.options.filter(v => v.id !== selection.selectedVendorId);
                return (
                  <>
                    <div className="grid grid-cols-2 gap-3 opacity-60 hover:opacity-100 transition-opacity">
                      {alternatives.slice(0, 2).map(vendor => (
                        <VendorSelectionCard
                          key={vendor.id}
                          vendor={vendor}
                          isSelected={false}
                          onSelect={(id) => onVendorChange(selection.category, id)}
                          isAlternative={true}
                        />
                      ))}
                    </div>

                    {/* View-all opens the full list for this category across the whole route */}
                    {onViewAll && selection.options.length > 3 && (
                      <button
                        type="button"
                        onClick={() => onViewAll(selection.category)}
                        className="w-full mt-1 py-3 rounded-2xl border-2 border-dashed border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/40 transition-all flex items-center justify-center gap-2"
                      >
                        View all {selection.options.length} {selection.category} options
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
