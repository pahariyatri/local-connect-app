"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Service, SeasonalPrice } from "../../types";
import Typography from "../../../../components/atoms/Typography";
import Button from "../../../../components/atoms/Button";
import Textarea from "../../../../components/atoms/Textarea";
import Input from "../../../../components/atoms/Input";
import { useNotification } from "@/contexts/NotificationContext";

const mockService: Service = {
    id: 1,
    name: "LUXURY MOUNTAIN RETREAT",
    prices: { weekday: 4200, weekend: 5500 },
    seasonalPrices: [
        { id: '1', seasonName: 'Peak Winter', startDate: '2024-12-01', endDate: '2025-02-28', price: 7500 }
    ],
    category: "Accommodation",
    subcategory: "Resorts",
    description: "Experience the ultimate mountain getaway in our premium retreat.",
    capacity: 4,
    availability: "Weekends Only",
    status: "active",
    hasActiveBookings: true
};

export default function EditServiceRefinedFinal() {
    const router = useRouter();
    const params = useParams();
    const { showNotification } = useNotification();
    const [service, setService] = useState<Service | null>(null);
    const [tab, setTab] = useState<'details' | 'economics' | 'narrative'>('details');

    useEffect(() => {
        // Mock fetch - Logic preserved
        setService(mockService);
    }, [params?.id]);

    if (!service) return <div className="min-h-screen bg-white" />;

    const isLocked = service.hasActiveBookings;

    return (
        <div className="min-h-screen bg-white pb-32">
            {/* Navigation Overlay */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-3xl border-b border-slate-50 px-8 h-24 flex items-center justify-between">
                <button onClick={() => router.back()} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 transition-colors">
                    ← TERMINATE
                </button>
                <div className="flex gap-2">
                    {['details', 'economics', 'narrative'].map(t => (
                        <button 
                            key={t}
                            onClick={() => setTab(t as any)}
                            className={`px-8 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all border-2 ${
                                tab === t ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-emerald-100' : 'bg-white border-slate-100 text-slate-300'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <div className="w-20 md:flex hidden" />
            </header>

            <main className="max-w-3xl mx-auto px-6 pt-40">
                {/* Visual Identity - Static DNA */}
                <div className="mb-16 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                    <div className="flex flex-col md:flex-row md:items-center gap-8">
                        <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-4xl shadow-2xl shrink-0">
                            🏔️
                        </div>
                        <div>
                             <h1 className="text-5xl font-black text-slate-900 leading-tight uppercase tracking-tighter italic mb-3">
                                {service.name}
                            </h1>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-4 py-1.5 bg-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-full">{service.category} › {service.subcategory}</span>
                                <span className="px-4 py-1.5 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-100">Live Asset</span>
                                {isLocked && <span className="px-4 py-1.5 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-amber-100 italic">Rate Anchored</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-16 animate-in fade-in slide-in-from-bottom-10 duration-[1500ms]">
                    {tab === 'details' && (
                        <div className="space-y-12 animate-in fade-in duration-500">
                             <div className="group">
                                <label className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4 block ml-4 italic">Asset Signature (Updatable)</label>
                                <input 
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-[2.5rem] h-24 px-10 text-2xl font-black italic text-slate-900 outline-none transition-all"
                                    value={service.name}
                                    onChange={(e) => setService({...service, name: e.target.value.toUpperCase()})}
                                />
                            </div>

                            <div className="group">
                                <label className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-6 block ml-4 italic">Operational Capacity</label>
                                <div className="flex gap-4">
                                    {[1, 2, 4, 6, 8, 12, 16].map(num => (
                                        <button 
                                            key={num}
                                            onClick={() => setService({...service, capacity: num})}
                                            className={`flex-1 h-20 rounded-3xl text-xl font-black italic transition-all ${
                                                service.capacity === num ? 'bg-slate-900 text-white shadow-2xl scale-110' : 'bg-slate-50 text-slate-300'
                                            }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'economics' && (
                        <div className="space-y-20 animate-in fade-in duration-500">
                             {isLocked && (
                                <div className="p-10 bg-amber-50 rounded-[3rem] border border-amber-100/50 flex items-center gap-8">
                                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-3xl shadow-sm">🔒</div>
                                    <div className="flex-1">
                                        <p className="text-[11px] font-black text-amber-950 uppercase italic mb-2">Economics Modification Restrict</p>
                                        <p className="text-[9px] text-amber-600 font-bold uppercase tracking-widest leading-relaxed">Active bookings detected on this route. Base and Peak deltas are locked by Global Control.</p>
                                    </div>
                                </div>
                            )}

                            {/* Standard Economics Matrix (Off-Season) */}
                            <section className={`space-y-10 ${isLocked ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                                <div>
                                    <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.5em] mb-8 ml-4 italic">Standard Matrix (Off-Season)</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Weekday Base</label>
                                            <Input 
                                                type="number" 
                                                name="weekday"
                                                className="h-24 rounded-[2.5rem] bg-slate-50 border-none px-10 text-4xl font-black italic shadow-inner" 
                                                value={String(service.prices.weekday)}
                                                onChange={(e) => setService({...service, prices: {...service.prices, weekday: Number(e.target.value)}})}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest ml-4">Weekend Pulse</label>
                                            <Input 
                                                type="number" 
                                                name="weekend"
                                                className="h-24 rounded-[2.5rem] bg-slate-50 border-none px-10 text-4xl font-black italic text-emerald-500 shadow-inner" 
                                                value={String(service.prices.weekend)}
                                                onChange={(e) => setService({...service, prices: {...service.prices, weekend: Number(e.target.value)}})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Peak Operational Layer (On-Season) */}
                                <div>
                                    <h4 className="text-[11px] font-black text-rose-400 uppercase tracking-[0.5em] mb-8 ml-4 italic">Peak Operational Layer (On-Season)</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Peak Weekday</label>
                                            <Input 
                                                type="number" 
                                                name="peak_weekday"
                                                className="h-24 rounded-[2.5rem] bg-slate-50 border-none px-10 text-4xl font-black italic shadow-inner text-rose-500" 
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[9px] font-black text-rose-500 uppercase tracking-widest ml-4">Peak Weekend</label>
                                            <Input 
                                                type="number" 
                                                name="peak_weekend"
                                                className="h-24 rounded-[2.5rem] bg-slate-50 border-none px-10 text-4xl font-black italic text-rose-600 shadow-inner" 
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-8 p-8 bg-slate-900 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row gap-8">
                                        <div className="flex-1">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Peak Activation Date</label>
                                            <input type="date" className="w-full bg-white/5 border-none rounded-2xl h-16 px-6 text-white font-black italic text-sm outline-none" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Peak Termination Date</label>
                                            <input type="date" className="w-full bg-white/5 border-none rounded-2xl h-16 px-6 text-white font-black italic text-sm outline-none" />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {tab === 'narrative' && (
                        <div className="space-y-12 animate-in fade-in duration-500">
                            <Textarea 
                                label="Global Grid Copy" 
                                name="description"
                                value={service.description} 
                                className="min-h-[450px] border-2 border-slate-50 rounded-[3rem] p-12 text-xl font-bold text-slate-600 leading-[1.6] bg-slate-50/20" 
                            />
                        </div>
                    )}

                    {/* Commit Actions */}
                    <div className="pt-20 border-t border-slate-100 flex gap-4">
                        <Button 
                            onClick={() => {
                                showNotification("Updating Asset Parameters...", "success");
                                setTimeout(() => router.push(`/${params.lang}/vendor/services`), 800);
                            }}
                            className="flex-[2] h-24 rounded-[3rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-emerald-500 active:scale-95 transition-all duration-700"
                        >
                            COMMIT MODIFICATIONS 🏔️
                        </Button>
                        <Button 
                            variant="ghost" 
                            onClick={() => router.back()}
                            className="flex-1 h-24 rounded-[3rem] border-2 border-slate-100 text-slate-300 font-black text-[10px] uppercase tracking-[0.2em]"
                        >
                            ABORT
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
