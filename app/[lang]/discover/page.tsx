"use client";

import React, { useState, useEffect } from "react";
import Typography from "../components/atoms/Typography";
import TopNavigation from "../components/organisms/TopNavigation";
import BottomNavigation from "../components/organisms/BottomNavigation";
import Button from "../components/atoms/Button";
import LocalImage from "../components/atoms/Image";
import { useParams, useRouter } from "next/navigation";
import Loading from "@/app/loading";
import api from "@/lib/apiClient";

// Mock Data for Discover matching details page profiles
const VENDORS = [
    { 
        id: "p1", 
        name: "Tenzing Sherpa", 
        category: "Guides", 
        location: "Manali", 
        rating: 4.9, 
        reviews: 142, 
        priceRange: "₹3,500/day", 
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800", 
        tags: ["Peak Trekking", "Alpine Guide", "First-Aid"] 
    },
    { 
        id: "p2", 
        name: "Priya Homestay", 
        category: "Homestays", 
        location: "Manali", 
        rating: 4.8, 
        reviews: 89, 
        priceRange: "₹2,200/night", 
        image: "https://images.unsplash.com/photo-1651319485646-f0f30e46b761?q=80&w=800", 
        tags: ["Orchard View", "Organic Food", "Wifi"] 
    },
    { 
        id: "p3", 
        name: "Arjun Thakur", 
        category: "Food", 
        location: "Shimla", 
        rating: 4.7, 
        reviews: 63, 
        priceRange: "₹900/person", 
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800", 
        tags: ["Food Walks", "Traditional Dham", "Shimla Alleys"] 
    },
    { 
        id: "p4", 
        name: "Sonam Wangchuk", 
        category: "Transport", 
        location: "Leh", 
        rating: 4.9, 
        reviews: 211, 
        priceRange: "₹2,500/day", 
        image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=800", 
        tags: ["4x4 SUV Cab", "Inner Permits", "Oxygen Onboard"] 
    },
    { 
        id: "p5", 
        name: "Kavya Nair", 
        category: "Wellness", 
        location: "Rishikesh", 
        rating: 5.0, 
        reviews: 47, 
        priceRange: "₹1,500/session", 
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800", 
        tags: ["Yoga Alliance", "Sound Healing", "Sunrise Meditation"] 
    },
    { 
        id: "p6", 
        name: "Rajan Chauhan", 
        category: "Adventures", 
        location: "Manali", 
        rating: 4.8, 
        reviews: 178, 
        priceRange: "₹1,200/person", 
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800", 
        tags: ["Beas Rafting", "Action Cam HD", "Lifeguard Cert"] 
    }
];

const mapBackendVendor = (v: any) => {
    const type = v.types?.[0] || "Guides";
    const categoryMap: Record<string, string> = {
        "hotel": "Homestays",
        "adventure": "Adventures",
        "transport": "Transport",
        "restaurant": "Food",
        "guide": "Guides",
        "wellness": "Wellness"
    };
    const category = categoryMap[type.toLowerCase()] || "Guides";

    const categoryImages: Record<string, string> = {
        "Homestays": "https://images.unsplash.com/photo-1651319485646-f0f30e46b761?q=80&w=800",
        "Adventures": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800",
        "Transport": "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=800",
        "Food": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800",
        "Guides": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800",
        "Wellness": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800"
    };

    let location = "Manali";
    const lowerName = v.businessName.toLowerCase();
    if (lowerName.includes("dharamshala")) location = "Dharamshala";
    else if (lowerName.includes("tirthan")) location = "Tirthan";
    else if (lowerName.includes("spiti")) location = "Spiti";
    else if (lowerName.includes("goa")) location = "Goa";
    else if (lowerName.includes("leh")) location = "Leh";
    else if (lowerName.includes("rishikesh")) location = "Rishikesh";
    else if (lowerName.includes("shimla")) location = "Shimla";

    let cleanName = v.businessName.replace(/\s*\(.*?\)\s*/g, "").trim();

    return {
        id: v.id,
        name: cleanName,
        category,
        location,
        rating: v.trustScore || 4.8,
        reviews: v.reviews || Math.floor((v.trustScore || 4.8) * 20) + (parseInt(v.id.slice(0, 2), 16) % 50 || 20),
        priceRange: v.services?.[0] ? `₹${v.services[0].price}/${v.services[0].unit || "day"}` : "₹2,500/day",
        image: categoryImages[category] || categoryImages["Guides"],
        tags: v.services?.map((s: any) => s.name).slice(0, 3) || ["Verified Local", "Premium Partner"]
    };
};

