"use client";

import React from "react";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import PublicFooter from "../components/organisms/PublicFooter";
import { Icon } from "../components/atoms/Icon";
import { BRAND_CONFIG } from "@/config/brandConfig";

export default function PrivacyPolicyPage() {
  const { dict } = useLocalizationContext();
  const res = dict?.page?.privacy;

  const sections = [
    {
      icon: "user" as const,
      num: "01",
      title: "Information We Collect",
      summary: "We only gather the minimum details necessary to plan and coordinate your mountain journey.",
      items: [
        "Identity details: Name and phone number for booking confirmations and direct driver/host coordination.",
        "Journey data: Origin, destinations, dates, party size, and itinerary preferences to match local operators.",
        "Transaction records: Secure, tokenized payment records (card details are never stored on our servers).",
        "Device diagnostics: Technical logs to ensure smooth performance across high-altitude and low-bandwidth connections.",
      ],
    },
    {
      icon: "compass" as const,
      num: "02",
      title: "How We Use & Share Your Information",
      summary: "Your information is used exclusively to facilitate verified connections with local Himalayan hosts.",
      items: [
        "Direct host matching: We share contact details with the local driver, guide, or stay host only upon booking confirmation.",
        "Zero ad tracking: We NEVER sell, rent, or trade your personal information to third-party data brokers or advertisers.",
        "Emergency assistance: Details may be shared with local emergency services or mountain rescue if safety concerns arise during an active trip.",
      ],
    },
    {
      icon: "wallet" as const,
      num: "03",
      title: "Payment Security & Escrow Protection",
      summary: "Bank-grade encryption protects all platform transactions and reservation deposits.",
      items: [
        "Escrow safeguarding: Booking deposits are held securely in platform escrow until check-in or trip kickoff.",
        "PCI-DSS compliance: All online transactions are processed through certified payment gateways.",
        "End-to-end encrypted sessions for all communication on the platform.",
      ],
    },
    {
      icon: "check-circle" as const,
      num: "04",
      title: "Your Rights & Control",
      summary: "You remain in complete control of your data at all times.",
      items: [
        "Data access: Request an export of all information linked to your phone number or account.",
        "Instant correction: Update your profile, booking details, or preferences directly in your dashboard.",
        "Right to be forgotten: Request permanent account and data deletion at any time after trip completion.",
      ],
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
              🛡️ Data Protection & Trust
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
              Privacy <span className="text-emerald-400">Policy</span>
            </h1>
            <p className="mt-3 text-slate-300 text-xs sm:text-sm font-semibold max-w-xl mx-auto">
              Safe · Encrypted · 100% Transparent · Last Updated: February 2026
            </p>
          </div>
        </section>

        {/* Content Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 pb-20 space-y-6">
          {/* Mountain Oath Card */}
          <div className="rounded-3xl bg-emerald-900 text-white p-6 sm:p-8 border border-emerald-700/50 shadow-xl shadow-emerald-950/20">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🏔️</span>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
                {res?.oath_title || "Our Mountain Oath"}
              </h2>
            </div>
            <p className="text-sm sm:text-base font-semibold text-emerald-50 leading-relaxed">
              {res?.oath_text ||
                "Your mountain explorations belong to you alone. We collect only what is strictly necessary to arrange genuine local experiences and ensure safety on the trail."}
            </p>
          </div>

          {/* Structured Policy Sections */}
          <div className="space-y-5">
            {sections.map((section, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Icon name={section.icon} className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Section {section.num}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1.5">
                      {section.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                      {section.summary}
                    </p>

                    <ul className="mt-4 space-y-2.5 pt-3 border-t border-slate-100">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                          <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Support & Privacy Officer Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 text-center shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
              Questions or Data Inquiries?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 max-w-md mx-auto">
              Our support team and data compliance desk are available to address any privacy queries.
            </p>
            <div className="mt-4">
              <a
                href={`mailto:${BRAND_CONFIG.supportEmail}?subject=${encodeURIComponent("Privacy Inquiry — Travel Platform")}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-colors shadow-sm"
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

