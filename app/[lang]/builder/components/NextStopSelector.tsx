"use client";

import React, { useState, useEffect, useMemo } from "react";
import { discoverServices, buildDiscoveryParams } from "@/services/vendorService";

// Category keys align with PackageBuilderStep / DayItinerary.
const STOP_CATEGORIES: { key: string; icon: string; pref: string }[] = [
  { key: "Stay", icon: "🏨", pref: "stay" },
  { key: "Taxi", icon: "🚗", pref: "travel" },
  { key: "Adventure", icon: "🏔️", pref: "activity" },
  { key: "Meals", icon: "🍛", pref: "food" },
];

function titleCase(s: string): string {
  return (s || "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function vendorTypeString(s: any): string {
  const types = s?.vendor?.types;
  if (Array.isArray(types) && types.length) return types.join(" ");
  return s?.vendor?.type || s?.subcategory?.parent?.name || "";
}

function categoryOf(s: any): string {
  const t = vendorTypeString(s).toLowerCase();
  if (t.includes("hotel") || t.includes("homestay") || t.includes("accommodation") || t.includes("stay")) return "Stay";
  if (t.includes("taxi") || t.includes("cab") || t.includes("transport") || t.includes("travel")) return "Taxi";
  if (t.includes("food") || t.includes("restaurant") || t.includes("meal") || t.includes("cafe") || t.includes("dining")) return "Meals";
  return "Adventure";
}

interface StopPlace {
  key: string; // normalized lowercase key
  name: string; // display name
  total: number;
  categories: Record<string, number>;
}

interface RouteStopsSelectorProps {
  origin: string;
  destinations: string[]; // destination ids from step 1
  routeStops: string[];
  onRouteStopsChange: (stops: string[]) => void;
  startDate: string | null;
  endDate: string | null;
  guestCount: number;
  dict: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function NextStopSelector({
  origin,
  destinations,
  routeStops,
  onRouteStopsChange,
  startDate,
  endDate,
  guestCount,
  dict,
}: RouteStopsSelectorProps) {
  const b = dict?.page?.builder?.next_stop || {};
  const [places, setPlaces] = useState<StopPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  // Reordering the chosen stops is how the traveller sets the day-wise position of
  // each stop along the corridor: index 0 is the first stop after the start, and so on.
  const moveStop = (from: number, to: number) => {
    if (to < 0 || to >= routeStops.length || from === to) return;
    const next = [...routeStops];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onRouteStopsChange(next);
  };

  const removeStop = (index: number) => {
    onRouteStopsChange(routeStops.filter((_, i) => i !== index));
  };

  const handleDrop = (target: number) => {
    if (dragIndex !== null) moveStop(dragIndex, target);
    setDragIndex(null);
    setOverIndex(null);
  };

  const ordinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // Pull the live regional catalogue and group services by the town they sit in.
  // We intentionally don't constrain by destination/category here so that the
  // *intermediate* towns on the corridor surface, then we drop the origin and the
  // final destinations, leaving the genuine "where do you want to stop" options.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = buildDiscoveryParams({
      destinations: [],
      servicePreferences: [],
      guestCount: guestCount ?? 2,
      startDate: startDate ?? undefined,
      endDate: endDate ?? undefined,
    });
    const excluded = new Set<string>([
      origin.trim().toLowerCase(),
      ...destinations.map((d) => d.trim().toLowerCase()),
    ]);
    discoverServices(params)
      .then((response: any) => {
        if (cancelled) return;
        const services = response?.data ?? response?.services ?? [];
        const byCity: Record<string, StopPlace> = {};
        services.forEach((s: any) => {
          const addr = (s.addresses || []).find((a: any) => a?.city) || (s.addresses || [])[0];
          const cityRaw = addr?.city;
          if (!cityRaw) return;
          const key = String(cityRaw).trim().toLowerCase();
          if (!key || excluded.has(key)) return; // origin & destinations aren't "stops"
          if (!byCity[key]) {
            byCity[key] = { key, name: titleCase(cityRaw), total: 0, categories: { Stay: 0, Taxi: 0, Adventure: 0, Meals: 0 } };
          }
          byCity[key].total += 1;
          byCity[key].categories[categoryOf(s)] += 1;
        });
        const list = Object.values(byCity).sort((a, b) => b.total - a.total);
        setPlaces(list);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Route stop discovery failed:", err);
          setPlaces([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [destinations.join(","), origin, guestCount, startDate, endDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const isSelected = (key: string) => routeStops.some((s) => s.toLowerCase() === key);

  const toggle = (place: StopPlace) => {
    if (isSelected(place.key)) {
      onRouteStopsChange(routeStops.filter((s) => s.toLowerCase() !== place.key));
    } else {
      onRouteStopsChange([...routeStops, place.name]);
    }
  };

  const destinationLabels = useMemo(() => destinations.map(titleCase), [destinations]);
  const selectedCount = routeStops.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Route ribbon */}
      <div className="rounded-[1.75rem] bg-slate-900 text-white p-4 sm:p-5 overflow-hidden relative">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-emerald-500/20 rounded-full blur-[50px] pointer-events-none" />
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">{b.route_label || "Your Route"}</p>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white text-slate-900 text-xs font-black">{origin || "Start"}</span>
          {routeStops.map((s) => (
            <React.Fragment key={s}>
              <span className="text-slate-500">·</span>
              <span className="flex-shrink-0 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-black">{s}</span>
            </React.Fragment>
          ))}
          {destinationLabels.map((d) => (
            <React.Fragment key={d}>
              <span className="text-slate-500">→</span>
              <span className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-black">{d}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Day-wise order editor: drag on desktop, arrows on mobile */}
      {selectedCount > 0 && (
        <div className="rounded-[1.75rem] border-2 border-slate-100 bg-white p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">{b.order_title || "Arrange your stops"}</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{b.order_subtitle || "Drag to set the order, or use the arrows. The top stop comes first on your trip."}</p>
            </div>
          </div>

          <ol className="space-y-2">
            {/* Fixed start */}
            <li className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-slate-50">
              <span className="w-7 h-7 flex-shrink-0 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">A</span>
              <span className="font-black text-slate-900 text-sm truncate">{origin || "Start"}</span>
              <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-slate-300">{b.start_label || "Start"}</span>
            </li>

            {routeStops.map((stop, i) => (
              <li
                key={stop}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragEnter={() => setOverIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(i)}
                onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
                className={`flex items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-2xl border-2 transition-all ${
                  dragIndex === i
                    ? "border-emerald-500 bg-emerald-50 opacity-60"
                    : overIndex === i && dragIndex !== null
                    ? "border-emerald-300 bg-emerald-50/50"
                    : "border-slate-100 bg-white hover:border-slate-200"
                }`}
              >
                <span className="text-slate-300 cursor-grab active:cursor-grabbing select-none touch-none px-0.5" aria-hidden="true">⠿</span>
                <span className="w-7 h-7 flex-shrink-0 rounded-full bg-emerald-500 text-white text-[11px] font-black flex items-center justify-center">{i + 1}</span>
                <div className="min-w-0">
                  <p className="font-black text-slate-900 text-sm truncate">{stop}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{ordinal(i + 1)} {b.stop_word || "stop"}</p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveStop(i, i - 1)}
                    disabled={i === 0}
                    aria-label={b.move_up || "Move up"}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-25 disabled:hover:bg-transparent transition-all"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStop(i, i + 1)}
                    disabled={i === routeStops.length - 1}
                    aria-label={b.move_down || "Move down"}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-25 disabled:hover:bg-transparent transition-all"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStop(i)}
                    aria-label={b.remove || "Remove stop"}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </div>
              </li>
            ))}

            {/* Fixed destination */}
            <li className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-slate-50">
              <span className="w-7 h-7 flex-shrink-0 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">B</span>
              <span className="font-black text-slate-900 text-sm truncate">{destinationLabels.join(", ") || "Destination"}</span>
              <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-slate-300">{b.end_label || "Final"}</span>
            </li>
          </ol>
        </div>
      )}

      {/* Section heading + live counter */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">{b.stops_title || "Places on your route"}</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">{b.stops_subtitle || "Tap the towns you'd like to stop at and explore."}</p>
        </div>
        {selectedCount > 0 && (
          <button
            onClick={() => onRouteStopsChange([])}
            className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors"
          >
            {selectedCount} {b.selected || "selected"} · {b.clear || "Clear"}
          </button>
        )}
      </div>

      {/* Loading skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-[1.75rem] bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : places.length === 0 ? (
        <div className="text-center py-12 rounded-[1.75rem] border-2 border-dashed border-slate-200 bg-slate-50/50">
          <div className="text-3xl mb-2">🗺️</div>
          <p className="text-slate-500 font-bold text-sm">{b.empty_title || "No stops found on this route yet."}</p>
          <p className="text-slate-400 text-xs mt-1">{b.empty_sub || "You can continue and we'll build your plan from your destinations."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {places.map((place) => {
            const selected = isSelected(place.key);
            const activeCats = STOP_CATEGORIES.filter((c) => place.categories[c.key] > 0);
            return (
              <button
                key={place.key}
                type="button"
                onClick={() => toggle(place)}
                className={`group relative text-left rounded-[1.75rem] border-2 p-4 sm:p-5 transition-all active:scale-[0.99] ${
                  selected
                    ? "border-emerald-500 bg-emerald-50/60 shadow-lg shadow-emerald-100"
                    : "border-slate-100 bg-white hover:border-slate-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📍</span>
                      <h4 className="font-black text-slate-900 text-base truncate">{place.name}</h4>
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 mt-1 ml-1">
                      {place.total} {place.total === 1 ? (b.service || "service") : (b.services || "services")} {b.available_here || "available"}
                    </p>
                  </div>
                  <div
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      selected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-300 group-hover:bg-slate-200"
                    }`}
                  >
                    {selected ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {activeCats.map((c) => (
                    <span
                      key={c.key}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${
                        selected ? "bg-white text-slate-600" : "bg-slate-50 text-slate-500"
                      }`}
                    >
                      <span>{c.icon}</span>
                      <span>{place.categories[c.key]}</span>
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Skip hint */}
      {!loading && (
        <p className="text-center text-[11px] font-medium text-slate-400">
          {b.skip_hint || "Optional. You can skip and go straight to building your plan."}
        </p>
      )}
    </div>
  );
}
