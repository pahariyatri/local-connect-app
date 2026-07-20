"use client";

import React, { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Typography from "../../components/atoms/Typography";
import Button from "../../components/atoms/Button";
import Input from "../../components/atoms/Input";
import TopNavigation from "../../components/organisms/TopNavigation";
import { sanitizePhone, isValidPhone, PHONE_LENGTH } from "@/utils/validation";

export default function LoginPage() {
    const router = useRouter();
    const { lang } = useParams();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo");
    const [phone, setPhone] = useState("");
    const [touched, setTouched] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const phoneValid = isValidPhone(phone);
    // Only nudge the user once they've started typing and moved on, never while empty.
    const showInvalid = touched && phone.length > 0 && !phoneValid;

    const handleContinue = async () => {
        if (!phoneValid) {
            setTouched(true);
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const { accountStatus, sendOtp } = await import("@/services/authService");
            const redirectSuffix = redirectTo ? `&redirectTo=${encodeURIComponent(redirectTo)}` : "";

            // Returning user with a PIN → skip OTP, go straight to PIN login.
            const status = await accountStatus(phone);
            if (status.hasPin) {
                router.push(`/${lang}/auth/pin?mode=login&phone=${phone}${redirectSuffix}`);
                return;
            }

            // New/unverified number → send OTP to verify, then they'll create a PIN.
            const response = await sendOtp(phone);
            const data = response?.data || response;
            if (data?.otp) {
                alert(`[TEST MODE] OTP: ${data.otp}\n(Visible because OTP_BYPASS_ENABLED=true)`);
            }
            router.push(`/${lang}/auth/verify-otp?phone=${phone}${redirectSuffix}`);

        } catch (err) {
            console.error("Failed to continue login", err);
            setError("Something went wrong. Please check your connection and try again.");
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            
            <main className="max-w-4xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden grid lg:grid-cols-2">
                <div className="hidden lg:block relative p-12 bg-slate-900 text-white flex flex-col justify-between overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
                    <div className="relative z-10">
                        <Link href={`/${lang}`} className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center font-black text-white text-xl mb-12 hover:bg-white/20 transition-all">
                            LC
                        </Link>
                        <h2 className="text-4xl font-black leading-[0.9] uppercase italic tracking-tighter mb-6">
                            The Legend <br /> Network.
                        </h2>
                        <p className="text-slate-400 font-medium leading-relaxed max-w-xs">Join the most exclusive community of mountain explorers and local experts.</p>
                    </div>
                    
                    <div className="relative z-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                        © 2026 Local Connect Portal
                    </div>
                </div>

                <div className="p-8 sm:p-12 md:p-16 flex flex-col justify-center relative">
                    {/* Floating Back Button for Mobile */}
                    <button 
                        onClick={() => router.back()}
                        className="absolute top-8 left-8 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 lg:hidden"
                    >
                        ←
                    </button>

                    <header className="mb-10 text-center lg:text-left">
                        <Typography variant="h1" className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter leading-[0.85] uppercase italic">
                            Welcome <br /> Back, Yatri.
                        </Typography>
                        <p className="mt-4 text-slate-400 font-medium text-sm">Securely access your path.</p>
                    </header>

                    <div className="space-y-6">
                        <div className="relative group">
                            <label htmlFor="phone" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 mb-3 block group-focus-within:text-slate-900 transition-colors italic">Mobile Number</label>
                            <div className={`w-full h-14 rounded-2xl border-2 flex items-center transition-all duration-200 ${
                                showInvalid
                                    ? "bg-red-50/10 border-red-400 ring-4 ring-red-400/10"
                                    : "bg-slate-50/50 border-slate-100 hover:border-slate-200/80 focus-within:bg-white focus-within:border-slate-900 focus-within:ring-4 focus-within:ring-slate-900/5"
                            }`}>
                                <span className="px-5 font-black text-slate-400 text-sm select-none border-r border-slate-200/80 h-7 flex items-center">
                                    +91
                                </span>
                                <input
                                    id="phone"
                                    name="phone"
                                    autoFocus
                                    className="flex-1 h-full px-5 text-lg font-black tracking-[0.1em] placeholder:text-slate-200 bg-transparent text-slate-900 border-0 outline-none focus:outline-none focus:ring-0"
                                    placeholder="00000 00000"
                                    type="tel"
                                    inputMode="numeric"
                                    autoComplete="tel-national"
                                    aria-invalid={showInvalid}
                                    aria-describedby={showInvalid ? "phone-error" : "phone-hint"}
                                    maxLength={PHONE_LENGTH}
                                    value={phone}
                                    onChange={(e) => { setPhone(sanitizePhone(e.target.value)); if (error) setError(null); }}
                                    onBlur={() => setTouched(true)}
                                    onKeyDown={(e) => { if (e.key === "Enter" && phoneValid && !loading) handleContinue(); }}
                                />
                            </div>
                            {showInvalid ? (
                                <p id="phone-error" role="alert" className="text-[11px] font-bold text-red-500 pl-2 mt-2">
                                    Enter a valid {PHONE_LENGTH}-digit mobile number.
                                </p>
                            ) : (
                                <p id="phone-hint" className="text-[11px] font-medium text-slate-300 pl-2 mt-2">
                                    We will text you a one-time code to verify.
                                </p>
                            )}
                        </div>

                        <div className="space-y-4">
                            {error && (
                                <p role="alert" className="text-[11px] font-bold text-red-500 text-center bg-red-50 border border-red-100 rounded-xl py-2.5 px-4">
                                    {error}
                                </p>
                            )}
                            <Button
                                onClick={handleContinue}
                                disabled={!phoneValid || loading}
                                aria-busy={loading}
                                className={`w-full h-16 rounded-2xl text-base font-black tracking-widest transition-all uppercase italic shadow-xl ${
                                    loading ? "bg-slate-200 text-slate-400" : "bg-slate-900 hover:bg-black text-white shadow-slate-200 active:scale-95"
                                }`}
                            >
                                {loading ? "Please wait..." : "Continue"}
                            </Button>
                            
                            <div className="relative py-2 text-center">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                                <span className="relative px-2 bg-white text-[9px] font-black text-slate-300 uppercase tracking-widest">Other Options</span>
                            </div>

                            <button className="w-full h-14 rounded-2xl border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-emerald-50 hover:border-emerald-100 hover:text-emerald-600 transition-all flex items-center justify-center gap-3">
                                💬 WhatsApp Login
                            </button>
                        </div>

                        <div className="text-center mt-10">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">
                                By entering, you agree to our <br />
                                <Link href={`/${lang}/terms-conditions`} className="text-emerald-500/60 font-bold underline px-1">Code</Link> & <Link href={`/${lang}/privacy-policy`} className="text-emerald-500/60 font-bold underline px-1">Privacy</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
