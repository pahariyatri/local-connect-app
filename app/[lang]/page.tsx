"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Locale } from "@/i18n-config";
import Button from "./components/atoms/Button";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import Loading from "../loading";

type HomeProps = {
  params: Promise<{ lang: Locale }>;
};

// ─── Scroll-reveal Animation Wrapper ──────────────────────────────────────────
function Reveal({ children, className = "", delayMs = 0 }: { children: React.ReactNode; className?: string; delayMs?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-750 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} ${className}`}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

export default function Home({ params }: HomeProps) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const { dict, lang } = useLocalizationContext();
  const router = useRouter();

  if (!dict) return <Loading />;

  // Safely extract translations to support all languages (EN, HI, DE, FR, ES, HE)
  const pageDict = (dict as any)?.page?.home || {};
  const heroDict = pageDict?.hero || {};
  const builderDict = pageDict?.builder || {};
  const builderSteps = Array.isArray(builderDict?.steps) ? builderDict.steps : [];

  const builderHref = `/${lang}/builder`;
  const vendorHref = `/${lang}/vendor/onboarding`;
  const discoverHref = `/${lang}/discover`;
  const aboutHref = `/${lang}/about`;
  const communityHref = `/${lang}/community`;
  const termsHref = `/${lang}/terms-conditions`;
  const privacyHref = `/${lang}/privacy-policy`;

  return (
    <main className="bg-white min-h-screen antialiased selection:bg-emerald-500/30 selection:text-emerald-900 overflow-x-hidden">
      {/* Route animation styling */}
      <style>{`
        @keyframes drawRouteLine {
          from { stroke-dashoffset: 800; }
          to { stroke-dashoffset: 0; }
        }
        .animate-route-line {
          stroke-dasharray: 800;
          stroke-dashoffset: 800;
          animation: drawRouteLine 2.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>

      {/* ── 1 · HERO SECTION (USP Hook & Route Visualizer) ────────────────── */}
      <section className="relative px-6 pt-32 md:pt-44 pb-16 md:pb-24 border-b border-slate-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
          <div>
            <span className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.25em] block mb-4">
              {pageDict?.badge || "Local Connect Network"}
            </span>
            <h1 
              className="text-4xl md:text-6xl font-black leading-[1.05] tracking-tight text-slate-900 animate-fade-in"
              dangerouslySetInnerHTML={{ __html: heroDict?.title || "Book your entire route in one package." }}
            />
            <p className="mt-5 text-slate-500 font-normal text-sm md:text-base leading-relaxed max-w-md animate-fade-in" style={{ animationDelay: "80ms" }}>
              {heroDict?.subtitle || "Combine stays, transport, meals, and local experiences along your path. Get one transparent total price."}
            </p>
            <div className="mt-8 animate-fade-in" style={{ animationDelay: "160ms" }}>
              <Button
                onClick={() => router.push(builderHref)}
                variant="primary"
                className="btn-primary rounded-full px-8 py-4 text-xs font-black uppercase tracking-widest transition-all duration-300"
              >
                {heroDict?.cta_plan || "Start Planning"}
              </Button>
            </div>
          </div>

          {/* Interactive Route Builder Mock-up */}
          <div className="relative animate-fade-in w-full max-w-lg mx-auto lg:mx-0" style={{ animationDelay: "120ms" }}>
            <div className="relative rounded-[2.5rem] bg-slate-50 border border-slate-100 p-6 md:p-8 aspect-[4/3] flex flex-col justify-between overflow-hidden shadow-sm">
              <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
              
              {/* SVG Route Line */}
              <div className="absolute inset-0 z-10 flex items-center justify-center p-8">
                <svg className="w-full h-full text-slate-200" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M 60 240 Q 150 210 150 150 T 340 60"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="6 6"
                  />
                  <path
                    d="M 60 240 Q 150 210 150 150 T 340 60"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="animate-route-line"
                  />
                </svg>
              </div>

              {/* Node landmarks */}
              <div className="absolute inset-0 z-20 pointer-events-none">
                <div className="absolute bottom-[20%] left-[15%] flex flex-col items-center">
                  <span className="w-4 h-4 rounded-full bg-slate-900 border-4 border-white shadow-md" />
                  <span className="mt-1.5 text-[9px] font-black uppercase tracking-wider text-slate-950 bg-white/90 backdrop-blur px-2 py-0.5 rounded border border-slate-100 shadow-sm">Start</span>
                </div>

                <div className="absolute top-[48%] left-[37.5%] flex flex-col items-center">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-md animate-pulse" />
                  <span className="mt-1.5 text-[9px] font-black uppercase tracking-wider text-slate-950 bg-white/90 backdrop-blur px-2 py-0.5 rounded border border-slate-100 shadow-sm">Stops</span>
                </div>

                <div className="absolute top-[18%] right-[15%] flex flex-col items-center">
                  <span className="w-4 h-4 rounded-full bg-slate-900 border-4 border-white shadow-md" />
                  <span className="mt-1.5 text-[9px] font-black uppercase tracking-wider text-slate-950 bg-white/90 backdrop-blur px-2 py-0.5 rounded border border-slate-100 shadow-sm">Finish</span>
                </div>
              </div>

              <div className="flex justify-between items-start z-30">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">LIVE BUILDER Preview</span>
              </div>

              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-100/80 shadow-md flex items-center justify-between z-30 pointer-events-auto">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ONE PACKAGE TOTAL</p>
                  <p className="text-lg font-black text-slate-900">₹18,500</p>
                </div>
                <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  ALL SERVICES INCLUDED
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2 · THE 6-STEP BUILDER FLOW (Core USP & Visual Steps) ────────── */}
      <section className="px-6 py-20 md:py-32 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="max-w-2xl mb-16">
              <span className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.25em] block mb-2.5">
                {builderDict?.eyebrow || "For Travellers"}
              </span>
              <h2 
                className="text-3xl md:text-5xl font-black leading-[1.05] tracking-tight text-slate-900"
                dangerouslySetInnerHTML={{ __html: builderDict?.title || "Build Your Trip in 6 Steps" }}
              />
              <p className="text-slate-500 font-normal leading-relaxed mt-4 text-sm md:text-base max-w-lg">
                {builderDict?.subtitle || "Tell us your route, dates, and party — we'll match you with verified locals along the whole way."}
              </p>
            </div>
          </Reveal>

          {/* Steps Grid */}
          <Reveal delayMs={50}>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 md:gap-6 mb-16">
              {builderSteps.map((step: any, index: number) => (
                <div
                  key={index}
                  className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm flex flex-col justify-between aspect-[1/1.1]"
                >
                  <span className="w-8 h-8 rounded-xl bg-slate-50 text-slate-900 flex items-center justify-center text-xs font-black border border-slate-100">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="text-slate-900 font-black text-[11px] uppercase tracking-wider mt-4">
                      {step?.label}
                    </h3>
                    <p className="text-slate-400 text-[9px] mt-1.5 leading-normal">
                      {step?.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Action Hub */}
          <Reveal delayMs={100} className="text-center">
            <Button
              onClick={() => router.push(builderHref)}
              variant="primary"
              className="btn-primary rounded-full px-10 py-5 text-xs font-black uppercase tracking-widest hover:scale-102 transition-transform duration-300 mx-auto"
            >
              {builderDict?.cta || "Start Building — Free"}
            </Button>
            {builderDict?.note && (
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-4">
                {builderDict.note}
              </p>
            )}
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="px-6 py-12 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-8 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">LC</span>
              <span className="text-slate-900 font-black text-xs uppercase tracking-[0.2em] italic">Local Connect</span>
            </div>
            <nav aria-label="Footer Navigation" className="flex flex-wrap gap-x-6 gap-y-2">
              <button onClick={() => router.push(aboutHref)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">About</button>
              <button onClick={() => router.push(discoverHref)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Discover</button>
              <button onClick={() => router.push(communityHref)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Community</button>
              <button onClick={() => router.push(vendorHref)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Become a Vendor</button>
              <button onClick={() => router.push(termsHref)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Terms</button>
              <button onClick={() => router.push(privacyHref)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Privacy</button>
            </nav>
          </div>
          <p className="text-slate-400 text-[10px] font-medium mt-6 text-center sm:text-left">© 2026 Local Connect Portal. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
