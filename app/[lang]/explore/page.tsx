"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Icon } from "../components/atoms/Icon";
import LocalImage from "../components/atoms/Image";
import PublicFooter from "../components/organisms/PublicFooter";
import { searchDiscoveryServices, DiscoveryService } from "@/services/searchService";
import { sessionTracker } from "@/services/sessionService";

const LOCATIONS = ["All", "Manali", "Kasol", "Spiti", "Tirthan", "Dharamshala", "Shimla"];

const CATEGORIES = [
  { id: "all", label: "All Services" },
  { id: "stay", label: "Stays & Cabins", backendCategory: "stay" },
  { id: "transport", label: "Taxis & 4x4", backendCategory: "transport" },
  { id: "trek", label: "Treks & Guides", backendCategory: "trek" },
  { id: "food", label: "Food Trails", backendCategory: "restaurant" },
];

const DESTINATIONS = [
  {
    slug: "manali",
    label: "Manali",
    region: "Kullu District",
    elevation: "2,050 m",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800",
    description: "Gateway to Rohtang Pass, Solang Valley, and high-altitude adventures.",
  },
  {
    slug: "spiti",
    label: "Spiti Valley",
    region: "Lahaul & Spiti",
    elevation: "3,800 m",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800",
    description: "Cold mountain desert dotted with ancient gompas and fossil villages.",
  },
  {
    slug: "kasol",
    label: "Kasol & Tosh",
    region: "Parvati Valley",
    elevation: "1,640 m",
    image: "https://images.unsplash.com/photo-1571401835393-8c5f35328320?q=80&w=800",
    description: "Riverside stays and scenic trails in the heart of Parvati Valley.",
  },
  {
    slug: "dharamshala",
    label: "Dharamshala",
    region: "Kangra Valley",
    elevation: "1,457 m",
    image: "https://images.unsplash.com/photo-1653853572809-ea537274c7f5?q=80&w=800",
    description: "Serene pine hills and monasteries beneath the Dhauladhar range.",
  },
  {
    slug: "tirthan",
    label: "Tirthan Valley",
    region: "Great Himalayan NP",
    elevation: "1,600 m",
    image: "https://images.unsplash.com/photo-1518623001395-125242310d0c?q=80&w=800",
    description: "Quiet riverside wooden cottages and untouched forest trails.",
  },
  {
    slug: "shimla",
    label: "Shimla & Kinnaur",
    region: "Southern Himachal",
    elevation: "2,200 m",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800",
    description: "Colonial ridge walks and mountain roads heading into Kinnaur.",
  },
];

const CAT_LABEL_BY_SERVICE_CATEGORY: Record<string, string> = {
  hotel: "Stay",
  adventure: "Adventure",
  transport: "Taxi",
  restaurant: "Food",
  guide: "Guide",
  wellness: "Wellness",
};

const SEARCH_DEBOUNCE_MS = 300;

