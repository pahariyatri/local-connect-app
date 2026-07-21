"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Script from "next/script";
import Typography from "../../../components/atoms/Typography";
import Button from "../../../components/atoms/Button";
import TopNavigation from "../../../components/organisms/TopNavigation";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/services/paymentService";

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function PaymentPage() {
    const { lang, id } = useParams();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderData, setOrderData] = useState<any>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [payError, setPayError] = useState<string | null>(null);

    // Razorpay returns paise; every amount shown to the user derives from this
    // single source so the displayed total can never drift from the charged one.
    const amountPaise: number | null = orderData?.amount ?? null;
    const amountInr = amountPaise != null ? amountPaise / 100 : null;
    const formattedAmount =
        amountInr != null
            ? new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: orderData?.currency || "INR",
                maximumFractionDigits: 0,
            }).format(amountInr)
            : null;

    // Load order data on mount
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoadError(null);
                const order = await createRazorpayOrder(id as string);
                // Unwrap the API envelope: { success, data } or a plain order.
                const unwrapped = (order as any)?.data ?? order;
                if (unwrapped?.amount == null) {
                    throw new Error("Order is missing an amount");
                }
                setOrderData(unwrapped);
            } catch (error) {
                console.error("Failed to load order", error);
                setLoadError(
                    "We couldn't load your payment details. Please go back and try again.",
                );
            }
        };
        if (id) fetchOrder();
    }, [id]);

    const handlePayment = async () => {
        if (!orderData) return;

        setIsProcessing(true);
        setPayError(null);
        let keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

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
            setPayError("Payment is temporarily unavailable. Please try again shortly.");
            setIsProcessing(false);
            return;
        }

        const options = {
            key: keyId,
            // Sent verbatim from the backend order — never a client-side figure.
            amount: orderData.amount,
            currency: orderData.currency,
            name: "Local Connect",
            description: `Booking #${id}`,
            order_id: orderData.id,
            handler: async (response: any) => {
                try {
                    const verification = await verifyRazorpayPayment({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    });

                    if (verification) {
                        router.push(`/${lang}/bookings/${id}/success`);
                    } else {
                        setPayError(
                            "We couldn't verify your payment. If you were charged, it will be reconciled automatically — please contact support before retrying.",
                        );
                    }
                } catch (error) {
                    console.error("Verification error", error);
                    setPayError(
                        "We couldn't confirm your payment. Please check your bookings before retrying.",
                    );
                } finally {
                    setIsProcessing(false);
                }
            },
            modal: {
                // Without this the button stays stuck in "processing" after a dismiss.
                ondismiss: () => setIsProcessing(false),
            },
            theme: {
                color: "#10b981",
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (resp: any) => {
            setPayError(resp?.error?.description || "Payment failed. Please try again.");
            setIsProcessing(false);
        });
        rzp.open();
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            {/* next/script dedupes and guarantees load ordering; the previous raw
                <script async> tag raced with handlePayment reading window.Razorpay. */}
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="afterInteractive"
            />
            <TopNavigation title="Secure Payment" />

            <main className="max-w-md mx-auto px-6 pt-24">

                {/* Amount Header */}
                <div className="text-center mb-10 animate-fade-in">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Payable Amount</p>
                    {formattedAmount ? (
                        <Typography variant="h1" className="text-5xl font-black text-slate-900 tracking-tighter">
                            {formattedAmount}
                        </Typography>
                    ) : (
                        // Skeleton, not a placeholder figure — showing a number we
                        // haven't confirmed risks displaying one we won't charge.
                        <div
                            className="h-12 w-44 mx-auto rounded-xl bg-slate-200 animate-pulse"
                            role="status"
                            aria-label="Loading total amount"
                        />
                    )}
                </div>

                {loadError && (
                    <div
                        role="alert"
                        className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-center"
                    >
                        <p className="text-sm font-bold text-red-900">{loadError}</p>
                    </div>
                )}

                {/* Payment method is chosen inside Razorpay's own secure window.
                    The previous in-page card form collected raw PAN/CVC into our
                    DOM (a PCI-DSS violation) and the UPI deep link pointed at a
                    non-existent merchant VPA with a hardcoded amount. Both removed. */}
                <div className="mb-10 rounded-[1.5rem] bg-white border border-slate-200 p-5">
                    <p className="text-sm font-bold text-slate-900 mb-1">Pay securely via Razorpay</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        You&apos;ll choose UPI, card, or net banking in Razorpay&apos;s secure
                        window. Local Connect never sees or stores your card details.
                    </p>
                </div>

                {payError && (
                    <div
                        role="alert"
                        aria-live="assertive"
                        className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4"
                    >
                        <p className="text-sm font-bold text-red-900">{payError}</p>
                    </div>
                )}

                {/* Pay Button */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50">
                    <div className="max-w-md mx-auto">
                        <Button
                            onClick={handlePayment}
                            // Disabled until a backend order exists, so the button can
                            // no longer silently no-op when the order fetch fails.
                            disabled={isProcessing || !orderData}
                            className={`w-full h-16 rounded-[1.5rem] font-black text-lg tracking-widest shadow-2xl transition-all ${isProcessing || !orderData ? "bg-slate-800 text-white/50" : "bg-emerald-500 text-white shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]"
                                }`}
                        >
                            {isProcessing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    PROCESSING...
                                </span>
                            ) : formattedAmount ? `PAY ${formattedAmount}` : "LOADING…"}
                        </Button>
                    </div>
                </div>

            </main>
        </div>
    );
}
