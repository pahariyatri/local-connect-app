"use client";

import React from "react";

interface DateRangePickerProps {
  startDate: string | null;
  endDate: string | null;
  onDateChange: (startDate: string, endDate: string) => void;
}

interface DatePreset {
  id: string;
  label: string;
  subLabel: string;
  icon: React.ReactNode;
  getDateRange: () => { start: string; end: string };
}

const DATE_PRESETS = (dict: any): DatePreset[] => { // eslint-disable-line @typescript-eslint/no-explicit-any
  const p = dict?.page?.common?.date_picker || {};
  return [
    {
      id: "this-weekend",
      label: p.this_weekend || "This Weekend",
      subLabel: p.fri_sun || "Fri - Sun",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M16 14h2v2h-2z"/></svg>
      ),
      getDateRange: () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
        const friday = new Date(today);
        friday.setDate(today.getDate() + (daysUntilFriday === 0 ? 0 : daysUntilFriday));
        const sunday = new Date(friday);
        sunday.setDate(friday.getDate() + 2);
        return { start: friday.toISOString().split('T')[0], end: sunday.toISOString().split('T')[0] };
      },
    },
    {
      id: "next-weekend",
      label: p.next_weekend || "Next Weekend",
      subLabel: p.fri_sun || "Fri - Sun",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M12 14h2v2h-2z"/></svg>
      ),
      getDateRange: () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const daysUntilNextFriday = ((5 - dayOfWeek + 7) % 7) + 7;
        const friday = new Date(today);
        friday.setDate(today.getDate() + daysUntilNextFriday);
        const sunday = new Date(friday);
        sunday.setDate(friday.getDate() + 2);
        return { start: friday.toISOString().split('T')[0], end: sunday.toISOString().split('T')[0] };
      },
    },
  ];
};

