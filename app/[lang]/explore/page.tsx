"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Icon } from "../components/atoms/Icon";
import Button from "../components/atoms/Button";
import LocalImage from "../components/atoms/Image";
import PublicFooter from "../components/organisms/PublicFooter";
import BottomNavigation from "../components/organisms/BottomNavigation";
import { searchDiscoveryServices, DiscoveryService } from "@/services/searchService";
import { sessionTracker } from "@/services/sessionService";

// ─── Curated circuit/destination cards — shown until the traveler searches or
// picks one, at which point real inventory (services/searchService.ts →
// GET /api/v1/discovery/services) replaces this grid. ──────────────────────

const DESTINATIONS = [
  {
    slug: "manali", label: "Manali", region: "Himachal Pradesh", elevation: "2,050 m", season: "Oct – Jun",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800",
    tags: ["Trekking", "Camping", "Snow"], description: "Gateway to Rohtang Pass and the Kullu Valley.",
  },
  {
    slug: "spiti", label: "Spiti Valley", region: "Himachal Pradesh", elevation: "3,800 m", season: "Jun – Sep",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800",
    tags: ["Remote", "Monasteries", "Stargazing"], description: "A cold desert mountain valley unlike anywhere else.",
  },
  {
    slug: "kasol", label: "Kasol", region: "Parvati Valley", elevation: "1,640 m", season: "Year round",
    image: "https://images.unsplash.com/photo-1571401835393-8c5f35328320?q=80&w=800",
    tags: ["Trekking", "Café Culture", "River"], description: "The bohemian hub of the Parvati Valley.",
  },
  {
    slug: "dharamshala", label: "Dharamshala", region: "Himachal Pradesh", elevation: "1,457 m", season: "Year round",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800",
    tags: ["Buddhism", "Cricket", "Tea Gardens"], description: "Home of the Dalai Lama and Tibetan culture.",
  },
  {
    slug: "tirthan", label: "Tirthan Valley", region: "Himachal Pradesh", elevation: "1,600 m", season: "Mar – Nov",
    image: "https://images.unsplash.com/photo-1518623001395-125242310d0c?q=80&w=800",
    tags: ["Fishing", "Quiet Retreat", "GHN Park"], description: "Off-grid valley on the edge of a national park.",
  },
  {
    slug: "shimla", label: "Shimla", region: "Himachal Pradesh", elevation: "2,200 m", season: "Year round",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800",
    tags: ["Heritage", "Ridge Walks", "Colonial"], description: "The old summer capital, on the ridge.",
  },
];

const CATEGORIES: { id: string; label: string; icon: "compass" | "mountain" | "home" | "car" | "utensils"; backendCategory?: string }[] = [
  { id: "all", label: "All", icon: "compass" },
  { id: "trek", label: "Treks", icon: "mountain", backendCategory: "trek" },
  { id: "stay", label: "Homestays", icon: "home", backendCategory: "hotel" },
  { id: "transport", label: "Transport", icon: "car", backendCategory: "transport" },
  { id: "food", label: "Food Trails", icon: "utensils", backendCategory: "restaurant" },
];

const CAT_LABEL_BY_SERVICE_CATEGORY: Record<string, string> = {
  hotel: "Homestays", adventure: "Adventures", transport: "Transport", restaurant: "Food", guide: "Guides", wellness: "Wellness",
};

const SEARCH_DEBOUNCE_MS = 350;

