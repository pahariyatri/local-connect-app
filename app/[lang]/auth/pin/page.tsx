'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { loginWithPin, setupPin, signupWithPin, resetPin, forgotPinRequest, checkPhoneExists } from '@/services/authService';
import { ApiClientError } from '@/lib/apiClient';
import { toAuthUiError } from '@/utils/authErrors';
import { fetchCurrentUser } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { PIN_LENGTH, isWeakPin } from '@/utils/validation';
import Button from '../../components/atoms/Button';
import AuthShell from '../components/AuthShell';
import { getTravelerDictionary, format } from '@/lib/travelerDictionary';

/**
 * Explicit state machine — the backend's phone/check result (or an OTP-
 * issued ticket, which already proves phone ownership) is the ONLY thing
 * that decides login vs. signup. The URL's `mode` param is a hint for the
 * initial render only; it is corrected via router.replace() once resolved,
 * never trusted for the actual submit behavior.
 */
type FlowState =
  | 'CHECKING_PHONE'
  | 'EXISTING_USER_PIN'
  | 'NEW_USER_PIN'
  | 'RESET_PIN'
  | 'SUBMITTING'
  | 'ERROR';

function PinBoxes({
  value,
  onChange,
  autoFocus,
  autoComplete,
  label,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  autoFocus?: boolean;
  autoComplete: 'current-password' | 'new-password';
  label: string;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...value];
    next[i] = digit;
    onChange(next);
    if (digit && i < PIN_LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, PIN_LENGTH);
    if (!pasted) return;
    const next = Array(PIN_LENGTH).fill('');
    pasted.split('').forEach((d, i) => { next[i] = d; });
    onChange(next);
    refs.current[Math.min(pasted.length, PIN_LENGTH - 1)]?.focus();
  };

  return (
    <div className="flex justify-center gap-3 sm:gap-4 my-2" onPaste={handlePaste}>
      {Array.from({ length: PIN_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="password"
          inputMode="numeric"
          autoComplete={autoComplete}
          aria-label={`${label} digit ${i + 1} of ${PIN_LENGTH}`}
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className={`w-[52px] h-[58px] sm:w-16 sm:h-16 text-center text-xl font-black rounded-2xl transition-all outline-none border-2 ${
            value[i]
              ? 'border-emerald-500 bg-emerald-50/30 text-slate-900 shadow-sm'
              : 'border-slate-200 bg-slate-50/70 text-slate-400 focus:bg-white focus:border-slate-900 focus:shadow-sm'
          }`}
          placeholder="•"
        />
      ))}
    </div>
  );
}

const empty = () => Array(PIN_LENGTH).fill('');

/** Mask all but the last 4 digits for display. */
const maskPhone = (p: string) => (p.length > 4 ? '•'.repeat(p.length - 4) + p.slice(-4) : p);

/** Only ever follow a same-site relative path — never an absolute/external URL. */
const safeRedirect = (raw: string | null): string => {
  if (!raw) return '/';
  const decoded = decodeURIComponent(raw);
  if (!decoded.startsWith('/') || decoded.startsWith('//')) return '/';
  return decoded;
};

