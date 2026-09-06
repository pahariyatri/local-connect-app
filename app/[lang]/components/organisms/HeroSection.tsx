"use client";

import React, { useEffect, useRef, useState } from "react";
import { Icon } from "../atoms/Icon";
import Typography from "../atoms/Typography";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import { searchLocations } from "@/services/catalogService";
import type { SelectedLocation } from "@/contexts/TripPlannerContext";

// Matches the debounce used by the Trip Builder's origin typeahead
// (DestinationSelector.tsx) — same backend endpoint, same convention.
const SEARCH_DEBOUNCE_MS = 250;

export default function HeroSection({ onSearch, onPlan }: { onSearch: (query?: string) => void; onPlan?: () => void }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SelectedLocation[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const { dict } = useLocalizationContext();
  const hero = dict?.page?.home?.hero;
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeqRef = useRef(0);

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
    <section className="relative min-h-[86vh] sm:min-h-[92vh] w-full flex items-center bg-slate-950">
      {/* No photo — an illustrated mountain-range graphic instead: multi-tone
          gradient sky + three layered silhouette ridges (near-black at the
          base, lighter further back, real atmospheric-perspective logic)
          plus drifting glows. Distinct from both the earlier flat-gradient
          pass and the photo pass — a graphic, not a backdrop. overflow-hidden
          lives on THIS wrapper only, not the section, so the search
          suggestions dropdown below isn't clipped by it on any viewport. */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 gradient-mountain-dusk" />
        {/* Slow diagonal light sweep — a quiet "alive" moment on load rather
            than a static gradient sitting still. */}
        <div className="absolute inset-0 hero-shimmer" aria-hidden="true" />
        <div className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-emerald-500/20 blur-[120px] animate-drift-slow" />
        <div className="absolute -bottom-32 -left-16 w-[24rem] h-[24rem] rounded-full bg-emerald-400/10 blur-[110px] animate-drift-slow" style={{ animationDelay: "-4s", animationDirection: "reverse" }} />

        {/* Three layered ridgelines — furthest back is lightest/tallest,
            nearest is darkest/lowest, the way real distant mountains fade. */}
        <svg className="absolute bottom-0 left-0 w-full h-32 sm:h-52 text-emerald-800/30" viewBox="0 0 1440 260" preserveAspectRatio="none" aria-hidden="true">
          <path fill="currentColor" d="M0,260 L0,160 L160,90 L320,150 L480,70 L640,140 L800,60 L960,130 L1120,75 L1280,145 L1440,90 L1440,260 Z" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-full h-28 sm:h-44 text-emerald-950/55" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true">
          <path fill="currentColor" d="M0,220 L0,140 L140,70 L260,120 L380,50 L520,110 L660,40 L780,100 L920,55 L1040,115 L1180,30 L1300,90 L1440,60 L1440,220 Z" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-full h-20 sm:h-32 text-emerald-950/90" viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden="true">
          <path fill="currentColor" d="M0,160 L0,100 L200,45 L400,90 L600,25 L800,80 L1000,35 L1200,85 L1440,50 L1440,160 Z" />
        </svg>

        {/* A few drifting mist particles rising from the ridgeline, on top
            of the mountains — small, soft, and quiet; a hint of life in the
            air, not confetti. */}
        {[
          { left: "12%", size: 10, delay: "0s", dur: "9s" },
          { left: "28%", size: 6, delay: "2.5s", dur: "11s" },
          { left: "62%", size: 8, delay: "1s", dur: "10s" },
          { left: "80%", size: 5, delay: "4s", dur: "8s" },
        ].map((p, i) => (
          <span
            key={i}
            className="hero-particle absolute bottom-16 sm:bottom-24 rounded-full bg-white/40 blur-[2px]"
            style={{ left: p.left, width: p.size, height: p.size, animationDelay: p.delay, animationDuration: p.dur }}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="relative w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl mx-auto px-5 sm:px-6 py-10 sm:py-0 text-center">
        <Typography
          variant="h1"
          className="text-white text-[2.35rem] leading-[1.12] sm:text-6xl sm:leading-[1.06] lg:text-7xl mb-8 sm:mb-10 tracking-tight drop-shadow-sm animate-slideUp"
          dangerouslySetInnerHTML={{ __html: hero?.title || 'Discover Himachal <span class="text-emerald-400">like a local.</span>' }}
        />

        <div className="relative text-left animate-slideUp" style={{ animationDelay: "0.1s", opacity: 0 }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch();
            }}
            className="flex items-center gap-2.5 pl-4 pr-2 py-2 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/40 shadow-2xl focus-within:bg-white transition-colors"
          >
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
              placeholder={hero?.search_placeholder || "Where are you going?"}
              aria-label="Search destination"
              className="w-full bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none py-1"
            />
            <button
              type="submit"
              aria-label="Search"
              title="Search"
              className="w-11 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shrink-0 transition-colors active:scale-95"
            >
              <Icon name="search" className="h-4 w-4" />
            </button>
          </form>

          {open && query.trim().length >= 2 && (
            <div
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto"
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
                <div className="px-5 py-4 text-sm text-slate-400">No matching locations. Try Explore instead.</div>
              )}
            </div>
          )}
        </div>

        {onPlan && (
          <button
            type="button"
            onClick={onPlan}
            className="group/plan mt-5 inline-flex items-center gap-1.5 text-white/90 hover:text-white text-sm font-bold animate-slideUp"
            style={{ animationDelay: "0.2s", opacity: 0 }}
          >
            <span className="relative pb-0.5">
              {hero?.plan_cta || "Or build a whole trip"}
              <span className="absolute left-0 -bottom-px h-px w-full bg-current origin-left scale-x-0 group-hover/plan:scale-x-100 transition-transform duration-300" />
            </span>
            <Icon name="arrow-right" className="w-3.5 h-3.5 transition-transform duration-300 group-hover/plan:translate-x-1" />
          </button>
        )}

      </div>
    </section>
  );
}
