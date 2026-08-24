"use client";

import React, { useState } from "react";
import { Icon } from "../atoms/Icon";
import Image from "next/image";
import { useLocalizationContext } from "@/contexts/LocalizationContext";

const POPULAR_DESTINATIONS = ["Manali", "Kasol", "Spiti", "Tirthan", "Dharamshala", "Shimla"];

export default function HeroSection({ onSearch, onPlan }: { onSearch: (query?: string) => void; onPlan?: () => void }) {
  const [query, setQuery] = useState("");
  const { dict } = useLocalizationContext();
  const hero = dict?.page?.home?.hero || {};

  const submitSearch = (value?: string) => {
    onSearch(value ?? query);
  };

  return (
    <section className="relative overflow-hidden">
      <div className="relative min-h-[520px] sm:min-h-[580px] w-full flex items-center justify-center">
        {/* Background Mountain Photo */}
        <Image
          src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1800"
          alt="Himachal Pradesh Mountain Landscape"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Subtle dark gradient overlay for crystal clear typography */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/65 to-slate-950/90" />

        <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center text-white flex flex-col items-center justify-center">
          {/* One hero hook: traveler need, not platform pitch */}
          <h1
            className="text-3xl sm:text-5xl md:text-6xl font-black leading-[1.08] tracking-tight text-balance"
            dangerouslySetInnerHTML={{
              __html: hero.title || 'Travel like you know <span class="text-emerald-400">someone there.</span>',
            }}
          />

          {/* Minimalist Approach: No long paragraphs. Just a powerful statement and immediate action. */}

          {/* Sleek Floating Search Console */}
          <div className="mt-8 w-full max-w-xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch();
              }}
              className="group flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-full bg-white/95 backdrop-blur-xl shadow-2xl border border-white/30 hover:border-emerald-400/50 hover:shadow-emerald-500/15 transition-all duration-300"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0 pl-3 sm:pl-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 group-focus-within:bg-emerald-50 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Icon name="search" className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={hero.search_placeholder || "Where are you going? (Kasol, Manali, Tosh...)"}
                  aria-label="Search destination"
                  className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="h-11 sm:h-12 px-5 sm:px-7 rounded-full bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-600/25 transition-all active:scale-95 shrink-0 flex items-center gap-2"
              >
                <span>{hero.search_cta || "Search"}</span>
              </button>
            </form>
          </div>

          {/* Minimal Quick Destination Links */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
            <span className="text-[11px] font-bold text-slate-400">{dict?.page?.common?.actions?.popular || "Popular:"}</span>
            {POPULAR_DESTINATIONS.map((dest) => (
              <button
                key={dest}
                type="button"
                onClick={() => submitSearch(dest)}
                className="px-2.5 py-0.5 rounded-full text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                {dest}
              </button>
            ))}
          </div>

          {/* Secondary path for the full-trip persona — one primary action (search), one quiet secondary */}
          {onPlan && (
            <button
              type="button"
              onClick={onPlan}
              className="mt-4 text-xs font-bold text-slate-300 hover:text-white underline underline-offset-4 decoration-slate-500 hover:decoration-emerald-400 transition-colors"
            >
              {hero.plan_cta || "Or build a whole trip"} →
            </button>
          )}
        </div>
      </div>
    </section>
  );
}


