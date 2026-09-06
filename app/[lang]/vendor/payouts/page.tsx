"use client";

import React, { useCallback, useEffect, useState } from "react";
import Typography from "../../components/atoms/Typography";
import { getMyVendor } from "@/services/vendorService";
import { getVendorAccountingSummary, getVendorPayouts, Payout, VendorAccountingSummary } from "@/services/payoutService";

const STATUS_STYLE: Record<string, string> = {
  paid: "bg-emerald-600 text-white",
  processing: "bg-amber-500 text-white",
  pending: "bg-slate-200 text-slate-600",
  failed: "bg-red-400 text-white",
  rejected: "bg-red-400 text-white",
};

export default function VendorPayouts() {
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [summary, setSummary] = useState<VendorAccountingSummary | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");

  const load = useCallback(async () => {
    setState("loading");
    try {
      const vendor = await getMyVendor();
      if (!vendor?.id) { setState("ready"); return; }
      setVendorId(vendor.id);
      const [summaryResult, payoutsResult] = await Promise.all([
        getVendorAccountingSummary(vendor.id),
        getVendorPayouts(vendor.id),
      ]);
      setSummary(summaryResult);
      setPayouts(payoutsResult);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (state === "loading") {
    return (
      <div className="max-w-md mx-auto space-y-6 animate-pulse">
        <div className="h-9 w-40 bg-slate-100 rounded-lg" />
        <div className="h-40 rounded-3xl bg-slate-100" />
        <div className="h-24 rounded-2xl bg-slate-100" />
        <div className="h-24 rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <p className="text-sm font-medium text-red-600 mb-4">Could not load your earnings.</p>
        <button onClick={load} className="text-xs font-semibold text-slate-900 underline">Try again</button>
      </div>
    );
  }

  if (!vendorId) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <p className="text-sm font-medium text-slate-500">Complete vendor onboarding to see your earnings here.</p>
      </div>
    );
  }

  const currency = summary?.currency === "INR" ? "₹" : `${summary?.currency ?? ""} `;

  return (
    <div className="max-w-md mx-auto">
        <header className="mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <Typography variant="h1" className="text-2xl sm:text-3xl font-bold text-slate-900">
                Earnings
            </Typography>
            <p className="text-slate-500 text-sm mt-1">Manage your earnings &amp; payouts</p>
        </header>

        {/* Balance card — real totals from the payout ledger */}
        <div className="rounded-3xl bg-slate-900 p-8 text-white mb-6 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-medium text-slate-400 mb-2">Total Earnings</p>
            <p className="text-3xl sm:text-4xl font-bold mb-6">{currency}{(summary?.totalEarnings ?? 0).toLocaleString()}</p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-xs font-medium text-slate-400">Paid Out</p>
                <p className="text-lg font-bold text-emerald-400">{currency}{(summary?.totalPaid ?? 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Pending</p>
                <p className="text-lg font-bold text-amber-400">{currency}{((summary?.totalPending ?? 0) + (summary?.totalProcessing ?? 0)).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-[70px]" />
        </div>

        {/* Payout history — real records, no fabricated per-booking labels
            (a Payout is a ledger entry, not tied to a specific trip name). */}
        <div className="space-y-3">
          <Typography variant="h3" className="text-base font-bold text-slate-900 px-1">
            Payout History
          </Typography>

          {payouts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
              <p className="text-sm font-medium text-slate-400">No payouts yet. They&apos;ll show up here once your bookings are settled.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {payouts.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {new Date(tx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    {tx.transactionReference && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">Ref: {tx.transactionReference}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-bold text-slate-900">
                      {tx.currency === "INR" ? "₹" : `${tx.currency} `}{Number(tx.amount).toLocaleString()}
                    </p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLE[tx.status] || STATUS_STYLE.pending}`}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}
