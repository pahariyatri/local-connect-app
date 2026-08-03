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
    <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
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
  const [pin, setPinDigits] = useState<string[]>(empty());
  const [confirm, setConfirm] = useState<string[]>(empty());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const submitLockRef = useRef(false); // belt-and-braces duplicate-submit guard

  const clearPinState = () => {
    setPinDigits(empty());
    setConfirm(empty());
  };

  const goToDestination = () => router.replace(safeRedirect(redirectTo));

  const completeAuth = async (welcome: string) => {
    const profile = await fetchCurrentUser();
    if (!profile?.id) {
      // Login/signup reported success but /auth/me came back without a
      // usable profile — a controlled error, never a silent redirect.
      throw new Error('Signed in, but your profile could not be loaded. Please try again.');
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
    setTimeout(goToDestination, 700);
  };

  const failWith = (err: unknown, fallbackFlow: FlowState) => {
    const ui = toAuthUiError(err);
    setError(ui.retryAfterSeconds ? `${ui.message} (wait ~${ui.retryAfterSeconds}s)` : ui.message);
    setFlow(fallbackFlow);
    submitLockRef.current = false;
  };

  // ── Phone-check: the single source of truth for login vs. signup ────────
  useEffect(() => {
    if (isTicketReset || isTicketSignup) return; // ownership already proven via OTP ticket
    if (!phoneNumber) return; // handled by the guard render below
    let cancelled = false;
    (async () => {
      try {
        const exists = await checkPhoneExists(phoneNumber);
        if (cancelled) return;
        const resolvedMode = exists ? 'login' : 'signup';
        setFlow(exists ? 'EXISTING_USER_PIN' : 'NEW_USER_PIN');
        // Correct the URL if it disagreed with the backend, without adding
        // a history entry (back button shouldn't bounce through both).
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
    if (pinStr.length < PIN_LENGTH) { setError(`Enter your ${PIN_LENGTH}-digit PIN.`); return; }
    submitLockRef.current = true;
    setFlow('SUBMITTING');
    setError(null);
    try {
      await loginWithPin(phoneNumber, pinStr);
      await completeAuth('Welcome back! Redirecting...');
    } catch (err) {
      setPinDigits(empty());
      failWith(err, 'EXISTING_USER_PIN');
    }
  };

  const validateNewPin = (): string | null => {
    const pinStr = pin.join('');
    const confirmStr = confirm.join('');
    if (pinStr.length < PIN_LENGTH || confirmStr.length < PIN_LENGTH) return `Enter and confirm a ${PIN_LENGTH}-digit PIN.`;
    if (pinStr !== confirmStr) return 'PINs do not match. Try again.';
    if (isWeakPin(pinStr)) return 'That PIN is too easy to guess. Please choose a different one.'; // UX pre-check; backend policy is authoritative
    return null;
  };

  const handleSignup = async () => {
    if (submitLockRef.current) return;
    const validationError = validateNewPin();
    if (validationError) { setError(validationError); return; }
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
      await completeAuth('Account created! Redirecting...');
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'AUTH_USER_EXISTS') {
        // Race: registered by someone/something else between phone/check and
        // this submit. The backend is authoritative — switch to login.
        clearPinState();
        setFlow('EXISTING_USER_PIN');
        setError('This number was just registered. Please sign in with your PIN.');
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
      // Reset revokes every session server-side — sign in fresh rather than
      // assuming this browser's session is still valid.
      clearPinState();
      setSuccess('PIN reset! Redirecting to sign in...');
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
      const ui = toAuthUiError(err);
      setError(ui.message);
      submitLockRef.current = false;
    }
  };

  const changeNumber = () => router.push(`/${lang}/auth/login`);

  const submit = useCallback(() => {
    if (flow === 'EXISTING_USER_PIN') return handleLogin();
    if (flow === 'NEW_USER_PIN') return handleSignup();
    if (flow === 'RESET_PIN') return handleResetPin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow, pin, confirm, phoneNumber, ticket]);

  // Guard: login/signup need a phone; reset needs a ticket; signup needs a
  // ticket (OTP-verified) OR a phone (direct phone-check path).
  if (
    (isTicketReset && !ticket) ||
    (!isTicketReset && !isTicketSignup && !phoneNumber) ||
    (isTicketSignup && !ticket)
  ) {
    return (
      <AuthShell lang={lang} title="Session expired" subtitle="This link is incomplete or has expired. Please start over.">
        <Button onClick={() => router.push(`/${lang}/auth/login`)} className="w-full h-12 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-semibold transition-colors">
          Go to sign in
        </Button>
      </AuthShell>
    );
  }

  // Loading state while phone/check resolves — never the wrong form.
  if (flow === 'CHECKING_PHONE') {
    return (
      <AuthShell lang={lang} title="One moment" subtitle="Checking your number...">
        <div className="flex justify-center py-6">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        </div>
      </AuthShell>
    );
  }

  if (flow === 'ERROR') {
    return (
      <AuthShell lang={lang} title="Something went wrong" subtitle={error || 'We could not check that number. Please try again.'}>
        <Button onClick={() => router.push(`/${lang}/auth/login`)} className="w-full h-12 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-semibold transition-colors">
          Go back
        </Button>
      </AuthShell>
    );
  }

  const isNewPinFlow = flow === 'NEW_USER_PIN' || flow === 'RESET_PIN';
  const busy = flow === 'SUBMITTING';
  const filled = isNewPinFlow
    ? pin.join('').length === PIN_LENGTH && confirm.join('').length === PIN_LENGTH
    : pin.join('').length === PIN_LENGTH;

  const heading = flow === 'RESET_PIN' ? 'Choose a new PIN' : isNewPinFlow ? 'Set your PIN' : 'Enter your PIN';
  const subtitle = flow === 'RESET_PIN'
    ? `Choose a new ${PIN_LENGTH}-digit PIN.`
    : isNewPinFlow
      ? `Create a ${PIN_LENGTH}-digit PIN for`
      : `Enter the ${PIN_LENGTH}-digit PIN for`;

  return (
    <AuthShell
      lang={lang}
      eyebrow={flow === 'RESET_PIN' ? 'Reset PIN' : isNewPinFlow ? 'Set PIN' : 'PIN login'}
      title={heading}
      subtitle={
        <>
          {subtitle}{' '}
          {phoneNumber && <span className="text-slate-900 font-medium">+91 {maskPhone(phoneNumber)}</span>}
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

        {isNewPinFlow ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 text-center">Enter PIN</p>
              <PinBoxes value={pin} onChange={setPinDigits} autoFocus autoComplete="new-password" label="PIN" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 text-center">Confirm PIN</p>
              <PinBoxes value={confirm} onChange={setConfirm} autoComplete="new-password" label="Confirm PIN" />
            </div>
          </div>
        ) : (
          <PinBoxes value={pin} onChange={setPinDigits} autoFocus autoComplete="current-password" label="PIN" />
        )}

        <div className="space-y-3">
          <Button
            onClick={submit}
            disabled={!filled || busy}
            isLoading={busy}
            className="w-full h-12 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {flow === 'RESET_PIN' ? 'Save new PIN' : flow === 'NEW_USER_PIN' ? 'Create account' : 'Sign in'}
          </Button>

          {flow === 'EXISTING_USER_PIN' && (
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

          {(flow === 'EXISTING_USER_PIN' || flow === 'NEW_USER_PIN') && (
            <div className="text-center">
              <button
                type="button"
                disabled={busy}
                onClick={changeNumber}
                className="text-xs text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50"
              >
                Not your number? <span className="underline underline-offset-2">Change it</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </AuthShell>
  );
}
