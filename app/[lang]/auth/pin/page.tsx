'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { loginWithPin, setupPin, signupWithPin, resetPin, forgotPinRequest, requestOtp } from '@/services/authService';
import { ApiClientError } from '@/lib/apiClient';
import { toAuthUiError } from '@/utils/authErrors';
import { fetchCurrentUser } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { PIN_LENGTH, isWeakPin } from '@/utils/validation';
import Button from '../../components/atoms/Button';
import AuthShell from '../components/AuthShell';

type Mode = 'create' | 'login' | 'reset';

function PinBoxes({
  value,
  onChange,
  autoFocus,
  mask = true,
  label,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  autoFocus?: boolean;
  mask?: boolean;
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
    <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
      {Array.from({ length: PIN_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type={mask ? 'password' : 'text'}
          inputMode="numeric"
          autoComplete="off"
          aria-label={`${label} digit ${i + 1} of ${PIN_LENGTH}`}
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-lg font-semibold rounded-xl transition-colors outline-none border ${
            value[i] ? 'border-slate-900 bg-white text-slate-900' : 'border-slate-200 bg-white text-slate-400'
          } focus:border-slate-900`}
          placeholder="•"
        />
      ))}
    </div>
  );
}

const empty = () => Array(PIN_LENGTH).fill('');

/** Mask all but the last 4 digits for display. */
const maskPhone = (p: string) => (p.length > 4 ? '•'.repeat(p.length - 4) + p.slice(-4) : p);

export default function PinPage() {
  const router = useRouter();
  const { lang } = useParams() as { lang: string };
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const rawMode = searchParams.get('mode');
  const mode: Mode = rawMode === 'create' || rawMode === 'reset' ? rawMode : 'login';
  const phoneNumber = searchParams.get('phone') || '';
  const ticket = searchParams.get('ticket') || '';
  const redirectTo = searchParams.get('redirectTo');
  const redirectSuffix = redirectTo ? `&redirectTo=${encodeURIComponent(redirectTo)}` : '';

  // create/reset modes have two stages: enter → confirm
  const [stage, setStage] = useState<'enter' | 'confirm'>('enter');
  const [pin, setPinDigits] = useState<string[]>(empty());
  const [confirm, setConfirm] = useState<string[]>(empty());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Shown after a failed PIN login, as a last-resort fallback if account
  // creation itself isn't available (AUTH_DIRECT_PIN_SIGNUP off).
  const [showOtpOffer, setShowOtpOffer] = useState(false);
  // A wrong PIN and "no account yet" look identical from the backend (by
  // design, to avoid leaking which one it is) — rather than guess, offer to
  // create an account with this same PIN. If one already exists, pin/signup
  // itself says so (AUTH_USER_EXISTS) and we know it really was a wrong PIN.
  const [offerCreate, setOfferCreate] = useState(false);

  const goHome = () => router.push(redirectTo ? decodeURIComponent(redirectTo) : '/');

  const completeLogin = async (welcome: string) => {
    const profile = await fetchCurrentUser();
    login({
      id: profile.id,
      name: profile.name || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'User',
      email: profile.email || '',
      phone: profile.phone || '',
      role: profile.role || 'User',
    });
    setSuccess(welcome);
    setTimeout(goHome, 800);
  };

  const failWith = (err: unknown) => {
    const ui = toAuthUiError(err);
    setError(ui.retryAfterSeconds ? `${ui.message} (wait ~${ui.retryAfterSeconds}s)` : ui.message);
    setBusy(false);
  };

  const handleCreateOrReset = async () => {
    const pinStr = pin.join('');
    if (stage === 'enter') {
      if (pinStr.length < PIN_LENGTH) { setError(`Enter a ${PIN_LENGTH}-digit PIN.`); return; }
      // UX-only pre-check; the backend policy is authoritative.
      if (isWeakPin(pinStr)) {
        setError('That PIN is too easy to guess. Please choose a different one.');
        setPinDigits(empty());
        return;
      }
      setError(null);
      setStage('confirm');
      return;
    }
    // confirm stage
    const confirmStr = confirm.join('');
    if (confirmStr.length < PIN_LENGTH) { setError('Re-enter your PIN to confirm.'); return; }
    if (pinStr !== confirmStr) {
      setError('PINs do not match. Try again.');
      setConfirm(empty());
      setStage('enter');
      setPinDigits(empty());
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (mode === 'reset') {
        await resetPin(ticket, pinStr, confirmStr);
        // Reset revokes every session server-side — the user signs in fresh.
        setSuccess('PIN reset! Sign in with your new PIN...');
        setTimeout(() => router.push(`/${lang}/auth/login`), 900);
        return;
      }
      // AUTH_MODE='pin' testing flow: no OTP ticket, phone-based signup.
      if (ticket) {
        await setupPin(ticket, pinStr, confirmStr);
      } else {
        await signupWithPin(phoneNumber, pinStr, confirmStr);
      }
      await completeLogin('PIN created! Redirecting...');
    } catch (err) {
      failWith(err);
      if (err instanceof ApiClientError && err.code === 'AUTH_USER_EXISTS') {
        // Race: account was created between the phone check and this submit.
        setTimeout(() => router.push(`/${lang}/auth/login`), 1200);
        return;
      }
      // A consumed/expired ticket cannot be retried — restart the flow.
      setConfirm(empty());
      setStage('enter');
      setPinDigits(empty());
    }
  };

  const handleLogin = async () => {
    const pinStr = pin.join('');
    if (pinStr.length < PIN_LENGTH) { setError(`Enter your ${PIN_LENGTH}-digit PIN.`); return; }
    setBusy(true);
    setError(null);
    setShowOtpOffer(false);
    try {
      await loginWithPin(phoneNumber, pinStr);
      await completeLogin('Welcome back! Redirecting...');
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'AUTH_INVALID_CREDENTIALS') {
        // Don't clear the PIN or show an error yet — ask them to confirm it
        // once more so we can try creating an account with it directly.
        setError(null);
        setOfferCreate(true);
        setBusy(false);
        return;
      }
      failWith(err);
      setPinDigits(empty());
    }
  };

  const handleConfirmCreate = async () => {
    const pinStr = pin.join('');
    const confirmStr = confirm.join('');
    if (confirmStr.length < PIN_LENGTH) { setError('Re-enter your PIN to confirm.'); return; }
    if (pinStr !== confirmStr) {
      setError('PINs do not match. Try again.');
      setConfirm(empty());
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signupWithPin(phoneNumber, pinStr, confirmStr);
      await completeLogin('Account created! Redirecting...');
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'AUTH_USER_EXISTS') {
        // Not a new number after all — this really was a wrong PIN.
        setOfferCreate(false);
        setPinDigits(empty());
        setConfirm(empty());
        setError('Incorrect PIN for this number. Please try again.');
        setBusy(false);
        return;
      }
      if (err instanceof ApiClientError && err.code === 'AUTH_FEATURE_DISABLED') {
        // Direct signup isn't enabled in this environment — OTP is the only path.
        setOfferCreate(false);
        setShowOtpOffer(true);
        setError(null);
        setBusy(false);
        return;
      }
      failWith(err);
    }
  };

  const handleBackToLogin = () => {
    setOfferCreate(false);
    setConfirm(empty());
    setError(null);
  };

  const handleTryOtpInstead = async () => {
    setBusy(true);
    setError(null);
    try {
      const challenge = await requestOtp(phoneNumber);
      router.push(
        `/${lang}/auth/verify-otp?phone=${phoneNumber}&challengeId=${encodeURIComponent(challenge.challengeId)}&resendAfter=${challenge.resendAfterSeconds}${redirectSuffix}`,
      );
    } catch (err) {
      failWith(err);
    }
  };

  const handleForgotPin = async () => {
    setBusy(true);
    setError(null);
    try {
      const challenge = await forgotPinRequest(phoneNumber);
      router.push(
        `/${lang}/auth/verify-otp?purpose=forgot&phone=${phoneNumber}&challengeId=${encodeURIComponent(challenge.challengeId)}&resendAfter=${challenge.resendAfterSeconds}${redirectSuffix}`,
      );
    } catch (err) {
      failWith(err);
    }
  };

  const isTwoStage = mode === 'create' || mode === 'reset';
  const submit = () => {
    if (isTwoStage) return handleCreateOrReset();
    if (offerCreate) return handleConfirmCreate();
    return handleLogin();
  };

  // Guard: login needs a phone; reset needs a ticket; create needs a ticket
  // (OTP flow) OR a phone (AUTH_MODE='pin' direct-signup flow).
  if (
    (mode === 'login' && !phoneNumber) ||
    (mode === 'reset' && !ticket) ||
    (mode === 'create' && !ticket && !phoneNumber)
  ) {
    return (
      <AuthShell lang={lang} title="Session expired" subtitle="This link is incomplete or has expired. Please start over.">
        <Button onClick={() => router.push(`/${lang}/auth/login`)} className="w-full h-12 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-semibold transition-colors">
          Go to sign in
        </Button>
      </AuthShell>
    );
  }

  const activeValue = (isTwoStage && stage === 'confirm') || offerCreate ? confirm : pin;
  const setActiveValue = (isTwoStage && stage === 'confirm') || offerCreate ? setConfirm : setPinDigits;
  const filled = activeValue.join('').length === PIN_LENGTH;

  const heading = offerCreate
    ? 'Confirm your PIN'
    : isTwoStage
      ? (stage === 'confirm' ? 'Confirm your PIN' : (mode === 'reset' ? 'Choose a new PIN' : 'Create a PIN'))
      : 'Enter your PIN';

  const subtitle = offerCreate
    ? "We don't have an account for this number yet — enter your PIN once more to create one."
    : isTwoStage
      ? (stage === 'confirm'
          ? `Re-enter your ${PIN_LENGTH}-digit PIN to confirm.`
          : mode === 'reset'
            ? `Choose a new ${PIN_LENGTH}-digit PIN.`
            : `Set a ${PIN_LENGTH}-digit PIN to log in faster next time.`)
      : `Enter your ${PIN_LENGTH}-digit PIN to continue.`;

  return (
    <AuthShell
      lang={lang}
      eyebrow={mode === 'reset' ? 'Reset PIN' : mode === 'create' ? 'Set PIN' : 'PIN login'}
      title={heading}
      subtitle={
        <>
          {subtitle}{' '}
          {(mode === 'login' || (mode === 'create' && phoneNumber)) && (
            <span className="text-slate-900 font-medium">+91 {maskPhone(phoneNumber)}</span>
          )}
        </>
      }
      onBack={() => router.push(`/${lang}/auth/login`)}
    >
      <div className="space-y-6">
        <div className="min-h-[20px]" aria-live="polite">
          {error && (
            <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg py-2 px-3 text-center">
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg py-2 px-3 text-center">
              {success}
            </p>
          )}
        </div>

        <PinBoxes
          key={offerCreate ? 'offer-create' : isTwoStage ? stage : 'login'}
          value={activeValue}
          onChange={setActiveValue}
          autoFocus
          label={stage === 'confirm' || offerCreate ? 'Confirm PIN' : 'PIN'}
        />

        <div className="space-y-3">
          <Button
            onClick={submit}
            disabled={!filled}
            isLoading={busy}
            className="w-full h-12 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {offerCreate ? 'Create account' : isTwoStage ? (stage === 'confirm' ? 'Confirm PIN' : 'Continue') : 'Sign in'}
          </Button>

          {mode === 'login' && offerCreate && (
            <div className="text-center animate-fade-in">
              <button
                type="button"
                disabled={busy}
                onClick={handleBackToLogin}
                className="text-xs text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50"
              >
                Not you? <span className="underline underline-offset-2">Try a different PIN</span>
              </button>
            </div>
          )}

          {mode === 'login' && showOtpOffer && (
            <div className="text-center animate-fade-in">
              <button
                type="button"
                disabled={busy}
                onClick={handleTryOtpInstead}
                className="text-xs text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-50"
              >
                New here? <span className="text-emerald-600 underline underline-offset-2 font-semibold">Verify with OTP instead</span>
              </button>
            </div>
          )}

          {mode === 'login' && !offerCreate && (
            <div className="text-center">
              <button
                type="button"
                disabled={busy}
                onClick={handleForgotPin}
                className="text-xs text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50"
              >
                Forgot PIN? <span className="text-emerald-600 underline underline-offset-2">Recover with OTP</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </AuthShell>
  );
}
