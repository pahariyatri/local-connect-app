"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import PublicFooter from "../components/organisms/PublicFooter";
import { Icon } from "../components/atoms/Icon";
import { BRAND_CONFIG } from "@/config/brandConfig";
import { hasLiveSupportChannel } from "@/lib/supportConfig";

export default function AboutPage() {
  const router = useRouter();
  const { dict, lang } = useLocalizationContext();

  const about = dict?.page?.about;
  const heroTitle = about?.hero?.title || 'Local <span class="text-emerald-500">Legends</span>.';
  const heroSubtitle = BRAND_CONFIG.aboutSummary;

  // Corrected 2026-08: "Escrow Protected" described a holding mechanism that
  // doesn't exist (real model: a Razorpay reservation fee, paid to Pahari
  // Yatri; the trip cost goes straight to the partner). "24/7 Mountain
  // Helpline" was unconditional — same PY-004 rule as builder/page.tsx's
  // "Our Promise" card applies here: don't claim a live 24/7 channel unless
  // one is actually configured.
  const stats = [
    { value: "100%", label: "Direct Local Match", sub: "No agency markups" },
    { value: "6+", label: "Mountain Circuits", sub: "Manali, Spiti, Kasol & more" },
    { value: "Direct", label: "Reservation Fee", sub: "Trip cost paid to the partner, not held by us" },
    hasLiveSupportChannel
      ? { value: "Live", label: "Support Channel", sub: "Reach a human before or during your trip" }
      : { value: "Email", label: "Support Channel", sub: "We reply, but it's not instant" },
  ];

  const circuits = [
    {
      name: "Parvati & Kullu Valley",
      places: "Kasol, Tosh, Kalga, Kullu",
      tag: "Rivers & Treks",
      desc: "Homestays, riverside camps, and local high-altitude trek guides.",
    },
    {
      name: "Upper Beas & Solang",
      places: "Old Manali, Solang, Sethan",
      tag: "Adventures & Stays",
      desc: "Verified 4x4 mountain drivers, boutique cabins, and winter guides.",
    },
    {
      name: "Spiti & Cold Deserts",
      places: "Kaza, Tabo, Mudh, Kibber",
      tag: "Remote Circuits",
      desc: "Experienced high-pass drivers and village homestay hosts.",
    },
    {
      name: "Kangra & Dhauladhar",
      places: "Dharamshala, McLeod Ganj, Bir",
      tag: "Culture & Gliding",
      desc: "Monastery cultural walks, certified paragliding pilots, and local cafés.",
    },
    {
      name: "Tirthan & Seraj",
      places: "Jibhi, Shoja, Gushaini",
      tag: "Eco & Forest",
      desc: "Great Himalayan National Park guides and authentic wooden cottages.",
    },
    {
      name: "Shimla & Kinnaur",
      places: "Shimla, Narkanda, Sangla, Kalpa",
      tag: "Heritage & Apples",
      desc: "Colonial heritage walks, apple orchard retreats, and Kinnaur circuit transit.",
    },
  ];

  const trustPillars = [
    {
      icon: "check-circle" as const,
      title: "Verified Identity & Direct Contact",
      desc: "Every host and operator is locally verified. Once confirmed, you get direct WhatsApp/phone contact with no hidden layers.",
    },
    {
      icon: "wallet" as const,
      title: "Reservation Fee, Paid Direct",
      // Corrected 2026-08: previously described an escrow-style hold-and-
      // release mechanism that doesn't match how payment actually works.
      desc: "Local partners confirm your request first. A reservation fee then locks in the booking; the trip cost itself is paid directly to your local partner, not held by us.",
    },
    {
      icon: "compass" as const,
      title: "Fair Pricing, Zero Middlemen",
      desc: "You pay authentic local rates. Hosts keep what they earn, fueling the local mountain economy directly.",
    },
    {
      icon: "mountain" as const,
      title: "Responsible Mountain Travel",
      desc: "We promote sustainable tourism, respect for indigenous Himalayan culture, and strict 'Leave No Trace' mountain principles.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <main className="flex-1">
        {/* 🏔️ Hero Section */}
        <section className="relative bg-slate-950 text-white pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20 bg-gradient-to-br from-emerald-500 via-transparent to-teal-700 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-black uppercase tracking-widest mb-6">
              {BRAND_CONFIG.productDisplayName} • {BRAND_CONFIG.productDescriptor}
            </span>
            <h1
              className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[1.05] tracking-tight uppercase [text-wrap:balance]"
              dangerouslySetInnerHTML={{ __html: heroTitle }}
            />
            <p className="mt-6 text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              {heroSubtitle}
            </p>

            {/* Parent Company Master Brand Banner */}
            <div className="mt-8 max-w-md mx-auto p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-between gap-4 text-left">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-emerald-400">Parent Company</p>
                <p className="text-xs font-bold text-white">{BRAND_CONFIG.parentBrandName}</p>
              </div>
              <a
                href={BRAND_CONFIG.parentBrandUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-white text-slate-900 text-[10px] font-black uppercase tracking-wider hover:bg-emerald-400 transition-colors inline-flex items-center gap-1 flex-shrink-0"
              >
                Learn about Pahari Yatri ↗
              </a>
            </div>
          </div>
        </section>

        {/* 📊 Key Stats Strip */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 relative z-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xl shadow-slate-200/50 text-center"
              >
                <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{item.value}</p>
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wide mt-1">{item.label}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 📖 Mission & Story Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <span className="text-emerald-600 font-black uppercase tracking-[0.25em] text-[10px] block">
                The Mountain Bridge
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {about?.mission?.title || `Why We Built this ${BRAND_CONFIG.productDisplayName}`}
              </h2>
              <div
                className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed space-y-4"
              >
                <p>
                  This travel platform is built by <strong>{BRAND_CONFIG.parentBrandName}</strong> to help travelers discover trusted local stays, transport, guides and experiences across Himachal Pradesh.
                </p>
                <p>
                  We saw a stark gap between the immense beauty of Himachal and the centralized booking portals that extract hefty commissions while sidelining native operators. Our platform is a direct bridge connecting discerning travelers with independent, locally verified operators.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Our Commitments</h3>
              
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Locals First</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      100% of service revenues go directly to the mountain operators on the ground.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Verified Quality & Safety</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      All vehicles, stays, and trek itineraries undergo verified checks before listing.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Complete Route Transparency</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Clear stop-by-stop itineraries with no surprise costs or hidden fees.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 🗺️ Regional Coverage Grid */}
        <section className="bg-white py-16 sm:py-24 border-y border-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-emerald-600 font-black uppercase tracking-[0.25em] text-[10px] block mb-3">
                Live Mountain Circuits
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Where We Operate
              </h2>
              <p className="text-slate-500 text-sm mt-3">
                Active networks of verified local stays, reliable transport, and mountain experiences.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {circuits.map((c, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-emerald-100 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      {c.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900">{c.name}</h3>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">{c.places}</p>
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 🛡️ Trust & Safety Pillars */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-emerald-600 font-black uppercase tracking-[0.25em] text-[10px] block mb-3">
              Safety & Standards
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Built on Trust and Accountability
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {trustPillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-7 rounded-3xl bg-white border border-slate-100 shadow-md shadow-slate-100 flex gap-4"
              >
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Icon name={pillar.icon} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{pillar.title}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 🚀 Conversion CTA */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          <div className="relative rounded-3xl bg-slate-900 text-white p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-xl mx-auto space-y-4">
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.25em] block">
                Start Your Journey
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Experience Himachal with True Locals.
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Whether you want to build a customized multi-day trip or list your service as a verified mountain partner.
              </p>
              
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => router.push(`/${lang}/builder`)}
                  className="px-8 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Plan My Trip</span>
                  <Icon name="arrow-right" className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/${lang}/vendor/onboarding`)}
                  className="px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-black uppercase tracking-wider transition-all active:scale-95"
                >
                  Become a Partner
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

