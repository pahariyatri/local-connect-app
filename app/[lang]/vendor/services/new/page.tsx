"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Typography from "../../../components/atoms/Typography";
import Button from "../../../components/atoms/Button";
import Input from "../../../components/atoms/Input";
import Textarea from "../../../components/atoms/Textarea";
import { useNotification } from "@/contexts/NotificationContext";

const categories = [
    { label: "Accommodation", icon: "🏨", value: "Accommodation" },
    { label: "Transportation", icon: "🚙", value: "Transportation" },
    { label: "Tours", icon: "🏔️", value: "Tours" },
    { label: "Dining", icon: "🍱", value: "Dining" }
];

const subcategories: Record<string, string[]> = {
    Accommodation: ["Homestays", "Resorts", "Campsites", "Heritage"],
    Transportation: ["Private Cabs", "Bikes", "Shuttles"],
    Tours: ["Treks", "Sightseeing", "Cultural"],
    Dining: ["Local Kitchens", "Cafes", "Fine Dining"]
};

export default function NewServiceSeasonalBuilder() {
    const router = useRouter();
    const { lang } = useParams();
    const { showNotification } = useNotification();
    
    // Step state: 1: DNA, 2: Economics, 3: Vision
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        name: "",
        category: "",
        subcategory: "",
        weekday_off: "",
        weekend_off: "",
        weekday_peak: "",
        weekend_peak: "",
        peak_start: "",
        peak_end: "",
        capacity: "1",
        description: ""
    });

    const canProceedStep1 = form.name && form.category && form.subcategory;
    const canProceedStep2 = form.weekday_off && form.weekend_off && form.capacity;
    const canProceedStep3 = form.description;

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else {
            showNotification("Anchoring Asset on Global Plane...", "success");
            setTimeout(() => {
                router.push(`/${lang}/vendor/services`);
            }, 1000);
        }
    };

    return (
        <div className="min-h-screen bg-white pb-40">
            {/* Header / Pipeline Progress */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-3xl border-b border-slate-50 px-8 h-24 flex items-center justify-between">
                <button onClick={() => router.back()} className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                    ← ABORT
                </button>
                <div className="flex gap-2">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`h-1.5 w-16 rounded-full transition-all duration-[1.5s] ${s <= step ? 'bg-slate-900 shadow-2xl shadow-indigo-100' : 'bg-slate-100'}`} />
                    ))}
                </div>
                <div className="w-20 hidden md:block" />
            </header>

            <main className="max-w-3xl mx-auto px-6 pt-40">
                {/* Tactical Title */}
                <div className="mb-16 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                    <Typography variant="h1" className="text-6xl font-black text-slate-900 leading-[1] uppercase tracking-tighter italic">
                        {step === 1 ? 'Asset DNA.' : step === 2 ? 'Yield Matrix.' : 'The Vision.'}
                    </Typography>
                    <p className="text-slate-400 text-[10px] font-black mt-6 uppercase tracking-[0.6em] leading-relaxed max-w-lg">
                        {step === 1 ? 'Establish the core structural identity of your local legend.' : 
                         step === 2 ? 'Calibrate dual-layer revenue matrices for maximum seasonal yield.' : 
                         'Inject the narrative payload that connects your asset to the world.'}
                    </p>
                </div>

                <div className="space-y-20">
                    {step === 1 && (
                        <div className="space-y-16 animate-in fade-in slide-in-from-right-10 duration-700">
                            <div className="group">
                                <label className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-4 block ml-4 italic">Asset Signature (Name)</label>
                                <input 
                                    className="w-full bg-slate-50 border-none rounded-[2.5rem] h-24 px-10 text-3xl font-black italic text-slate-900 outline-none focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-slate-200 shadow-inner"
                                    placeholder="e.g. EVEREST CABIN"
                                    value={form.name}
                                    onChange={(e) => setForm({...form, name: e.target.value.toUpperCase()})}
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-8 block ml-4 italic">Primary Sector (Static DNA)</label>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {categories.map((cat) => (
                                        <button 
                                            key={cat.value}
                                            onClick={() => setForm({...form, category: cat.value, subcategory: ""})}
                                            className={`h-36 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 transition-all duration-700 border-2 ${
                                                form.category === cat.value ? 'bg-slate-900 border-slate-900 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] scale-105' : 'bg-slate-50 border-transparent text-slate-300 hover:border-slate-200'
                                            }`}
                                        >
                                            <span className="text-4xl">{cat.icon}</span>
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${form.category === cat.value ? 'text-white' : 'text-slate-500'}`}>{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {form.category && (
                                <div className="animate-in fade-in zoom-in-95 duration-1000">
                                    <label className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-8 block ml-4 italic">Domain Specialization</label>
                                    <div className="flex flex-wrap gap-4">
                                        {subcategories[form.category]?.map((sub) => (
                                            <button 
                                                key={sub}
                                                onClick={() => setForm({...form, subcategory: sub})}
                                                className={`px-10 py-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                                                    form.subcategory === sub ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100' : 'bg-white border-2 border-slate-100 text-slate-400 hover:border-indigo-500 hover:text-indigo-600'
                                                }`}
                                            >
                                                {sub}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                             <div className="group">
                                <label className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-6 block ml-4 italic">Pax Load Capacity</label>
                                <div className="flex flex-wrap gap-4">
                                    {[1, 2, 4, 6, 8, 12, 16, 24].map(num => (
                                        <button 
                                            key={num}
                                            onClick={() => setForm({...form, capacity: String(num)})}
                                            className={`w-20 h-20 rounded-3xl text-xl font-black italic transition-all duration-500 ${
                                                form.capacity === String(num) ? 'bg-slate-900 text-white shadow-2xl scale-110' : 'bg-slate-50 text-slate-300'
                                            }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-20 animate-in fade-in slide-in-from-right-10 duration-700">
                            {/* Standard Economics Matrix (Off-Season) */}
                            <div>
                                <h4 className="text-[12px] font-black text-indigo-600 uppercase tracking-[0.5em] mb-10 ml-4 italic">Standard Economics (Off-Season)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Weekday Base</label>
                                        <input 
                                            type="number"
                                            value={form.weekday_off}
                                            onChange={(e) => setForm({...form, weekday_off: e.target.value})}
                                            placeholder="0"
                                            className="w-full h-24 bg-slate-50 rounded-[2.5rem] px-10 text-4xl font-black italic text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-4">Weekend Peak</label>
                                        <input 
                                            type="number"
                                            value={form.weekend_off}
                                            onChange={(e) => setForm({...form, weekend_off: e.target.value})}
                                            placeholder="0"
                                            className="w-full h-24 bg-slate-50 rounded-[2.5rem] px-10 text-4xl font-black italic text-indigo-600 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Peak Seasonal Matrix (On-Season) */}
                            <div>
                                <div className="flex items-center justify-between mb-10 ml-4">
                                    <h4 className="text-[12px] font-black text-rose-500 uppercase tracking-[0.5em] italic">Peak Operational Layer</h4>
                                    <span className="px-4 py-1.5 bg-rose-50 text-rose-500 text-[8px] font-black uppercase tracking-widest rounded-full italic border border-rose-100">Optional Surge</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                    <div className="space-y-4 text-rose-500">
                                        <label className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-50">Peak Weekday</label>
                                        <input 
                                            type="number"
                                            value={form.weekday_peak}
                                            onChange={(e) => setForm({...form, weekday_peak: e.target.value})}
                                            placeholder="0"
                                            className="w-full h-24 bg-rose-50/20 border-2 border-rose-100/50 focus:border-rose-500 rounded-[2.5rem] px-10 text-4xl font-black italic text-rose-900 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-4 text-rose-600">
                                        <label className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-50">Peak Weekend</label>
                                        <input 
                                            type="number"
                                            value={form.weekend_peak}
                                            onChange={(e) => setForm({...form, weekend_peak: e.target.value})}
                                            placeholder="0"
                                            className="w-full h-24 bg-rose-50/20 border-2 border-rose-100/50 focus:border-rose-600 rounded-[2.5rem] px-10 text-4xl font-black italic text-rose-600 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="p-10 bg-slate-900 rounded-[3.5rem] shadow-2xl space-y-8 relative overflow-hidden group">
                                    <div className="flex flex-col md:flex-row gap-8 relative z-10 transition-transform group-hover:scale-[1.01] duration-700">
                                        <div className="flex-1 space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 block italic">Peak Activation</label>
                                            <input 
                                                type="date" 
                                                value={form.peak_start}
                                                onChange={(e) => setForm({...form, peak_start: e.target.value})}
                                                className="w-full h-18 bg-white/5 border-none rounded-2xl px-6 text-white font-black italic outline-none focus:bg-white/10" 
                                            />
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 block italic">Peak Termination</label>
                                            <input 
                                                type="date" 
                                                value={form.peak_end}
                                                onChange={(e) => setForm({...form, peak_end: e.target.value})}
                                                className="w-full h-18 bg-white/5 border-none rounded-2xl px-6 text-white font-black italic outline-none focus:bg-white/10" 
                                            />
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-[60px] -mr-20 -mt-20" />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-right-10 duration-700">
                            <Textarea 
                                label="The Narrative Payload"
                                name="description"
                                value={form.description}
                                onChange={(e) => setForm({...form, description: e.target.value})}
                                placeholder="Details about this local experience..."
                                className="min-h-[450px] border-none rounded-[3.5rem] p-12 text-xl font-medium text-slate-600 leading-[1.7] bg-slate-50/50 focus:bg-white transition-all shadow-inner"
                            />
                            <div className="p-14 border-2 border-dashed border-slate-100 rounded-[4rem] text-center bg-white group hover:border-indigo-500 transition-all duration-700 cursor-pointer">
                                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 group-hover:rotate-12 transition-transform shadow-inner">📸</div>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] mb-3">Immersive Gallery Hub</p>
                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em]">Synchronized with Cloud Cluster v.5.0</p>
                            </div>
                        </div>
                    )}

                    {/* Progress Orchestration */}
                    <div className="pt-24 border-t border-slate-50">
                        {((step === 1 && canProceedStep1) || (step === 2 && canProceedStep2) || (step === 3 && canProceedStep3)) && (
                            <div className="animate-in fade-in slide-in-from-bottom-5 duration-1000">
                                <Button 
                                    onClick={handleNext}
                                    className="w-full h-28 rounded-[3.5rem] bg-indigo-600 text-white font-black text-[14px] uppercase tracking-[0.5em] shadow-[0_40px_80px_-20px_rgba(79,70,229,0.5)] active:scale-95 transition-all duration-700 hover:bg-slate-900 group"
                                >
                                    <span className="group-hover:translate-x-2 transition-transform inline-block">
                                        {step === 3 ? 'COMMIT TO GLOBAL GRID 🌎' : 'FINALIZE PHASE & ADVANCE →'}
                                    </span>
                                </Button>
                            </div>
                        )}
                        
                        {step > 1 && (
                            <button onClick={() => setStep(step - 1)} className="w-full mt-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] hover:text-slate-900 transition-all">
                                REVERT PARAMETERS
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
