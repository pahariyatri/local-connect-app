"use client";

import React, { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "../../components/atoms/Button";
import { sanitizePhone, isValidPhone, PHONE_LENGTH } from "@/utils/validation";
import { AUTH_MODE } from "@/utils/constants";
import { toAuthUiError } from "@/utils/authErrors";
import { ApiClientError } from "@/lib/apiClient";
import AuthShell from "../components/AuthShell";

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
    const redirectSuffix = redirectTo ? `&redirectTo=${encodeURIComponent(redirectTo)}` : "";

    // Testing-phase flow: phone number + PIN, no OTP. The backend tells us
    // whether this number already has an account, and we route accordingly.
    const handleContinue = async () => {
        if (!phoneValid) {
            setTouched(true);
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const { checkPhoneExists } = await import("@/services/authService");
            const exists = await checkPhoneExists(phone);
            const mode = exists ? "login" : "create";
            router.push(`/${lang}/auth/pin?mode=${mode}&phone=${phone}${redirectSuffix}`);
        } catch (err) {
            // Backend keeps this endpoint disabled outside the testing phase
            // (AUTH_DIRECT_PIN_SIGNUP off). Don't dead-end here — fall back to
            // the always-available direct PIN login instead of erroring out.
            if (err instanceof ApiClientError && err.code === "AUTH_FEATURE_DISABLED") {
                router.push(`/${lang}/auth/pin?mode=login&phone=${phone}${redirectSuffix}`);
                return;
            }
            setError(toAuthUiError(err).message);
            setLoading(false);
        }
    };

    // Legacy OTP-verified flow (AUTH_MODE='otp'). Kept fully working so the
    // switch back to OTP only requires flipping the config value.
    const handleOtpFlow = async () => {
        if (!phoneValid) {
            setTouched(true);
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const { requestOtp } = await import("@/services/authService");
            const challenge = await requestOtp(phone);
            router.push(
                `/${lang}/auth/verify-otp?phone=${phone}&challengeId=${encodeURIComponent(challenge.challengeId)}&resendAfter=${challenge.resendAfterSeconds}${redirectSuffix}`,
            );
        } catch (err) {
            setError(toAuthUiError(err).message);
            setLoading(false);
        }
    };

    const handlePinLoginDirect = () => {
        if (!phoneValid) {
            setTouched(true);
            return;
        }
        router.push(`/${lang}/auth/pin?mode=login&phone=${phone}${redirectSuffix}`);
    };

    const submit = AUTH_MODE === "pin" ? handleContinue : handlePinLoginDirect;

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
                            onChange={(e) => { setPhone(sanitizePhone(e.target.value)); if (error) setError(null); }}
                            onBlur={() => setTouched(true)}
                            onKeyDown={(e) => { if (e.key === "Enter" && phoneValid && !loading) submit(); }}
                        />
                    </div>
                    {showInvalid ? (
                        <p id="phone-error" role="alert" className="text-xs text-red-500 mt-1.5">
                            Enter a valid {PHONE_LENGTH}-digit mobile number.
                        </p>
                    ) : (
                        <p id="phone-hint" className="text-xs text-slate-400 mt-1.5">
                            {AUTH_MODE === "pin" ? "We'll check if you already have an account." : "We will text you a one-time code to verify."}
                        </p>
                    )}
                </div>

                {error && (
                    <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg py-2 px-3">
                        {error}
                    </p>
                )}

                {AUTH_MODE === "pin" ? (
                    <Button
                        onClick={handleContinue}
                        disabled={!phoneValid}
                        isLoading={loading}
                        className="w-full h-12 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-black text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        Continue
                    </Button>
                ) : (
                    <div className="space-y-3">
                        <Button
                            onClick={handlePinLoginDirect}
                            disabled={!phoneValid || loading}
                            aria-busy={loading}
                            className="w-full h-12 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-black text-white transition-colors disabled:opacity-50"
                        >
                            Continue with PIN
                        </Button>

                        <button
                            onClick={handleOtpFlow}
                            disabled={!phoneValid || loading}
                            aria-busy={loading}
                            className="w-full h-11 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-900 transition-colors disabled:opacity-50"
                        >
                            {loading ? "Sending code…" : "New here? Verify with OTP"}
                        </button>
                    </div>
                )}
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
