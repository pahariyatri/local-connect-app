"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import {
  getPosts,
  createPost,
  toggleLike,
  addComment,
} from "@/services/communityService";
import type { CommunityAuthor, CommunityFilter, CommunityPost } from "@/services/communityService";
import PostComposer from "./components/PostComposer";
import PostCard from "./components/PostCard";

const FILTERS: CommunityFilter[] = ["all", "traveler", "vendor"];

export default function CommunityPage() {
  const { lang } = useParams();
  const { user } = useAuth();
  const { dict } = useLocalizationContext();

  const [filter, setFilter] = useState<CommunityFilter>("all");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  const c = dict?.page?.community ?? {};
  const t: Record<string, string> = {
    title: c.title ?? "The Community",
    subtitle: c.subtitle ?? "Travellers and verified local hosts, sharing the road.",
    all: c.all ?? "Everyone",
    traveler: c.travelers ?? "Travellers",
    vendor: c.vendors ?? "Hosts",
    placeholder: c.placeholder ?? "Share a thought, a tip, or a moment from the mountains...",
    post: c.post ?? "Post",
    posting: c.posting ?? "Posting...",
    like: c.like ?? "Like",
    no_comments: c.no_comments ?? "No replies yet. Be the first to say something.",
    comment_placeholder: c.comment_placeholder ?? "Write a reply...",
    send: c.send ?? "Send",
    sign_in_to_comment: c.sign_in_to_comment ?? "Sign in to join the conversation.",
    empty: c.empty ?? "Nothing here yet. Start the conversation.",
    join_title: c.join_title ?? "Join the community",
    join_sub: c.join_sub ?? "Sign in to share your journey and reply to others.",
    join_cta: c.join_cta ?? "Sign in",
  };
  const roleLabels = {
    traveler: c.role_traveler ?? "Traveller",
    vendor: c.role_vendor ?? "Host",
    verified: c.role_verified ?? "Verified Host",
  };

  const currentUser: CommunityAuthor | null = useMemo(() => {
    if (!user) return null;
    const isVendor = /vendor|host|broker/i.test(user.role || "");
    return {
      id: user.id,
      name: user.name || "You",
      role: isVendor ? "vendor" : "traveler",
      verified: isVendor,
    };
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPosts(filter)
      .then((data) => { if (!cancelled) setPosts(data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [filter]);

  const handleCreate = async (body: string) => {
    if (!currentUser) return;
    const created = await createPost({ body, author: currentUser });
    // Respect the active filter: only prepend if it belongs in the current view.
    if (filter === "all" || filter === created.author.role) {
      setPosts((prev) => [created, ...prev]);
    }
  };

  const handleLike = async (postId: string) => {
    // Optimistic toggle, reconcile with the returned canonical post.
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likedByMe: !p.likedByMe, likes: p.likes + (p.likedByMe ? -1 : 1) }
          : p
      )
    );
    try {
      const updated = await toggleLike(postId);
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
    } catch {
      // revert on failure
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likedByMe: !p.likedByMe, likes: p.likes + (p.likedByMe ? -1 : 1) }
            : p
        )
      );
    }
  };

  const handleComment = async (postId: string, body: string) => {
    if (!currentUser) return;
    const comment = await addComment(postId, { body, author: currentUser });
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, comment] } : p))
    );
  };

  return (
    <main className="max-w-2xl mx-auto px-4 pt-28 sm:pt-36 pb-32">
      {/* Hero */}
      <header className="mb-8">
        <span className="text-emerald-500 font-black uppercase tracking-[0.3em] text-[10px] mb-3 block">
          {c.badge ?? "Travellers + Local Hosts"}
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.9]">
          {t.title}
        </h1>
        <p className="text-slate-400 font-medium mt-3 text-sm sm:text-base leading-relaxed">{t.subtitle}</p>
      </header>

      {/* Filter tabs */}
      <div className="flex gap-1.5 p-1.5 bg-slate-100 rounded-2xl mb-6 sticky top-20 sm:top-24 z-30 backdrop-blur">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`flex-1 h-10 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${
              filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {t[f]}
          </button>
        ))}
      </div>

      {/* Composer or sign-in prompt */}
      {currentUser ? (
        <div className="mb-6">
          <PostComposer author={currentUser} onSubmit={handleCreate} t={t} />
        </div>
      ) : (
        <div className="mb-6 rounded-[1.75rem] bg-slate-900 text-white p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between overflow-hidden relative">
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-emerald-500/20 rounded-full blur-[50px] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="font-black text-lg uppercase italic tracking-tight">{t.join_title}</h2>
            <p className="text-slate-400 text-sm font-medium mt-1">{t.join_sub}</p>
          </div>
          <Link
            href={`/${lang}/auth/login?redirectTo=${encodeURIComponent(`/${lang}/community`)}`}
            className="relative z-10 flex-shrink-0 h-12 px-6 rounded-2xl bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest flex items-center justify-center hover:bg-emerald-400 transition-all active:scale-95"
          >
            {t.join_cta}
          </Link>
        </div>
      )}

      {/* Feed */}
      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-[1.75rem] border-2 border-slate-100 bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3 w-32 bg-slate-100 rounded-full animate-pulse" />
                  <div className="h-2 w-20 bg-slate-100 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <div className="h-3 w-full bg-slate-100 rounded-full animate-pulse" />
                <div className="h-3 w-4/5 bg-slate-100 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 rounded-[1.75rem] border-2 border-dashed border-slate-200 bg-slate-50/50">
          <div className="text-4xl mb-3">🏔️</div>
          <p className="text-slate-500 font-bold text-sm">{t.empty}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onLike={() => handleLike(post.id)}
              onComment={(body) => handleComment(post.id, body)}
              t={t}
              roleLabels={roleLabels}
            />
          ))}
        </div>
      )}
    </main>
  );
}
