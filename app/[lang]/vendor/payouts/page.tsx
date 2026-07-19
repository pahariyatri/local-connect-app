"use client";

import React, { useState } from "react";
import Typography from "../../components/atoms/Typography";
import Button from "../../components/atoms/Button";

const MOCK_TRANSACTIONS = [
  { id: "tx_1", date: "2026-02-14", amount: 12500, status: "Paid", method: "Razorpay Payout", journey: "Manali Mystic Expedition" },
  { id: "tx_2", date: "2026-02-12", amount: 4500, status: "Pending", method: "Local Escrow", journey: "Beas Kund Trek Assist" },
  { id: "tx_3", date: "2026-02-10", amount: 8200, status: "Paid", method: "Razorpay Payout", journey: "Solang Activity Package" },
  { id: "tx_4", date: "2024-02-08", amount: 15000, status: "Paid", method: "Direct Bank", journey: "Luxury Stay - 4 nights" },
];

export default function VendorPayouts() {
  const [activeTab, setActiveTab] = useState<"balance" | "history">("balance");

  return (
    <div className="max-w-md mx-auto">
        <header className="mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <Typography variant="h1" className="text-4xl font-black text-slate-900 leading-tight">
                Financial <span className="text-emerald-600">Hub.</span>
            </Typography>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Manage your earnings & payouts</p>
        </header>
        
        {/* 💳 Balance Card */}
        <div className="premium-card bg-slate-900 p-10 text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] mb-10 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
          <div className="relative z-10">
            <Typography variant="h3" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Available Balance</Typography>
            <Typography variant="h1" className="text-5xl font-black mb-8 tracking-tighter italic">₹42,500</Typography>
            
            <div className="flex gap-2 items-center mb-10 translate-y-2 opacity-0 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-500 fill-mode-forwards">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Verified and Ready for transfer</span>
            </div>

            <Button className="w-full h-16 rounded-[1.75rem] bg-emerald-500 text-white font-black text-xs uppercase tracking-[0.1em] shadow-xl shadow-emerald-900/60 hover:bg-emerald-400 hover:scale-[1.02] transition-all active:scale-95 duration-500">
              WITHDRAW TO BANK 🏔️
            </Button>
          </div>
          
          {/* Ambient Background Glow */}
          <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-[80px] group-hover:bg-emerald-500/30 transition-all duration-1000"></div>
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px]"></div>
        </div>

        {/* 🛡️ Secure Provider Section */}
        <div className="p-8 rounded-[3rem] bg-white border border-slate-100 mb-10 shadow-sm animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xl shadow-xl shadow-slate-200 italic font-black">R</div>
                    <div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Razorpay Secure</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Legion Verified Account</p>
                    </div>
                </div>
                <div className="px-4 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest leading-none">ACTIVE</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:border-emerald-100 group">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Compliance</p>
                    <p className="text-xs font-black text-slate-900 flex items-center gap-2">Success <span className="text-emerald-500 group-hover:scale-125 transition-transform duration-500">✓</span></p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:border-emerald-100 group">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tax Ledger</p>
                    <p className="text-xs font-black text-slate-900 flex items-center gap-2">Complete <span className="text-emerald-500 group-hover:scale-125 transition-transform duration-500">✓</span></p>
                </div>
            </div>

            <button className="w-full mt-8 py-3 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] hover:text-emerald-600 transition-colors">
                Update Payout Settings →
            </button>
        </div>

        {/* 📊 Activity List */}
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 delay-300">
            <div className="flex gap-10 mb-8 px-4 border-b border-slate-100">
                <button 
                    onClick={() => setActiveTab("balance")}
                    className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === "balance" ? "text-slate-900" : "text-slate-300"}`}
                >
                    Recent Trace
                    {activeTab === "balance" && <span className="absolute bottom-0 left-0 w-full h-1 bg-slate-900 rounded-full animate-in slide-in-from-left-2 duration-300"></span>}
                </button>
                <button 
                    onClick={() => setActiveTab("history")}
                    className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === "history" ? "text-slate-900" : "text-slate-300"}`}
                >
                    Full History
                    {activeTab === "history" && <span className="absolute bottom-0 left-0 w-full h-1 bg-slate-900 rounded-full animate-in slide-in-from-left-2 duration-300"></span>}
                </button>
            </div>

            <div className="space-y-4">
                {MOCK_TRANSACTIONS.map((tx, idx) => (
                    <div 
                        key={tx.id} 
                        className="group p-6 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-between hover:border-emerald-100 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-slate-100/50 animate-in fade-in slide-in-from-bottom-3 fill-mode-forwards"
                        style={{ animationDelay: `${idx * 100 + 400}ms` }}
                    >
                        <div className="flex gap-4 items-center">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-xl group-hover:bg-emerald-50 transition-all duration-500 group-hover:rotate-6">📦</div>
                            <div>
                                <h4 className="font-black text-slate-900 tracking-tight uppercase text-[11px] leading-tight group-hover:text-emerald-500 transition-colors">{tx.journey}</h4>
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1.5">{tx.date} • {tx.method}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-slate-900 text-lg tracking-tighter transition-all duration-500 group-hover:scale-105">+₹{tx.amount.toLocaleString()}</p>
                            <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${tx.status === "Paid" ? "text-emerald-500" : "text-emerald-500 animate-pulse"}`}>
                                {tx.status}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="mt-16 text-center pb-12 opacity-30">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">Authorized SecOps Trace</p>
        </div>
    </div>
  );
}
