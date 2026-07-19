"use client";

import React, { useState } from "react";
import Typography from "../../components/atoms/Typography";
import Button from "../../components/atoms/Button";

const CALENDAR_DAYS = Array.from({ length: 28 }, (_, i) => i + 1);
const BOOKINGS_MAP: Record<number, string[]> = {
    18: ["B-101: Ankit Sharma (Homestay)"],
    19: ["B-102: Priya Singh (Rafting)"],
    20: ["B-103: Rahul Varma (Paragliding)"],
};

export default function VendorCalendar() {
  const [selectedDay, setSelectedDay] = useState(18);

  return (
    <div className="max-w-md mx-auto">
        <header className="mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <Typography variant="h1" className="text-4xl font-black text-slate-900 leading-tight">
                Booking <span className="text-emerald-500">Schedule.</span>
            </Typography>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Manage your availability</p>
        </header>

        {/* Month Selector */}
        <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
            <Typography variant="h2" className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">February 2026</Typography>
            <div className="flex gap-2">
                <button className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors shadow-sm">←</button>
                <button className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors shadow-sm">→</button>
            </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white p-6 sm:p-8 rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                    <div key={i} className="text-[10px] font-black text-slate-300 text-center mb-4 uppercase tracking-[0.2em]">{day}</div>
                ))}
                {CALENDAR_DAYS.map((day) => {
                    const hasBooking = BOOKINGS_MAP[day];
                    const isSelected = selectedDay === day;
                    return (
                        <button 
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`h-16 rounded-[1.25rem] sm:rounded-[1.5rem] flex flex-col items-center justify-center transition-all duration-500 relative group overflow-hidden ${
                                isSelected ? "bg-slate-900 text-white shadow-2xl shadow-slate-300 scale-105 z-10" : 
                                hasBooking ? "bg-emerald-50 text-emerald-500 hover:bg-emerald-100" : "bg-slate-50/50 text-slate-400 hover:bg-slate-100"
                            }`}
                        >
                            <span className={`text-[11px] sm:text-xs font-black transition-transform duration-500 ${isSelected ? "scale-110" : "group-hover:scale-110"}`}>{day}</span>
                            {hasBooking && !isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute bottom-3 animate-pulse"></span>
                            )}
                            {isSelected && (
                                <div className="absolute top-0 right-0 w-8 h-8 bg-white/10 rounded-full blur-xl translate-x-1/2 -translate-y-1/2"></div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Day Agenda */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-300">
            <div className="flex items-center justify-between mb-8 px-2">
                <div>
                    <Typography variant="h3" className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] leading-none mb-1.5">Agenda for Feb {selectedDay}</Typography>
                    <p className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                        {BOOKINGS_MAP[selectedDay] ? `${BOOKINGS_MAP[selectedDay].length} Activities` : "No Sessions"}
                    </p>
                </div>
                <button className="px-5 py-2.5 rounded-xl border border-rose-100 text-rose-500 bg-rose-50/50 hover:bg-rose-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest active:scale-95 shadow-sm">
                    BLOCK DAY
                </button>
            </div>

            {BOOKINGS_MAP[selectedDay] ? (
                <div className="space-y-4">
                    {BOOKINGS_MAP[selectedDay].map((booking, i) => (
                        <div key={i} className="group p-8 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-between hover:border-emerald-100 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-slate-100">
                           <div className="flex gap-5 items-center">
                                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-xl shadow-lg shadow-slate-200">
                                    <span className="group-hover:scale-125 transition-transform duration-500">⚡</span>
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 tracking-tight uppercase text-sm leading-tight">{booking.split(":")[1]}</h4>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{booking.split(":")[0]}</p>
                                </div>
                           </div>
                           <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-inner group-hover:translate-x-1 duration-500">→</button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-16 text-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/30">
                    <span className="text-5xl opacity-20 block mb-6 animate-bounce">🏔️</span>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Open Availability</p>
                </div>
            )}
        </div>

        {/* Legend */}
        <div className="flex gap-8 justify-center pb-10">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Booked</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Selected</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-50 border border-slate-200"></div>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Open</span>
            </div>
        </div>
    </div>
  );
}
