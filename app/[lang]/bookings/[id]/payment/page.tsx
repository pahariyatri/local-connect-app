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
    const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi");
    const [orderData, setOrderData] = useState<any>(null);

    // Mock UI State
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCVC, setCardCVC] = useState("");
    const [cardName, setCardName] = useState("");
    const upiDeepLink = "upi://pay?pa=merchant@upi&pn=LocalConnect&am=19500&cu=INR";

    // Load order data on mount
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const order = await createRazorpayOrder(id as string);
                setOrderData(order);
            } catch (error) {
                console.error("Failed to load order", error);
            }
        };
        if (id) fetchOrder();
    }, [id]);

    const handlePayment = async () => {
        if (!orderData) return;

        setIsProcessing(true);
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
            alert("Payment configuration error. Authentication key missing.");
            setIsProcessing(false);
            return;
        }

        const options = {
            key: keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "PahariYatri",
            description: "Trip Booking Payment",
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
                        alert("Payment verification failed");
                    }
                } catch (error) {
                    console.error("Verification error", error);
                } finally {
                    setIsProcessing(false);
                }
            },
            prefill: {
                name: "Traveller Name",
                email: "traveller@example.com",
                contact: "9999999999",
            },
            theme: {
                color: "#10b981",
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
            <TopNavigation title="Secure Payment" />

            <main className="max-w-md mx-auto px-6 pt-24">

                {/* Amount Header */}
                <div className="text-center mb-10 animate-fade-in">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Payable Amount</p>
                    <Typography variant="h1" className="text-5xl font-black text-slate-900 tracking-tighter">
                        ₹19,500
                    </Typography>
                </div>

                {/* Method Selection */}
                <div className="space-y-4 mb-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Choose Payment Method</p>

                    {/* UPI Option */}
                    <div className={`rounded-[1.5rem] border-2 transition-all overflow-hidden ${paymentMethod === "upi" ? "bg-white border-emerald-500 shadow-xl shadow-emerald-500/10" : "bg-white border-transparent shadow-sm opacity-60 hover:opacity-100"
                        }`}>
                        <button
                            onClick={() => setPaymentMethod("upi")}
                            className="w-full p-4 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-xl">
                                    ⚡
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-black text-slate-900 uppercase">UPI / GPay</p>
                                    <p className="text-[10px] font-bold text-slate-400">Instant Verification</p>
                                </div>
                            </div>
                            {paymentMethod === "upi" && (
                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12" /></svg>
                                </div>
                            )}
                        </button>

                        {/* Expanded UPI Content */}
                        {paymentMethod === "upi" && (
                            <div className="px-4 pb-6 pt-2 animate-fade-in">
                                <p className="text-xs text-slate-500 mb-4 px-2">Tap below to open your preferred UPI app directly.</p>
                                <a
                                    href={upiDeepLink}
                                    className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-slate-900 text-white font-bold text-sm uppercase tracking-wide hover:bg-black transition-colors"
                                >
                                    <span>Open UPI App</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                </a>
                                <div className="flex justify-center mt-4 gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                                    {/* Mock Icons for GPay, PhonePe, Paytm */}
                                    <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                                    <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                                    <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Card Option */}
                    <div className={`rounded-[1.5rem] border-2 transition-all overflow-hidden ${paymentMethod === "card" ? "bg-white border-emerald-500 shadow-xl shadow-emerald-500/10" : "bg-white border-transparent shadow-sm opacity-60 hover:opacity-100"
                        }`}>
                        <button
                            onClick={() => setPaymentMethod("card")}
                            className="w-full p-4 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-xl">
                                    💳
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-black text-slate-900 uppercase">Card</p>
                                    <p className="text-[10px] font-bold text-slate-400">Credit or Debit</p>
                                </div>
                            </div>
                            {paymentMethod === "card" && (
                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12" /></svg>
                                </div>
                            )}
                        </button>

                        {/* Expanded Card Form */}
                        {paymentMethod === "card" && (
                            <div className="px-4 pb-6 pt-2 space-y-3 animate-fade-in">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Card Number</label>
                                    <input
                                        type="text"
                                        placeholder="0000 0000 0000 0000"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500 font-bold text-slate-900 placeholder:text-slate-300 transition-colors"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <div className="space-y-1 flex-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Expiry</label>
                                        <input
                                            type="text"
                                            placeholder="MM/YY"
                                            value={cardExpiry}
                                            onChange={(e) => setCardExpiry(e.target.value)}
                                            className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500 font-bold text-slate-900 placeholder:text-slate-300 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">CVC</label>
                                        <input
                                            type="text"
                                            placeholder="123"
                                            value={cardCVC}
                                            onChange={(e) => setCardCVC(e.target.value)}
                                            className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500 font-bold text-slate-900 placeholder:text-slate-300 transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Cardholder Name</label>
                                    <input
                                        type="text"
                                        placeholder="JOHN DOE"
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500 font-bold text-slate-900 placeholder:text-slate-300 transition-colors uppercase"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Trust Signals */}
                <div className="grid grid-cols-2 gap-4 mb-24">
                    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-center">
                        <div className="w-8 h-8 mx-auto mb-2 text-emerald-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        </div>
                        <p className="text-[9px] font-black text-slate-900 uppercase">256-bit Secure</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-center">
                        <div className="w-8 h-8 mx-auto mb-2 text-emerald-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
                        </div>
                        <p className="text-[9px] font-black text-emerald-900 uppercase">Money Back Guarantee</p>
                    </div>
                </div>

                {/* Pay Button */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50">
                    <div className="max-w-md mx-auto">
                        <Button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className={`w-full h-16 rounded-[1.5rem] font-black text-lg tracking-widest shadow-2xl transition-all ${isProcessing ? "bg-slate-800 text-white/50" : "bg-emerald-500 text-white shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]"
                                }`}
                        >
                            {isProcessing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    PROCESSING...
                                </span>
                            ) : `PAY ₹19,500`}
                        </Button>
                    </div>
                </div>

            </main>
        </div>
    );
}
