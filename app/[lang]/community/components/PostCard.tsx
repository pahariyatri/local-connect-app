"use client";

import React, { useState } from "react";
import LocalImage from "../../components/atoms/Image";
import { RoleAvatar, RoleChip } from "./CommunityBits";
import CommentThread from "./CommentThread";
import { timeAgo } from "@/services/communityService";
import type { CommunityAuthor, CommunityPost } from "@/services/communityService";

interface PostCardProps {
  post: CommunityPost;
  currentUser: CommunityAuthor | null;
  onLike: () => void;
  onComment: (body: string) => Promise<void>;
  t: Record<string, string>;
  roleLabels: { traveler: string; vendor: string; verified: string };
}

export default function PostCard({ post, currentUser, onLike, onComment, t, roleLabels }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);

  return (
    <article className="rounded-[1.75rem] border-2 border-slate-100 bg-white p-4 sm:p-6 transition-shadow hover:shadow-lg hover:shadow-slate-100">
      {/* Author */}
      <header className="flex items-center gap-3">
        <RoleAvatar name={post.author.name} role={post.author.role} />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-black text-slate-900 text-sm sm:text-base truncate">{post.author.name}</h3>
            <RoleChip role={post.author.role} verified={post.author.verified} labels={roleLabels} />
          </div>
          <p className="text-[11px] font-bold text-slate-400">
            {post.author.location ? `${post.author.location} · ` : ""}{timeAgo(post.createdAt)}
          </p>
        </div>
      </header>

      {/* Body */}
      <p className="text-slate-700 font-medium leading-relaxed mt-4 text-sm sm:text-[15px] whitespace-pre-wrap break-words">
        {post.body}
      </p>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {post.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Image */}
      {post.image && (
        <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-slate-100">
          <LocalImage src={post.image} alt="" className="w-full h-56 sm:h-72 object-cover" />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
        <button
          type="button"
          onClick={onLike}
          aria-pressed={post.likedByMe}
          aria-label={t.like}
          className={`inline-flex items-center gap-2 h-10 px-4 rounded-xl font-black text-xs transition-all active:scale-95 ${
            post.likedByMe ? "bg-rose-50 text-rose-500" : "text-slate-400 hover:bg-slate-50"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={post.likedByMe ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          <span className="tabular-nums">{post.likes}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowComments((s) => !s)}
          aria-expanded={showComments}
          className={`inline-flex items-center gap-2 h-10 px-4 rounded-xl font-black text-xs transition-all active:scale-95 ${
            showComments ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:bg-slate-50"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="tabular-nums">{post.comments.length}</span>
        </button>
      </div>

      {showComments && (
        <CommentThread
          comments={post.comments}
          currentUser={currentUser}
          onAdd={onComment}
          t={t}
          roleLabels={roleLabels}
        />
      )}
    </article>
  );
}