export default function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
  dict
}: DateRangePickerProps & { dict: any }) {

  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  
  const presets = DATE_PRESETS(dict);
  const p = dict?.page?.common?.date_picker || {};

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = clickedDate.toISOString().split('T')[0];

    if (!startDate || (startDate && endDate)) {
      onDateChange(dateStr, "");
    } else {
      if (dateStr < startDate) {
        onDateChange(dateStr, startDate);
      } else {
        onDateChange(startDate, dateStr);
      }
      setIsModalOpen(false);
    }
  };

  const isBetween = (day: number) => {
    if (!startDate || !endDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
    return date > startDate && date < endDate;
  };

  const isSelected = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
    return date === startDate || date === endDate;
  };

  const renderCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth);
    const startOffset = firstDayOfMonth(currentMonth);
    const monthYear = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    for (let i = 0; i < startOffset; i++) {
        days.push(<div key={`empty-${i}`} className="h-12 w-full" />);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d).toISOString().split('T')[0];
      const selected = isSelected(d);
      const between = isBetween(d);
      const isPast = dateStr < todayStr;

      days.push(
        <button
          key={d}
          disabled={isPast}
          onClick={() => handleDateClick(d)}
          className={`h-12 w-full relative flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
            isPast ? "text-slate-200 cursor-not-allowed" :
            selected ? "bg-slate-900 text-white z-10 shadow-lg scale-110" :
            between ? "bg-emerald-50 text-emerald-600 rounded-none first:rounded-l-xl last:rounded-r-xl" :
            "text-slate-600 hover:bg-slate-50"
          }`}
        >
          {d}
          {dateStr === todayStr && !selected && (
              <div className="absolute bottom-1.5 w-1 h-1 bg-emerald-500 rounded-full" />
          )}
        </button>
      );
    }
    return { days, monthYear };
  };

  const getDaysDifference = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { days, monthYear } = renderCalendar();
  const nights = getDaysDifference();

  const handleDateSelection = (day: number) => {
    handleDateClick(day);
    // If we just selected the end date (or it was already selected and we're starting fresh)
    // we don't necessarily auto-close unless the user is done. 
    // Usually better to let them confirm or auto-close when both are set.
  };

  // Effect to auto-close when range is full (optional UX choice)
  React.useEffect(() => {
    if (startDate && endDate && isModalOpen) {
       // Optional: setTimeout(() => setIsModalOpen(false), 300);
    }
  }, [startDate, endDate, isModalOpen]);

  return (
    <div className="pt-4 sm:pt-6 space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* 1. Personalized Preset Cards - Extreme compact on mobile, wide on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {presets.map((preset) => {
              const isSelected = startDate === preset.getDateRange().start && endDate === preset.getDateRange().end;
              return (
                <button
                    key={preset.id}
                    onClick={() => onDateChange(preset.getDateRange().start, preset.getDateRange().end)}
                    className={`
                        relative h-28 sm:h-36 rounded-2xl sm:rounded-[2rem] border-2 transition-all p-3 sm:p-6 text-left flex flex-col justify-end group active:scale-95 overflow-hidden
                        ${isSelected ? "border-slate-900 shadow-lg bg-slate-900 text-white" : "border-slate-50 hover:border-slate-200 shadow-sm bg-white text-slate-600"}
                    `}
                >
                    <div className={`
                        absolute -right-2 -top-2 w-20 sm:w-28 h-20 sm:h-28 rounded-full blur-xl sm:blur-2xl opacity-10 transition-all duration-700
                        ${isSelected ? "bg-white scale-150" : "bg-slate-200"}
                    `} />

                    <div className={`
                        w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl flex items-center justify-center text-sm sm:text-lg mb-2 sm:mb-4 transition-all duration-500 relative z-10
                        ${isSelected ? "bg-white/20 text-white shadow-md rotate-3" : "bg-slate-50 text-slate-400 group-hover:scale-110 group-hover:rotate-6"}
                    `}>
                        {preset.icon}
                    </div>

                    <div className="relative z-10">
                        <p className={`text-[7px] sm:text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 opacity-60`}>{preset.subLabel}</p>
                        <h3 className={`font-black text-xs sm:text-lg leading-tight truncate`}>{preset.label}</h3>
                    </div>
                </button>
              );
          })}
      </div>

      <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-white text-[8px] font-black text-slate-200 uppercase tracking-widest italic">
              {p.manual_selection || "manual selection"}
            </span>
          </div>
      </div>

      {/* 2. Premium Trigger Button - Ultra compact mobile */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="w-full group relative bg-white border-2 border-slate-50 hover:border-slate-200 rounded-2xl sm:rounded-[2rem] p-3 sm:p-6 shadow-md shadow-slate-100/50 transition-all active:scale-[0.98] text-left overflow-hidden"
      >
          <div className="absolute top-0 right-0 w-20 sm:w-28 h-20 sm:h-28 bg-emerald-50 rounded-full blur-3xl -mr-4 -mt-4 opacity-50 group-hover:scale-150 transition-transform duration-1000" />
          
          <div className="flex items-center justify-between relative z-10">
              <div className="flex-1">
                  <span className="text-[7px] sm:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 block">{p.trip_timeline || "Trip Timeline"}</span>
                  <div className="flex items-center gap-2 sm:gap-4">
                      <div className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                          {startDate ? new Date(startDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : (p.arriving || "Arriving")}
                      </div>
                      <div className="w-3 sm:w-6 h-[1.5px] bg-slate-100" />
                      <div className="text-base sm:text-xl font-black text-slate-900 tracking-tight opacity-40">
                          {endDate ? new Date(endDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : (p.leaving || "Leaving")}
                      </div>
                  </div>
              </div>
              
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center shadow-md group-hover:rotate-6 transition-transform">
                  <span className="text-sm sm:text-lg font-black leading-none">{nights > 0 ? nights : "—"}</span>
                  <span className="text-[5px] sm:text-[6px] font-black uppercase tracking-widest leading-none mt-0.5">{p.nights || "Nights"}</span>
              </div>
          </div>
      </button>

      {/* 3. Simple Luxury Modal - Restricted within Header/Footer viewport */}
      {isModalOpen && (
          <div className="fixed top-[75px] sm:top-[95px] bottom-[105px] sm:bottom-[115px] left-0 right-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
              {/* Premium Backdrop */}
              <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                onClick={() => setIsModalOpen(false)}
              />
              
              <div className="relative w-full max-w-[340px] bg-white rounded-[2rem] shadow-[0_24px_80px_rgba(0,0,0,0.12)] border border-slate-100 p-8 animate-in zoom-in-95 duration-500 overflow-hidden">
                  <div className="space-y-6">
                      <div className="flex items-center justify-between mb-2">
                          <h3 className="font-black text-slate-900 text-xs tracking-widest uppercase">{monthYear}</h3>
                          <div className="flex gap-1.5">
                              <button 
                                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                                className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] border border-slate-100/50"
                              >←</button>
                              <button 
                                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                                className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] border border-slate-100/50"
                              >→</button>
                          </div>
                      </div>

                      <div className="grid grid-cols-7 text-center mb-1">
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                              <div key={`${d}-${i}`} className="text-[9px] font-black text-slate-200">{d}</div>
                          ))}
                      </div>

                      <div className="grid grid-cols-7 gap-y-1 select-none">
                          {days}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
