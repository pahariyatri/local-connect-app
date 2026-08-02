"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Typography from "../components/atoms/Typography";
import { getMyTrips, Trip } from "@/services/tripService";
import { getUserBookings } from "@/services/bookingService";
import { toApiUiError } from "@/utils/apiErrors";

// ─── Icon system — same inline-stroke-SVG convention used across the app ───

type IconName = "mountain" | "compass" | "check" | "route";

const ICON_PATHS: Record<IconName, React.ReactNode> = {
    mountain: <path d="m8 3 4 8 5-5 5 15H2L8 3z" />,
    compass: <><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></>,
    check: <path d="M20 6 9 17l-5-5" />,
    route: <><circle cx="6" cy="19" r="3" /><circle cx="18" cy="5" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /></>,
};

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">
            {ICON_PATHS[name]}
        </svg>
    );
}

type BookingStatus = "CONFIRMED" | "VENDOR_ACCEPTED" | "COMPLETED" | "PAYMENT_PENDING" | "CREATED" | "CANCELLED" | "REFUNDED" | "ABANDONED";

interface Booking {
    id: number;
    status: BookingStatus;
    totalAmount: number;
    travelDate: string;
    package?: { name?: string; destinations?: string[] };
    trip?: { name?: string };
}

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

const STATUS_STYLE: Record<string, string> = {
    CONFIRMED: "bg-emerald-50 text-emerald-600",
    VENDOR_ACCEPTED: "bg-emerald-50 text-emerald-600",
    COMPLETED: "bg-slate-100 text-slate-500",
    PAYMENT_PENDING: "bg-amber-50 text-amber-600",
    CREATED: "bg-amber-50 text-amber-600",
    CANCELLED: "bg-red-50 text-red-500",
    REFUNDED: "bg-slate-100 text-slate-500",
    ABANDONED: "bg-slate-100 text-slate-400",
};

function formatDate(d?: string) {
    if (!d) return "Date TBD";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function JourneysPage() {
    const router = useRouter();
    const params = useParams() as { lang: string };
    const lang = params.lang || "en";

    const [drafts, setDrafts] = useState<Trip[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [state, setState] = useState<"loading" | "error" | "ready">("loading");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const load = useCallback(async () => {
        setState("loading");
        setErrorMessage(null);
        try {
            const [trips, bookingsResult] = await Promise.all([
                getMyTrips(),
                getUserBookings({ limit: 50 }),
            ]);
            setDrafts(trips.filter((t) => t.status === "draft"));
            setBookings(bookingsResult.bookings);
            setState("ready");
        } catch (err) {
            setErrorMessage(toApiUiError(err, "We could not load your journeys.").message);
            setState("error");
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const completed = bookings.filter((b) => b.status !== "CANCELLED" && b.status !== "ABANDONED");

    return (
        <div className="min-h-screen bg-white pb-32">
            <main className="max-w-md mx-auto px-6 pt-28 sm:pt-36">
                <header className="mb-10">
                    <Typography variant="h1" className="text-3xl font-black text-slate-900 tracking-tight">
                        My Journeys
                    </Typography>
                    <p className="text-slate-400 font-medium mt-1 text-sm">Everything you're planning, and everything you've booked.</p>
                </header>

                {errorMessage && (
                    <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 mb-6">{errorMessage}</p>
                )}

                {state === "loading" && (
                    <div className="space-y-3">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 animate-pulse h-20" />
                        ))}
                    </div>
                )}

                {state === "ready" && (
                    <>
                        {/* In Progress — unbooked drafts saved from the builder */}
                        <section className="mb-10">
                            <div className="flex items-center gap-2 mb-4 px-1">
                                <Icon name="route" className="w-4 h-4 text-indigo-500" />
                                <Typography variant="h3" className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                    In progress {drafts.length > 0 && `(${drafts.length})`}
                                </Typography>
                            </div>

                            {drafts.length === 0 ? (
                                <div className="py-8 text-center rounded-[2rem] bg-slate-50 border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-medium text-sm">No plans in progress.</p>
                                    <button
                                        onClick={() => router.push(`/${lang}/journey`)}
                                        className="mt-3 text-[10px] font-black uppercase tracking-widest text-emerald-500 underline"
                                    >
                                        Start planning
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {drafts.map((trip) => (
                                        <div
                                            key={trip.id}
                                            onClick={() => router.push(`/${lang}/journey`)}
                                            className="premium-card p-5 flex items-center gap-4 group cursor-pointer active:scale-[0.98] transition-all"
                                        >
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                                <Icon name="compass" className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-slate-900 text-sm truncate">{trip.name}</h4>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">
                                                    {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                                                </p>
                                                <span className="inline-block mt-2 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600">
                                                    Draft
                                                </span>
                                            </div>
                                            <button className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all text-xs shrink-0">
                                                →
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Completed / booked */}
                        <section>
                            <div className="flex items-center gap-2 mb-4 px-1">
                                <Icon name="check" className="w-4 h-4 text-emerald-500" />
                                <Typography variant="h3" className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                    Booked {completed.length > 0 && `(${completed.length})`}
                                </Typography>
                            </div>

                            {completed.length === 0 ? (
                                <div className="py-8 text-center rounded-[2rem] bg-slate-50 border border-dashed border-slate-200">
                                    <Icon name="mountain" className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                                    <p className="text-slate-400 font-medium text-sm">No bookings yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {completed.map((booking) => (
                                        <div
                                            key={booking.id}
                                            onClick={() => router.push(`/${lang}/bookings/${booking.id}`)}
                                            className="premium-card p-5 flex items-center gap-4 group cursor-pointer active:scale-[0.98] transition-all"
                                        >
                                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                                <Icon name="mountain" className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-slate-900 text-sm truncate">
                                                    {booking.package?.destinations?.join(" → ") || booking.package?.name || booking.trip?.name || `Journey #YATRI-${booking.id}`}
                                                </h4>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">
                                                    {formatDate(booking.travelDate)}
                                                </p>
                                                <span className={`inline-block mt-2 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${STATUS_STYLE[booking.status] || STATUS_STYLE.CREATED}`}>
                                                    {STATUS_LABEL[booking.status] || booking.status}
                                                </span>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-black text-slate-900">₹{Number(booking.totalAmount).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}
