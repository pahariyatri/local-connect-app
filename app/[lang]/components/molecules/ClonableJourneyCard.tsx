"use client";

import React from "react";
import Button from "../atoms/Button";
import LocalImage from "../atoms/Image";

interface JourneyBlueprint {
  id: string;
  name: string;
  author: string;
  image: string;
  duration: string;
  price: number;
  stops: string[];
}

interface ClonableJourneyCardProps {
  journey: JourneyBlueprint;
  onClone: (journey: JourneyBlueprint) => void;
}

const ClonableJourneyCard: React.FC<ClonableJourneyCardProps> = ({ journey, onClone }) => {
  return (
    <div className="premium-card group hover:scale-[1.02] transition-all duration-300">
      <div className="relative h-48 overflow-hidden rounded-t-3xl">
        <LocalImage 
          src={journey.image} 
          alt={journey.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase text-slate-900 shadow-sm flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          {journey.duration}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-500 transition-colors">
              {journey.name}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              By {journey.author}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {journey.stops.slice(0, 3).map((stop, i) => (
            <span key={i} className="text-[9px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
              {stop}
            </span>
          ))}
          {journey.stops.length > 3 && (
            <span className="text-[9px] font-black px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md">+ {journey.stops.length - 3}</span>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Value</p>
            <p className="text-xl font-black text-slate-900">₹{journey.price.toLocaleString()}</p>
          </div>
          <Button 
            size="small" 
            onClick={() => onClone(journey)}
            className="rounded-xl shadow-lg shadow-emerald-100 font-bold flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            Clone Trip
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClonableJourneyCard;
