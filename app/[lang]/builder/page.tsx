"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import { useTripPlanner, ServiceType } from "@/contexts/TripPlannerContext";
import { useTripStore } from "@/store/useTripStore";
import { prepTracker } from "@/lib/prepTracker";
import { formatINRWithSymbol } from "@/utils/price";
import Typography from "../components/atoms/Typography";
import Button from "../components/atoms/Button";
import DestinationSelector from "./components/DestinationSelector";
import DateRangePicker from "./components/DateRangePicker";
// CarTypeSelector removed
import ServiceInterestSelector from "./components/ServiceInterestSelector";
import TravelingPartySelector from "./components/TravelingPartySelector";
import NextStopSelector from "./components/NextStopSelector";
import PackageBuilderStep from "./components/PackageBuilderStep";
import { TripStop, createTripStop } from "@/types/tripBuilder";
import SupportContact from "../components/molecules/SupportContact";
import { hasLiveSupportChannel } from "@/lib/supportConfig";

const DESTINATION_ID_MAP: Record<string, string> = {
  manali: "manali",
  sissu: "manali",
  kullu: "manali",
  shimla: "shimla",
  kufri: "shimla",
  chail: "shimla",
  kasauli: "shimla",
  kasol: "kasol",
  malana: "kasol",
  parvati: "kasol",
  dharamshala: "dharamshala",
  mcleodganj: "dharamshala",
  "mcleod ganj": "dharamshala",
  bir: "dharamshala",
  billing: "dharamshala",
  pathankot: "dharamshala",
  kangra: "dharamshala",
  tirthan: "tirthan",
  jibhi: "tirthan",
  jalori: "tirthan",
  shoja: "tirthan",
  spiti: "spiti",
  kalpa: "spiti",
  nako: "spiti",
  tabo: "spiti",
  kaza: "spiti",
  sangla: "spiti",
  chandratal: "spiti",
};

function normalizeDestinationParams(raw: string[]): string[] {
  const matched = new Set<string>();
  for (const item of raw) {
    const key = item.toLowerCase().trim();
    if (DESTINATION_ID_MAP[key]) {
      matched.add(DESTINATION_ID_MAP[key]);
    } else {
      matched.add(key);
    }
  }
  return Array.from(matched);
}

