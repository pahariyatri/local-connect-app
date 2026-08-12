"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "../../components/atoms/Icon";

type AuthShellProps = {
  lang: string;
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  onBack?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function AuthShell({ lang, eyebrow, title, subtitle, onBack, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between font-sans selection:bg-emerald-100">
      {/* Top Header Bar */}
      <header className="w-full max-w-md mx-auto px-6 h-16 flex items-center justify-between">
        {onBack ? (
          <button
            onClick={onBack}
            type="button"
            className="w-10 h-10 -ml-2.5 rounded-2xl flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
            aria-label="Go back"
          >
            <Icon name="arrow-left" className="w-5 h-5" />
          </button>
        ) : (
          <Link href={`/${lang}`} className="flex items-center gap-2.5 group">
            <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-md group-hover:bg-black transition-all">
              PY
            </span>
            <span className="text-sm font-black text-slate-900 tracking-tight">
              Pahari Yatri
            </span>
          </Link>
        )}

        <Link
          href={`/${lang}`}
          className="w-10 h-10 -mr-2.5 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all text-sm font-bold"
          aria-label="Close"
        >
          ✕
        </Link>
      </header>

      {/* Main Form Body - Balanced Natural Positioning & Builder-grade Typography */}
      <main className="w-full max-w-md mx-auto px-6 pt-4 pb-12 flex-1 flex flex-col justify-center">
        <div>
          {eyebrow && (
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-500 mb-2 block">
              {eyebrow}
            </span>
          )}

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-1.5 text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
              {subtitle}
            </p>
          )}

          <div className="mt-7">{children}</div>

          {footer && <div className="mt-6">{footer}</div>}
        </div>
      </main>

      {/* Footer Safe Area / Trust Note */}
      <footer className="w-full max-w-md mx-auto px-6 py-4 text-center text-slate-300 text-[11px] font-medium">
        <span>Verified Local Himachal Marketplace</span>
      </footer>
    </div>
  );
}