export default function DiscoverPage() {
    const { lang } = useParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("All");
    const [dict, setDict] = useState<any>(null);
    const [vendors, setVendors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const categories = ["All", "Guides", "Homestays", "Transport", "Food", "Wellness", "Adventures"];

    useEffect(() => {
        const loadDict = async () => {
            const d = await import(`@/dictionaries/${lang}.json`);
            setDict(d.default);
        };
        loadDict();
    }, [lang]);

    useEffect(() => {
        if (!dict) return;
        const fetchVendors = async () => {
            try {
                const response = await api.get('/vendors');
                if (response && Array.isArray(response)) {
                    setVendors(response.map(mapBackendVendor));
                } else {
                    setVendors(VENDORS);
                }
            } catch (err) {
                console.error("Error fetching vendors:", err);
                setVendors(VENDORS);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVendors();
    }, [dict]);

    useEffect(() => {
        if (typeof window !== "undefined" && dict) {
            const params = new URLSearchParams(window.location.search);
            const catParam = params.get("category");
            const locParam = params.get("location");
            if (catParam) {
                const matched = categories.find(c => c.toLowerCase() === catParam.toLowerCase());
                if (matched) setActiveTab(matched);
            }
            if (locParam) {
                setSelectedLocation(locParam);
            }
        }
    }, [dict]);

    if (!dict) return <Loading />;

    const discover = dict.page.discover;
    const catLabels: Record<string, string> = {
        "All": discover.categories.all ?? "All",
        "Guides": "Guides",
        "Homestays": "Homestays",
        "Transport": "Transport",
        "Food": "Food Tours",
        "Wellness": "Wellness",
        "Adventures": "Adventures"
    };

    const filteredVendors = vendors.filter(v => {
        const q = searchQuery.toLowerCase();
        return !q || 
            v.name.toLowerCase().includes(q) || 
            v.category.toLowerCase().includes(q) ||
            v.location.toLowerCase().includes(q) ||
            v.tags.some(tag => tag.toLowerCase().includes(q));
    });

    return (
        <div className="min-h-screen bg-white pb-32">
            <TopNavigation title={discover.title} />
            
            <main className="max-w-6xl mx-auto px-6 pt-24">
                <header className="mb-10 text-center animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <Typography variant="h1" className="text-4xl font-black text-slate-900 leading-tight uppercase italic"
                        dangerouslySetInnerHTML={{ __html: discover.header.title }} />
                    <p className="text-slate-500 font-medium mt-2 text-sm uppercase tracking-widest">{discover.header.subtitle}</p>
                </header>

                {/* 🔍 Unified Search Bar */}
                <div className="mb-12 relative max-w-xl mx-auto">
                    <input
                        type="text"
                        placeholder="Search guide, stay, transport, region..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 rounded-3xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-900 focus:bg-white focus:shadow-2xl focus:shadow-slate-100/50 transition-all placeholder:text-slate-400"
                    />
                    <span className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-450">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </span>
                </div>

                {/* 📋 Vendor Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, idx) => (
                            <div key={idx} className="bg-slate-50 rounded-3xl border border-slate-200/40 overflow-hidden animate-pulse">
                                <div className="h-48 bg-slate-200" />
                                <div className="p-6 space-y-4">
                                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                                </div>
                            </div>
                        ))
                    ) : filteredVendors.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                            No verified vendors found matching filters.
                        </div>
                    ) : (
                        filteredVendors.map((vendor, i) => (
                            <div 
                                key={vendor.id} 
                                onClick={() => router.push(`/${lang}/vendor/${vendor.id}`)}
                                className="premium-card group overflow-hidden cursor-pointer active:scale-[0.98] transition-all animate-in fade-in slide-in-from-bottom-5 duration-700 border border-slate-100 rounded-3xl"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="h-48 w-full relative">
                                    <LocalImage src={vendor.image} alt={vendor.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-4 left-4 flex gap-1.5 animate-pulse-slow">
                                        <span className="px-3 py-1 bg-white/95 backdrop-blur rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm border border-slate-200/50">
                                            {catLabels[vendor.category] || vendor.category}
                                        </span>
                                        <span className="px-3 py-1 bg-slate-900/95 text-white backdrop-blur rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2500/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                            {vendor.location}
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg border border-white/20">
                                            ✓
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                        <h3 className="text-xl font-black uppercase tracking-tight italic">{vendor.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex text-amber-400 text-[10px]">★★★★★</div>
                                            <p className="text-[10px] font-bold text-white/70 uppercase">{vendor.rating} • {vendor.reviews} {discover.vendor_card?.reviews ?? "reviews"}</p>
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
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{discover.vendor_card?.starts_from ?? "starts from"}</p>
                                        <p className="text-sm font-black text-slate-900 italic">{vendor.priceRange}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
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