export default function ExplorePage() {
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [services, setServices] = useState<DiscoveryService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const locParam = params.get("location");
    const catParam = params.get("category");
    const qParam = params.get("q");
    if (locParam) setSelectedLocation(locParam);
    if (qParam) setSearchQuery(qParam);
    if (catParam) {
      const matched = CATEGORIES.find(
        (c) => c.id === catParam.toLowerCase() || c.backendCategory === catParam.toLowerCase()
      );
      if (matched) setActiveCategory(matched.id);
    }
  }, []);

  const hasActiveSearch = Boolean(searchQuery) || selectedLocation !== "All" || activeCategory !== "all";

  const runSearch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sessionId = await sessionTracker.getSessionId().catch(() => undefined);
      const activeCat = CATEGORIES.find((c) => c.id === activeCategory);
      const loc = selectedLocation === "All" ? undefined : selectedLocation;
      const result = await searchDiscoveryServices({
        q: searchQuery || undefined,
        location: loc,
        category: activeCat?.backendCategory,
        limit: 24,
        sessionId,
      });
      setServices(result.services);
      sessionTracker.track("search_performed", {
        metadata: {
          q: searchQuery || undefined,
          location: loc,
          category: activeCat?.backendCategory,
          resultsCount: result.services.length,
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

  useEffect(() => {
    if (!hasActiveSearch) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(runSearch, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, selectedLocation, activeCategory]);

  const filteredDestinations = DESTINATIONS.filter((d) => {
    const q = searchQuery.toLowerCase();
    return !q || d.label.toLowerCase().includes(q) || d.region.toLowerCase().includes(q);
  });

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedLocation("All");
    setActiveCategory("all");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        {/* ── UNIFIED MINIMAL FILTER CONSOLE ────────────────────────── */}
        <section className="sticky top-[var(--header-height,57px)] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/70 shadow-xs py-3 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto space-y-2.5">
            {/* Search Input Bar */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <input
                  id="explore-search"
                  type="text"
                  placeholder="Search Himachal valleys, stays, 4x4 drivers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-full bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-200/80 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="search" className="w-4 h-4" />
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {hasActiveSearch && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all shrink-0"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Single Unified Clean Filter Strip (Locations + Services) */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
              {LOCATIONS.map((loc) => {
                const isSelected = selectedLocation === loc;
                return (
                  <button
                    key={loc}
                    onClick={() => setSelectedLocation(loc)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                      isSelected
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                    }`}
                  >
                    {loc === "All" ? "✨ All Valleys" : loc}
                  </button>
                );
              })}

              <div className="h-4 w-px bg-slate-200 mx-1 shrink-0" />

              {CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
                const isCatSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`explore-cat-${cat.id}`}
                    onClick={() => setActiveCategory(isCatSelected ? "all" : cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 border ${
                      isCatSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CONTENT GRID ────────────────────────────────────────── */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {hasActiveSearch ? (
            /* ── RESULTS GRID ────────────────────────────────────── */
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {isLoading ? "Searching local operators..." : `${services.length} Verified Operators`}
                </p>
                {selectedLocation !== "All" && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    {selectedLocation}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="explore-results-grid">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden animate-pulse">
                      <div className="h-52 bg-slate-200" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-2/3" />
                        <div className="h-3 bg-slate-200 rounded w-1/3" />
                      </div>
                    </div>
                  ))
                ) : error ? (
                  <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8" data-testid="explore-error-state">
                    <p className="text-slate-900 text-sm font-black mb-1">{error}</p>
                    <p className="text-slate-400 text-xs mb-4">Please check your connection and try again.</p>
                    <button
                      onClick={runSearch}
                      className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-black uppercase tracking-wider transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : services.length === 0 ? (
                  <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8" data-testid="explore-zero-result">
                    <p className="text-slate-900 text-base font-black mb-1">
                      No direct listings for this filter.
                    </p>
                    <p className="text-slate-500 text-xs max-w-sm mx-auto mb-6 font-medium">
                      Try selecting another valley or let us match verified local hosts directly.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={clearSearch}
                        className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                      >
                        Reset Filters
                      </button>
                      <button
                        onClick={() => router.push(`/${lang}/builder`)}
                        className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition-colors"
                      >
                        Plan Custom Trip →
                      </button>
                    </div>
                  </div>
                ) : (
                  services.map((service) => (
                    <div
                      key={service.id}
                      data-testid="explore-result-card"
                      onClick={() => router.push(`/${lang}/vendor/${service.vendor.id}`)}
                      className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:border-slate-300 hover:shadow-xl cursor-pointer transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                        <LocalImage
                          src={service.thumbnail}
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span className="px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-slate-900 shadow-sm">
                            {CAT_LABEL_BY_SERVICE_CATEGORY[service.category] || service.category}
                          </span>
                          <span
                            data-testid="explore-result-location"
                            className="px-2.5 py-1 bg-slate-900/90 text-white backdrop-blur-md rounded-full text-[10px] font-bold shadow-sm"
                          >
                            {service.location.city}
                          </span>
                        </div>

                        {service.vendor.verified && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm">
                              Verified Host
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />
                        <div className="absolute bottom-3.5 left-4 right-4 text-white">
                          <h3 className="text-base font-black tracking-tight leading-tight truncate">
                            {service.vendor.publicName}
                          </h3>
                          {service.vendor.rating != null && (
                            <p className="text-[11px] font-bold text-amber-300 mt-0.5" data-testid="explore-result-rating">
                              ★ {service.vendor.rating.toFixed(1)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-4 flex items-center justify-between border-t border-slate-100 bg-white">
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-slate-900 truncate">{service.name}</p>
                          <p className="text-[11px] text-slate-400 font-medium">Direct local operator</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">From</p>
                          <p className="text-sm font-black text-slate-900">
                            {service.pricing.currency === "INR" ? "₹" : `${service.pricing.currency} `}
                            {Math.round(service.pricing.unitPrice).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* ── VISUAL-FIRST DESTINATION STORY CARDS ─────────────── */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Explore Himachal Valleys
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Tap a valley to browse native guides, 4x4 drivers, and homestays.
                  </p>
                </div>
              </div>

              {/* Visual Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredDestinations.map((dest) => (
                  <article
                    key={dest.slug}
                    id={`explore-card-${dest.slug}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedLocation(dest.label.split(" ")[0])}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedLocation(dest.label.split(" ")[0])}
                    className="group relative h-72 sm:h-80 rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 active:scale-[0.98]"
                  >
                    {/* Full-bleed Mountain Landscape */}
                    <img
                      src={dest.image}
                      alt={dest.label}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Cinematic Dark Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-slate-950/10 group-hover:via-slate-950/20 transition-all duration-300" />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-slate-900 shadow-sm">
                        {dest.region}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white shadow-sm">
                        {dest.elevation}
                      </span>
                    </div>

                    {/* Bottom Info Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-2xl font-black tracking-tight leading-tight group-hover:text-emerald-300 transition-colors">
                        {dest.label}
                      </h3>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-200">
                        <span className="font-medium text-slate-300">View local operators</span>
                        <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center transition-all">
                          →
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Seamless Bottom Action Card */}
              <div className="mt-8 rounded-3xl bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Custom Mountain Itinerary</span>
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
            </div>
          )}
        </main>
      </div>

      <PublicFooter />
    </div>
  );
}


