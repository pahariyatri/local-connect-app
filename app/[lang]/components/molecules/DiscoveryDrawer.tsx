"use client";

import React from "react";
import Typography from "../atoms/Typography";
import Button from "../atoms/Button";
import LocalImage from "../atoms/Image";

interface Vendor {
  id: string;
  name: string;
  image: string;
  rating: number;
  price: number;
  category: string;
  description?: string;
}


interface DiscoveryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  vendors: Vendor[];
  onSelect: (vendorId: string) => void;
}

const DiscoveryDrawer: React.FC<DiscoveryDrawerProps> = ({ 
  isOpen, 
  onClose, 
  category, 
  vendors, 
  onSelect 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Drawer Content */}
      <div className="relative w-full max-w-lg bg-white rounded-t-[3.5rem] shadow-2xl animate-slideUp overflow-hidden max-h-[85vh] flex flex-col">
        {/* Handle */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-6 flex-shrink-0" />
        
        <div className="px-8 pb-10 overflow-y-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <Typography variant="h2" className="text-3xl font-black text-slate-900 tracking-tight">
                Discover <span className="text-indigo-600">{category}</span>
              </Typography>
              <p className="text-slate-500 font-medium text-sm mt-1">
                Hand-picked elite options for your journey
              </p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="space-y-6">
            {vendors.map((vendor) => (
              <div 
                key={vendor.id} 
                className="flex gap-6 p-4 rounded-3xl border-2 border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group cursor-pointer"
                onClick={() => onSelect(vendor.id)}
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                  <LocalImage 
                    src={vendor.image} 
                    alt={vendor.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-emerald-600 font-black text-xs">★ {vendor.rating}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{vendor.category}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 truncate mb-1">{vendor.name}</h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-1 mb-3">{vendor.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-black text-slate-900">₹{vendor.price.toLocaleString()}</p>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Add to Journey
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Button className="w-full h-16 rounded-[2rem] shadow-xl shadow-indigo-100 font-black tracking-tight" onClick={onClose}>
              I&apos;LL DECIDE LATER
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryDrawer;
