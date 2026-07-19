"use client";

import React, { useState } from "react";
import Typography from "../../../components/atoms/Typography";
import Button from "../../../components/atoms/Button";

interface VendorBookingsManagerProps {
  dict: any;
}

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  bookingDate: string;
  travelDate: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  amount: number;
  guests: number;
}

export default function VendorBookingsManager({ dict }: VendorBookingsManagerProps) {
  const res = dict.page.vendor_dashboard.bookings;

  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      serviceName: 'Mountain View Room',
      bookingDate: '2026-02-20',
      travelDate: '2026-02-25',
      status: 'confirmed',
      amount: 3500,
      guests: 2
    },
    {
      id: '2',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      serviceName: 'Paragliding Adventure',
      bookingDate: '2026-02-19',
      travelDate: '2026-02-24',
      status: 'pending',
      amount: 3500,
      guests: 1
    },
    {
      id: '3',
      customerName: 'Mike Johnson',
      customerEmail: 'mike@example.com',
      serviceName: 'Taxi to Manali',
      bookingDate: '2026-02-18',
      travelDate: '2026-02-23',
      status: 'completed',
      amount: 2500,
      guests: 3
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  const filteredBookings = bookings.filter(booking =>
    filter === 'all' || booking.status === filter
  );

  const updateBookingStatus = (bookingId: string, newStatus: Booking['status']) => {
    setBookings(prev => prev.map(booking =>
      booking.id === bookingId ? { ...booking, status: newStatus } : booking
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'confirmed': return 'bg-emerald-100 text-emerald-700';
      case 'completed': return 'bg-indigo-100 text-indigo-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return res.filters.pending;
      case 'confirmed': return res.filters.confirmed;
      case 'completed': return res.filters.completed;
      case 'cancelled': return res.filters.cancelled;
      default: return status;
    }
  };

  const getActionButtons = (booking: Booking) => {
    switch (booking.status) {
      case 'pending':
        return (
          <>
            <Button
              size="small"
              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px]"
            >
              {res.actions.confirm}
            </Button>
            <Button
              variant="outline"
              size="small"
              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
              className="text-red-600 border-red-100 hover:bg-red-50 h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px]"
            >
              {res.actions.cancel}
            </Button>
          </>
        );
      case 'confirmed':
        return (
          <Button
            variant="outline"
            size="small"
            onClick={() => updateBookingStatus(booking.id, 'completed')}
            className="text-indigo-600 border-indigo-100 hover:bg-indigo-50 h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px]"
          >
            {res.actions.mark_complete}
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <Typography variant="h2" className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">
          {res.title}
        </Typography>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">{res.subtitle}</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'all', label: res.filters.all, count: bookings.length },
          { id: 'pending', label: res.filters.pending, count: bookings.filter(b => b.status === 'pending').length },
          { id: 'confirmed', label: res.filters.confirmed, count: bookings.filter(b => b.status === 'confirmed').length },
          { id: 'completed', label: res.filters.completed, count: bookings.filter(b => b.status === 'completed').length },
          { id: 'cancelled', label: res.filters.cancelled, count: bookings.filter(b => b.status === 'cancelled').length }
        ].map(filterOption => (
          <button
            key={filterOption.id}
            onClick={() => setFilter(filterOption.id as any)}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap shadow-sm ${
              filter === filterOption.id
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            {filterOption.label} <span className="ml-1 opacity-50">[{filterOption.count}]</span>
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map(booking => (
          <div key={booking.id} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-xl shadow-inner">
                  👤
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight italic leading-none mb-1">{booking.customerName}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{booking.customerEmail}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusColor(booking.status)}`}>
                  {getStatusLabel(booking.status)}
                </span>
              </div>
              <div className="text-left md:text-right bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-2xl">
                <div className="text-2xl font-black text-slate-900 italic tracking-tighter">₹{booking.amount}</div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  {res.card.guests.replace("{count}", booking.guests.toString()).replace("{s}", booking.guests > 1 ? 's' : '')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pt-8 border-t border-slate-50">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{res.card.service}</span>
                <div className="font-bold text-slate-900 text-sm uppercase">{booking.serviceName}</div>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{res.card.booking_date}</span>
                <div className="font-bold text-slate-900 text-sm italic">{booking.bookingDate}</div>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{res.card.travel_date}</span>
                <div className="font-bold text-slate-900 text-sm italic">{booking.travelDate}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
              <div className="flex gap-2 w-full sm:w-auto">
                {getActionButtons(booking)}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" size="small" className="flex-1 sm:flex-none h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 border-slate-200 hover:bg-slate-50 transition-all">
                  {res.actions.view_details}
                </Button>
                <Button variant="outline" size="small" className="flex-1 sm:flex-none h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 border-slate-200 hover:bg-slate-50 transition-all">
                  {res.actions.contact}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
          <div className="text-5xl mb-6">📅</div>
          <Typography variant="h3" className="text-xl font-black text-slate-900 uppercase tracking-tighter italic mb-2">
            {res.not_found}
          </Typography>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            {filter === 'all' ? res.empty_state : res.empty_filter.replace("{filter}", getStatusLabel(filter))}
          </p>
        </div>
      )}
    </div>
  );
}