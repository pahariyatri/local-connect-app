"use client";

import React from "react";
import { ServiceType } from "@/contexts/TripPlannerContext";
import { SERVICE_INTEREST_LABELS } from "@/lib/discoveryApiMapping";

interface ServiceInterestSelectorProps {
  selectedInterests: ServiceType[];
  onInterestChange: (interests: ServiceType[]) => void;
  dict: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function ServiceInterestSelector({ selectedInterests, onInterestChange, dict }: ServiceInterestSelectorProps) {
  const b = dict?.page?.builder?.interests || {};

  const INTEREST_OPTIONS: { id: ServiceType; label: string; icon: React.ReactNode; color: string }[] = [
    {
      id: "stay",
      label: b.stay ?? SERVICE_INTEREST_LABELS.stay,
      color: "indigo",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11.4 1.2a2 2 0 0 1 2.2 0l8.6 5a2 2 0 0 1 1 1.8v13.3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 1-1.8l8.4-5Z" />
          <path d="M15 22v-8a2 2 0 0 0-4 0v8" />
        </svg>
      ) 
    },
    {
      id: "activity",
      label: b.activity ?? SERVICE_INTEREST_LABELS.activity,
      color: "emerald",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 11l-4-4-4 4" /><path d="M17 11V7l-4-4-4 4v4" /><path d="M17 11l-4 4-4-4" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      ) 
    },
    {
      id: "travel",
      label: b.travel ?? SERVICE_INTEREST_LABELS.travel,
      color: "blue",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
          <path d="M15 18H9" />
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
          <circle cx="17" cy="18" r="2" />
          <circle cx="7" cy="18" r="2" />
        </svg>
      ) 
    },
    {
      id: "food",
      label: b.food ?? SERVICE_INTEREST_LABELS.food,
      color: "amber",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3l-8-14Z" />
          <circle cx="12" cy="14" r="3" />
        </svg>
      ) 
    }
  ];

  const colorMap = {
    indigo: {
      border: "border-indigo-500",
      shadow: "shadow-indigo-100",
      bg: "bg-indigo-500",
      lightBg: "bg-indigo-50",
    },
    emerald: {
      border: "border-emerald-500",
      shadow: "shadow-emerald-100",
      bg: "bg-emerald-500",
      lightBg: "bg-emerald-50",
    },
    blue: {
      border: "border-blue-500",
      shadow: "shadow-blue-100",
      bg: "bg-blue-500",
      lightBg: "bg-blue-50",
    },
    amber: {
      border: "border-amber-500",
      shadow: "shadow-amber-100",
      bg: "bg-amber-500",
      lightBg: "bg-amber-50",
    }
  };

  const toggleInterest = (id: ServiceType) => {
    if (selectedInterests.includes(id)) {
      onInterestChange(selectedInterests.filter(i => i !== id));
    } else {
      onInterestChange([...selectedInterests, id]);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {INTEREST_OPTIONS.map((option) => {
        const isSelected = selectedInterests.includes(option.id);
        const colors = colorMap[option.color as keyof typeof colorMap];
        
        return (
          <button
            key={option.id}
            onClick={() => toggleInterest(option.id)}
            className={`
              relative h-32 sm:h-44 rounded-[1.5rem] sm:rounded-[2.5rem] border-2 transition-all p-4 sm:p-8 text-left flex flex-col justify-end group active:scale-95 overflow-hidden
              ${isSelected ? `${colors.border} ${colors.shadow} shadow-xl bg-white` : "border-slate-50 hover:border-slate-200 shadow-md shadow-slate-100/50 bg-white"}
            `}
          >
            <div className={`
              absolute -right-4 -top-4 w-24 sm:w-32 h-24 sm:h-32 rounded-full blur-2xl sm:blur-3xl opacity-10 transition-all duration-700
              ${isSelected ? `${colors.bg} scale-150` : "bg-slate-200"}
            `} />

            <div className={`
              w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center text-base sm:text-xl mb-2 sm:mb-4 transition-all duration-500 relative z-10
              ${isSelected ? `${colors.bg} text-white shadow-lg rotate-3` : "bg-slate-50 text-slate-400 group-hover:scale-110 group-hover:rotate-6"}
            `}>
              {isSelected ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="animate-in zoom-in duration-300 sm:w-6 sm:h-6"><polyline points="20 6 9 17 4 12"/></svg>
              ) : option.icon}
            </div>

            <h3 className={`font-black text-sm sm:text-xl transition-colors z-10 leading-tight ${isSelected ? "text-slate-900" : "text-slate-600"}`}>
              {option.label}
            </h3>
          </button>
        );
      })}
    </div>
  );
}
