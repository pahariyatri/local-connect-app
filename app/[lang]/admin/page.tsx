"use client";

import React, { useEffect } from "react";
import Typography from "../components/atoms/Typography";
import Button from "../components/atoms/Button";
import TopNavigation from "../components/organisms/TopNavigation";
import BottomNavigation from "../components/organisms/BottomNavigation";
import MetricsCard from "../components/organisms/MetricsCard";


export default function AdminDashboard() {
    useEffect(() => {
        // Platform init logs
    }, []);

    const verificationQueue = [
        { id: "v1", name: "Himalayan Treks & Co", type: "Vendor", date: "2h ago", proofStatus: "Ready" },
        { id: "v2", name: "Rajesh Kumar", type: "Broker", date: "5h ago", proofStatus: "Pending" },
        { id: "v3", name: "Alpine Homestays", type: "Vendor", date: "1d ago", proofStatus: "Ready" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            <TopNavigation title="Admin Control" />
            
            <main className="max-w-md mx-auto px-6 pt-24">
                {/* 🛡️ Admin Header */}
                <header className="mb-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <Typography variant="h1" className="text-3xl font-black text-indigo-900 leading-tight">
                                Platform Health
                            </Typography>
                            <p className="text-slate-500 font-bold flex items-center gap-1">
                                System Status: <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Optimal
                            </p>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        </div>
                    </div>
                </header>

                {/* 📊 Vital Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <MetricsCard label="Total GMV" value="₹1.2M" icon="📈" />
                    <MetricsCard label="New Signups" value="84" icon="👥" />
                </div>

                {/* 🚨 Immediate Attention */}
                <section className="mb-10">
                    <Typography variant="h3" className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Verification Queue</Typography>
                    
                    <div className="space-y-4">
                        {verificationQueue.map((item) => (
                            <div key={item.id} className="glass border-white/50 p-5 rounded-3xl flex justify-between items-center hover:bg-white/80 transition-all cursor-pointer group">
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">
                                        {item.type === "Vendor" ? "🏠" : "🤵"}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 text-sm">{item.name}</h4>
                                        <p className="text-[10px] font-bold text-slate-400">{item.type} • Applied {item.date}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter ${
                                        item.proofStatus === "Ready" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                                    }`}>
                                        {item.proofStatus}
                                    </span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 group-hover:text-emerald-500 transition-colors"><path d="m9 18 6-6-6-6"/></svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ⚡ Platform Actions */}
                <section className="mb-10">
                    <Typography variant="h3" className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Quick Actions</Typography>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: "Disputes", icon: "⚖️", count: "3", color: "bg-red-50 text-red-600" },
                            { label: "Withdrawals", icon: "💰", count: "12", color: "bg-emerald-50 text-emerald-600" },
                            { label: "Flagged", icon: "🚩", count: "0", color: "bg-amber-50 text-amber-600" },
                            { label: "Promotions", icon: "🎟️", count: "5", color: "bg-indigo-50 text-indigo-600" },
                        ].map((action, idx) => (
                            <button key={idx} className="glass p-5 rounded-3xl border-transparent hover:border-white/50 hover:bg-white/80 transition-all text-left">
                                <div className={`w-10 h-10 rounded-2xl ${action.color} flex items-center justify-center text-xl mb-4`}>
                                    {action.icon}
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="font-black text-slate-900 text-sm">{action.label}</p>
                                    <span className="text-xs font-black opacity-50">{action.count}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                <Button className="w-full bg-slate-900 text-white h-16 rounded-[2rem] shadow-xl shadow-slate-200 font-black">
                    Go to Global Analytics Console
                </Button>
            </main>

            <BottomNavigation />
        </div>
    );
}
