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
  emoji: string;
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
    title: "Parvati & Manali Valley Circuit",
    subtitle: "Riverside stays, cedar pine trails & ancient mountain passes",
    emoji: "🏔️",
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
        duration: "6.5 hrs scenic drive",
        elevation: "1,580 m",
        tag: "Riverside Arrival & Local Cuisine",
        icon: "utensils",
        image: "https://images.unsplash.com/photo-1571401835393-8c5f35328320?q=80&w=800",
        highlights: [
          "Scenic Beas & Parvati river gorge route",
          "Authentic Himalayan trout & Siddu lunch stop",
          "Riverside cedar trail walk at twilight"
        ],
        localPartner: {
          name: "Rajesh Negi",
          role: "Verified Homestay Host (Old Kasol)",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
          isVerified: true
        }
      },
      {
        day: 2,
        from: "Kasol",
        to: "Kullu & Naggar",
        duration: "2.5 hrs valley transit",
        elevation: "1,750 m",
        tag: "Heritage Castle & Apple Orchards",
        icon: "mountain",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800",
        highlights: [
          "Visit 500-yr-old Naggar Wooden Castle",
          "Local apple orchard cider tasting session",
          "Guided heritage trail walk with local elder"
        ],
        localPartner: {
          name: "Amit Thakur",
          role: "Mountain 4x4 Driver & Guide",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
          isVerified: true
        }
      },
      {
        day: 3,
        from: "Kullu",
        to: "Old Manali",
        duration: "1.5 hrs alpine ascent",
        elevation: "2,050 m",
        tag: "Alpine Stay & High Mountain Vistas",
        icon: "home",
        image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800",
        highlights: [
          "Boutique wooden loft stay with valley views",
          "Solang Valley adventure & Rohtang gateway",
          "Stargazing campfire with authentic pahari dinner"
        ],
        localPartner: {
          name: "Priya Sharma",
          role: "Old Manali Eco-Cottage Host",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200",
          isVerified: true
        }
      }
    ]
  },
  {
    id: "kangra-bir",
    title: "Dharamshala & Bir Paragliding Trail",
    subtitle: "Tibetan culture, tea gardens & world-class paragliding take-off",
    emoji: "🪂",
    durationDays: 4,
    totalDistance: "220 km",
    maxAltitude: "2,400 m",
    region: "Kangra Valley",
    builderUrlParams: "origin=Pathankot&destinations=Dharamshala,Bir,Billing",
    stops: [
      {
        day: 1,
        from: "Pathankot",
        to: "Dharamshala & McLeod",
        duration: "3.5 hrs pine drive",
        elevation: "1,457 m",
        tag: "Monasteries & Tibetan Culture",
        icon: "compass",
        image: "https://images.unsplash.com/photo-1653853572809-ea537274c7f5?q=80&w=800",
        highlights: [
          "Namgyal Monastery & Dalai Lama complex walk",
          "Local Tibetan thukpa & momo trail in McLeod Ganj",
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
        to: "Triund Ridge Base",
        duration: "4.5 hrs guided day trek",
        elevation: "2,875 m",
        tag: "Dhauladhar Snowline Trek",
        icon: "mountain",
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800",
        highlights: [
          "Panoramic 360° snow-clad ridge vistas",
          "Hot Himalayan chai & maggi on the mountain ridge",
          "Safe mountain trail navigation with licensed leader"
        ],
        localPartner: {
          name: "Sunil Dogra",
          role: "Certified Mountaineering Guide",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200",
          isVerified: true
        }
      },
      {
        day: 3,
        from: "Dharamshala",
        to: "Bir Billing",
        duration: "2 hrs tea garden drive",
        elevation: "2,400 m",
        tag: "World-Class Paragliding Flight",
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
    title: "Spiti Valley Cold Desert Explorer",
    subtitle: "High mountain passes, 1000-year-old gompas & lunar valleys",
    emoji: "❄️",
    durationDays: 5,
    totalDistance: "410 km",
    maxAltitude: "4,590 m",
    region: "Lahaul & Spiti",
    builderUrlParams: "origin=Shimla&destinations=Sangla,Tabo,Kaza,Chandratal",
    stops: [
      {
        day: 1,
        from: "Shimla",
        to: "Sangla & Chitkul",
        duration: "7 hrs Kinnaur valley drive",
        elevation: "2,696 m",
        tag: "Last Indian Village on Border",
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
        duration: "6 hrs high-pass transit",
        elevation: "3,800 m",
        tag: "1000-Yr-Old Tabo Monastery & Mudh",
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
        to: "Chandratal Moon Lake",
        duration: "4.5 hrs Kunzum pass drive",
        elevation: "4,300 m",
        tag: "Crescent Moon Glacial Lake Camp",
        icon: "mountain",
        image: "https://images.unsplash.com/photo-1574116504481-e06341e984e1?q=80&w=800",
        highlights: [
          "Kunzum La pass (4,590m) prayer flag stupa",
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

  const handleSelectPreset = (id: string) => {
    setActivePresetId(id);
    setActiveDayIndex(0);
  };

  const handleOpenInBuilder = () => {
    router.push(`/${lang}/builder?${activePreset.builderUrlParams}`);
  };

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-slate-50 to-white px-4 sm:px-6 relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-5xl h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] font-black uppercase tracking-widest mb-3">
              <span>🗺️ Verified Route Blueprints</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              The journey, day by day.
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-xl font-medium">
              Every stop, scenic pass, and local host planned in advance — not left to chance on arrival.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Interactive Preview
            </span>
          </div>
        </div>

        {/* 1. Circuit Tabs */}
        <div className="flex gap-2.5 overflow-x-auto pb-3 mb-6 sm:mb-8 scrollbar-hide">
          {ROUTE_PRESETS.map((preset) => {
            const isSelected = preset.id === activePresetId;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-300 border ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/10 scale-100"
                    : "bg-white text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className="text-base">{preset.emoji}</span>
                <span>{preset.title.split("Circuit")[0].split("Trail")[0].split("Explorer")[0].trim()}</span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
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
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 overflow-hidden">
          
          {/* Header Metric Strip */}
          <div className="bg-slate-900 text-white px-6 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-500/20">
                {activePreset.emoji}
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  {activePreset.title}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5 font-medium">
                  {activePreset.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Distance:</span>
                <span className="font-black text-emerald-400">{activePreset.totalDistance}</span>
              </div>
              <div className="h-4 w-px bg-slate-800" />
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Max Altitude:</span>
                <span className="font-black text-emerald-400">{activePreset.maxAltitude}</span>
              </div>
              <div className="h-4 w-px bg-slate-800" />
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Stops:</span>
                <span className="font-black text-white">{activePreset.stops.length} Days</span>
              </div>
            </div>
          </div>

          {/* Interactive Day Selection Timeline Bar */}
          <div className="px-6 sm:px-8 pt-6 pb-2 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Select Day to Inspect Route
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Step {activeDayIndex + 1} of {activePreset.stops.length}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 pb-3">
              {activePreset.stops.map((stop, idx) => {
                const isActive = idx === activeDayIndex;
                return (
                  <button
                    key={stop.day}
                    onClick={() => setActiveDayIndex(idx)}
                    className={`relative p-3 sm:p-4 rounded-2xl text-left transition-all duration-300 border ${
                      isActive
                        ? "bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                        : "bg-white/70 border-slate-200/80 hover:bg-white hover:border-slate-300 opacity-75 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isActive
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        Day {stop.day}
                      </span>
                      <span className="text-xs font-black text-emerald-600">
                        {stop.elevation}
                      </span>
                    </div>
                    <p className="font-black text-xs sm:text-sm text-slate-900 truncate">
                      {stop.from} → {stop.to}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                      {stop.duration}
                    </p>
                    {isActive && (
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-emerald-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Day Detailed Spotlight View */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Stop Photo & Local Partner Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden border border-slate-100 shadow-inner group">
                <LocalImage
                  src={currentStop.image}
                  alt={`${currentStop.from} to ${currentStop.to}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
                
                {/* Floating Tag */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest border border-white/20">
                    {currentStop.tag}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                    Elevation: {currentStop.elevation}
                  </p>
                  <p className="text-base sm:text-lg font-black leading-tight mt-0.5">
                    {currentStop.from} ➔ {currentStop.to}
                  </p>
                </div>
              </div>

              {/* Verified Local Partner Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-emerald-400 shadow-sm shrink-0">
                    <LocalImage
                      src={currentStop.localPartner.avatar}
                      alt={currentStop.localPartner.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900">
                        {currentStop.localPartner.name}
                      </span>
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-black">
                        ✓
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {currentStop.localPartner.role}
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-1 rounded-lg shrink-0">
                  Verified Local
                </span>
              </div>
            </div>

            {/* Right: Detailed Itinerary Highlights & Live Actions */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                    <Icon name={currentStop.icon} className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                      Day {currentStop.day} Schedule
                    </span>
                    <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {currentStop.from} to {currentStop.to}
                    </h4>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    What&apos;s Included In This Stop:
                  </p>
                  <ul className="space-y-2">
                    {currentStop.highlights.map((highlight, hIdx) => (
                      <li
                        key={hIdx}
                        className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100"
                      >
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                          ✓
                        </span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                <Button
                  onClick={handleOpenInBuilder}
                  variant="primary"
                  iconRight={<Icon name="arrow-right" className="w-4 h-4" />}
                  className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  Customize This Route in Builder
                </Button>

                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <span>✨ 100% customizable</span>
                  <span>•</span>
                  <span>Direct local pricing</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
