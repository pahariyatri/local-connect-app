"use client";

import React from "react";
import { CarType } from "@/contexts/TripPlannerContext";
import Typography from "../../components/atoms/Typography";

interface CarTypeSelectorProps {
    selectedType: CarType | null;
    onTypeChange: (type: CarType) => void;
}

const CAR_OPTIONS: { id: CarType; label: string; icon: React.ReactNode; desc: string }[] = [
    { 
        id: "sedan", 
        label: "Sedan", 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
            <circle cx="7" cy="17" r="2" />
            <path d="M9 17h6" />
            <circle cx="17" cy="17" r="2" />
          </svg>
        ), // Sedan SVG
        desc: "Comfortable for 4, ideal for highways"  
    },
    { 
        id: "suv", 
        label: "SUV / MPV", 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
            <circle cx="6.5" cy="16.5" r="2.5" />
            <circle cx="16.5" cy="16.5" r="2.5" />
          </svg>
        ), // SUV SVG
        desc: "Spacious, perfect for mountain terrain"  
    },
    { 
        id: "hatchback", 
        label: "Hatchback", 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
            <circle cx="7" cy="17" r="2" />
            <path d="M9 17h6" />
            <circle cx="17" cy="17" r="2" />
          </svg>
        ), // Hatchback SVG
        desc: "Economical, best for solo/couples"  
    },
    { 
        id: "none", 
        label: "I need a Taxi", 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 2v2" />
            <path d="M8 2v2" />
            <path d="M8 8h8" />
            <rect x="2" y="6" width="20" height="14" rx="2" />
            <path d="M16 14h4" />
            <path d="M4 14h4" />
          </svg>
        ), // Taxi icon roughly
        desc: "We'll provide a local driver & vehicle"  
    }
];

export default function CarTypeSelector({ selectedType, onTypeChange }: CarTypeSelectorProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Typography variant="h3" className="text-xl font-bold text-slate-900">
                    Your Transport
                </Typography>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase rounded-full tracking-widest">
                    Step 5
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {CAR_OPTIONS.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => onTypeChange(option.id)}
                        className={`group relative p-5 rounded-[2rem] border-2 text-left transition-all duration-300 active:scale-[0.98] ${
                            selectedType === option.id
                                ? "bg-white border-emerald-500 shadow-xl shadow-emerald-100 -translate-y-1"
                                : "bg-white border-slate-100 hover:border-slate-200"
                        }`}
                    >
                        <div className="flex items-center gap-5">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                                selectedType === option.id ? "bg-emerald-500 text-white scale-110 rotate-3" : "bg-slate-50 text-slate-400 group-hover:scale-110"
                            }`}>
                                {option.id === "suv" ? (
                                    <span className="text-xs font-black">SUV</span>
                                ) : (
                                    option.icon
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className={`font-black text-lg ${selectedType === option.id ? "text-slate-900" : "text-slate-600"}`}>
                                    {option.label}
                                </h4>
                                <p className="text-slate-400 text-xs font-medium mt-0.5">
                                    {option.desc}
                                </p>
                            </div>
                            {selectedType === option.id && (
                                <div className="absolute top-4 right-4 animate-bounce-slow">
                                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    </div>
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
            
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center pt-2">
                This helps us check parking & terrain feasibility
            </p>
        </div>
    );
}
