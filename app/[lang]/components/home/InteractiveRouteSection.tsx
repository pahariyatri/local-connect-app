"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, type IconName } from "../atoms/Icon";
import LocalImage from "../atoms/Image";
import Button from "../atoms/Button";

interface RouteStopDetail {
  day: number;
  from: string;
  to: string;
  destinationShort: string;
  duration: string;
  elevation: string;
  tag: string;
  icon: IconName;
  image: string;
  highlights: string[];
  localPartner: {
    name: string;
    role: string;
    avatar: string;
    isVerified: boolean;
  };
}

interface RoutePreset {
  id: string;
  title: string;
  subtitle: string;
  durationDays: number;
  totalDistance: string;
  maxAltitude: string;
  region: string;
  stops: RouteStopDetail[];
  builderUrlParams: string;
}

const ROUTE_PRESETS: RoutePreset[] = [
  {
    id: "parvati-manali",
    title: "Parvati & Manali Valley",
    subtitle: "Riverside stays, pine forest trails, and high mountain passes",
    durationDays: 3,
    totalDistance: "285 km",
    maxAltitude: "2,050 m",
    region: "Kullu & Parvati",
    builderUrlParams: "origin=Chandigarh&destinations=Kasol,Kullu,Manali",
    stops: [
      {
        day: 1,
        from: "Chandigarh",
        to: "Kasol",
        destinationShort: "Kasol",
        duration: "6.5 hrs drive",
        elevation: "1,580 m",
        tag: "Riverside Arrival",
        icon: "utensils",
        image: "https://images.unsplash.com/photo-1571401835393-8c5f35328320?q=80&w=800",
        highlights: [
          "Scenic Beas and Parvati river gorge route",
          "Authentic Himalayan trout & Siddu lunch stop",
          "Riverside cedar trail walk at twilight"
        ],
        localPartner: {
          name: "Rajesh Negi",
          role: "Homestay Host, Old Kasol",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
          isVerified: true
        }
      },
      {
        day: 2,
        from: "Kasol",
        to: "Naggar Castle",
        destinationShort: "Naggar",
        duration: "2.5 hrs transit",
        elevation: "1,750 m",
        tag: "Heritage Castle",
        icon: "mountain",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800",
        highlights: [
          "Visit 500-year-old Naggar Wooden Castle",
          "Local apple orchard cider tasting session",
          "Guided heritage trail walk with local elder"
        ],
        localPartner: {
          name: "Amit Thakur",
          role: "4x4 Mountain Driver & Guide",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
          isVerified: true
        }
      },
      {
        day: 3,
        from: "Naggar",
        to: "Old Manali",
        destinationShort: "Old Manali",
        duration: "1.5 hrs drive",
        elevation: "2,050 m",
        tag: "Alpine Stay",
        icon: "home",
        image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800",
        highlights: [
          "Boutique wooden loft stay with valley views",
          "Solang Valley adventure & Rohtang gateway",
          "Stargazing campfire with authentic pahari dinner"
        ],
        localPartner: {
          name: "Priya Sharma",
          role: "Eco-Cottage Host, Old Manali",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200",
          isVerified: true
        }
      }
    ]
  },
  {
    id: "kangra-bir",
    title: "Dharamshala & Bir Trail",
    subtitle: "Tibetan culture, tea gardens, and paragliding take-off",
    durationDays: 3,
    totalDistance: "220 km",
    maxAltitude: "2,400 m",
    region: "Kangra Valley",
    builderUrlParams: "origin=Pathankot&destinations=Dharamshala,Bir,Billing",
    stops: [
      {
        day: 1,
        from: "Pathankot",
        to: "Dharamshala",
        destinationShort: "Dharamshala",
        duration: "3.5 hrs drive",
        elevation: "1,457 m",
        tag: "Monasteries & Culture",
        icon: "compass",
        image: "https://images.unsplash.com/photo-1653853572809-ea537274c7f5?q=80&w=800",
        highlights: [
          "Namgyal Monastery & Dalai Lama complex walk",
          "Local Tibetan thukpa and momo trail in McLeod Ganj",
          "Sunset view of the majestic Dhauladhar range"
        ],
        localPartner: {
          name: "Tenzin Norbu",
          role: "Cultural Guide & Host",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200",
          isVerified: true
        }
      },
      {
        day: 2,
        from: "McLeod Ganj",
        to: "Triund Ridge",
        destinationShort: "Triund Ridge",
        duration: "4.5 hrs trek",
        elevation: "2,875 m",
        tag: "Snowline Trek",
        icon: "mountain",
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800",
        highlights: [
          "Panoramic 360-degree snow-clad ridge vistas",
          "Hot Himalayan chai on the mountain ridge",
          "Safe mountain trail navigation with licensed leader"
        ],
        localPartner: {
          name: "Sunil Dogra",
          role: "Mountaineering Guide",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200",
          isVerified: true
        }
      },
      {
        day: 3,
        from: "Dharamshala",
        to: "Bir Billing",
        destinationShort: "Bir Billing",
        duration: "2 hrs drive",
        elevation: "2,400 m",
        tag: "Paragliding Flight",
        icon: "flag",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800",
        highlights: [
          "Tandem paragliding flight from Billing (2,400m)",
          "Bicycle ride through Kangra organic tea estates",
          "Sunset landing at Bir Tibetan colony café strip"
        ],
        localPartner: {
          name: "Vikram Rana",
          role: "FAI Certified Tandem Pilot",
          avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200",
          isVerified: true
        }
      }
    ]
  },
  {
    id: "spiti-circuit",
    title: "Spiti Valley Explorer",
    subtitle: "High mountain passes, 1000-year-old gompas, and moon lakes",
    durationDays: 3,
    totalDistance: "410 km",
    maxAltitude: "4,590 m",
    region: "Lahaul & Spiti",
    builderUrlParams: "origin=Shimla&destinations=Sangla,Tabo,Kaza,Chandratal",
    stops: [
      {
        day: 1,
        from: "Shimla",
        to: "Sangla & Chitkul",
        destinationShort: "Chitkul",
        duration: "7 hrs drive",
        elevation: "2,696 m",
        tag: "Last Border Village",
        icon: "map-pin",
        image: "https://images.unsplash.com/photo-1518623001395-125242310d0c?q=80&w=800",
        highlights: [
          "Drive along the famous carved rock highway",
          "Visit Chitkul — India's last inhabited village",
          "Baspa river bank wooden cabin stay"
        ],
        localPartner: {
          name: "Karan Negi",
          role: "Kinnaur Mountain Driver",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
          isVerified: true
        }
      },
      {
        day: 2,
        from: "Sangla",
        to: "Tabo & Kaza",
        destinationShort: "Tabo & Kaza",
        duration: "6 hrs transit",
        elevation: "3,800 m",
        tag: "Ancient Monastery",
        icon: "home",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800",
        highlights: [
          "UNESCO heritage Tabo mud monastery frescoes",
          "Pin Valley national park wildlife gateway",
          "Spitian traditional heated mud-homestay"
        ],
        localPartner: {
          name: "Dorje Chosang",
          role: "Kaza Homestay Host",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
          isVerified: true
        }
      },
      {
        day: 3,
        from: "Kaza",
        to: "Chandratal Lake",
        destinationShort: "Chandratal",
        duration: "4.5 hrs drive",
        elevation: "4,300 m",
        tag: "Glacial Moon Lake",
        icon: "mountain",
        image: "https://images.unsplash.com/photo-1574116504481-e06341e984e1?q=80&w=800",
        highlights: [
          "Kunzum La pass (4,590m) stupa crossing",
          "Sunset reflection on crystal glacial Chandratal",
          "Milky Way high-altitude astronomy camp"
        ],
        localPartner: {
          name: "Stanzin Angmo",
          role: "High-Altitude Camp Lead",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200",
          isVerified: true
        }
      }
    ]
  }
];

