"use client";

import React from "react";
import Typography from "../../components/atoms/Typography";
import Button from "../../components/atoms/Button";

const MOCK_CONTRACTS = [
  { 
    id: "CT-501", 
    partner: "Pahadi Guide Co.", 
    terms: "6 Month Seasonal Agreement", 
    status: "Active", 
    startDate: "01 May 2026", 
    endDate: "01 Nov 2026",
    commission: "15%"
  },
  { 
    id: "CT-488", 
    partner: "Himalayan Retreat", 
    terms: "Yearly Fixed Rate Contract", 
    status: "Review Required", 
    startDate: "15 Jan 2026", 
    endDate: "15 Jan 2027",
    commission: "10%"
  }
];

export default function ContractsPage() {
    return (
        <div className="max-w-md mx-auto">
            <header className="mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <Typography variant="h1" className="text-4xl font-black text-slate-900 leading-tight">
                    Legal <span className="text-indigo-600">&</span> Contracts.
                </Typography>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Your bridge to the Local Connect network</p>
            </header>

            <div className="space-y-6">
                {MOCK_CONTRACTS.map((contract, idx) => (
                    <div 
                        key={contract.id} 
                        className="premium-card p-1 bg-white relative overflow-hidden group hover:border-indigo-100 transition-all active:scale-[0.98] animate-in fade-in slide-in-from-bottom-5 duration-700"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1.5">{contract.id}</p>
                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic leading-tight group-hover:text-indigo-600 transition-colors">{contract.partner}</h3>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${contract.status === "Active" ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white animate-pulse"}`}>
                                    {contract.status}
                                </div>
                            </div>

                            <div className="space-y-5 mb-10 pt-6 border-t border-slate-50">
                                <div className="flex justify-between items-center group/item">
                                    <span className="text-slate-300 uppercase tracking-[0.2em] font-black text-[9px] group-hover/item:text-indigo-400 transition-colors">Terms of Work</span>
                                    <span className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">{contract.terms}</span>
                                </div>
                                <div className="flex justify-between items-center group/item">
                                    <span className="text-slate-300 uppercase tracking-[0.2em] font-black text-[9px] group-hover/item:text-indigo-400 transition-colors">Commission Rate</span>
                                    <span className="text-lg font-black text-indigo-600 italic tracking-tighter">{contract.commission}</span>
                                </div>
                                <div className="flex justify-between items-center group/item">
                                    <span className="text-slate-300 uppercase tracking-[0.2em] font-black text-[9px] group-hover/item:text-indigo-400 transition-colors">Validity Window</span>
                                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{contract.startDate} — {contract.endDate}</span>
                                </div>
                            </div>

                            <Button className="w-full h-16 rounded-[1.75rem] bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 active:scale-95 transition-all duration-500">
                                SIGNED DOCUMENT 📄
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Master Agreement Footer */}
            <div className="mt-12 p-10 rounded-[3rem] bg-slate-900 text-white text-center shadow-2xl shadow-slate-200 relative overflow-hidden group animate-in zoom-in-95 duration-1000 delay-300">
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Master Partnership</p>
                    <h2 className="text-xl font-black mb-8 leading-tight italic tracking-tighter">All contracts are protected by our standard local-first agreement protocol.</h2>
                    <Button variant="outline" className="w-full h-16 rounded-[1.5rem] border-white/20 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all">READ MASTER TERMS</Button>
                </div>
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-1000"></div>
            </div>
            
            <div className="mt-16 text-center pb-12 opacity-20">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">Legal Ops Ledger v.1.0</p>
            </div>
        </div>
    );
}
