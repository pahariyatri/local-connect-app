"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Typography from "../../components/atoms/Typography";
import DayItinerary from "../../results/components/DayItinerary";
import PlanPreview from "./PlanPreview";
import DiscoveryDrawer from "../../components/molecules/DiscoveryDrawer";
import { TripStop } from "@/types/tripBuilder";
import { Vendor } from "../../results/components/VendorSelectionCard";
import { discoverServices, buildDiscoveryParams, mapServicesToVendors, EMPTY_VENDORS } from "@/services/vendorService";
import { createPackage } from "@/services/packageService";
import { sessionTracker } from "@/services/sessionService";

interface PackageBuilderStepProps {
  origin: string;
  destinations: string[];
  startDate: string | null;
  endDate: string | null;
  guestCount: number;
  servicePreferences: string[];
  lang: string;
  dict: any;
  routeStops?: string[];
  tripStops?: TripStop[];
  stopServicesByDay?: Record<number, string[]>;
  onCreatingChange?: (creating: boolean) => void;
  onStep5Footer?: (data: { totalPrice: number; onCreatePackage: () => Promise<void> }) => void;
}

export default function PackageBuilderStep({
  origin,
  destinations,
  startDate,
  endDate,
  guestCount,
  servicePreferences,
  lang,
  dict,
  routeStops,
  tripStops,
  stopServicesByDay,
  onCreatingChange,
  onStep5Footer,
}: PackageBuilderStepProps) {
  const router = useRouter();
  const [liveVendors, setLiveVendors] = useState<Record<string, Vendor[]>>(EMPTY_VENDORS);
  const [selections, setSelections] = useState<Record<number, Record<string, string | null>>>({});
  const [discoveryState, setDiscoveryState] = useState<{ isOpen: boolean; category: string; day: number }>({ isOpen: false, category: "", day: 0 });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  // Synchronous guard: `isGenerating` in the parent (driven by onCreatingChange)
  // only takes effect on the NEXT render, so a fast double-click before that
  // render can double-fire createPackage. A ref updates immediately.
  const isCreatingRef = useRef(false);

  const itineraryDays = useMemo(() => {
    if (!startDate || !endDate) return [1];
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return Array.from({ length: Math.max(1, Math.min(diffDays + 1, 14)) }, (_, i) => i + 1);
    } catch {
      return [1];
    }
  }, [startDate, endDate]);

  // Discover across the WHOLE route: destinations plus every chosen stop, so
  // travellers see services along the corridor, not only at the final cities.
  const discoveryDestinations = useMemo(() => {
    const seen = new Set<string>();
    const merged: string[] = [];
    [...(destinations || []), ...(routeStops || [])].forEach((d) => {
      const key = d?.trim().toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        merged.push(d);
      }
    });
    return merged;
  }, [destinations, routeStops]);

  useEffect(() => {
    const params = buildDiscoveryParams({
      destinations: discoveryDestinations,
      servicePreferences: servicePreferences || [],
      guestCount: guestCount ?? 2,
      startDate: startDate ?? undefined,
      endDate: endDate ?? undefined,
    });
    let cancelled = false;
    setLoading(true);
    discoverServices(params)
      .then((response: any) => {
        if (cancelled) return;
        const services = response?.data ?? response?.services ?? [];
        if (services.length > 0) setLiveVendors(mapServicesToVendors(services));
      })
      .catch((err) => {
        // Already handled below (vendors stay empty, UI shows "no options nearby").
        if (!cancelled) console.warn("Discover unavailable:", (err as Error)?.message || err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [discoveryDestinations.join(","), guestCount, servicePreferences?.join(","), startDate, endDate]);

  const wantsStay = !servicePreferences?.length || servicePreferences.includes("stay");
  const wantsTaxi = !servicePreferences?.length || servicePreferences.includes("travel");
  const wantsAdventure = !servicePreferences?.length || servicePreferences.includes("activity");
  const wantsMeals = !servicePreferences?.length || servicePreferences.includes("food");

  // A category shows for a given day when the interest is enabled globally AND,
  // if the user tuned this day in the "next stop" step, that day still includes it.
  const dayWants = useCallback(
    (day: number, category: string, globalWant: boolean) => {
      if (!globalWant) return false;
      const dayCats = stopServicesByDay?.[day];
      if (dayCats) return dayCats.includes(category);
      return true;
    },
    [stopServicesByDay]
  );

  useEffect(() => {
    const firstStay = liveVendors.Stay?.[0]?.id ?? null;
    const firstTaxi = liveVendors.Taxi?.[0]?.id ?? null;
    const firstAdventure = liveVendors.Adventure?.[0]?.id ?? null;
    const firstMeals = liveVendors.Meals?.[0]?.id ?? null;
    setSelections((prev) => {
      const next: Record<number, Record<string, string | null>> = {};
      itineraryDays.forEach((day) => {
        next[day] = {
          Stay: dayWants(day, "Stay", wantsStay) ? (prev[day]?.Stay ?? firstStay) : null,
          Taxi: dayWants(day, "Taxi", wantsTaxi) ? (prev[day]?.Taxi ?? firstTaxi) : null,
          Adventure: dayWants(day, "Adventure", wantsAdventure) ? (prev[day]?.Adventure ?? firstAdventure) : null,
          Meals: dayWants(day, "Meals", wantsMeals) ? (prev[day]?.Meals ?? firstMeals) : null,
        };
      });
      return next;
    });
  }, [itineraryDays, wantsStay, wantsTaxi, wantsAdventure, wantsMeals, liveVendors, dayWants]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVendorChange = (day: number, category: string, vendorId: string) => {
    setSelections((prev) => ({
      ...prev,
      [day]: { ...prev[day], [category]: vendorId },
    }));
  };

  const handleRemove = (day: number, category: string) => {
    setSelections((prev) => ({
      ...prev,
      [day]: { ...prev[day], [category]: null },
    }));
    setDiscoveryState({ isOpen: true, category, day });
  };


  const handleDiscoverySelect = (vendorId: string) => {
    handleVendorChange(discoveryState.day, discoveryState.category, vendorId);
    setDiscoveryState((s) => ({ ...s, isOpen: false }));
  };

  const totalPrice = useMemo(() => {
    let t = 0;
    Object.keys(selections).forEach((dayKey) => {
      const day = parseInt(dayKey);
      Object.keys(selections[day] || {}).forEach((cat) => {
        const vid = selections[day][cat];
        if (vid) {
          const list = liveVendors[cat] || [];
          const v = list.find((x) => x.id === vid);
          if (v) t += v.price;
        }
      });
    });
    return t;
  }, [selections, liveVendors]);

  const buildSelectedServicesForApi = (): Record<string, Record<string, number | null>> => {
    const out: Record<string, Record<string, number | null>> = {};
    itineraryDays.forEach((day) => {
      const daySel = selections[day];
      if (!daySel) return;
      out[String(day)] = {};
      ["Stay", "Taxi", "Adventure", "Meals"].forEach((cat) => {
        const vid = daySel[cat];
        out[String(day)][cat] = vid ? parseInt(vid, 10) : null;
      });
    });
    return out;
  };

  const handleCreatePackage = useCallback(async () => {
    if (isCreatingRef.current) return;
    isCreatingRef.current = true;
    setCreating(true);
    onCreatingChange?.(true);
    try {
      const selectedServices = buildSelectedServicesForApi();
      const sessionId = await sessionTracker.getSessionId();
      const pkg = await createPackage({
        origin,
        destinations,
        startDate: startDate || "",
        endDate: endDate || "",
        guestCount,
        servicePreferences: servicePreferences || [],
        selectedServices,
        totalPrice,
        sessionId: sessionId?.startsWith?.("local-") ? undefined : sessionId,
      });
      const id = (pkg as any)?.id;
      if (id) {
        const params = new URLSearchParams();
        params.set("packageId", String(id));
        router.push(`/${lang}/results?${params.toString()}`);
        return;
      }
      throw new Error("No package ID returned");
    } catch (err) {
      console.error("Create package failed:", err);
      isCreatingRef.current = false;
      onCreatingChange?.(false);
      setCreating(false);
    }
  }, [origin, destinations, startDate, endDate, guestCount, servicePreferences, lang, totalPrice, selections, itineraryDays, onCreatingChange]);

  useEffect(() => {
    if (onStep5Footer && !loading) {
      onStep5Footer({ totalPrice, onCreatePackage: handleCreatePackage });
    }
  }, [totalPrice, loading, onStep5Footer, handleCreatePackage]);

  const builder = dict?.page?.builder;
  const res = dict?.page?.results;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Finding services for you...</p>
      </div>
    );
  }

  const categories = [
    { key: "Stay", show: wantsStay },
    { key: "Taxi", show: wantsTaxi },
    { key: "Adventure", show: wantsAdventure },
    { key: "Meals", show: wantsMeals },
  ].filter((c) => c.show);

  return (
    <div className="animate-fade-in space-y-6">
      <header className="mb-6">
        <Typography variant="h1" className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight" dangerouslySetInnerHTML={{ __html: builder?.step5?.title ?? "Build your <span class=\"text-emerald-600\">package</span>" }} />
        <p className="text-slate-400 font-medium mt-1 text-xs sm:text-sm">{builder?.step5?.subtitle ?? "Choose vendors for each day. Share or book when done."}</p>
      </header>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm mb-6">
        <p className="text-sm font-bold text-slate-500">
          {origin} → {destinations?.join(" → ")}
          {routeStops?.length ? ` · via ${routeStops.join(", ")}` : ""} · {itineraryDays.length} {itineraryDays.length === 1 ? "day" : "days"} · {guestCount} guests
        </p>
      </div>

      {/* Day-wise plan preview from the structured stops chosen in Step 5 */}
      {tripStops && tripStops.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-3">Your day-by-day plan</h3>
          <PlanPreview origin={origin} destinationLabels={destinations || []} stops={tripStops} compact />
        </div>
      )}

      <div className="space-y-12">
        {itineraryDays.map((day) => (
          <DayItinerary
            key={day}
            day={day}
            title={(res?.itinerary?.day ?? "Day {day}").replace("{day}", String(day))}
            onVendorChange={(cat, id) => handleVendorChange(day, cat, id)}
            onRemove={(cat) => handleRemove(day, cat)}
            onAdd={(cat) => setDiscoveryState({ isOpen: true, category: cat, day })}
            onViewAll={(cat) => setDiscoveryState({ isOpen: true, category: cat, day })}
            selections={categories
              .filter((c) => dayWants(day, c.key, c.show))
              .map((c) => ({
                category: c.key,
                selectedVendorId: selections[day]?.[c.key] ?? null,
                options: liveVendors[c.key] || [],
              }))}
          />
        ))}
      </div>

      <DiscoveryDrawer
        isOpen={discoveryState.isOpen}
        onClose={() => setDiscoveryState((s) => ({ ...s, isOpen: false }))}
        category={discoveryState.category}
        vendors={liveVendors[discoveryState.category] || []}
        onSelect={handleDiscoverySelect}
      />
    </div>
  );
}
