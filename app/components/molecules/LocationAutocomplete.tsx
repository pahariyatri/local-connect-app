"use client";

import React, { useEffect, useRef, useState } from "react";
import { searchLocations } from "@/services/catalogService";

export interface SelectedLocationValue {
  id: number;
  name: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
}

interface LocationAutocompleteProps {
  label?: string;
  name: string;
  placeholder?: string;
  /** Free-text value shown in the field — kept even when it doesn't (yet) match a real selected location. */
  value: string;
  onChange: (text: string) => void;
  /** Fired only when the traveler/vendor picks a real suggestion — carries structured name/slug/lat/lng, not just a string. */
  onSelect: (location: SelectedLocationValue) => void;
  onBlur?: () => void;
  error?: string;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Dynamic location search backed by the real backend location system
 * (GET /locations/search — trigram-ranked, catalogService.ts:searchLocations),
 * replacing every static/hardcoded city-list dropdown in this app. Shared by
 * the Trip Builder's starting-point field and vendor onboarding's business
 * location field so there's exactly one implementation of this pattern, not
 * a duplicate per screen.
 */
export default function LocationAutocomplete({
  label,
  name,
  placeholder = "Search a city or place…",
  value,
  onChange,
  onSelect,
  onBlur,
  error,
  autoFocus = false,
  className = "",
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<SelectedLocationValue[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const query = value.trim();
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const thisRequestId = ++requestIdRef.current;
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchLocations(query, 8);
        // Ignore a stale response that resolved after a newer keystroke's request.
        if (requestIdRef.current !== thisRequestId) return;
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
  }, [value]);

  const pick = (loc: SelectedLocationValue) => {
    onChange(loc.name);
    onSelect(loc);
    setOpen(false);
    setSuggestions([]);
    inputRef.current?.blur();
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
        autoFocus={autoFocus}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Let a suggestion's onMouseDown fire before the dropdown unmounts.
          setTimeout(() => setOpen(false), 150);
          onBlur?.();
        }}
        className={`w-full h-14 px-5 rounded-2xl border-2 bg-slate-50/50 font-medium text-slate-900 transition-all outline-none ${
          error ? "border-red-300" : "border-slate-100/50 focus:border-slate-900 focus:bg-white"
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1.5 pl-2">{error}</p>}

      {open && value.trim().length >= 2 && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto"
          onMouseDown={(e) => e.preventDefault()}
        >
          {loading && suggestions.length === 0 ? (
            <div className="px-5 py-4 text-sm text-slate-400">Searching…</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((loc) => (
              <button
                key={loc.id}
                type="button"
                onClick={() => pick(loc)}
                className="w-full px-5 py-3 text-left hover:bg-slate-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl font-medium text-slate-700 border-b border-slate-100 last:border-0"
              >
                📍 {loc.name}
              </button>
            ))
          ) : (
            <div className="px-5 py-4 text-sm text-slate-400">No matching locations.</div>
          )}
        </div>
      )}
    </div>
  );
}
