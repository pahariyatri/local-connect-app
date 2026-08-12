"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import LocalImage from "../../../components/atoms/Image";
import TopNavigation from "../../../components/organisms/TopNavigation";
import SupportContact from "../../../components/molecules/SupportContact";
import { getServiceById } from "@/services/catalogService";
import { useNotification } from "@/contexts/NotificationContext";
import { Icon } from "../../../components/atoms/Icon";

const CATEGORY_IMAGES: Record<string, string> = {
    "Homestays": "https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=1200",
    "Eco-Lodges": "https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=1200",
    "Adventures": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200",
    "Transport": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200",
    "Food": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200",
    "Guides": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200",
};

export default function VendorServiceDetailsPage() {
    const params = useParams<{ id: string; lang: string }>();
    const id = params.id;
    const lang = params.lang || "en";
    const router = useRouter();
    const { showNotification } = useNotification();

    const [service, setService] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchService = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getServiceById(id);
                if (data && data.id) {
                    setService(data);
                } else {
                    setError("Service not found");
                }
            } catch (err) {
                console.error("Error fetching service details:", err);
                setError("Unable to load service details");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchService();
        }
    }, [id]);

    const handleAdd = () => {
        if (!service) return;
        showNotification(`Added ${service.name} to your trip!`, "success");
        router.push(`/${lang}/builder`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 pb-32 animate-pulse">
                <TopNavigation title="Loading Service..." />
                <div className="h-72 sm:h-96 w-full bg-slate-200" />
                <main className="max-w-3xl mx-auto px-4 -mt-12 relative z-10 space-y-6">
                    <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 space-y-4">
                        <div className="h-8 bg-slate-200 rounded-lg w-3/4" />
                        <div className="h-4 bg-slate-200 rounded-lg w-1/2" />
                        <div className="h-32 bg-slate-100 rounded-2xl" />
                    </div>
                </main>
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="min-h-screen bg-slate-50 pb-32">
                <TopNavigation title="Service Details" />
                <main className="max-w-md mx-auto px-4 pt-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-2xl">
                        🏔️
                    </div>
                    <h2 className="text-slate-900 text-lg font-black mb-2">Service Unavailable</h2>
                    <p className="text-slate-400 text-xs mb-6 font-medium">This service listing could not be found or has expired.</p>
                    <button
                        onClick={() => router.push(`/${lang}/explore`)}
                        className="h-12 px-6 rounded-full bg-slate-950 text-white font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                    >
                        Browse Explore Portal
                    </button>
                </main>
            </div>
        );
    }

    const categoryName = service.subcategory?.name || "Mountain Service";
    const heroImage = service.thumbnail || service.additionalData?.images?.[0] || CATEGORY_IMAGES[categoryName] || CATEGORY_IMAGES["Homestays"];
    const basePrice = Array.isArray(service.prices) && service.prices.length > 0
        ? Number(service.prices[0]?.price)
        : 2000;
    const vendorName = service.vendor?.businessName?.replace(/\s*\(.*?\)\s*/g, "").trim() || "Verified Mountain Host";
    const city = service.addresses?.[0]?.city || "Himachal Pradesh";

    const defaultInclusions = [
        "Verified Himalayan Local Host",
        "Direct Coordination & Route Support",
        "Essential Mountain Safety & Briefing",
        "Flexible Cancellation Policy",
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-28">
            <TopNavigation title={service.name} />

            {/* ── HERO BANNER ────────────────────────────────────────── */}
            <div className="h-72 sm:h-96 w-full relative overflow-hidden bg-slate-900">
                <LocalImage
                    src={heroImage}
                    alt={service.name}
                    className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-full tracking-wider shadow-lg">
                        {categoryName}
                    </span>
                    {service.vendor?.id && (
                        <Link
                            href={`/${lang}/vendor/${service.vendor.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-md hover:bg-white text-slate-800 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md transition-all active:scale-95"
                        >
                            View Host Profile →
                        </Link>
                    )}
                </div>

                <div className="absolute bottom-6 left-4 right-4 sm:left-8 sm:right-8 text-white">
                    <div className="max-w-3xl mx-auto flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                            Host: {vendorName}
                        </span>
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-[11px] font-bold text-slate-200 capitalize">
                            📍 {city}
                        </span>
                    </div>
                    <h1 className="max-w-3xl mx-auto text-2xl sm:text-4xl font-black tracking-tight leading-tight uppercase">
                        {service.name}
                    </h1>
                </div>
            </div>

            {/* ── MAIN CONTENT ───────────────────────────────────────── */}
            <main className="max-w-3xl mx-auto px-4 -mt-4 relative z-10 space-y-6">
                {/* Details & Pricing Card */}
                <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl border border-slate-200/80 space-y-6">
                    {/* Pricing & Capacity Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Verified Rate</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                                    ₹{Math.round(basePrice).toLocaleString("en-IN")}
                                </span>
                                <span className="text-xs font-bold text-slate-500">per booking / stay</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="px-3.5 py-1.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-black">
                                👥 Up to {service.capacity || 2} Persons
                            </span>
                            <span className="px-3.5 py-1.5 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-black">
                                Verified Available
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Description</h2>
                        <p className="text-slate-700 text-sm font-medium leading-relaxed">
                            {service.description || "Authentic verified mountain experience hosted by certified local partners."}
                        </p>
                    </div>

                    {/* Inclusions */}
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Service Inclusions & Amenities</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {defaultInclusions.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-800">
                                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">✓</span>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cancellation Policy */}
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60">
                        <h3 className="text-[10px] font-black uppercase tracking-wider text-amber-900 mb-1">Cancellation & Guarantee</h3>
                        <p className="text-xs text-amber-800 font-medium leading-relaxed">
                            Free cancellation up to 48 hours prior to the scheduled date. Direct local host coordination provided upon reservation.
                        </p>
                    </div>

                    {/* Host Profile Bar */}
                    {service.vendor && (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center">
                                    🏔️
                                </div>
                                <div>
                                    <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                                        {vendorName}
                                    </h4>
                                    <p className="text-[10px] font-bold text-emerald-600">
                                        Verified Partner • 100% Acceptance
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={`/${lang}/vendor/${service.vendor.id}`}
                                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-[10px] font-black uppercase tracking-wider hover:bg-slate-100 transition-colors"
                            >
                                All Listings
                            </Link>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={handleAdd}
                        className="w-full h-14 rounded-2xl bg-slate-950 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-950/15 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        Add to Custom Trip Package →
                    </button>
                </div>

                {/* Support Contact */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
                    <SupportContact
                        variant="bar"
                        reference={`Service #${service.id} - ${service.name}`}
                        heading="Need special arrangements or have questions?"
                    />
                </div>
            </main>
        </div>
    );
}
