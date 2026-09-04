"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Typography from "../components/atoms/Typography";
import Button from "../components/atoms/Button";
import Card from "../components/molecules/Card";
import { getUserBookings } from "@/services/bookingService";
import { useLocalizationContext } from "@/contexts/LocalizationContext";

type BookingStatus = "CREATED" | "PAYMENT_PENDING" | "CONFIRMED" | "VENDOR_ACCEPTED" | "COMPLETED" | "CANCELLED" | "REFUNDED" | "ABANDONED";

interface Booking {
    id: number;
    status: BookingStatus;
    totalAmount: number;
    currency: string;
    travelDate: string;
    guestCount: number;
    createdAt: string;
    package?: { name?: string; destinations?: string[]; origin?: string };
    trip?: { name?: string };
}

const STATUS_STYLE: Record<string, string> = {
    CONFIRMED: "bg-emerald-600 text-white",
    VENDOR_ACCEPTED: "bg-emerald-600 text-white",
    COMPLETED: "bg-slate-500 text-white",
    PAYMENT_PENDING: "bg-amber-500 text-white",
    CREATED: "bg-amber-500 text-white",
    CANCELLED: "bg-red-400 text-white",
    REFUNDED: "bg-slate-400 text-white",
    ABANDONED: "bg-slate-300 text-slate-600",
};

const STATUS_LABEL: Record<string, string> = {
    CONFIRMED: "Confirmed",
    VENDOR_ACCEPTED: "Accepted",
    COMPLETED: "Completed",
    PAYMENT_PENDING: "Pending",
    CREATED: "Processing",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded",
    ABANDONED: "Expired",
};

type Tab = "upcoming" | "completed" | "cancelled";
const TAB_STATUSES: Record<Tab, BookingStatus[]> = {
    upcoming: ["CREATED", "PAYMENT_PENDING", "CONFIRMED", "VENDOR_ACCEPTED"],
    completed: ["COMPLETED"],
    cancelled: ["CANCELLED", "REFUNDED", "ABANDONED"],
};

const DESTINATION_IMAGES: Record<string, string> = {
    manali: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=400",
    shimla: "https://images.unsplash.com/photo-1651319485646-f0f30e46b761?q=80&w=400",
    spiti: "https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?q=80&w=400",
    default: "https://images.unsplash.com/photo-1712388430474-ace0c16051e2?q=80&w=400",
};

function getDestinationImage(booking: Booking): string {
    const dest = booking.package?.destinations?.[0]?.toLowerCase() || "";
    return Object.entries(DESTINATION_IMAGES).find(([key]) => dest.includes(key))?.[1] || DESTINATION_IMAGES.default;
}

function getTitle(booking: Booking): string {
    if (booking.package?.destinations?.length) return booking.package.destinations.join(" → ");
    if (booking.package?.name) return booking.package.name;
    if (booking.trip?.name) return booking.trip.name;
    return `Booking #YATRI-${booking.id}`;
}

export default function BookingsListPage() {
    const { lang: pathLang } = useParams();
    const { dict } = useLocalizationContext();
    const router = useRouter();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>("upcoming");

    useEffect(() => {
        getUserBookings({ limit: 50 })
            .then((result) => setBookings(result.bookings))
            .catch(() => setError("Could not load bookings."))
            .finally(() => setLoading(false));
    }, []);

    const visibleBookings = useMemo(
        () => bookings.filter((b) => TAB_STATUSES[activeTab].includes(b.status)),
        [bookings, activeTab]
    );

    if (!dict) return <div className="min-h-screen bg-slate-50" />;
    const res = dict.page.bookings;
    const tabLabels: Record<Tab, string> = { upcoming: "Upcoming", completed: "Completed", cancelled: "Cancelled" };

    return (
        <div className="min-h-screen bg-white pb-20 sm:pb-28">
            <main className="max-w-md mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
                <header className="mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <Typography variant="h1" className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                        {res.title}
                    </Typography>
                    {!loading && !error && (
                        <p className="text-slate-500 text-sm mt-1 font-medium">
                            {res.subtitle.replace("{count}", String(bookings.length))}
                        </p>
                    )}
                </header>

                {/* Status tabs */}
                <div className="flex items-center gap-1.5 mb-6 bg-slate-100 rounded-full p-1">
                    {(Object.keys(tabLabels) as Tab[]).map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 rounded-full text-xs font-semibold transition-colors ${
                                activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            {tabLabels[tab]}
                        </button>
                    ))}
                </div>

                {loading && (
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-48 rounded-3xl bg-slate-100 animate-pulse" />
                        ))}
                    </div>
                )}

                {error && (
                    <div className="p-6 rounded-3xl bg-rose-50 border border-rose-100 text-center">
                        <p className="text-rose-600 font-semibold text-sm">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 text-xs font-semibold text-rose-500 underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && visibleBookings.length === 0 && (
                    <div className="py-16 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl mx-auto mb-5 border border-slate-100">
                            🏔️
                        </div>
                        <Typography variant="h3" className="text-lg font-bold text-slate-900 mb-1">
                            {bookings.length === 0 ? "No journeys yet" : `No ${tabLabels[activeTab].toLowerCase()} bookings`}
                        </Typography>
                        <p className="text-slate-400 text-sm font-medium mb-8">Your booked adventures will appear here.</p>
                        {bookings.length === 0 && (
                            <Button
                                onClick={() => router.push(`/${pathLang}/builder`)}
                                className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-lg active:scale-95 transition-all"
                            >
                                Plan First Trip
                            </Button>
                        )}
                    </div>
                )}

                {!loading && !error && visibleBookings.length > 0 && (
                    <div className="space-y-5">
                        {visibleBookings.map((booking) => (
                            <Card
                                key={booking.id}
                                onClick={() => router.push(`/${pathLang}/bookings/${booking.id}`)}
                                imageSrc={getDestinationImage(booking)}
                                imageAlt={getTitle(booking)}
                                title={getTitle(booking)}
                                subtitle={
                                    booking.travelDate
                                        ? `${new Date(booking.travelDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}${booking.guestCount > 1 ? ` · ${booking.guestCount} guests` : ""}`
                                        : "Date TBD"
                                }
                                cornerBadge={
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${STATUS_STYLE[booking.status] || STATUS_STYLE.CREATED}`}>
                                        {STATUS_LABEL[booking.status] || booking.status}
                                    </span>
                                }
                                priceLabel={`₹${Number(booking.totalAmount).toLocaleString()}`}
                                className="hover:shadow-lg transition-all"
                            />
                        ))}
                    </div>
                )}

                <div className="mt-10 p-8 rounded-3xl bg-slate-900 text-center relative overflow-hidden shadow-xl">
                    <div className="relative z-10">
                        <Typography variant="h3" className="text-white font-bold text-lg mb-1">
                            {res.cta_title}
                        </Typography>
                        <p className="text-slate-400 text-xs font-medium mb-6">
                            {res.cta_subtitle}
                        </p>
                        <Button
                            onClick={() => router.push(`/${pathLang}/builder`)}
                            className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-lg active:scale-[0.98] transition-all"
                        >
                            {res.cta_button}
                        </Button>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
                </div>
            </main>
        </div>
    );
}
