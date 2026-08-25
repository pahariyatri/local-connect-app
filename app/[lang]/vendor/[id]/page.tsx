"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import LocalImage from "../../components/atoms/Image";
import { useNotification } from "@/contexts/NotificationContext";
import TopNavigation from "../../components/organisms/TopNavigation";
import SupportContact from "../../components/molecules/SupportContact";
import { getVendorById } from "@/services/vendorService";
import { ApiClientError } from "@/lib/apiClient";
import { searchDiscoveryServices } from "@/services/searchService";
import { createDirectBooking, getUserBookings } from "@/services/bookingService";
import { Icon } from "../../components/atoms/Icon";

import FeedbackReviewModal, { ReviewItem } from "../../components/molecules/FeedbackReviewModal";

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

// Purely decorative fallback image when a service has no real photo — a
// generic category picture, not a claim about what's included. Real
// category comes from the API (s.category); no keyword-guessing here.
// (Previously this was `getServiceClassification()`, which ALSO invented
// inclusions/cancellation-policy/price per category regardless of what the
// real service actually was — see AUDIT-007. Removed entirely: the
// vendorId-filtered discovery API call below already returns real
// inclusions, cancellationPolicy, and pricing for every service.)
const categoryFallbackImage = (category: string): string => {
    const key = /adventure|trek|guide|raft/i.test(category)
        ? "Adventures"
        : /transport|taxi|cab/i.test(category)
        ? "Transport"
        : /food|meal|dining/i.test(category)
        ? "Food"
        : "Homestays";
    return CATEGORY_IMAGES[key];
};

