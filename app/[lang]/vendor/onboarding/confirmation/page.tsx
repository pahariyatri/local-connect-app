"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Typography from "../../../components/atoms/Typography";
import Button from "../../../components/atoms/Button";
import Loading from "@/app/loading";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/apiClient";

export default function Confirmation() {
    const { lang, dict, loading } = useLocalizationContext();
    const { refreshUser, logout } = useAuth();
    const router = useRouter();
    const [checking, setChecking] = useState(false);
    // The onboarding page already tries a silent token refresh right after
    // role promotion (see vendor/onboarding/page.tsx) — reproduced live that
    // this refresh reliably fails: the backend's single-use refresh-token
    // rotation revokes the whole session instead of minting a token with the
    // new role. GET /users/me (what refreshUser() checks) is NOT a reliable
    // signal here — it reads the role fresh from the DB regardless of the
    // access token's own baked-in claim, so it reports "Vendor" correctly
    // even while RolesGuard (which reads the JWT claim, not the DB) still
    // 403s every vendor-only write. The only signal that actually reflects
    // what RolesGuard will see is a real refresh attempt: if the backend
    // accepts it, the new access token is guaranteed to carry the current
    // DB role (see auth-flow.service.ts refreshSession()); if it rejects it
    // (401 AUTH_SESSION_EXPIRED), the session is genuinely broken and only a
    // real login can recover it.
    const [needsRelogin, setNeedsRelogin] = useState(false);

    if (loading || !dict) return <Loading />;

    const conf = dict.page.vendor_onboarding.confirmation;
    const dashboardHref = `/${lang}/vendor/dashboard`;

    const handleContinue = async () => {
        setChecking(true);
        let refreshedOk = false;
        try {
            await api.post('/auth/token/refresh');
            refreshedOk = true;
        } catch {
            refreshedOk = false;
        }
        if (refreshedOk) await refreshUser();
        setChecking(false);
        if (refreshedOk) {
            router.push(dashboardHref);
        } else {
            setNeedsRelogin(true);
        }
    };

    const handleRelogin = () => {
        logout();
        router.push(`/${lang}/auth/login?redirectTo=${encodeURIComponent(dashboardHref)}`);
    };

  return (
    <div className="max-w-md mx-auto text-center py-8 animate-in fade-in zoom-in-95 duration-1000">
      <div className="relative inline-block mb-10">
        <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_30px_60px_-10px_rgba(16,185,129,0.4)] rotate-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
        </div>
      </div>
      
      <Typography variant="h1" className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">
        {conf.title}
      </Typography>
      
      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] leading-relaxed mb-12 max-w-xs mx-auto">
        {conf.subtitle}
      </p>

      <div className="space-y-6 mb-14 text-left bg-slate-50/50 rounded-[3rem] p-10 border border-slate-100 relative overflow-hidden group hover:bg-white hover:shadow-2xl transition-all duration-500">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
        
        <div className="flex items-start gap-5 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-emerald-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{conf.pipeline.step1.title}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1">{conf.pipeline.step1.sub}</p>
            </div>
        </div>
        
        <div className="w-0.5 h-10 bg-emerald-100 ml-[15px] -my-2" />

        <div className="flex items-start gap-5 relative z-10">
            <div className="w-8 h-8 rounded-xl border-2 border-emerald-500 bg-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{conf.pipeline.step2.title}</p>
                <p className="text-[10px] font-bold text-emerald-500 mt-1 italic">{conf.pipeline.step2.sub}</p>
            </div>
        </div>

        <div className="w-0.5 h-10 bg-slate-100 ml-[15px] -my-2" />

        <div className="flex items-start gap-5 opacity-40 relative z-10">
            <div className="w-8 h-8 rounded-xl border-2 border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-black text-slate-300">3</span>
            </div>
            <div>
                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">{conf.pipeline.step3.title}</p>
                <p className="text-[10px] font-bold text-slate-300 mt-1">{conf.pipeline.step3.sub}</p>
            </div>
        </div>
      </div>

      <div className="space-y-4">
        {needsRelogin ? (
            <div className="text-left bg-amber-50 border border-amber-100 rounded-3xl p-6 space-y-4">
                <p className="text-sm font-bold text-slate-800">
                    You&apos;re all set! For security, please sign in again to open your new vendor dashboard.
                </p>
                <Button
                    onClick={handleRelogin}
                    className="w-full h-16 py-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
                >
                    Sign In Again
                </Button>
            </div>
        ) : (
            <Button
                onClick={handleContinue}
                isLoading={checking}
                className="w-full h-18 py-6 rounded-3xl bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all group flex items-center justify-center gap-2"
            >
                {conf.cta}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </Button>
        )}

        <div className="p-6 rounded-2xl bg-emerald-50/30 border border-emerald-50 flex items-center justify-center gap-3">
             <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {conf.support} <a href="#" className="text-emerald-500 hover:underline">{conf.contact}</a>
            </p>
        </div>
      </div>
    </div>
  );
}
