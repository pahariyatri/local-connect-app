"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import LocalImage from "../../components/atoms/Image";
import { useNotification } from "@/contexts/NotificationContext";
import TopNavigation from "../../components/organisms/TopNavigation";
import SupportContact from "../../components/molecules/SupportContact";
import { getVendorById } from "@/services/vendorService";
import { getServices } from "@/services/catalogService";
import { ApiClientError } from "@/lib/apiClient";
import { searchDiscoveryServices } from "@/services/searchService";
import { Icon } from "../../components/atoms/Icon";

const CATEGORY_IMAGES: Record<string, string> = {
    "Homestays": "https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=1200",
    "Adventures": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200",
    "Transport": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200",
    "Food": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200",
    "Guides": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200",
    "Wellness": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200"
};

const VENDOR_TYPE_TO_CATEGORY: Record<string, string> = {
    "hotel": "Homestays",
    "adventure": "Adventures",
    "transport": "Transport",
    "restaurant": "Food",
    "guide": "Guides",
    "wellness": "Wellness"
};

export interface DetailedService {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    unit: string;
    capacity: number;
    category: string;
    subcategoryName?: string;
    image: string;
    city?: string;
    inclusions: string[];
    cancellationPolicy: string;
    prices?: any[];
}

const getServiceClassification = (s: any) => {
    const name = (s.name || "").toLowerCase();
    const subcat = (s.subcategory?.name || "").toLowerCase();

    if (name.includes("angling") || name.includes("trout") || name.includes("trek") || name.includes("trail") || name.includes("rafting") || name.includes("guide") || subcat.includes("adventure")) {
        return {
            category: "Adventure & Guide",
            unit: "per person / session",
            image: s.thumbnail || s.additionalData?.images?.[0] || CATEGORY_IMAGES["Adventures"],
            inclusions: ["Certified Local Guide", "UNESCO GHNP Trail Briefing", "Permit & Entry Assistance", "Angling Gear & First Aid"]
        };
    }
    if (name.includes("taxi") || name.includes("cab") || name.includes("transfer") || name.includes("transport") || subcat.includes("transport")) {
        return {
            category: "Transport",
            unit: "per vehicle / trip",
            image: s.thumbnail || s.additionalData?.images?.[0] || CATEGORY_IMAGES["Transport"],
            inclusions: ["Experienced Hill Driver", "Mountain-ready 4x4 / MUV", "Toll & Fuel Included", "Luggage Assistance"]
        };
    }
    if (name.includes("food") || name.includes("meal") || name.includes("cafe") || name.includes("restaurant") || subcat.includes("food")) {
        return {
            category: "Food & Dining",
            unit: "per person",
            image: s.thumbnail || s.additionalData?.images?.[0] || CATEGORY_IMAGES["Food"],
            inclusions: ["Fresh Local Himachali Meal", "Traditional Mountain Spices", "Hygienic Preparation", "Local Tea / Beverage"]
        };
    }
    return {
        category: s.subcategory?.name || "Homestay & Lodge",
        unit: "per night",
        image: s.thumbnail || s.additionalData?.images?.[0] || CATEGORY_IMAGES["Homestays"],
        inclusions: ["Verified Local Host", "Riverside / Valley Balcony", "Hot Water & Heated Bedding", "Assisted Check-in"]
    };
};

