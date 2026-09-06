"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { Icon } from "../../components/atoms/Icon";

export default function VendorCommunityPage() {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "en";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-4 sm:py-6 px-4">
      <main className="max-w-2xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <Icon name="star" className="w-8 h-8 text-emerald-600" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600">
            Host Feedback & Rating Hub
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Direct Ratings & Feedback Streamlined
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto font-medium leading-relaxed">
            Traveler feedback is now captured directly on your host profile & completed bookings via public ratings and private quality notes.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-md max-w-lg mx-auto space-y-4 text-left">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              ★
            </span>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Public Profile Ratings</h4>
              <p className="text-xs text-slate-500 font-medium">Build trust with 5-star ratings displayed on your partner profile page.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 border-t border-slate-100 pt-3">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              ✉️
            </span>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Private Improvement Feedback</h4>
              <p className="text-xs text-slate-500 font-medium">Receive private feedback notes to help optimize stay and transport quality.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => router.push(`/${lang}/vendor/dashboard`)}
            className="h-12 px-6 rounded-full bg-slate-900 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95"
          >
            Go to Vendor Dashboard →
          </button>
        </div>
      </main>
    </div>
  );
}
