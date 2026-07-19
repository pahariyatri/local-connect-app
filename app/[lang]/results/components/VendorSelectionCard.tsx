"use client";

import React from "react";
import LocalImage from "../../components/atoms/Image";

export interface Vendor {
  id: string;
  name: string;
  image: string;
  rating: number;
  price: number;
  category: string;
  description?: string;
}


interface VendorSelectionCardProps {
  vendor: Vendor;
  isSelected: boolean;
  onSelect: (vendorId: string) => void;
  onRemove?: () => void;
  isAlternative?: boolean;
}

export default function VendorSelectionCard({
  vendor,
  isSelected,
  onSelect,
  onRemove,
  isAlternative = false,
}: VendorSelectionCardProps) {
  return (
    <div className="relative">
      <button
        onClick={() => onSelect(vendor.id)}
        className={`
          relative w-full text-left transition-all duration-300 rounded-[2rem] overflow-hidden
          ${isSelected 
            ? "bg-white shadow-2xl shadow-indigo-100 ring-2 ring-emerald-500 scale-[0.98]" 
            : isAlternative 
              ? "bg-slate-50 border border-slate-100 opacity-70 hover:opacity-100" 
              : "bg-white border border-slate-100"
          }
          ${isAlternative ? "p-3" : "p-4"}
          active:scale-95
        `}
      >
        <div className={`flex gap-4 ${isAlternative ? "items-center" : "items-start"}`}>
          {/* Vendor Image */}
          <div className={`
            ${isAlternative ? "w-14 h-14" : "w-20 h-20"} 
            rounded-2xl overflow-hidden shrink-0 shadow-inner border border-slate-100
          `}>
            <LocalImage 
              src={vendor.image} 
              alt={vendor.name} 
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <h4 className={`font-black text-slate-900 truncate uppercase tracking-tight ${isAlternative ? "text-[10px]" : "text-sm"}`}>
                {vendor.name}
              </h4>
              {isSelected && !isAlternative && (
                  <div className="bg-emerald-500 text-white p-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-black text-amber-500">★</span>
                <span className="text-[10px] font-bold text-slate-600">{vendor.rating}</span>
              </div>
              <span className="text-slate-300 text-[10px]">|</span>
              <div className="flex items-center gap-2">
                <span className={`font-black text-emerald-600 ${isAlternative ? "text-[10px]" : "text-sm"}`}>
                    ₹{vendor.price}
                </span>
                {/* 🏷️ Partner Discount Visual */}
                {!isAlternative && (
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-slate-400 line-through">₹{Math.round(vendor.price * 1.2)}</span>
                    <span className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest whitespace-nowrap">
                        PARTNER RATE
                    </span>
                  </div>
                )}
              </div>
            </div>

            {!isAlternative && (
              <p className="text-[10px] text-slate-500 font-medium mt-1 line-clamp-1">
                  {vendor.description}
              </p>
            )}
          </div>
        </div>
      </button>

      {/* Item-level Removal Button */}
      {isSelected && !isAlternative && onRemove && (
        <button 
            onClick={(e) => {
                e.stopPropagation();
                onRemove();
            }}
            className="absolute -top-1 -right-1 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 transition-colors z-20"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      )}

      {isSelected && isAlternative && (
        <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      )}
    </div>
  );
}
