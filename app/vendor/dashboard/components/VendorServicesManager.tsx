"use client";

import React, { useState } from "react";
import Typography from "../../../components/atoms/Typography";
import Button from "../../../components/atoms/Button";

interface VendorServicesManagerProps {
  dict: any;
}

interface Service {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'inactive' | 'draft';
  price: number;
  bookings: number;
  rating: number;
}

export default function VendorServicesManager({ dict }: VendorServicesManagerProps) {
  const res = dict.page.vendor_dashboard.services;

  const [services, setServices] = useState<Service[]>([
    { id: '1', name: 'Mountain View Room', category: 'Stay', status: 'active', price: 3500, bookings: 12, rating: 4.8 },
    { id: '2', name: 'Paragliding Adventure', category: 'Activity', status: 'active', price: 3500, bookings: 8, rating: 4.9 },
    { id: '3', name: 'Taxi to Manali', category: 'Travel', status: 'inactive', price: 2500, bookings: 5, rating: 4.5 },
    { id: '4', name: 'Himalayan Cuisine', category: 'Food', status: 'draft', price: 600, bookings: 0, rating: 0 }
  ]);

  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'draft'>('all');

  const filteredServices = services.filter(service =>
    filter === 'all' || service.status === filter
  );

  const toggleServiceStatus = (serviceId: string) => {
    setServices(prev => prev.map(service =>
      service.id === serviceId
        ? { ...service, status: service.status === 'active' ? 'inactive' : 'active' }
        : service
    ));
  };

  const deleteService = (serviceId: string) => {
    setServices(prev => prev.filter(service => service.id !== serviceId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500 text-white shadow-emerald-100';
      case 'inactive': return 'bg-slate-100 text-slate-400';
      case 'draft': return 'bg-indigo-600 text-white shadow-indigo-100';
      default: return 'bg-slate-100 text-slate-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return res.filters.active;
      case 'inactive': return res.filters.inactive;
      case 'draft': return res.filters.drafts;
      default: return status;
    }
  };

  return (
    <div className="space-y-10">
      {/* Dynamic Filter Engine */}
      <div className="flex justify-between items-center gap-6">
        <div className="flex gap-2 p-1.5 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-x-auto scrollbar-none">
            {[
            { id: 'all', label: res.filters.all, count: services.length },
            { id: 'active', label: res.filters.active, count: services.filter(s => s.status === 'active').length },
            { id: 'inactive', label: res.filters.inactive, count: services.filter(s => s.status === 'inactive').length },
            { id: 'draft', label: res.filters.drafts, count: services.filter(s => s.status === 'draft').length }
            ].map(option => (
            <button
                key={option.id}
                onClick={() => setFilter(option.id as any)}
                className={`px-6 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all duration-500 whitespace-nowrap ${
                filter === option.id
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-50'
                }`}
            >
                {option.label}
            </button>
            ))}
        </div>
        <Button className="hidden sm:flex bg-slate-900 text-white h-14 px-8 rounded-2xl font-black shadow-xl shadow-slate-200 active:scale-95 transition-all text-[10px] uppercase tracking-[0.2em]">
            {res.add_button}
        </Button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredServices.map((service, idx) => (
          <div 
            key={service.id} 
            className="premium-card p-1 bg-white relative overflow-hidden group hover:border-indigo-100 transition-all active:scale-[0.98] animate-in fade-in slide-in-from-bottom-5 duration-700"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="p-8">
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm mb-4 inline-block ${getStatusColor(service.status)}`}>
                            {getStatusLabel(service.status)}
                        </span>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic leading-tight group-hover:text-indigo-600 transition-colors">{service.name}</h3>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1.5">{res.card.price}</p>
                        <p className="text-xl font-black text-slate-900 italic tracking-tighter">₹{service.price}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-10 pb-8 border-b border-slate-50">
                    <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">{res.card.category}</span>
                        <span className="font-black text-slate-900 text-[11px] uppercase tracking-tight">{service.category}</span>
                    </div>
                    <div className="text-center">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">{res.card.bookings}</span>
                        <span className="font-black text-slate-900 text-[11px] uppercase italic">{service.bookings}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">{res.card.rating}</span>
                        <span className="font-black text-slate-900 text-[11px]">
                        {service.rating > 0 ? `${service.rating} ⭐` : res.card.no_ratings}
                        </span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => {/* Edit */}}
                        className="flex-1 h-14 rounded-2xl bg-slate-50 text-slate-400 font-black text-[9px] uppercase tracking-widest border border-slate-100 hover:text-indigo-600 hover:bg-white active:scale-95 transition-all"
                    >
                        {res.actions.edit}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => toggleServiceStatus(service.id)}
                        className={`flex-1 h-14 rounded-2xl font-black text-[9px] uppercase tracking-widest border active:scale-95 transition-all ${
                            service.status === 'active' 
                            ? 'text-rose-500 border-rose-50 hover:bg-rose-50' 
                            : 'text-emerald-500 border-emerald-50 hover:bg-emerald-50'
                        }`}
                    >
                        {service.status === 'active' ? res.actions.deactivate : res.actions.activate}
                    </Button>
                </div>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 animate-in fade-in duration-700">
          <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-4xl mx-auto mb-8 shadow-inner animate-pulse">🏜️</div>
          <Typography variant="h3" className="text-xl font-black text-slate-900 uppercase tracking-tighter italic mb-3">
            {res.not_found}
          </Typography>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-12">
            {filter === 'all' ? res.empty_state : res.empty_filter.replace("{filter}", getStatusLabel(filter))}
          </p>
          <Button className="bg-slate-900 text-white h-16 px-12 rounded-[2rem] font-black shadow-2xl shadow-slate-200 active:scale-95 transition-all uppercase tracking-[0.2em] text-[11px]">
            {res.add_first}
          </Button>
        </div>
      )}
    </div>
  );
}