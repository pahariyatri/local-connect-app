"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Service } from "./types";
import Typography from "../../components/atoms/Typography";
import Button from "../../components/atoms/Button";
import LocalImage from "../../components/atoms/Image";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import Loading from "@/app/loading";

export default function ServiceListPage() {
  const router = useRouter();
  const { lang, dict, loading } = useLocalizationContext();
  
  const [services] = useState<Service[]>([
    {
      id: 1,
      name: "Luxury Mountain Retreat",
      prices: { weekday: 4200, weekend: 5500 },
      availability: "Weekends Only",
      status: "active",
      category: "Stay",
      subLocation: "Old Manali",
      image: "https://images.unsplash.com/photo-1651319485646-f0f30e46b761?q=80&w=800",
      hasActiveBookings: true,
      capacity: 4
    },
    {
      id: 2,
      name: "4x4 Mountain Safari",
      prices: { weekday: 2800, weekend: 3200 },
      availability: "Daily",
      status: "active",
      category: "Transportation",
      subLocation: "Rohtang Pass",
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800",
      hasActiveBookings: false,
      capacity: 6
    }
  ]);

  if (loading || !dict) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Minimalist Header */}
        <header className="pt-8 pb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="flex justify-between items-start mb-4">
                <div>
                   <Typography variant="h1" className="text-5xl font-black text-slate-900 tracking-tight leading-none italic">
                        Inventory.
                    </Typography>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-3">Live Fleet & Assets</p>
                </div>
                <button 
                    onClick={() => router.push(`/${lang}/vendor/services/new`)}
                    className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all text-2xl group"
                >
                    <span className="group-hover:rotate-90 transition-transform duration-500">＋</span>
                </button>
            </div>
        </header>

        {/* High-End Card Grid */}
        <div className="space-y-10">
            {services.map((service, idx) => (
                <div 
                    key={service.id} 
                    className="group relative animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-forwards"
                    style={{ animationDelay: `${idx * 200}ms` }}
                >
                    <div 
                        onClick={() => router.push(`/${lang}/vendor/services/${service.id}/edit`)}
                        className="bg-white rounded-[3.5rem] overflow-hidden border border-slate-100 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.08)] hover:shadow-2xl hover:shadow-indigo-50 transition-all duration-700 cursor-pointer"
                    >
                        {/* Immersive Image Header */}
                        <div className="relative h-80 w-full overflow-hidden">
                            <LocalImage src={service.image || ""} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            
                            {/* Status Floats */}
                            <div className="absolute top-8 left-8 flex flex-col gap-2">
                                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md border border-white/20 shadow-2xl ${
                                    service.status === 'active' ? 'bg-emerald-500/90 text-white' : 'bg-slate-900/90 text-white'
                                }`}>
                                    {service.status === 'active' ? '✓ Online' : '• Draft'}
                                </div>
                                {service.hasActiveBookings && (
                                    <div className="px-4 py-1.5 rounded-full text-[9px] font-black bg-white/90 backdrop-blur-md text-slate-900 uppercase tracking-widest shadow-2xl flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                                        Locked
                                    </div>
                                )}
                            </div>

                            {/* Tactical Bottom Info */}
                            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                                <div>
                                    <h3 className="text-3xl font-black text-white leading-none uppercase tracking-tighter italic">{service.name}</h3>
                                    <div className="flex items-center gap-2 text-white/60 mt-3 text-[10px] font-bold uppercase tracking-widest leading-none">
                                        <span>{service.subLocation}</span>
                                        <span className="w-1 h-1 bg-white/20 rounded-full" />
                                        <span>{service.category}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 leading-none italic">Base Rate</p>
                                    <p className="text-3xl font-black text-white italic tracking-tighter leading-none">₹{service.prices.weekday}</p>
                                </div>
                            </div>
                        </div>

                        {/* Card Footer Metrics */}
                        <div className="px-10 py-8 flex justify-between items-center bg-slate-50/30">
                            <div className="flex gap-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-lg">⚡</div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 leading-none">Yield Index</p>
                                        <p className="text-xs font-black text-slate-900 italic tracking-tighter leading-none">Premium</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-lg">👥</div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 leading-none">Capacity</p>
                                        <p className="text-xs font-black text-slate-900 italic tracking-tighter leading-none">{service.capacity} Guests</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300 font-bold text-[10px] uppercase tracking-widest">
                                Configure →
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Global Hub Metric */}
        <div className="mt-20 p-12 bg-white rounded-[3.5rem] border border-slate-100 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.06)] text-center animate-in zoom-in-95 duration-1000 delay-500">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em] mb-4">Inventory Operations v.4.0</p>
            <div className="h-[2px] w-24 bg-slate-100 mx-auto" />
        </div>

        <div className="pb-24 text-center mt-12 opacity-10">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[1em]">LocalConnect Cloud Relay</p>
        </div>
    </div>
  );
}
