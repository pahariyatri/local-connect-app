"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import type { CommunityAuthor } from "@/services/communityService";
import CommunityFeed from "./components/CommunityFeed";
import PublicFooter from "../components/organisms/PublicFooter";
import { Icon } from "../components/atoms/Icon";

const TOPIC_FILTERS = [
  { id: "all", label: "All Stories" },
  { id: "treks", label: "Treks & Trails" },
  { id: "stays", label: "Homestays & Cabins" },
  { id: "roads", label: "Passes & Road Status" },
  { id: "food", label: "Local Dhabas & Cafés" },
];

export default function TravellerCommunityPage() {
  const { lang } = useParams();
  const { user } = useAuth();
  const { dict } = useLocalizationContext();
  const [activeTopic, setActiveTopic] = useState("all");

  const c = dict?.page?.community ?? {};
  const t: Record<string, string> = {
    placeholder: c.placeholder ?? "Share a road condition, a hidden trail, or a mountain tip...",
    post: c.post ?? "Post to Community",
    posting: c.posting ?? "Publishing...",
    like: c.like ?? "Like",
    no_comments: c.no_comments ?? "No replies yet. Be the first to share your thoughts.",
    comment_placeholder: c.comment_placeholder ?? "Write a reply...",
    send: c.send ?? "Reply",
    sign_in_to_comment: c.sign_in_to_comment ?? "Sign in to join the conversation.",
    empty: c.empty ?? "No stories shared in this topic yet. Be the first to post!",
  };
  const roleLabels = {
    traveler: c.role_traveler ?? "Traveler",
    vendor: c.role_vendor ?? "Local Host",
    verified: c.role_verified ?? "Verified Partner",
  };

  const isVendor = !!user && /vendor|host|broker/i.test(user.role || "");
  const currentUser: CommunityAuthor | null = useMemo(() => {
    if (!user) return null;
    return { id: user.id, name: user.name || "You", role: "traveler" };
  }, [user]);

  // Travellers post here. Vendors may read but are pointed to their own space.
  const canPost = !!user && !isVendor;

  const notice = !user ? (
    <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5 justify-between overflow-hidden relative shadow-xl">
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">
            Community
          </span>
        </div>
        <h2 className="font-black text-lg sm:text-xl tracking-tight">
          {c.join_title ?? "Share Your Himachal Journey"}
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm font-medium max-w-md">
          {c.join_sub ?? "Sign in to share live road conditions, homestay discoveries, and connect with fellow travelers."}
        </p>
      </div>
      <Link
        href={`/${lang}/auth/login?redirectTo=${encodeURIComponent(`/${lang}/community`)}`}
        className="relative z-10 flex-shrink-0 h-11 px-6 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all shadow-md active:scale-95"
      >
        {c.join_cta ?? "Sign In to Post"}
      </Link>
    </div>
  ) : (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center gap-3 justify-between">
      <p className="text-xs font-semibold text-slate-600">
        {c.host_notice ?? "This is the traveler community. Your host community and network hub lives in your vendor dashboard."}
      </p>
      <Link
        href={`/${lang}/vendor/community`}
        className="flex-shrink-0 text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
      >
        {c.host_cta ?? "Host Hub →"}
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-8 pb-20">
        {/* Community Header Banner */}
        <header className="mb-8 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-widest">
                Himachal Collective
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Traveler Community
              </h1>
              <p className="text-slate-500 font-medium text-xs sm:text-sm max-w-xl leading-relaxed">
                Live road updates, hidden trails, and mountain insights from real travelers.
              </p>
            </div>

            <Link
              href={`/${lang}/builder`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-colors flex-shrink-0 self-start md:self-center shadow-sm"
            >
              <span>Plan a Route</span>
              <Icon name="arrow-right" className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Topic Pills */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {TOPIC_FILTERS.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => setActiveTopic(topic.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeTopic === topic.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                <span>{topic.label}</span>
              </button>
            ))}
          </div>
        </header>

        {/* Feed & Composer */}
        <CommunityFeed
          space="traveler"
          currentUser={currentUser}
          canPost={canPost}
          t={t}
          roleLabels={roleLabels}
          notice={notice}
        />
      </main>

      <PublicFooter />
    </div>
  );
}

