"use client";

import React, { useState, useEffect, useRef } from "react";
import BottomNavigation from "../components/organisms/BottomNavigation";
import Button from "../components/atoms/Button";
import LocalImage from "../components/atoms/Image";
import Typography from "../components/atoms/Typography";
import { useParams, useRouter } from "next/navigation";
import Loading from "@/app/loading";
import { Icon } from "../components/atoms/Icon";
import PublicFooter from "../components/organisms/PublicFooter";
import { searchDiscoveryServices, DiscoveryService } from "@/services/searchService";
import { sessionTracker } from "@/services/sessionService";

const CATEGORY_TO_BACKEND: Record<string, string> = {
    Guides: "guide",
    Homestays: "hotel",
    Transport: "transport",
    Food: "restaurant",
    Wellness: "wellness",
    Adventures: "adventure",
};

const SEARCH_DEBOUNCE_MS = 350;

export default function DiscoverPage() {
    const { lang } = useParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("All");
    const [dict, setDict] = useState<any>(null);
    const [services, setServices] = useState<DiscoveryService[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const categories = ["All", "Guides", "Homestays", "Transport", "Food", "Wellness", "Adventures"];

    useEffect(() => {
        const loadDict = async () => {
            const d = await import(`@/dictionaries/${lang}.json`);
            setDict(d.default);
        };
        loadDict();
    }, [lang]);

    useEffect(() => {
        if (typeof window !== "undefined" && dict) {
            const params = new URLSearchParams(window.location.search);
            const catParam = params.get("category");
            const locParam = params.get("location");
            const qParam = params.get("q");
            if (catParam) {
                const matched = categories.find(c => c.toLowerCase() === catParam.toLowerCase());
                if (matched) setActiveTab(matched);
            }
            if (locParam) setSelectedLocation(locParam);
            if (qParam) setSearchQuery(qParam);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dict]);

    // Real search against the backend discovery API. No client-side location
    // guessing: the backend matches against real Address records.
    const runSearch = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const sessionId = await sessionTracker.getSessionId().catch(() => undefined);
            const result = await searchDiscoveryServices({
                q: searchQuery || undefined,
                location: selectedLocation !== "All" ? selectedLocation : undefined,
                category: activeTab !== "All" ? CATEGORY_TO_BACKEND[activeTab] : undefined,
                limit: 24,
                sessionId,
            });
            setServices(result.services);
            sessionTracker.track("search_performed", {
                metadata: {
                    q: searchQuery || undefined,
                    location: selectedLocation !== "All" ? selectedLocation : undefined,
                    category: activeTab !== "All" ? activeTab : undefined,
                    resultsCount: result.services.length,
                },
            });
        } catch (err) {
            console.error("Discovery search failed:", err);
            // Never substitute fake inventory on failure — show a real,
            // recoverable error state instead.
            setServices([]);
            setError("We couldn't load local services right now.");
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced so typing "Kasol" doesn't fire a request per keystroke.
    useEffect(() => {
        if (!dict) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(runSearch, SEARCH_DEBOUNCE_MS);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dict, searchQuery, selectedLocation, activeTab]);

    if (!dict) return <Loading />;

    const discover = dict.page.discover;
    const catLabels: Record<string, string> = {
        "All": discover.categories.all ?? "All",
        "Guides": "Guides",
        "Homestays": "Homestays",
        "Transport": "Transport",
        "Food": "Food Tours",
        "Wellness": "Wellness",
        "Adventures": "Adventures"
    };

    const hasActiveSearch = Boolean(searchQuery) || selectedLocation !== "All" || activeTab !== "All";
    const searchedFor = [searchQuery, selectedLocation !== "All" ? selectedLocation : null, activeTab !== "All" ? activeTab : null]
        .filter(Boolean)
        .join(" · ");

    const clearSearch = () => {
        setSearchQuery("");
        setSelectedLocation("All");
        setActiveTab("All");
    };

    const retry = () => { runSearch(); };

    return (
        <div className="min-h-screen bg-white pb-32">
            {/* ── DISCOVER HERO ─────────────────────────────────────────────── */}
            <section className="bg-slate-900 text-white py-16 px-6">
              <div className="max-w-6xl mx-auto">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400 mb-3">Verified Locals</p>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none mb-4">
                  Discover<br /><span className="italic text-slate-400">local services.</span>
                </h1>
                <p className="text-slate-400 text-sm max-w-sm leading-relaxed">{discover.header.subtitle}</p>
              </div>
            </section>

            <main className="max-w-6xl mx-auto px-6 pt-8">
                {/* 🔍 Search */}
                <div className="mb-12 relative max-w-xl mx-auto">
                    <input
                        id="discover-search"
                        type="text"
                        placeholder="Search a place, stay, taxi, guide…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 rounded-3xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-900 focus:bg-white focus:shadow-2xl focus:shadow-slate-100/50 transition-all placeholder:text-slate-400"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Icon name="search" className="w-4 h-4" />
                    </span>
                </div>

                {/* 📋 Service Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, idx) => (
                            <div key={idx} className="bg-slate-50 rounded-3xl border border-slate-200/40 overflow-hidden animate-pulse">
                                <div className="h-48 bg-slate-200" />
                                <div className="p-6 space-y-4">
                                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                                </div>
                            </div>
                        ))
                    ) : error ? (
                        <div className="col-span-full text-center py-20" data-testid="discover-error-state">
                            <p className="text-slate-700 text-sm font-bold mb-2">{error}</p>
                            <p className="text-slate-400 text-xs mb-6">Check your connection and try again.</p>
                            <button
                              onClick={retry}
                              className="text-emerald-600 text-xs font-black uppercase tracking-wider hover:text-emerald-700 transition-colors"
                            >
                              Try again
                            </button>
                        </div>
                    ) : services.length === 0 ? (
                        <div className="col-span-full text-center py-20" data-testid="discover-zero-result">
                            {hasActiveSearch ? (
                                <>
                                    <p className="text-slate-700 text-sm font-bold mb-1">
                                        No verified locals for &ldquo;{searchedFor}&rdquo; yet.
                                    </p>
                                    <p className="text-slate-400 text-xs mb-6">We&apos;re still growing this circuit — try a nearby destination, or let us plan the route for you.</p>
                                    <div className="flex items-center justify-center gap-4">
                                        <button
                                          onClick={clearSearch}
                                          className="text-slate-500 text-xs font-black uppercase tracking-wider hover:text-slate-700 transition-colors"
                                        >
                                          Clear search
                                        </button>
                                        <button
                                          onClick={() => router.push(`/${lang}/builder`)}
                                          className="text-emerald-600 text-xs font-black uppercase tracking-wider hover:text-emerald-700 transition-colors"
                                        >
                                          Plan a trip instead →
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <p className="text-slate-400 text-sm">No local services published yet.</p>
                            )}
                        </div>
                    ) : (
                        services.map((service, i) => (
                            <div
                                key={service.id}
                                data-testid="discover-result-card"
                                onClick={() => router.push(`/${lang}/vendor/${service.vendor.id}`)}
                                className="premium-card group overflow-hidden cursor-pointer active:scale-[0.98] transition-all animate-in fade-in slide-in-from-bottom-5 duration-700 border border-slate-100 rounded-3xl"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="h-48 w-full relative">
                                    <LocalImage src={service.thumbnail} alt={service.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-4 left-4 flex gap-1.5">
                                        <span className="px-3 py-1 bg-white/95 backdrop-blur rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm border border-slate-200/50">
                                            {catLabels[service.category] || service.category}
                                        </span>
                                        <span data-testid="discover-result-location" className="px-3 py-1 bg-slate-900/95 text-white backdrop-blur rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                            {service.location.city}
                                        </span>
                                    </div>
                                    {service.vendor.verified && (
                                        <div className="absolute top-4 right-4">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg border border-white/20">
                                                ✓
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                        <h3 className="text-xl font-black uppercase tracking-tight italic">{service.vendor.publicName}</h3>
                                        {/* Real trustScore only — hidden entirely when the vendor has no
                                            rating, rather than showing an invented number. */}
                                        {service.vendor.rating != null && (
                                            <div className="flex items-center gap-2 mt-1" data-testid="discover-result-rating">
                                                <span className="text-amber-400 text-[10px]">★</span>
                                                <p className="text-[10px] font-bold text-white/70 uppercase">
                                                    {service.vendor.rating.toFixed(1)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-5 flex justify-between items-center bg-white border-x border-b border-slate-50 rounded-b-3xl">
                                    <p className="text-xs font-bold text-slate-500 truncate max-w-[55%]">{service.name}</p>
                                    <div className="text-right">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{discover.vendor_card?.starts_from ?? "starts from"}</p>
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

                {/* 🏔️ Join as Partner */}
                <div className="mt-16 p-10 rounded-[3rem] bg-indigo-950 text-white flex flex-col items-center text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
                    <div className="w-16 h-16 rounded-[2rem] bg-white/10 flex items-center justify-center text-3xl mb-6 relative z-10">🤝</div>
                    <Typography variant="h3" className="text-lg font-black text-white uppercase tracking-tight mb-2 relative z-10 italic">{discover.partner_cta.title}</Typography>
                    <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-8 relative z-10">{discover.partner_cta.subtitle}</p>
                    <Button
                        onClick={() => router.push(`/${lang}/vendor/onboarding`)}
                        className="w-full h-14 bg-white text-indigo-950 rounded-2xl text-[10px] font-black uppercase tracking-widest relative z-10 hover:scale-105 active:scale-95 transition-all shadow-xl"
                    >
                        {discover.partner_cta.cta}
                    </Button>
                </div>
            </main>

            <PublicFooter />
            <BottomNavigation />
        </div>
    );
}
