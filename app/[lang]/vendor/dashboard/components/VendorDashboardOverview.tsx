"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Typography from "../../../components/atoms/Typography";

interface VendorDashboardOverviewProps {
  dict: any;
}

export default function VendorDashboardOverview({ dict }: VendorDashboardOverviewProps) {
  const params = useParams();
  const lang = params.lang || "en";
  const res = dict.page.vendor_dashboard;

  const stats = {
    totalServices: 12,
    activeBookings: 8,
    totalRevenue: 45000,
    averageRating: 4.7,
    pendingBookings: 3,
    completedBookings: 45
  };

  const recentBookings = [
    { id: '1', customer: 'John Doe', service: 'Mountain View Room', date: '2026-02-25', status: 'confirmed' },
    { id: '2', customer: 'Jane Smith', service: 'Paragliding Adventure', date: '2026-02-24', status: 'pending' },
    { id: '3', customer: 'Mike Johnson', service: 'Taxi to Manali', date: '2026-02-23', status: 'completed' }
  ];

  const getStatusLabel = (status: string) => {
    switch(status.toLowerCase()) {
      case 'confirmed': return res.recent_bookings.status.confirmed;
      case 'pending': return res.recent_bookings.status.pending;
      case 'completed': return res.recent_bookings.status.completed;
      default: return status;
    }
  };

  return (
    <div className="space-y-10">
      {/* Visual Analytics Grid - Now Interactive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { label: res.stats.services, val: stats.totalServices, icon: '🏨', color: 'text-indigo-600', bg: 'bg-indigo-50', route: `/${lang}/vendor/services` },
            { label: res.stats.bookings, val: stats.activeBookings, icon: '📅', color: 'text-emerald-600', bg: 'bg-emerald-50', route: `/${lang}/vendor/bookings` },
            { label: res.stats.revenue, val: `₹${stats.totalRevenue.toLocaleString()}`, icon: '💰', color: 'text-slate-900', bg: 'bg-slate-100', route: `/${lang}/vendor/payouts` },
            { label: res.stats.rating, val: stats.averageRating, icon: '⭐', color: 'text-amber-500', bg: 'bg-amber-50', route: `/${lang}/vendor/services` }
        ].map((stat, i) => (
            <Link key={i} href={stat.route} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all duration-700 group">
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center text-2xl mb-6 shadow-inner group-hover:rotate-6 transition-transform duration-500`}>
                    {stat.icon}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color} italic tracking-tighter`}>{stat.val}</p>
            </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Streamlined Activity */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <Typography variant="h3" className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                {res.recent_bookings.title}
            </Typography>
            <Link href={`/${lang}/vendor/bookings`} className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700 transition-colors">
                View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentBookings.map(booking => (
              <div key={booking.id} className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm transition-all duration-500 hover:border-indigo-100 group">
                <div className="flex-1">
                  <div className="font-black text-slate-900 uppercase tracking-tighter text-[11px] group-hover:text-indigo-600 transition-colors">{booking.customer}</div>
                  <div className="text-[10px] font-bold text-slate-400 mt-0.5">{booking.service}</div>
                </div>
                <div className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                  booking.status === 'confirmed' ? 'bg-emerald-500 text-white' :
                  booking.status === 'pending' ? 'bg-indigo-600 text-white animate-pulse' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  {getStatusLabel(booking.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Engine - Now Linked */}
        <div className="space-y-6">
          <Typography variant="h3" className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] px-2">
            {res.quick_actions.title}
          </Typography>
          <div className="grid grid-cols-2 gap-3">
            {[
                { title: res.quick_actions.add_service.title, icon: '➕', desc: res.quick_actions.add_service.desc, route: `/${lang}/vendor/services` },
                { title: res.quick_actions.view_reports.title, icon: '📊', desc: res.quick_actions.view_reports.desc, route: `/${lang}/vendor/dashboard` },
                { title: res.quick_actions.messages.title, icon: '💬', desc: res.quick_actions.messages.desc, route: `/${lang}/vendor/dashboard` },
                { title: res.quick_actions.settings.title, icon: '⚙️', desc: res.quick_actions.settings.desc, route: `/${lang}/vendor/dashboard` }
            ].map((action, i) => (
                <Link key={i} href={action.route} className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50 hover:border-indigo-100 transition-all duration-500 text-left group">
                    <div className="text-xl mb-4 group-hover:scale-125 transition-transform duration-500">{action.icon}</div>
                    <div className="font-black text-slate-900 uppercase tracking-tighter text-[11px] italic mb-1 group-hover:text-indigo-600 transition-colors">{action.title}</div>
                    <div className="text-[8px] font-bold text-slate-300 uppercase leading-snug tracking-wider">{action.desc}</div>
                </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Efficiency Index */}
      <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
        <Typography variant="h3" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 relative z-10">
          Business Efficiency Index
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
          <div className="text-center md:border-r border-white/5 last:border-0">
            <div className="text-3xl font-black text-emerald-400 mb-1.5 italic transition-all group-hover:scale-110 duration-700">{stats.completedBookings}</div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{res.performance.completed}</div>
          </div>
          <div className="text-center md:border-r border-white/5 last:border-0">
            <div className="text-3xl font-black text-indigo-400 mb-1.5 italic transition-all group-hover:scale-110 duration-700">{stats.pendingBookings}</div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{res.performance.pending}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-white mb-1.5 italic transition-all group-hover:scale-110 duration-700">98%</div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{res.performance.satisfaction}</div>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-[80px] group-hover:bg-indigo-600/20 transition-all duration-1000"></div>
      </div>
    </div>
  );
}