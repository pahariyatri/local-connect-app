"use client";

import React from "react";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import PublicFooter from "../components/organisms/PublicFooter";
import { Icon } from "../components/atoms/Icon";
import { BRAND_CONFIG } from "@/config/brandConfig";

export default function TermsConditionsPage() {
  const { dict } = useLocalizationContext();
  const res = dict?.page?.terms;

  const sections = [
    {
      icon: "file" as const,
      num: "01",
      title: "Acceptance & Platform Scope",
      text: "By accessing or using Pahari Yatri, you agree to comply with these terms. Pahari Yatri serves as a direct technology marketplace connecting travelers with independent, locally verified operators (homestay owners, mountain drivers, trekking guides, and activity curators) across Himachal Pradesh.",
    },
    {
      icon: "wallet" as const,
      num: "02",
      title: "Booking, Pricing & Reservation Fee",
      // Corrected 2026-08: previously described a general "secure escrow"
      // holding the full trip amount — that doesn't match how payment
      // actually works (see Section 04), so the word isn't used here again.
      text: "All listings and pricing are provided directly by local partners. A booking request goes to each partner for confirmation before any payment is taken. Once every partner confirms, you pay a platform reservation fee to lock in the booking — this fee is separate from the trip cost itself, which is paid directly to each local partner on their own terms.",
    },
    {
      icon: "alert-circle" as const,
      num: "03",
      title: "Cancellations & Refunds",
      // Corrected 2026-08: previously promised an automatic full refund for
      // weather/road closures with no process behind it — removed. Refund
      // handling is real but reviewed case by case, and cancellation terms
      // are set per service by each local partner, not by this platform.
      text: "Mountain travel in Himachal is subject to unpredictable weather and road conditions. Cancellation and refund terms are set per service by each local partner — review the policy shown on a service before requesting it, or ask the partner directly if none is shown. Reservation-fee refunds are reviewed case by case, are not automatic, and are not instant.",
    },
    {
      icon: "info" as const,
      num: "04",
      title: "Reservation Fee, Confirmation & Support — Practical Notes",
      text: "This section is a practical summary for travellers and local partners, in plain language — it is not formal legal advice. Local partners confirm your request before any payment is taken. Once confirmed, the reservation fee shown before you pay locks in the booking; the trip cost itself is paid directly to each local partner. Cancellation and refund terms vary by service and partner — check the specific policy shown, and contact support before you pay if anything is unclear.",
    },
    {
      icon: "users" as const,
      num: "05",
      title: "Host & Traveler Responsibilities",
      text: "Local partners are independent operators, not Pahari Yatri employees. Travelers are responsible for carrying valid government ID proof, adhering to check-in timings, and treating local communities with respect.",
    },
    {
      icon: "mountain" as const,
      num: "06",
      title: "Mountain Code & 'Leave No Trace'",
      text: "We strictly uphold sustainable Himalayan tourism. Travelers and operators must respect fragile mountain ecosystems, avoid single-use plastics, and follow sacred local customs and village rules (such as in Malana and Tosh).",
    },
    {
      icon: "check-circle" as const,
      num: "07",
      title: "Support & Escalation",
      // Corrected 2026-08: previously claimed unconditional "24/7 dedicated
      // mediation and emergency escalation" — the rest of the product
      // deliberately gates 24/7 language behind a real configured channel
      // (lib/supportConfig.ts, hasLiveSupportChannel) so this exact promise
      // doesn't get made without one behind it. Brought into line with that.
      text: "If a service dispute or mismatch happens on the ground, contact support using the channel shown in the app — response times depend on which support channel is currently live and staffed.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <main className="flex-1">
        {/* Top Header Banner */}
        <section className="bg-slate-950 text-white pt-14 pb-16 px-4 sm:px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/40 via-transparent to-slate-950 pointer-events-none" />
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-black uppercase tracking-widest mb-4">
              ⚖️ Platform Agreement
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
              Terms & <span className="text-emerald-400">Conditions</span>
            </h1>
            <p className="mt-3 text-slate-300 text-xs sm:text-sm font-semibold max-w-xl mx-auto">
              Fair Policies · Transparent Mountain Travel · Version 2.4 (Updated Feb 2026)
            </p>
          </div>
        </section>

        {/* Content Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 pb-20 space-y-5">
          {/* Key Notice */}
          <div className="rounded-3xl bg-white p-6 sm:p-7 border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 text-xl font-bold">
              ℹ️
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Summary of Key Principles</h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-relaxed">
                Pahari Yatri connects you directly with local partners. Local partners confirm your request first; a reservation fee then locks in the booking, and the trip cost is paid directly to each partner. Cancellation and refund terms vary by service — see Sections 03–04 below.
              </p>
            </div>
          </div>

          {/* Structured Terms Cards */}
          <div className="space-y-4">
            {sections.map((section, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                    <Icon name={section.icon} className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Section {section.num}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1.5">
                      {section.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 leading-relaxed">
                      {section.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Help & Questions Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white text-center shadow-xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">
              Need Clarification on Any Term?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-md mx-auto">
              Our legal and traveler support team is on standby to help.
            </p>
            <div className="mt-4">
              <a
                href={`mailto:${BRAND_CONFIG.supportEmail}?subject=${encodeURIComponent("Terms Inquiry — Travel Platform")}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors shadow-sm"
              >
                <Icon name="chat" className="w-3.5 h-3.5" />
                <span>Contact: {BRAND_CONFIG.supportEmail}</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

