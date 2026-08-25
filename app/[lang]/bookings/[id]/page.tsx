"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import {
  respondToBookingItem as _respondToBookingItem,
  replaceBookingItem,
  removeBookingItem,
  getBookingVendorContacts,
} from "@/services/bookingService";
import { discoverServices, buildDiscoveryParams, mapServicesToVendors, EMPTY_VENDORS } from "@/services/vendorService";
import DiscoveryDrawer from "../../components/molecules/DiscoveryDrawer";
import SupportContact from "../../components/molecules/SupportContact";
import type { Vendor } from "../../results/components/VendorSelectionCard";

type BookingStatus =
  | 'CREATED' | 'REPLACEMENT_REQUIRED' | 'VENDOR_REJECTED' | 'VENDOR_ACCEPTED'
  | 'PAYMENT_PENDING' | 'PAYMENT_FAILED' | 'CONFIRMED' | 'TRAVEL_IN_PROGRESS'
  | 'COMPLETED' | 'CANCELLED' | 'EXPIRED' | 'REFUNDED' | 'ABANDONED' | 'UNKNOWN';

type ItemStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REPLACED' | 'REMOVED';

interface BookingItemData {
  id: number;
  day: number;
  category: string;
  vendorPrice: number;
  status: ItemStatus;
  rejectionReason: string | null;
  service?: { id: number; name: string };
  vendor?: { id: string; businessName: string };
}

interface BookingData {
  id: number;
  status: BookingStatus;
  totalAmount: number;
  reservationFeeAmount: number | null;
  currency: string;
  travelDate: string;
  package?: { name?: string; destinations?: string[] };
  tripSnapshot?: { destinations?: string[] };
  items?: BookingItemData[];
  createdAt: string;
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  CREATED: 'Waiting on local partners',
  REPLACEMENT_REQUIRED: 'Action needed',
  VENDOR_REJECTED: 'Request declined',
  VENDOR_ACCEPTED: 'Ready to reserve!',
  PAYMENT_PENDING: 'Processing your payment...',
  PAYMENT_FAILED: 'Payment failed',
  CONFIRMED: 'Reserved!',
  TRAVEL_IN_PROGRESS: 'Trip in progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
  REFUNDED: 'Refunded',
  ABANDONED: 'Expired',
  UNKNOWN: 'Loading...',
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  CREATED: 'text-amber-600 bg-amber-50 border-amber-100',
  REPLACEMENT_REQUIRED: 'text-orange-600 bg-orange-50 border-orange-100',
  VENDOR_REJECTED: 'text-red-600 bg-red-50 border-red-100',
  VENDOR_ACCEPTED: 'text-emerald-700 bg-emerald-50 border-emerald-100',
  PAYMENT_PENDING: 'text-blue-600 bg-blue-50 border-blue-100',
  PAYMENT_FAILED: 'text-red-600 bg-red-50 border-red-100',
  CONFIRMED: 'text-emerald-700 bg-emerald-50 border-emerald-100',
  TRAVEL_IN_PROGRESS: 'text-indigo-600 bg-indigo-50 border-indigo-100',
  COMPLETED: 'text-slate-500 bg-slate-50 border-slate-100',
  CANCELLED: 'text-red-600 bg-red-50 border-red-100',
  EXPIRED: 'text-slate-500 bg-slate-50 border-slate-100',
  REFUNDED: 'text-slate-500 bg-slate-50 border-slate-100',
  ABANDONED: 'text-slate-500 bg-slate-50 border-slate-100',
  UNKNOWN: 'text-slate-400 bg-slate-50 border-slate-100',
};

const ITEM_STATUS_STYLE: Record<ItemStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-600',
  ACCEPTED: 'bg-emerald-50 text-emerald-600',
  REJECTED: 'bg-red-50 text-red-500',
  REPLACED: 'bg-slate-100 text-slate-400',
  REMOVED: 'bg-slate-100 text-slate-400',
};

