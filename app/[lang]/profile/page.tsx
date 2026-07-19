"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Typography from "@/app/[lang]/components/atoms/Typography";
import LocalImage from "@/app/[lang]/components/atoms/Image";
import Button from "@/app/[lang]/components/atoms/Button";
import Link from "next/link";
import { fetchCurrentUser } from "@/services/userService";
import { getUserBookings } from "@/services/bookingService";
import { logout } from "@/services/authService";
import { User } from "@/types/userTypes";
import VerifiedBadge from "../components/atoms/VerifiedBadge";

type BookingStatus = "CONFIRMED" | "VENDOR_ACCEPTED" | "COMPLETED" | "PAYMENT_PENDING" | "CREATED" | "CANCELLED" | "REFUNDED" | "ABANDONED";

interface Booking {
    id: number;
    status: BookingStatus;
    totalAmount: number;
    travelDate: string;
    package?: { name?: string; destinations?: string[] };
    trip?: { name?: string };
}

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

const DEST_IMAGES: Record<string, string> = {
    manali: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=400",
    shimla: "https://images.unsplash.com/photo-1651319485646-f0f30e46b761?q=80&w=400",
    spiti: "https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?q=80&w=400",
    default: "https://images.unsplash.com/photo-1712388430474-ace0c16051e2?q=80&w=400",
};

function getTripImage(booking: Booking): string {
    const dest = booking.package?.destinations?.[0]?.toLowerCase() || "";
    return Object.entries(DEST_IMAGES).find(([k]) => dest.includes(k))?.[1] || DEST_IMAGES.default;
}

function getTripTitle(booking: Booking): string {
    if (booking.package?.destinations?.length) return booking.package.destinations.join(" → ");
    if (booking.package?.name) return booking.package.name;
    if (booking.trip?.name) return booking.trip.name;
    return `Journey #YATRI-${booking.id}`;
}

export default function ProfilePage() {
    const router = useRouter();
    const params = useParams() as { lang: string };
    const lang = params.lang || "en";

    const [user, setUser] = useState<User | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetchCurrentUser().catch(() => null),
            getUserBookings().catch(() => null),
        ]).then(([userData, bookingsRaw]) => {
            if (userData) setUser(userData);
            else router.push(`/${lang}/auth/login`);

            const list: Booking[] = Array.isArray(bookingsRaw?.data)
                ? bookingsRaw.data
                : Array.isArray(bookingsRaw)
                ? bookingsRaw
                : [];
            setBookings(list.slice(0, 3));
        }).finally(() => setLoading(false));
    }, [router, lang]);

    const handleLogout = () => {
        logout();
        router.push(`/${lang}/auth/login`);
    };

    if (loading) return <div className="min-h-screen animate-pulse bg-slate-50" />;

    const completedBookings = bookings.filter(b => b.status === "COMPLETED").length;
    const totalSpent = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);

    return (
        <div className="min-h-screen bg-white pb-32">
            <main className="max-w-md mx-auto px-6 pt-24 space-y-10">

                {/* Profile Header */}
                <section className="relative pt-10 pb-6 text-center animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <div className="relative inline-block">
                        <div className="w-28 h-28 rounded-[3rem] border-8 border-slate-50 shadow-2xl overflow-hidden mb-6 mx-auto group ring-1 ring-slate-100">
                            <LocalImage
                                src={(user as any)?.profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Yatri'}`}
                                alt="Profile"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                            <VerifiedBadge showText={false} className="scale-90" />
                        </div>
                    </div>

                    <div className="mt-4">
                        <Typography variant="h1" className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                            {user?.name || "Yatri"}
                        </Typography>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mt-2">Verified Explorer</p>
                        {user?.phone && (
                            <p className="text-slate-400 font-medium text-sm mt-1">+91 {user.phone}</p>
                        )}
                    </div>
                </section>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-100">
                    {[
                        { label: "Trips", value: String(bookings.length) },
                        { label: "Completed", value: String(completedBookings) },
                        { label: "Spent", value: totalSpent > 0 ? `₹${(totalSpent / 1000).toFixed(1)}k` : "—" },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                            <p className="text-2xl font-black text-slate-900 italic tracking-tighter">{stat.value}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Recent Journeys */}
                <section className="animate-in fade-in slide-in-from-bottom-3 duration-700 delay-200">
                    <div className="flex justify-between items-end mb-6 px-1">
                        <Typography variant="h2" className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">
                            Recent Journeys
                        </Typography>
                        <Link href={`/${lang}/bookings`} className="text-[10px] font-black text-emerald-500 uppercase tracking-widest underline underline-offset-4">
                            All Trips
                        </Link>
                    </div>

                    {bookings.length === 0 ? (
                        <div className="py-10 text-center rounded-[2.5rem] bg-slate-50 border border-slate-100">
                            <p className="text-4xl mb-4">🏔️</p>
                            <p className="text-slate-400 font-medium text-sm">No journeys yet.</p>
                            <button
                                onClick={() => router.push(`/${lang}/builder`)}
                                className="mt-4 text-[10px] font-black uppercase tracking-widest text-emerald-500 underline"
                            >
                                Plan your first trip
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    onClick={() => router.push(`/${lang}/bookings/${booking.id}`)}
                                    className="premium-card p-5 flex items-center gap-5 group cursor-pointer active:scale-[0.98] transition-all"
                                >
                                    <div className="w-18 h-16 w-16 rounded-2xl overflow-hidden shrink-0 shadow-lg shadow-slate-100">
                                        <LocalImage
                                            src={getTripImage(booking)}
                                            alt={getTripTitle(booking)}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-slate-900 uppercase tracking-tight leading-none truncate text-sm">
                                            {getTripTitle(booking)}
                                        </h4>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">
                                            {booking.travelDate
                                                ? new Date(booking.travelDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                                                : "Date TBD"}
                                        </p>
                                        <div className="mt-2">
                                            <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${STATUS_STYLE[booking.status] || STATUS_STYLE.CREATED}`}>
                                                {STATUS_LABEL[booking.status] || booking.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-black text-slate-900 italic">
                                            ₹{Number(booking.totalAmount).toLocaleString()}
                                        </p>
                                        <button className="w-8 h-8 mt-2 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all text-xs ml-auto">
                                            →
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-300">
                    {[
                        { label: "Edit Profile", icon: "✏️", route: `/${lang}/profile/edit` },
                        { label: "Help & Support", icon: "💬", route: `/${lang}/about` },
                    ].map((act) => (
                        <button
                            key={act.label}
                            onClick={() => router.push(act.route)}
                            className="flex flex-col items-center gap-4 p-7 rounded-[2.5rem] bg-white border border-slate-100 hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-50 transition-all group"
                        >
                            <span className="text-3xl group-hover:scale-125 transition-transform">{act.icon}</span>
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">{act.label}</span>
                        </button>
                    ))}
                </div>

                <Button
                    className="w-full h-14 rounded-[2rem] bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] border border-slate-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                    onClick={handleLogout}
                >
                    Sign Out
                </Button>
            </main>
        </div>
    );
}
