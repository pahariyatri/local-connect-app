"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useNotification } from "@/contexts/NotificationContext";
import { useTripPlanner, ItineraryStop } from "@/contexts/TripPlannerContext";
import Typography from "../components/atoms/Typography";
import Button from "../components/atoms/Button";
import TopNavigation from "../components/organisms/TopNavigation";
import BottomNavigation from "../components/organisms/BottomNavigation";
import LocalImage from "../components/atoms/Image";
import Input from "../components/atoms/Input";
import DateRangePicker from "../builder/components/DateRangePicker";

const SUGGESTED_ROAD_TRIP_STOPS: ItineraryStop[] = [
    { id: "s1", day: 1, time: "01:00 PM", activity: "Riverside Dhaba Lunch", type: "food", location: "On way to Manali" },
    { id: "s2", day: 1, time: "08:00 PM", activity: "Night Club / Bar Visit", type: "activity", location: "Old Manali" },
    { id: "s3", day: 2, time: "10:00 AM", activity: "Solang Valley Exploration", type: "activity", location: "Solang" },
    { id: "s4", day: 2, time: "01:30 PM", activity: "Local Dhaba Lunch", type: "food", location: "Solang Outskirts" },
    { id: "s5", day: 3, time: "11:00 AM", activity: "Souvenir Shopping", type: "other", location: "Mall Road" }
];

type RoadMapItem = {
    id: string;
    day: number;
    time: string;
    type: ItineraryStop["type"] | string;
    isService: boolean;
    activity?: string;
    name?: string;
    location?: string;
    image?: string;
    price?: number;
    category?: string;
};

import { useLocalizationContext } from "@/contexts/LocalizationContext";

