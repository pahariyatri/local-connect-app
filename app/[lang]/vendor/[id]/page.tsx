"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NextImage from "next/image";
import Typography from "../../components/atoms/Typography";
import Button from "../../components/atoms/Button";
import { useNotification } from "@/contexts/NotificationContext";
import TopNavigation from "../../components/organisms/TopNavigation";
import VendorQRCode from "../../components/molecules/VendorQRCode";

const MOCK_VENDOR_PROFILE = {
    id: "v1",
    name: "Himalayan Retreat",
    image: "https://images.unsplash.com/photo-1651319485646-f0f30e46b761?q=80&w=800",
    rating: 4.8,
    reviews: 124,
    priceRange: "₹₹₹",
    category: "Stay",
    isSecretGroupMember: true,
    description: "Nestled in the heart of Old Manali, Himalayan Retreat offers a sanctuary for those seeking peace and authentic hospitality. As a Local Connect Legend, this property is part of our invitation-only Secret Group.",
    features: ["Panoramic Peak Views", "Organic Kitchen garden", "Traditional Mud-walled Rooms", "Guided Meditation sessions"],
    services: [
        { id: "s1", name: "Premium Suite", price: 4500, unit: "night" },
        { id: "s2", name: "Riverside Cottage", price: 6500, unit: "night" },
        { id: "s3", name: "Local Thali Experience", price: 800, unit: "person" }
    ]
};

export default function VendorProfilePage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const { showNotification } = useNotification();
    const [selectedService, setSelectedService] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-white pb-32">
            <TopNavigation title="Vendor Profile" />
            
            {/* Hero Image */}
            <div className="h-96 w-full relative">
                <NextImage 
                    src={MOCK_VENDOR_PROFILE.image} 
                    fill 
                    className="object-cover" 
                    alt={MOCK_VENDOR_PROFILE.name} 
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-slate-900/10 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase rounded-full tracking-widest shadow-xl">
                            LOCALconnect LEGEND
                        </span>
                        {MOCK_VENDOR_PROFILE.isSecretGroupMember && (
                            <span className="px-3 py-1 bg-amber-400 text-slate-900 text-[9px] font-black uppercase rounded-full tracking-widest shadow-lg">
                                SECRET GROUP MEMBER 🤫
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <main className="max-w-md mx-auto px-6 -mt-12 relative z-10">
                <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-slate-200 border border-slate-50">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <Typography variant="h1" className="text-3xl font-black text-slate-900 mb-1">
                                {MOCK_VENDOR_PROFILE.name}
                            </Typography>
                            <div className="flex items-center gap-2">
                                <span className="text-amber-500 font-bold">★ {MOCK_VENDOR_PROFILE.rating}</span>
                                <span className="text-slate-400 text-xs text-bold uppercase tracking-wider">({MOCK_VENDOR_PROFILE.reviews} reviews)</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                             <Typography variant="h3" className="font-black text-slate-900 text-sm">{MOCK_VENDOR_PROFILE.priceRange}</Typography>
                        </div>
                    </div>

                    <Typography variant="p" className="text-slate-500 leading-relaxed mb-8">
                        {MOCK_VENDOR_PROFILE.description}
                    </Typography>

                    <div className="space-y-4 mb-10">
                        {MOCK_VENDOR_PROFILE.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                </div>
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <Typography variant="h3" className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">
                        Featured Services
                    </Typography>
                    
                    <div className="space-y-3 mb-10">
                        {MOCK_VENDOR_PROFILE.services.map(service => (
                            <button 
                                key={service.id}
                                onClick={() => setSelectedService(service.id)}
                                className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${selectedService === service.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-slate-200'}`}
                            >
                                <div className="text-left">
                                    <p className="font-black text-slate-900 leading-none mb-1 uppercase text-xs tracking-wide">{service.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Selected by 200+ Travelers</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-emerald-500">₹{service.price}</p>
                                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">per {service.unit}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="bg-slate-900 rounded-[2.5rem] text-center mb-8 pb-8 pt-4">
                        <Typography variant="h3" className="text-white text-[10px] font-black uppercase tracking-widest mb-4 mt-6">
                            Official Authenticity Tag
                        </Typography>
                        <div className="inline-block relative">
                            <VendorQRCode vendorId={id} businessName={MOCK_VENDOR_PROFILE.name} />
                        </div>
                    </div>

                    <Button 
                        onClick={() => {
                            if (!selectedService) return showNotification("Please select a service first", "error");
                            showNotification("Added to your journey!", "success");
                            router.back();
                        }}
                        className="w-full h-16 rounded-[2rem] bg-emerald-500 text-white font-black text-lg shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                        ADD TO JOURNEY
                    </Button>
                </div>
            </main>
        </div>
    );
}
