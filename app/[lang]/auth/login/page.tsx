"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "../../components/atoms/Button";
import { sanitizePhone, isValidPhone, PHONE_LENGTH } from "@/utils/validation";
import { useAuth } from "@/contexts/AuthContext";
import AuthShell from "../components/AuthShell";

/** Only ever follow a same-site relative path — never an absolute/external URL. */
const safeRedirect = (raw: string | null, lang: string): string => {
    if (!raw) return `/${lang}`;
    const decoded = decodeURIComponent(raw);
    if (!decoded.startsWith("/") || decoded.startsWith("//")) return `/${lang}`;
    return decoded;
};

export default function LoginPage() {
    const router = useRouter();
    const { lang } = useParams();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo");
    const { user } = useAuth();
    const [phone, setPhone] = useState("");
    const [touched, setTouched] = useState(false);

    // Already signed in (e.g. straight after signup, where the session is
    // established by /auth/pin/signup): don't ask for the PIN a second time.
    useEffect(() => {
        if (user) router.replace(safeRedirect(redirectTo, String(lang)));
    }, [user, redirectTo, lang, router]);

    const phoneValid = isValidPhone(phone);
    // Only nudge the user once they've started typing and moved on, never while empty.
    const showInvalid = touched && phone.length > 0 && !phoneValid;
    const redirectSuffix = redirectTo ? `&redirectTo=${encodeURIComponent(redirectTo)}` : "";

    // Single entry point, regardless of whether this number already has an
    // account — the PIN screen itself figures that out (tries login first,
    // falls back to creating an account with the same PIN if none exists).
    // This deliberately doesn't depend on any build-time config: it works
    // the same way no matter how the app was deployed.
    const submit = () => {
        if (!phoneValid) {
            setTouched(true);
            return;
        }
        router.push(`/${lang}/auth/pin?mode=login&phone=${phone}${redirectSuffix}`);
    };

    return (
        <AuthShell
            lang={String(lang)}
            eyebrow="Direct Local Booking"
            title={<>Sign In or <span className="text-emerald-500">Sign Up</span></>}
            subtitle="Enter your 10-digit mobile number to get started."
        >
            <div className="space-y-5">
                <div>
                    <div className={`w-full h-14 sm:h-15 rounded-2xl border-2 flex items-center transition-all bg-slate-50/70 ${
                        showInvalid
                            ? "border-red-400 bg-red-50/10"
                            : "border-slate-200 focus-within:border-slate-900 focus-within:bg-white focus-within:shadow-sm"
                    }`}>
                        <div className="pl-4 pr-3 text-base font-bold text-slate-800 select-none border-r border-slate-200 h-8 flex items-center gap-1.5">
                            <span>🇮🇳</span>
                            <span className="font-black">+91</span>
                        </div>
                        <input
                            id="phone"
                            name="phone"
                            autoFocus
                            className="flex-1 h-full px-4 text-base sm:text-lg font-bold tracking-wider placeholder:text-slate-300 placeholder:font-normal bg-transparent text-slate-900 border-0 outline-none focus:outline-none focus:ring-0"
                            placeholder="98765 43210"
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel-national"
                            aria-invalid={showInvalid}
                            aria-describedby={showInvalid ? "phone-error" : undefined}
                            maxLength={PHONE_LENGTH}
                            value={phone}
                            onChange={(e) => setPhone(sanitizePhone(e.target.value))}
                            onBlur={() => setTouched(true)}
                            onKeyDown={(e) => { if (e.key === "Enter" && phoneValid) submit(); }}
                        />
                    </div>
                    {showInvalid && (
                        <p id="phone-error" role="alert" className="text-xs text-red-500 font-semibold mt-2">
                            Please enter a valid 10-digit mobile number.
                        </p>
                    )}
                </div>

                <Button
                    onClick={submit}
                    disabled={!phoneValid}
                    className="w-full h-13 sm:h-14 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-[0.15em] bg-slate-900 hover:bg-black text-white shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98]"
                >
                    Continue
                </Button>
            </div>

            <p className="mt-8 text-[11px] sm:text-xs text-slate-400 leading-relaxed text-center font-medium">
                By continuing, you agree to our{" "}
                <Link href={`/${lang}/terms-conditions`} className="text-slate-700 font-bold underline underline-offset-2 hover:text-slate-900">Terms</Link>
                {" "}and{" "}
                <Link href={`/${lang}/privacy-policy`} className="text-slate-700 font-bold underline underline-offset-2 hover:text-slate-900">Privacy Policy</Link>.
            </p>
        </AuthShell>
    );
}
