"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Icon } from "../components/atoms/Icon";
import LocalImage from "../components/atoms/Image";
import PublicFooter from "../components/organisms/PublicFooter";
import { searchDiscoveryServices, DiscoveryService } from "@/services/searchService";
import { sessionTracker } from "@/services/sessionService";

import { getCategories, searchLocations } from "@/services/catalogService";

const DEFAULT_CATEGORIES = [
  { id: "all", label: "All Services", backendCategory: undefined },
  { id: "stay", label: "🏡 Stays & Cabins", backendCategory: "stay" },
  { id: "transport", label: "🚙 Taxis & 4x4", backendCategory: "transport" },
  { id: "trek", label: "🥾 Treks & Guides", backendCategory: "trek" },
  { id: "food", label: "🍲 Food Trails", backendCategory: "restaurant" },
];

const CAT_LABEL_BY_SERVICE_CATEGORY: Record<string, string> = {
  hotel: "Stay",
  adventure: "Adventure",
  transport: "Taxi & 4x4",
  restaurant: "Food Trail",
  guide: "Guide",
  wellness: "Wellness",
  stay: "Stay",
  trek: "Trek & Guide",
};

const SEARCH_DEBOUNCE_MS = 300;

// Read once, synchronously, so the very first render (and the very first
// search it triggers) already has the real filter — see the useState
// initializers below for why this matters.
function readUrlParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

