"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { prepTracker } from "@/lib/prepTracker";
import { initRazorpayCheckout, verifyPayment } from "@/services/paymentService";
import { useAuth } from "@/contexts/AuthContext";

// Slot lock duration: 15 minutes = 900 seconds
const LOCK_DURATION_SECONDS = 14 * 60; // 14 min countdown (backend gives 15 min, we show 14)
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';

type CheckoutState = 'idle' | 'paying' | 'verifying' | 'success' | 'error';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useParams();

  const bookingId = searchParams.get('bookingId');
  const orderId = searchParams.get('orderId');
  const amount = parseFloat(searchParams.get('amount') || '0');
  const currency = searchParams.get('currency') || 'INR';

  const [state, setState] = useState<CheckoutState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(LOCK_DURATION_SECONDS);
  const [expired, setExpired] = useState(false);

  const { user } = useAuth();

  // Guard: redirect if missing required params (never open payment without bookingId)
  useEffect(() => {
    if (!bookingId || !orderId || !amount) {
      router.replace(`/${lang}/builder`);
    }
  }, [bookingId, orderId, amount, lang, router]);

  // Slot lock countdown
  useEffect(() => {
    if (state === 'success') return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handlePay = useCallback(async () => {
    if (!bookingId || !orderId || expired) return;
    setState('paying');
    setErrorMsg('');
    let keyId = RAZORPAY_KEY_ID;

    // Fallback: Fetch from backend if env variable missed the build
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
      // Open Razorpay — inventory already locked server-side
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

      // Step 2: Verify with backend — NEVER trust redirect alone
      setState('verifying');
      const verified = await verifyPayment(paymentResult);

      if (verified) {
        prepTracker.paymentCompleted(parseInt(bookingId, 10), amount);
        setState('success');
        // Small pause for UX, then go to booking confirmation (which polls status)
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
      // Cancelled by user is not an error — go back to idle
      if (msg.includes('cancelled')) {
        setState('idle');
      } else {
        setState('error');
      }
    }
  }, [bookingId, orderId, amount, currency, expired, lang, router]);

  if (!bookingId || !orderId) return null;

  const isPaying = state === 'paying' || state === 'verifying';

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
              <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Complete Your Booking</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">Booking #{bookingId} · Slots reserved for you</p>
        </div>

        {/* Slot Lock Timer */}
        {!expired && state !== 'success' && (
          <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-4 ${secondsLeft < 120 ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${secondsLeft < 120 ? 'bg-red-100' : 'bg-amber-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={secondsLeft < 120 ? 'text-red-600' : 'text-amber-600'}>
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <p className={`text-xs font-black uppercase tracking-widest ${secondsLeft < 120 ? 'text-red-600' : 'text-amber-700'}`}>Slots locked for</p>
              <p className={`text-2xl font-black tabular-nums ${secondsLeft < 120 ? 'text-red-700' : 'text-amber-800'}`}>{formatTime(secondsLeft)}</p>
            </div>
          </div>
        )}

        {/* Expired State */}
        {expired && state !== 'success' && (
          <div className="mb-6 p-4 rounded-2xl border bg-red-50 border-red-100 text-center">
            <p className="text-red-700 font-black text-sm">Session expired. Slots released.</p>
            <button
              onClick={() => router.push(`/${lang}/results`)}
              className="mt-3 text-xs font-bold text-red-600 underline underline-offset-2"
            >
              Go back and try again
            </button>
          </div>
        )}

        {/* Amount Card */}
        <div className="mb-6 p-6 bg-slate-900 rounded-3xl text-white">
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Total Amount</p>
          <p className="text-4xl font-black italic tracking-tighter">
            ₹{amount.toLocaleString('en-IN')}
          </p>
          <p className="text-slate-500 text-xs mt-2 font-medium">Taxes & fees included · {currency}</p>
        </div>

        {/* Trust Signals */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { icon: '🔒', label: 'Secure', sub: '256-bit SSL' },
            { icon: '✅', label: 'Verified', sub: 'Local vendors' },
            { icon: '💰', label: 'Refundable', sub: '24hr policy' },
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
            <p className="text-emerald-700 font-black text-sm">✓ Payment verified! Redirecting...</p>
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
        {state !== 'success' && (
          <button
            id="checkout-pay-btn"
            onClick={handlePay}
            disabled={isPaying || expired}
            className="w-full h-16 bg-emerald-500 text-white font-black text-base uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isPaying ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-sm">{state === 'verifying' ? 'Verifying...' : 'Opening payment...'}</span>
              </>
            ) : expired ? (
              'Session Expired'
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
                </svg>
                Pay ₹{amount.toLocaleString('en-IN')}
              </>
            )}
          </button>
        )}

        {/* Back link */}
        {!isPaying && state !== 'success' && (
          <button
            onClick={() => router.back()}
            className="w-full mt-4 text-xs text-slate-400 font-bold uppercase tracking-widest hover:text-slate-600 transition-colors"
          >
            ← Go back
          </button>
        )}

        {/* Razorpay note */}
        <p className="text-center text-[10px] text-slate-300 font-medium mt-6">
          Powered by Razorpay · RBI compliant · PCI DSS Level 1
        </p>

      </div>
    </main>
  );
}
