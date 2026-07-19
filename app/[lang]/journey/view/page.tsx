"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Typography from "../../components/atoms/Typography";
import Button from "../../components/atoms/Button";
import TopNavigation from "../../components/organisms/TopNavigation";
import LocalImage from "../../components/atoms/Image";

// Mock data for a shared trip
const SHARED_TRIP = {
    title: "Chandigarh to Manali Road Trip",
    author: "Arjun Sharma",
    authorPic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
    days: 3,
    stops: [
        { id: "s1", day: 1, time: "01:00 PM", activity: "Riverside Dhaba Lunch", type: "food", location: "On way to Manali" },
        { id: "s2", day: 1, time: "08:00 PM", activity: "Night Club / Bar Visit", type: "activity", location: "Old Manali" },
        { id: "s3", day: 2, time: "10:00 AM", activity: "Solang Valley Exploration", type: "activity", location: "Solang" },
        { id: "s4", day: 2, time: "01:30 PM", activity: "Local Dhaba Lunch", type: "food", location: "Solang Outskirts" },
        { id: "s5", day: 3, time: "11:00 AM", activity: "Souvenir Shopping", type: "other", location: "Mall Road" }
    ]
};

import { useLocalizationContext } from "@/contexts/LocalizationContext";

export default function SharedTripPage() {
    const params = useParams();
    const { dict, loading } = useLocalizationContext();
    const router = useRouter();
    const pathLang = params.lang || "en";
    const [activeDay, setActiveDay] = useState(1);

    if (!dict) return <div className="min-h-screen bg-slate-50" />;
    const journey = dict.page.journey;

    const filteredStops = SHARED_TRIP.stops.filter(stop => stop.day === activeDay);

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            <TopNavigation title={journey.shared_title} />
            
            <main className="max-w-md mx-auto px-6 pt-24">
                <header className="mb-10 text-center">
                    <div className="w-16 h-16 rounded-full border-4 border-white shadow-sm overflow-hidden mx-auto mb-4">
                        <LocalImage src={SHARED_TRIP.authorPic} alt={SHARED_TRIP.author} className="w-full h-full object-cover" />
                    </div>
                    <Typography variant="h1" className="text-2xl font-black text-slate-900 leading-tight mb-2 uppercase tracking-tighter italic">
                        {SHARED_TRIP.title}
                    </Typography>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        {journey.crafted_by} <span className="text-indigo-600 italic">{SHARED_TRIP.author}</span>
                    </p>
                </header>

                {/* Day Selector */}
                <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {[1, 2, 3].map(day => (
                        <button 
                            key={day}
                            onClick={() => setActiveDay(day)}
                            className={`px-8 py-3 rounded-2xl font-black text-sm transition-all min-w-[100px] whitespace-nowrap ${
                                activeDay === day 
                                ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                                : "bg-white text-slate-400 border border-slate-100"
                            }`}
                        >
                            {journey.day_label?.replace("{day}", day.toString()) || `Day ${day}`}
                        </button>
                    ))}
                </div>

                {/* Timeline */}
                <div className="space-y-0 relative">
                    <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-100 -z-0"></div>
                    
                    {filteredStops.map((stop) => (
                        <div key={stop.id} className="relative pl-12 pb-10 last:pb-0">
                            <div className="absolute left-0 top-1.5 w-8 h-8 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[9px] font-black text-slate-500 z-10">
                                {stop.time.split(' ')[0]}
                            </div>
                            
                            <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                                <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">{stop.activity}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold text-slate-400">{stop.location}</span>
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
                                    <span className="text-[9px] font-black text-indigo-600 uppercase">{stop.type}</span>
                                    <Button variant="ghost" size="small" className="text-[9px] font-black text-emerald-600 p-0 h-auto">View Recommendation</Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Overlay */}
                <div className="fixed bottom-10 left-0 right-0 px-6 z-50">
                    <Button 
                        onClick={() => router.push(`/${pathLang}/journey`)}
                        className="w-full max-w-md mx-auto h-16 rounded-2xl bg-indigo-600 text-white font-black shadow-2xl shadow-indigo-200 uppercase tracking-widest text-xs"
                    >
                        {journey.remix}
                    </Button>
                </div>
            </main>
        </div>
    );
}
