"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "../atoms/Icon";
import Image from "next/image";

const ROTATING_LOCATIONS = [
  "Kasol",
  "Spiti Valley",
  "Old Manali",
  "Jibhi Valley",
  "Kheerganga",
  "Tosh Hamlet",
];

const POPULAR_SUGGESTIONS = [
  "Kasol Homestays",
  "Spiti 4x4 Cab",
  "Kheerganga Trek",
  "Jibhi Cabins",
];

export default function HeroSection({ onSearch }: { onSearch: (query?: string) => void; onPlan?: () => void }) {
  const [query, setQuery] = useState("");
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_LOCATIONS.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  const submitSearch = (value?: string) => {
    onSearch(value || query);
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
          <div className="mt-8 w-full max-w-xl space-y-3">
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
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Where are you going?"
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

            {/* Quick Suggestion Pills */}
            <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px] font-bold text-slate-300">
              <span className="text-slate-400 text-[10px] font-extrabold uppercase mr-1 hidden sm:inline">Try:</span>
              {POPULAR_SUGGESTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setQuery(tag);
                    submitSearch(tag);
                  }}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-emerald-500/20 hover:text-emerald-300 border border-white/15 transition-all shrink-0 active:scale-95 text-[10px] sm:text-xs"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Social Trust Micro-Chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-6 text-[10px] sm:text-[11px] font-bold text-slate-300">
            <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-xs">
              <Icon name="check" className="w-3 h-3 text-emerald-400" /> 0% Middleman Fee
            </span>
            <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-xs">
              <Icon name="check" className="w-3 h-3 text-emerald-400" /> 100% Escrow Safeguard
            </span>
            <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-xs">
              <Icon name="users" className="w-3 h-3 text-emerald-400" /> Direct Mountain Hosts
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}


