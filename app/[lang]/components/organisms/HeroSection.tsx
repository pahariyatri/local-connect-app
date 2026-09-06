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

export default function HeroSection({ onSearch }: { onSearch: (query?: string) => void; onPlan?: () => void }) {
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
    <section className="bg-white pt-6 sm:pt-10 pb-1 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Typography
          variant="h1"
          className="text-xl sm:text-2xl leading-snug mb-4"
          dangerouslySetInnerHTML={{ __html: hero?.title || "Travel like you know someone there." }}
        />

        <div className="relative">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch();
            }}
            className="flex items-center gap-2.5 pl-4 pr-2 py-2 rounded-2xl bg-slate-100 border border-slate-200 focus-within:border-emerald-500/50 focus-within:bg-white transition-colors"
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
                <div className="px-5 py-4 text-sm text-slate-400">No matching locations — try Explore instead.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