export default function TripBuilderPage() {
  const { lang } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    origin, destinations, startDate, endDate, servicePreferences, guestCount,
    routeStops, stopServicesByDay,
    setBasicInfo, setServicePreferences, setGeneratedTripId, setGuestCount,
    setRouteStops, setStopServicesByDay
  } = useTripPlanner();

  const [currentStep, setCurrentStep] = useState(1);
  const [localOrigin, setLocalOrigin] = useState(origin);
  const [localDestinations, setLocalDestinations] = useState<string[]>(destinations);
  const [localStartDate, setLocalStartDate] = useState<string | null>(startDate || null);
  const [localEndDate, setLocalEndDate] = useState<string | null>(endDate || null);
  const [localServicePreferences, setLocalServicePreferences] = useState<ServiceType[]>(servicePreferences);
  const [localGuestCount, setLocalGuestCount] = useState(guestCount || 2);
  const [localTripStops, setLocalTripStops] = useState<TripStop[]>(() => (routeStops || []).map((n) => createTripStop(n)));
  // Names derived from structured stops keep the existing package/discovery pipeline working.
  const localRouteStops = localTripStops.map((s) => s.name);
  const [localStopServices, setLocalStopServices] = useState<Record<number, string[]>>(stopServicesByDay || {});
  // Step 6's vendor picks, lifted here so they survive navigating back to an
  // earlier step and forward again (PackageBuilderStep used to own this
  // locally and lose it on remount).
  const [localSelections, setLocalSelections] = useState<Record<number, Record<string, string | null>>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [step5Footer, setStep5Footer] = useState<{ totalPrice: number; onCreatePackage: () => Promise<void> } | null>(null);
  // The action bar is portaled to <body> so it stays fixed to the viewport
  // even though the page wrapper (`.page-fade-in`) runs a transform-based
  // entrance animation, which would otherwise turn `position: fixed` into
  // "fixed to the page" instead of the screen. Portal target only exists
  // client-side, hence the mounted gate.
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync state from URL query parameters & context on mount
  useEffect(() => {
    const urlOrigin = searchParams?.get("origin");
    const urlDestinations = searchParams?.get("destinations");

    let activeOrigin = origin;
    let activeDestinations = destinations;

    if (urlOrigin) {
      activeOrigin = urlOrigin;
      setLocalOrigin(urlOrigin);
    } else if (origin) {
      setLocalOrigin(origin);
    }

    if (urlDestinations) {
      const rawDests = urlDestinations.split(",").map((d) => d.trim()).filter(Boolean);
      const parsedDests = normalizeDestinationParams(rawDests);
      if (parsedDests.length) {
        activeDestinations = parsedDests;
        setLocalDestinations(parsedDests);
      }
    } else if (destinations.length) {
      setLocalDestinations(destinations);
    }

    if (urlOrigin || urlDestinations) {
      setBasicInfo(activeOrigin, activeDestinations, startDate || "", endDate || "");
    }

    if (startDate) setLocalStartDate(startDate);
    if (endDate) setLocalEndDate(endDate);
    if (servicePreferences.length) setLocalServicePreferences(servicePreferences);
    if (guestCount) setLocalGuestCount(guestCount);
    if (stopServicesByDay && Object.keys(stopServicesByDay).length) setLocalStopServices(stopServicesByDay);
  }, [searchParams, origin, destinations, startDate, endDate, servicePreferences, guestCount, routeStops, stopServicesByDay, setBasicInfo]);

  const toggleLanguage = () => {
    const newLang = lang === "en" ? "he" : "en";
    const newPath = `/${newLang}${window.location.pathname.replace(`/${lang}`, "")}`;
    window.location.href = newPath;
  };

  const STEP_METADATA: Record<number, Record<string, any>> = {
    1: { origin: localOrigin, destinations: localDestinations },
    2: { startDate: localStartDate, endDate: localEndDate },
    3: { guestCount: localGuestCount },
    4: { servicePreferences: localServicePreferences },
    5: { routeStops: localRouteStops, stopServicesByDay: localStopServices },
    6: { summary: true },
  };

  const handleNext = () => {
    if (currentStep < 5) {
      prepTracker.funnelStep(currentStep as 1 | 2 | 3 | 4, STEP_METADATA[currentStep]);
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === 5) {
      setBasicInfo(localOrigin, localDestinations, localStartDate || "", localEndDate || "");
      setServicePreferences(localServicePreferences);
      setGuestCount(localGuestCount);
      setRouteStops(localRouteStops);
      setStopServicesByDay(localStopServices);
      useTripStore.getState().setTrip({
        origin: localOrigin,
        destinations: localDestinations,
        startDate: localStartDate,
        endDate: localEndDate,
        guestCount: localGuestCount,
        servicePreferences: localServicePreferences,
      });
      prepTracker.funnelStep('plan_submitted', STEP_METADATA[5]);
      setStep5Footer(null);
      setCurrentStep(6);
    }
    // Step 6: PackageBuilderStep has its own "Create my package" button
  };

  const handleBack = () => {
    if (currentStep > 1) {
      if (currentStep === 6) setStep5Footer(null);
      setCurrentStep(prev => prev - 1);
    } else {
      router.back();
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return localOrigin.length > 2 && localDestinations.length > 0;
      case 2: return !!localStartDate && !!localEndDate;
      case 3: return localGuestCount > 0;
      case 4: return localServicePreferences.length > 0;
      case 5: return true; // route stops are optional; this step is about discovery
      case 6: return true;
      default: return false;
    }
  };


  // Load dictionary
  const { dict, loading } = useLocalizationContext();


  if (!dict) return <div className="min-h-screen bg-slate-50"/>; // Loading state

  const builder = dict.page.builder;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="animate-fade-in">
             <header className="mb-4 sm:mb-8">
                <Typography variant="h1" className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight" 
                  dangerouslySetInnerHTML={{ __html: builder.step1.title }} />
                <p className="text-slate-400 font-medium mt-1 text-xs sm:text-sm">{builder.step1.subtitle}</p>
             </header>
             <DestinationSelector 
               selectedDestinations={localDestinations}
               onSelectionChange={setLocalDestinations}
               originPoint={localOrigin}
               onRouteInfoChange={(o) => setLocalOrigin(o)}
               dict={dict}
             />
          </div>
        );
      case 2:
        return (
          <div className="animate-fade-in">
             <header className="mb-4 sm:mb-8">
                <Typography variant="h1" className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight"
                   dangerouslySetInnerHTML={{ __html: builder.step2.title }} />
                <p className="text-slate-400 font-medium mt-1 text-xs sm:text-sm">{builder.step2.subtitle}</p>
             </header>
             <div className="p-4 sm:p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100">
                <DateRangePicker 
                  startDate={localStartDate}
                  endDate={localEndDate}
                  onDateChange={(start, end) => {
                    setLocalStartDate(start);
                    setLocalEndDate(end);
                  }}
                  dict={dict}
                />
             </div>
          </div>
        );
      case 3:
        return (
          <div className="animate-fade-in">
            <header className="mb-4 sm:mb-8">
                <Typography variant="h1" className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight"
                   dangerouslySetInnerHTML={{ __html: builder.traveling_party?.title ?? "The <span class=\"text-emerald-500\">Traveling</span> Party." }} />
                <p className="text-slate-400 font-medium mt-1 text-xs sm:text-sm">{builder.traveling_party?.subtitle ?? "How many souls are joining this journey?"}</p>
             </header>
          <TravelingPartySelector 
            guestCount={localGuestCount}
            onGuestCountChange={setLocalGuestCount}
            dict={dict}
          />
          </div>
        );
      case 4:
        return (
          <div className="animate-fade-in">
             <header className="mb-4 sm:mb-8">
                <Typography variant="h1" className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight"
                   dangerouslySetInnerHTML={{ __html: builder.interests.title }} />
                <p className="text-slate-400 font-medium mt-1 text-xs sm:text-sm">{builder.interests.subtitle}</p>
             </header>
             <ServiceInterestSelector 
               selectedInterests={localServicePreferences}
               onInterestChange={setLocalServicePreferences}
               dict={dict}
             />
          </div>
        );
      case 5:
        return (
          <div className="animate-fade-in">
             <header className="mb-4 sm:mb-8">
                <Typography variant="h1" className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight"
                   dangerouslySetInnerHTML={{ __html: builder.next_stop?.title ?? "Where do you want to <span class=\"text-emerald-500\">stop</span>?" }} />
                <p className="text-slate-400 font-medium mt-1 text-xs sm:text-sm">{builder.next_stop?.subtitle ?? "We cover the whole route. Choose stops along the way and explore services there, not just at the destination."}</p>
             </header>
             <NextStopSelector
               origin={localOrigin}
               destinations={localDestinations}
               stops={localTripStops}
               onStopsChange={setLocalTripStops}
               startDate={localStartDate}
               endDate={localEndDate}
               guestCount={localGuestCount}
               dict={dict}
             />
          </div>
        );
      case 6:
        return (
          <PackageBuilderStep
            origin={localOrigin}
            destinations={localDestinations}
            startDate={localStartDate}
            endDate={localEndDate}
            guestCount={localGuestCount}
            servicePreferences={localServicePreferences}
            routeStops={localRouteStops}
            tripStops={localTripStops}
            stopServicesByDay={localStopServices}
            lang={String(lang)}
            dict={dict}
            onCreatingChange={setIsGenerating}
            onStep5Footer={setStep5Footer}
            selections={localSelections}
            onSelectionsChange={setLocalSelections}
          />
        );
      default: return null;
    }
  };

  return (
      <main className="max-w-6xl mx-auto px-4 pt-6 sm:pt-10 pb-36 sm:pb-44 md:pb-48">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar - Premium Promise */}
            <div className="lg:col-span-4 hidden lg:block sticky top-28 space-y-6">
                <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-[50px] pointer-events-none"></div>
                    <h3 className="text-2xl font-black mb-1">{builder.promise.title}</h3>
                    <p className="text-slate-400 text-sm font-medium mb-6">{builder.promise.subtitle}</p>
                    
                    <ul className="space-y-5">
                       {[
                           { text: builder.promise.verified, icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
                           ...(hasLiveSupportChannel ? [{ text: builder.promise.support, icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> }] : []),
                           // ^ PY-004: "24/7 On-Trip Support" is only claimed when a real
                           // LIVE channel (WhatsApp / phone) is configured in
                           // lib/supportConfig — deliberately hasLiveSupportChannel, not
                           // hasAnySupportChannel. Support email is now real and reachable
                           // (see SupportContact below), but email is asynchronous: it
                           // cannot back a "24/7 on-trip" promise to someone stranded on a
                           // road at 2am. An unstaffed 24/7 promise on a ₹10k-30k booking
                           // is itself a trust defect, so the line stays dropped until a
                           // phone/WhatsApp channel exists behind it.
                           { text: builder.promise.price, icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }
                       ].map((item, i) => (
                           <li key={i} className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                   {item.icon}
                               </div>
                               <span className="font-bold text-sm tracking-wide">{item.text}</span>
                           </li>
                       ))}
                    </ul>
                </div>

                {/* PY-004 — a real, config-driven way to reach a human while planning.
                    Renders nothing when no channel is configured. */}
                <SupportContact variant="bar" heading="Planning help?" />
            </div>
 
            {/* Main Content - Stepper */}
            <div className="lg:col-span-8">
                {/* Progress Bar */}
                <div className="flex gap-1.5 sm:gap-2 mb-6 sm:mb-8">
                  {[1, 2, 3, 4, 5, 6].map(stepNum => (
                    <div key={stepNum} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      stepNum <= currentStep ? "bg-slate-900" : "bg-slate-200"
                    }`} />
                  ))}
                </div>
  
                {renderStepContent()}
            </div>
        </div>
  
        {/* Sticky Bottom Action — one Back + one primary Continue/Create on every step.
            Step 6 additionally shows the live total as its own line, separate from
            the button label (the button says only "Create My Package").
            Portaled to <body>: the page wrapper animates `transform` on mount, which
            would otherwise turn `position: fixed` into "fixed to the page". */}
        {isMounted && createPortal(
          <div className="builder-footer-safe-area fixed bottom-0 left-0 right-0 px-3 sm:px-6 pt-3 sm:pt-6 bg-white/90 backdrop-blur-xl border-t border-slate-100 z-50">
            <div className="max-w-6xl mx-auto px-2 sm:px-4">
              {currentStep === 6 && step5Footer && (
                <div className="flex items-baseline justify-between mb-2 sm:mb-3 px-1">
                  <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">
                    {builder.buttons.total ?? "Total"}
                  </span>
                  <span className="text-lg sm:text-2xl font-black text-slate-900 tabular-nums">
                    {formatINRWithSymbol(step5Footer.totalPrice)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                {currentStep > 1 && (
                    <Button variant="ghost" onClick={handleBack} className="w-fit px-6 sm:px-8 h-12 sm:h-16 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-100 text-[9px] sm:text-xs">
                        {builder.buttons.back}
                    </Button>
                )}
                {currentStep === 6 ? (
                  step5Footer && (
                    <Button
                      onClick={() => step5Footer.onCreatePackage()}
                      disabled={isGenerating || step5Footer.totalPrice <= 0}
                      // Tighter type/tracking on mobile + nowrap so the primary
                      // CTA stays on one line at 360–390px instead of breaking
                      // to "CREATE MY / PACKAGE" (PY-033). Desktop unchanged.
                      className="flex-1 h-12 sm:h-16 px-3 rounded-xl sm:rounded-2xl text-[11px] sm:text-lg font-black tracking-[0.08em] sm:tracking-[0.2em] whitespace-nowrap transition-all uppercase bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xl active:scale-[0.98] disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span className="text-xs md:text-sm tracking-widest">{builder.buttons.building}</span>
                        </div>
                      ) : (
                        builder.buttons.createPackage ?? "Create My Package"
                      )}
                    </Button>
                  )
                ) : (
                <Button
                  onClick={handleNext}
                  disabled={isGenerating || !isStepValid()}
                  className="flex-1 h-12 sm:h-16 rounded-xl sm:rounded-2xl text-sm sm:text-lg font-black tracking-[0.15em] sm:tracking-[0.2em] transition-all uppercase bg-slate-900 hover:bg-black text-white shadow-2xl active:scale-[0.98]"
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span className="text-xs md:text-sm tracking-widest">{builder.buttons.building}</span>
                    </div>
                  ) : currentStep === 5 ? (builder.buttons.seePlan ?? "See My Plan") : builder.buttons.continue}
                </Button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Loading Overlay */}
        {isGenerating && (
          <div className="fixed inset-0 bg-white/95 backdrop-blur-3xl z-[100] flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
            {/* Same loading overlay content */}
            <div className="w-40 h-40 rounded-[4rem] bg-emerald-50 flex items-center justify-center text-6xl mb-10 border border-emerald-100 shadow-2xl animate-pulse">
               <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>
            </div>
            <Typography variant="h2" className="text-3xl font-black text-slate-900 leading-tight uppercase tracking-tight mb-4">
              {builder.loading_title}
            </Typography>
            <div className="space-y-4 opacity-50 max-w-xs mx-auto">
                 <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div>
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{builder.loading.step1}</p>
                      <p className="text-xs font-medium text-slate-400">{builder.loading.step1_sub}</p>
                  </div>
              </div>
               <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div>
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{builder.loading.step2}</p>
                      <p className="text-xs font-medium text-slate-400">{builder.loading.step2_sub}</p>
                  </div>
              </div>
            </div>
          </div>
        )}
      </main>
  
  );
}
