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
            title="Sign in"
            subtitle="Enter your mobile number to continue."
        >
            <div className="space-y-5">
                <div>
                    <label htmlFor="phone" className="text-sm font-medium text-slate-700 mb-1.5 block">
                        Mobile number
                    </label>
                    <div className={`w-full h-12 rounded-xl border flex items-center transition-colors ${
                        showInvalid
                            ? "border-red-400"
                            : "border-slate-200 focus-within:border-slate-900"
                    }`}>
                        <span className="pl-4 pr-3 text-sm font-medium text-slate-400 select-none border-r border-slate-200 h-6 flex items-center">
                            +91
                        </span>
                        <input
                            id="phone"
                            name="phone"
                            autoFocus
                            className="flex-1 h-full px-3 text-sm font-medium tracking-wide placeholder:text-slate-300 bg-transparent text-slate-900 border-0 outline-none focus:outline-none focus:ring-0"
                            placeholder="00000 00000"
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel-national"
                            aria-invalid={showInvalid}
                            aria-describedby={showInvalid ? "phone-error" : "phone-hint"}
                            maxLength={PHONE_LENGTH}
                            value={phone}
                            onChange={(e) => setPhone(sanitizePhone(e.target.value))}
                            onBlur={() => setTouched(true)}
                            onKeyDown={(e) => { if (e.key === "Enter" && phoneValid) submit(); }}
                        />
                    </div>
                    {showInvalid ? (
                        <p id="phone-error" role="alert" className="text-xs text-red-500 mt-1.5">
                            Enter a valid {PHONE_LENGTH}-digit mobile number.
                        </p>
                    ) : (
                        <p id="phone-hint" className="text-xs text-slate-400 mt-1.5">
                            We'll sign you in, or set up your PIN if you're new here.
                        </p>
                    )}
                </div>

                <Button
                    onClick={submit}
                    disabled={!phoneValid}
                    className="w-full h-12 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-black text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    Continue
                </Button>
            </div>

            <p className="mt-8 text-xs text-slate-400 leading-relaxed">
                By continuing, you agree to our{" "}
                <Link href={`/${lang}/terms-conditions`} className="text-slate-600 underline underline-offset-2">Terms</Link>
                {" "}and{" "}
                <Link href={`/${lang}/privacy-policy`} className="text-slate-600 underline underline-offset-2">Privacy Policy</Link>.
            </p>
        </AuthShell>
    );
}
