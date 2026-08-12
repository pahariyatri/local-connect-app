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
      title: "Booking, Pricing & Escrow Protection",
      text: "All listings and package pricing are provided directly by verified local partners. When requesting a booking, the platform holds reservation deposits in secure escrow until check-in or service commencement. Remaining balances are settled directly with the host according to the agreed terms.",
    },
    {
      icon: "alert-circle" as const,
      num: "03",
      title: "Cancellations, Road Blocks & Weather Contingencies",
      text: "Mountain travel in Himachal is subject to unpredictable weather and road conditions. If a major pass (e.g. Rohtang, Kunzum, Jalori) or route is officially closed due to landslides or extreme snow, full refunds or alternative route reallocations are honored without penalty.",
    },
    {
      icon: "users" as const,
      num: "04",
      title: "Host & Traveler Responsibilities",
      text: "All local drivers must maintain valid commercial mountain permits and passenger insurance. Travelers are responsible for carrying valid government ID proof, adhering to check-in timings, and treating local communities with utmost dignity.",
    },
    {
      icon: "mountain" as const,
      num: "05",
      title: "Mountain Code & 'Leave No Trace'",
      text: "We strictly uphold sustainable Himalayan tourism. Travelers and operators must respect fragile mountain ecosystems, avoid single-use plastics, and follow sacred local customs and village rules (such as in Malana and Tosh).",
    },
    {
      icon: "check-circle" as const,
      num: "06",
      title: "Dispute Resolution & Platform Assistance",
      text: "In the unlikely event of a service dispute or mismatch on the ground, Pahari Yatri provides 24/7 dedicated mediation and emergency escalation to ensure fair resolution for both the guest and local host.",
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
                Pahari Yatri connects you directly with verified locals. We don't take hidden cuts from operators. Your bookings are protected with escrow safety and 24/7 mountain support.
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

