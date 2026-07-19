"use client";

import React, { useState } from "react";
import { RoleAvatar } from "./CommunityBits";
import type { CommunityAuthor } from "@/services/communityService";

const MAX = 500;

interface PostComposerProps {
  author: CommunityAuthor;
  onSubmit: (body: string) => Promise<void>;
  t: Record<string, string>;
}

export default function PostComposer({ author, onSubmit, t }: PostComposerProps) {
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [focused, setFocused] = useState(false);

  const trimmed = body.trim();
  const canPost = trimmed.length > 0 && trimmed.length <= MAX && !posting;

  const submit = async () => {
    if (!canPost) return;
    setPosting(true);
    try {
      await onSubmit(trimmed);
      setBody("");
      setFocused(false);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div
      className={`rounded-[1.75rem] border-2 bg-white p-4 sm:p-5 transition-all ${
        focused ? "border-slate-900 shadow-lg shadow-slate-100" : "border-slate-100"
      }`}
    >
      <div className="flex gap-3">
        <RoleAvatar name={author.name} role={author.role} />
        <div className="flex-1 min-w-0">
          <label htmlFor="community-composer" className="sr-only">
            {t.placeholder}
          </label>
          <textarea
            id="community-composer"
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, MAX + 40))}
            onFocus={() => setFocused(true)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
            }}
            placeholder={t.placeholder}
            rows={focused ? 3 : 1}
            className="w-full resize-none bg-transparent text-slate-900 font-medium text-sm sm:text-base placeholder:text-slate-300 focus:outline-none leading-relaxed pt-2"
          />
        </div>
      </div>

      {(focused || trimmed.length > 0) && (
        <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-50 animate-fade-in">
          <span
            className={`text-[10px] font-black tabular-nums ${
              trimmed.length > MAX ? "text-red-500" : "text-slate-300"
            }`}
          >
            {trimmed.length}/{MAX}
          </span>
          <button
            type="button"
            onClick={submit}
            disabled={!canPost}
            className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30 disabled:hover:bg-slate-900"
          >
            {posting ? t.posting : t.post}
          </button>
        </div>
      )}
    </div>
  );
}
