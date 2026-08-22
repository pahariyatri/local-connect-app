'use client';

import React from 'react';
import { useLocalizationContext } from '@/contexts/LocalizationContext';
import {
  support,
  hasAnySupportChannel,
  whatsappHref,
  phoneHref,
  emailHref,
} from '@/lib/supportConfig';
import { trackWhatsappContactClick, trackPartnerContactClick } from '@/lib/analytics';

/**
 * PY-004 — the one place the site offers a human to talk to.
 *
 * Every channel is config-driven (lib/supportConfig.ts). Channels the business
 * hasn't supplied simply don't render; if none are configured the component
 * renders nothing at all rather than showing a dead "contact us" affordance.
 */

type Variant = 'footer' | 'inline' | 'bar';

interface SupportContactProps {
  variant?: Variant;
  /** Context appended to the WhatsApp / email message, e.g. "Booking YATRI-42". */
  reference?: string;
  /** Overrides the default "Need help?" lead-in on the inline/bar variants. */
  heading?: string;
  className?: string;
  /** Set only when this instance sits on a specific partner's page (e.g. the
   *  vendor profile). Fires partner_contact_click in addition to the generic
   *  whatsapp_contact_click — leave unset on shared surfaces like the footer
   *  or trip builder, which aren't about one partner. */
  partnerContext?: { id: string; name?: string };
}

const FALLBACK = {
  title: 'Support',
  need_help: 'Need help?',
  whatsapp: 'Chat on WhatsApp',
  call: 'Call support',
  email: 'Email support',
};

export default function SupportContact({
  variant = 'inline',
  reference,
  heading,
  className = '',
  partnerContext,
}: SupportContactProps) {
  const { dict } = useLocalizationContext();
  const t = { ...FALLBACK, ...(dict?.page?.common?.support ?? {}) };

  if (!hasAnySupportChannel) return null;

  const handleChannelClick = (channelKey: string) => {
    if (channelKey === 'whatsapp') trackWhatsappContactClick(reference);
    if (partnerContext) trackPartnerContactClick(partnerContext.id, partnerContext.name, channelKey);
  };

  const context = reference ? `Pahari Yatri — ${reference}` : 'Pahari Yatri support';
  const wa = whatsappHref(`Hi, I need help with ${context}.`);
  const tel = phoneHref();
  const mail = emailHref(context);

  const channels: { key: string; href: string; label: string; value: string; icon: React.ReactNode }[] = [];

  if (wa) {
    channels.push({
      key: 'whatsapp',
      href: wa,
      label: t.whatsapp,
      value: support.phone || 'WhatsApp',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5 0-.2 0-.4 0-.5 0-.2-.7-1.6-.9-2.2-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.4 1.9.8 2.7.9 3.6.7.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.4zM12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
        </svg>
      ),
    });
  }
  if (tel && support.phone) {
    channels.push({
      key: 'phone',
      href: tel,
      label: t.call,
      value: support.phone,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
    });
  }
  if (mail && support.email) {
    channels.push({
      key: 'email',
      href: mail,
      label: t.email,
      value: support.email,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-10 6L2 7" />
        </svg>
      ),
    });
  }

  if (channels.length === 0) return null;

  if (variant === 'footer') {
    return (
      <div className={className}>
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 mb-3">
          {t.title}
        </p>
        <ul className="space-y-2">
          {channels.map((c) => (
            <li key={c.key}>
              <a
                href={c.href}
                target={c.key === 'whatsapp' ? '_blank' : undefined}
                rel={c.key === 'whatsapp' ? 'noopener noreferrer' : undefined}
                onClick={() => handleChannelClick(c.key)}
                className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2"
              >
                <span className="text-emerald-400">{c.icon}</span>
                {c.key === 'whatsapp' ? c.label : c.value}
              </a>
            </li>
          ))}
        </ul>
        {support.hours && (
          <p className="text-[10px] text-slate-600 mt-3">{support.hours}</p>
        )}
      </div>
    );
  }

  // "bar": dark strip, for use inside already-light page bodies at high-anxiety
  // moments (vendor page, trip review, booking request, checkout).
  if (variant === 'bar') {
    return (
      <div className={`rounded-[2rem] bg-slate-900 text-white p-5 ${className}`}>
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3">
          {heading || t.need_help}
        </p>
        <div className="flex flex-wrap gap-2">
          {channels.map((c) => (
            <a
              key={c.key}
              href={c.href}
              target={c.key === 'whatsapp' ? '_blank' : undefined}
              rel={c.key === 'whatsapp' ? 'noopener noreferrer' : undefined}
              onClick={() => handleChannelClick(c.key)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-emerald-500 transition-all active:scale-95 text-[10px] font-black uppercase tracking-wider"
            >
              <span className="text-emerald-400">{c.icon}</span>
              {c.label}
            </a>
          ))}
        </div>
        {support.hours && (
          <p className="text-[10px] text-slate-500 mt-3">{support.hours}</p>
        )}
      </div>
    );
  }

  // "inline": quiet row that sits under content without restyling the page.
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${className}`}>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {heading || t.need_help}
      </span>
      {channels.map((c) => (
        <a
          key={c.key}
          href={c.href}
          target={c.key === 'whatsapp' ? '_blank' : undefined}
          rel={c.key === 'whatsapp' ? 'noopener noreferrer' : undefined}
          onClick={() => handleChannelClick(c.key)}
          className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          {c.icon}
          {c.label}
        </a>
      ))}
    </div>
  );
}