export default function PinPage() {
  const router = useRouter();
  const { lang } = useParams() as { lang: string };
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const t = getTravelerDictionary(lang).auth;

  const rawMode = searchParams.get('mode');
  const phoneNumber = searchParams.get('phone') || '';
  const ticket = searchParams.get('ticket') || '';
  const redirectTo = searchParams.get('redirectTo');
  const redirectSuffix = redirectTo ? `&redirectTo=${encodeURIComponent(redirectTo)}` : '';
  const isTicketReset = rawMode === 'reset';
  const isTicketSignup = rawMode === 'signup' && !!ticket;

  const [flow, setFlow] = useState<FlowState>(() => {
    if (isTicketReset) return 'RESET_PIN';
    if (isTicketSignup) return 'NEW_USER_PIN';
    return 'CHECKING_PHONE'; // phone/check decides login vs. signup — always
  });
  const [newPinStep, setNewPinStep] = useState<1 | 2>(1);
  const [pin, setPinDigits] = useState<string[]>(empty());
  const [confirm, setConfirm] = useState<string[]>(empty());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const submitLockRef = useRef(false);

  const clearPinState = () => {
    setPinDigits(empty());
    setConfirm(empty());
    setNewPinStep(1);
  };

  const goToDestination = () => router.replace(safeRedirect(redirectTo));

  /** findOrCreateVerifiedUser's placeholder sentinel — never a real traveler's actual name. */
  const needsName = (firstName?: string, lastName?: string) => firstName === 'User' && !lastName;

  const completeAuth = async (welcome: string) => {
    const profile = await fetchCurrentUser();
    if (!profile?.id) {
      throw new Error(t.genericError.profileLoadFailed);
    }
    login({
      id: profile.id,
      name: profile.name || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'User',
      email: profile.email || '',
      phone: profile.phone || '',
      role: profile.role || 'User',
    });
    clearPinState();
    setSuccess(welcome);
    // New account (or a legacy one that never went through this) still carries
    // the placeholder name — collect a real one before this session ever sees
    // the app, instead of letting "User" reach any screen or notification.
    const goNext = needsName(profile.firstName, profile.lastName)
      ? () => router.replace(`/${lang}/auth/name?redirectTo=${encodeURIComponent(safeRedirect(redirectTo))}`)
      : goToDestination;
    setTimeout(goNext, 700);
  };

  const failWith = (err: unknown, fallbackFlow: FlowState) => {
    const ui = toAuthUiError(err, t.errors);
    setError(ui.retryAfterSeconds ? `${ui.message} (wait ~${ui.retryAfterSeconds}s)` : ui.message);
    setFlow(fallbackFlow);
    submitLockRef.current = false;
  };

  // ── Phone-check: the single source of truth for login vs. signup ────────
  useEffect(() => {
    if (isTicketReset || isTicketSignup) return;
    if (!phoneNumber) return;
    let cancelled = false;
    (async () => {
      try {
        const exists = await checkPhoneExists(phoneNumber);
        if (cancelled) return;
        const resolvedMode = exists ? 'login' : 'signup';
        setFlow(exists ? 'EXISTING_USER_PIN' : 'NEW_USER_PIN');
        if (rawMode !== resolvedMode) {
          router.replace(`/${lang}/auth/pin?mode=${resolvedMode}&phone=${phoneNumber}${redirectSuffix}`);
        }
      } catch (err) {
        if (!cancelled) failWith(err, 'ERROR');
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneNumber]);

  const handleLogin = async () => {
    if (submitLockRef.current) return;
    const pinStr = pin.join('');
    if (pinStr.length < PIN_LENGTH) { setError(format(t.pinLogin.errorIncomplete, { length: PIN_LENGTH })); return; }
    submitLockRef.current = true;
    setFlow('SUBMITTING');
    setError(null);
    try {
      await loginWithPin(phoneNumber, pinStr);
      await completeAuth(t.pinLogin.successWelcomeBack);
    } catch (err) {
      setPinDigits(empty());
      failWith(err, 'EXISTING_USER_PIN');
    }
  };

  const handleStep1Continue = () => {
    const pinStr = pin.join('');
    if (pinStr.length < PIN_LENGTH) {
      setError(format(t.pinSetup.errorIncomplete, { length: PIN_LENGTH }));
      return;
    }
    if (isWeakPin(pinStr)) {
      setError(t.pinSetup.errorTooSimple);
      return;
    }
    setError(null);
    setNewPinStep(2);
    setConfirm(empty());
  };

  const validateNewPin = (): string | null => {
    const pinStr = pin.join('');
    const confirmStr = confirm.join('');
    if (pinStr.length < PIN_LENGTH || confirmStr.length < PIN_LENGTH) return format(t.pinSetup.errorIncompleteConfirm, { length: PIN_LENGTH });
    if (pinStr !== confirmStr) return t.pinSetup.errorMismatch;
    if (isWeakPin(pinStr)) return t.pinSetup.errorTooSimple;
    return null;
  };

  const handleSignup = async () => {
    if (submitLockRef.current) return;
    const validationError = validateNewPin();
    if (validationError) {
      setError(validationError);
      if (pin.join('') !== confirm.join('')) {
        setConfirm(empty());
      }
      return;
    }
    submitLockRef.current = true;
    setFlow('SUBMITTING');
    setError(null);
    const pinStr = pin.join('');
    const confirmStr = confirm.join('');
    try {
      if (ticket) {
        await setupPin(ticket, pinStr, confirmStr);
      } else {
        await signupWithPin(phoneNumber, pinStr, confirmStr);
      }
      await completeAuth(t.pinSetup.successAccountCreated);
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'AUTH_USER_EXISTS') {
        clearPinState();
        setFlow('EXISTING_USER_PIN');
        setError(t.errors.AUTH_USER_EXISTS);
        submitLockRef.current = false;
        if (rawMode !== 'login') {
          router.replace(`/${lang}/auth/pin?mode=login&phone=${phoneNumber}${redirectSuffix}`);
        }
        return;
      }
      failWith(err, 'NEW_USER_PIN');
    }
  };

  const handleResetPin = async () => {
    if (submitLockRef.current) return;
    const validationError = validateNewPin();
    if (validationError) { setError(validationError); return; }
    submitLockRef.current = true;
    setFlow('SUBMITTING');
    setError(null);
    try {
      await resetPin(ticket, pin.join(''), confirm.join(''));
      clearPinState();
      setSuccess(t.pinSetup.successPinReset);
      setTimeout(() => router.replace(`/${lang}/auth/login`), 900);
    } catch (err) {
      failWith(err, 'RESET_PIN');
    }
  };

  const handleForgotPin = async () => {
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    setError(null);
    try {
      const challenge = await forgotPinRequest(phoneNumber);
      router.push(
        `/${lang}/auth/verify-otp?purpose=forgot&phone=${phoneNumber}&challengeId=${encodeURIComponent(challenge.challengeId)}&resendAfter=${challenge.resendAfterSeconds}${redirectSuffix}`,
      );
    } catch (err) {
      const ui = toAuthUiError(err, t.errors);
      setError(ui.message);
      submitLockRef.current = false;
    }
  };

  const changeNumber = () => router.push(`/${lang}/auth/login`);

  const submit = useCallback(() => {
    if (flow === 'EXISTING_USER_PIN') return handleLogin();
    if (flow === 'NEW_USER_PIN') {
      if (newPinStep === 1) return handleStep1Continue();
      return handleSignup();
    }
    if (flow === 'RESET_PIN') {
      if (newPinStep === 1) return handleStep1Continue();
      return handleResetPin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow, newPinStep, pin, confirm, phoneNumber, ticket]);

  // Guard: login/signup need a phone; reset needs a ticket; signup needs a
  // ticket (OTP-verified) OR a phone (direct phone-check path).
  if (
    (isTicketReset && !ticket) ||
    (!isTicketReset && !isTicketSignup && !phoneNumber) ||
    (isTicketSignup && !ticket)
  ) {
    return (
      <AuthShell lang={lang} title={t.sessionExpired.title} subtitle={t.sessionExpired.subtitle}>
        <Button onClick={() => router.push(`/${lang}/auth/login`)} className="w-full h-12 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-semibold transition-colors">
          {t.sessionExpired.backButton}
        </Button>
      </AuthShell>
    );
  }

  // Loading state while phone/check resolves
  if (flow === 'CHECKING_PHONE') {
    return (
      <AuthShell lang={lang} title={t.checkingPhone.title} subtitle={t.checkingPhone.subtitle}>
        <div className="flex justify-center py-6">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        </div>
      </AuthShell>
    );
  }

  if (flow === 'ERROR') {
    return (
      <AuthShell lang={lang} title={t.genericError.title} subtitle={error || t.genericError.subtitle}>
        <Button onClick={() => router.push(`/${lang}/auth/login`)} className="w-full h-12 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-semibold transition-colors">
          {t.genericError.backButton}
        </Button>
      </AuthShell>
    );
  }

  const isNewPinFlow = flow === 'NEW_USER_PIN' || flow === 'RESET_PIN';
  const busy = flow === 'SUBMITTING';

  // Dynamic titles and subtitles based on step
  let pageEyebrow = t.pinLogin.eyebrow;
  let pageTitle: React.ReactNode = <>{t.pinLogin.titlePrefix} <span className="text-emerald-500">{t.pinLogin.titleHighlight}</span></>;
  let pageSubtitle = phoneNumber ? format(t.pinLogin.subtitle, { maskedPhone: maskPhone(phoneNumber) }) : '';

  if (isNewPinFlow) {
    if (newPinStep === 1) {
      pageEyebrow = flow === 'RESET_PIN' ? t.pinSetup.resetLabel : format(t.pinSetup.stepOfLabel, { current: 1, total: 2 });
      pageTitle = <>{t.pinSetup.titlePrefix} <span className="text-emerald-500">{t.pinSetup.titleHighlight}</span></>;
      pageSubtitle = t.pinSetup.subtitle;
    } else {
      pageEyebrow = flow === 'RESET_PIN' ? t.pinSetup.resetLabel : format(t.pinSetup.stepOfLabel, { current: 2, total: 2 });
      pageTitle = <>{t.pinSetup.confirmTitlePrefix} <span className="text-emerald-500">{t.pinSetup.confirmTitleHighlight}</span></>;
      pageSubtitle = t.pinSetup.confirmSubtitle;
    }
  }

  const handleBack = () => {
    if (isNewPinFlow && newPinStep === 2) {
      setNewPinStep(1);
      setError(null);
    } else {
      router.push(`/${lang}/auth/login`);
    }
  };

  const isStep1Filled = pin.join('').length === PIN_LENGTH;
  const isStep2Filled = confirm.join('').length === PIN_LENGTH;
  const canProceed = isNewPinFlow
    ? newPinStep === 1
      ? isStep1Filled
      : isStep2Filled
    : isStep1Filled;

  return (
    <AuthShell
      lang={lang}
      eyebrow={pageEyebrow}
      title={pageTitle}
      subtitle={pageSubtitle}
      onBack={handleBack}
    >
      <div className="space-y-6">
        {error && (
          <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl py-2.5 px-3 text-center font-semibold">
            {error}
          </p>
        )}
        {success && (
          <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl py-2.5 px-3 text-center font-semibold">
            {success}
          </p>
        )}

        {isNewPinFlow ? (
          <div>
            {newPinStep === 1 ? (
              <PinBoxes
                key="step1-pin"
                value={pin}
                onChange={setPinDigits}
                autoFocus
                autoComplete="new-password"
                label="Set PIN"
              />
            ) : (
              <PinBoxes
                key="step2-confirm"
                value={confirm}
                onChange={setConfirm}
                autoFocus
                autoComplete="new-password"
                label="Confirm PIN"
              />
            )}
          </div>
        ) : (
          <PinBoxes
            key="login-pin"
            value={pin}
            onChange={setPinDigits}
            autoFocus
            autoComplete="current-password"
            label="PIN"
          />
        )}

        <div className="space-y-4">
          <Button
            onClick={submit}
            disabled={!canProceed || busy}
            isLoading={busy}
            className="w-full h-13 sm:h-14 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-black uppercase tracking-[0.15em] shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98]"
          >
            {isNewPinFlow
              ? newPinStep === 1
                ? t.pinSetup.continueButton
                : flow === 'RESET_PIN'
                ? t.pinSetup.saveNewPinButton
                : t.pinSetup.createAccountButton
              : t.pinLogin.signInButton}
          </Button>

          {flow === 'EXISTING_USER_PIN' && (
            <div className="text-center pt-1">
              <button
                type="button"
                disabled={busy}
                onClick={handleForgotPin}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50"
              >
                {t.pinLogin.forgotPinPrefix} <span className="text-emerald-700 underline underline-offset-2">{t.pinLogin.forgotPinLink}</span>
              </button>
            </div>
          )}

          {(!isNewPinFlow || newPinStep === 1) && (
            <div className="text-center">
              <button
                type="button"
                disabled={busy}
                onClick={changeNumber}
                className="text-xs text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50 font-medium"
              >
                {t.pinSetup.changeNumberPrefix} <span className="underline underline-offset-2">{t.pinSetup.changeNumberLink}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </AuthShell>
  );
}
