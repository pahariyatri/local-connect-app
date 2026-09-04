"use client";

import React, { useEffect, useRef, useState } from "react";
import { Icon } from "../atoms/Icon";
import Image from "next/image";
import { searchLocations } from "@/services/catalogService";
import type { SelectedLocation } from "@/contexts/TripPlannerContext";

const ROTATING_LOCATIONS = [
  "Kasol",
  "Spiti Valley",
  "Old Manali",
  "Jibhi Valley",
  "Kheerganga",
  "Tosh Hamlet",
];

// Matches the debounce used by the Trip Builder's origin typeahead
// (DestinationSelector.tsx) — same backend endpoint, same convention.
const SEARCH_DEBOUNCE_MS = 250;

export default function HeroSection({ onSearch }: { onSearch: (query?: string) => void; onPlan?: () => void }) {
  const [query, setQuery] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<SelectedLocation[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeqRef = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_LOCATIONS.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const submitSearch = (value?: string) => {
    setOpen(false);
    onSearch(value ?? query);
  };

  // Real backend typeahead (GET /locations/search via searchLocations) —
  // same source the Trip Builder and vendor onboarding already use, so the
  // very first search box on the site isn't the one place still guessing.
  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = value.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setOpen(false);
      setSearching(false);
      return;
    }

    setOpen(true);
    setSearching(true);
    const seq = ++requestSeqRef.current;
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchLocations(q, 6);
        if (seq === requestSeqRef.current) setSuggestions(Array.isArray(results) ? results : []);
      } catch {
        if (seq === requestSeqRef.current) setSuggestions([]);
      } finally {
        if (seq === requestSeqRef.current) setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);
  };

  const pickSuggestion = (location: SelectedLocation) => {
    setQuery(location.name);
    setSuggestions([]);
    inputRef.current?.blur();
    submitSearch(location.name);
  };

  return (
    <section className="relative overflow-hidden bg-slate-950">
      {/* Ambient Keynote Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/20 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[250px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative min-h-[500px] sm:min-h-[560px] w-full flex items-center justify-center">
        {/* Background Mountain Photo */}
        <Image
          src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2000"
          alt="Himachal Pradesh Mountains"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-55 scale-105 transition-transform duration-1000"
        />
        {/* Vignette Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-slate-950" />

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center text-white flex flex-col items-center justify-center">
          {/* Subtle Live Badge */}
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] text-emerald-300 mb-5 shadow-2xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Direct Local Mountain Network
          </span>

          {/* Animated Hero Headline */}
          <h1 className="text-3xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.06] text-balance">
            Travel like a local in <br />
            <span className="inline-block mt-1">
              <span
                key={ROTATING_LOCATIONS[wordIndex]}
                className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent italic transition-all duration-500 animate-in fade-in slide-in-from-bottom-2 inline-block"
              >
                {ROTATING_LOCATIONS[wordIndex]}
              </span>
            </span>
          </h1>

          {/* Floating Glassmorphism Search Bar */}
          <div className="mt-8 w-full max-w-xl relative">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch();
              }}
              className="flex items-center justify-between gap-2 p-1.5 sm:p-2.5 rounded-full bg-white/95 backdrop-blur-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-white/60 hover:border-white transition-all duration-300"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0 pl-3 sm:pl-4">
                <Icon name="search" className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  autoComplete="off"
                  value={query}
                  onChange={(e) => handleChange(e.target.value)}
                  onFocus={() => query.trim().length >= 2 && setOpen(true)}
                  onBlur={() => {
                    // Let a suggestion's onMouseDown fire before the dropdown unmounts.
                    setTimeout(() => setOpen(false), 150);
                  }}
                  placeholder="Where to? (Kasol, Manali...)"
                  aria-label="Search destination"
                  className="w-full bg-transparent text-xs sm:text-base font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="h-10 sm:h-12 px-5 sm:px-8 rounded-full bg-slate-900 hover:bg-black text-white font-black text-xs sm:text-sm tracking-wide transition-all active:scale-95 shrink-0 shadow-xl flex items-center gap-1.5 sm:gap-2"
              >
                <span>Explore</span>
                <Icon name="arrow-right" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              </button>
            </form>

            {open && query.trim().length >= 2 && (
              <div
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto text-left"
                onMouseDown={(e) => e.preventDefault()}
              >
                {searching && suggestions.length === 0 ? (
                  <div className="px-5 py-4 text-sm text-slate-400">Searching…</div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => pickSuggestion(loc)}
                      className="w-full px-5 py-3 text-left hover:bg-slate-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl font-medium text-slate-700 border-b border-slate-100 last:border-0 flex items-center gap-2"
                    >
                      <Icon name="map-pin" className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      {loc.name}
                    </button>
                  ))
                ) : (
                  <div className="px-5 py-4 text-sm text-slate-400">No matching locations — try Explore instead.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
