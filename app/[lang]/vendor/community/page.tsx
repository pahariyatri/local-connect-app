"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import type { CommunityAuthor } from "@/services/communityService";
import CommunityFeed from "../../community/components/CommunityFeed";

export default function HostCommunityPage() {
  const { lang } = useParams();
  const { user } = useAuth();
  const { dict } = useLocalizationContext();

  const c = dict?.page?.community ?? {};
  const t: Record<string, string> = {
    placeholder: c.host_placeholder ?? "Share an update, an operations tip, or ask fellow hosts...",
    post: c.post ?? "Post",
    posting: c.posting ?? "Posting...",
    like: c.like ?? "Like",
    no_comments: c.no_comments ?? "No replies yet. Be the first to say something.",
    comment_placeholder: c.comment_placeholder ?? "Write a reply...",
    send: c.send ?? "Send",
    sign_in_to_comment: c.sign_in_to_comment ?? "Sign in to join the conversation.",
    empty: c.host_empty ?? "No posts yet. Share the first update with fellow hosts.",
  };
  const roleLabels = {
    traveler: c.role_traveler ?? "Traveller",
    vendor: c.role_vendor ?? "Host",
    verified: c.role_verified ?? "Verified Host",
  };

  const isVendor = !!user && /vendor|host|broker/i.test(user.role || "");
  const currentUser: CommunityAuthor | null = useMemo(() => {
    if (!user) return null;
    return { id: user.id, name: user.name || "You", role: "vendor", verified: true };
  }, [user]);

  // Access control: this space is for hosts only.
  if (!isVendor) {
    return (
      <div className="max-w-2xl mx-auto px-4">
        <div className="rounded-[2rem] border-2 border-slate-100 bg-white p-10 text-center">
          <div className="text-4xl mb-4">🛡️</div>
          <h1 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight mb-2">
            {c.host_only_title ?? "Hosts only"}
          </h1>
          <p className="text-slate-400 font-medium text-sm mb-6">
            {c.host_only_sub ?? "This community is for verified hosts. Travellers can head to the traveller community."}
          </p>
          <Link
            href={`/${lang}/community`}
            className="inline-flex h-12 px-6 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest items-center justify-center hover:bg-black transition-all active:scale-95"
          >
            {c.host_only_cta ?? "Go to traveller community"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <header className="mb-8">
        <span className="text-emerald-500 font-black uppercase tracking-[0.3em] text-[10px] mb-3 block">
          {c.host_badge ?? "Host Community · Private"}
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.9]">
          {c.host_title ?? "The Host Circle"}
        </h1>
        <p className="text-slate-400 font-medium mt-3 text-sm sm:text-base leading-relaxed">
          {c.host_subtitle ?? "A private space for verified hosts to share tips, updates, and grow together."}
        </p>
      </header>

      <CommunityFeed
        space="vendor"
        currentUser={currentUser}
        canPost={isVendor}
        t={t}
        roleLabels={roleLabels}
      />
    </div>
  );
}
