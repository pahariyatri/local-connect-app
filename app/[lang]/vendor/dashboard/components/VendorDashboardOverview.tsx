"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Typography from "../../../components/atoms/Typography";
import { getVendorBookings } from "@/services/bookingService";
import { getVendorById, getMyVendor } from "@/services/vendorService";
import { getServices } from "@/services/catalogService";

interface VendorDashboardOverviewProps {
  dict: any;
}

// Inline stroke SVGs — same convention as the rest of the app, no emoji icons.
type IconName = "home" | "calendar" | "wallet" | "star" | "plus" | "chart" | "chat" | "settings";
const ICON_PATHS: Record<IconName, React.ReactNode> = {
  home: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  wallet: <><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1" /><path d="M18 12a2 2 0 0 0 0 4h3v-4Z" /></>,
  star: <path d="M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  chart: <><path d="M3 3v18h18" /><path d="M18 17V9M13 17V5M8 17v-3" /></>,
  chat: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
};
function DashIcon({ name, className = "" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {ICON_PATHS[name]}
    </svg>
  );
}

// Backend BookingStatus collapsed into the four buckets the UI/translations use
// (same mapping as app/[lang]/vendor/bookings/page.tsx).
const STATUS_TO_BUCKET: Record<string, "pending" | "confirmed" | "completed" | "cancelled"> = {
  CREATED: "pending",
  PAYMENT_PENDING: "pending",
  CONFIRMED: "confirmed",
  VENDOR_ACCEPTED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REFUNDED: "cancelled",
  ABANDONED: "cancelled",
};

