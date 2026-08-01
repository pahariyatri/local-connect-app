"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Typography from "../../components/atoms/Typography";
import Button from "../../components/atoms/Button";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import Loading from "@/app/loading";
import { getVendorBookings } from "@/services/bookingService";
import { toApiUiError } from "@/utils/apiErrors";

type FilterKey = "all" | "pending" | "confirmed" | "completed" | "cancelled";

// Backend BookingStatus (backend/src/feature/booking/entities/booking.entity.ts)
// collapsed into the four buckets the existing UI/translations already use.
const STATUS_TO_FILTER: Record<string, FilterKey> = {
  CREATED: "pending",
  PAYMENT_PENDING: "pending",
  CONFIRMED: "confirmed",
  VENDOR_ACCEPTED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REFUNDED: "cancelled",
  ABANDONED: "cancelled",
};

const STATUS_BADGE: Record<FilterKey, string> = {
  all: "bg-slate-100 text-slate-700",
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-500 text-white",
  completed: "bg-slate-100 text-slate-400",
  cancelled: "bg-red-100 text-red-700",
};

function PackageIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
    </svg>
  );
}

function BookingCardSkeleton() {
  return (
    <div className="premium-card p-8 bg-white animate-pulse">
      <div className="flex justify-between items-start mb-8">
        <div className="flex gap-5 items-center">
          <div className="w-16 h-16 rounded-[1.5rem] bg-slate-100" />
          <div className="space-y-2">
            <div className="h-2.5 w-16 bg-slate-100 rounded" />
            <div className="h-4 w-40 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="h-6 w-20 bg-slate-100 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-y-6 pt-6 border-t border-slate-50">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-2 w-16 bg-slate-100 rounded" />
            <div className="h-4 w-24 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ManageBookingsPage() {
  const { dict, loading: dictLoading } = useLocalizationContext();
  const { lang } = useParams();

  // Lazy initializer (not an effect) — localStorage only exists client-side,
  // but this page is behind auth and always client-rendered in practice.
  const [vendorId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try { return window.localStorage.getItem("vendorId"); } catch { return null; }
  });

  const [filter, setFilter] = useState<FilterKey>("all");
  const [bookings, setBookings] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState<"idle" | "loading" | "error" | "ready">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!vendorId) return;
    setState("loading");
    setErrorMessage(null);
    try {
      // Backend groups by its own enum; ask for everything and bucket client-side
      // rather than firing one request per filter tab.
      const result = await getVendorBookings(vendorId, { limit: 50 });
      setBookings(result.bookings);
      setTotal(result.total);
      setState("ready");
    } catch (err) {
      setErrorMessage(toApiUiError(err, "We could not load your bookings.").message);
      setState("error");
    }
  }, [vendorId]);

  useEffect(() => { load(); }, [load]);

  if (dictLoading || !dict) return <Loading />;

  const res = dict.page.vendor_onboarding.guest_assists;
  const bookingRes = dict.page.vendor_dashboard.bookings;

  const filterCounts: Record<FilterKey, number> = { all: bookings.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  bookings.forEach((b) => { filterCounts[STATUS_TO_FILTER[b.status] || "pending"]++; });

  const filtered = filter === "all" ? bookings : bookings.filter((b) => STATUS_TO_FILTER[b.status] === filter);
  const totalRevenue = bookings
    .filter((b) => STATUS_TO_FILTER[b.status] !== "cancelled")
    .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);

  // No vendor profile linked in this browser yet — nothing to fetch.
  if (vendorId === null) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <Typography variant="h1" className="text-2xl font-black text-slate-900 mb-2">No vendor profile yet</Typography>
        <p className="text-slate-400 text-sm mb-8">Complete vendor onboarding to start receiving bookings.</p>
        <Link href={`/${lang}/vendor/onboarding`}>
          <Button className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-bold text-sm">Start onboarding</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <header className="mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <Typography variant="h1" className="text-4xl font-black text-slate-900 leading-tight">
          Guests <span className="text-emerald-500">&</span> Assists.
        </Typography>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">{res.subtitle}</p>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col justify-between h-36">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{res.stats.total_rev}</p>
          <p className="text-3xl font-black text-slate-900 italic">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col justify-between h-36">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{res.stats.active}</p>
          <p className="text-3xl font-black text-emerald-500 italic">{total}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 no-scrollbar">
        {(["all", "pending", "confirmed", "completed", "cancelled"] as FilterKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
              filter === key ? "bg-slate-900 text-white" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"
            }`}
          >
            {bookingRes.filters[key]} <span className="ml-1 opacity-50">[{filterCounts[key]}]</span>
          </button>
        ))}
      </div>

      {state === "loading" && (
        <div className="space-y-6">
          <BookingCardSkeleton />
          <BookingCardSkeleton />
        </div>
      )}

      {state === "error" && (
        <div className="text-center py-16 bg-white rounded-[2.5rem] border border-red-100">
          <p className="text-sm text-red-600 mb-4">{errorMessage}</p>
          <Button onClick={load} variant="outline" className="h-11 px-6 rounded-xl text-xs font-bold">Try again</Button>
        </div>
      )}

      {state === "ready" && (
        <div className="space-y-6">
          {filtered.map((booking, idx) => {
            const filterKey = STATUS_TO_FILTER[booking.status] || "pending";
            const customerName = [booking.user?.firstName, booking.user?.lastName].filter(Boolean).join(" ") || "Guest";
            return (
              <div
                key={booking.id}
                className="premium-card p-1 bg-white relative overflow-hidden group hover:border-emerald-100 transition-all active:scale-[0.98] animate-in fade-in slide-in-from-bottom-5 duration-700"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex gap-5 items-center min-w-0">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-300 flex-shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all duration-500">
                        <PackageIcon className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1.5">{res.card.id} #{booking.id}</p>
                        <h3 className="text-lg font-black text-slate-900 leading-tight uppercase tracking-tighter truncate">{booking.package?.name || "Trip package"}</h3>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm flex-shrink-0 ${STATUS_BADGE[filterKey]}`}>
                      {bookingRes.filters[filterKey]}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-6 mb-10 pt-6 border-t border-slate-50">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{res.card.guest}</p>
                      <p className="text-sm font-black text-slate-900">{customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Group size</p>
                      <p className="text-sm font-black text-slate-900">{booking.guestCount} guest{booking.guestCount === 1 ? "" : "s"}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{res.card.date}</p>
                      <p className="text-sm font-black text-slate-900">{booking.travelDate ? new Date(booking.travelDate).toLocaleDateString() : "—"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{res.card.earnings}</p>
                      <p className="text-lg font-black text-emerald-600">₹{Number(booking.totalAmount || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <Button variant="ghost" className="w-full h-14 rounded-[1.5rem] bg-slate-50 hover:bg-white hover:border-emerald-100 text-slate-900 font-black text-[11px] uppercase tracking-[0.2em] border border-slate-100 transition-all active:scale-95">
                    {res.card.details}
                  </Button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
              <Typography variant="h3" className="text-xl font-black text-slate-900 uppercase tracking-tighter italic mb-2">
                {bookingRes.not_found}
              </Typography>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                {filter === "all" ? bookingRes.empty_state : bookingRes.empty_filter.replace("{filter}", bookingRes.filters[filter])}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-16 text-center pb-12">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">End of feed</p>
      </div>
    </div>
  );
}