export default function ExplorePage() {
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState<string | null>(null);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [services, setServices] = useState<DiscoveryService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Old ?location=/?category=/?q= links (including redirects from /discover)
  // land straight in results mode.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const locParam = params.get("location");
    const catParam = params.get("category");
    const qParam = params.get("q");
    if (locParam) setLocationQuery(locParam);
    if (qParam) setSearchQuery(qParam);
    if (catParam) {
      const matched = CATEGORIES.find((c) => c.id === catParam.toLowerCase() || c.backendCategory === catParam.toLowerCase());
      if (matched) setActiveCategory(matched.id);
    }
  }, []);

  const hasActiveSearch = Boolean(searchQuery) || Boolean(locationQuery) || activeCategory !== "all";

  const runSearch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sessionId = await sessionTracker.getSessionId().catch(() => undefined);
      const activeCat = CATEGORIES.find((c) => c.id === activeCategory);
      const result = await searchDiscoveryServices({
        q: searchQuery || undefined,
        location: locationQuery || undefined,
        category: activeCat?.backendCategory,
        limit: 24,
        sessionId,
      });
      setServices(result.services);
      sessionTracker.track("search_performed", {
        metadata: { q: searchQuery || undefined, location: locationQuery || undefined, category: activeCat?.backendCategory, resultsCount: result.services.length },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, locationQuery, activeCategory]);

  const filteredDestinations = DESTINATIONS.filter((d) => {
    const q = searchQuery.toLowerCase();
    return !q || d.label.toLowerCase().includes(q) || d.region.toLowerCase().includes(q) || d.tags.some((t) => t.toLowerCase().includes(q));
  });

  const clearSearch = () => {
    setSearchQuery("");
    setLocationQuery(null);
    setActiveCategory("all");
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* ── HERO STRIP ──────────────────────────────────────────────────────── */}
      <section className="bg-slate-950 text-white px-6 pt-12 pb-16">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-4">
            Verified Locals
          </p>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[0.9] mb-6">
            EXPLORE<br />
            <span className="italic text-slate-500">the hills.</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-10">
            Handpicked Pahari circuits with verified local services at every stop.
            No guesswork. No middlemen.
          </p>

          <div className="relative max-w-md">
            <input
              id="explore-search"
              type="text"
              placeholder="Search a place, stay, taxi, guide…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-5 py-4 rounded-2xl bg-white/10 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:bg-white/15 focus:border-emerald-500/50 transition-all"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon name="search" className="w-4 h-4" />
            </span>
          </div>
        </div>
      </section>

      {/* ── CATEGORY PILLS ──────────────────────────────────────────────────── */}
      <section className="sticky top-[var(--header-height,57px)] z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              id={`explore-cat-${cat.id}`}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all flex-shrink-0 ${
                activeCategory === cat.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              <Icon name={cat.icon} className="w-3 h-3" />
              {cat.label}
            </button>
          ))}
          {locationQuery && (
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 flex-shrink-0 ml-auto">
              {locationQuery}
              <button onClick={() => setLocationQuery(null)} aria-label="Clear location filter" className="text-emerald-500 hover:text-emerald-800">✕</button>
            </span>
          )}
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {hasActiveSearch ? (
          /* ── REAL SEARCH RESULTS ─────────────────────────────────────────── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="explore-results-grid">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="bg-slate-50 rounded-3xl border border-slate-200/40 overflow-hidden animate-pulse">
                  <div className="h-48 bg-slate-200" />
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-full text-center py-20" data-testid="explore-error-state">
                <p className="text-slate-700 text-sm font-bold mb-2">{error}</p>
                <p className="text-slate-400 text-xs mb-6">Check your connection and try again.</p>
                <button onClick={runSearch} className="text-emerald-600 text-xs font-black uppercase tracking-wider hover:text-emerald-700 transition-colors">
                  Try again
                </button>
              </div>
            ) : services.length === 0 ? (
              <div className="col-span-full text-center py-20" data-testid="explore-zero-result">
                <p className="text-slate-700 text-sm font-bold mb-1">
                  No verified locals for &ldquo;{[searchQuery, locationQuery].filter(Boolean).join(" · ")}&rdquo; yet.
                </p>
                <p className="text-slate-400 text-xs mb-6">We&apos;re still growing this circuit — try a nearby destination, or let us plan the route for you.</p>
                <div className="flex items-center justify-center gap-4">
                  <button onClick={clearSearch} className="text-slate-500 text-xs font-black uppercase tracking-wider hover:text-slate-700 transition-colors">
                    Clear search
                  </button>
                  <button onClick={() => router.push(`/${lang}/builder`)} className="text-emerald-600 text-xs font-black uppercase tracking-wider hover:text-emerald-700 transition-colors">
                    Plan a trip instead →
                  </button>
                </div>
              </div>
            ) : (
              services.map((service, i) => (
                <div
                  key={service.id}
                  data-testid="explore-result-card"
                  onClick={() => router.push(`/${lang}/vendor/${service.vendor.id}`)}
                  className="premium-card group overflow-hidden cursor-pointer active:scale-[0.98] transition-all animate-in fade-in slide-in-from-bottom-5 duration-700 border border-slate-100 rounded-3xl"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="h-48 w-full relative">
                    <LocalImage src={service.thumbnail} alt={service.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 flex gap-1.5">
                      <span className="px-3 py-1 bg-white/95 backdrop-blur rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm border border-slate-200/50">
                        {CAT_LABEL_BY_SERVICE_CATEGORY[service.category] || service.category}
                      </span>
                      <span data-testid="explore-result-location" className="px-3 py-1 bg-slate-900/95 text-white backdrop-blur rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1">
                        <Icon name="map-pin" className="w-2.5 h-2.5" />
                        {service.location.city}
                      </span>
                    </div>
                    {service.vendor.verified && (
                      <div className="absolute top-4 right-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg border border-white/20">✓</div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-black uppercase tracking-tight italic">{service.vendor.publicName}</h3>
                      {service.vendor.rating != null && (
                        <div className="flex items-center gap-2 mt-1" data-testid="explore-result-rating">
                          <span className="text-amber-400 text-[10px]">★</span>
                          <p className="text-[10px] font-bold text-white/70 uppercase">{service.vendor.rating.toFixed(1)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-5 flex justify-between items-center bg-white border-x border-b border-slate-50 rounded-b-3xl">
                    <p className="text-xs font-bold text-slate-500 truncate max-w-[55%]">{service.name}</p>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">starts from</p>
                      <p className="text-sm font-black text-slate-900 italic">
                        {service.pricing.currency === "INR" ? "₹" : `${service.pricing.currency} `}
                        {Math.round(service.pricing.unitPrice).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* ── CURATED DESTINATION BROWSE (default view) ──────────────────── */
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDestinations.map((dest, i) => (
                <article
                  key={dest.slug}
                  id={`explore-card-${dest.slug}`}
                  role="button"
                  tabIndex={0}
                  onMouseEnter={() => setHoveredSlug(dest.slug)}
                  onMouseLeave={() => setHoveredSlug(null)}
                  onClick={() => setLocationQuery(dest.label)}
                  onKeyDown={(e) => e.key === "Enter" && setLocationQuery(dest.label)}
                  className="group relative rounded-3xl overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={dest.image}
                      alt={dest.label}
                      loading="lazy"
                      className={`w-full h-full object-cover transition-transform duration-700 ${hoveredSlug === dest.slug ? "scale-110" : "scale-100"}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 rounded-full bg-white/95 text-[9px] font-black uppercase tracking-widest text-slate-900">{dest.region}</span>
                      <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur text-[9px] font-black uppercase tracking-widest text-white flex items-center gap-1">
                        <Icon name="map-pin" className="w-2.5 h-2.5" />
                        {dest.elevation}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h2 className="text-2xl font-black uppercase tracking-tight text-white leading-none">{dest.label}</h2>
                      <p className="text-white/60 text-[11px] mt-1">{dest.description}</p>
                    </div>
                  </div>
                  <div className="bg-white border border-t-0 border-slate-100 px-5 py-4 flex items-center justify-between">
                    <div className="flex gap-1.5 flex-wrap">
                      {dest.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-50 text-[9px] font-black text-slate-500 uppercase rounded-md">{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-emerald-500 flex-shrink-0 ml-3">
                      <span className="text-[10px] font-black uppercase tracking-wider">Explore</span>
                      <Icon name="arrow-right" className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredDestinations.length === 0 && (
              <div className="text-center py-20">
                <p className="text-slate-400 text-sm mb-2">No destinations match &ldquo;{searchQuery}&rdquo;</p>
                <p className="text-slate-300 text-xs mb-6">Try Manali, Kasol, Spiti, or a region name.</p>
                <button onClick={() => setSearchQuery("")} className="text-emerald-600 text-xs font-black uppercase tracking-wider hover:text-emerald-700 transition-colors">
                  Clear search
                </button>
              </div>
            )}

            <div className="mt-16 rounded-3xl bg-emerald-950 text-white p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400 mb-2">Can&apos;t decide?</p>
                <h3 className="text-2xl font-black tracking-tight">Let us plan it for you.</h3>
                <p className="text-emerald-300/60 text-sm mt-1">Tell us your dates and we&apos;ll match local vendors.</p>
              </div>
              <Button
                id="explore-plan-cta"
                onClick={() => router.push(`/${lang}/builder`)}
                variant="primary"
                iconRight={<Icon name="arrow-right" className="w-4 h-4" />}
                className="bg-white text-emerald-950 hover:bg-emerald-50 rounded-full px-8 py-3 text-xs font-black uppercase tracking-widest flex-shrink-0"
              >
                Plan My Trip
              </Button>
            </div>
          </>
        )}
      </main>

      <PublicFooter />
      <BottomNavigation />
    </div>
  );
}
