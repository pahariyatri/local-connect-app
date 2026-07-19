"use client";

import React from "react";
import Typography from "../../components/atoms/Typography";
import Button from "../../components/atoms/Button";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import Loading from "@/app/loading";

const MOCK_BOOKINGS = [
  { 
    id: "BK-9021", 
    service: "Luxury Mountain Retreat", 
    customer: "John Doe", 
    status: "confirmed", 
    date: "24 Oct 2026", 
    revenue: 5500,
    travelers: "2 Adults",
    icon: "🏨"
  },
  { 
    id: "BK-8842", 
    service: "4x4 Mountain Safari", 
    customer: "Jane Smith", 
    status: "pending", 
    date: "12 Nov 2026", 
    revenue: 3200,
    travelers: "4 Adults",
    icon: "🏎️"
  },
  { 
    id: "BK-8810", 
    service: "Traditional Thali Experience", 
    customer: "Amit Varma", 
    status: "completed", 
    date: "10 Feb 2026", 
    revenue: 1200,
    travelers: "1 Adult",
    icon: "🍱"
  },
];

export default function ManageBookingsPage() {
    const { dict, loading } = useLocalizationContext();

    if (loading || !dict) return <Loading />;

    const res = dict.page.vendor_onboarding.guest_assists;
    const bookingRes = dict.page.vendor_dashboard.bookings;

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "confirmed": return bookingRes.filters.confirmed;
            case "pending": return bookingRes.filters.pending;
            case "completed": return bookingRes.filters.completed;
            default: return status;
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <header className="mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <Typography variant="h1" className="text-4xl font-black text-slate-900 leading-tight">
                    Guests <span className="text-emerald-500">&</span> Assists.
                </Typography>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">{res.subtitle}</p>
            </header>

            <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col justify-between h-36 relative overflow-hidden group">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none relative z-10">{res.stats.total_rev}</p>
                    <p className="text-3xl font-black text-slate-900 relative z-10 italic">₹9,900</p>
                    <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
                </div>
                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col justify-between h-36 relative overflow-hidden group">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none relative z-10">{res.stats.active}</p>
                    <p className="text-3xl font-black text-emerald-500 relative z-10 italic">{MOCK_BOOKINGS.length}</p>
                    <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
                </div>
            </div>

            <div className="space-y-6">
                {MOCK_BOOKINGS.map((booking, idx) => (
                    <div 
                        key={booking.id} 
                        className="premium-card p-1 bg-white relative overflow-hidden group hover:border-emerald-100 transition-all active:scale-[0.98] animate-in fade-in slide-in-from-bottom-5 duration-700"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex gap-5 items-center">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-3xl group-hover:bg-emerald-50 transition-all duration-500 hover:rotate-6">
                                        {booking.icon}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1.5">{booking.id}</p>
                                        <h3 className="text-lg font-black text-slate-900 leading-tight uppercase tracking-tighter">{booking.service}</h3>
                                    </div>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                                    booking.status === "confirmed" ? "bg-emerald-500 text-white" : booking.status === "pending" ? "bg-emerald-500 text-white animate-pulse" : "bg-slate-100 text-slate-400"
                                }`}>
                                    {getStatusLabel(booking.status)}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-y-6 mb-10 pt-6 border-t border-slate-50">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{res.card.guest}</p>
                                    <p className="text-sm font-black text-slate-900">{booking.customer}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Group size</p>
                                    <p className="text-sm font-black text-slate-900">{booking.travelers}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{res.card.date}</p>
                                    <p className="text-sm font-black text-slate-900">{booking.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{res.card.earnings}</p>
                                    <p className="text-lg font-black text-emerald-600">₹{booking.revenue.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {booking.status === "pending" ? (
                                    <>
                                        <Button className="flex-1 h-16 rounded-[1.5rem] bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-600 transition-all active:scale-95">
                                            {res.card.accept}
                                        </Button>
                                        <Button variant="ghost" className="flex-1 h-16 rounded-[1.5rem] text-slate-400 font-black text-[11px] uppercase tracking-[0.2em] border border-slate-100 hover:text-rose-500 transition-all active:scale-95">
                                            {res.card.decline}
                                        </Button>
                                    </>
                                ) : (
                                    <Button className="w-full h-16 rounded-[1.5rem] bg-slate-50 hover:bg-white hover:border-emerald-100 text-slate-900 font-black text-[11px] uppercase tracking-[0.2em] border border-slate-100 transition-all active:scale-95">
                                        {res.card.details} ⚡
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-16 text-center pb-12">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">End of feed</p>
            </div>
        </div>
    );
}