export default function VendorDashboardOverview({ dict }: VendorDashboardOverviewProps) {
  const params = useParams();
  const lang = params.lang || "en";
  const res = dict.page.vendor_dashboard;

  // localStorage is only a fast-path cache written once at onboarding time —
  // if it's empty (new device, new tab, cleared storage), fall back to
  // resolving the vendor server-side via /vendors/mine.
  const [vendorId, setVendorId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try { return window.localStorage.getItem("vendorId"); } catch { return null; }
  });
  const [state, setState] = useState<"idle" | "loading" | "error" | "ready">("idle");
  const [bookings, setBookings] = useState<any[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalServices, setTotalServices] = useState<number | null>(null);
  const [rating, setRating] = useState<number | null>(null);

  const load = useCallback(async () => {
    setState("loading");
    try {
      let id = vendorId;
      let vendor: any = id ? await getVendorById(id).catch(() => null) : null;
      if (!id || !vendor) {
        vendor = await getMyVendor().catch(() => null);
        if (vendor?.id) {
          id = vendor.id;
          setVendorId(id);
          try { window.localStorage.setItem("vendorId", id as string); } catch { /* non-fatal */ }
        }
      }
      if (!id) { setState("ready"); return; } // genuinely no vendor for this user

      const [bookingsResult, services] = await Promise.all([
        getVendorBookings(id, { limit: 50 }),
        getServices().catch(() => []),
      ]);
      setBookings(bookingsResult.bookings);
      setTotalBookings(bookingsResult.total);
      setRating(typeof vendor?.trustScore === "number" ? vendor.trustScore : null);
      setTotalServices(Array.isArray(services) ? services.filter((s: any) => s.vendor?.id === id).length : null);
      setState("ready");
    } catch {
      setState("error");
    }
    // Runs once on mount and again only if a fallback lookup resolves a new
    // vendorId — `vendorId` itself deliberately isn't a dependency, since
    // setting it inside this same callback would otherwise re-trigger it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  const getStatusLabel = (bucket: string) => {
    switch (bucket) {
      case "confirmed": return res.recent_bookings.status.confirmed;
      case "pending": return res.recent_bookings.status.pending;
      case "completed": return res.recent_bookings.status.completed;
      default: return bucket;
    }
  };

  if (state === "loading" || state === "idle") {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 h-40" />
        ))}
      </div>
    );
  }

  // Only "ready" gets here — the fallback /vendors/mine lookup already ran,
  // so a still-empty vendorId means this user genuinely has no vendor.
  if (!vendorId) {
    return (
      <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm text-center">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Complete vendor onboarding to see your business overview here.</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="p-10 rounded-[2.5rem] bg-white border border-red-100 text-center">
        <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-4">Could not load your business overview.</p>
        <button onClick={load} className="text-[10px] font-black text-slate-900 uppercase tracking-widest underline">Try again</button>
      </div>
    );
  }

  const totalRevenue = bookings
    .filter((b) => STATUS_TO_BUCKET[b.status] !== "cancelled")
    .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
  const completedCount = bookings.filter((b) => STATUS_TO_BUCKET[b.status] === "completed").length;
  const pendingCount = bookings.filter((b) => STATUS_TO_BUCKET[b.status] === "pending").length;
  const recentBookings = bookings.slice(0, 3);

  const statCards: { label: string; val: string | number; icon: IconName; color: string; bg: string; route: string }[] = [
    { label: res.stats.bookings, val: totalBookings, icon: "calendar", color: "text-emerald-600", bg: "bg-emerald-50", route: `/${lang}/vendor/bookings` },
    { label: res.stats.revenue, val: `₹${totalRevenue.toLocaleString()}`, icon: "wallet", color: "text-slate-900", bg: "bg-slate-100", route: `/${lang}/vendor/payouts` },
  ];
  if (rating != null) {
    statCards.push({ label: res.stats.rating, val: rating.toFixed(1), icon: "star", color: "text-amber-500", bg: "bg-amber-50", route: `/${lang}/vendor/services` });
  }

  return (
    <div className="space-y-10">
      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
            <Link key={i} href={stat.route} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all duration-700 group">
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mb-6 shadow-inner group-hover:rotate-6 transition-transform duration-500`}>
                    <DashIcon name={stat.icon} className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color} italic tracking-tighter`}>{stat.val}</p>
            </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent activity — real bookings, most recent first */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <Typography variant="h3" className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                {res.recent_bookings.title}
            </Typography>
            <Link href={`/${lang}/vendor/bookings`} className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700 transition-colors">
                View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentBookings.length === 0 && (
              <div className="p-6 bg-white rounded-[2rem] border border-slate-100 text-center">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">No bookings yet</p>
              </div>
            )}
            {recentBookings.map((booking) => {
              const bucket = STATUS_TO_BUCKET[booking.status] || "pending";
              const customerName = [booking.user?.firstName, booking.user?.lastName].filter(Boolean).join(" ") || "Guest";
              return (
                <div key={booking.id} className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm transition-all duration-500 hover:border-indigo-100 group">
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-slate-900 uppercase tracking-tighter text-[11px] group-hover:text-indigo-600 transition-colors truncate">{customerName}</div>
                    <div className="text-[10px] font-bold text-slate-400 mt-0.5 truncate">{booking.package?.name || "Trip package"}</div>
                  </div>
                  <div className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex-shrink-0 ${
                    bucket === "confirmed" ? "bg-emerald-500 text-white" :
                    bucket === "pending" ? "bg-indigo-600 text-white animate-pulse" :
                    "bg-slate-100 text-slate-400"
                  }`}>
                    {getStatusLabel(bucket)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Efficiency Index — real completed/pending counts from actual bookings.
          The old fixed "98%" satisfaction figure had no data behind it at all
          (no review system exists), so it's dropped rather than faked. */}
      <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
        <Typography variant="h3" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 relative z-10">
          Business Activity
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
          <div className="text-center md:border-r border-white/5 last:border-0">
            <div className="text-3xl font-black text-emerald-400 mb-1.5 italic transition-all group-hover:scale-110 duration-700">{completedCount}</div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{res.performance.completed}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-indigo-400 mb-1.5 italic transition-all group-hover:scale-110 duration-700">{pendingCount}</div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{res.performance.pending}</div>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-[80px] group-hover:bg-indigo-600/20 transition-all duration-1000"></div>
      </div>
    </div>
  );
}
