"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Typography from "../../../components/atoms/Typography";
import TopNavigation from "../../../components/organisms/TopNavigation";
import Button from "../../../components/atoms/Button";

// Mock Live Status Data
const MOCK_STATUS = {
    id: "BK-9021",
    overallStatus: "Trip Ongoing",
    currentLocation: "En route to Kasol",
    nextStop: "Parvati Valley Basecamp",
    eta: "45 mins",
    checkpoints: [
        { id: 1, label: "Stay Confirmed", time: "09:00 AM", status: "completed", icon: "🏨" },
        { id: 2, label: "Cab Dispatched", time: "10:30 AM", status: "completed", icon: "🚗" },
        { id: 3, label: "Border Crossing", time: "01:45 PM", status: "active", icon: "🛂" },
        { id: 4, label: "Hotel Check-in", time: "06:00 PM", status: "pending", icon: "🔑" }
    ],
    driver: { name: "Rajesh Singh", phone: "+91 98765-43210", vehicle: "SUV • HP 01 A 1234" }
};

export default function BookingStatusPage() {
    const { id, lang } = useParams();
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-900 pb-32">
            <TopNavigation title="Live Tracking" transparent />
            
            <main className="max-w-md mx-auto px-6 pt-24">
                {/* 🏔️ Massive Visual Status */}
                <div className="text-center mb-12">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-500/20 flex items-center justify-center text-4xl mx-auto mb-6 border border-emerald-500/30 animate-pulse">
                        🚐
                    </div>
                    <Typography variant="h1" className="text-4xl font-black text-white leading-tight uppercase tracking-tight">
                        {MOCK_STATUS.overallStatus}
                    </Typography>
                    <p className="text-emerald-400 font-black text-xs uppercase tracking-[0.3em] mt-2">ETA: {MOCK_STATUS.eta}</p>
                </div>

                {/* 🗺️ Current Log */}
                <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/10 mb-8">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Current</p>
                            <p className="text-sm font-black text-white">{MOCK_STATUS.currentLocation}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Next</p>
                            <p className="text-sm font-black text-slate-300">{MOCK_STATUS.nextStop}</p>
                        </div>
                    </div>

                    <div className="space-y-8 relative pl-6">
                        <div className="absolute left-[3px] top-2 bottom-2 w-[1px] bg-white/10" />
                        {MOCK_STATUS.checkpoints.map((cp) => (
                            <div key={cp.id} className="relative flex justify-between items-center">
                                <div className={`absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full border-2 border-slate-900 shadow-sm ${
                                    cp.status === "completed" ? "bg-emerald-500" : 
                                    cp.status === "active" ? "bg-amber-500" : "bg-slate-700"
                                }`} />
                                <div>
                                    <p className={`text-xs font-black uppercase tracking-tight ${
                                        cp.status === "pending" ? "text-slate-500" : "text-white"
                                    }`}>
                                        {cp.icon} {cp.label}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-500 mt-0.5">{cp.time}</p>
                                </div>
                                {cp.status === "active" && (
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 🚗 Driver Card */}
                <div className="glass p-6 rounded-[2rem] border-white/10 flex items-center gap-5 mb-10 bg-white/5 text-white">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-2xl flex items-center justify-center shadow-emerald-500/20">
                        👨‍✈️
                    </div>
                    <div className="flex-1">
                        <h4 className="font-black text-sm uppercase truncate">{MOCK_STATUS.driver.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">{MOCK_STATUS.driver.vehicle}</p>
                    </div>
                    <button className="h-12 w-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl">
                        📞
                    </button>
                </div>

                <div className="flex gap-4">
                    <Button 
                        onClick={() => router.push(`/${lang}/bookings/${id}/summary`)}
                        className="flex-1 h-14 rounded-[2rem] bg-white/10 text-white font-black text-xs uppercase tracking-widest border border-white/10"
                    >
                        VIEW SUMMARY
                    </Button>
                    <Button 
                        className="flex-1 h-14 rounded-[2rem] bg-emerald-500 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-900"
                    >
                        SOS HELP 🆘
                    </Button>
                </div>
            </main>
        </div>
    );
}
