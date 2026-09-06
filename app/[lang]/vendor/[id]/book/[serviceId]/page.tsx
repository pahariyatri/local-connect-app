"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import LocalImage from "../../../../components/atoms/Image";
import TopNavigation from "../../../../components/organisms/TopNavigation";
import { useNotification } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { getVendorById } from "@/services/vendorService";
import { searchDiscoveryServices } from "@/services/searchService";
import { createDirectBooking } from "@/services/bookingService";
import { getServiceQuote, ServiceQuote } from "@/services/catalogService";
import { ApiClientError } from "@/lib/apiClient";
import { toLocalDateString } from "@/lib/travelDate";

interface BookingService {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  capacity: number;
  category: string;
  image: string;
}

interface HostInfo {
  id: string;
  name: string;
  hometown: string;
}

/**
 * Dedicated booking page — replaces the "Direct Booking Request" modal that
 * used to live inline on the vendor profile page. Same booking logic/APIs
 * (createDirectBooking, getServiceQuote), just given its own URL instead of
 * a createPortal overlay, so: it survives a page reload, is bookmarkable/
 * shareable, and the sign-in detour can resume via ordinary query params
 * instead of a sessionStorage side-channel.
 */
export default function BookServicePage() {
  const params = useParams<{ id: string; serviceId: string; lang: string }>();
  const vendorId = params.id as string;
  const serviceId = params.serviceId as string;
  const lang = params.lang || "en";
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showNotification } = useNotification();
  const { user } = useAuth();

  const [host, setHost] = useState<HostInfo | null>(null);
  const [service, setService] = useState<BookingService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<"not_found" | "error" | null>(null);

  // Selections resume from the URL after a sign-in detour (redirectTo carries
  // these same params back here) — no sessionStorage needed since this is a
  // real page, not a modal that disappears on navigation.
  const [travelDate, setTravelDate] = useState(() => searchParams.get("date") || "");
  const [endDate, setEndDate] = useState(() => searchParams.get("endDate") || "");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [guestCount, setGuestCount] = useState(() => {
    const g = Number(searchParams.get("guests"));
    return g > 0 ? g : 1;
  });
  const [notes, setNotes] = useState(() => searchParams.get("notes") || "");
  const [quote, setQuote] = useState<ServiceQuote | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [vendor, searchResult] = await Promise.all([
          getVendorById(vendorId),
          searchDiscoveryServices({ vendorId, limit: 50 }),
        ]);
        if (cancelled) return;
        if (!vendor?.id) {
          setLoadError("not_found");
          return;
        }
        const match = searchResult.services.find((s) => String(s.id) === serviceId);
        if (!match) {
          setLoadError("not_found");
          return;
        }
        const cleanName = vendor.businessName.replace(/\s*\(.*?\)\s*/g, "").trim();
        setHost({
          id: vendor.id,
          name: cleanName,
          hometown: match.location?.city || vendor.city || "Himachal Pradesh",
        });
        setService({
          id: String(match.id),
          name: match.name,
          description: match.shortDescription || match.description,
          price: match.pricing.unitPrice,
          unit: match.pricing.priceUnit ? `per ${match.pricing.priceUnit}` : "per service",
          capacity: match.capacity ?? 2,
          category: match.category,
          image: match.thumbnail,
        });
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof ApiClientError && err.statusCode === 404 ? "not_found" : "error");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [vendorId, serviceId]);

  // Live price quote from the real pricing engine — same as the modal had.
  useEffect(() => {
    if (!service || !travelDate) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    setIsQuoting(true);
    const timer = setTimeout(async () => {
      try {
        const q = await getServiceQuote(service.id, {
          dateFrom: travelDate,
          dateTo: endDate || undefined,
          guests: guestCount,
        });
        if (!cancelled) setQuote(q);
      } catch {
        if (!cancelled) setQuote(null);
      } finally {
        if (!cancelled) setIsQuoting(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [service, travelDate, endDate, guestCount]);

  const nights = (() => {
    if (!travelDate || !endDate) return 0;
    const start = new Date(travelDate);
    const end = new Date(endDate);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  })();

  const handleDateClick = (dateStr: string) => {
    if (!travelDate || (travelDate && endDate)) {
      setTravelDate(dateStr);
      setEndDate("");
      return;
    }
    if (dateStr < travelDate) {
      setEndDate(travelDate);
      setTravelDate(dateStr);
    } else {
      setEndDate(dateStr);
    }
    setIsCalendarOpen(false);
  };

  const renderCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startOffset = new Date(year, month, 1).getDay();
    const todayStr = toLocalDateString(new Date());

    const cells = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push(<div key={`empty-${i}`} className="h-9 sm:h-10 w-full" />);
    }
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = toLocalDateString(new Date(year, month, d));
      const isPast = dateStr < todayStr;
      const isSelected = dateStr === travelDate || dateStr === endDate;
      const isBetween = !!travelDate && !!endDate && dateStr > travelDate && dateStr < endDate;
      cells.push(
        <button
          key={d}
          type="button"
          disabled={isPast}
          onClick={() => handleDateClick(dateStr)}
          className={`h-9 w-full sm:h-10 relative flex items-center justify-center rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
            isPast ? "text-slate-200 cursor-not-allowed" :
            isSelected ? "bg-slate-900 text-white shadow-lg scale-105 z-10" :
            isBetween ? "bg-emerald-50 text-emerald-600 rounded-none" :
            "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {d}
          {dateStr === todayStr && !isSelected && (
            <div className="absolute bottom-1 w-1 h-1 bg-emerald-500 rounded-full" />
          )}
        </button>
      );
    }
    return cells;
  };

  // Same selections carried along so signing in resumes exactly where the
  // traveler left off, via the URL instead of a sessionStorage side-channel.
  const currentUrlWithSelections = () => {
    const qs = new URLSearchParams();
    if (travelDate) qs.set("date", travelDate);
    if (endDate) qs.set("endDate", endDate);
    if (guestCount > 1) qs.set("guests", String(guestCount));
    if (notes) qs.set("notes", notes);
    const qsStr = qs.toString();
    return `${window.location.pathname}${qsStr ? `?${qsStr}` : ""}`;
  };

  const handleSignIn = () => {
    router.push(`/${lang}/auth/login?redirectTo=${encodeURIComponent(currentUrlWithSelections())}`);
  };

  const handleSubmit = async () => {
    if (!service) return;
    if (!user) {
      handleSignIn();
      return;
    }
    if (!travelDate) {
      showNotification("Please choose a travel date", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await createDirectBooking({
        serviceId: Number(service.id),
        travelDate,
        endDate: endDate || undefined,
        guestCount,
        notes: notes || undefined,
      }, { destination: host?.hometown });
      showNotification(result.message || "Booking request sent successfully!", "success");
      router.push(`/${lang}/bookings/${result.bookingId}`);
    } catch (err: any) {
      if (err instanceof ApiClientError && err.statusCode === 401) {
        showNotification("Your session expired. Please sign in to submit your booking.", "error");
        router.push(`/${lang}/auth/login?redirectTo=${encodeURIComponent(currentUrlWithSelections())}`);
        return;
      }
      showNotification(err instanceof ApiClientError ? err.message : "Could not submit your booking request. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-32 animate-pulse">
        <TopNavigation title="Loading…" />
        <main className="max-w-lg mx-auto px-4 pt-24 space-y-4">
          <div className="h-24 bg-slate-200 rounded-2xl" />
          <div className="h-11 bg-slate-100 rounded-2xl" />
          <div className="h-16 bg-slate-100 rounded-2xl" />
        </main>
      </div>
    );
  }

  if (loadError || !service || !host) {
    return (
      <div className="min-h-screen bg-slate-50 pb-32">
        <TopNavigation title="Request to Book" />
        <main className="max-w-md mx-auto px-4 pt-24 text-center">
          <p className="text-slate-900 text-lg font-black mb-2">This service is currently unavailable.</p>
          <p className="text-slate-400 text-xs mb-6 font-medium">The listing may have been updated or moved.</p>
          <button
            onClick={() => router.push(`/${lang}/vendor/${vendorId}`)}
            className="h-12 px-6 rounded-full bg-slate-950 text-white font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
          >
            Back to Host
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <TopNavigation title="Request to Book" />

      <main className="max-w-lg mx-auto px-4 pt-20 sm:pt-24 space-y-4">
        {/* Service Summary */}
        <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 flex items-center gap-3 shadow-lg">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
            <LocalImage src={service.image} alt={service.name} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider block">Direct Request</span>
            <h1 className="text-base font-black truncate text-white">{service.name}</h1>
            <p className="text-[11px] text-slate-300 truncate">Host: {host.name}</p>
          </div>
        </div>

        {/* Sign-in Callout if unauthenticated */}
        {!user && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between gap-2 shadow-2xs">
            <div className="text-xs font-bold text-amber-950">
              <span>🔒 Sign in required to complete request.</span>
            </div>
            <button
              type="button"
              onClick={handleSignIn}
              className="px-3 py-1.5 rounded-xl bg-amber-900 hover:bg-amber-950 text-white text-[10px] font-black uppercase tracking-wider shrink-0 transition-all active:scale-95"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Date Selection */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setIsCalendarOpen((o) => !o)}
            className={`w-full flex items-center justify-between h-11 px-3.5 rounded-2xl border text-left transition-all bg-white ${
              isCalendarOpen ? "border-slate-900" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0 text-xs font-bold text-slate-800">
              <span className={travelDate ? "" : "text-slate-400"}>
                {travelDate ? new Date(travelDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Check-in"}
              </span>
              <span className="text-slate-300">→</span>
              <span className={endDate ? "" : "text-slate-400"}>
                {endDate ? new Date(endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Check-out"}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {nights > 0 && (
                <span className="text-[10px] font-black text-emerald-600">
                  {nights} {nights === 1 ? "Night" : "Nights"}
                </span>
              )}
              <span className={`text-[10px] transition-transform ${isCalendarOpen ? "rotate-180" : ""}`}>▾</span>
            </div>
          </button>

          {isCalendarOpen && (
            <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-black text-slate-900 text-[10px] sm:text-xs tracking-widest uppercase">
                  {calendarMonth.toLocaleString("default", { month: "long", year: "numeric" })}
                </h4>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white flex items-center justify-center text-[10px] border border-slate-200 hover:bg-slate-100 transition-all active:scale-95"
                    aria-label="Previous month"
                  >←</button>
                  <button
                    type="button"
                    onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white flex items-center justify-center text-[10px] border border-slate-200 hover:bg-slate-100 transition-all active:scale-95"
                    aria-label="Next month"
                  >→</button>
                </div>
              </div>
              <div className="grid grid-cols-7 text-center mb-1">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div key={`${d}-${i}`} className="text-[9px] font-black text-slate-300">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-1 select-none">
                {renderCalendarDays()}
              </div>
            </div>
          )}
        </div>

        {/* Guest Counter */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
            Number of Guests (Max {service.capacity})
          </label>
          <div className="flex items-center justify-between p-2 rounded-2xl border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setGuestCount((g) => Math.max(1, g - 1))}
              disabled={guestCount <= 1}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 disabled:opacity-30 text-slate-800 font-black text-sm flex items-center justify-center shadow-2xs hover:bg-slate-100 transition-all active:scale-95"
            >
              −
            </button>
            <div className="text-center">
              <span className="text-sm font-black text-slate-900 block leading-tight">
                {guestCount} {guestCount === 1 ? "Guest" : "Guests"}
              </span>
              <span className="text-[9px] font-bold text-slate-400">Up to {service.capacity} permitted</span>
            </div>
            <button
              type="button"
              onClick={() => setGuestCount((g) => Math.min(service.capacity, g + 1))}
              disabled={guestCount >= service.capacity}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 disabled:opacity-30 text-slate-800 font-black text-sm flex items-center justify-center shadow-2xs hover:bg-slate-100 transition-all active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        {/* Quick Special Requests */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
            Quick Requests (Optional)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {["Early Check-in", "Airport/Bus Taxi", "Veg Meals", "Pet Friendly"].map((tag) => {
              const isChecked = notes.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    if (isChecked) {
                      setNotes((prev) => prev.replace(tag, "").replace(/,\s*,/g, ",").trim());
                    } else {
                      setNotes((prev) => (prev ? `${prev}, ${tag}` : tag));
                    }
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all ${
                    isChecked
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {isChecked ? `✓ ${tag}` : `+ ${tag}`}
                </button>
              );
            })}
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Add any specific requests or note for host..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-base font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none bg-white mt-1"
          />
        </div>

        {/* Price Summary — real quote from the pricing engine, not a guess */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 text-white shadow-sm">
          <div>
            <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider block">Estimated Total</span>
            <p className="text-base font-black">
              {!travelDate ? (
                <>₹{Math.round(service.price).toLocaleString("en-IN")}</>
              ) : isQuoting && !quote ? (
                <span className="text-slate-400 text-sm font-semibold">Calculating…</span>
              ) : quote ? (
                <>₹{Math.round(quote.totalAmount).toLocaleString("en-IN")}</>
              ) : (
                <span className="text-slate-400 text-sm font-semibold">Unavailable — try again</span>
              )}
            </p>
          </div>
          {quote && (
            <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2.5 py-1 rounded-lg">
              {quote.nights > 0 && service.unit.includes("night")
                ? `₹${Math.round(quote.unitPrice).toLocaleString("en-IN")} × ${quote.nights} night${quote.nights > 1 ? "s" : ""}`
                : `${quote.guestCount} guest${quote.guestCount > 1 ? "s" : ""}`}
            </span>
          )}
        </div>
      </main>

      {/* Sticky Submit */}
      <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-5 bg-white/95 backdrop-blur-md border-t border-slate-100 z-20">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !travelDate}
            className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {user ? (
              isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending Request...
                </>
              ) : (
                <>
                  <span>Confirm Booking Request</span>
                  <span>→</span>
                </>
              )
            ) : (
              <>
                <span>Sign In to Request Booking</span>
                <span>→</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
