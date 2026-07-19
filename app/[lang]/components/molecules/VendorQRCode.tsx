"use client";

import React from "react";
import Typography from "../atoms/Typography";

interface VendorQRCodeProps {
  vendorId: string;
  businessName: string;
}

export default function VendorQRCode({ businessName }: VendorQRCodeProps) {
  // In a real app, this would use a library like qrcode.react
  // For demo, we show a premium visual placeholder
  return (
    <div className="flex flex-col items-center">
      <div className="p-8 bg-white rounded-[3rem] shadow-2xl shadow-emerald-100 border border-slate-50 relative group">
        <div className="absolute -top-3 -right-3 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        </div>
        
        {/* Mock QR Visual */}
        <div className="w-48 h-48 bg-slate-50 rounded-2xl p-4 flex items-center justify-center border-4 border-slate-100">
          <div className="w-full h-full border-4 border-slate-900 border-dashed opacity-20 relative">
            <div className="absolute inset-4 bg-slate-900/10 rounded-lg flex items-center justify-center text-3xl">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
            <Typography variant="h3" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">SCAN TO BOOK</Typography>
            <p className="text-xs font-black text-slate-900 uppercase">{businessName}</p>
        </div>
      </div>
      
      <p className="mt-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center px-10 leading-relaxed">
        Part of the <span className="text-emerald-500">Local Connect Secret Group</span>. 
        <br />Scan to access exclusive direct-from-vendor rates.
      </p>
    </div>
  );
}
