"use client";

import { useState, useEffect } from "react";
import { Service, SeasonalPrice } from "./types";
import Typography from "../../components/atoms/Typography";
import Input from "../../components/atoms/Input";
import Button from "../../components/atoms/Button";
import Select from "../../components/atoms/Select";
import Textarea from "../../components/atoms/Textarea";
import Modal from "../../components/atoms/Modal";

const categories = [
    "Accommodation",
    "Transportation",
    "Tours and Activities",
    "Travel Packages",
    "Food and Beverages",
    "Handicrafts and Shopping",
    "Event Services",
    "Local Guides and Translators",
    "Water-based Activities",
    "Wellness and Health",
];

const subcategories: Record<string, string[]> = {
    Accommodation: [
        "Hotels",
        "Homestays",
        "Camping Sites",
        "Resorts",
        "Heritage Stays",
        "Eco-Lodges",
    ],
    Transportation: [
        "Private Transport",
        "Shared Transport",
        "Public Transport",
        "Specialized Transport",
    ],
};

type AddEditServiceFormProps = {
    initialData?: Service;
    onSave: (service: Service) => void;
    onCancel: () => void;
};

const AddEditServiceForm = ({
    initialData,
    onSave,
    onCancel,
}: AddEditServiceFormProps) => {
    const [name, setName] = useState(initialData?.name || "");
    const [category, setCategory] = useState(initialData?.category || "Accommodation");
    const [subcategory, setSubcategory] = useState(initialData?.subcategory || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [capacity, setCapacity] = useState(initialData?.capacity || 1);
    
    // Pricing state
    const [prices, setPrices] = useState<Record<string, number>>(
        initialData?.prices || { weekday: 0, weekend: 0 }
    );
    const [seasonalPrices, setSeasonalPrices] = useState<SeasonalPrice[]>(
        initialData?.seasonalPrices || []
    );
    const [dynamicPricingEnabled, setDynamicPricingEnabled] = useState(
        initialData?.dynamicPricingEnabled || false
    );
    
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    
    // Check for active bookings to lock pricing
    const isPriceLocked = initialData?.hasActiveBookings || false;

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setCategory(initialData.category || "Accommodation");
            setSubcategory(initialData.subcategory || "");
            setDescription(initialData.description || "");
            setPrices(initialData.prices || { weekday: 0, weekend: 0 });
            setSeasonalPrices(initialData.seasonalPrices || []);
            setDynamicPricingEnabled(initialData.dynamicPricingEnabled || false);
            setCapacity(initialData.capacity || 1);
        }
    }, [initialData]);

    const handlePriceChange = (key: string, value: number) => {
        if (isPriceLocked) return;
        setPrices((prev) => ({ ...prev, [key]: value }));
    };

    const addSeason = () => {
        if (isPriceLocked) return;
        const newSeason: SeasonalPrice = {
            id: Date.now().toString(),
            seasonName: "High Season",
            startDate: "",
            endDate: "",
            price: 0
        };
        setSeasonalPrices([...seasonalPrices, newSeason]);
    };

    const updateSeason = (id: string, field: keyof SeasonalPrice, value: string | number) => {
        if (isPriceLocked) return;
        setSeasonalPrices(seasonalPrices.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const removeSeason = (id: string) => {
        if (isPriceLocked) return;
        setSeasonalPrices(seasonalPrices.filter(s => s.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !description.trim()) {
            alert("Please provide valid inputs.");
            return;
        }

        const serviceData: Service = {
            id: initialData?.id || Date.now(),
            name,
            category,
            subcategory,
            description,
            prices,
            seasonalPrices,
            dynamicPricingEnabled,
            capacity,
            availability: initialData?.availability || "Daily",
            status: initialData?.status || "pending",
        };

        onSave(serviceData);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 sm:p-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-[3rem] max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-500 max-h-[92vh] flex flex-col overflow-hidden relative border border-slate-100">
                {/* Header */}
                <div className="p-8 pb-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-2xl shadow-xl shadow-slate-200">
                           {initialData ? "📝" : "🆕"}
                        </div>
                        <div>
                            <Typography variant="h2" className="text-xl font-black text-slate-900 uppercase tracking-tighter italic leading-none mb-1">
                                {initialData ? "Refine Legend" : "Create Listing"}
                            </Typography>
                            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Global Protocol v2.4</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-8 pt-4 space-y-10">
                    {/* Basic Info */}
                    <section className="space-y-6">
                        <div className="flex justify-between items-center px-2">
                             <Typography variant="h3" className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                                Core Definition
                            </Typography>
                        </div>
                        <Input
                            label="Listing Title"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Hidden Mountain Chalet"
                            className="premium-input-style h-16 rounded-2xl border-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 font-black uppercase tracking-tighter text-sm italic"
                        />
                        <div className="grid grid-cols-2 gap-6">
                            <Select
                                label="Sector"
                                name="category"
                                value={category}
                                onChange={(e) => {
                                    setCategory(e.target.value);
                                    setSubcategory("");
                                }}
                                options={categories}
                            />
                            <Select
                                label="Expertise"
                                name="subcategory"
                                value={subcategory}
                                onChange={(e) => setSubcategory(e.target.value)}
                                options={subcategories[category] || ["General"]}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6 items-end">
                            <Textarea
                                label="Mission / Description"
                                name="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Details about this local experience..."
                                className="min-h-[140px] rounded-[2rem] border-slate-100 focus:border-emerald-500 p-6 text-sm font-bold text-slate-600"
                            />
                            <div className="space-y-6">
                                <Input
                                    label="Guest Capacity"
                                    name="capacity"
                                    type="number"
                                    value={String(capacity)}
                                    onChange={(e) => setCapacity(Number(e.target.value))}
                                    className="h-16 rounded-2xl border-slate-100 font-black italic text-lg"
                                />
                                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-50">
                                    <p className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Verification Status</p>
                                    <p className="text-[10px] font-black text-slate-900 uppercase italic">Pending Manual Audit</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Pricing Config */}
                    <section className="space-y-8">
                        <div className="flex justify-between items-center px-2">
                             <Typography variant="h3" className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                                Revenue Architecture
                            </Typography>
                            {isPriceLocked && (
                                <div className="px-3 py-1 bg-amber-50 rounded-full flex items-center gap-2 border border-amber-100">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                                    <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Locked: Active Bookings</span>
                                </div>
                            )}
                        </div>

                        <div className={`p-8 rounded-[2.5rem] border shadow-sm transition-all duration-500 ${isPriceLocked ? "bg-slate-50 border-slate-100 grayscale-[0.5]" : "bg-white border-emerald-50 hover:shadow-xl hover:shadow-emerald-50"}`}>
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${isPriceLocked ? "bg-slate-200 text-slate-400" : "bg-emerald-500 text-white shadow-xl shadow-emerald-100"}`}>
                                        💰
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Strategy Index</p>
                                        <h4 className="text-sm font-black text-slate-900 uppercase italic tracking-tighter">
                                            {seasonalPrices.length > 0 ? "Seasonal + Base" : "Fixed Base Rate"}
                                        </h4>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    onClick={() => setIsPricingModalOpen(true)}
                                    className={`h-12 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${isPriceLocked ? "bg-slate-100 text-slate-400 pointer-events-none" : "bg-slate-900 text-white hover:bg-emerald-500"}`}
                                >
                                    MANAGE RATES →
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                <div className="p-5 bg-white rounded-2xl border border-slate-50">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Weekday (Base)</p>
                                    <p className="text-xl font-black text-slate-900 italic tracking-tighter">₹{prices.weekday}</p>
                                </div>
                                <div className="p-5 bg-white rounded-2xl border border-slate-50">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Weekend Pulse</p>
                                    <p className="text-xl font-black text-emerald-500 italic tracking-tighter">₹{prices.weekend}</p>
                                </div>
                                <div className="p-5 bg-white rounded-2xl border border-slate-50 col-span-2 sm:col-span-1">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Active Seasons</p>
                                    <p className="text-xl font-black text-emerald-600 italic tracking-tighter">{seasonalPrices.length}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </form>

                {/* Pricing Sub-Modal */}
                <Modal isOpen={isPricingModalOpen} onClose={() => setIsPricingModalOpen(false)}>
                    <div className="p-10 space-y-12 max-h-[85vh] overflow-y-auto no-scrollbar">
                        <header>
                            <div className="flex justify-between items-center mb-1">
                                <Typography variant="h2" className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">
                                    Revenue <span className="text-emerald-500">Configuration.</span>
                                </Typography>
                                <button onClick={() => setIsPricingModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all">✕</button>
                            </div>
                            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Pricing Strategy & Payout Index</p>
                        </header>

                        {/* Base Rates */}
                        {/* Pricing Matrix Header */}
                        <section className="space-y-6">
                            <div className="flex justify-between items-center px-4 py-6 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                                <div>
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight italic">Dynamic Matrix Optimization</h4>
                                    <p className="text-[9px] font-black text-emerald-400 mt-1 uppercase tracking-widest leading-relaxed">AI-Driven Yield Management</p>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setDynamicPricingEnabled(!dynamicPricingEnabled)}
                                    className={`w-14 h-8 rounded-full transition-all duration-500 relative flex items-center px-1 ${dynamicPricingEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-500 ${dynamicPricingEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </button>
                            </div>

                            <Typography variant="h3" className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] px-2">Primary Matrix (Per Unit)</Typography>
                            <div className="grid grid-cols-2 gap-6">
                                <Input
                                    label="Weekday (Mon-Thu)"
                                    name="weekday_price"
                                    type="number"
                                    value={String(prices.weekday)}
                                    onChange={(e) => handlePriceChange('weekday', Number(e.target.value))}
                                    className="h-16 rounded-2xl border-slate-100 font-black italic text-lg"
                                />
                                <Input
                                    label="Weekend (Fri-Sun)"
                                    name="weekend_price"
                                    type="number"
                                    value={String(prices.weekend)}
                                    onChange={(e) => handlePriceChange('weekend', Number(e.target.value))}
                                    className="h-16 rounded-2xl border-slate-100 font-black italic text-lg text-emerald-500"
                                />
                            </div>
                        </section>

                        {/* Seasonal Rates */}
                        <section className="space-y-6">
                            <div className="flex justify-between items-center px-2">
                                <Typography variant="h3" className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Temporal Delta (Seasons)</Typography>
                                <button 
                                    type="button" 
                                    onClick={addSeason} 
                                    className="text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:text-indigo-800 transition-colors"
                                >
                                    + ADD SEASON
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {seasonalPrices.map((season) => (
                                    <div key={season.id} className="p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 space-y-6 relative group/season">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <Input
                                                label="Season Name"
                                                name={`season_name_${season.id}`}
                                                value={season.seasonName}
                                                onChange={(e) => updateSeason(season.id, 'seasonName', e.target.value)}
                                                placeholder="Peak Summer"
                                                className="h-14 rounded-xl border-slate-100 text-[11px] font-black uppercase italic"
                                            />
                                            <Input
                                                label="Season Payout"
                                                name={`season_price_${season.id}`}
                                                type="number"
                                                value={String(season.price)}
                                                onChange={(e) => updateSeason(season.id, 'price', Number(e.target.value))}
                                                className="h-14 rounded-xl border-slate-100 text-lg font-black text-emerald-600 italic"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <Input
                                                label="Initiation Date"
                                                name={`season_start_${season.id}`}
                                                type="date"
                                                value={season.startDate}
                                                onChange={(e) => updateSeason(season.id, 'startDate', e.target.value)}
                                                className="h-14 rounded-xl border-slate-100 text-[10px] font-black uppercase"
                                            />
                                            <Input
                                                label="Termination Date"
                                                name={`season_end_${season.id}`}
                                                type="date"
                                                value={season.endDate}
                                                onChange={(e) => updateSeason(season.id, 'endDate', e.target.value)}
                                                className="h-14 rounded-xl border-slate-100 text-[10px] font-black uppercase"
                                            />
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => removeSeason(season.id)} 
                                            className="absolute top-4 right-6 w-8 h-8 rounded-full bg-white text-slate-200 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-all opacity-0 group-hover/season:opacity-100 shadow-sm"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                {seasonalPrices.length === 0 && (
                                    <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/20">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">No Seasonal Rule Applied</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <div className="pt-10 flex gap-4">
                            <Button
                                type="button"
                                onClick={() => setIsPricingModalOpen(false)}
                                className="flex-1 h-18 rounded-[2rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 transition-all active:scale-95"
                            >
                                SECURE REVENUE OPS
                            </Button>
                        </div>
                    </div>
                </Modal>

                {/* Footer Actions */}
                <div className="p-10 pt-4 bg-white/80 backdrop-blur-sm border-t border-slate-50">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                            type="submit" 
                            className="flex-[2] h-18 rounded-[2rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 active:scale-95 transition-all duration-500 hover:bg-emerald-500"
                        >
                            {initialData ? "UPDATE GLOBAL INVENTORY" : "WHITELIST SERVICE"}
                        </Button>
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={onCancel} 
                            className="flex-1 h-18 rounded-[2rem] border border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-rose-500 transition-all active:scale-95"
                        >
                            VOID CHANGES
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEditServiceForm;
