"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import Typography from "../../components/atoms/Typography";
import Button from "../../components/atoms/Button";
import { createVendor } from "@/services/vendorService";
import { useAuth } from "@/contexts/AuthContext";
import { sanitizePhone, isValidPhone, PHONE_LENGTH } from "@/utils/validation";

type BackendVendorType = 'hotel' | 'restaurant' | 'transport' | 'adventure';

interface ServiceItem {
    name: string;
    price: number;
    capacity: number;
    category: BackendVendorType;
    duration?: string;
}

const SPECIALTY_OPTIONS: { id: BackendVendorType, label: string, icon: string, color: string }[] = [
    { id: 'hotel', label: 'Stay', icon: '🛌', color: 'bg-orange-50 text-orange-600' },
    { id: 'transport', label: 'Transport', icon: '🚙', color: 'bg-blue-50 text-blue-600' },
    { id: 'adventure', label: 'Adventure', icon: '⛰️', color: 'bg-emerald-50 text-emerald-600' },
    { id: 'restaurant', label: 'Food', icon: '🍲', color: 'bg-rose-50 text-rose-600' },
];

export default function VendorOnboardingPage() {
    const { lang } = useParams();
    const router = useRouter();
    const { dict } = useLocalizationContext();
    const { user } = useAuth();
    
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    const [vendorTypes, setVendorTypes] = useState<BackendVendorType[]>([]);
    const [businessName, setBusinessName] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [phone, setPhone] = useState(user?.phone || "");
    const [services, setServices] = useState<ServiceItem[]>([{ name: "", price: 0, capacity: 1, category: 'adventure', duration: "Per Trip" }]);

    const totalSteps = 6;

    useEffect(() => {
        if (user?.phone && !phone) setPhone(user.phone);
    }, [user]);

    useEffect(() => {
        if (vendorTypes.length > 0) {
            setServices(prev => prev.map(s => ({
                ...s,
                category: vendorTypes.includes(s.category) ? s.category : vendorTypes[0]
            })));
        }
    }, [vendorTypes]);

    if (!dict) return null;

    const handleNext = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else router.back();
    };

    const toggleType = (type: BackendVendorType) => {
        setVendorTypes(prev => 
            prev.includes(type) 
            ? prev.filter(t => t !== type) 
            : [...prev, type]
        );
    };

    const addService = () => {
        setServices([...services, { 
            name: "", 
            price: 0, 
            capacity: 1,
            category: vendorTypes[0] || 'adventure', 
            duration: "Per Trip" 
        }]);
    };

    const updateService = (index: number, field: keyof ServiceItem, value: any) => {
        const newServices = [...services];
        newServices[index] = { ...newServices[index], [field]: value };
        setServices(newServices);
    };

    const removeService = (index: number) => {
        if (services.length > 1) {
            setServices(services.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const vendorData = {
                businessName,
                description,
                types: vendorTypes,
                location,
                phone,
                services
            };
            await createVendor(vendorData);
            router.replace(`/${lang}/vendor/onboarding/confirmation`);
        } catch (error) {
            console.error("Onboarding failed:", error);
            alert("Submission error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const isStepValid = () => {
        switch (step) {
            case 1: return vendorTypes.length > 0;
            case 2: return businessName.trim().length >= 3 && isValidPhone(phone);
            case 3: return description.trim().length >= 10;
            case 4: return services.length > 0 && services.every(s => s.name.trim().length >= 2 && s.price > 0 && s.category);
            case 5: return location.trim().length >= 2;
            default: return true;
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                        <div className="space-y-2">
                            <Typography variant="h1" className="text-3xl font-black text-slate-900 leading-tight">
                                Business <span className="text-emerald-500">Type.</span>
                            </Typography>
                            <p className="text-slate-500 text-sm font-medium">Select one or more specialties.</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {SPECIALTY_OPTIONS.map((item) => {
                                const isSelected = vendorTypes.includes(item.id);
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => toggleType(item.id)}
                                        className={`p-4 rounded-3xl border-2 text-left transition-all duration-300 relative ${
                                            isSelected 
                                            ? "border-emerald-500 bg-emerald-50/30" 
                                            : "border-slate-50 bg-slate-50/50"
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-2xl ${item.color} flex items-center justify-center text-xl mb-3 shadow-sm`}>
                                            {item.icon}
                                        </div>
                                        <p className="font-black text-slate-900 text-sm uppercase tracking-tighter">{item.label}</p>
                                        {isSelected && (
                                            <div className="absolute top-3 right-3 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-500">
                        <Typography variant="h1" className="text-3xl font-black text-slate-900 leading-tight">
                            Identity <span className="text-emerald-500">&</span> Contact.
                        </Typography>
                        
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
                                <input
                                    autoFocus
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    placeholder="e.g. Everest Travels"
                                    className="w-full text-lg font-black p-5 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-emerald-500/30 focus:bg-white outline-none text-slate-900"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={PHONE_LENGTH}
                                    value={phone}
                                    onChange={(e) => setPhone(sanitizePhone(e.target.value))}
                                    placeholder="00000 00000"
                                    className="w-full text-lg font-black p-5 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-emerald-500/30 focus:bg-white outline-none text-slate-900"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-500">
                        <Typography variant="h1" className="text-3xl font-black text-slate-900 leading-tight">
                            About <span className="text-emerald-500">You.</span>
                        </Typography>
                        <textarea
                            autoFocus
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Briefly describe your services..."
                            rows={5}
                            className="w-full text-lg font-bold p-6 rounded-[2rem] bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-emerald-500/30 focus:bg-white outline-none text-slate-700 leading-snug"
                        />
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-5 animate-in fade-in duration-500">
                        <div className="flex justify-between items-center group">
                            <Typography variant="h1" className="text-2xl font-black text-slate-900">
                                <span className="text-emerald-500">Services</span> Menu
                            </Typography>
                            <button onClick={addService} className="text-[9px] font-black text-emerald-500 uppercase bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all">+ Add New</button>
                        </div>
                        
                        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                            {services.map((service, index) => (
                                <div key={index} className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4 relative">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[8px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded uppercase tracking-widest italic">Item 0{index + 1}</span>
                                        {services.length > 1 && (
                                            <button onClick={() => removeService(index)} className="text-rose-400 p-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        <input
                                            value={service.name}
                                            onChange={(e) => updateService(index, 'name', e.target.value)}
                                            placeholder="Service Name"
                                            className="w-full text-base font-black p-0 border-none bg-transparent focus:ring-0 outline-none text-slate-900"
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                                                <span className="text-xs font-black text-slate-300">₹</span>
                                                <input
                                                    type="number"
                                                    value={service.price || ""}
                                                    onChange={(e) => updateService(index, 'price', Number(e.target.value))}
                                                    className="w-full text-right bg-transparent border-none focus:ring-0 outline-none font-black text-sm"
                                                />
                                            </div>
                                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Pax</span>
                                                <input
                                                    type="number"
                                                    value={service.capacity || 1}
                                                    onChange={(e) => updateService(index, 'capacity', Number(e.target.value))}
                                                    className="w-full text-right bg-transparent border-none focus:ring-0 outline-none font-black text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="w-full">
                                            <select 
                                                value={service.category}
                                                onChange={(e) => updateService(index, 'category', e.target.value)}
                                                className="w-full bg-emerald-50 p-2.5 rounded-xl border-none font-black text-[10px] text-emerald-500 outline-none uppercase"
                                            >
                                                {vendorTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-500">
                        <Typography variant="h1" className="text-3xl font-black text-slate-900 leading-tight">
                            Base <span className="text-emerald-500">Location.</span>
                        </Typography>
                        <div className="relative">
                            <input
                                autoFocus
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g. Manali, Himachal"
                                className="w-full text-xl font-black p-6 rounded-3xl bg-white border-none shadow-sm ring-1 ring-slate-100 focus:ring-emerald-500 outline-none"
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl opacity-30">📍</span>
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="space-y-6 animate-in zoom-in-95 duration-500 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-3xl shadow-lg mx-auto rotate-3">✨</div>
                        <Typography variant="h1" className="text-3xl font-black text-slate-900 leading-tight">
                            Ready to <span className="text-emerald-500">Go Live!</span>
                        </Typography>
                        <div className="p-6 rounded-[2.5rem] bg-slate-900 text-white text-left space-y-4 shadow-xl text-sm">
                             <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                <p className="font-black text-lg line-clamp-1">{businessName}</p>
                                <span className="px-2 py-0.5 bg-emerald-500 rounded text-[8px] font-black uppercase tracking-widest">Active</span>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-[8px] font-black uppercase text-slate-500">Contact</p><p className="font-bold text-xs truncate">{phone}</p></div>
                                <div><p className="text-[8px] font-black uppercase text-slate-500">Location</p><p className="font-bold text-xs truncate">{location}</p></div>
                             </div>
                             <div className="pt-2 border-t border-white/5 flex gap-2 overflow-x-auto pb-1">
                                {vendorTypes.map(t => <span key={t} className="px-2 py-1 bg-white/5 rounded-full text-[8px] font-black uppercase whitespace-nowrap">{t}</span>)}
                             </div>
                             <div className="flex items-center gap-2 text-[8px] font-black uppercase text-indigo-400">
                                <span>👥 Total Capacity: {services.reduce((acc, s) => acc + (s.capacity || 0), 0)} travelers</span>
                             </div>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="flex flex-col h-full min-h-[480px]">
            {/* Minimal Progress */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-1.5 px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Step 0{step}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">/ 0{totalSteps}</span>
                </div>
                <div className="flex gap-1 h-1">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div key={i} className={`flex-1 rounded-full ${i + 1 <= step ? "bg-emerald-500" : "bg-slate-100"}`} />
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-x-hidden">
                {renderStep()}
            </div>

            {/* Actions- Fixed Bottom mobile, relative desktop */}
            <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-0 sm:relative sm:mt-10 bg-white/95 backdrop-blur-md sm:bg-transparent flex items-center gap-2 z-50 border-t border-slate-50 sm:border-none">
                <Button variant="ghost" onClick={handleBack} className="h-12 px-4 rounded-xl font-black uppercase text-[9px] text-slate-400 w-1/4">
                    {step === 1 ? 'Exit' : 'Prev'}
                </Button>
                {step === totalSteps ? (
                    <Button onClick={handleSubmit} disabled={loading} className="flex-1 h-12 rounded-xl bg-emerald-500 text-white font-black text-[10px] uppercase shadow-md active:scale-95 transition-all">
                        {loading ? 'Submitting...' : 'Apply Now ✨'}
                    </Button>
                ) : (
                    <Button onClick={handleNext} disabled={!isStepValid()} className="flex-1 h-12 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase shadow-md active:scale-95 transition-all">
                        Continue
                    </Button>
                )}
            </div>
        </div>
    );
}
