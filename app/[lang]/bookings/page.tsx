"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Typography from "../components/atoms/Typography";
import LocalImage from "../components/atoms/Image";
import Button from "../components/atoms/Button";
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
    CONFIRMED: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20",
    VENDOR_ACCEPTED: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20",
    COMPLETED: "bg-slate-500 text-white",
    PAYMENT_PENDING: "bg-amber-500 text-white shadow-lg shadow-amber-500/20",
    CREATED: "bg-amber-500 text-white shadow-lg shadow-amber-500/20",
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

    useEffect(() => {
        getUserBookings()
            .then((raw: any) => {
                const list: Booking[] = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
                setBookings(list);
            })
            .catch(() => setError("Could not load bookings."))
            .finally(() => setLoading(false));
    }, []);

    if (!dict) return <div className="min-h-screen bg-slate-50" />;
    const res = dict.page.bookings;

    return (
        <div className="min-h-screen bg-white pb-32">
            <main className="max-w-md mx-auto px-6 pt-24">
                <header className="mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2 block">Your Journeys</span>
                    <Typography variant="h1" className="text-4xl font-black text-slate-900 leading-tight uppercase italic tracking-tighter">
                        {res.title}
                    </Typography>
                    {!loading && !error && (
                        <p className="text-slate-400 text-sm mt-2 font-medium">
                            {res.subtitle.replace("{count}", String(bookings.length))}
                        </p>
                    )}
                </header>

                {loading && (
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-48 rounded-[2.5rem] bg-slate-100 animate-pulse" />
                        ))}
                    </div>
                )}

                {error && (
                    <div className="p-6 rounded-[2.5rem] bg-rose-50 border border-rose-100 text-center">
                        <p className="text-rose-600 font-black text-sm uppercase tracking-widest">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 text-[10px] font-black uppercase tracking-widest text-rose-500 underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && bookings.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-4xl mx-auto mb-6 border border-slate-100">
                            🏔️
                        </div>
                        <Typography variant="h3" className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">
                            No journeys yet
                        </Typography>
                        <p className="text-slate-400 text-sm font-medium mb-8">Your booked adventures will appear here.</p>
                        <Button
                            onClick={() => router.push(`/${pathLang}/builder`)}
                            className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                        >
                            Plan First Trip
                        </Button>
                    </div>
                )}

                {!loading && !error && bookings.length > 0 && (
                    <div className="space-y-6">
                        {bookings.map((booking) => (
                            <div
                                key={booking.id}
                                onClick={() => router.push(`/${pathLang}/bookings/${booking.id}`)}
                                className="premium-card overflow-hidden group active:scale-[0.98] transition-all cursor-pointer bg-white border border-slate-100 shadow-sm rounded-[2.5rem]"
                            >
                                <div className="relative h-36 w-full">
                                    <LocalImage
                                        src={getDestinationImage(booking)}
                                        alt={getTitle(booking)}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                        <div>
                                            <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">YATRI-{booking.id}</p>
                                            <h3 className="text-base font-black text-white uppercase tracking-tight line-clamp-1">{getTitle(booking)}</h3>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest ${STATUS_STYLE[booking.status] || STATUS_STYLE.CREATED}`}>
                                            {STATUS_LABEL[booking.status] || booking.status}
                                        </div>
                                    </div>
                                </div>

                                <div className="px-5 py-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                            {booking.travelDate
                                                ? new Date(booking.travelDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                                                : "Date TBD"}
                                            {booking.guestCount > 1 && ` · ${booking.guestCount} guests`}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
                                        <p className="text-sm font-black text-emerald-600 italic">
                                            ₹{Number(booking.totalAmount).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-12 p-10 rounded-[3rem] bg-slate-900 text-center relative overflow-hidden shadow-2xl shadow-slate-200">
                    <div className="relative z-10">
                        <Typography variant="h3" className="text-white font-black uppercase tracking-widest mb-2 leading-none italic">
                            {res.cta_title}
                        </Typography>
                        <p className="text-slate-400 text-[10px] font-bold uppercase mb-8 tracking-wide">
                            {res.cta_subtitle}
                        </p>
                        <Button
                            onClick={() => router.push(`/${pathLang}/builder`)}
                            className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all"
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
