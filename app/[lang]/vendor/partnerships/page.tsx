"use client";

import React, { useState } from "react";
import Typography from "../../components/atoms/Typography";

const MOCK_PARTNERS = [
  { id: 1, name: "Eco Stay Resorts", location: "Manali", type: "Stay", status: "Connected", icon: "🏨" },
  { id: 2, name: "Extreme Peaks", location: "Kasol", type: "Adventure", status: "Discoverable", icon: "🏔️" },
  { id: 3, name: "Valley Cabs", location: "Kullu", type: "Taxi", status: "Pending", icon: "🚗" },
];

export default function PartnershipsPage() {
    const [search, setSearch] = useState("");

    const filtered = MOCK_PARTNERS.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.location.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-md mx-auto">
            <header className="mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <Typography variant="h1" className="text-4xl font-black text-slate-900 leading-tight">
                    Vendor <span className="text-emerald-500">Circle.</span>
                </Typography>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Connect with local legends</p>
            </header>

            {/* Premium Promo Card */}
            <div className="relative mb-10 overflow-hidden rounded-[3rem] bg-slate-900 p-10 shadow-2xl shadow-slate-200 animate-in zoom-in-95 duration-1000 delay-100 group">
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-4 text-center">Protocol Reward</p>
                    <h2 className="text-2xl font-black text-white text-center leading-tight italic tracking-tighter">Scale Better. Save 15% on Joint Packages.</h2>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent"></div>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
            </div>

            {/* Minimal Search Engine */}
            <div className="mb-10 p-1.5 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex items-center animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
                <div className="pl-6 text-slate-300">🔍</div>
                <input 
                    type="text" 
                    placeholder="FIND PARTNERS..." 
                    className="w-full h-14 bg-transparent outline-none px-4 text-[10px] font-black text-slate-900 placeholder:text-slate-300 uppercase tracking-widest"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Partnerships Feed */}
            <div className="space-y-4">
                {filtered.map((partner, idx) => (
                    <div 
                        key={partner.id} 
                        className="p-6 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-between group hover:border-emerald-100 transition-all duration-500 hover:shadow-xl hover:shadow-slate-100 animate-in fade-in slide-in-from-bottom-3 fill-mode-forwards"
                        style={{ animationDelay: `${idx * 100 + 300}ms` }}
                    >
                        <div className="flex gap-5 items-center">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-3xl group-hover:bg-emerald-50 transition-all duration-500 group-hover:rotate-6 text-slate-900">
                                {partner.icon}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 tracking-tighter uppercase text-sm leading-tight italic group-hover:text-emerald-500 transition-colors">{partner.name}</h4>
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1.5">{partner.location} • {partner.type}</p>
                            </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm transition-all duration-500 group-hover:scale-105 ${
                            partner.status === "Connected" ? "bg-emerald-500 text-white" : 
                            partner.status === "Pending" ? "bg-emerald-500 text-white animate-pulse" : 
                            "bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white"
                        }`}>
                            {partner.status}
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="py-20 text-center opacity-30">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">No legends found in this range</p>
                </div>
            )}
            
            <div className="mt-16 text-center pb-12 opacity-20">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">Network Mesh v.1.2</p>
            </div>
        </div>
    );
}