export default function JourneyPage() {
    const { cart, removeFromCart, totalPrice } = useCart();
    const { showNotification } = useNotification();
    const { stops, addStop, removeStop, origin, startDate, endDate, setStartDate, setEndDate, setBasicInfo } = useTripPlanner();
    const router = useRouter();
    const params = useParams();
    const { dict, loading } = useLocalizationContext();
    const pathLang = params.lang || "en";

    const [activeDay, setActiveDay] = useState(1);
    const [isBooking, setIsBooking] = useState(false);
    const [bookingSuccess] = useState(false);
    const [isAddingStop, setIsAddingStop] = useState(false);
    const [isEditingDates, setIsEditingDates] = useState(false);
    const [newStop, setNewStop] = useState<Omit<ItineraryStop, "id">>({ activity: "", time: "12:00 PM", day: 1, type: "food" });

    const journey = dict?.page?.journey || {};


    // Pre-populate with user's specific request if empty
    useEffect(() => {
        if (stops.length === 0 && !origin) {
            const today = new Date().toISOString().split('T')[0];
            const inThreeDays = new Date();
            inThreeDays.setDate(inThreeDays.getDate() + 3);
            setBasicInfo("Chandigarh", ["Manali"], today, inThreeDays.toISOString().split('T')[0]);
            SUGGESTED_ROAD_TRIP_STOPS.forEach(stop => addStop(stop));
        }
    }, [stops.length, origin, setBasicInfo, addStop]);

    const handleBooking = () => {
        setIsBooking(true);
        setTimeout(() => {
            router.push(`/${pathLang}/booking-status`);
        }, 1500);
    };

    const handleAddStop = () => {
        addStop(newStop);
        setIsAddingStop(false);
        setNewStop({ activity: "", time: "12:00 PM", day: activeDay, type: "food" });
        showNotification(journey.stop_added_msg || "Stop added to your roadmap!", "success");
    };

    const filteredItinerary = ([
        ...cart.map(item => ({ ...item, isService: true, day: 1, time: "09:00 AM", type: item.category.toLowerCase() as ItineraryStop["type"] })),
        ...stops.map(stop => ({ ...stop, isService: false }))
    ] as RoadMapItem[]).filter(item => item.day === activeDay)
     .sort((a, b) => a.time.localeCompare(b.time));

    const copyShareLink = () => {
        const shareUrl = `${window.location.origin}/${pathLang}/journey/view?tripId=hp-road-trip-123`;
        navigator.clipboard.writeText(shareUrl);
        showNotification(journey.copy_link_msg || "Share link copied to clipboard!", "success");
    };

    if (bookingSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
                <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center text-4xl mb-8 animate-bounce transition-all">
                    🎉
                </div>
                <Typography variant="h2" className="text-3xl font-black text-slate-900 text-center mb-4">
                    {journey.published}
                </Typography>
                <p className="text-slate-500 text-center mb-10 max-w-sm font-medium">
                    {journey.published_sub}
                </p>
                <div className="flex flex-col gap-4 w-full max-w-xs">
                    <Button onClick={() => router.push(`/${pathLang}/profile`)} className="w-full h-16 rounded-2xl shadow-xl shadow-indigo-100">{journey.view_trips}</Button>
                    <Button variant="ghost" onClick={copyShareLink} className="w-full h-16 rounded-2xl text-indigo-600 font-black">{journey.copy_link}</Button>
                </div>
            </div>
        );
    }

    if (!dict) return <div className="min-h-screen bg-slate-50" />;

    return (
        <div className="min-h-screen bg-slate-50 pb-40">
            <TopNavigation title={journey.title || "Trip Architect"} />
            
            <main className="max-w-md mx-auto px-6 pt-24">
                <header className="mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase rounded-md">{journey.badge}</span>
                                <button 
                                    onClick={() => setIsEditingDates(!isEditingDates)}
                                    className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                                >
                                    {startDate} — {endDate} ✎
                                </button>
                            </div>
                            <Typography variant="h1" className="text-3xl font-black text-slate-900 leading-tight">
                                {origin || "Chandigarh"} → {"Manali"}
                            </Typography>
                        </div>
                        <button className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-50 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
                        </button>
                    </div>
                </header>

                {isEditingDates && dict && (
                    <div className="mb-10 p-6 bg-white rounded-[2.5rem] shadow-xl border border-indigo-50 animate-slide-down">
                        <DateRangePicker 
                            startDate={startDate} 
                            endDate={endDate} 
                            onDateChange={(s, e) => {
                                setStartDate(s);
                                setEndDate(e);
                                setIsEditingDates(false);
                            }} 
                            dict={dict}
                        />
                    </div>
                )}

                {/* 📅 Day Tabs */}
                <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {[1, 2, 3].map(day => (
                        <button 
                            key={day}
                            onClick={() => setActiveDay(day)}
                            className={`px-8 py-3 rounded-2xl font-black text-sm transition-all whitespace-nowrap min-w-[100px] ${
                                activeDay === day 
                                ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                                : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"
                            }`}
                        >
                            {journey.day_label?.replace("{day}", day.toString()) || `Day ${day}`}
                        </button>
                    ))}
                    <button className="px-5 py-3 rounded-2xl font-black text-sm bg-indigo-50 text-indigo-600 border border-indigo-100 whitespace-nowrap">
                        {journey.add_day}
                    </button>
                </div>

                {/* 🤖 AI Suggestion Chip */}
                <div className="mb-8 p-5 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10 flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl">🤖</div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">{journey.ai_insight}</p>
                            <p className="text-xs font-bold leading-tight">{journey.ai_tip}</p>
                        </div>
                        <button className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </button>
                    </div>
                </div>

                {/* 🗺️ Roadmap Section */}
                <section className="relative">
                    <div className="flex justify-between items-center mb-6">
                        <Typography variant="h3" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">{journey.schedule?.replace("{day}", activeDay.toString())}</Typography>
                        <button 
                            onClick={() => {
                                setNewStop({ ...newStop, day: activeDay });
                                setIsAddingStop(true);
                            }}
                            className="text-emerald-600 text-[10px] font-black uppercase tracking-wider hover:underline"
                        >
                            {journey.quick_add}
                        </button>
                    </div>
                    
                    <div className="space-y-0 relative min-h-[400px]">
                        {filteredItinerary.length === 0 ? (
                             <div className="text-center py-20 bg-white/40 rounded-[2.5rem] border border-dashed border-slate-200">
                                <div className="text-4xl mb-4">🏔️</div>
                                <Typography variant="h3" className="text-sm font-black text-slate-900 mb-1">{journey.empty}</Typography>
                                <p className="text-slate-400 text-[10px] font-bold uppercase mb-6">{journey.empty_sub}</p>
                                <Button size="small" variant="ghost" onClick={() => setIsAddingStop(true)}>{journey.add_first}</Button>
                            </div>
                        ) : (
                            filteredItinerary.map((item: RoadMapItem, idx) => {
                                return (
                                <div key={item.id || idx} className="relative pl-12 pb-10 last:pb-0 group">
                                    {/* Vertical Connector */}
                                    {idx !== filteredItinerary.length - 1 && (
                                        <div className="absolute left-[15px] top-10 bottom-0 w-[2px] bg-slate-200 group-hover:bg-indigo-300 transition-colors rounded-full opacity-60"></div>
                                    )}
                                    
                                    {/* Node Label (Time) */}
                                    <div className="absolute left-0 top-1.5 w-8 h-8 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[9px] font-black text-slate-500 z-10 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                        {item.time.split(' ')[0]}
                                    </div>

                                    <div className={`premium-card p-5 hover:border-indigo-200 transition-all ${!item.isService ? 'bg-white shadow-sm border-white' : 'bg-white shadow-xl shadow-indigo-50 border-indigo-50'}`}>
                                        <div className="flex gap-4">
                                            {item.image ? (
                                                <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-slate-100 shadow-inner">
                                                    <LocalImage src={item.image || ""} alt={item.name || ""} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                                                    item.type === 'food' ? 'bg-amber-50 text-amber-600' : 
                                                    item.type === 'activity' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                                                }`}>
                                                    {item.type === 'food' ? '🍲' : item.type === 'activity' ? '🏃' : '🏠'}
                                                </div>
                                            )}
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-black text-slate-900 text-sm truncate uppercase tracking-tight">{item.name || item.activity}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] font-bold text-slate-400">{item.location || "Location TBD"}</span>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => item.isService ? removeFromCart(item.id) : removeStop(item.id)}
                                                        className="p-1 -mr-1 text-slate-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                                    </button>
                                                </div>
                                                
                                                {!item.isService && (
                                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
                                                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{item.type}</span>
                                                        <button 
                                                            onClick={() => router.push(`/${pathLang}/search?category=${item.type}`)}
                                                            className="text-[9px] font-black text-emerald-600 uppercase flex items-center gap-1 hover:underline"
                                                        >
                                                            {journey.book_expert}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Smart Suggestion Logic */}
                                    {item.type === 'activity' && (
                                        <div className="mt-3 ml-2 p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between animate-pulse">
                                            <div className="flex items-center gap-3">
                                                <div className="text-lg">🤝</div>
                                                <div>
                                                    <p className="text-[9px] font-black text-indigo-900 uppercase">{journey.broker_rec}</p>
                                                    <p className="text-[10px] font-bold text-indigo-600">Local Guide: Rakesh (4.9★)</p>
                                                </div>
                                            </div>
                                            <Button size="small" variant="ghost" className="text-indigo-600 h-6 px-3 text-[9px] font-black">{journey.hire}</Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                        )}
                    </div>
                </section>

                {/* 💳 Finalize Action Bar */}
                <div className="fixed bottom-24 left-0 right-0 px-6 z-50">
                    <div className="max-w-md mx-auto glass p-6 rounded-[2.5rem] border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-between bg-gradient-to-r from-indigo-900 to-slate-900 text-white">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{journey.total_trip}</p>
                            <p className="text-2xl font-black">₹{totalPrice + Math.round(totalPrice * 0.05)}</p>
                        </div>
                        <Button 
                            onClick={handleBooking} 
                            className="bg-emerald-500 hover:bg-emerald-600 h-14 px-8 rounded-2xl font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-sm"
                            disabled={isBooking}
                        >
                            {isBooking ? journey.requesting : journey.request_booking}
                        </Button>
                    </div>
                </div>
            </main>

            {/* ➕ Modal (Refined Mobile Feel) */}
            {isAddingStop && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md rounded-t-[3rem] p-8 pb-12 shadow-2xl animate-slide-up relative">
                        {/* Swipe Handle */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-100 rounded-full"></div>
                        
                        <div className="flex justify-between items-center mb-8 pt-2">
                            <Typography variant="h3" className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                                {journey.add_stop_modal?.title?.replace("{day}", activeDay.toString())}
                            </Typography>
                            <button onClick={() => setIsAddingStop(false)} className="bg-slate-50 p-2 rounded-xl text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">{journey.add_stop_modal?.name_label}</label>
                                <Input 
                                    name="stopName"
                                    placeholder={journey.add_stop_modal?.name_placeholder} 
                                    value={newStop.activity}
                                    onChange={(e)=> setNewStop({...newStop, activity: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">{journey.add_stop_modal?.time_label}</label>
                                    <select 
                                        className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 font-bold outline-none text-sm"
                                        value={newStop.time}
                                        onChange={(e)=> setNewStop({...newStop, time: e.target.value})}
                                    >
                                        <option>08:00 AM</option>
                                        <option>10:00 AM</option>
                                        <option>12:00 PM</option>
                                        <option>02:00 PM</option>
                                        <option>04:00 PM</option>
                                        <option>06:00 PM</option>
                                        <option>08:00 PM</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">{journey.add_stop_modal?.category_label}</label>
                                    <select 
                                        className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 font-bold outline-none text-sm"
                                        value={newStop.type}
                                        onChange={(e)=> setNewStop({...newStop, type: e.target.value as ItineraryStop["type"]})}
                                    >
                                        <option value="food">🍱 Food/Drink</option>
                                        <option value="activity">🏃 Activity</option>
                                        <option value="stay">🏠 Stay</option>
                                        <option value="travel">🚗 Travel</option>
                                    </select>
                                </div>
                            </div>
                            <Button onClick={handleAddStop} className="w-full h-18 rounded-2xl mt-4 font-black bg-slate-900">{journey.add_stop_modal?.submit}</Button>
                        </div>
                    </div>
                </div>
            )}

            <BottomNavigation />
        </div>
    );
}
