'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { fetchCurrentUser, updateUser } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import Button from '../../components/atoms/Button';
import AuthShell from '../components/AuthShell';
import { getTravelerDictionary } from '@/lib/travelerDictionary';

/** Only ever follow a same-site relative path — never an absolute/external URL. */
const safeRedirect = (raw: string | null, lang: string): string => {
  if (!raw) return `/${lang}`;
  const decoded = decodeURIComponent(raw);
  if (!decoded.startsWith('/') || decoded.startsWith('//')) return `/${lang}`;
  return decoded;
};

/** findOrCreateVerifiedUser's placeholder sentinel — never a real traveler's actual name. */
const needsName = (firstName?: string, lastName?: string) => firstName === 'User' && !lastName;

export default function NameCollectionPage() {
  const router = useRouter();
  const { lang } = useParams() as { lang: string };
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const t = getTravelerDictionary(lang).auth.nameCollection;

  const redirectTo = searchParams.get('redirectTo');
  const destination = safeRedirect(redirectTo, lang);

  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Self-contained safety check: only show this screen to a signed-in user
  // who genuinely still carries the placeholder name. Covers direct/repeat
  // navigation to this URL, not just the redirect from PIN setup/login.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const profile = await fetchCurrentUser();
        if (cancelled) return;
        if (!profile?.id) {
          router.replace(`/${lang}/auth/login`);
          return;
        }
        if (!needsName(profile.firstName, profile.lastName)) {
          router.replace(destination);
          return;
        }
        setUserId(profile.id);
        setChecking(false);
      } catch {
        if (!cancelled) router.replace(`/${lang}/auth/login`);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t.errorRequired);
      return;
    }
    if (!userId) return;
    setSubmitting(true);
    setError(null);
    const [firstName, ...rest] = trimmed.split(/\s+/);
    const lastName = rest.join(' ').slice(0, 50);
    try {
      await updateUser(userId, { firstName: firstName.slice(0, 50), lastName });
      await refreshUser();
      router.replace(destination);
    } catch {
      setError(t.errorSaveFailed);
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <AuthShell lang={lang} title="">
        <div className="flex justify-center py-6">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      lang={lang}
      title={<>{t.titlePrefix} <span className="text-emerald-500">{t.titleHighlight}</span></>}
      subtitle={t.subtitle}
    >
      <div className="space-y-6">
        {error && (
          <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl py-2.5 px-3 text-center font-semibold">
            {error}
          </p>
        )}

        <input
          autoFocus
          type="text"
          inputMode="text"
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) submit(); }}
          placeholder={t.placeholder}
          aria-label={t.placeholder}
          className="w-full h-14 sm:h-15 px-4 rounded-2xl border-2 border-slate-200 bg-slate-50/70 text-base sm:text-lg font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-normal outline-none focus:border-slate-900 focus:bg-white focus:shadow-sm transition-all"
        />

        <Button
          onClick={submit}
          disabled={!name.trim() || submitting}
          isLoading={submitting}
          className="w-full h-13 sm:h-14 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-black uppercase tracking-[0.15em] shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98]"
        >
          {t.continueButton}
        </Button>
      </div>
    </AuthShell>
  );
}
