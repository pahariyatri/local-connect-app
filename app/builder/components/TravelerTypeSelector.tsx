"use client";

import React from "react";

export type TravelerType = "solo" | "couple" | "family" | "friends";

interface TravelerOption {
  id: TravelerType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface TravelerTypeSelectorProps {
  selectedType: TravelerType | null;
  onTypeChange: (type: TravelerType) => void;
}

const TRAVELER_TYPES: TravelerOption[] = [
  {
    id: "solo",
    label: "Solo",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="7" r="4" />
        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      </svg>
    ),
    description: "Just me",
  },
  {
    id: "couple",
    label: "Couple",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    description: "2 travelers",
  },
  {
    id: "family",
    label: "Family",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
    description: "3+ with kids",
  },
  {
    id: "friends",
    label: "Friends",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    description: "Group trip",
  },
];

export default function TravelerTypeSelector({
  selectedType,
  onTypeChange,
}: TravelerTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
          Who&apos;s traveling?
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Select your travel group
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {TRAVELER_TYPES.map((option) => {
          const isSelected = selectedType === option.id;

          return (
            <button
              key={option.id}
              onClick={() => onTypeChange(option.id)}
              className={`
                relative p-6 rounded-2xl transition-all duration-300 text-center
                ${isSelected
                  ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-200 scale-[0.98]"
                  : "bg-white border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 text-slate-900"
                }
                active:scale-95
              `}
            >
              {/* Icon */}
              <div className="text-4xl mb-3">
                {option.icon}
              </div>

              {/* Label */}
              <h4 className={`text-sm font-black uppercase tracking-tight mb-1 ${isSelected ? "text-white" : "text-slate-900"}`}>
                {option.label}
              </h4>

              {/* Description */}
              <p className={`text-xs font-medium ${isSelected ? "text-emerald-100" : "text-slate-500"}`}>
                {option.description}
              </p>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
