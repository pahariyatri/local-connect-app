"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Locale } from "@/i18n-config";
import LocalImage from "./components/atoms/Image";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import Loading from "../loading";
import { useTripPlanner } from "@/contexts/TripPlannerContext";

type HomeProps = {
  params: Promise<{ lang: Locale }>;
};

// ─── Static data ────────────────────────────────────────────────────────────

const LOCAL_PROVIDERS = [
  {
    id: "p1",
    name: "Tenzing Sherpa",
    role: "Mountain Guide",
    location: "Manali, HP",
    rating: 4.9,
    reviews: 142,
    tags: ["Trek", "Camping", "Rescue"],
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=400",
    badge: "Elite",
  },
  {
    id: "p2",
    name: "Priya Homestay",
    role: "Host · 4 Rooms",
    location: "Old Manali",
    rating: 4.8,
    reviews: 89,
    tags: ["Rooms", "Meals", "Wi-Fi"],
    image: "https://images.unsplash.com/photo-1651319485646-f0f30e46b761?q=80&w=400",
    badge: "Verified",
  },
  {
    id: "p3",
    name: "Arjun Thakur",
    role: "Local Food Guide",
    location: "Shimla, HP",
    rating: 4.7,
    reviews: 63,
    tags: ["Food", "Culture", "History"],
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=400",
    badge: "Verified",
  },
  {
    id: "p4",
    name: "Sonam Wangchuk",
    role: "Transport Operator",
    location: "Leh, Ladakh",
    rating: 4.9,
    reviews: 211,
    tags: ["4x4", "Permits", "Ladakh"],
    image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=400",
    badge: "Elite",
  },
  {
    id: "p5",
    name: "Kavya Nair",
    role: "Yoga & Wellness",
    location: "Rishikesh, UK",
    rating: 5.0,
    reviews: 47,
    tags: ["Yoga", "Meditation", "Detox"],
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400",
    badge: "New",
  },
  {
    id: "p6",
    name: "Rajan Chauhan",
    role: "River Rafting Pro",
    location: "Kullu, HP",
    rating: 4.8,
    reviews: 178,
    tags: ["Rafting", "Kayak", "Safety"],
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400",
    badge: "Verified",
  },
];

const STATS = [
  { value: "2,400+", label: "Local Providers" },
  { value: "18,000+", label: "Happy Travellers" },
  { value: "32", label: "Himalayan Districts" },
  { value: "4.9★", label: "Avg. Rating" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: "🔍",
    title: "Browse Locals",
    desc: "Search verified guides, hosts, and operators near your destination.",
  },
  {
    step: "02",
    icon: "💬",
    title: "Chat Direct",
    desc: "Message providers in real-time — no middlemen, no call centres.",
  },
  {
    step: "03",
    icon: "✅",
    title: "Book & Go",
    desc: "Pay securely via escrow. Your money releases only after service.",
  },
];

const BUILDER_STEPS = [
  { n: "01", icon: "📍", label: "Route", desc: "Origin & destinations" },
  { n: "02", icon: "🗓️", label: "Dates", desc: "When you travel" },
  { n: "03", icon: "👥", label: "Party", desc: "Who's coming" },
  { n: "04", icon: "🎯", label: "Interests", desc: "What you love" },
  { n: "05", icon: "🧭", label: "Stops", desc: "Along the way" },
  { n: "06", icon: "✨", label: "Package", desc: "Ready to book" },
];

