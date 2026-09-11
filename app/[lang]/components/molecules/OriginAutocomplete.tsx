"use client";

import React, { useEffect, useRef, useState } from "react";
import { searchOriginCities, resolveOriginCity, type OriginSuggestion } from "@/services/catalogService";
import type { SelectedLocation } from "@/contexts/TripPlannerContext";

interface OriginAutocompleteProps {
  label?: string;
  name: string;
  placeholder?: string;
  /** Free-text value shown in the field — kept even when it doesn't (yet) match a real suggestion. */
  value: string;
  onChange: (text: string) => void;
  /** Fired when the traveler picks a real Google Places suggestion — carries structured name/placeId/lat/lng. */
  onSelect: (location: SelectedLocation) => void;
  onBlur?: () => void;
  className?: string;
}

/**
 * India-wide origin-city typeahead. The `locations` table only covers
 * Himachal destinations, so origin needs a different, external data source
 * — this talks to the backend's Google Places proxy (never exposes the API
 * key client-side). When no key is configured server-side, the backend
 * returns `provider: 'none'` and this component quietly drops the dropdown
 * chrome, becoming a plain honestly-labeled free-text field instead of a
 * spinner that can never resolve — no fabricated suggestions either way.
 */
export default function OriginAutocomplete({
  label,
  name,
  placeholder = "Starting city (e.g. Delhi)",
  value,
  onChange,
  onSelect,
  onBlur,
  className = "",
}: OriginAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<OriginSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [providerEnabled, setProviderEnabled] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  // Groups one search-to-selection session for Google's per-session Places
  // billing; reset after a pick so the next search starts a fresh session.
  const sessionTokenRef = useRef<string>(
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const query = value.trim();
    if (query.length < 2 || !providerEnabled) {
      setSuggestions([]);
      return;
    }
    const thisRequestId = ++requestIdRef.current;
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { provider, results } = await searchOriginCities(query, sessionTokenRef.current);
        if (requestIdRef.current !== thisRequestId) return;
        if (provider === "none") {
          setProviderEnabled(false);
          setSuggestions([]);
          return;
        }
        setSuggestions(Array.isArray(results) ? results : []);
      } catch {
        if (requestIdRef.current === thisRequestId) setSuggestions([]);
      } finally {
        if (requestIdRef.current === thisRequestId) setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, providerEnabled]);

  const pick = async (suggestion: OriginSuggestion) => {
    onChange(suggestion.description);
    setOpen(false);
    setSuggestions([]);
    inputRef.current?.blur();

    const resolved = await resolveOriginCity(suggestion.placeId, sessionTokenRef.current);
    // Start a fresh billing session for the next search regardless of resolve outcome.
    sessionTokenRef.current = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

    onSelect({
      id: suggestion.placeId,
      name: resolved?.name ?? suggestion.description,
      slug: null,
      latitude: resolved?.latitude ?? null,
      longitude: resolved?.longitude ?? null,
      source: "external",
    });
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2">
          {label}
        </label>
      )}
      <input
        ref={inputRef}
        id={name}
        name={name}
        type="text"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          if (providerEnabled) setOpen(true);
        }}
        onFocus={() => {
          if (providerEnabled) setOpen(true);
        }}
        onBlur={() => {
          setTimeout(() => setOpen(false), 150);
          onBlur?.();
        }}
        className="w-full h-16 pl-14 pr-6 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-slate-900 transition-all font-black text-base sm:text-lg uppercase tracking-tight italic"
      />
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>
      </div>

      {providerEnabled && open && value.trim().length >= 2 && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto"
          onMouseDown={(e) => e.preventDefault()}
        >
          {loading && suggestions.length === 0 ? (
            <div className="px-6 py-3 text-sm text-slate-400 font-medium">Searching…</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((s) => (
              <button
                key={s.placeId}
                type="button"
                onClick={() => pick(s)}
                className="w-full px-6 py-3 text-left hover:bg-slate-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl font-medium text-slate-700 border-b border-slate-100 last:border-0"
              >
                📍 {s.description}
              </button>
            ))
          ) : (
            <div className="px-6 py-3 text-sm text-slate-400 font-medium">No matching cities.</div>
          )}
        </div>
      )}
    </div>
  );
}
