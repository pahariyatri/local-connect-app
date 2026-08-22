"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Typography from "../../../components/atoms/Typography";
import { getVendorBookings } from "@/services/bookingService";
import { getVendorById, getMyVendor } from "@/services/vendorService";
import { getServices } from "@/services/catalogService";
import Badge from "../../../components/molecules/Badge";

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
  const [myServices, setMyServices] = useState<any[]>([]);
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
      setMyServices(Array.isArray(services) ? services.filter((s: any) => s.vendor?.id === id) : []);
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
          <div key={i} className="p-6 rounded-3xl bg-white border border-slate-100 h-32" />
        ))}
      </div>
    );
  }

  // Only "ready" gets here — the fallback /vendors/mine lookup already ran,
  // so a still-empty vendorId means this user genuinely has no vendor.
  if (!vendorId) {
    return (
      <div className="p-10 rounded-3xl bg-white border border-slate-100 shadow-sm text-center">
        <p className="text-slate-400 text-sm font-medium">Complete vendor onboarding to see your business overview here.</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="p-10 rounded-3xl bg-white border border-red-100 text-center">
        <p className="text-red-500 text-sm font-medium mb-4">Could not load your business overview.</p>
        <button onClick={load} className="text-xs font-semibold text-slate-900 underline">Try again</button>
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
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
            <Link key={i} href={stat.route} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
                <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                    <DashIcon name={stat.icon} className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-xs font-medium text-slate-400 mb-1">{stat.label}</p>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.val}</p>
            </Link>
        ))}
      </div>

      {/* Recent activity — real bookings, most recent first */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <Typography variant="h3" className="text-base font-bold text-slate-900">
              {res.recent_bookings.title}
          </Typography>
          <Link href={`/${lang}/vendor/bookings`} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              View All →
          </Link>
        </div>
        <div className="space-y-2.5">
          {recentBookings.length === 0 && (
            <div className="p-6 bg-white rounded-2xl border border-slate-100 text-center">
              <p className="text-slate-400 text-sm font-medium">No bookings yet</p>
            </div>
          )}
          {recentBookings.map((booking) => {
            const bucket = STATUS_TO_BUCKET[booking.status] || "pending";
            const customerName = [booking.user?.firstName, booking.user?.lastName].filter(Boolean).join(" ") || "Guest";
            return (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-colors hover:border-emerald-100">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 text-sm truncate">{customerName}</div>
                  <div className="text-xs text-slate-400 mt-0.5 truncate">{booking.directService?.name || booking.package?.name || "Trip request"}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold shrink-0 ${
                  bucket === "confirmed" ? "bg-emerald-600 text-white" :
                  bucket === "pending" ? "bg-amber-500 text-white" :
                  "bg-slate-100 text-slate-500"
                }`}>
                  {getStatusLabel(bucket)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* My Services preview — real listings with their real Active/Inactive state */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <Typography variant="h3" className="text-base font-bold text-slate-900">
              My Services
          </Typography>
          <Link href={`/${lang}/vendor/services`} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              View All →
          </Link>
        </div>
        <div className="space-y-2.5">
          {myServices.length === 0 && (
            <div className="p-6 bg-white rounded-2xl border border-slate-100 text-center">
              <p className="text-slate-400 text-sm font-medium mb-2">No services listed yet</p>
              <Link href={`/${lang}/vendor/services/new`} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                + Add your first service
              </Link>
            </div>
          )}
          {myServices.slice(0, 3).map((service) => (
            <Link
              key={service.id}
              href={`/${lang}/vendor/services/${service.id}/edit`}
              className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-colors hover:border-emerald-100"
            >
              <span className="font-semibold text-slate-900 text-sm truncate">{service.name}</span>
              <Badge
                text={service.isAvailable ? (res.services?.filters?.active || "Active") : (res.services?.filters?.inactive || "Inactive")}
                color={service.isAvailable ? "green" : "gray"}
                className="shrink-0 ml-3"
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Business Activity — real completed/pending counts from actual
          bookings. The old fixed "98%" satisfaction figure had no data
          behind it at all (no review system exists), so it's dropped
          rather than faked. */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8">
        <p className="text-xs font-semibold text-slate-400 mb-6">Business Activity</p>
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400 mb-1">{completedCount}</div>
            <div className="text-xs font-medium text-slate-400">{res.performance.completed}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400 mb-1">{pendingCount}</div>
            <div className="text-xs font-medium text-slate-400">{res.performance.pending}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
