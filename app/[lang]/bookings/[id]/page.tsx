"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";

type BookingStatus = 'created' | 'payment_pending' | 'confirmed' | 'cancelled' | 'abandoned' | 'unknown';

interface BookingData {
  id: number;
  status: BookingStatus;
  totalAmount: number;
  currency: string;
  travelDate: string;
  trip?: { name?: string; totalPrice?: number };
  user?: { name?: string; email?: string };
  payments?: Array<{ status: string; amount: number }>;
  createdAt: string;
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  created: 'Booking created',
  payment_pending: 'Payment processing...',
  confirmed: 'Booking Confirmed!',
  cancelled: 'Booking Cancelled',
  abandoned: 'Booking Expired',
  unknown: 'Loading...',
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  created: 'text-amber-600 bg-amber-50 border-amber-100',
  payment_pending: 'text-blue-600 bg-blue-50 border-blue-100',
  confirmed: 'text-emerald-700 bg-emerald-50 border-emerald-100',
  cancelled: 'text-red-600 bg-red-50 border-red-100',
  abandoned: 'text-slate-500 bg-slate-50 border-slate-100',
  unknown: 'text-slate-400 bg-slate-50 border-slate-100',
};

export default function BookingConfirmationPage() {
  const { id, lang } = useParams() as { id: string; lang: string };
  const router = useRouter();

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pollCount, setPollCount] = useState(0);

  const fetchBooking = useCallback(async () => {
    try {
      const resp = await api.get(`/booking/${id}`, { skipCache: true });
      // Handle standard envelope { success, data } or direct object
      const data: BookingData = resp?.data || resp;
      setBooking(data);
      setError('');
      return data.status;
    } catch (err: any) {
      setError(err?.message || 'Could not load booking details.');
      return 'unknown' as BookingStatus;
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Initial load
  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  // Polling: if status is payment_pending, poll every 3s (webhook sets confirmed)
  // Stop after 20 polls (~60 seconds)
  useEffect(() => {
    if (!booking) return;
    if (booking.status !== 'payment_pending') return;
    if (pollCount >= 20) return;

    const timer = setTimeout(async () => {
      const newStatus = await fetchBooking();
      setPollCount(prev => prev + 1);
      if (newStatus === 'confirmed' || newStatus === 'cancelled') {
        // Done polling
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [booking, pollCount, fetchBooking]);

  const status = (booking?.status || 'unknown') as BookingStatus;
  const isPending = status === 'payment_pending' || status === 'created';
  const isConfirmed = status === 'confirmed';
  const isFailed = status === 'cancelled' || status === 'abandoned';

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">

        {/* Status Icon */}
        <div className="text-center mb-8">
          {isConfirmed && (
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
          )}
          {isPending && (
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {isFailed && (
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                <circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/>
              </svg>
            </div>
          )}

          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
            {STATUS_LABELS[status]}
          </h1>
          <p className="text-slate-400 text-sm font-medium">Booking #{id}</p>
        </div>

        {/* Status Badge */}
        <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 ${STATUS_COLORS[status]}`}>
          {isPending && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />}
          <div>
            <p className="font-black text-sm">{STATUS_LABELS[status]}</p>
            {isPending && (
              <p className="text-xs opacity-70 font-medium mt-0.5">
                We're confirming your payment with the bank. This usually takes under 30 seconds.
              </p>
            )}
            {isConfirmed && (
              <p className="text-xs opacity-70 font-medium mt-0.5">
                Your booking is confirmed and vendors have been notified.
              </p>
            )}
          </div>
        </div>

        {/* Booking Details */}
        {booking && (
          <div className="mb-6 p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Amount</span>
              <span className="text-2xl font-black text-slate-900 italic">
                ₹{Number(booking.totalAmount).toLocaleString('en-IN')}
              </span>
            </div>
            {booking.travelDate && (
              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Travel Date</span>
                <span className="text-sm font-black text-slate-700">
                  {new Date(booking.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}
            {booking.trip?.name && (
              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Package</span>
                <span className="text-sm font-black text-slate-700">{booking.trip.name}</span>
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-2xl border border-red-100">
            <p className="text-red-700 text-sm font-bold">{error}</p>
            <button onClick={fetchBooking} className="mt-2 text-xs font-bold text-red-600 underline">Retry</button>
          </div>
        )}

        {/* Next Actions */}
        {isConfirmed && (
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/${lang}/profile`)}
              className="w-full h-14 bg-slate-900 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all"
            >
              View My Bookings
            </button>
            <button
              onClick={() => router.push(`/${lang}`)}
              className="w-full h-12 bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl active:scale-95 transition-all"
            >
              Explore More
            </button>
          </div>
        )}

        {isFailed && (
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/${lang}/results`)}
              className="w-full h-14 bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Support note */}
        <p className="text-center text-[10px] text-slate-300 font-medium mt-6">
          Need help? WhatsApp us with Booking #{id}
        </p>
      </div>
    </main>
  );
}