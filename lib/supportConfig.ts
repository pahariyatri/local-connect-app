/**
 * Customer support channels — config driven, never hardcoded.
 *
 * PY-004: the site had no phone, WhatsApp or chat contact anywhere, and the
 * only email on it (privacy@localconnect.com) was on a domain that doesn't
 * match the live product. Email is now a real, approved channel (see
 * DEFAULT_SUPPORT_EMAIL below), so there IS a way to reach a human.
 * Phone/WhatsApp remain env-driven: no approved number exists yet, and a
 * placeholder number that looks real is worse than no number at all, so there
 * are no fallback digits here — those affordances simply don't render.
 *
 * Set these as NEXT_PUBLIC_* build-time env vars (see .env.example):
 *   NEXT_PUBLIC_SUPPORT_WHATSAPP  full international number, digits only
 *                                 (e.g. 919876543210 — no "+", no spaces)
 *   NEXT_PUBLIC_SUPPORT_PHONE     dialable number (e.g. +91 98765 43210)
 *   NEXT_PUBLIC_SUPPORT_EMAIL     support mailbox
 *   NEXT_PUBLIC_SUPPORT_HOURS     human-readable hours (e.g. "9am–9pm IST")
 *                                 Leave blank unless it's actually staffed —
 *                                 it gates the "24/7 On-Trip Support" promise.
 */

import { BRAND_CONFIG } from "@/config/brandConfig";

const clean = (value: string | undefined): string | null => {
  const trimmed = (value ?? '').trim();
  return trimmed.length > 0 ? trimmed : null;
};

/**
 * Default support email is sourced from centralized BRAND_CONFIG.
 * Override it with NEXT_PUBLIC_SUPPORT_EMAIL if needed.
 */
const DEFAULT_SUPPORT_EMAIL = BRAND_CONFIG.supportEmail;

/** Digits only, so a value pasted as "+91 98765 43210" still builds a valid wa.me link. */
const whatsappDigits = (() => {
  const raw = clean(process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP);
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  // A country code + national number is at least 10 digits; anything shorter is
  // a misconfiguration, and a broken wa.me link is worse than no link.
  return digits.length >= 10 ? digits : null;
})();

export const support = {
  whatsapp: whatsappDigits,
  phone: clean(process.env.NEXT_PUBLIC_SUPPORT_PHONE),
  email: clean(process.env.NEXT_PUBLIC_SUPPORT_EMAIL) ?? DEFAULT_SUPPORT_EMAIL,
  hours: clean(process.env.NEXT_PUBLIC_SUPPORT_HOURS),
};

/** True when a traveler can reach a human in real time (not just send an email). */
export const hasLiveSupportChannel = Boolean(support.whatsapp || support.phone);

/** True when there is any way at all to contact support. */
export const hasAnySupportChannel = Boolean(
  support.whatsapp || support.phone || support.email,
);

export const whatsappHref = (message?: string): string | null =>
  support.whatsapp
    ? `https://wa.me/${support.whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ''}`
    : null;

export const phoneHref = (): string | null =>
  support.phone ? `tel:${support.phone.replace(/[^\d+]/g, '')}` : null;

export const emailHref = (subject?: string): string | null =>
  support.email
    ? `mailto:${support.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`
    : null;
