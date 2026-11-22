"use client";

import { rememberAuthPhone, recallAuthPhone } from '@/lib/authPhone';
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "../../components/atoms/Button";
import { sanitizePhone, isValidPhone, PHONE_LENGTH } from "@/utils/validation";
import { useAuth } from "@/contexts/AuthContext";
import AuthShell from "../components/AuthShell";
import { getTravelerDictionary } from "@/lib/travelerDictionary";
import { AUTH_MODE } from "@/utils/constants";
import { requestOtp } from "@/services/authService";
import { toAuthUiError } from "@/utils/authErrors";

/** Only ever follow a same-site relative path — never an absolute/external URL. */
const safeRedirect = (raw: string | null): string => {
    if (!raw) return `/`;
    const decoded = decodeURIComponent(raw);
    if (!decoded.startsWith("/") || decoded.startsWith("//")) return `/`;
    return decoded;
};

function LoginPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo");
    const { user, authStatus } = useAuth();
    const [phone, setPhone] = useState("");
    const [touched, setTouched] = useState(false);
    const [otpBusy, setOtpBusy] = useState(false);
    const [otpError, setOtpError] = useState<string | null>(null);
    const t = getTravelerDictionary().auth.phoneEntry;

    // Already signed in (e.g. straight after signup, where the session is
    // established by /auth/pin/signup): don't ask for the PIN a second time.
    useEffect(() => {
        if (user) router.replace(safeRedirect(redirectTo));
    }, [user, redirectTo, router]);

    // While we're still determining auth state (loading user_meta + backend
    // verification), show a neutral spinner rather than the login form — this
    // prevents the flash of the login screen for users who are already signed in
    // and were redirected here (e.g. after a cookie renewal or middleware gate).
    if (authStatus === 'hydrating') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
            </div>
        );
    }

    // If user is already set, let the useEffect above handle the redirect.
    // Render nothing here so there's no login-form flash.
    if (user) return null;

    const phoneValid = isValidPhone(phone);
    // Only nudge the user once they've started typing and moved on, never while empty.
    const showInvalid = touched && phone.length > 0 && !phoneValid;
    const redirectSuffix = redirectTo ? `&redirectTo=${encodeURIComponent(redirectTo)}` : "";

    // AUTH_MODE decides the entry point (see utils/constants.ts):
    //  - 'otp' (default, production): returning travelers sign in with phone +
    //    PIN (/auth/pin/login — no account-existence oracle involved); new
    //    travelers prove phone ownership with an OTP first, then set a PIN via
    //    the one-time setup ticket. The PIN screen never calls /auth/phone/check.
    //  - 'pin' (testing only, needs backend AUTH_DIRECT_PIN_SIGNUP=true): the
    //    PIN screen asks /auth/phone/check whether to log in or sign up.
    const submit = () => {
        if (!phoneValid) {
            setTouched(true);
            return;
        }
        { rememberAuthPhone(phone); router.push(`/auth/pin?mode=login${redirectSuffix}`); }
    };

    const startOtpSignup = async () => {
        if (!phoneValid) {
            setTouched(true);
            return;
        }
        if (otpBusy) return;
        setOtpBusy(true);
        setOtpError(null);
        try {
            const challenge = await requestOtp(phone);
            { rememberAuthPhone(phone); router.push(`/auth/verify-otp?purpose=registration&challengeId=${encodeURIComponent(challenge.challengeId)}&resendAfter=${challenge.resendAfterSeconds}${redirectSuffix}`); }
        } catch (err) {
            const ui = toAuthUiError(err);
            setOtpError(ui.retryAfterSeconds ? `${ui.message} (wait ~${ui.retryAfterSeconds}s)` : ui.message);
            setOtpBusy(false);
        }
    };

    return (
        <AuthShell
            eyebrow={t.eyebrow}
            title={<>{t.titlePrefix} <span className="text-emerald-500">{t.titleHighlight}</span></>}
            subtitle={AUTH_MODE === "otp" ? t.otpSubtitle : t.subtitle}
        >
            <div className="space-y-5">
                <div>
                    <label htmlFor="phone">Mobile number</label>
                    <div className={`w-full h-14 sm:h-15 rounded-2xl border-2 flex items-center transition-all bg-slate-50/70 ${
                        showInvalid
                            ? "border-red-400 bg-red-50/10"
                            : "border-slate-200 focus-within:border-slate-900 focus-within:bg-white focus-within:shadow-sm"
                    }`}>
                        <div className="pl-4 pr-3 text-base font-bold text-slate-800 select-none border-r border-slate-200 h-8 flex items-center gap-1.5">
                            <span className="font-black">+91</span>
                        </div>
                        <input
                            id="phone"
                            name="phone"
                            className="flex-1 h-full px-4 text-base sm:text-lg font-bold tracking-wider placeholder:text-slate-300 placeholder:font-normal bg-transparent text-slate-900 border-0 outline-none focus:outline-none focus:ring-0"
                            placeholder={t.phonePlaceholder}
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
                            {t.invalidPhone}
                        </p>
                    )}
                </div>

                <Button
                    onClick={submit}
                    disabled={!phoneValid}
                    className="w-full h-13 sm:h-14 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-[0.15em] bg-slate-900 hover:bg-black text-white shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98]"
                >
                    {AUTH_MODE === "otp" ? t.pinSignInButton : t.continueButton}
                </Button>

                {AUTH_MODE === "otp" && (
                    <div className="pt-1 text-center" data-testid="otp-signup">
                        <p className="text-xs sm:text-sm text-slate-500 font-medium mb-2">{t.newUserPrompt}</p>
                        <Button
                            onClick={startOtpSignup}
                            disabled={!phoneValid || otpBusy}
                            isLoading={otpBusy}
                            className="w-full h-13 sm:h-14 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-[0.15em] bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98]"
                        >
                            {t.createAccountButton}
                        </Button>
                        {otpError && (
                            <p role="alert" className="text-xs text-red-600 font-semibold mt-2">{otpError}</p>
                        )}
                    </div>
                )}
            </div>

            <p className="mt-8 text-[11px] sm:text-xs text-slate-400 leading-relaxed text-center font-medium">
                {t.termsPrefix}{" "}
                <Link href={`/terms-conditions`} className="text-slate-700 font-bold underline underline-offset-2 hover:text-slate-900">{t.termsLink}</Link>
                {" "}{t.and}{" "}
                <Link href={`/privacy-policy`} className="text-slate-700 font-bold underline underline-offset-2 hover:text-slate-900">{t.privacyLink}</Link>.
            </p>
        </AuthShell>
    );
}

// useSearchParams() needs a Suspense boundary so the rest of the page can be
// statically prerendered (faster first paint on slow mobile connections).
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