export default function VendorProfilePage() {
    const params = useParams<{ id: string; lang: string }>();
    const id = params.id as string;
    const lang = params.lang || "en";
    const router = useRouter();
    const { showNotification } = useNotification();
    const [activeDetailModal, setActiveDetailModal] = useState<DetailedService | null>(null);
    const [bookingModalService, setBookingModalService] = useState<DetailedService | null>(null);
    const [bookingTravelDate, setBookingTravelDate] = useState("");
    const [bookingGuestCount, setBookingGuestCount] = useState(1);
    const [bookingNotes, setBookingNotes] = useState("");
    const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<"not_found" | "error" | null>(null);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [canReview, setCanReview] = useState(false);

    useEffect(() => {
        if (!id) return;
        try {
            const raw = localStorage.getItem(`py_reviews_${id}`);
            if (raw) setReviews(JSON.parse(raw));
        } catch {
            // ignore
        }
    }, [id]);

    useEffect(() => {
        async function checkReviewEligibility() {
            if (!id || !profile?.id) return;
            try {
                const userBookings = await getUserBookings({ limit: 50 });
                if (userBookings?.bookings?.length > 0) {
                    const vendorServiceIds = new Set((profile?.services || []).map((s: any) => String(s.id)));
                    const hasBooking = userBookings.bookings.some((b: any) => {
                        if (b.directServiceId && vendorServiceIds.has(String(b.directServiceId))) return true;
                        if (b.items && Array.isArray(b.items)) {
                            return b.items.some((item: any) => String(item.vendor?.id || item.vendorId) === String(id));
                        }
                        if (b.package?.selectedServices) {
                            const servicesMap = b.package.selectedServices;
                            return Object.values(servicesMap).some((day: any) =>
                                Object.values(day || {}).some((sid: any) => sid != null && vendorServiceIds.has(String(sid)))
                            );
                        }
                        return false;
                    });
                    setCanReview(hasBooking);
                }
            } catch {
                setCanReview(false);
            }
        }
        checkReviewEligibility();
    }, [id, profile]);

    const fetchProfile = async () => {
        setIsLoading(true);
        setLoadError(null);
        try {
            const response = await getVendorById(id);
            if (response && response.id) {
                let servicesList: DetailedService[] = [];
                try {
                    // Real data only: the same discovery endpoint /explore
                    // uses, filtered to this vendor (AUDIT-007) — inclusions,
                    // cancellationPolicy, and pricing all come straight from
                    // the API, nothing invented client-side.
                    const searchResult = await searchDiscoveryServices({ vendorId: response.id, limit: 50 });
                    servicesList = searchResult.services.map((s) => ({
                        id: String(s.id),
                        name: s.name,
                        description: s.shortDescription || s.description,
                        price: s.pricing.unitPrice,
                        currency: s.pricing.currency || "INR",
                        unit: s.pricing.priceUnit ? `per ${s.pricing.priceUnit}` : "per service",
                        capacity: s.capacity ?? 2,
                        category: s.category,
                        image: s.thumbnail || categoryFallbackImage(s.category),
                        city: s.location?.city,
                        inclusions: s.inclusions,
                        cancellationPolicy: s.cancellationPolicy,
                    }));
                } catch (serviceErr) {
                    console.error("Error loading services for vendor:", serviceErr);
                }

                const vendorType = response.types?.[0] || "";
                const category = VENDOR_TYPE_TO_CATEGORY[vendorType.toLowerCase()] || "Local Partner";
                const cleanName = response.businessName.replace(/\s*\(.*?\)\s*/g, "").trim();
                const contactPerson = response.pointOfContact?.name || response.user?.name || "Himachal Local Host";
                const minPrice = servicesList.length > 0 ? Math.min(...servicesList.map((s) => s.price)) : null;

                const offeredCategories = Array.from(new Set(servicesList.map((s) => s.category).filter(Boolean)));

                const features = [
                    response.isVerified && "Verified Local Partner",
                    response.isInstantBooking && "Instant Direct Booking",
                    typeof response.acceptanceRate === "number" && `${response.acceptanceRate}% Acceptance Rate`,
                    "100% Escrow Protected",
                ].filter(Boolean) as string[];

                setProfile({
                    id: response.id,
                    name: cleanName,
                    contactPerson,
                    image: servicesList[0]?.image || CATEGORY_IMAGES[category] || CATEGORY_IMAGES["Homestays"],
                    rating: response.trustScore ?? null,
                    startingPrice: minPrice,
                    currency: "INR",
                    category,
                    offeredCategories,
                    description: response.description || "Authentic verified Himachal local partner offering direct homestays, mountain transit, and guided local experiences.",
                    features,
                    services: servicesList,
                    hometown: servicesList[0]?.city || response.city || "Himachal Pradesh",
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

    const openBookingModal = (service: DetailedService) => {
        setBookingModalService(service);
        setBookingTravelDate("");
        setBookingGuestCount(1);
        setBookingNotes("");
    };

    const handleSubmitBooking = async () => {
        if (!bookingModalService) return;
        if (!bookingTravelDate) {
            return showNotification("Please choose a travel date", "error");
        }
        setIsSubmittingBooking(true);
        try {
            const result = await createDirectBooking({
                serviceId: Number(bookingModalService.id),
                travelDate: bookingTravelDate,
                guestCount: bookingGuestCount,
                notes: bookingNotes || undefined,
            });
            showNotification(result.message, "success");
            setBookingModalService(null);
            setActiveDetailModal(null);
            router.push(`/${lang}/bookings/${result.bookingId}`);
        } catch (err) {
            showNotification(err instanceof ApiClientError ? err.message : "Could not submit your booking request. Please try again.", "error");
        } finally {
            setIsSubmittingBooking(false);
        }
    };

    const handleSharePortfolio = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            showNotification("Partner profile link copied to clipboard!", "success");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-28">
            <TopNavigation title={profile.name} transparent={true} />

            {/* ── HERO BANNER ────────────────────────────────────────── */}
            <div className="w-full relative overflow-hidden bg-slate-950 pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-8">
                <LocalImage
                    src={profile.image}
                    alt={profile.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />

                <div className="max-w-3xl mx-auto relative z-10 space-y-4">
                    {/* Floating Badges */}
                    <div className="flex items-center justify-between gap-3 pt-2">
                        <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-full tracking-wider shadow-lg">
                            PAHARI YATRI VERIFIED
                        </span>
                        <button
                            onClick={handleSharePortfolio}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-wider border border-white/20 shadow-md transition-all active:scale-95"
                        >
                            <Icon name="share" className="w-3.5 h-3.5" />
                            Share
                        </button>
                    </div>

                    <div className="text-white space-y-1.5 pt-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                                {profile.category}
                            </span>
                            <span className="text-slate-400 text-xs">•</span>
                            <span className="text-[11px] font-bold text-slate-200 capitalize">
                                📍 {profile.hometown}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight uppercase text-white">
                            {profile.name}
                        </h1>
                    </div>
                </div>
            </div>

            {/* ── MAIN CONTENT ───────────────────────────────────────── */}
            <main className="max-w-3xl mx-auto px-4 sm:px-6 -mt-6 relative z-10 space-y-6">
                {/* Vendor Overview Card */}
                <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl border border-slate-200/80 space-y-5">
                    {/* Header: Business & Host Identity */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mb-2 inline-block">
                                Verified Local Partner • {profile.category}
                            </span>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                {profile.name}
                            </h2>
                            <p className="text-xs text-slate-500 font-bold mt-1 flex items-center gap-2">
                                <span>👤 Hosted by <strong className="text-slate-800 font-black">{profile.contactPerson}</strong></span>
                                <span>•</span>
                                <span>📍 {profile.hometown}</span>
                            </p>
                        </div>

                        {profile.startingPrice != null && (
                            <div className="sm:text-right shrink-0 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl">
                                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Starting from</span>
                                <span className="text-lg sm:text-xl font-black text-slate-900">
                                    ₹{Math.round(profile.startingPrice).toLocaleString("en-IN")}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* About this Host */}
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">About this Partner</h3>
                        <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                            {profile.description}
                        </p>
                    </div>

                    {/* Services Summary Pill */}
                    {profile.offeredCategories && profile.offeredCategories.length > 0 && (
                        <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-700">Services Offered by Host:</span>
                            <div className="flex flex-wrap gap-1.5">
                                {profile.offeredCategories.map((cat: string, idx: number) => (
                                    <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-800 shadow-2xs capitalize">
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

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
                                const isSelected = bookingModalService?.id === service.id;
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
                                                        onClick={() => openBookingModal(service)}
                                                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95"
                                                    >
                                                        Request to Book
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

                {/* ── VERIFIED REVIEWS & FEEDBACK SECTION ── */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                                Verified Feedback & Ratings
                            </span>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">
                                Traveler Reviews ({reviews.length})
                            </h3>
                        </div>
                        {canReview ? (
                            <button
                                onClick={() => setIsFeedbackModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 self-start sm:self-auto"
                            >
                                <span>★ Write Review / Feedback</span>
                            </button>
                        ) : (
                            <span className="text-[11px] text-slate-400 font-medium self-start sm:self-auto">
                                🔒 Reviewing enabled after taking service with host
                            </span>
                        )}
                    </div>

                    {reviews.length === 0 ? (
                        <div className="py-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-4">
                            <p className="text-xs font-bold text-slate-700">No public reviews yet for this host.</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Be the first traveler to rate your stay or ride!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {reviews.map((rev) => (
                                <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-amber-400 font-black text-xs">
                                                {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                                            </span>
                                            <span className="text-xs font-black text-slate-800">{rev.authorName}</span>
                                        </div>
                                        <span className="text-[10px] font-medium text-slate-400">{rev.createdAt}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                        {rev.publicComment}
                                    </p>
                                </div>
                            ))}
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
                                onClick={() => openBookingModal(activeDetailModal)}
                                className="w-2/3 h-12 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                            >
                                Request to Book →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── DIRECT BOOKING REQUEST MODAL ───────────────────────── */}
            {bookingModalService && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div
                        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="p-5 sm:p-6 space-y-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900">Request to Book</h3>
                                    <p className="text-xs text-slate-500 font-medium">{bookingModalService.name} · Host: {profile.name}</p>
                                </div>
                                <button
                                    onClick={() => setBookingModalService(null)}
                                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-bold hover:bg-slate-200 transition-all"
                                    aria-label="Close"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-900 font-medium">
                                The host will call you to confirm availability. You&apos;ll only pay a small token deposit once they&apos;ve confirmed — the rest is paid directly to the host on arrival.
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Travel Date</label>
                                <input
                                    type="date"
                                    value={bookingTravelDate}
                                    min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
                                    onChange={(e) => setBookingTravelDate(e.target.value)}
                                    className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                                    Guests (up to {bookingModalService.capacity})
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={bookingModalService.capacity}
                                    value={bookingGuestCount}
                                    onChange={(e) => setBookingGuestCount(Math.max(1, Math.min(bookingModalService.capacity, Number(e.target.value) || 1)))}
                                    className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Special Requests (optional)</label>
                                <textarea
                                    value={bookingNotes}
                                    onChange={(e) => setBookingNotes(e.target.value)}
                                    rows={2}
                                    placeholder="e.g. early check-in, dietary needs..."
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Starting from</span>
                                <span className="text-sm font-black text-slate-900">
                                    ₹{Math.round(bookingModalService.price).toLocaleString("en-IN")} <span className="text-[10px] font-bold text-slate-400">{bookingModalService.unit}</span>
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium -mt-3">Final price is confirmed by the host and shown before any payment.</p>

                            <button
                                onClick={handleSubmitBooking}
                                disabled={isSubmittingBooking || !bookingTravelDate}
                                className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                            >
                                {isSubmittingBooking ? "Sending Request..." : "Send Booking Request"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── FEEDBACK & REVIEW MODAL ── */}
            <FeedbackReviewModal
                vendorId={id}
                vendorName={profile.name}
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
                onSubmitted={(newReview) => {
                    setReviews((prev) => [newReview, ...prev]);
                    showNotification("Thank you! Your feedback & rating have been saved.", "success");
                }}
            />
        </div>
    );
}

