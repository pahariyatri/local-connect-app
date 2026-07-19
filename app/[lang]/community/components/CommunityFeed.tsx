"use client";

import React, { useEffect, useState } from "react";
import {
  getPosts,
  createPost,
  toggleLike,
  addComment,
} from "@/services/communityService";
import type { CommunityAuthor, CommunityPost, CommunitySpace } from "@/services/communityService";
import PostComposer from "./PostComposer";
import PostCard from "./PostCard";

interface CommunityFeedProps {
  space: CommunitySpace;
  currentUser: CommunityAuthor | null;
  /** May the current user create posts / comments in this space? */
  canPost: boolean;
  t: Record<string, string>;
  roleLabels: { traveler: string; vendor: string; verified: string };
  /** Shown in place of the composer when the user cannot post (e.g. sign-in prompt). */
  notice?: React.ReactNode;
}

export default function CommunityFeed({
  space,
  currentUser,
  canPost,
  t,
  roleLabels,
  notice,
}: CommunityFeedProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPosts(space)
      .then((data) => { if (!cancelled) setPosts(data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [space]);

  const handleCreate = async (body: string) => {
    if (!currentUser) return;
    const created = await createPost(space, { body, author: currentUser });
    setPosts((prev) => [created, ...prev]);
  };

  const flip = (p: CommunityPost): CommunityPost => ({
    ...p,
    likedByMe: !p.likedByMe,
    likes: p.likes + (p.likedByMe ? -1 : 1),
  });

  const handleLike = async (postId: string) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? flip(p) : p)));
    try {
      const updated = await toggleLike(space, postId);
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
    } catch {
      setPosts((prev) => prev.map((p) => (p.id === postId ? flip(p) : p))); // revert
    }
  };

  const handleComment = async (postId: string, body: string) => {
    if (!currentUser) return;
    const comment = await addComment(space, postId, { body, author: currentUser });
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, comment] } : p))
    );
  };

  return (
    <>
      <div className="mb-6">
        {canPost && currentUser ? (
          <PostComposer author={currentUser} onSubmit={handleCreate} t={t} />
        ) : (
          notice
        )}
      </div>

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
    </>
  );
}
