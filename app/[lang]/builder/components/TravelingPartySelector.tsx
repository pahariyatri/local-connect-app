"use client";

import React from "react";
import Typography from "../../components/atoms/Typography";

interface TravelingPartySelectorProps {
  guestCount: number;
  onGuestCountChange: (count: number) => void;
  dict: any;
}

const VEHICLE_TIERS = (v: any) => [
  { 
    max: 1, 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18.5" cy="17.5" r="2.5"/><circle cx="5.5" cy="17.5" r="2.5"/>
        <path d="M10 15h5.5l-2.5-4h-4z"/><path d="M13.5 11l-3-6H9l-2 5"/><path d="M18.5 17.5l-2-7"/>
      </svg>
    ), 
    name: v.bike || "Adventure Bike", 
    sub: v.bike_sub || "Solo journey" 
  },
  { 
    max: 2, 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
      </svg>
    ), 
    name: v.sedan || "Premium Sedan", 
    sub: v.sedan_sub || "Couples comfort" 
  },
  { 
    max: 4, 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="10" width="20" height="8" rx="2"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
      </svg>
    ), 
    name: v.suv || "Premium SUV", 
    sub: v.suv_sub || "Group utility" 
  },
  { 
    max: 14, 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="12" rx="2"/><path d="M2 13h20"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
      </svg>
    ), 
    name: v.tempo || "Tempo Traveler", 
    sub: v.tempo_sub || "Executive transit" 
  },
  { 
    max: 50, 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="13" rx="2"/><path d="M2 14h20"/><path d="M2 10h20"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
      </svg>
    ), 
    name: v.fullbus || "Grand Coach", 
    sub: v.fullbus_sub || "Elite group travel" 
  }
];

const STAY_TIERS = (s: any) => [
  {
    max: 1,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 12l8-4.5"/><path d="M12 12v9"/><path d="M12 12l-8-4.5"/>
      </svg>
    ),
    name: s.tier1 || "Boutique Stay",
    sub: s.sub1 || "Cozy & Local"
  },
  {
    max: 2,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/><path d="M10 8v9"/><path d="M18 4v16"/>
      </svg>
    ),
    name: s.tier2 || "Premium Room",
    sub: s.sub2 || "Couples sanctuary"
  },
  {
    max: 7,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21V11h6v10"/><path d="M9 7h6"/>
      </svg>
    ),
    name: s.tier3 || "Private Villa",
    sub: s.sub3 || "Exclusive group wing"
  },
  {
    max: 50,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 22H4V2l7 2v18h-2"/><path d="M11 22h4a2 2 0 0 0 2-2V7l5 2v11a2 2 0 0 0 2 2h2"/><path d="M7 6h1"/><path d="M7 10h1"/><path d="M7 14h1"/><path d="M14 10h1"/><path d="M14 14h1"/><path d="M14 18h1"/>
      </svg>
    ),
    name: s.tier4 || "Grand Resort",
    sub: s.sub4 || "Master collection stay"
  }
];

export default function TravelingPartySelector({ guestCount, onGuestCountChange, dict }: TravelingPartySelectorProps) {
  const s = dict?.page?.builder?.traveling_party || {};
  const v = s.vehicles || {};
  const st = s.stays || {};
  
  const vehicleTiers = VEHICLE_TIERS(v);
  const stayTiers = STAY_TIERS(st);
  
  const vehicle = vehicleTiers.find(t => guestCount <= t.max) || vehicleTiers[vehicleTiers.length - 1];
  const stay = stayTiers.find(t => guestCount <= t.max) || stayTiers[stayTiers.length - 1];
  const rooms = Math.ceil(guestCount / 2);

  return (
    
      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 shadow-2xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
        <div className="flex items-center justify-center gap-6 sm:gap-16 relative z-10">
          <button 
            type="button"
            onClick={() => onGuestCountChange(Math.max(1, guestCount - 1))}
            className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-white hover:border-emerald-500 hover:text-emerald-500 hover:shadow-lg transition-all active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
          </button>
          
          <div className="text-center min-w-[100px] sm:min-w-[160px]">
            <span key={guestCount} className="inline-block text-6xl sm:text-9xl font-black text-slate-900 tabular-nums leading-none animate-in zoom-in duration-500 tracking-tighter">
              {guestCount}
            </span>
            <p className="text-[9px] sm:text-xs font-black text-slate-300 uppercase tracking-[0.3em] mt-1 sm:mt-3">{s.pax || "Travelers"}</p>
          </div>

          <button 
            type="button"
            onClick={() => onGuestCountChange(Math.min(50, guestCount + 1))}
            className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-white hover:border-emerald-500 hover:text-emerald-500 hover:shadow-lg transition-all active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5v14"/></svg>
          </button>
        </div>

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-10 border-t border-slate-50 grid grid-cols-2 gap-3 sm:gap-6 relative z-10">
          {/* Dynamic Stay Card */}
          <div className="p-3 sm:p-6 bg-slate-50/50 rounded-2xl sm:rounded-[2rem] border border-slate-50 transition-all flex flex-col gap-2 sm:gap-4 group hover:bg-white hover:shadow-xl hover:shadow-slate-100 h-full">
            <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-500 transition-transform group-hover:scale-110 duration-500">
              <div key={stay.name} className="animate-in zoom-in duration-500 w-6 h-6 sm:w-10 sm:h-10">
                {stay.icon}
              </div>
            </div>
            <div>
              <p className="text-[8px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">{s.stay_label || "Stay Type"}</p>
              <h4 key={stay.name} className="font-black text-slate-900 text-[10px] sm:text-base leading-tight animate-in fade-in transition-all">
                {stay.name}
              </h4>
              <p className="text-[7px] sm:text-[9px] font-medium text-slate-400 mt-0.5 uppercase tracking-wider block italic leading-none">
                {rooms} {rooms === 1 ? (s.room || "Room") : (s.rooms || "Rooms")}
              </p>
            </div>
          </div>

          {/* Dynamic Vehicle Card */}
          <div className="p-3 sm:p-6 bg-slate-50/50 rounded-2xl sm:rounded-[2rem] border border-slate-50 transition-all flex flex-col gap-2 sm:gap-4 group hover:bg-white hover:shadow-xl hover:shadow-slate-100 h-full">
            <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-500 transition-transform group-hover:scale-110 duration-500">
              <div key={vehicle.name} className="animate-in zoom-in duration-500 w-6 h-6 sm:w-10 sm:h-10">
                {vehicle.icon}
              </div>
            </div>
            <div>
              <p className="text-[8px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">{s.transport_label || "Transport"}</p>
              <h4 key={vehicle.name} className="font-black text-slate-900 text-[10px] sm:text-base leading-tight animate-in fade-in transition-all">
                {vehicle.name}
              </h4>
              <p key={vehicle.sub} className="text-[7px] sm:text-[9px] font-medium text-slate-400 mt-0.5 uppercase tracking-wider animate-in fade-in duration-700 italic leading-none">
                {vehicle.sub}
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}
