"use client";

import React from "react";
import VendorSelectionCard, { Vendor } from "./VendorSelectionCard";
import Typography from "../../components/atoms/Typography";

interface DayItineraryProps {
  day: number;
  title?: string;
  selections: {
    category: string;
    icon: string;
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

      <div className="space-y-10">
        {selections.map((selection, idx) => {
          const selectedVendor = selection.options.find(v => v.id === selection.selectedVendorId);
          
          return (
            <div key={idx} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{selection.icon}</span>
                  <Typography variant="h3" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      {selection.category}
                  </Typography>
                </div>
                {!selection.selectedVendorId && (
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">Removed</span>
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
