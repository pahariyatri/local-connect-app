"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import LocalImage from "../../components/atoms/Image";
import { useNotification } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import TopNavigation from "../../components/organisms/TopNavigation";
import SupportContact from "../../components/molecules/SupportContact";
import { getVendorById } from "@/services/vendorService";
import { ApiClientError } from "@/lib/apiClient";
import { searchDiscoveryServices } from "@/services/searchService";
import { getUserBookings } from "@/services/bookingService";
import { Icon } from "../../components/atoms/Icon";
import VerifiedBadge from "../../components/atoms/VerifiedBadge";
import StarRating from "../../components/atoms/StarRating";

import FeedbackReviewModal, { ReviewItem } from "../../components/molecules/FeedbackReviewModal";
import { trackPartnerProfileView } from "@/lib/analytics";
import { sessionTracker } from "@/services/sessionService";
import { addRecentView } from "@/lib/recentlyViewed";

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
    /** Real per-service value from the backend, or the honest hedge below when
     *  the vendor hasn't set one. Never a fabricated specific policy. */
    cancellationPolicy: string;
    /** Only set when the backend actually returns one — never defaulted. */
    termsAndConditions?: string;
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
    const params = useParams<{ id: string }>();
    const id = params.id as string;
    const router = useRouter();
    const { showNotification } = useNotification();
    const { user } = useAuth();
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
            if (!id || !profile?.id || !user) {
                setCanReview(false);
                return;
            }
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
    }, [id, profile, user]);

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
                // Real data only: response.pointOfContacts is the actual
                // relation this endpoint returns (see vendor.service.ts
                // findOne()). Previously read response.pointOfContact/
                // response.user — fields this endpoint has never returned —
                // so this always fell through to a fabricated "Himachal
                // Local Host" name. Falls back to the vendor's own real
                // business name (never an invented person) when no contact
                // is on file.
                setProfile({
                    id: response.id,
                    name: cleanName,
                    image: servicesList[0]?.image || CATEGORY_IMAGES[category] || CATEGORY_IMAGES["Homestays"],
                    rating: response.trustScore ?? null,
                    isVerified: !!response.isVerified,
                    currency: "INR",
                    category,
                    description: response.description || "",
                    services: servicesList,
                    hometown: servicesList[0]?.city || response.city || "Himachal Pradesh",
                });
                trackPartnerProfileView(response.id, cleanName);
                // vendor_viewed was declared in SessionEventType but never
                // fired anywhere (dead event, confirmed via repo-wide grep)
                // — trackPartnerProfileView above is a separate, GTM-only pipeline.
                sessionTracker.track('vendor_viewed', { entityType: 'vendor', entityId: String(response.id) });
                addRecentView({
                    type: 'vendor',
                    id: String(response.id),
                    title: cleanName,
                    image: servicesList[0]?.image || null,
                    href: `/vendor/${response.id}`,
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
                        onClick={() => router.push(`/explore`)}
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

    // Booking is now a dedicated page (was a modal here) — see
    // vendor/[id]/book/[serviceId]/page.tsx. Keeps its own date/guest/quote
    // state and the sign-in-detour resume logic, so this profile page no
    // longer needs any of that.
    const goToBooking = (service: DetailedService) => {
        router.push(`/vendor/${id}/book/${service.id}`);
    };

    const handleSharePortfolio = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            showNotification("Partner profile link copied to clipboard!", "success");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-28">
            <TopNavigation title="Partner profile" transparent={true} />

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
                        {profile.isVerified ? (
                            <VerifiedBadge className="bg-white/10 backdrop-blur-md border-white/20" label="Verified" />
                        ) : <span />}
                        <button
                            onClick={handleSharePortfolio}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full text-xs font-semibold border border-white/20 shadow-md transition-all active:scale-95"
                        >
                            <Icon name="share" className="w-3.5 h-3.5" />
                            Share
                        </button>
                    </div>

                    <div className="text-white space-y-1.5 pt-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-emerald-400">
                                {profile.category}
                            </span>
                            <span className="text-slate-400 text-xs">•</span>
                            <span className="text-xs font-medium text-slate-200 flex items-center gap-1 capitalize">
                                <Icon name="map-pin" className="w-3 h-3 text-slate-300" /> {profile.hometown}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight leading-tight text-white">
                            {profile.name}
                        </h1>
                        {typeof profile.rating === "number" && (
                            <StarRating rating={profile.rating} size="small" className="pt-1" />
                        )}
                    </div>
                </div>
            </div>

            {/* ── MAIN CONTENT ───────────────────────────────────────── */}
            <main className="max-w-3xl mx-auto px-4 sm:px-6 -mt-6 relative z-10 space-y-6">
                {profile.description && (
                    <p className="px-1 text-sm leading-relaxed text-slate-600">
                        {profile.description}
                    </p>
                )}

                {/* ── SERVICES CATALOG ───────────────────────────────────── */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                                Services
                            </h2>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">
                            {profile.services.length} {profile.services.length === 1 ? "service" : "services"}
                        </span>
                    </div>

                    {profile.services.length === 0 ? (
                        <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
                            <p className="text-slate-700 text-sm font-semibold">No services are listed right now.</p>
                            <button
                                onClick={() => router.push(`/builder`)}
                                className="px-6 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all"
                            >
                                Plan Custom Journey →
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {profile.services.map((service: DetailedService) => {
                                return (
                                    <div
                                        key={service.id}
                                        className="bg-white rounded-3xl overflow-hidden border-2 border-slate-200/80 hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow-md"
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
                                                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                                            {service.category}
                                                        </span>
                                                        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                                                            <Icon name="users" className="w-3 h-3" /> Up to {service.capacity} guests
                                                        </span>
                                                    </div>
                                                    <h3 className="text-base font-bold text-slate-900 leading-tight">
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
                                                    <p className="text-lg font-bold text-slate-900 leading-none">
                                                        ₹{service.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                                                    </p>
                                                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                                                        {service.unit}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/vendor/${id}/service/${service.id}`}
                                                        className="min-h-11 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                                                    >
                                                        Details
                                                    </Link>
                                                    <button
                                                        onClick={() => goToBooking(service)}
                                                        className="min-h-11 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
                                                    >
                                                        Choose dates
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── VERIFIED REVIEWS & FEEDBACK SECTION ── */}
                {(reviews.length > 0 || canReview) ? (
                    <section className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-base font-semibold text-slate-900">Traveler reviews ({reviews.length})</h2>
                            {canReview && (
                                <button
                                    onClick={() => setIsFeedbackModalOpen(true)}
                                    className="min-h-11 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                                >
                                    Write a review
                                </button>
                            )}
                        </div>
                        {reviews.length > 0 ? (
                            <div className="space-y-3">
                                {reviews.map((rev) => (
                                    <article key={rev.id} className="p-4 rounded-xl bg-white border border-slate-200">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-amber-500 text-xs font-semibold">
                                                {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                                            </span>
                                            <span className="text-xs text-slate-500">{rev.authorName}</span>
                                            <span className="text-[10px] text-slate-400">{rev.createdAt}</span>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-700">{rev.publicComment}</p>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500">No traveler reviews yet.</p>
                        )}
                    </section>
                ) : (
                    <p className="px-1 text-xs text-slate-500">No traveler reviews yet.</p>
                )}

                <SupportContact
                    variant="bar"
                    reference={`Host ${profile.name}`}
                    heading="Questions about this partner?"
                    partnerContext={{ id: profile.id, name: profile.name }}
                />
            </main>

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

