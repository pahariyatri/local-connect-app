"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Locale } from "@/i18n-config";
import Typography from "./components/atoms/Typography";
import Button from "./components/atoms/Button";
import LocalImage from "./components/atoms/Image";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import Loading from "../loading";

import { useTripPlanner } from "@/contexts/TripPlannerContext";

type HomeProps = {
  params: Promise<{ lang: Locale }>;
};

export default function Home({ params }: HomeProps) {
  const { dict, lang, loading } = useLocalizationContext();
  useTripPlanner();
  
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const router = useRouter();


  const featuredServices = [
    { id: "s1", name: "Beas Kund Trek", price: 4500, category: "Adventure", image: "https://images.unsplash.com/photo-1642498709557-b1bd711dd68b?q=80&w=600", description: "A moderate 3-day trek to the source of the Beas river." },
    { id: "s2", name: "Valley View Homestay", price: 2500, category: "Stay", image: "https://images.unsplash.com/photo-1651319485646-f0f30e46b761?q=80&w=600", description: "Boutique wooden cottage with panoramic Himalayan views." },
    { id: "s3", name: "Local Culinary Tour", price: 1200, category: "Guide", image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=600", description: "Explore old Manali's best street food and local history." },
    { id: "s4", name: "Solang Valley Paragliding", price: 3200, category: "Activity", image: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=80&w=600", description: "Tandem paragliding with expert certified pilots." },
  ];

  const communityJourneys = [
    { id: "j1", name: "The Manali Mystic Expedition", author: "Rahul K.", image: "https://images.unsplash.com/photo-1712388430474-ace0c16051e2?q=80&w=600", duration: "5 Days", price: 12500, stops: ["Old Manali", "Beas Kund", "Solang Valley", "Vashist"] },
    { id: "j2", name: "Hidden Spiti Loop", author: "Anita S.", image: "https://plus.unsplash.com/premium_photo-1661878621391-a53da02f1098?q=80&w=600", duration: "8 Days", price: 28000, stops: ["Kaza", "Kibber", "Chandra Taal", "Langza"] },
  ];

  const topVendors = [
    { id: "v1", name: "Tenzing Norgay Guides", rating: 4.9, image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=400", services: 12, status: "Verified Elite" },
    { id: "v2", name: "Himalayan Stays", rating: 4.8, image: "https://images.unsplash.com/photo-1651319485646-f0f30e46b761?q=80&w=400", services: 8, status: "Verified" },
  ];

  const destinations = [
    { name: "Manali", description: "The heart of Himachal.", image: "https://images.unsplash.com/photo-1712388430474-ace0c16051e2?q=80&w=400" },
    { name: "Shimla", description: "Queen of Hills.", image: "https://images.unsplash.com/photo-1651319485646-f0f30e46b761?q=80&w=400" },
    { name: "Leh", description: "High altitude adventure.", image: "https://plus.unsplash.com/premium_photo-1661878621391-a53da02f1098?q=80&w=400" },
  ];

  if (!dict) {
    return <Loading></Loading>;
  }

  const home = dict.page.home;

  return (
    <>
      <section className="relative h-screen flex items-center justify-center bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
            <LocalImage 
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000" 
                alt="Epic Himalayan Peaks"
                className="w-full h-full object-cover opacity-60 scale-105 animate-pulse-slow object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-slate-900" />
        </div>
        
        <div className="container mx-auto px-6 text-center relative z-10 pt-20">
          <header className="mb-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] mb-8">
                The Mountain Concierge
            </span>
            <h1 
                className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tight text-white leading-[0.85] uppercase italic"
                dangerouslySetInnerHTML={{ __html: home.hero.title }}
            />
            <p className="mt-8 text-lg sm:text-2xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed opacity-90 px-4">
                {home.hero.subtitle}
            </p>
          </header>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 px-6">
            <Button 
                onClick={() => router.push(`/${lang}/builder`)} 
                className="w-full sm:w-auto h-16 sm:h-20 px-8 sm:px-12 rounded-2xl sm:rounded-[2rem] bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg sm:text-xl shadow-2xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
            >
              {home.hero.cta_primary}
            </Button>
            <Button 
                variant="ghost" 
                onClick={() => router.push(`/${lang}/results`)}
                className="w-full sm:w-auto h-16 sm:h-20 px-8 sm:px-10 rounded-2xl sm:rounded-[2rem] text-white font-black text-base sm:text-lg border-2 border-white/20 hover:bg-white/10 flex items-center justify-center gap-4 group active:scale-95 transition-all uppercase tracking-widest"
            >
              <span>{home.hero.cta_secondary}</span>
              <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </Button>
          </div>
        </div>
      </section>

      {/* 🤝 Premium Sponsored Section */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-100 relative">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center gap-12 sm:gap-16">
                <div className="flex flex-col items-center">
                    <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-4">
                        {home.sponsored.title}
                    </p>
                    <div className="h-1 w-12 bg-emerald-500/20 rounded-full" />
                </div>
                
                <div className="flex flex-wrap justify-center items-center gap-10 sm:gap-24 opacity-40 hover:opacity-100 transition-all duration-700">
                    {home.sponsored.vendors.map((v: string) => (
                        <span key={v} className="text-xl sm:text-3xl font-black text-slate-900 tracking-tighter italic uppercase grayscale hover:grayscale-0 transition-all cursor-default">
                           {v}
                        </span>
                    ))}
                </div>
            </div>
        </div>
      </section>

      {/* 🏔️ Direct Destination Access */}
      <section className="py-24 sm:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-6">
            <div className="max-w-xl">
              <span className="text-emerald-500 font-black uppercase tracking-[0.2em] text-[10px] mb-4 block">Curated Regions</span>
              <Typography variant="h2" className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight uppercase italic leading-[0.9]">
                {home.destinations.title}
              </Typography>
              <p className="text-slate-500 mt-6 font-medium text-sm sm:text-base leading-relaxed">{home.destinations.subtitle}</p>
            </div>
            <button className="text-[10px] font-black uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1 hover:text-emerald-500 hover:border-emerald-500 transition-all">View All Peaks</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {destinations.map((dest, i) => (
              <div 
                key={i} 
                className="group relative h-[400px] sm:h-[600px] overflow-hidden rounded-[2.5rem] sm:rounded-[3.5rem] cursor-pointer shadow-xl shadow-slate-200/50"
                onClick={() => router.push(`/${lang}/discover?destination=${encodeURIComponent(dest.name)}`)}
              >
                <LocalImage src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3000ms]" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
                <div className="absolute bottom-10 sm:bottom-14 left-10 sm:left-14 right-10 text-white">
                  <h3 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter leading-none">{dest.name}</h3>
                  <div className="w-10 h-1 bg-emerald-500 mt-6 mb-4 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 line-clamp-2">{dest.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🛡️ The Local Promise (Trust) */}
      <section className="py-24 sm:py-32 px-6">
        <div className="max-w-7xl mx-auto rounded-[3rem] sm:rounded-[5rem] bg-slate-900 px-8 sm:px-24 py-24 sm:py-32 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
                <div className="max-w-xl">
                   <div className="w-12 h-1 bg-emerald-500 mb-10" />
                   <Typography variant="h2" className="text-4xl sm:text-7xl font-black text-white tracking-tighter leading-[0.85] uppercase italic">
                       {home.trust.title}
                   </Typography>
                   <p className="mt-10 text-lg sm:text-xl text-slate-400 font-medium leading-relaxed">
                       {home.trust.subtitle}
                   </p>
                </div>
                
                <div className="grid gap-8 sm:gap-12">
                    {[
                        { title: home.trust.verified, sub: home.trust.verified_sub, icon: "🛡️" },
                        { title: home.trust.escrow, sub: home.trust.escrow_sub, icon: "💳" },
                        { title: home.trust.direct, sub: home.trust.direct_sub, icon: "🤝" }
                    ].map((t, idx) => (
                        <div key={idx} className="flex gap-6 sm:gap-8 items-start group">
                            <div className="w-14 h-14 sm:w-20 sm:h-20 shrink-0 rounded-[1.5rem] sm:rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-2xl sm:text-4xl group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all duration-500 shadow-2xl">
                                {t.icon}
                            </div>
                            <div className="pt-2">
                                <h4 className="font-black text-lg sm:text-xl uppercase tracking-tight italic mb-2">{t.title}</h4>
                                <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed">{t.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </section>

      {/* 🎒 Elite Experiences */}
      <section className="py-24 sm:py-32 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-emerald-500 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Hand-Picked by Us</span>
            <Typography variant="h2" className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight uppercase italic leading-none">
                Curated Legend Paths
            </Typography>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {featuredServices.map((service) => (
              <div key={service.id} className="premium-card group overflow-hidden bg-white border border-slate-100 rounded-[2.5rem] hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
                <div className="relative h-64 overflow-hidden">
                  <LocalImage src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                  <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase text-slate-900 shadow-sm tracking-widest">
                    {service.category}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-black text-slate-900 mb-2 truncate uppercase italic tracking-tight">{service.name}</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 line-clamp-2 h-8">{service.description}</p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">From</p>
                      <p className="text-2xl font-black text-slate-900 tracking-tighter italic">₹{service.price.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => router.push(`/${lang}/builder`)}
                      aria-label={`Add ${service.name} to your trip plan`}
                      className="h-14 px-5 rounded-2xl bg-slate-900 text-white flex items-center gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-200 transition-all active:scale-95"
                    >
                      Add to Plan
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🏔️ The Intelligent Pathfinding Call-to-Action */}
      <section className="py-24 sm:py-40 px-6">
        <div className="max-w-6xl mx-auto rounded-[3rem] sm:rounded-[5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-10 sm:p-32 text-center text-white relative overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]" />
          
          <div className="relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <span className="text-emerald-500 font-black uppercase tracking-[0.4em] text-[10px] mb-8 block">{home.ai_cta.badge}</span>
            <h2 className="text-5xl sm:text-9xl font-black mb-10 leading-[0.8] tracking-tighter uppercase italic"
                dangerouslySetInnerHTML={{ __html: home.ai_cta.title }} />
            <p className="text-slate-400 text-lg sm:text-2xl mb-14 max-w-2xl mx-auto leading-relaxed font-medium">
              {home.ai_cta.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button onClick={()=> router.push(`/${lang}/builder`)} className="w-full sm:w-auto h-20 px-12 rounded-[2rem] bg-white text-slate-900 hover:bg-emerald-50 font-black text-xl shadow-2xl active:scale-95 transition-all uppercase tracking-widest">
                {home.ai_cta.cta}
              </Button>
              <Button 
                variant="ghost" 
                className="w-full sm:w-auto text-white hover:bg-white/10 font-black px-10 h-20 rounded-[2rem] border-2 border-white/10 active:scale-95 transition-all uppercase tracking-widest" 
                onClick={() => router.push(`/${lang}/vendor/onboarding`)}
              >
                {home.ai_cta.partner}
              </Button>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
