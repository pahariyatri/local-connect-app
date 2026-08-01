"use client";

import React from "react";
import Link from "next/link";
import BackButton from "../../components/atoms/BackButton";

type AuthShellProps = {
  lang: string;
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  onBack?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/**
 * Shared chrome for every auth screen (login, PIN, OTP): a small mark, an
 * optional back button, a plain heading, and the step's own content —
 * centered on an otherwise empty page. No card, no split brand panel.
 * TopNavigation is hidden for /auth/* routes (see [lang]/layout.tsx) so this
 * is the only chrome on screen, matching a typical minimal sign-in page.
 */
export default function AuthShell({ lang, eyebrow, title, subtitle, onBack, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-10">
            {onBack && <BackButton onClick={onBack} />}
            <Link href={`/${lang}`} className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs flex-shrink-0">
              LC
            </Link>
          </div>

          {eyebrow && <p className="text-xs font-semibold text-emerald-600 mb-2">{eyebrow}</p>}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {subtitle && <div className="mt-2 text-sm text-slate-500 leading-relaxed">{subtitle}</div>}

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-8">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
