"use client";

import React from "react";
import Typography from "../../../components/atoms/Typography";

interface VendorAnalyticsProps {
  dict: any;
}

export default function VendorAnalytics({ dict }: VendorAnalyticsProps) {
  const res = dict.page.vendor_dashboard.analytics;

  // Mock analytics data
  const analytics = {
    revenue: {
      total: 125000,
      monthly: [15000, 18000, 22000, 19000, 25000, 21000],
      growth: 15.5
    },
    bookings: {
      total: 89,
      monthly: [12, 15, 18, 14, 22, 18],
      conversion: 68
    },
    customers: {
      total: 67,
      new: 23,
      returning: 44,
      topLocations: ['Delhi', 'Chandigarh', 'Mumbai']
    },
    services: {
      topPerforming: [
        { name: 'Mountain View Room', bookings: 25, revenue: 87500 },
        { name: 'Paragliding Adventure', bookings: 18, revenue: 63000 },
        { name: 'Taxi Service', bookings: 15, revenue: 37500 }
      ]
    }
  };

  const months = res.months;

  return (
    <div className="space-y-10">
      {/* Visual Data Landscape */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Engine Chart */}
        <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm transition-all duration-700 hover:shadow-2xl hover:shadow-slate-100 group">
          <div className="flex justify-between items-start mb-12">
            <div>
              <Typography variant="h3" className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">
                {res.revenue.title} Flow
              </Typography>
              <div className="text-4xl font-black text-slate-900 italic tracking-tighter">₹{analytics.revenue.total.toLocaleString()}</div>
            </div>
            <div className="bg-emerald-500 px-4 py-2 rounded-2xl shadow-lg shadow-emerald-100 animate-in zoom-in-95 duration-700 delay-500 fill-mode-forwards text-center">
              <span className="text-white font-black text-[10px] uppercase tracking-widest">+{analytics.revenue.growth}%</span>
            </div>
          </div>
          
          {/* Minimalist Bar Chart */}
          <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2">
            {analytics.revenue.monthly.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center group/bar">
                <div className="relative w-full h-full flex items-end">
                  <div
                    className="bg-slate-50 group-hover/bar:bg-emerald-500 rounded-xl w-full transition-all duration-700 relative overflow-hidden group-hover/bar:scale-105"
                    style={{ height: `${(value / 25000) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/20 to-transparent opacity-0 group-hover/bar:opacity-100 duration-700"></div>
                  </div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-3 py-1.5 rounded-full opacity-0 group-hover/bar:opacity-100 transition-all duration-500 whitespace-nowrap z-10 shadow-xl -translate-y-2 group-hover/bar:translate-y-0">
                    ₹{value.toLocaleString()}
                  </div>
                </div>
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-6 group-hover/bar:text-slate-900 transition-colors duration-500">{months[index]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bookings Pulse */}
        <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm transition-all duration-700 hover:shadow-2xl hover:shadow-slate-100 group">
          <div className="flex justify-between items-start mb-12">
            <div>
              <Typography variant="h3" className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">
                {res.bookings.title} Pulse
              </Typography>
              <div className="text-4xl font-black text-slate-900 italic tracking-tighter">{analytics.bookings.total} <span className="text-sm font-bold text-slate-300 not-italic uppercase tracking-widest ml-2">Bookings</span></div>
            </div>
            <div className="bg-indigo-600 px-4 py-2 rounded-2xl shadow-lg shadow-indigo-100 text-center">
              <span className="text-white font-black text-[10px] uppercase tracking-widest">{analytics.bookings.conversion}% CR</span>
            </div>
          </div>

          {/* Minimalist Bar Chart */}
          <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2">
            {analytics.bookings.monthly.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center group/bar">
                <div className="relative w-full h-full flex items-end">
                  <div
                    className="bg-slate-50 group-hover/bar:bg-indigo-600 rounded-xl w-full transition-all duration-700 relative overflow-hidden group-hover/bar:scale-105"
                    style={{ height: `${(value / 25) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-800/20 to-transparent opacity-0 group-hover/bar:opacity-100 duration-700"></div>
                  </div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-3 py-1.5 rounded-full opacity-0 group-hover/bar:opacity-100 transition-all duration-500 whitespace-nowrap z-10 shadow-xl -translate-y-2 group-hover/bar:translate-y-0">
                    {value} Units
                  </div>
                </div>
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-6 group-hover/bar:text-slate-900 transition-colors duration-500">{months[index]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Geography Trace */}
        <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
          <Typography variant="h3" className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-10 px-2">
            Guest Geography
          </Typography>
          <div className="space-y-6 relative z-10 px-2">
            {analytics.customers.topLocations.map((location, index) => (
              <div key={location} className="flex justify-between items-center group/item">
                <div className="flex items-center gap-5">
                  <span className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-[10px] font-black group-hover/item:bg-slate-900 group-hover/item:text-white transition-all duration-500">0{index + 1}</span>
                  <span className="font-black text-slate-900 uppercase text-xs tracking-tight italic group-hover/item:text-indigo-600 transition-colors">{location}</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-24 h-1 bg-slate-50 rounded-full overflow-hidden hidden sm:block">
                        <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${100 - index * 20}%` }}></div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">45 Bookings</span>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-slate-50 rounded-full group-hover:bg-slate-100/50 transition-colors duration-1000"></div>
        </div>

        {/* Leading Listings */}
        <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
          <Typography variant="h3" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 px-2 relative z-10">
            Leading Listings
          </Typography>
          <div className="space-y-4 relative z-10">
            {analytics.services.topPerforming.map((service, index) => (
              <div key={service.name} className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/5 group/item hover:bg-white/10 transition-all duration-500">
                <div className="flex items-center gap-6">
                  <span className="text-2xl font-black text-white/10 group-hover/item:text-indigo-400 transition-colors italic tracking-tighter">0{index + 1}</span>
                  <div>
                    <div className="font-black text-white uppercase tracking-tight mb-2 italic text-[11px] group-hover/item:text-indigo-600 transition-colors">{service.name}</div>
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">{service.bookings} Sessions Complete</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-emerald-400 italic tracking-tighter">₹{service.revenue.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-1000"></div>
        </div>
      </div>

      {/* Protocol Health Trace */}
      <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm animate-in fade-in duration-1000 delay-500 fill-mode-forwards">
        <Typography variant="h3" className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-12 px-2">
          Protocol Health Trace
        </Typography>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
              { label: res.metrics.rating, val: '4.7', sub: 'Global Rank 04', color: 'text-emerald-500' },
              { label: res.metrics.response, val: '2.3h', sub: 'Ops Latency', color: 'text-indigo-600' },
              { label: res.metrics.completion, val: '94%', sub: 'SLA Adherence', color: 'text-purple-600' },
              { label: res.metrics.avg_value, val: '₹2.8K', sub: 'Unit Yield', color: 'text-slate-900' }
          ].map((metric, i) => (
            <div key={i} className="text-center group border-r border-slate-50 last:border-0 hover:scale-105 transition-transform duration-500">
                <div className={`text-4xl font-black ${metric.color} mb-3 italic tracking-tighter`}>{metric.val}</div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{metric.label}</div>
                <div className="text-[7px] font-black text-slate-200 uppercase tracking-[0.3em]">{metric.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}