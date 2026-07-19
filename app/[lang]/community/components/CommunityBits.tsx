"use client";

import React from "react";
import type { AuthorRole } from "@/services/communityService";

/** Deterministic initials from a display name. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

const ROLE_RING: Record<AuthorRole, string> = {
  traveler: "bg-emerald-500",
  vendor: "bg-slate-900",
};

export function RoleAvatar({
  name,
  role,
  size = "md",
}: {
  name: string;
  role: AuthorRole;
  size?: "sm" | "md";
}) {
  const box = size === "sm" ? "w-9 h-9 text-[11px]" : "w-11 h-11 text-sm";
  return (
    <div
      className={`${box} ${ROLE_RING[role]} flex-shrink-0 rounded-2xl flex items-center justify-center font-black text-white shadow-sm select-none`}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}

export function RoleChip({
  role,
  verified,
  labels,
}: {
  role: AuthorRole;
  verified?: boolean;
  labels: { traveler: string; vendor: string; verified: string };
}) {
  const isVendor = role === "vendor";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
        isVendor ? "bg-slate-900 text-white" : "bg-emerald-50 text-emerald-600"
      }`}
    >
      {isVendor && verified && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {isVendor ? (verified ? labels.verified : labels.vendor) : labels.traveler}
    </span>
  );
}
