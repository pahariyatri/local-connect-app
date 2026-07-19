"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import type { CommunityAuthor } from "@/services/communityService";
import CommunityFeed from "./components/CommunityFeed";

export default function TravellerCommunityPage() {
  const { lang } = useParams();
  const { user } = useAuth();
  const { dict } = useLocalizationContext();

  const c = dict?.page?.community ?? {};
  const t: Record<string, string> = {
    placeholder: c.placeholder ?? "Share a thought, a tip, or a moment from the mountains...",
    post: c.post ?? "Post",
    posting: c.posting ?? "Posting...",
    like: c.like ?? "Like",
    no_comments: c.no_comments ?? "No replies yet. Be the first to say something.",
    comment_placeholder: c.comment_placeholder ?? "Write a reply...",
    send: c.send ?? "Send",
    sign_in_to_comment: c.sign_in_to_comment ?? "Sign in to join the conversation.",
    empty: c.empty ?? "Nothing here yet. Start the conversation.",
  };
  const roleLabels = {
    traveler: c.role_traveler ?? "Traveller",
    vendor: c.role_vendor ?? "Host",
    verified: c.role_verified ?? "Verified Host",
  };

  const isVendor = !!user && /vendor|host|broker/i.test(user.role || "");
  const currentUser: CommunityAuthor | null = useMemo(() => {
    if (!user) return null;
    return { id: user.id, name: user.name || "You", role: "traveler" };
  }, [user]);

  // Travellers post here. Vendors may read but are pointed to their own space.
  const canPost = !!user && !isVendor;

  const notice = !user ? (
    <div className="rounded-[1.75rem] bg-slate-900 text-white p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between overflow-hidden relative">
      <div className="absolute -top-8 -right-8 w-40 h-40 bg-emerald-500/20 rounded-full blur-[50px] pointer-events-none" />
      <div className="relative z-10">
        <h2 className="font-black text-lg uppercase italic tracking-tight">{c.join_title ?? "Join the community"}</h2>
        <p className="text-slate-400 text-sm font-medium mt-1">{c.join_sub ?? "Sign in to share your journey and reply to others."}</p>
      </div>
      <Link
        href={`/${lang}/auth/login?redirectTo=${encodeURIComponent(`/${lang}/community`)}`}
        className="relative z-10 flex-shrink-0 h-12 px-6 rounded-2xl bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest flex items-center justify-center hover:bg-emerald-400 transition-all active:scale-95"
      >
        {c.join_cta ?? "Sign in"}
      </Link>
    </div>
  ) : (
    <div className="rounded-[1.75rem] border-2 border-slate-100 bg-slate-50 p-5 flex items-center gap-3 justify-between">
      <p className="text-sm font-bold text-slate-500">{c.host_notice ?? "This is the traveller community. Your host community lives in your dashboard."}</p>
      <Link href={`/${lang}/vendor/community`} className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700">
        {c.host_cta ?? "Host space"}
      </Link>
    </div>
  );

  return (
    <main className="max-w-2xl mx-auto px-4 pt-28 sm:pt-36 pb-32">
      <header className="mb-8">
        <span className="text-emerald-500 font-black uppercase tracking-[0.3em] text-[10px] mb-3 block">
          {c.traveler_badge ?? "Traveller Community"}
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.9]">
          {c.traveler_title ?? "On the Road"}
        </h1>
        <p className="text-slate-400 font-medium mt-3 text-sm sm:text-base leading-relaxed">
          {c.traveler_subtitle ?? "Trips, tips, and moments from fellow travellers across the mountains."}
        </p>
      </header>

      <CommunityFeed
        space="traveler"
        currentUser={currentUser}
        canPost={canPost}
        t={t}
        roleLabels={roleLabels}
        notice={notice}
      />
    </main>
  );
}
