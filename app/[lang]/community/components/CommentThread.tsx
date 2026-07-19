"use client";

import React, { useState } from "react";
import { RoleAvatar, RoleChip } from "./CommunityBits";
import { timeAgo } from "@/services/communityService";
import type { CommunityAuthor, CommunityComment } from "@/services/communityService";

interface CommentThreadProps {
  comments: CommunityComment[];
  currentUser: CommunityAuthor | null;
  onAdd: (body: string) => Promise<void>;
  t: Record<string, string>;
  roleLabels: { traveler: string; vendor: string; verified: string };
}

export default function CommentThread({ comments, currentUser, onAdd, t, roleLabels }: CommentThreadProps) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const trimmed = body.trim();
  const canSend = trimmed.length > 0 && !sending;

  const send = async () => {
    if (!canSend) return;
    setSending(true);
    try {
      await onAdd(trimmed);
      setBody("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-50 space-y-4">
      {comments.length === 0 && (
        <p className="text-xs font-medium text-slate-300 text-center py-1">{t.no_comments}</p>
      )}

      {comments.map((c) => (
        <div key={c.id} className="flex gap-3">
          <RoleAvatar name={c.author.name} role={c.author.role} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-black text-slate-900 text-xs truncate">{c.author.name}</span>
                <RoleChip role={c.author.role} verified={c.author.verified} labels={roleLabels} />
              </div>
              <p className="text-sm text-slate-600 font-medium leading-relaxed break-words">{c.body}</p>
            </div>
            <span className="text-[10px] font-bold text-slate-300 pl-2 mt-1 block">{timeAgo(c.createdAt)}</span>
          </div>
        </div>
      ))}

      {currentUser ? (
        <div className="flex gap-2 items-center">
          <RoleAvatar name={currentUser.name} role={currentUser.role} size="sm" />
          <div className="flex-1 flex items-center gap-2 rounded-2xl border-2 border-slate-100 focus-within:border-slate-900 transition-colors pl-4 pr-1.5 py-1.5">
            <label htmlFor="comment-input" className="sr-only">{t.comment_placeholder}</label>
            <input
              id="comment-input"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && canSend) send(); }}
              placeholder={t.comment_placeholder}
              className="flex-1 min-w-0 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none"
            />
            <button
              type="button"
              onClick={send}
              disabled={!canSend}
              aria-label={t.send}
              className="w-9 h-9 flex-shrink-0 rounded-xl bg-slate-900 text-white flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs font-medium text-slate-400 text-center py-1">{t.sign_in_to_comment}</p>
      )}
    </div>
  );
}
