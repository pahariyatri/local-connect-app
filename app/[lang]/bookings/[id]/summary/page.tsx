"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTripPlanner } from "@/contexts/TripPlannerContext";
import Typography from "../../../components/atoms/Typography";
import Button from "../../../components/atoms/Button";
import TopNavigation from "../../../components/organisms/TopNavigation";
import LocalImage from "../../../components/atoms/Image";
import { getBooking } from "@/services/bookingService";

export default function BookingSummaryPage() {
    const { lang, id } = useParams();
    const router = useRouter();
    const { destinations, startDate, endDate, guestCount } = useTripPlanner();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Load dictionary
    const [dict, setDict] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
    useEffect(() => {
      const loadDict = async () => {
        const d = await import(`@/dictionaries/${lang}.json`);
        setDict(d.default);
      };
      loadDict();
    }, [lang]);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const data = await getBooking(id as string);
                setBooking(data);
            } catch (error) {
                console.error("Failed to fetch booking", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchBooking();
    }, [id]);

    if (loading || !dict) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" /></div>;

    const nights = booking?.travelDate ? 3 : 3; // Fallback or computed from backend in real scenarios
    const totalAmount = booking?.totalAmount || 0;
    const paidAmount = booking?.payments?.find((p: any) => p.status === 'SUCCESS')?.amount || 0;
    const pendingAmount = totalAmount - paidAmount;

    const displayDestination = booking?.trip?.name || destinations.join(" & ") || "Your Himalayan Trip";
    const displayDates = booking?.travelDate ? new Date(booking.travelDate).toLocaleDateString() : "Upcoming";

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            <TopNavigation title={`Booking Summary`} />

            <main className="max-w-md mx-auto px-6 pt-24">
                
                {/* Hero Image Card */}
                <div className="relative h-64 rounded-[2.5rem] overflow-hidden shadow-2xl mb-8 group">
                    <LocalImage src={booking?.trip?.image || "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800"} alt="Trip Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase rounded-md tracking-widest leading-none">
                                {booking?.status || 'CREATED'}
                            </span>
                        </div>
                        <Typography variant="h1" className="text-3xl font-black text-white leading-none uppercase tracking-tight">
                            {displayDestination}
                        </Typography>
                        <p className="text-white/80 text-xs font-bold mt-2 uppercase tracking-wide">
                            {displayDates} • {nights} Nights
                        </p>
                    </div>
                </div>

                {/* Price Breakdown Card */}
                <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-100 mb-6 border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Payment Status</h3>
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-wider">Total Package</span>
                            <span className="font-black text-slate-900">₹{totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-wider">Paid Advance</span>
                            <span className="font-black text-emerald-600">- ₹{paidAmount.toLocaleString()}</span>
                        </div>
                        <div className="h-px bg-slate-100 w-full" />
                        <div className="flex justify-between items-center">
                            <span className="font-black text-slate-900 uppercase tracking-widest text-sm">Amount Due</span>
                            <span className="font-black text-rose-500 text-lg">₹{(totalAmount - paidAmount).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Inclusion List from Trip Snapshot */}
                <div className="mb-24">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 pl-4">Package Includes</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {booking?.trip?.services?.map((service: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-50 shadow-sm">
                                <span className="text-xl">🏔️</span>
                                <span className="text-[10px] font-bold text-slate-700 uppercase leading-tight">{service.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Floating Payment Action */}
                {pendingAmount > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50">
                        <div className="max-w-md mx-auto">
                             <Button 
                                onClick={() => router.push(`/${lang}/bookings/${id}/payment`)}
                                className="w-full h-16 rounded-[1.5rem] bg-slate-900 text-white font-black text-lg tracking-widest shadow-2xl shadow-slate-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                PAY NOW • ₹{pendingAmount.toLocaleString()}
                            </Button>
                            <p className="text-center text-[9px] font-bold text-slate-400 uppercase mt-3 tracking-widest flex items-center justify-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                Secure Escrow Payment
                            </p>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