const CONTACTS_UNLOCKED: BookingStatus[] = ['CONFIRMED', 'TRAVEL_IN_PROGRESS', 'COMPLETED'];
const IN_FLIGHT: BookingStatus[] = ['CREATED', 'REPLACEMENT_REQUIRED', 'VENDOR_ACCEPTED', 'PAYMENT_PENDING'];

export default function BookingDetailPage() {
  const { id, lang } = useParams() as { id: string; lang: string };
  const router = useRouter();

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contacts, setContacts] = useState<any[] | null>(null);
  const [busyItemId, setBusyItemId] = useState<number | null>(null);
  const [replaceDrawer, setReplaceDrawer] = useState<{ item: BookingItemData | null; vendors: Vendor[]; loading: boolean }>({ item: null, vendors: [], loading: false });

  const fetchBooking = useCallback(async () => {
    try {
      const resp = await api.get(`/booking/${id}`, { skipCache: true });
      const data: BookingData = (resp as any)?.data || resp;
      setBooking(data);
      setError('');
      return data.status;
    } catch (err: any) {
      setError(err?.message || 'Could not load booking details.');
      return 'UNKNOWN' as BookingStatus;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchBooking(); }, [fetchBooking]);

  const bookingStatus = booking?.status;

  // Poll while in-flight — vendor responses or payment capture happen asynchronously.
  // pollAttempts is a ref (not state) so the cap survives across IN_FLIGHT status
  // transitions (e.g. CREATED -> VENDOR_ACCEPTED -> PAYMENT_PENDING): each status
  // change re-runs this effect, and a local/state counter would reset to 0 every
  // time, letting a booking that keeps changing status poll indefinitely instead
  // of stopping after 10 attempts total.
  const pollAttempts = useRef(0);
  useEffect(() => {
    pollAttempts.current = 0;
  }, [id]);

  useEffect(() => {
    if (!bookingStatus || !IN_FLIGHT.includes(bookingStatus as BookingStatus)) return;
    if (pollAttempts.current >= 10) return;

    const interval = setInterval(async () => {
      pollAttempts.current += 1;
      if (pollAttempts.current > 10) {
        clearInterval(interval);
        return;
      }
      await fetchBooking();
    }, 6000);

    return () => clearInterval(interval);
  }, [bookingStatus, fetchBooking, id]);

  // Load vendor contacts once unlocked.
  useEffect(() => {
    if (!booking || !CONTACTS_UNLOCKED.includes(booking.status)) return;
    let cancelled = false;
    getBookingVendorContacts(booking.id)
      .then((res) => { if (!cancelled) setContacts(res.items || []); })
      .catch(() => { /* non-fatal — page still works without contacts */ });
    return () => { cancelled = true; };
  }, [booking?.status, booking?.id]);

  const respond = async (itemId: number, decision: 'accept' | 'reject') => {
    setBusyItemId(itemId);
    try {
      await _respondToBookingItem(itemId, decision);
      await fetchBooking();
    } finally {
      setBusyItemId(null);
    }
  };

  const openReplaceDrawer = async (item: BookingItemData) => {
    setReplaceDrawer({ item, vendors: [], loading: true });
    try {
      const destinations = booking?.tripSnapshot?.destinations || booking?.package?.destinations || [];
      const params = buildDiscoveryParams({ destinations, servicePreferences: [], guestCount: 2 });
      const response: any = await discoverServices(params);
      const services = response?.data ?? response?.services ?? [];
      const byBucket = services.length > 0 ? mapServicesToVendors(services) : EMPTY_VENDORS;
      const options = (byBucket[item.category] || []).filter((v) => v.id !== String(item.service?.id));
      setReplaceDrawer({ item, vendors: options, loading: false });
    } catch {
      setReplaceDrawer({ item, vendors: [], loading: false });
    }
  };

  const handleReplaceSelect = async (serviceId: string) => {
    const item = replaceDrawer.item;
    if (!item || !booking) return;
    setReplaceDrawer({ item: null, vendors: [], loading: false });
    setBusyItemId(item.id);
    try {
      await replaceBookingItem(booking.id, item.id, parseInt(serviceId, 10));
      await fetchBooking();
    } finally {
      setBusyItemId(null);
    }
  };

  const handleRemoveItem = async (item: BookingItemData) => {
    if (!booking) return;
    setBusyItemId(item.id);
    try {
      await removeBookingItem(booking.id, item.id);
      await fetchBooking();
    } finally {
      setBusyItemId(null);
    }
  };

  const handleConfirmAndProceedToPay = () => {
    if (!booking) return;
    router.push(`/${lang}/bookings/${id}/payment`);
  };

  const status = (booking?.status || 'UNKNOWN') as BookingStatus;
  const isReadyToReserve = status === 'VENDOR_ACCEPTED';
  const isReserved = CONTACTS_UNLOCKED.includes(status);
  const isDeadEnd = ['CANCELLED', 'EXPIRED', 'VENDOR_REJECTED', 'ABANDONED'].includes(status);
  const activeItems = (booking?.items || []).filter((i) => i.status !== 'REPLACED' && i.status !== 'REMOVED');
  const rejectedItems = activeItems.filter((i) => i.status === 'REJECTED');
  const vendorPayTotal = Number(booking?.totalAmount || 0);
  const feeAmount = booking?.reservationFeeAmount != null ? Number(booking.reservationFeeAmount) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white px-6 pt-28 sm:pt-36 pb-32">
      <div className="w-full max-w-lg mx-auto">

        {/* Header */}
        <div className="mb-6">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Booking YATRI-{id}</p>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">{STATUS_LABELS[status]}</h1>
        </div>

        {/* Status banner */}
        <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 ${STATUS_COLORS[status]}`}>
          {IN_FLIGHT.includes(status) && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />}
          <div>
            <p className="font-black text-sm">{STATUS_LABELS[status]}</p>
            <p className="text-xs opacity-70 font-medium mt-0.5">
              {status === 'CREATED' && "We've sent your request to each local partner. This usually takes a few minutes."}
              {status === 'REPLACEMENT_REQUIRED' && 'One or more partners couldn\'t confirm — pick a replacement below to continue.'}
              {status === 'VENDOR_ACCEPTED' && 'Every local partner confirmed. Pay the reservation fee to lock it in.'}
              {status === 'PAYMENT_PENDING' && "We're confirming your payment with the bank."}
              {status === 'CONFIRMED' && 'Your reservation is confirmed. Local partner contacts are below.'}
              {status === 'VENDOR_REJECTED' && 'This booking could not be confirmed by local partners.'}
              {status === 'EXPIRED' && 'Local partners did not respond in time.'}
              {status === 'CANCELLED' && 'This booking was cancelled.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-2xl border border-red-100">
            <p className="text-red-700 text-sm font-bold">{error}</p>
            <button onClick={fetchBooking} className="mt-2 text-xs font-bold text-red-600 underline">Retry</button>
          </div>
        )}

        {/* Day-wise items */}
        {activeItems.length > 0 && (
          <section className="mb-6">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Trip services</h2>
            <div className="space-y-3">
              {activeItems.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Day {item.day} · {item.category}</p>
                      <p className="text-sm font-black text-slate-900 mt-0.5 truncate">{item.service?.name || 'Service'}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{item.vendor?.businessName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-slate-900">₹{Number(item.vendorPrice).toLocaleString('en-IN')}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${ITEM_STATUS_STYLE[item.status]}`}>
                        {item.status === 'PENDING' ? 'Awaiting confirmation' : item.status === 'ACCEPTED' ? 'Confirmed' : 'Declined'}
                      </span>
                    </div>
                  </div>
                  {item.status === 'REJECTED' && (
                    <div className="mt-3 pt-3 border-t border-slate-50">
                      {item.rejectionReason && (
                        <p className="text-xs text-slate-500 font-medium mb-2">"{item.rejectionReason}"</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => openReplaceDrawer(item)}
                          disabled={busyItemId === item.id}
                          className="flex-1 h-10 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50"
                        >
                          Pick replacement
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item)}
                          disabled={busyItemId === item.id}
                          className="h-10 px-4 rounded-xl bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-widest disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Fee vs vendor-pay breakdown — never implies the full trip is already paid */}
        {(vendorPayTotal > 0 || feeAmount != null) && (
          <section className="mb-6 p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500">Estimated services total</span>
              <span className="text-sm font-black text-slate-900">₹{vendorPayTotal.toLocaleString('en-IN')}</span>
            </div>
            {feeAmount != null && (
              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-500">Platform reservation fee</span>
                <span className="text-sm font-black text-emerald-600">₹{feeAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="pt-3 border-t border-slate-200 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Pay now</span>
                <span className="text-lg font-black text-slate-900 italic">₹{(feeAmount ?? 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pay directly to local partners</span>
                <span className="text-sm font-black text-slate-500">₹{vendorPayTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium pt-2 leading-relaxed">
              Your reservation fee confirms and manages your booking through the platform. Remaining service amounts are paid directly to the respective local partners.
            </p>
          </section>
        )}

        {/* Reserve & Pay CTA — only actionable once every partner has accepted.
            The payment page itself rejects a CREATED-status booking ("not
            ready for payment yet — waiting on local partner confirmation"),
            so letting this button through in CREATED sent travelers into a
            dead-end error. Kept visible (disabled) rather than hidden so the
            fee amount and "why" stay in view while they wait. */}
        {(status === 'CREATED' || isReadyToReserve) && (
          <div className="mb-6 space-y-2">
            <button
              onClick={handleConfirmAndProceedToPay}
              disabled={busyItemId !== null || !isReadyToReserve}
              className={`w-full h-16 font-black text-base uppercase tracking-widest rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                isReadyToReserve
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25"
                  : "bg-slate-100 text-slate-400 shadow-none cursor-not-allowed"
              }`}
            >
              {busyItemId === -1 ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isReadyToReserve ? (
                <span>Reserve · Pay ₹{(feeAmount ?? 276.85).toLocaleString('en-IN')}</span>
              ) : (
                <span>Waiting for partner confirmation…</span>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-400 font-medium">
              {isReadyToReserve
                ? `Pay ₹${(feeAmount ?? 276.85).toLocaleString('en-IN')} platform reservation fee to confirm direct booking.`
                : "You'll be able to pay as soon as a local partner confirms."}
            </p>
          </div>
        )}

        {/* Vendor contacts — unlocked only after CONFIRMED */}
        {isReserved && (
          <section className="mb-6">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Local partner contacts</h2>
            {contacts === null ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 animate-pulse h-16" />
            ) : contacts.length === 0 ? (
              <p className="text-sm text-slate-400 font-medium px-1">Contact details will appear here shortly.</p>
            ) : (
              <div className="space-y-3">
                {contacts.map((c, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Day {c.day} · {c.category}</p>
                    <p className="text-sm font-black text-slate-900 mt-0.5">{c.businessName}</p>
                    {c.contactName && <p className="text-xs text-slate-500 font-medium mt-1">{c.contactName}</p>}
                    {c.phone && (
                      <a href={`tel:${c.phone}`} className="inline-block mt-2 text-xs font-black text-emerald-600">{c.phone}</a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {isDeadEnd && (
          <button
            onClick={() => router.push(`/${lang}/builder`)}
            className="w-full h-14 bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
          >
            Build a new trip
          </button>
        )}

        {/* PY-004 — this line used to be plain text with nothing behind it:
            "Need help? WhatsApp us" while the site had no WhatsApp anywhere.
            Now a real, config-driven link (and it disappears when no channel
            is configured, rather than promising a channel that doesn't exist). */}
        <SupportContact
          variant="bar"
          className="mt-8"
          reference={`Booking YATRI-${id}`}
          heading={`Need help with Booking YATRI-${id}?`}
        />
      </div>

      <DiscoveryDrawer
        isOpen={!!replaceDrawer.item}
        onClose={() => setReplaceDrawer({ item: null, vendors: [], loading: false })}
        category={replaceDrawer.item?.category || ''}
        vendors={replaceDrawer.vendors}
        onSelect={handleReplaceSelect}
      />
    </main>
  );
}
