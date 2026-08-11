"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import NextImage from "next/image";
import Typography from "../../components/atoms/Typography";
import Button from "../../components/atoms/Button";
import { useNotification } from "@/contexts/NotificationContext";
import TopNavigation from "../../components/organisms/TopNavigation";
import VendorQRCode from "../../components/molecules/VendorQRCode";
import SupportContact from "../../components/molecules/SupportContact";
import { getVendorById } from "@/services/vendorService";
import { ApiClientError } from "@/lib/apiClient";
import { searchDiscoveryServices, DiscoveryService } from "@/services/searchService";

const CATEGORY_IMAGES: Record<string, string> = {
    "Homestays": "https://images.unsplash.com/photo-1651319485646-f0f30e46b761?q=80&w=800",
    "Adventures": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800",
    "Transport": "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=800",
    "Food": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800",
    "Guides": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800",
    "Wellness": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800"
};

const VENDOR_TYPE_TO_CATEGORY: Record<string, string> = {
    "hotel": "Homestays",
    "adventure": "Adventures",
    "transport": "Transport",
    "restaurant": "Food",
    "guide": "Guides",
    "wellness": "Wellness"
};

/**
 * Combines the bare vendor record (`GET /vendors/:id` — no location, no
 * services, no real price data) with that vendor's real listings from the
 * public discovery search, filtered to this vendor's id. There is no
 * location/services fallback: a vendor with nothing in discovery yet shows
 * a real "no services published" state, never an invented one.
 */
const mapSingleVendor = (v: any, realServices: DiscoveryService[]) => {
    const type = v.types?.[0] || "";
    const category = VENDOR_TYPE_TO_CATEGORY[type.toLowerCase()] || realServices[0]?.category || "Guides";
    const cleanName = v.businessName.replace(/\s*\(.*?\)\s*/g, "").trim();

    const mappedServices = realServices.map((s) => ({
        id: String(s.id),
        name: s.name,
        price: s.pricing.unitPrice,
        currency: s.pricing.currency,
        unit: s.pricing.nights ? "night" : "service",
        description: s.shortDescription || s.description,
    }));

    // Only real, backend-sourced facts — no invented credentials, languages,
    // years of experience, or policy claims for an actual vendor record.
    const features = [
        v.isVerified && "Verified Partner",
        v.isInstantBooking && "Instant Booking Enabled",
        typeof v.acceptanceRate === "number" && `${v.acceptanceRate}% Acceptance Rate`,
    ].filter(Boolean) as string[];

    const minPrice = mappedServices.length > 0 ? Math.min(...mappedServices.map((s) => s.price)) : null;

    return {
        id: v.id,
        name: cleanName,
        image: realServices[0]?.thumbnail || CATEGORY_IMAGES[category] || CATEGORY_IMAGES["Guides"],
        rating: v.trustScore ?? null,
        // Real starting price from this vendor's own listed services — never
        // an invented ₹/₹₹/₹₹₹ tier. Null when they have no priced services yet.
        startingPrice: minPrice,
        currency: mappedServices[0]?.currency || "INR",
        category,
        description: v.description || "Authentic local partner.",
        features,
        services: mappedServices,
        hometown: realServices[0]?.location?.city || null,
    };
};

