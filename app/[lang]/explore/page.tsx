"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Icon } from "../components/atoms/Icon";
import LocalImage from "../components/atoms/Image";
import PublicFooter from "../components/organisms/PublicFooter";
import { searchDiscoveryServices, DiscoveryService } from "@/services/searchService";
import { sessionTracker } from "@/services/sessionService";

import { getCategories } from "@/services/catalogService";

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
  const searchParams = useSearchParams();
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
  // Sourced from Next's useSearchParams(), not raw window.location.search:
  // during a client-side transition (e.g. router.push from the Hero search),
  // React renders this component with the new route's params available via
  // useSearchParams() before the actual browser URL/history commit catches
  // up, so window.location.search could still read the *previous* page's
  // query at the exact moment this lazy initializer runs.
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") || searchParams.get("location") || "");
  // useState's lazy initializer only runs on first mount. A client-side
  // navigation *into* this route from elsewhere in the app (Hero search,
  // browser back/forward) with a new ?q= doesn't necessarily remount this
  // component, so without this sync the query silently drops and results
  // never filter — see AUDIT: Hero search → Explore handoff lost the query.
  const lastSyncedParamRef = useRef(searchParams.get("q") || searchParams.get("location") || "");
  useEffect(() => {
    const paramQuery = searchParams.get("q") || searchParams.get("location") || "";
    if (paramQuery !== lastSyncedParamRef.current) {
      lastSyncedParamRef.current = paramQuery;
      setSearchQuery(paramQuery);
    }
  }, [searchParams]);
  const [services, setServices] = useState<DiscoveryService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

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

  // Category can only be resolved once the real `categories` list has loaded
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
      const qVal = searchQuery.trim() || undefined;
      const result = await searchDiscoveryServices({
        q: qVal,
        category: activeCat?.backendCategory,
        limit: 30,
        sessionId,
      });
      setServices(result.services || []);
      sessionTracker.track("search_performed", {
        metadata: {
          q: qVal,
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
  }, [searchQuery, activeCategory]);

  const hasActiveFilters = Boolean(searchQuery.trim()) || activeCategory !== "all";

  const clearSearch = () => {
    setSearchQuery("");
    setActiveCategory("all");
  };

  const getUnitLabel = (pricing: DiscoveryService["pricing"]) => {
    if (pricing.priceUnit) return `/${pricing.priceUnit}`;
    if (pricing.nights && pricing.nights > 1) return `/${pricing.nights} nights`;
    return "";
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    runSearch();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-900">
      <div>
        {/* ── STICKY DIRECT SEARCH BAR ────────────────── */}
        <section className="sticky top-[var(--header-height,57px)] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs py-3 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Top Search Form */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 sm:gap-3">
              <div className="relative flex-1">
                <input
                  id="explore-search"
                  type="text"
                  placeholder="Search location, stay, 4x4 driver, or trek (e.g. Kasol, Tosh, Manali)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-2xl bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-inner"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="search" className="w-4 h-4" />
                </span>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      if (debounceRef.current) clearTimeout(debounceRef.current);
                      setTimeout(runSearch, 0);
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs font-bold transition-all"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Dedicated Search Button */}
              <button
                type="submit"
                className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 shrink-0"
              >
                <Icon name="search" className="w-4 h-4" />
                <span>Search</span>
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all shrink-0"
                >
                  Reset
                </button>
              )}
            </form>
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

                    {/* Category & Location Badges + Verified Host Tag — one flex
                        row so the two sides split the available width instead of
                        each being independently `absolute`-positioned from an
                        opposite edge, which let a long category/location badge
                        overlap and clip the "Verified Host" pill on narrow
                        (mobile) cards. */}
                    <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="shrink-0 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-slate-900 shadow-sm">
                          {CAT_LABEL_BY_SERVICE_CATEGORY[service.category] || service.category}
                        </span>
                        <span
                          data-testid="explore-result-location"
                          className="min-w-0 px-2.5 py-1 bg-slate-900/90 text-white backdrop-blur-md rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1"
                        >
                          <Icon name="map-pin" className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                          <span className="truncate max-w-[15vw] sm:max-w-[80px]">{service.location.city}</span>
                        </span>
                      </div>

                      {/* Verified Host Tag */}
                      {service.vendor.verified && (
                        <span className="shrink-0 whitespace-nowrap px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm">
                          Verified Host
                        </span>
                      )}
                    </div>

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


