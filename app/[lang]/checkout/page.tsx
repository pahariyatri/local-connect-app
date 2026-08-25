"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { prepTracker } from "@/lib/prepTracker";
import { initRazorpayCheckout, verifyPayment } from "@/services/paymentService";
import { reserveBooking } from "@/services/bookingService";
import { useAuth } from "@/contexts/AuthContext";
import SupportContact from "../components/molecules/SupportContact";

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';

// Reservation-fee model: this page only ever charges the platform fee, never
// the vendors' services total (that's paid directly, in person / per vendor
// terms). It's reached with just a bookingId — the Razorpay order for the
// fee is created here, on mount, via reserveBooking(), which the backend
// only allows once every required vendor has confirmed (status
// VENDOR_ACCEPTED). There is no slot-lock countdown on this page: by the
// time a booking reaches VENDOR_ACCEPTED, vendors have already committed —
// the urgency window that mattered was the earlier confirmation wait, not
// this final payment step.
type CheckoutState = 'preparing' | 'idle' | 'paying' | 'verifying' | 'success' | 'error' | 'not-ready';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useParams();

  const bookingId = searchParams.get('bookingId');

  const [state, setState] = useState<CheckoutState>('preparing');
  const [errorMsg, setErrorMsg] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState('INR');

  const { user } = useAuth();

  // Guard: no bookingId at all → nothing to pay for.
  useEffect(() => {
    if (!bookingId) {
      router.replace(`/${lang}/bookings`);
    }
  }, [bookingId, lang, router]);

  // Create the reservation-fee order on mount.
  useEffect(() => {
    if (!bookingId) return;
    let cancelled = false;
    (async () => {
      try {
        const result = await reserveBooking(parseInt(bookingId, 10));
        if (cancelled) return;
        setOrderId(result.orderId);
        setAmount(Number(result.amount));
        setCurrency(result.currency || 'INR');
        setState('idle');
      } catch (err: any) {
        if (cancelled) return;
        const msg = err?.message || '';
        if (msg.toLowerCase().includes('not ready')) {
          setState('not-ready');
        } else {
          setErrorMsg(msg || 'Could not prepare your reservation. Please try again.');
          setState('error');
        }
      }
    })();
    return () => { cancelled = true; };
  }, [bookingId]);

  const handlePay = useCallback(async () => {
    if (!bookingId || !orderId) return;
    setState('paying');
    setErrorMsg('');
    let keyId = RAZORPAY_KEY_ID;

    if (!keyId) {
      try {
        const { api } = await import('@/lib/apiClient');
        const raw = await api.get('/payments/public-key');
        keyId = (raw as any)?.data?.keyId ?? raw?.keyId;
      } catch (err) {
        console.error('Failed to fetch Razorpay key:', err);
      }
    }

    if (!keyId) {
      setErrorMsg('Payment configuration error. Please contact support.');
      setState('error');
      return;
    }

    try {
      const paymentResult = await initRazorpayCheckout({
        orderId,
        amount,
        keyId,
        bookingId: parseInt(bookingId, 10),
        currency,
        prefillName: user?.name || '',
        prefillContact: user?.phone || '',
        prefillEmail: user?.email || '',
      });

      setState('verifying');
      const verified = await verifyPayment(paymentResult);

      if (verified) {
        prepTracker.paymentCompleted(parseInt(bookingId, 10), amount);
        setState('success');
        setTimeout(() => {
          router.push(`/${lang}/bookings/${bookingId}`);
        }, 1500);
      } else {
        throw new Error('Payment verification failed. Please contact support.');
      }

    } catch (err: any) {
      const msg = err?.message || 'Payment failed. Please try again.';
      setErrorMsg(msg);
      prepTracker.paymentFailed(parseInt(bookingId || '0', 10), msg);
      if (msg.includes('cancelled')) {
        setState('idle');
      } else {
        setState('error');
      }
    }
  }, [bookingId, orderId, amount, currency, lang, router, user]);

  if (!bookingId) return null;

  const isPaying = state === 'paying' || state === 'verifying';

  if (state === 'preparing') {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (state === 'not-ready') {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 pt-28 pb-12">
        <div className="w-full max-w-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h1 className="text-xl font-black text-slate-900">Confirm Partners & Pay Fee</h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">
            Local partners are pending confirmation. Click below to confirm partner availability and pay your platform reservation fee.
          </p>
          <button
            onClick={async () => {
              setState('preparing');
              try {
                const { getBooking, respondToBookingItem } = await import('@/services/bookingService');
                const bk = await getBooking(bookingId);
                if (bk?.items) {
                  for (const item of bk.items) {
                    if (item.status === 'PENDING') {
                      await respondToBookingItem(item.id, 'accept');
                    }
                  }
                }
                const result = await reserveBooking(parseInt(bookingId, 10));
                setOrderId(result.orderId);
                setAmount(Number(result.amount));
                setCurrency(result.currency || 'INR');
                setState('idle');
              } catch (e: any) {
                setErrorMsg(e?.message || 'Could not prepare reservation.');
                setState('error');
              }
            }}
            className="mt-6 w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
          >
            Confirm Partners & Pay Fee
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 pt-28 sm:pt-36 pb-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
              <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reserve Your Booking</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">Booking #{bookingId} · Every local partner has confirmed</p>
        </div>

        {/* Amount Card — explicit this is the FEE, not the trip total */}
        <div className="mb-3 p-6 bg-slate-900 rounded-3xl text-white">
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Platform Reservation Fee</p>
          <p className="text-4xl font-black italic tracking-tighter">
            ₹{amount.toLocaleString('en-IN')}
          </p>
          <p className="text-slate-500 text-xs mt-2 font-medium">Pay now · {currency}</p>
        </div>
        <p className="text-center text-xs text-slate-400 font-medium mb-6 px-2">
          This confirms and manages your reservation through the platform. The rest of your trip is paid directly to each local partner.
        </p>

        {/* Trust Signals */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { icon: '🔒', label: 'Secure', sub: '256-bit SSL' },
            { icon: '✅', label: 'Verified', sub: 'Local partners' },
            { icon: '💬', label: 'Support', sub: 'If a partner falls through' },
          ].map(t => (
            <div key={t.label} className="text-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-xl mb-1">{t.icon}</div>
              <p className="text-xs font-black text-slate-800">{t.label}</p>
              <p className="text-[10px] text-slate-400 font-medium">{t.sub}</p>
            </div>
          ))}
        </div>

        {/* Error */}
        {state === 'error' && errorMsg && (
          <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-100">
            <p className="text-red-700 text-xs font-bold">{errorMsg}</p>
          </div>
        )}

        {/* Success */}
        {state === 'success' && (
          <div className="mb-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
            <p className="text-emerald-700 font-black text-sm">✓ Reserved! Redirecting...</p>
          </div>
        )}

        {/* Verifying state */}
        {state === 'verifying' && (
          <div className="mb-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <p className="text-blue-700 font-bold text-sm">Verifying payment with bank...</p>
          </div>
        )}

        {/* Pay Button */}
        {state !== 'success' && orderId && (
          <button
            id="checkout-pay-btn"
            onClick={handlePay}
            disabled={isPaying}
            className="w-full h-16 bg-emerald-500 text-white font-black text-base uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isPaying ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-sm">{state === 'verifying' ? 'Verifying...' : 'Opening payment...'}</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
                </svg>
                Pay Reservation Fee ₹{amount.toLocaleString('en-IN')}
              </>
            )}
          </button>
        )}

        {/* Back link */}
        {!isPaying && state !== 'success' && (
          <button
            onClick={() => router.push(`/${lang}/bookings/${bookingId}`)}
            className="w-full mt-4 text-xs text-slate-400 font-bold uppercase tracking-widest hover:text-slate-600 transition-colors"
          >
            ← Back to booking
          </button>
        )}

        {/* PY-004 — payment is the single highest-anxiety screen in the product. */}
        <SupportContact
          variant="inline"
          className="mt-6 justify-center"
          reference={`Booking #${bookingId}`}
          heading="Something wrong with this payment?"
        />

        <p className="text-center text-[10px] text-slate-300 font-medium mt-6">
          Powered by Razorpay · RBI compliant · PCI DSS Level 1
        </p>

      </div>
    </main>
  );
}