export default function VendorProfilePage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const { showNotification } = useNotification();
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    // 'not_found' (real 404 — this vendor doesn't exist) vs 'error' (network/
    // server failure — the vendor may well exist). Neither ever substitutes a
    // fake profile; both render an explicit recoverable state below.
    const [loadError, setLoadError] = useState<"not_found" | "error" | null>(null);

    const fetchProfile = async () => {
        setIsLoading(true);
        setLoadError(null);
        try {
            const response = await getVendorById(id);
            if (response && response.id) {
                // The bare vendor record has no location/services/price data —
                // pull this vendor's real listings from the public discovery
                // search (filtered to this vendor id) rather than inventing any.
                let realServices: DiscoveryService[] = [];
                try {
                    const searchResult = await searchDiscoveryServices({ q: response.businessName, limit: 50 });
                    realServices = searchResult.services.filter((s) => s.vendor.id === response.id);
                } catch (searchErr) {
                    console.error("Error fetching vendor's services:", searchErr);
                }
                setProfile(mapSingleVendor(response, realServices));
            } else {
                setLoadError("not_found");
            }
        } catch (err) {
            console.error("Error fetching vendor profile:", err);
            setLoadError(err instanceof ApiClientError && err.statusCode === 404 ? "not_found" : "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 pb-32 animate-pulse">
                <TopNavigation title="Loading Profile..." />
                <div className="h-96 w-full bg-slate-200" />
                <main className="max-w-xl mx-auto px-4 -mt-12 relative z-10">
                    <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border border-slate-100/50 space-y-6">
                        <div className="h-8 bg-slate-200 rounded-lg w-2/3" />
                        <div className="h-4 bg-slate-200 rounded-lg w-1/3" />
                        <div className="grid grid-cols-3 gap-3">
                            <div className="h-16 bg-slate-100 rounded-2xl" />
                            <div className="h-16 bg-slate-100 rounded-2xl" />
                            <div className="h-16 bg-slate-100 rounded-2xl" />
                        </div>
                        <div className="h-20 bg-slate-100 rounded-2xl" />
                        <div className="h-32 bg-slate-150 rounded-2xl" />
                    </div>
                </main>
            </div>
        );
    }

    if (loadError === "not_found") {
        return (
            <div className="min-h-screen bg-slate-50 pb-32">
                <TopNavigation title="Vendor Profile" />
                <main className="max-w-xl mx-auto px-4 pt-16 text-center">
                    <p className="text-slate-800 text-sm font-bold mb-2">This local partner isn&apos;t available.</p>
                    <p className="text-slate-400 text-xs mb-6">The listing may have been removed or the link is incorrect.</p>
                    <Button
                        onClick={() => router.push(`/${params.lang}/explore`)}
                        className="h-12 px-6 rounded-2xl bg-slate-950 text-white font-black text-xs uppercase tracking-widest"
                    >
                        Browse local services
                    </Button>
                </main>
            </div>
        );
    }

    if (loadError === "error" || !profile) {
        return (
            <div className="min-h-screen bg-slate-50 pb-32">
                <TopNavigation title="Vendor Profile" />
                <main className="max-w-xl mx-auto px-4 pt-16 text-center">
                    <p className="text-slate-800 text-sm font-bold mb-2">We couldn&apos;t load this profile right now.</p>
                    <p className="text-slate-400 text-xs mb-6">Check your connection and try again.</p>
                    <button
                        onClick={fetchProfile}
                        className="text-emerald-600 text-xs font-black uppercase tracking-wider hover:text-emerald-700 transition-colors"
                    >
                        Try again
                    </button>
                </main>
            </div>
        );
    }

    const currentSelected = profile.services.find((s: any) => s.id === selectedService);

    const handleAddToPackage = () => {
        if (!selectedService || !currentSelected) {
            return showNotification("Please select a service first", "error");
        }
        showNotification(`${currentSelected.name} added to your journey!`, "success");
        // Redirect back to landing page or builder
        router.push(`/${params.lang}/builder`);
    };

    const handleSharePortfolio = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            showNotification("Public portfolio link copied to clipboard!", "success");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            <TopNavigation title="Vendor Profile" />
            
            {/* Hero Image */}
            <div className="h-96 w-full relative">
                <NextImage 
                    src={profile.image} 
                    fill 
                    className="object-cover" 
                    alt={profile.name} 
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-16 left-6 right-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase rounded-md tracking-wider shadow-lg">
                            PAHARI YATRI LEGEND
                        </span>
                    </div>
                </div>
            </div>

            <main className="max-w-xl mx-auto px-4 -mt-12 relative z-10">
                <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-2xl shadow-slate-200/60 border border-slate-100/50">
                    <div className="flex justify-between items-start mb-6 gap-4">
                        <div>
                            <Typography variant="h1" className="text-3xl font-black text-slate-950 mb-1.5 uppercase italic">
                                {profile.name}
                            </Typography>
                            {/* Real trustScore only — the whole row is omitted when the
                                vendor genuinely has no rating, rather than showing a
                                star next to an invented number. */}
                            {profile.rating != null && (
                                <div className="flex items-center gap-2">
                                    <span className="text-amber-500 font-bold text-sm">★ {profile.rating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-2 items-end shrink-0">
                            {profile.startingPrice != null && (
                                <div className="px-3 h-12 min-w-12 bg-slate-900 text-white rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-slate-900/10 leading-none">
                                     <span className="text-[7px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">from</span>
                                     <span className="font-black text-xs">
                                        {profile.currency === "INR" ? "₹" : `${profile.currency} `}
                                        {Math.round(profile.startingPrice).toLocaleString("en-IN")}
                                     </span>
                                </div>
                            )}
                            <button
                                onClick={handleSharePortfolio}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-200 shadow-sm active:scale-95 touch-manipulation"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                                Share
                            </button>
                        </div>
                    </div>

                    {/* Real service-area city only — sourced from this vendor's actual
                        listed services, not shown at all when they have none yet. */}
                    {profile.hometown && (
                        <div className="grid grid-cols-1 gap-2.5 mb-6 border-b border-slate-100 pb-6 text-center">
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Location</p>
                                <p className="text-[10px] font-black text-slate-800 uppercase mt-1 truncate" title={profile.hometown}>{profile.hometown}</p>
                            </div>
                        </div>
                    )}

                    <Typography variant="p" className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">
                        {profile.description}
                    </Typography>

                    {/* Features list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        {profile.features.map((feature: string, i: number) => (
                            <div key={i} className="flex items-center gap-2.5">
                                <div className="w-5 h-5 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-wide text-slate-700">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <Typography variant="h3" className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">
                        Featured Services
                    </Typography>
                    
                    {/* Services options with active select style */}
                    <div className="space-y-3.5 mb-10">
                        {profile.services.length === 0 ? (
                            <div className="p-5 rounded-2xl border border-dashed border-slate-200 text-center">
                                <p className="text-[11px] font-bold text-slate-500">This partner hasn&apos;t published bookable services yet.</p>
                            </div>
                        ) : (
                            profile.services.map((service: { id: string; name: string; price: number; currency: string; unit: string; description: string }) => (
                                <button
                                    key={service.id}
                                    onClick={() => setSelectedService(service.id)}
                                    className={`w-full p-5 rounded-2xl border-2 transition-all flex flex-col gap-2 group text-left ${
                                        selectedService === service.id
                                            ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/5'
                                            : 'border-slate-100 hover:border-slate-200 hover:-translate-y-0.5'
                                    }`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div>
                                            <p className="font-black text-slate-950 leading-none uppercase text-[11px] tracking-wider">{service.name}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-black text-emerald-600 text-sm">
                                                {service.currency === "INR" ? "₹" : `${service.currency} `}{Math.round(service.price).toLocaleString("en-IN")}
                                            </p>
                                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">per {service.unit}</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1 border-t border-slate-100/60 pt-2 w-full">
                                        {service.description}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>

                    {/* A "Background Check: Pass" / "Fully Verified & Audited" block
                        used to render here unconditionally for every vendor, real or
                        mock — there is no background-check system anywhere in this
                        product. Removed rather than gated: asserting a safety check
                        that never happened is a real trust/liability problem, not
                        just a data-fabrication one. */}

                    {/* QR Code Tag */}
                    <div className="bg-slate-950 rounded-[2rem] text-center mb-10 pb-8 pt-4 border border-slate-900 shadow-2xl">
                        <Typography variant="h3" className="text-white text-[9px] font-black uppercase tracking-widest mb-4 mt-6">
                            Official Authenticity QR Tag
                        </Typography>
                        <div className="inline-block relative p-2 bg-white rounded-2xl shadow-md">
                            <VendorQRCode vendorId={id} businessName={profile.name} />
                        </div>
                    </div>

                    {/* CTA — the only real, working flow: bundle this service into a
                        trip package via the builder (createBooking requires a
                        packageId, dates and guest count, none of which exist on
                        this page, so an "instant" single-service checkout would
                        have to fake a booking — removed rather than faked). */}
                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={handleAddToPackage}
                            className="w-full h-16 rounded-2xl bg-slate-950 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-950/15 active:scale-95 transition-all duration-300"
                        >
                            Add to Trip Package
                        </Button>
                    </div>

                    {/* PY-004 — a traveler deciding on a partner had no way to reach
                        a human. Config-driven: renders nothing when no channel is set. */}
                    <SupportContact
                        variant="bar"
                        className="mt-6"
                        reference={`vendor ${profile.name}`}
                        heading="Questions about this partner?"
                    />
                </div>
            </main>
        </div>
    );
}
