"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import { useTripPlanner } from "@/contexts/TripPlannerContext";
import { useNotification } from "@/contexts/NotificationContext";
import { useTripStore } from "@/store/useTripStore";
import { prepTracker } from "@/lib/prepTracker";
import { formatINRWithSymbol } from "@/utils/price";
import { useAuth } from "@/contexts/AuthContext";
import Header from "../components/organisms/Header";

import Typography from "../components/atoms/Typography";
import DayItinerary from "./components/DayItinerary";
import { Vendor } from "./components/VendorSelectionCard";
import DiscoveryDrawer from "../components/molecules/DiscoveryDrawer";
import SupportContact from "../components/molecules/SupportContact";

import {
  discoverServices,
  buildDiscoveryParams,
  mapServicesToVendors,
  EMPTY_VENDORS,
} from "@/services/vendorService";
import { getPackage } from "@/services/packageService";
import { toLocalDateStringSafe } from "@/lib/travelDate";

function parsePlanFromUrl(searchParams: URLSearchParams) {
  try {
    const destinations = JSON.parse(searchParams.get("destinations") || "[]") as string[];
    const servicePreferences = JSON.parse(searchParams.get("servicePreferences") || "[]") as string[];
    return {
      origin: searchParams.get("origin") || "",
      destinations,
      startDate: searchParams.get("startDate") || null,
      endDate: searchParams.get("endDate") || null,
      guestCount: parseInt(searchParams.get("guestCount") || "2", 10),
      servicePreferences,
    };
  } catch {
    return null;
  }
}

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang: pathLang } = useParams();
  const { dict, lang } = useLocalizationContext();
  const { showNotification } = useNotification();
  const tripContext = useTripPlanner();
  const tripStore = useTripStore();
  const { user } = useAuth();


  const packageIdParam = searchParams.get("packageId");
  const [packageData, setPackageData] = useState<any>(null);
  const [packageLoading, setPackageLoading] = useState(false);
  const [discoveryState, setDiscoveryState] = useState<{ isOpen: boolean; category: string; day: number }>({ isOpen: false, category: "", day: 0 });
  const [liveVendors, setLiveVendors] = useState<Record<string, Vendor[]>>(EMPTY_VENDORS);
  const [selections, setSelections] = useState<Record<number, Record<string, string | null>>>({});
  const [isBooking, setIsBooking] = useState(false);
  const [suggestedNearby, setSuggestedNearby] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(true);

  // Plan: URL params (from "See Plan") → Zustand store → context. Ensures we have plan as soon as we land.
  const urlPlan = useMemo(() => parsePlanFromUrl(searchParams), [searchParams]);
  const plan = useMemo(() => {
    if (urlPlan && urlPlan.destinations?.length) return urlPlan;
    if (tripStore.hasValidPlan())
      return {
        origin: tripStore.origin,
        destinations: tripStore.destinations,
        startDate: tripStore.startDate,
        endDate: tripStore.endDate,
        guestCount: tripStore.guestCount,
        servicePreferences: tripStore.servicePreferences,
      };
    return {
      origin: tripContext.originPoint || "",
      destinations: tripContext.destinations || [],
      startDate: tripContext.startDate || null,
      endDate: tripContext.endDate || null,
      guestCount: tripContext.guestCount ?? 2,
      servicePreferences: tripContext.servicePreferences || [],
    };
  }, [urlPlan, tripStore.origin, tripStore.destinations, tripStore.startDate, tripStore.endDate, tripStore.guestCount, tripStore.servicePreferences, tripContext.originPoint, tripContext.destinations, tripContext.startDate, tripContext.endDate, tripContext.guestCount, tripContext.servicePreferences]);

  const { destinations: planDest, startDate: planStart, endDate: planEnd, guestCount: planGuests, servicePreferences: planPrefs } = plan;
  const originPoint = packageData?.origin ?? plan.origin ?? tripContext.originPoint ?? "";
  const destinations = packageData?.destinations ?? planDest ?? [];
  const startDate = packageData?.startDate ?? planStart;
  const endDate = packageData?.endDate ?? planEnd;
  const guestCount = packageData?.guestCount ?? planGuests ?? 2;
  const servicePreferences = packageData?.servicePreferences ?? planPrefs ?? [];

  // Stable key for this plan so we fetch once per plan and don't double-call
  const planKey = useMemo(
    () =>
      destinations?.length
        ? [destinations.join(","), guestCount, startDate ?? "", endDate ?? "", (servicePreferences || []).join(",")].join("|")
        : "",
    [destinations, guestCount, startDate, endDate, servicePreferences],
  );

  // Track share_opened if arriving via share link
  useEffect(() => {
    if (searchParams.get('ref') === 'share') {
      prepTracker.shareOpened(destinations);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 📡 Load package by ID (read-only mode from builder) — no discover
  useEffect(() => {
    const id = packageIdParam ? parseInt(packageIdParam, 10) : null;
    if (!id) return;

    let cancelled = false;
    setPackageLoading(true);
    getPackage(id)
      .then((pkg: any) => {
        if (cancelled) return;
        setPackageData(pkg);
        if (pkg.destinations) {
          prepTracker.resultsViewed(Object.keys(pkg.vendorDetails || {}).length, pkg.destinations);
        }
        setServicesLoading(false);
        setPackageLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to load package:", err);
          setPackageLoading(false);
          setServicesLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [packageIdParam]);

  // 📡 Discover (only when no packageId — legacy flow)
  useEffect(() => {
    if (packageIdParam || !planKey) {
      if (!packageIdParam) setServicesLoading(false);
      return;
    }

    let cancelled = false;
    setServicesLoading(true);
    setSuggestedNearby(false);

    const params = buildDiscoveryParams({
      destinations,
      servicePreferences: servicePreferences || [],
      guestCount: guestCount ?? 2,
      startDate: startDate ?? undefined,
      endDate: endDate ?? undefined,
    });

    discoverServices(params)
      .then((response: any) => {
        if (cancelled) return;
        const services = response?.data ?? response?.services ?? [];
        const isSuggested = !!response?.meta?.suggestedNearby;
        if (services.length > 0) {
          setLiveVendors(mapServicesToVendors(services));
          setSuggestedNearby(isSuggested);
          prepTracker.resultsViewed(services.length, destinations);
        }
      })
      .catch((err) => {
        if (!cancelled) console.error("Failed to fetch services:", err);
      })
      .finally(() => {
        if (!cancelled) setServicesLoading(false);
      });

    return () => { cancelled = true; };
  }, [planKey, packageIdParam, destinations, guestCount, servicePreferences, startDate, endDate]);

  const handleShare = async () => {
    if (!dict?.page?.results?.sharing) return;

    const shareUrl = new URL(window.location.origin);
    shareUrl.pathname = `/${lang}/results`;
    shareUrl.searchParams.set('ref', 'share');
    if (packageIdParam) {
      shareUrl.searchParams.set('packageId', packageIdParam);
    } else {
      // If no package, we share the plan via URL params
      shareUrl.searchParams.set('origin', originPoint);
      shareUrl.searchParams.set('destinations', JSON.stringify(destinations));
      // Local-date formatting, not toISOString(): a shared link must reproduce
      // the days the traveller actually picked, not the UTC day before them.
      shareUrl.searchParams.set('startDate', toLocalDateStringSafe(startDate));
      shareUrl.searchParams.set('endDate', toLocalDateStringSafe(endDate));
      shareUrl.searchParams.set('guestCount', String(guestCount));
      shareUrl.searchParams.set('servicePreferences', JSON.stringify(servicePreferences));
    }
    const shareUrlStr = shareUrl.toString();

    // Track the share event
    prepTracker.itineraryShared(destinations, shareUrlStr);

    const shareData = {
      title: dict.page.results.sharing.title || "My Himachal Road Trip",
      text: dict.page.results.sharing.text || "Check out this amazing journey!",
      url: shareUrlStr,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(shareUrlStr);
      showNotification(dict.page.results.sharing.success || "Link copied!", "success");
    }
  };

  // Dynamic days — from package or plan
  const itineraryDays = useMemo(() => {
    if (packageData?.selectedServices) {
      const days = Object.keys(packageData.selectedServices).map(Number).filter((d) => !isNaN(d)).sort((a, b) => a - b);
      return days.length > 0 ? days : [1];
    }
    if (!startDate || !endDate) return [1];
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return Array.from({ length: Math.max(1, Math.min(diffDays + 1, 14)) }, (_, i) => i + 1);
    } catch {
      return [1];
    }
  }, [packageData?.selectedServices, startDate, endDate]);

  // Build liveVendors from package vendorDetails when in package mode
  useEffect(() => {
    if (!packageData?.vendorDetails) return;
    const vd = packageData.vendorDetails as Record<string, { id: string; name: string; image: string; price: number; category: string; description?: string }>;
    const byCat: Record<string, Vendor[]> = { Stay: [], Taxi: [], Adventure: [], Meals: [] };
    Object.values(vd).forEach((v) => {
      const cat = v.category || "Stay";
      // No rating field exists on package vendorDetails — omit rather than
      // attach a fabricated number to a real vendor's card.
      if (byCat[cat]) byCat[cat].push({ ...v });
    });
    setLiveVendors(byCat);
  }, [packageData?.vendorDetails]);

  // Default selections — from package or discover
  useEffect(() => {
    if (packageData?.selectedServices) {
      const next: Record<number, Record<string, string | null>> = {};
      Object.entries(packageData.selectedServices).forEach(([dayStr, daySel]) => {
        const day = parseInt(dayStr, 10);
        if (isNaN(day)) return;
        next[day] = {};
        Object.entries(daySel || {}).forEach(([cat, sid]) => {
          next[day][cat] = sid != null ? String(sid) : null;
        });
      });
      setSelections(next);
      return;
    }

    const wantsStays = servicePreferences.length === 0 || servicePreferences.includes("stay");
    const wantsTaxi = servicePreferences.length === 0 || servicePreferences.includes("travel");
    const wantsAdventure = servicePreferences.length === 0 || servicePreferences.includes("activity");
    const wantsMeals = servicePreferences.length === 0 || servicePreferences.includes("food");

    const firstStay = liveVendors.Stay?.[0]?.id ?? null;
    const firstTaxi = liveVendors.Taxi?.[0]?.id ?? null;
    const firstAdventure = liveVendors.Adventure?.[0]?.id ?? null;
    const firstMeals = liveVendors.Meals?.[0]?.id ?? null;

    setSelections((prev) => {
      const next: Record<number, Record<string, string | null>> = {};
      itineraryDays.forEach((day) => {
        next[day] = {
          Stay: wantsStays ? (prev[day]?.Stay ?? firstStay) : null,
          Taxi: wantsTaxi ? (prev[day]?.Taxi ?? firstTaxi) : null,
          Adventure: wantsAdventure ? (prev[day]?.Adventure ?? firstAdventure) : null,
          Meals: wantsMeals ? (prev[day]?.Meals ?? firstMeals) : null,
        };
      });
      return next;
    });
  }, [packageData?.selectedServices, itineraryDays, servicePreferences, liveVendors]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVendorChange = (day: number, category: string, vendorId: string) => {
    // Track click
    const vendor = liveVendors[category]?.find(v => v.id === vendorId);
    prepTracker.serviceClicked(vendorId, vendorId, vendor?.name);

    setSelections(prev => ({
      ...prev,
      [day]: { ...prev[day], [category]: vendorId }
    }));
    const msg = dict?.page?.common?.notifications?.added
      ?.replace("{category}", category)
      ?.replace("{day}", day.toString()) || `${category} added to Day ${day}`;
    showNotification(msg, "success");
  };

  const handleRemove = (day: number, category: string) => {
    setSelections(prev => ({
      ...prev,
      [day]: { ...prev[day], [category]: null }
    }));
    setDiscoveryState({ isOpen: true, category, day });
    const msg = dict?.page?.common?.notifications?.removed?.replace("{category}", category) || `${category} removed.`;
    showNotification(msg, "info");
  };

  const handleDiscoverySelect = (vendorId: string) => {
    handleVendorChange(discoveryState.day, discoveryState.category, vendorId);
    setDiscoveryState({ ...discoveryState, isOpen: false });
  };

  const totalPrice = useMemo(() => {
    if (packageData?.totalPrice != null) return Number(packageData.totalPrice);
    let total = 0;
    Object.keys(selections).forEach(dayKey => {
      const day = parseInt(dayKey);
      Object.keys(selections[day] || {}).forEach(category => {
        const vendorId = selections[day][category];
        if (vendorId) {
          const vendorsInCategory = liveVendors[category] || [];
          const vendor = vendorsInCategory.find(v => v.id === vendorId);
          if (vendor) total += vendor.price;
        }
      });
    });
    return total;
  }, [packageData?.totalPrice, selections, liveVendors]);

  const handleBookNow = async () => {
    // 1. Ensure authenticated as a real user (not Guest)
    // We now rely on the 'user' object from useAuth() which is verified via HttpOnly cookies
    const isRealUser = !!(user && user.role !== 'Guest' && user.id);

    if (!isRealUser) {
      showNotification("Please login to proceed with the booking.", "info");
      const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
      const langCode = (pathLang as string) || 'en';
      router.push(`/${langCode}/auth/login?redirectTo=${currentUrl}`);
      return;
    }

    setIsBooking(true);
    prepTracker.bookingStarted(totalPrice, destinations);

    try {
      // Step 1: Create booking 
      const pkgId = packageIdParam ? parseInt(packageIdParam, 10) : null;
      const firstServiceId = Object.values(selections)
        .flatMap(day => Object.values(day || {}))
        .find(id => !!id);

      if (!pkgId) {
        throw new Error('No package selected. Please go back and create your package first.');
      }

      const bookingData = {
        packageId: pkgId,
        userId: user.id,
        travelDate: startDate ? (typeof startDate === 'string' ? startDate : new Date(startDate).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
        guestCount: guestCount || 2,
      };

      const { createBooking } = await import("@/services/bookingService");
      const result = await createBooking(bookingData, { destination: destinations?.[0] });

      // Reservation-fee model: creating a booking only sends the request to
      // each local partner — it no longer creates a payment order. { bookingId,
      // status, totalAmount, reservationFeeAmount, itemCount, message }.
      if (!result?.bookingId) {
        throw new Error('Booking creation did not return a valid booking ID');
      }

      // Step 2: go to the booking's status page — it shows vendor-confirmation
      // progress and only offers "Reserve" (-> /checkout) once every partner accepts.
      router.push(`/${lang}/bookings/${result.bookingId}`);

    } catch (error: any) {
      showNotification(error?.message || "Booking creation failed. Please try again.", "error");
      console.error('Booking error:', error);
    } finally {
      setIsBooking(false);
    }
  };

  if (!dict?.page?.results) return <div className="min-h-screen bg-slate-50" />;
  const res = dict.page.results;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-44">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 text-slate-900">
        {/* Corrected 2026-08: badge was "SECRET GROUP ACCESS 🤫" — a false
            exclusivity/scarcity claim (see CLAUDE.md banned-language rules). */}
        {/* ── 1 · HERO HEADER BANNER ───────────────────────────────────────── */}
        <header className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative bg-slate-950 text-white rounded-3xl p-6 sm:p-10 overflow-hidden shadow-2xl border border-slate-800">
            {/* Background Decorative Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Header Badges & Actions */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-500 text-white text-[9px] sm:text-[10px] font-black uppercase rounded-xl tracking-widest shadow-md">
                    {packageIdParam ? "PUBLISHED TRIP CIRCUIT" : (res.access_badge || "YOUR YATRA PLAN")}
                  </span>
                  <span className="px-2.5 py-1 bg-white/10 text-slate-300 text-[9px] font-bold uppercase rounded-xl tracking-wider backdrop-blur-md">
                    ⚡ Verified Local Stays & Transit
                  </span>
                </div>
                <button
                  onClick={handleShare}
                  className="h-11 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all backdrop-blur-md active:scale-95 border border-white/10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" x2="12" y1="2" y2="15" /></svg>
                  <span>Share Circuit</span>
                </button>
              </div>

              {/* Route Title */}
              <div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.25em] block mb-1">
                  Himachal Circuit Itinerary
                </span>
                <Typography variant="h1" className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight uppercase italic">
                  {originPoint || "Delhi"} <span className="text-emerald-400 font-normal">→</span> {destinations.length > 0 ? destinations.join(" → ") : "Manali"}
                </Typography>
              </div>

              {/* Route Meta Stats Bar */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-bold">
                  {startDate && endDate && (
                    <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                      📅 {new Date(startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – {new Date(endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                    🏔️ {itineraryDays.length} {itineraryDays.length === 1 ? "Day" : "Days"} Trip
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                    👥 {guestCount} Guests
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {!packageIdParam && (
                    <button
                      onClick={() => router.push(`/${lang}/builder`)}
                      className="h-11 px-4 flex items-center rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
                    >
                      Modify Circuit
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {suggestedNearby && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 animate-in fade-in">
            <p className="text-sm font-bold text-amber-800">
              No exact matches for your route. Showing suggested options nearby so you can still plan.
            </p>
          </div>
        )}

        {packageIdParam && !packageLoading && !packageData ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <p className="text-slate-500 font-medium">Trip plan not found.</p>
            <a href={`/${pathLang}/builder`} className="text-emerald-600 font-bold mt-2 inline-block">Start planning</a>
          </div>
        ) : (servicesLoading || (packageIdParam && packageLoading)) ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Finding services for you...</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-10">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Day-by-Day Circuit Breakdown</h3>
                <p className="text-xs text-slate-500">Selected verified local homestays, 4x4 cabs, and trek guides.</p>
              </div>
              <span className="text-xs font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                0% Markup Direct Payouts
              </span>
            </div>

            <div className="space-y-12">
              {itineraryDays.map(day => {
                const allCats = ["Stay", "Taxi", "Adventure", "Meals"];
                const cats = packageData ? allCats.filter(c => selections[day]?.[c]) : allCats;
                return (
                  <DayItinerary
                    key={day}
                    day={day}
                    title={res.itinerary.day.replace("{day}", day.toString())}
                    onVendorChange={(cat, id) => handleVendorChange(day, cat, id)}
                    onRemove={(cat) => handleRemove(day, cat)}
                    onAdd={(cat) => setDiscoveryState({ isOpen: true, category: cat, day })}
                    readOnly={!!packageData}
                    selections={cats.map(cat => ({
                      category: cat,
                      selectedVendorId: selections[day]?.[cat] ?? null,
                      options: liveVendors[cat] || [],
                    }))}
                  />
                );
              })}
            </div>

            {!packageData && (
              <div className="mt-12 text-center py-8 border-t border-slate-100 animate-fade-in">
                <div className="flex flex-col items-center gap-3">
                  <Typography variant="h3" className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">
                    {res.itinerary.explore_more}
                  </Typography>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                    {res.itinerary.near_origin.replace("{origin}", originPoint || "Chandigarh")}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <SupportContact
          variant="bar"
          className="mt-10 mb-20"
          heading="Questions before you send the request?"
        />

        {/* Floating Bottom Bar */}
        <div className="fixed bottom-6 left-0 right-0 px-4 sm:px-6 z-50 animate-slide-up">
          <div className="max-w-2xl mx-auto p-4 bg-slate-950 text-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center justify-between border border-slate-800 backdrop-blur-xl">
            <div className="pl-2 sm:pl-4">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{res.footer.total}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white italic tracking-tight">{formatINRWithSymbol(totalPrice)}</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-0.5 font-medium">{itineraryDays.length} Days · {guestCount} Guests · Paid directly to local partners</p>
            </div>
            <button
              onClick={handleBookNow}
              disabled={isBooking}
              className="h-13 sm:h-14 px-6 sm:px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-50"
            >
              {isBooking ? "SENDING REQUEST..." : res.footer.book_now}
            </button>
          </div>
        </div>
      </main>
      {!packageData && (
        <DiscoveryDrawer
          isOpen={discoveryState.isOpen}
          onClose={() => setDiscoveryState({ ...discoveryState, isOpen: false })}
          category={discoveryState.category}
          vendors={liveVendors[discoveryState.category] || []}
          onSelect={handleDiscoverySelect}
        />
      )}
    </div>
  );
}
