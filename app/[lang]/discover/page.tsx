"use client";

import React, { useState, useEffect } from "react";
import Typography from "../components/atoms/Typography";
import TopNavigation from "../components/organisms/TopNavigation";
import BottomNavigation from "../components/organisms/BottomNavigation";
import Button from "../components/atoms/Button";
import LocalImage from "../components/atoms/Image";
import { useParams, useRouter } from "next/navigation";
import Loading from "@/app/loading";

// Mock Data for Discover
const VENDORS = [
    { id: 1, name: "Mountain View Stays", category: "Stay", rating: 4.8, reviews: 124, priceRange: "₹2,500+", image: "https://images.unsplash.com/photo-1651319485646-f0f30e46b761?q=80&w=400", tags: ["Cozy", "Wifi"] },
    { id: 2, name: "Himachal Cabs", category: "Taxi", rating: 4.9, reviews: 502, priceRange: "₹3,000/day", image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=400", tags: ["SUV", "Safe"] },
    { id: 3, name: "Peak Adventure Co.", category: "Adventure", rating: 4.7, reviews: 89, priceRange: "₹1,500+", image: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=80&w=400", tags: ["Trek", "Para"] },
    { id: 4, name: "Pahadi Dhaba", category: "Meals", rating: 4.9, reviews: 1240, priceRange: "₹200+", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=400", tags: ["Local", "Best Thali"] },
];

export default function DiscoverPage() {
    const { lang } = useParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("All");
    const [dict, setDict] = useState<any>(null);

    useEffect(() => {
        const loadDict = async () => {
            const d = await import(`@/dictionaries/${lang}.json`);
            setDict(d.default);
        };
        loadDict();
    }, [lang]);

    if (!dict) return <Loading />;

    const discover = dict.page.discover;
    const catLabels: Record<string, string> = {
        "All": discover.categories.all,
        "Stay": discover.categories.stay,
        "Taxi": discover.categories.taxi,
        "Adventure": discover.categories.adventure,
        "Meals": discover.categories.meals
    };

    const categories = ["All", "Stay", "Taxi", "Adventure", "Meals"];

    const filteredVendors = activeTab === "All" 
        ? VENDORS 
        : VENDORS.filter(v => v.category === activeTab);

    return (
        <div className="min-h-screen bg-white pb-32">
            <TopNavigation title={discover.title} />
            
            <main className="max-w-md mx-auto px-6 pt-24">
                <header className="mb-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <Typography variant="h1" className="text-4xl font-black text-slate-900 leading-tight uppercase italic"
                        dangerouslySetInnerHTML={{ __html: discover.header.title }} />
                    <p className="text-slate-500 font-medium mt-2 text-sm uppercase tracking-widest">{discover.header.subtitle}</p>
                </header>

                {/* 🏷️ Categories */}
                <div className="flex gap-3 overflow-x-auto pb-6 -mx-6 px-6 no-scrollbar mb-4">
                    {categories.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setActiveTab(cat)}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                activeTab === cat ? "bg-slate-900 text-white shadow-xl shadow-slate-200 scale-105" : "bg-slate-50 text-slate-400 border border-slate-100"
                            }`}
                        >
                            {catLabels[cat] || cat}
                        </button>
                    ))}
                </div>

                {/* 📋 Vendor Grid */}
                <div className="space-y-8">
                    {filteredVendors.map((vendor, i) => (
                        <div 
                            key={vendor.id} 
                            onClick={() => router.push(`/${lang}/vendor/${vendor.id}`)}
                            className="premium-card group overflow-hidden cursor-pointer active:scale-[0.98] transition-all animate-in fade-in slide-in-from-bottom-5 duration-700"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className="h-48 w-full relative">
                                <LocalImage src={vendor.image} alt={vendor.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                                        {catLabels[vendor.category] || vendor.category}
                                    </span>
                                </div>
                                <div className="absolute top-4 right-4">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg border border-white/20">
                                        {discover.vendor_card.verified}
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                    <h3 className="text-xl font-black uppercase tracking-tight italic">{vendor.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex text-amber-400 text-[10px]">★★★★★</div>
                                        <p className="text-[10px] font-bold text-white/70 uppercase">{vendor.rating} • {vendor.reviews} {discover.vendor_card.reviews}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-5 flex justify-between items-center bg-white border-x border-b border-slate-50 rounded-b-3xl">
                                <div className="flex gap-2">
                                    {vendor.tags.map(tag => (
                                        <span key={tag} className="px-2 py-0.5 bg-slate-50 text-[8px] font-black text-slate-400 uppercase rounded-md">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{discover.vendor_card.starts_from}</p>
                                    <p className="text-sm font-black text-slate-900 italic">{vendor.priceRange}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 🏔️ Join as Partner */}
                <div className="mt-16 p-10 rounded-[3rem] bg-indigo-950 text-white flex flex-col items-center text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
                    <div className="w-16 h-16 rounded-[2rem] bg-white/10 flex items-center justify-center text-3xl mb-6 relative z-10">🤝</div>
                    <Typography variant="h3" className="text-lg font-black text-white uppercase tracking-tight mb-2 relative z-10 italic">{discover.partner_cta.title}</Typography>
                    <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-8 relative z-10">{discover.partner_cta.subtitle}</p>
                    <Button 
                        onClick={() => router.push(`/${lang}/vendor/onboarding`)}
                        className="w-full h-14 bg-white text-indigo-950 rounded-2xl text-[10px] font-black uppercase tracking-widest relative z-10 hover:scale-105 active:scale-95 transition-all shadow-xl"
                    >
                        {discover.partner_cta.cta}
                    </Button>
                </div>
            </main>

            <BottomNavigation />
        </div>
    );
}
