"use client";

import React from "react";
import Typography from "../../../components/atoms/Typography";

interface VendorAnalyticsProps {
  dict: any;
  /** Real trustScore from the vendor's own profile, or null if never rated — never invented. Optional so existing callers keep working until they're updated to pass it. */
  rating?: number | null;
}

export default function VendorAnalytics({ dict, rating = null }: VendorAnalyticsProps) {
  const res = dict.page.vendor_dashboard.analytics;

  // No real per-vendor revenue/booking/customer aggregation exists yet —
  // booking-completion and Settlement rows aren't wired up (see CLAUDE.md §3
  // "What's missing"), and the only backend vendor-analytics endpoint
  // (GET /admin/vendor-analytics) is admin-only and platform-wide, not
  // per-vendor. Showing an honest empty state instead of fabricated
  // revenue/booking charts (AUDIT-008) — wire this up to a real per-vendor
  // endpoint once one exists, never backfill with invented numbers.

  return (
    <div className="space-y-10">
      <div className="bg-white border border-slate-100 rounded-[3rem] p-16 shadow-sm text-center">
        <Typography variant="h3" className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">
          {res.revenue.title} &amp; {res.bookings.title}
        </Typography>
        <p className="text-lg font-black text-slate-900 italic tracking-tight mb-2">
          {res.metrics.coming_soon || "Coming soon"}
        </p>
        <p className="text-xs font-medium text-slate-400 max-w-sm mx-auto">
          Revenue and booking analytics will appear here once your first bookings are completed and settled.
        </p>
      </div>

      {/* Protocol Health Trace */}
      <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm animate-in fade-in duration-1000 delay-500 fill-mode-forwards">
        <Typography variant="h3" className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-12 px-2">
          Protocol Health Trace
        </Typography>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
              // Real trustScore when this vendor has one; "Not yet rated" otherwise —
              // no invented number, no fake "Global Rank" (no ranking system exists).
              { label: res.metrics.rating, val: rating != null ? rating.toFixed(1) : (res.metrics.not_yet_rated || 'Not yet rated'), sub: '', color: 'text-emerald-500' },
              // response/completion/avg-order-value have no real backend aggregation
              // yet (see AUDIT-008) — honest "coming soon" rather than a fabricated number.
              { label: res.metrics.response, val: res.metrics.coming_soon || 'Coming soon', sub: '', color: 'text-indigo-600' },
              { label: res.metrics.completion, val: res.metrics.coming_soon || 'Coming soon', sub: '', color: 'text-purple-600' },
              { label: res.metrics.avg_value, val: res.metrics.coming_soon || 'Coming soon', sub: '', color: 'text-slate-900' }
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