export default function VendorProfilePage() {
    const params = useParams<{ id: string; lang: string }>();
    const id = params.id as string;
    const lang = params.lang || "en";
    const router = useRouter();
    const { showNotification } = useNotification();
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
    const [activeDetailModal, setActiveDetailModal] = useState<DetailedService | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<"not_found" | "error" | null>(null);

    const fetchProfile = async () => {
        setIsLoading(true);
        setLoadError(null);
        try {
            const response = await getVendorById(id);
            if (response && response.id) {
                let servicesList: DetailedService[] = [];
                try {
                    const allServices = await getServices();
                    if (Array.isArray(allServices)) {
                        const matched = allServices.filter(
                            (s: any) => s.vendor?.id === response.id || s.vendorId === response.id
                        );
                        servicesList = matched.map((s: any) => {
                            const rawPrice = Array.isArray(s.prices) && s.prices.length > 0
                                ? Number(s.prices[0]?.price)
                                : 2000;
                            const classification = getServiceClassification(s);

                            return {
                                id: String(s.id),
                                name: s.name,
                                description: s.description || "Authentic verified local mountain experience.",
                                price: rawPrice,
                                currency: "INR",
                                unit: classification.unit,
                                capacity: s.capacity || 2,
                                category: classification.category,
                                subcategoryName: s.subcategory?.name,
                                image: classification.image,
                                city: s.addresses?.[0]?.city || undefined,
                                inclusions: classification.inclusions,
                                cancellationPolicy: "Free cancellation up to 48 hours prior to start date.",
                                prices: s.prices || []
                            };
                        });
                    }

                    // Fallback to discovery search if direct services list had 0
                    if (servicesList.length === 0) {
                        const searchResult = await searchDiscoveryServices({ q: response.businessName, limit: 50 });
                        const fallbackMatched = searchResult.services.filter((s) => s.vendor.id === response.id);
                        if (fallbackMatched.length > 0) {
                            servicesList = fallbackMatched.map((s) => {
                                const classification = getServiceClassification(s);
                                return {
                                    id: String(s.id),
                                    name: s.name,
                                    description: s.shortDescription || s.description || "Verified local service.",
                                    price: s.pricing.unitPrice,
                                    currency: s.pricing.currency || "INR",
                                    unit: s.pricing.priceUnit ? `per ${s.pricing.priceUnit}` : classification.unit,
                                    capacity: 2,
                                    category: s.category || classification.category,
                                    image: classification.image,
                                    city: s.location?.city,
                                    inclusions: classification.inclusions,
                                    cancellationPolicy: "Free cancellation up to 48 hours before check-in.",
                                };
                            });
                        }
                    }
                } catch (serviceErr) {
                    console.error("Error loading services for vendor:", serviceErr);
                }

                const vendorType = response.types?.[0] || "";
                const category = VENDOR_TYPE_TO_CATEGORY[vendorType.toLowerCase()] || "Local Partner";
                const cleanName = response.businessName.replace(/\s*\(.*?\)\s*/g, "").trim();
                const minPrice = servicesList.length > 0 ? Math.min(...servicesList.map((s) => s.price)) : null;

                const features = [
                    response.isVerified && "Verified Partner",
                    response.isInstantBooking && "Instant Booking Enabled",
                    typeof response.acceptanceRate === "number" && `${response.acceptanceRate}% Acceptance Rate`,
                ].filter(Boolean) as string[];

                setProfile({
                    id: response.id,
                    name: cleanName,
                    image: servicesList[0]?.image || CATEGORY_IMAGES[category] || CATEGORY_IMAGES["Homestays"],
                    rating: response.trustScore ?? null,
                    startingPrice: minPrice,
                    currency: "INR",
                    category,
                    description: response.description || "Authentic verified Himachal local partner.",
                    features,
                    services: servicesList,
                    hometown: servicesList[0]?.city || "Himachal Pradesh",
                });
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
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 pb-32 animate-pulse">
                <TopNavigation title="Loading Partner..." />
                <div className="h-72 sm:h-96 w-full bg-slate-200" />
                <main className="max-w-3xl mx-auto px-4 -mt-12 relative z-10">
                    <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 space-y-6">
                        <div className="h-8 bg-slate-200 rounded-lg w-2/3" />
                        <div className="h-4 bg-slate-200 rounded-lg w-1/3" />
                        <div className="h-24 bg-slate-100 rounded-2xl" />
                        <div className="h-40 bg-slate-100 rounded-2xl" />
                    </div>
                </main>
            </div>
        );
    }

    if (loadError === "not_found") {
        return (
            <div className="min-h-screen bg-slate-50 pb-32">
                <TopNavigation title="Partner Profile" />
                <main className="max-w-md mx-auto px-4 pt-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-2xl">
                        🏔️
                    </div>
                    <p className="text-slate-900 text-lg font-black mb-2">This local partner is currently unavailable.</p>
                    <p className="text-slate-400 text-xs mb-6 font-medium">The listing may have been updated or moved.</p>
                    <button
                        onClick={() => router.push(`/${lang}/explore`)}
                        className="h-12 px-6 rounded-full bg-slate-950 text-white font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                    >
                        Browse Valleys & Stays
                    </button>
                </main>
            </div>
        );
    }

    if (loadError === "error" || !profile) {
        return (
            <div className="min-h-screen bg-slate-50 pb-32">
                <TopNavigation title="Partner Profile" />
                <main className="max-w-md mx-auto px-4 pt-20 text-center">
                    <p className="text-slate-900 text-base font-black mb-2">Unable to load profile</p>
                    <p className="text-slate-400 text-xs mb-6 font-medium">Please check your internet connection.</p>
                    <button
                        onClick={fetchProfile}
                        className="px-6 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition-colors"
                    >
                        Try Again
                    </button>
                </main>
            </div>
        );
    }

    const currentSelected = profile.services.find((s: DetailedService) => s.id === selectedServiceId);

    const handleAddToPackage = (service?: DetailedService) => {
        const target = service || currentSelected;
        if (!target) {
            return showNotification("Please select a service first", "error");
        }
        showNotification(`Added ${target.name} to your trip plan!`, "success");
        router.push(`/${lang}/builder`);
    };

    const handleSharePortfolio = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            showNotification("Partner profile link copied to clipboard!", "success");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-28">
            <TopNavigation title={profile.name} />

            {/* ── HERO BANNER ────────────────────────────────────────── */}
            <div className="h-72 sm:h-96 w-full relative overflow-hidden bg-slate-900">
                <LocalImage
                    src={profile.image}
                    alt={profile.name}
                    className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                
                {/* Floating Badges on Hero */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-full tracking-wider shadow-lg">
                        PAHARI YATRI VERIFIED
                    </span>
                    <button
                        onClick={handleSharePortfolio}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-md hover:bg-white text-slate-800 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md transition-all active:scale-95"
                    >
                        <Icon name="share" className="w-3.5 h-3.5" />
                        Share
                    </button>
                </div>

                <div className="absolute bottom-6 left-4 right-4 sm:left-8 sm:right-8 text-white">
                    <div className="max-w-3xl mx-auto flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                            {profile.category}
                        </span>
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-[11px] font-bold text-slate-200 capitalize">
                            📍 {profile.hometown}
                        </span>
                    </div>
                    <h1 className="max-w-3xl mx-auto text-2xl sm:text-4xl font-black tracking-tight leading-tight uppercase">
                        {profile.name}
                    </h1>
                </div>
            </div>

            {/* ── MAIN CONTENT ───────────────────────────────────────── */}
            <main className="max-w-3xl mx-auto px-4 -mt-4 relative z-10 space-y-6">
                {/* Vendor Overview Card */}
                <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl border border-slate-200/80 space-y-5">
                    {/* Top Highlights Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full">
                                {profile.rating != null ? (
                                    <span className="text-amber-500 font-black text-xs">★ {profile.rating.toFixed(1)}</span>
                                ) : (
                                    <span className="text-slate-500 font-bold text-xs">Not yet rated</span>
                                )}
                                <span className="text-[10px] font-bold text-slate-500">Verified Host</span>
                            </div>
                        </div>

                        {profile.startingPrice != null && (
                            <div className="text-right">
                                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Starting from</span>
                                <span className="text-base sm:text-lg font-black text-slate-900">
                                    ₹{Math.round(profile.startingPrice).toLocaleString("en-IN")}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">About this Host</h2>
                        <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                            {profile.description}
                        </p>
                    </div>

                    {/* Features Chips */}
                    <div className="flex flex-wrap gap-2 pt-1">
                        {profile.features.map((feature: string, idx: number) => (
                            <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/70 text-[10px] font-bold text-slate-700"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {feature}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ── SERVICES CATALOG ───────────────────────────────────── */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div>
                            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                                Available Services & Stays
                            </h2>
                            <p className="text-xs text-slate-400 font-medium">
                                Book direct with verified local rates and dedicated support.
                            </p>
                        </div>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                            {profile.services.length} Listings
                        </span>
                    </div>

                    {profile.services.length === 0 ? (
                        <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
                            <p className="text-slate-700 text-sm font-bold">This host is currently updating their catalog.</p>
                            <p className="text-slate-400 text-xs font-medium max-w-sm mx-auto">
                                You can build a custom trip to request instant matching with this partner.
                            </p>
                            <button
                                onClick={() => router.push(`/${lang}/builder`)}
                                className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-all"
                            >
                                Plan Custom Journey →
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {profile.services.map((service: DetailedService) => {
                                const isSelected = selectedServiceId === service.id;
                                return (
                                    <div
                                        key={service.id}
                                        className={`bg-white rounded-3xl overflow-hidden border-2 transition-all duration-200 shadow-sm hover:shadow-md ${
                                            isSelected
                                                ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10"
                                                : "border-slate-200/80 hover:border-slate-300"
                                        }`}
                                    >
                                        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4 min-w-0">
                                                {/* Service Thumbnail */}
                                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0 relative">
                                                    <LocalImage
                                                        src={service.image}
                                                        alt={service.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {/* Details */}
                                                <div className="space-y-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                                            {service.category}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400">
                                                            👥 Up to {service.capacity} guests
                                                        </span>
                                                    </div>
                                                    <h3 className="text-base font-black text-slate-900 leading-tight">
                                                        {service.name}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                                                        {service.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Price & Action Buttons */}
                                            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 gap-2 shrink-0">
                                                <div className="text-left sm:text-right">
                                                    <p className="text-lg font-black text-slate-900 leading-none">
                                                        ₹{Math.round(service.price).toLocaleString("en-IN")}
                                                    </p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                                        {service.unit}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setActiveDetailModal(service)}
                                                        className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                                                    >
                                                        Details
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedServiceId(service.id);
                                                            handleAddToPackage(service);
                                                        }}
                                                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95"
                                                    >
                                                        Add to Trip
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Inclusions Quick Bar */}
                                        <div className="bg-slate-50/70 px-4 sm:px-5 py-2.5 border-t border-slate-100 flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-500">
                                            <span className="text-slate-400 font-black uppercase text-[9px]">Included:</span>
                                            {service.inclusions.slice(0, 3).map((inc, i) => (
                                                <span key={i} className="flex items-center gap-1">
                                                    <span className="text-emerald-500">✓</span> {inc}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Direct Host Contact & Inquiries */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
                    <SupportContact
                        variant="bar"
                        reference={`Host ${profile.name}`}
                        heading="Questions or Special Requests for this Host?"
                    />
                </div>
            </main>

            {/* ── SERVICE DETAILS MODAL / DRAWER ─────────────────────── */}
            {activeDetailModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div
                        className="bg-white w-full max-w-xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-y-auto shadow-2xl flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200"
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Modal Header with Image */}
                        <div className="relative h-56 sm:h-64 w-full bg-slate-900 shrink-0">
                            <LocalImage
                                src={activeDetailModal.image}
                                alt={activeDetailModal.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                            
                            <button
                                onClick={() => setActiveDetailModal(null)}
                                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center text-sm font-bold hover:bg-black transition-all"
                                aria-label="Close details"
                            >
                                ✕
                            </button>

                            <div className="absolute bottom-4 left-5 right-5 text-white">
                                <span className="px-2.5 py-0.5 bg-emerald-500 text-white text-[9px] font-black uppercase rounded-md tracking-wider">
                                    {activeDetailModal.category}
                                </span>
                                <h3 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                                    {activeDetailModal.name}
                                </h3>
                                <p className="text-xs text-slate-300 font-medium">
                                    Host: {profile.name} {activeDetailModal.city && `• 📍 ${activeDetailModal.city}`}
                                </p>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 sm:p-6 space-y-5">
                            {/* Price & Capacity Banner */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div>
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Direct Verified Rate</span>
                                    <p className="text-xl font-black text-slate-900">
                                        ₹{Math.round(activeDetailModal.price).toLocaleString("en-IN")}{" "}
                                        <span className="text-xs font-bold text-slate-400">{activeDetailModal.unit}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Capacity</span>
                                    <p className="text-sm font-black text-slate-800">
                                        👥 {activeDetailModal.capacity} Person(s)
                                    </p>
                                </div>
                            </div>

                            {/* Service Description */}
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">Overview</h4>
                                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                                    {activeDetailModal.description}
                                </p>
                            </div>

                            {/* Inclusions */}
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">What&apos;s Included</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {activeDetailModal.inclusions.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl text-xs font-bold text-slate-700">
                                            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">✓</span>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Booking & Cancellation Terms */}
                            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 space-y-1">
                                <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">Flexible Policy</span>
                                <p className="text-xs text-amber-900 font-medium">
                                    {activeDetailModal.cancellationPolicy}
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer CTA */}
                        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                            <button
                                onClick={() => setActiveDetailModal(null)}
                                className="w-1/3 h-12 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-black text-xs uppercase tracking-wider transition-all"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedServiceId(activeDetailModal.id);
                                    handleAddToPackage(activeDetailModal);
                                    setActiveDetailModal(null);
                                }}
                                className="w-2/3 h-12 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                            >
                                Add to Trip Plan →
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

