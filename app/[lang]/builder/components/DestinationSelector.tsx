"use client";

import React from "react";
import LocalImage from "@/app/[lang]/components/atoms/Image";
import { useTripPlanner, type SelectedLocation } from "@/contexts/TripPlannerContext";
import OriginAutocomplete from "@/app/[lang]/components/molecules/OriginAutocomplete";

interface Destination {
  id: string;
  name: string;
  image: string;
  tags?: string;
}

interface DestinationSelectorProps {
  selectedDestinations: string[];
  onSelectionChange: (destinations: string[]) => void;
  originPoint?: string;
  onRouteInfoChange: (origin: string) => void;
  maxSelections?: number;
  dict: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const DESTINATIONS: Destination[] = [
  {
    id: "manali",
    name: "Manali-Circuit",
    image: "https://images.unsplash.com/photo-1712388430474-ace0c16051e2?q=80&w=600",
    tags: "Manali, Kasol & Sissu",
  },
  {
    id: "shimla",
    name: "Shimla & Heritage",
    image: "https://images.unsplash.com/photo-1651319485646-f0f30e46b761?q=80&w=600",
    tags: "Shimla, Kufri, Chail & Kasuli",
  },
  {
    id: "kasol",
    name: "Kasol",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=600",
    tags: "Kasol, Malana & Parvati Valley",
  },
  {
    id: "dharamshala",
    name: "Dharamshala & McLeod Ganj",
    image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=600",
    tags: "Dharamshala, McLeod Ganj & Kangra Valley  ",
  },
  {
    id: "tirthan",
    name: "Tirthan & Jibhi",
    image: "https://images.unsplash.com/photo-1589702413183-ca141958b7c5?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    tags: "Tirthan, jibhi, JaloriPass & Shoja ",
  },
  {
    id: "spiti",
    name: "Spiti Valley Circuit",
    image: "https://plus.unsplash.com/premium_photo-1661878621391-a53da02f1098?q=80&w=600",
    tags: "Spiti Valley, Kalpa, Nako, Tabo & Kaza",
  },
];

export default function DestinationSelector({
  selectedDestinations,
  onSelectionChange,
  originPoint = "",
  onRouteInfoChange,
  maxSelections = 3,
  dict
}: DestinationSelectorProps) {
  const b = dict?.page?.builder?.step1 || {};
  const { setSelectedCities, selectedDestinationCities, selectedOriginCity } = useTripPlanner();

  // Origin is a real India-wide city (outside Himachal, generally) — backed
  // by the external Google Places proxy (OriginAutocomplete), not the
  // Himachal-only `locations` table used for destinations below.
  const selectOrigin = (location: SelectedLocation) => {
    setSelectedCities(location.name, selectedDestinationCities, location);
  };

  const handleToggle = (destinationId: string) => {
    let newDestinations: string[];
    if (selectedDestinations.includes(destinationId)) {
      newDestinations = selectedDestinations.filter((id) => id !== destinationId);
    } else {
      if (selectedDestinations.length < maxSelections) {
        newDestinations = [...selectedDestinations, destinationId];
      } else {
        return;
      }
    }
    onSelectionChange(newDestinations);
    setSelectedCities(selectedOriginCity || originPoint, newDestinations);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="space-y-4">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 mb-2 block italic">
            {b.route_title || "Starting Point"}
        </label>
        <OriginAutocomplete
          name="builder-origin"
          placeholder={b.origin_placeholder || "Starting city (e.g. Delhi)"}
          value={originPoint}
          onChange={onRouteInfoChange}
          onSelect={selectOrigin}
        />
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-900 leading-tight">
              {b.explore_title || "Destinations to Explore"}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {(b.explore_subtitle || "Pick up to {max} stops on your way").replace("{max}", maxSelections.toString())}
            </p>
          </div>
          <div className="px-3 py-1 bg-emerald-100 rounded-full">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
              {selectedDestinations.length}/{maxSelections}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {DESTINATIONS.map((destination) => {
            const isSelected = selectedDestinations.includes(destination.id);
            const isDisabled = !isSelected && selectedDestinations.length >= maxSelections;

            return (
              <button
                key={destination.id}
                onClick={() => handleToggle(destination.id)}
                disabled={isDisabled}
                className={`
                  relative h-44 rounded-[2rem] overflow-hidden transition-all duration-300
                  ${isSelected ? "ring-4 ring-emerald-500 ring-offset-2 scale-[0.98] shadow-xl shadow-emerald-100" : "ring-2 ring-slate-100 hover:ring-slate-200"}
                  ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer active:scale-95 shadow-lg shadow-slate-200/50"}
                `}
              >
                <LocalImage src={destination.image} alt={destination.name} className="w-full h-full object-cover" loading={destination.id === "manali" ? "eager" : "lazy"} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <h4 className="text-white font-black text-lg leading-tight uppercase tracking-tight">
                    {destination.name}
                  </h4>
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mt-0.5">
                    {destination.tags}
                  </p>
                </div>
                {isSelected && (
                  <div className="absolute top-4 right-4 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg animate-scale-in">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
