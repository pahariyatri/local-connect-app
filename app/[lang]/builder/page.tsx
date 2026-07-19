"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import { useTripPlanner, ServiceType } from "@/contexts/TripPlannerContext";
import { useTripStore } from "@/store/useTripStore";
import { prepTracker } from "@/lib/prepTracker";
import Typography from "../components/atoms/Typography";
import Button from "../components/atoms/Button";
import DestinationSelector from "./components/DestinationSelector";
import DateRangePicker from "./components/DateRangePicker";
// CarTypeSelector removed
import ServiceInterestSelector from "./components/ServiceInterestSelector";
import TravelingPartySelector from "./components/TravelingPartySelector";
import NextStopSelector from "./components/NextStopSelector";
import PackageBuilderStep from "./components/PackageBuilderStep";

export default function TripBuilderPage() {
  const { lang } = useParams();
  const router = useRouter();
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
  const [localRouteStops, setLocalRouteStops] = useState<string[]>(routeStops || []);
  const [localStopServices, setLocalStopServices] = useState<Record<number, string[]>>(stopServicesByDay || {});
  const [isGenerating, setIsGenerating] = useState(false);
  const [step5Footer, setStep5Footer] = useState<{ totalPrice: number; onCreatePackage: () => Promise<void> } | null>(null);

  // Sync state from context on mount
  useEffect(() => {
    if (origin) setLocalOrigin(origin);
    if (destinations.length) setLocalDestinations(destinations);
    if (startDate) setLocalStartDate(startDate);
    if (endDate) setLocalEndDate(endDate);
    if (servicePreferences.length) setLocalServicePreferences(servicePreferences);
    if (guestCount) setLocalGuestCount(guestCount);
    if (routeStops && routeStops.length) setLocalRouteStops(routeStops);
    if (stopServicesByDay && Object.keys(stopServicesByDay).length) setLocalStopServices(stopServicesByDay);
  }, [origin, destinations, startDate, endDate, servicePreferences, guestCount, routeStops, stopServicesByDay]);

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
               routeStops={localRouteStops}
               onRouteStopsChange={setLocalRouteStops}
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
            stopServicesByDay={localStopServices}
            lang={String(lang)}
            dict={dict}
            onCreatingChange={setIsGenerating}
            onStep5Footer={setStep5Footer}
          />
        );
      default: return null;
    }
  };

  return (
      <main className="max-w-6xl mx-auto px-4 pt-28 sm:pt-36 pb-32 sm:pb-40">
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
                           { text: builder.promise.support, icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
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
  
        {/* Sticky Bottom Action */}
        <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-6 bg-white/90 backdrop-blur-xl border-t border-slate-100 z-50 safe-area-inset-bottom">
          <div className="max-w-6xl mx-auto px-2 sm:px-4 flex items-center justify-between gap-3 sm:gap-4">
              {currentStep > 1 && (
                  <Button variant="ghost" onClick={handleBack} className="w-fit px-6 sm:px-8 h-12 sm:h-16 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-100 text-[9px] sm:text-xs">
                      {builder.buttons.back}
                  </Button>
              )}
              {currentStep === 6 && step5Footer ? (
                <>
                  <div className="flex-1 flex items-center gap-4">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total</p>
                    <p className="text-2xl font-black text-slate-900">₹{step5Footer.totalPrice.toLocaleString()}</p>
                  </div>
                  <Button
                    onClick={() => step5Footer.onCreatePackage()}
                    disabled={isGenerating}
                    className="h-12 sm:h-16 px-8 rounded-xl sm:rounded-2xl bg-emerald-500 text-white font-black text-sm uppercase tracking-widest disabled:opacity-50"
                  >
                    {isGenerating ? (builder.buttons.building ?? "Creating...") : (builder.buttons.createPackage ?? "Create my package")}
                  </Button>
                </>
              ) : currentStep < 6 && (
              <Button 
                onClick={handleNext}
                disabled={isGenerating || !isStepValid()}
                className={`flex-1 h-12 sm:h-16 rounded-xl sm:rounded-2xl text-sm sm:text-lg font-black tracking-[0.15em] sm:tracking-[0.2em] transition-all uppercase ${
                  isGenerating ? "bg-slate-900" : "bg-slate-900 hover:bg-black text-white shadow-2xl active:scale-[0.98]"
                }`}
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