export default function InteractiveRouteSection({ lang }: { lang: string }) {
  const router = useRouter();
  const [activePresetId, setActivePresetId] = useState<string>("parvati-manali");
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);

  const activePreset = ROUTE_PRESETS.find((p) => p.id === activePresetId) || ROUTE_PRESETS[0];
  const currentStop = activePreset.stops[activeDayIndex] || activePreset.stops[0];
  const nextStop = activePreset.stops[activeDayIndex + 1];
  const prevStop = activePreset.stops[activeDayIndex - 1];

  const handleSelectPreset = (id: string) => {
    setActivePresetId(id);
    setActiveDayIndex(0);
  };

  const handlePrevDay = () => {
    if (activeDayIndex > 0) {
      setActiveDayIndex(activeDayIndex - 1);
    }
  };

  const handleNextDay = () => {
    if (activeDayIndex < activePreset.stops.length - 1) {
      setActiveDayIndex(activeDayIndex + 1);
    }
  };

  const handleOpenInBuilder = () => {
    router.push(`/${lang}/builder?${activePreset.builderUrlParams}`);
  };

  return (
    <section className="py-14 sm:py-24 bg-slate-50 border-y border-slate-200/80 px-4 sm:px-6 relative">
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Verified Expeditions
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.08]">
              The journey, day by day.
            </h2>
            <p className="text-slate-500 text-sm sm:text-base font-medium max-w-xl leading-relaxed">
              Curated multi-day mountain routes with direct local stays, transit, and verified guides.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">
              Select Circuit:
            </span>
          </div>
        </div>

        {/* 1. Circuit Selector Tabs (Clean, Emoji-Free) */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 mb-6 sm:mb-8 scrollbar-hide">
          {ROUTE_PRESETS.map((preset) => {
            const isSelected = preset.id === activePresetId;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 border ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className="font-black">{preset.title}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                    isSelected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {preset.durationDays} Days
                </span>
              </button>
            );
          })}
        </div>

        {/* 2. Main Interactive Route Experience Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 overflow-hidden">
          
          {/* Header Metric Strip */}
          <div className="bg-slate-950 text-white px-5 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  {activePreset.region}
                </span>
                <span className="text-slate-600 text-xs">•</span>
                <span className="text-[10px] font-bold text-slate-400">
                  {activePreset.durationDays} Days Circuit
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-white leading-tight mt-0.5">
                {activePreset.title}
              </h3>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 sm:gap-6 text-xs bg-slate-900 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-slate-800 sm:border-0 justify-between sm:justify-end">
              <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5">
                <span className="text-slate-400 font-bold uppercase text-[9px] sm:text-[10px]">Distance:</span>
                <span className="font-black text-emerald-400 text-xs sm:text-sm">{activePreset.totalDistance}</span>
              </div>
              <div className="h-5 w-px bg-slate-800" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5">
                <span className="text-slate-400 font-bold uppercase text-[9px] sm:text-[10px]">Max Elevation:</span>
                <span className="font-black text-emerald-400 text-xs sm:text-sm">{activePreset.maxAltitude}</span>
              </div>
              <div className="h-5 w-px bg-slate-800 hidden sm:block" />
              <div className="hidden sm:flex flex-col sm:flex-row sm:items-center gap-1.5">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Stops:</span>
                <span className="font-black text-white text-sm">{activePreset.stops.length} Days</span>
              </div>
            </div>
          </div>

          {/* Upgraded Day Selection Stepper Timeline */}
          <div className="px-4 sm:px-8 py-3.5 border-b border-slate-100 bg-slate-50/70">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {activePreset.stops.map((stop, idx) => {
                const isActive = idx === activeDayIndex;
                return (
                  <button
                    key={stop.day}
                    onClick={() => setActiveDayIndex(idx)}
                    className={`p-3 sm:p-4 rounded-2xl text-left transition-all duration-200 border flex flex-col justify-between gap-1.5 relative overflow-hidden ${
                      isActive
                        ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500"
                        : "bg-white text-slate-800 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    {/* Active Accent Top Indicator */}
                    {isActive && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
                    )}

                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isActive ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        Day 0{stop.day}
                      </span>
                      <span
                        className={`text-[10px] sm:text-xs font-black truncate ${
                          isActive ? "text-emerald-400" : "text-emerald-600"
                        }`}
                      >
                        {stop.elevation}
                      </span>
                    </div>

                    <div>
                      <p
                        className={`font-black text-xs sm:text-sm truncate leading-snug ${
                          isActive ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {stop.destinationShort}
                      </p>
                      <p
                        className={`text-[10px] font-medium truncate mt-0.5 ${
                          isActive ? "text-slate-300" : "text-slate-400"
                        }`}
                      >
                        {stop.duration}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Day Spotlight Card */}
          <div className="p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* Left: Stop Photo, Elevation & Verified Local Host */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative h-60 sm:h-72 rounded-3xl overflow-hidden border border-slate-100 shadow-md group">
                <LocalImage
                  src={currentStop.image}
                  alt={`${currentStop.from} to ${currentStop.to}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                
                {/* Floating Tag */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider border border-white/20">
                    {currentStop.tag}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider">
                    Day {currentStop.day}
                  </span>
                </div>

                <div className="absolute bottom-3.5 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-widest">
                    <span>Altitude: {currentStop.elevation}</span>
                    <span>•</span>
                    <span>{currentStop.duration}</span>
                  </div>
                  <p className="text-lg sm:text-xl font-black leading-tight mt-0.5">
                    {currentStop.from} → {currentStop.to}
                  </p>
                </div>
              </div>

              {/* Verified Local Host Card */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-emerald-500 shadow-sm shrink-0">
                    <LocalImage
                      src={currentStop.localPartner.avatar}
                      alt={currentStop.localPartner.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-black text-slate-900 truncate">
                        {currentStop.localPartner.name}
                      </span>
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black shrink-0">
                        ✓
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">
                      {currentStop.localPartner.role}
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg shrink-0">
                  Verified Host
                </span>
              </div>
            </div>

            {/* Right: Detailed Itinerary Highlights & Step Controls */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div>
                {/* Day Header Info & Quick Day Navigation */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                        Day {currentStop.day} of {activePreset.stops.length}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {currentStop.duration}
                      </span>
                    </div>
                    <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                      {currentStop.from} to {currentStop.to}
                    </h4>
                  </div>

                  {/* Day Prev/Next Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={handlePrevDay}
                      disabled={activeDayIndex === 0}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 text-xs font-black transition-all flex items-center gap-1"
                      aria-label="Previous day"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={handleNextDay}
                      disabled={activeDayIndex === activePreset.stops.length - 1}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-black transition-all flex items-center gap-1"
                      aria-label="Next day"
                    >
                      Next →
                    </button>
                  </div>
                </div>

                {/* Route Leg Progress Summary Pill */}
                <div className="mb-4 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-slate-800">Stop Destination:</span>
                    <span className="font-black text-emerald-800">{currentStop.to}</span>
                  </div>
                  <span className="font-black text-emerald-700">{currentStop.elevation}</span>
                </div>

                {/* Highlights Checklist */}
                <div className="space-y-2.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    What You Will Experience Today:
                  </p>
                  <ul className="space-y-2.5">
                    {currentStop.highlights.map((highlight, hIdx) => (
                      <li
                        key={hIdx}
                        className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50/90 p-3 rounded-2xl border border-slate-100 shadow-xs hover:bg-slate-50 transition-colors"
                      >
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                          {hIdx + 1}
                        </span>
                        <span className="leading-snug">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Day-to-Day Navigation Links & Builder CTA */}
              <div className="pt-5 border-t border-slate-100 space-y-3">
                {/* Next Day Preview Pill */}
                {nextStop && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs">
                    <span className="text-slate-500 font-medium">Up next on Day {nextStop.day}:</span>
                    <button
                      onClick={handleNextDay}
                      className="text-emerald-700 font-bold hover:text-emerald-800 hover:underline flex items-center gap-1"
                    >
                      <span>{nextStop.from} → {nextStop.to}</span>
                      <span>→</span>
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <Button
                    onClick={handleOpenInBuilder}
                    variant="primary"
                    iconRight={<Icon name="arrow-right" className="w-4 h-4" />}
                    className="w-full sm:w-auto h-12 px-7 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                  >
                    Customize This Route in Builder
                  </Button>

                  <div className="flex items-center gap-2 text-slate-400 text-xs font-medium text-center sm:text-right">
                    <span>Direct local rates</span>
                    <span>•</span>
                    <span>100% customizable</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

