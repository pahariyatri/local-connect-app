"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import Typography from "../../components/atoms/Typography";
import Button from "../../components/atoms/Button";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import Loading from "@/app/loading";
import { getVendorBookings, getVendorItems, respondToBookingItem } from "@/services/bookingService";
import { getMyVendor } from "@/services/vendorService";
import { toApiUiError } from "@/utils/apiErrors";

type FilterKey = "requests" | "all" | "pending" | "confirmed" | "completed" | "cancelled";
type ViewMode = "list" | "calendar";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

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
  requests: "bg-orange-100 text-orange-700",
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
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<ViewMode>(() => (searchParams?.get("view") === "calendar" ? "calendar" : "list"));
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());

  // Lazy initializer (not an effect) — localStorage only exists client-side,
  // but this page is behind auth and always client-rendered in practice.
  const [vendorId, setVendorId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try { return window.localStorage.getItem("vendorId"); } catch { return null; }
  });

  const [resolvingVendor, setResolvingVendor] = useState(() => {
    if (typeof window === "undefined") return true;
    try { return !window.localStorage.getItem("vendorId"); } catch { return true; }
  });

  useEffect(() => {
    if (vendorId) return;
    let cancelled = false;
    getMyVendor()
      .then((vendor) => {
        if (cancelled || !vendor?.id) return;
        setVendorId(vendor.id);
        try { window.localStorage.setItem("vendorId", vendor.id); } catch { /* non-fatal */ }
      })
      .catch(() => { /* handled by empty state */ })
      .finally(() => { if (!cancelled) setResolvingVendor(false); });
    return () => { cancelled = true; };
  }, [vendorId]);

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

  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [itemsState, setItemsState] = useState<"idle" | "loading" | "error" | "ready">("idle");
  const [respondingId, setRespondingId] = useState<number | null>(null);

  const loadItems = useCallback(async () => {
    if (!vendorId) return;
    setItemsState("loading");
    try {
      const items = await getVendorItems(vendorId, "PENDING");
      setPendingItems(items);
      setItemsState("ready");
    } catch {
      setItemsState("error");
    }
  }, [vendorId]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const handleRespond = async (itemId: number, decision: "accept" | "reject") => {
    setRespondingId(itemId);
    try {
      await respondToBookingItem(itemId, decision, decision === "reject" ? "Unable to accommodate this request" : undefined);
      setPendingItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch {
      // Retryable
    } finally {
      setRespondingId(null);
    }
  };

  if (dictLoading || !dict) return <Loading />;

  const res = dict.page.vendor_onboarding.guest_assists;
  const bookingRes = dict.page.vendor_dashboard.bookings;

  const filterCounts: Record<FilterKey, number> = { requests: pendingItems.length, all: bookings.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  bookings.forEach((b) => { filterCounts[STATUS_TO_FILTER[b.status] || "pending"]++; });

  const filtered = filter === "all" ? bookings : bookings.filter((b) => STATUS_TO_FILTER[b.status] === filter);
  const totalRevenue = bookings
    .filter((b) => STATUS_TO_FILTER[b.status] !== "cancelled")
    .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);

  if (resolvingVendor) return <Loading />;

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

  // Calendar calculations
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Map bookings by date for active month
  const bookingsByDay: Record<number, any[]> = {};
  bookings.forEach((b) => {
    if (!b.travelDate) return;
    const d = new Date(b.travelDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const dayNum = d.getDate();
      if (!bookingsByDay[dayNum]) bookingsByDay[dayNum] = [];
      bookingsByDay[dayNum].push(b);
    }
  });

  const selectedDayBookings = bookingsByDay[selectedDay] || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <header className="mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <Typography variant="h1" className="text-2xl sm:text-3xl font-bold text-slate-900">
          Booking Requests
        </Typography>
        <p className="text-slate-500 text-sm mt-1">{res.subtitle}</p>
      </header>

      {/* View Switcher: List vs Calendar */}
      <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-2xl mb-6">
        <button
          onClick={() => setViewMode("list")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            viewMode === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          List View
        </button>
        <button
          onClick={() => setViewMode("calendar")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            viewMode === "calendar" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Calendar View
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-28">
          <p className="text-xs font-medium text-slate-400">{res.stats.total_rev}</p>
          <p className="text-2xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-28">
          <p className="text-xs font-medium text-slate-400">{res.stats.active}</p>
          <p className="text-2xl font-bold text-emerald-600">{total}</p>
        </div>
      </div>

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
            <button
              onClick={() => setFilter("requests")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                filter === "requests" ? "bg-slate-900 text-white" : "bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100"
              }`}
            >
              Requests <span className="ml-1 opacity-70">({filterCounts.requests})</span>
            </button>
            {(["all", "pending", "confirmed", "completed", "cancelled"] as FilterKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  filter === key ? "bg-slate-900 text-white" : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50"
                }`}
              >
                {bookingRes.filters[key]} <span className="ml-1 opacity-60">({filterCounts[key]})</span>
              </button>
            ))}
          </div>

          {/* Requests tab: per-item accept/reject inbox */}
          {filter === "requests" && (
            <div className="space-y-4">
              {itemsState === "loading" && (
                <div className="space-y-4">
                  <div className="h-28 rounded-3xl bg-slate-50 border border-slate-100 animate-pulse" />
                  <div className="h-28 rounded-3xl bg-slate-50 border border-slate-100 animate-pulse" />
                </div>
              )}
              {itemsState === "error" && (
                <div className="text-center py-16 bg-white rounded-[2.5rem] border border-red-100">
                  <p className="text-sm text-red-600 mb-4">Could not load requests.</p>
                  <Button onClick={loadItems} variant="outline" className="h-11 px-6 rounded-xl text-xs font-bold">Try again</Button>
                </div>
              )}
              {itemsState === "ready" && pendingItems.length === 0 && (
                <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <Typography variant="h3" className="text-lg font-bold text-slate-900 mb-1">
                    All caught up
                  </Typography>
                  <p className="text-slate-400 text-sm font-medium">No pending requests right now.</p>
                </div>
              )}
              {itemsState === "ready" && pendingItems.map((item) => {
                const guestName = [item.booking?.user?.firstName, item.booking?.user?.lastName].filter(Boolean).join(" ") || "Guest";
                const busy = respondingId === item.id;
                return (
                  <div key={item.id} className="premium-card p-5 bg-white">
                    <p className="text-xs font-semibold text-emerald-600 mb-1">Day {item.day} · {item.category}</p>
                    <h3 className="text-base font-bold text-slate-900">{item.service?.name || "Service"}</h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      {guestName} · {item.booking?.guestCount} guest{item.booking?.guestCount === 1 ? "" : "s"} · {item.booking?.travelDate ? new Date(item.booking.travelDate).toLocaleDateString() : "—"}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                      <span className="text-lg font-bold text-emerald-600">₹{Number(item.vendorPrice || 0).toLocaleString()}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRespond(item.id, "reject")}
                          disabled={busy}
                          className="h-10 px-4 rounded-xl bg-slate-50 text-slate-500 text-xs font-semibold disabled:opacity-50"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleRespond(item.id, "accept")}
                          disabled={busy}
                          className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50"
                        >
                          {busy ? "..." : "Accept"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filter !== "requests" && state === "loading" && (
            <div className="space-y-6">
              <BookingCardSkeleton />
              <BookingCardSkeleton />
            </div>
          )}

          {filter !== "requests" && state === "error" && (
            <div className="text-center py-16 bg-white rounded-[2.5rem] border border-red-100">
              <p className="text-sm text-red-600 mb-4">{errorMessage}</p>
              <Button onClick={load} variant="outline" className="h-11 px-6 rounded-xl text-xs font-bold">Try again</Button>
            </div>
          )}

          {filter !== "requests" && state === "ready" && (
            <div className="space-y-6">
              {filtered.map((booking, idx) => {
                const filterKey = STATUS_TO_FILTER[booking.status] || "pending";
                const customerName = [booking.user?.firstName, booking.user?.lastName].filter(Boolean).join(" ") || "Guest";
                return (
                  <div
                    key={booking.id}
                    className="premium-card p-6 bg-white relative overflow-hidden group hover:border-emerald-100 transition-all animate-in fade-in slide-in-from-bottom-5 duration-700"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex gap-4 items-center min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                          <PackageIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-emerald-600 mb-0.5">{res.card.id} #{booking.id}</p>
                          <h3 className="text-base font-bold text-slate-900 leading-tight truncate">{booking.directService?.name || booking.package?.name || "Trip request"}</h3>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-semibold shrink-0 ${STATUS_BADGE[filterKey]}`}>
                        {bookingRes.filters[filterKey]}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 mb-5 pt-5 border-t border-slate-50">
                      <div>
                        <p className="text-xs font-medium text-slate-400 mb-0.5">{res.card.guest}</p>
                        <p className="text-sm font-semibold text-slate-900">{customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-400 mb-0.5">Group size</p>
                        <p className="text-sm font-semibold text-slate-900">{booking.guestCount} guest{booking.guestCount === 1 ? "" : "s"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-400 mb-0.5">{res.card.date}</p>
                        <p className="text-sm font-semibold text-slate-900">{booking.travelDate ? new Date(booking.travelDate).toLocaleDateString() : "—"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-400 mb-0.5">{res.card.earnings}</p>
                        <p className="text-base font-bold text-emerald-600">₹{Number(booking.totalAmount || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    <Button variant="ghost" className="w-full h-11 rounded-xl bg-slate-50 hover:bg-white hover:border-emerald-100 text-slate-900 font-semibold text-sm border border-slate-100 transition-all">
                      {res.card.details}
                    </Button>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <Typography variant="h3" className="text-lg font-bold text-slate-900 mb-1">
                    {bookingRes.not_found}
                  </Typography>
                  <p className="text-slate-400 text-sm font-medium">
                    {filter === "all" ? bookingRes.empty_state : bookingRes.empty_filter.replace("{filter}", bookingRes.filters[filter])}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* CALENDAR VIEW */}
      {viewMode === "calendar" && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Month Header Selector */}
          <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <Typography variant="h2" className="text-lg font-bold text-slate-900">
              {MONTH_NAMES[month]} {year}
            </Typography>
            <div className="flex gap-2">
              <button
                onClick={() => setCalendarDate(new Date(year, month - 1, 1))}
                className="w-10 h-10 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors shadow-sm font-bold text-sm"
              >
                ←
              </button>
              <button
                onClick={() => setCalendarDate(new Date(year, month + 1, 1))}
                className="w-10 h-10 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors shadow-sm font-bold text-sm"
              >
                →
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white p-6 sm:p-8 rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)]">
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                <div key={i} className="text-[10px] font-black text-slate-300 text-center mb-2 uppercase tracking-[0.15em]">
                  {day}
                </div>
              ))}
              {/* Empty Padding Cells for First Day of Week */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-14 sm:h-16" />
              ))}
              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const hasBookings = bookingsByDay[dayNum] && bookingsByDay[dayNum].length > 0;
                const isSelected = selectedDay === dayNum;
                return (
                  <button
                    key={dayNum}
                    onClick={() => setSelectedDay(dayNum)}
                    className={`h-14 sm:h-16 rounded-[1.25rem] flex flex-col items-center justify-center transition-all duration-300 relative group overflow-hidden ${
                      isSelected
                        ? "bg-slate-900 text-white shadow-xl scale-105 z-10"
                        : hasBookings
                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold"
                        : "bg-slate-50/50 text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    <span className={`text-xs font-black ${isSelected ? "scale-110" : ""}`}>{dayNum}</span>
                    {hasBookings && !isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute bottom-2 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Agenda for Selected Day */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Typography variant="h3" className="text-xs font-semibold text-emerald-600">
                  {MONTH_NAMES[month].substring(0, 3)} {selectedDay}, {year}
                </Typography>
                <p className="text-base font-bold text-slate-900">
                  {selectedDayBookings.length ? `${selectedDayBookings.length} Scheduled Booking${selectedDayBookings.length === 1 ? "" : "s"}` : "No Scheduled Bookings"}
                </p>
              </div>
            </div>

            {selectedDayBookings.length > 0 ? (
              <div className="space-y-4 pt-2">
                {selectedDayBookings.map((booking) => {
                  const filterKey = STATUS_TO_FILTER[booking.status] || "pending";
                  const guestName = [booking.user?.firstName, booking.user?.lastName].filter(Boolean).join(" ") || "Guest";
                  return (
                    <div key={booking.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${STATUS_BADGE[filterKey]}`}>
                          {bookingRes.filters[filterKey]}
                        </span>
                        <h4 className="font-black text-slate-900 text-sm mt-1">{booking.package?.name || `Booking #${booking.id}`}</h4>
                        <p className="text-xs text-slate-400 font-medium">
                          {guestName} · {booking.guestCount} guest{booking.guestCount === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-emerald-600">₹{Number(booking.totalAmount || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No bookings on this date</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
