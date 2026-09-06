"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import Typography from "@/app/[lang]/components/atoms/Typography";
import LocalImage from "@/app/[lang]/components/atoms/Image";
import Button from "@/app/[lang]/components/atoms/Button";
import { fetchCurrentUser } from "@/services/userService";
import { getMyVendor } from "@/services/vendorService";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types/userTypes";

// ─── Icon system — same inline-stroke-SVG convention used across the app ───

type IconName = "edit" | "help" | "compass" | "briefcase" | "calendar" | "wallet" | "badge";

const ICON_PATHS: Record<IconName, ReactNode> = {
    edit: <><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></>,
    help: <><path d="M7.9 7.9a4 4 0 1 1 4.51 4.6c-1.13.32-2.41 1.3-2.41 2.5" /><circle cx="12" cy="17" r=".5" fill="currentColor" /><circle cx="12" cy="12" r="10" /></>,
    compass: <><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></>,
    briefcase: <><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>,
    calendar: <><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
    wallet: <><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1" /><path d="M17 12h.01" /><path d="M21 12a2 2 0 0 0-2-2h-2a2 2 0 0 0 0 4h2a2 2 0 0 0 2-2Z" /></>,
    badge: <><path d="M12 2 15 6 20 7l-3 4 1 5-6-3-6 3 1-5-3-4 5-1 3-4Z" /></>,
};

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">
            {ICON_PATHS[name]}
        </svg>
    );
}

interface VendorRecord {
    id: string;
    businessName: string;
    types: string[];
    isVerified: boolean;
    verificationStatus: string;
    trustScore: number | null;
    acceptanceRate: number | null;
    createdAt?: string;
}

const VERIFICATION_LABEL: Record<string, string> = {
    VERIFIED: "Verified Partner",
    PENDING: "Verification Pending",
    UNVERIFIED: "Not Verified",
    REJECTED: "Verification Rejected",
};

const VERIFICATION_STYLE: Record<string, string> = {
    VERIFIED: "bg-emerald-50 text-emerald-600",
    PENDING: "bg-amber-50 text-amber-600",
    UNVERIFIED: "bg-slate-100 text-slate-500",
    REJECTED: "bg-red-50 text-red-500",
};

export default function VendorProfilePage() {
    const router = useRouter();
    const params = useParams() as { lang: string };
    const lang = params.lang || "en";
    const { logout: authLogout } = useAuth();

    const [user, setUser] = useState<User | null>(null);
    const [vendor, setVendor] = useState<VendorRecord | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetchCurrentUser().catch(() => null),
            getMyVendor().catch(() => null),
        ]).then(([userData, vendorData]) => {
            if (!userData) {
                router.push(`/${lang}/auth/login`);
                return;
            }
            setUser(userData);
            if (!vendorData?.id) {
                // No vendor record for this account yet — send them to onboarding
                // rather than rendering an empty vendor profile.
                router.push(`/${lang}/vendor/onboarding`);
                return;
            }
            setVendor(vendorData);
        }).finally(() => setLoading(false));
    }, [router, lang]);

    const handleLogout = () => {
        authLogout();
        router.push(`/${lang}/auth/login`);
    };

    if (loading || !vendor) return <div className="min-h-screen animate-pulse bg-slate-50" />;

    const verificationKey = vendor.verificationStatus || (vendor.isVerified ? "VERIFIED" : "UNVERIFIED");

    return (
        <div className="min-h-screen bg-white pb-20 sm:pb-28">
            <main className="max-w-md mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8 sm:space-y-10">

                {/* Vendor Header */}
                <section className="relative pt-10 pb-6 text-center animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <div className="relative inline-block">
                        <div className="w-28 h-28 rounded-[3rem] border-8 border-slate-50 shadow-2xl overflow-hidden mb-6 mx-auto ring-1 ring-slate-100 bg-slate-900 flex items-center justify-center">
                            <LocalImage
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${vendor.businessName}`}
                                alt={vendor.businessName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <Typography variant="h1" className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
                            {vendor.businessName}
                        </Typography>
                        <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${VERIFICATION_STYLE[verificationKey] || VERIFICATION_STYLE.UNVERIFIED}`}>
                                {VERIFICATION_LABEL[verificationKey] || "Not Verified"}
                            </span>
                            {vendor.types?.slice(0, 2).map((t) => (
                                <span key={t} className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-100">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats Bar — real fields only; null renders as "—", never a fabricated number */}
                <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-100">
                    <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                        <p className="text-2xl font-black text-slate-900 italic tracking-tighter">
                            {vendor.trustScore != null ? vendor.trustScore.toFixed(1) : "—"}
                        </p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Trust Score</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                        <p className="text-2xl font-black text-slate-900 italic tracking-tighter">
                            {vendor.acceptanceRate != null ? `${Math.round(vendor.acceptanceRate * 100)}%` : "—"}
                        </p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Acceptance Rate</p>
                    </div>
                </div>

                {/* Vendor Quick Actions */}
                <section className="animate-in fade-in slide-in-from-bottom-3 duration-700 delay-200 space-y-4">
                    {[
                        { label: "Vendor Dashboard", desc: "Overview & analytics", icon: "compass" as IconName, route: `/${lang}/vendor/dashboard` },
                        { label: "Manage Services", desc: "Edit listings & pricing", icon: "briefcase" as IconName, route: `/${lang}/vendor/services` },
                        { label: "Bookings", desc: "Requests & calendar", icon: "calendar" as IconName, route: `/${lang}/vendor/bookings` },
                        { label: "Payouts", desc: "Earnings & settlements", icon: "wallet" as IconName, route: `/${lang}/vendor/payouts` },
                    ].map((act) => (
                        <button
                            key={act.label}
                            onClick={() => router.push(act.route)}
                            className="w-full flex items-center gap-4 p-5 rounded-[2rem] bg-white border border-slate-100 hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-50 transition-all group"
                        >
                            <span className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-all shrink-0">
                                <Icon name={act.icon} className="w-5 h-5" />
                            </span>
                            <span className="flex-1 text-left">
                                <span className="block font-black text-sm text-slate-900">{act.label}</span>
                                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{act.desc}</span>
                            </span>
                            <Icon name="compass" className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                        </button>
                    ))}
                </section>

                {/* Switch to traveler profile — this account also has a personal Yatri profile */}
                <button
                    onClick={() => router.push(`/${lang}/profile`)}
                    className="w-full flex items-center gap-4 p-5 rounded-[2rem] bg-slate-900 hover:bg-black text-white transition-all group animate-in fade-in slide-in-from-bottom-3 duration-700 delay-300"
                >
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Icon name="badge" className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-black text-sm">Switch to traveler profile</p>
                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-0.5">Your trips &amp; bookings</p>
                    </div>
                    <Icon name="compass" className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                </button>

                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-300">
                    <button
                        onClick={() => router.push(`/${lang}/vendor/onboarding`)}
                        className="flex flex-col items-center gap-4 p-7 rounded-[2.5rem] bg-white border border-slate-100 hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-50 transition-all group"
                    >
                        <span className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all">
                            <Icon name="edit" className="w-5 h-5" />
                        </span>
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">Edit Business Profile</span>
                    </button>
                    <button
                        onClick={() => router.push(`/${lang}/about`)}
                        className="flex flex-col items-center gap-4 p-7 rounded-[2.5rem] bg-white border border-slate-100 hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-50 transition-all group"
                    >
                        <span className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all">
                            <Icon name="help" className="w-5 h-5" />
                        </span>
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">Help &amp; Support</span>
                    </button>
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