export default function ExplorePage() {
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState("all");
  // Lazy initializers (not a post-mount effect): searchQuery/selectedLocation
  // must be correct on the FIRST render, because the mount effect below fires
  // its first runSearch() immediately using whatever these are at that
  // moment. They used to start as ""/"All" and get corrected only once a
  // separate effect (gated on `categories`, i.e. after a real network
  // round-trip) read the URL — so a fresh navigation to e.g. /explore?q=Kasol
  // would first run an unfiltered, platform-wide search (mixing in every
  // location) and only later replace it with the real Kasol-filtered one.
  // Reading the URL here instead means the first search is already correct.
  const [searchQuery, setSearchQuery] = useState(() => readUrlParam("q") || "");
  const [selectedLocation, setSelectedLocation] = useState(() => readUrlParam("location") || "All");
  const [services, setServices] = useState<DiscoveryService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Location typeahead — suggestions from the indexed /locations/search
  // endpoint, separate (shorter) debounce from the main result-search below
  // so the dropdown feels instant while the actual service search still
  // waits for the user to pause typing.
  const [locationSuggestions, setLocationSuggestions] = useState<{ id: number; name: string; slug: string; type: string }[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const locationSuggestDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const query = selectedLocation === "All" ? "" : selectedLocation.trim();
    if (locationSuggestDebounceRef.current) clearTimeout(locationSuggestDebounceRef.current);
    if (query.length < 2) {
      setLocationSuggestions([]);
      return;
    }
    locationSuggestDebounceRef.current = setTimeout(async () => {
      try {
        const results = await searchLocations(query, 6);
        setLocationSuggestions(Array.isArray(results) ? results : []);
      } catch {
        setLocationSuggestions([]);
      }
    }, 200);
    return () => {
      if (locationSuggestDebounceRef.current) clearTimeout(locationSuggestDebounceRef.current);
    };
  }, [selectedLocation]);

  const pickLocation = (loc: { name: string; slug: string }) => {
    setSelectedLocation(loc.slug || loc.name);
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
  };

  // Fetch dynamic categories from backend on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const catsRes = await getCategories().catch(() => null);
        if (cancelled) return;
        if (Array.isArray(catsRes) && catsRes.length > 0) {
          const apiCats = catsRes.map((c: any) => ({
            id: c.name?.toLowerCase().replace(/\s+/g, "-") || String(c.id),
            label: c.name,
            backendCategory: c.name?.toLowerCase(),
          }));
          setCategories([{ id: "all", label: "All Services", backendCategory: undefined }, ...apiCats.slice(0, 6)]);
        }
      } catch {
        // Fallbacks in place
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Category (unlike q/location above) can only be resolved once the real
  // `categories` list has loaded from the backend, since a URL token like
  // "trek" needs matching against real category ids/labels — so this stays
  // effect-based rather than a lazy initializer.
  useEffect(() => {
    const catParam = readUrlParam("category");
    if (!catParam) return;
    const matched = categories.find(
      (c) => c.id === catParam.toLowerCase() || c.backendCategory === catParam.toLowerCase()
    );
    if (matched) setActiveCategory(matched.id);
  }, [categories]);

  const runSearch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sessionId = await sessionTracker.getSessionId().catch(() => undefined);
      const activeCat = categories.find((c) => c.id === activeCategory);
      const loc = selectedLocation === "All" ? undefined : selectedLocation;
      const result = await searchDiscoveryServices({
        q: searchQuery.trim() || undefined,
        location: loc,
        category: activeCat?.backendCategory,
        limit: 30,
        sessionId,
      });
      setServices(result.services || []);
      sessionTracker.track("search_performed", {
        metadata: {
          q: searchQuery.trim() || undefined,
          location: loc,
          category: activeCat?.backendCategory,
          resultsCount: result.services?.length || 0,
        },
      });
    } catch (err) {
      console.error("Discovery search failed:", err);
      setServices([]);
      setError("We couldn't load local services right now.");
    } finally {
      setIsLoading(false);
    }
  };

  // Immediate fetch on mount and debounced fetch on search/filter changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      runSearch();
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(runSearch, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, selectedLocation, activeCategory]);

  const hasActiveFilters = Boolean(searchQuery.trim()) || selectedLocation !== "All" || activeCategory !== "all";

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedLocation("All");
    setActiveCategory("all");
  };

  const getUnitLabel = (pricing: DiscoveryService["pricing"]) => {
    if (pricing.priceUnit) return `/${pricing.priceUnit}`;
    if (pricing.nights && pricing.nights > 1) return `/${pricing.nights} nights`;
    return "";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-900">
      <div>
        {/* ── STICKY DIRECT SEARCH BAR ────────────────── */}
        <section className="sticky top-[var(--header-height,57px)] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs py-3 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Top Search Input Bar */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <input
                  id="explore-search"
                  type="text"
                  placeholder="Search Himachal valleys, stays, 4x4 drivers, guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-2xl bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-inner"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="search" className="w-4 h-4" />
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs font-bold transition-all"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="relative w-36 sm:w-52 shrink-0" ref={locationDropdownRef}>
                <input
                  id="explore-location"
                  type="text"
                  placeholder="Any location"
                  value={selectedLocation === "All" ? "" : selectedLocation}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSelectedLocation(v || "All");
                    setShowLocationSuggestions(true);
                  }}
                  onFocus={() => setShowLocationSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 150)}
                  className="w-full pl-9 pr-8 py-2.5 sm:py-3 rounded-2xl bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-inner"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="map-pin" className="w-4 h-4" />
                </span>
                {selectedLocation !== "All" && (
                  <button
                    onClick={() => {
                      setSelectedLocation("All");
                      setLocationSuggestions([]);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs font-bold transition-all"
                    aria-label="Clear location"
                  >
                    ✕
                  </button>
                )}

                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {locationSuggestions.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => pickLocation(loc)}
                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl border-b border-slate-100 last:border-0 flex items-center justify-between gap-2"
                      >
                        <span className="font-bold text-slate-800 text-xs sm:text-sm truncate">{loc.name}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 shrink-0">{loc.type?.replace('_', ' ')}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {(searchQuery || selectedLocation !== "All") && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="px-4 py-2.5 sm:py-3 rounded-2xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all shrink-0"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── DIRECT OPERATORS CARDS BODY ─────────────────────────── */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* ── CARDS GRID / STATES ───────────────────────────────── */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6" data-testid="explore-results-grid">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs animate-pulse"
                >
                  <div className="h-52 bg-slate-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                    <div className="pt-2 flex justify-between items-center">
                      <div className="h-4 bg-slate-200 rounded w-1/4" />
                      <div className="h-4 bg-slate-200 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div
              className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm"
              data-testid="explore-error-state"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                <Icon name="alert-circle" className="w-6 h-6 text-rose-500" />
              </div>
              <p className="text-slate-900 text-base font-black mb-1">{error}</p>
              <p className="text-slate-400 text-xs mb-6 font-medium">Please check your connection and try again.</p>
              <button
                onClick={runSearch}
                className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider transition-colors shadow-sm"
              >
                Try Again
              </button>
            </div>
          ) : services.length === 0 ? (
            <div
              className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm"
              data-testid="explore-zero-result"
            >
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
                <Icon name="search" className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-900 text-lg font-black mb-1">
                No direct listings found {searchQuery ? `for "${searchQuery}"` : ""}.
              </p>
              <p className="text-slate-500 text-xs max-w-md mx-auto mb-6 font-medium">
                Try searching another valley or build a custom route with our interactive itinerary planner.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    Reset Search
                  </button>
                )}
                <button
                  onClick={() => router.push(`/${lang}/builder`)}
                  className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition-colors shadow-md shadow-emerald-600/20"
                >
                  Plan a trip instead →
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6" data-testid="explore-results-grid">
              {services.map((service) => (
                <article
                  key={service.id}
                  data-testid="explore-result-card"
                  onClick={() => router.push(`/${lang}/vendor/${service.vendor.id}`)}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:border-slate-300 hover:shadow-xl cursor-pointer transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Card Media Header */}
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                    <LocalImage
                      src={service.thumbnail}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Category & Location Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-slate-900 shadow-sm">
                        {CAT_LABEL_BY_SERVICE_CATEGORY[service.category] || service.category}
                      </span>
                      <span
                        data-testid="explore-result-location"
                        className="px-2.5 py-1 bg-slate-900/90 text-white backdrop-blur-md rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1"
                      >
                        <Icon name="map-pin" className="w-2.5 h-2.5 text-emerald-400" />
                        <span>{service.location.city}</span>
                      </span>
                    </div>

                    {/* Verified Host Tag */}
                    {service.vendor.verified && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm">
                          Verified Host
                        </span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />

                    {/* Host Name & Rating Overlay */}
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="text-base font-black tracking-tight leading-tight truncate group-hover:text-emerald-300 transition-colors">
                        {service.vendor.publicName}
                      </h3>
                      {service.vendor.rating != null && (
                        <p className="text-[11px] font-bold text-amber-300 mt-0.5" data-testid="explore-result-rating">
                          ★ {service.vendor.rating.toFixed(1)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Details & Pricing */}
                  <div className="p-4 sm:p-5 flex items-center justify-between border-t border-slate-100 bg-white">
                    <div className="min-w-0 pr-3">
                      <p className="text-xs font-bold text-slate-900 truncate leading-snug">{service.name}</p>
                      <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                        {service.shortDescription || "Direct local operator"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">From</p>
                      <p className="text-sm sm:text-base font-black text-slate-900 leading-none mt-0.5">
                        {service.pricing.currency === "INR" ? "₹" : `${service.pricing.currency} `}
                        {Math.round(service.pricing.unitPrice).toLocaleString("en-IN")}
                        <span className="text-[10px] font-medium text-slate-400 ml-0.5">
                          {getUnitLabel(service.pricing)}
                        </span>
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Seamless Bottom Trip Planner Banner */}
          <div className="mt-10 rounded-3xl bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                Custom Mountain Itinerary
              </span>
              <h3 className="text-lg sm:text-xl font-black tracking-tight">Planning a multi-stop journey?</h3>
              <p className="text-slate-300 text-xs font-medium max-w-lg">
                Build your custom route and book verified local transit and stays seamlessly.
              </p>
            </div>
            <button
              id="explore-plan-cta"
              onClick={() => router.push(`/${lang}/builder`)}
              className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-[0.15em] transition-all shadow-lg active:scale-95 shrink-0"
            >
              Build My Route →
            </button>
          </div>
        </main>
      </div>

      <PublicFooter />
    </div>
  );
}


