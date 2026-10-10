"use client";

import React, { useState } from "react";
import { Icon } from "../atoms/Icon";

export interface ReviewItem {
  id: string;
  vendorId: string;
  authorName: string;
  rating: number; // 1 to 5
  publicComment: string;
  privateFeedback?: string;
  createdAt: string;
  verifiedBooking?: boolean;
}

interface FeedbackReviewModalProps {
  vendorId: string;
  vendorName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: (review: ReviewItem) => void;
}

export default function FeedbackReviewModal({
  vendorId,
  vendorName,
  isOpen,
  onClose,
  onSubmitted,
}: FeedbackReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState<string>("");
  const [publicComment, setPublicComment] = useState<string>("");
  const [privateFeedback, setPrivateFeedback] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicComment.trim()) return;

    setIsSubmitting(true);

    const newReview: ReviewItem = {
      id: `rev_${Date.now()}`,
      vendorId,
      authorName: authorName.trim() || "Verified Traveler",
      rating,
      publicComment: publicComment.trim(),
      privateFeedback: privateFeedback.trim() || undefined,
      createdAt: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
      verifiedBooking: true,
    };

    // Store review in localStorage
    try {
      const storageKey = `py_reviews_${vendorId}`;
      const existingRaw = localStorage.getItem(storageKey);
      const existing: ReviewItem[] = existingRaw ? JSON.parse(existingRaw) : [];
      existing.unshift(newReview);
      localStorage.setItem(storageKey, JSON.stringify(existing));
    } catch {
      // localStorage fallback
    }

    setIsSubmitting(false);
    if (onSubmitted) onSubmitted(newReview);
    onClose();
  };

  const activeStars = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">
            Verified Partner Feedback
          </span>
          <h3 className="text-xl font-black tracking-tight">{vendorName}</h3>
          <p className="text-xs text-slate-300 font-medium mt-0.5">
            Share your experience to help host profile ratings & platform quality.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Rating Stars (1-5) */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              Public Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform active:scale-90 focus:outline-none"
                >
                  <span
                    className={`text-2xl transition-colors ${
                      star <= activeStars ? "text-amber-400" : "text-slate-200"
                    }`}
                  >
                    ★
                  </span>
                </button>
              ))}
              <span className="ml-2 text-xs font-black text-slate-700 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
                {activeStars}.0 / 5.0
              </span>
            </div>
          </div>

          {/* Traveler Name */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              Your Name (Optional)
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Rahul S. (or leave empty for Verified Traveler)"
              className="w-full h-11 px-4 rounded-xl border border-slate-200 text-base font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* 1. Public Review */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                1. Public Review (Visible on Profile)
              </label>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Public Rating
              </span>
            </div>
            <textarea
              required
              rows={3}
              value={publicComment}
              onChange={(e) => setPublicComment(e.target.value)}
              placeholder="Write a public review about your stay, driver, or trek..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-base font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
            />
          </div>

          {/* 2. Private Feedback */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                2. Private Feedback (Host & Platform Admin Only)
              </label>
              <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                Private Note
              </span>
            </div>
            <textarea
              rows={2}
              value={privateFeedback}
              onChange={(e) => setPrivateFeedback(e.target.value)}
              placeholder="Optional private suggestions or constructive feedback for the host to improve..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-base font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 h-12 rounded-2xl border border-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !publicComment.trim()}
              className="w-2/3 h-12 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-lg disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Icon name="check" className="w-4 h-4 text-emerald-400" />
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