const CATEGORIES = [
  { icon: "🧭", label: "Guides", count: "480+" },
  { icon: "🏠", label: "Homestays", count: "620+" },
  { icon: "🚙", label: "Transport", count: "310+" },
  { icon: "🍲", label: "Food Tours", count: "190+" },
  { icon: "🏕️", label: "Camping", count: "250+" },
  { icon: "🧘", label: "Wellness", count: "140+" },
  { icon: "📸", label: "Photography", count: "95+" },
  { icon: "🎒", label: "Adventures", count: "370+" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function Home({ params }: HomeProps) {
  const { dict, lang } = useLocalizationContext();
  useTripPlanner();

  const router = useRouter();

  if (!dict) return <Loading />;

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center bg-slate-950 overflow-hidden px-4">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <LocalImage
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000"
            alt="Himalayas"
            className="w-full h-full object-cover opacity-25 scale-105 object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-slate-950" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto pt-24 pb-16">
          {/* Network badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.25em]">
              Local Connect Network
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
            Meet the{" "}
            <span className="text-emerald-400">Real Locals</span>
            <br />
            of the Himalayas
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-10">
            Connect directly with verified guides, hosts &amp; operators.
            No packages. No agencies. Just authentic local service.
          </p>

          {/* CTA buttons — traveler-first hierarchy */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="hero-plan-trip-btn"
              onClick={() => router.push(`/${lang}/builder`)}
              className="group w-full sm:w-auto h-12 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              Plan My Trip
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button
              id="hero-explore-btn"
              onClick={() => router.push(`/${lang}/discover`)}
              className="w-full sm:w-auto h-12 px-8 rounded-xl border border-white/15 text-white font-bold text-sm uppercase tracking-wider hover:bg-white/8 transition-all active:scale-95"
            >
              Explore Locals
            </button>
          </div>

          {/* Vendor entry — demoted to text link */}
          <button
            id="hero-list-btn"
            onClick={() => router.push(`/${lang}/vendor/onboarding`)}
            className="mt-5 text-slate-500 hover:text-emerald-400 text-xs font-medium uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
          >
            Are you a local? List your service
            <span aria-hidden>→</span>
          </button>

          {/* Social proof strip */}
          <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
            <div className="flex -space-x-2">
              {["photo-1544620347-c4fd4a3d5957","photo-1582719478250-c89cae4dc85b","photo-1573496359142-b8d87734a5a2"].map((id, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-950 overflow-hidden">
                  <LocalImage
                    src={`https://images.unsplash.com/${id}?q=80&w=80`}
                    alt="local provider"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <span className="text-slate-400 text-xs">
              <strong className="text-white">2,400+</strong> locals ready to connect
            </span>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────────── */}
      <section className="bg-slate-900 border-y border-slate-800/60 py-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-0 sm:divide-x sm:divide-slate-800">
          {STATS.map((s) => (
            <div key={s.label} className="text-center px-4">
              <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">{s.value}</p>
              <p className="text-slate-500 text-xs mt-1 uppercase tracking-wider font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLAN YOUR TRIP (BUILDER PREVIEW) ────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-10">
                <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-[0.2em] block mb-3">
                  For Travellers
                </span>
                <h2 className="text-white text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-3">
                  Build Your Trip in <span className="text-emerald-400">6 Steps</span>
                </h2>
                <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                  Tell us your route, dates &amp; interests — we&apos;ll match you with verified
                  locals along the whole way and turn it into one bookable package.
                </p>
              </div>

              {/* Step chips */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3 mb-10">
                {BUILDER_STEPS.map((s) => (
                  <div
                    key={s.n}
                    className="flex flex-col items-center text-center gap-1.5 p-3 sm:p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50"
                  >
                    <span className="text-xl sm:text-2xl">{s.icon}</span>
                    <span className="text-emerald-500 text-[8px] font-black tracking-widest">{s.n}</span>
                    <span className="text-white text-[10px] sm:text-xs font-bold leading-tight">{s.label}</span>
                    <span className="text-slate-500 text-[8px] sm:text-[9px] leading-tight hidden sm:block">{s.desc}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  id="builder-preview-cta"
                  onClick={() => router.push(`/${lang}/builder`)}
                  className="group w-full sm:w-auto h-12 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  Start Building — Free
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
                <span className="text-slate-600 text-[10px] uppercase tracking-wider">
                  No sign-up needed · Takes ~2 min
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ─────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-white font-black text-lg sm:text-xl mb-6 tracking-tight">
            Browse by Category
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                id={`cat-${cat.label.toLowerCase()}`}
                onClick={() => router.push(`/${lang}/discover?category=${cat.label}`)}
                className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-800 transition-all group active:scale-95"
              >
                <span className="text-xl sm:text-2xl">{cat.icon}</span>
                <span className="text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wide leading-tight text-center">{cat.label}</span>
                <span className="text-emerald-500 text-[8px] sm:text-[9px] font-bold">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOCAL PROVIDERS GRID ───────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 bg-slate-950">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="flex items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-[0.2em] block mb-2">
                Verified Locals
              </span>
              <h2 className="text-white text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                People, Not Packages
              </h2>
            </div>
            <button
              id="view-all-locals-btn"
              onClick={() => router.push(`/${lang}/discover`)}
              className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-emerald-500 border-b border-emerald-500/40 pb-0.5 hover:text-emerald-400 transition-colors"
            >
              View All
            </button>
          </div>

          {/* Provider cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {LOCAL_PROVIDERS.map((p) => (
              <div
                key={p.id}
                className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 hover:shadow-xl hover:shadow-black/40 transition-all duration-300 cursor-pointer"
                onClick={() => router.push(`/${lang}/discover`)}
              >
                {/* Top — avatar + badge */}
                <div className="flex items-start gap-4 p-5 pb-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 border-slate-700 group-hover:border-emerald-500/40 transition-colors">
                    <LocalImage src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-white font-bold text-sm truncate">{p.name}</h3>
                      <span
                        className={`shrink-0 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                          p.badge === "Elite"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                            : p.badge === "New"
                            ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                            : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs">{p.role}</p>
                    <p className="text-slate-600 text-[10px] mt-0.5 flex items-center gap-1">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {p.location}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex gap-1.5 px-5 pb-4 flex-wrap">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] font-bold uppercase text-slate-500 border border-slate-700/70 rounded-lg px-2 py-0.5 tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Bottom — rating + CTA */}
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-900/60">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400 text-xs">★</span>
                    <span className="text-white text-xs font-bold">{p.rating}</span>
                    <span className="text-slate-600 text-[10px]">({p.reviews})</span>
                  </div>
                  <button className="h-8 px-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all active:scale-95">
                    Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 bg-slate-900 border-y border-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-[0.2em] block mb-3">
              Simple Process
            </span>
            <h2 className="text-white text-2xl sm:text-4xl font-black tracking-tight">
              How Local Connect Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                {/* Connector line on desktop */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden sm:block absolute top-1/2 -right-4 w-8 h-px bg-slate-700 z-10" />
                )}
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl mb-4">
                  {step.icon}
                </div>
                <span className="text-emerald-500 text-[9px] font-black uppercase tracking-widest mb-2">
                  Step {step.step}
                </span>
                <h3 className="text-white font-bold text-sm mb-2">{step.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOIN THE NETWORK CTA ────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 bg-slate-950">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/15 p-8 sm:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_70%)]" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                  Are you a local?
                </span>
              </div>

              <h2 className="text-white text-2xl sm:text-4xl font-black tracking-tight mb-4 leading-tight">
                Grow Your Income.<br />
                <span className="text-emerald-400">Join the Network.</span>
              </h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
                List your service — free to join. Get discovered by thousands of travellers looking for real, local experiences.
              </p>

              {/* Two short CTA buttons side by side */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  id="cta-list-service-btn"
                  onClick={() => router.push(`/${lang}/vendor/onboarding`)}
                  className="w-full sm:w-auto h-11 px-7 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                >
                  Join Free
                </button>
                <button
                  id="cta-learn-more-btn"
                  onClick={() => router.push(`/${lang}/about`)}
                  className="w-full sm:w-auto h-11 px-7 rounded-xl border border-slate-700 text-slate-300 font-bold text-sm uppercase tracking-wider hover:bg-slate-800 transition-all active:scale-95"
                >
                  Learn More
                </button>
              </div>

              <p className="text-slate-600 text-[10px] mt-5 uppercase tracking-wider">
                Free listing · No commission on first 3 bookings · Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST FOOTER STRIP ─────────────────────────────────────── */}
      <section className="py-10 px-4 bg-slate-900 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-12">
          {[
            { icon: "🛡️", label: "Verified Providers" },
            { icon: "🔒", label: "Escrow Payments" },
            { icon: "💬", label: "Direct Messaging" },
            { icon: "⭐", label: "Rated Reviews" },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-2.5 text-slate-400">
              <span className="text-base">{t.icon}</span>
              <span className="text-xs font-bold uppercase tracking-wider">{t.label}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
