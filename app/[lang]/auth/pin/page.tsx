'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { loginWithPin, setupPin, resetPin, forgotPinRequest } from '@/services/authService';
import { toAuthUiError } from '@/utils/authErrors';
import { fetchCurrentUser } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { PIN_LENGTH, isWeakPin } from '@/utils/validation';
import Button from '../../components/atoms/Button';
import Typography from '../../components/atoms/Typography';

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
    <div className="flex justify-center gap-3 sm:gap-4 max-w-xs mx-auto lg:mx-0" onPaste={handlePaste}>
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
          className={`w-14 h-16 sm:w-16 sm:h-20 text-center text-2xl sm:text-3xl font-black rounded-2xl transition-all outline-none border-2 ${
            value[i] ? 'border-slate-900 bg-white text-slate-900' : 'border-transparent bg-slate-50 text-slate-400'
          } focus:bg-white focus:border-slate-900 focus:shadow-lg focus:shadow-slate-100`}
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
      await setupPin(ticket, pinStr, confirmStr);
      await completeLogin('PIN created! Redirecting...');
    } catch (err) {
      failWith(err);
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
    try {
      await loginWithPin(phoneNumber, pinStr);
      await completeLogin('Welcome back! Redirecting...');
    } catch (err) {
      failWith(err);
      setPinDigits(empty());
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
  const submit = () => (isTwoStage ? handleCreateOrReset() : handleLogin());

  // Guard: login needs a phone; create/reset need a ticket.
  if ((mode === 'login' && !phoneNumber) || (isTwoStage && !ticket)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Session Invalid</h2>
          <p className="text-slate-500 mb-8">This link is incomplete or has expired. Please restart the sign-in process.</p>
          <Button onClick={() => router.push(`/${lang}/auth/login`)} className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold">Go to Login</Button>
        </div>
      </div>
    );
  }

  const activeValue = isTwoStage && stage === 'confirm' ? confirm : pin;
  const setActiveValue = isTwoStage && stage === 'confirm' ? setConfirm : setPinDigits;
  const filled = activeValue.join('').length === PIN_LENGTH;

  const heading = isTwoStage
    ? (stage === 'confirm' ? <>Confirm <br /> PIN.</> : (mode === 'reset' ? <>New <br /> PIN.</> : <>Create <br /> PIN.</>))
    : <>Enter <br /> PIN.</>;

  const subtitle = isTwoStage
    ? (stage === 'confirm'
        ? `Re-enter your ${PIN_LENGTH}-digit PIN to confirm.`
        : mode === 'reset'
          ? `Choose a new ${PIN_LENGTH}-digit PIN.`
          : `Set a ${PIN_LENGTH}-digit PIN to log in faster next time.`)
    : `Enter your ${PIN_LENGTH}-digit PIN to continue.`;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-2 sm:p-4">
      <main className="max-w-4xl w-full bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden grid lg:grid-cols-2">

        {/* Brand panel */}
        <div className="hidden lg:flex relative p-12 bg-slate-900 text-white flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
          <div className="relative z-10">
            <div onClick={() => router.push('/')} className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center font-black text-white text-xl mb-12 cursor-pointer hover:bg-white/20 transition-all">LC</div>
            <h2 className="text-5xl font-black leading-[0.9] uppercase italic tracking-tighter mb-6">
              {isTwoStage ? <>Your <br /> Key.</> : <>Quick <br /> Access.</>}
            </h2>
            <div className="flex items-center gap-3 text-emerald-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">PIN secured</span>
            </div>
          </div>
          <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Local Connect Portal</span>
        </div>

        {/* Form panel */}
        <div className="p-6 sm:p-12 md:p-16 flex flex-col justify-center relative bg-white">
          <button
            onClick={() => router.push(`/${lang}/auth/login`)}
            className="absolute top-6 left-6 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"
            title="Go Back"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>

          <header className="mb-8 sm:mb-10 text-center lg:text-left pt-6 lg:pt-0">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-4">
              {mode === 'reset' ? 'Reset your PIN' : mode === 'create' ? 'Set your PIN' : 'PIN Login'}
            </span>
            <Typography variant="h1" className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter leading-[0.85] uppercase italic">
              {heading}
            </Typography>
            <p className="mt-4 text-slate-400 font-medium text-sm italic">
              {subtitle}{' '}
              {mode === 'login' && (
                <span className="text-slate-900 font-black not-italic">+91 {maskPhone(phoneNumber)}</span>
              )}
            </p>
          </header>

          <div className="space-y-8">
            <div className="min-h-[40px]" aria-live="polite">
              {error && (
                <div role="alert" className="p-3 sm:p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest text-center animate-fade-in">
                  {success}
                </div>
              )}
            </div>

            <PinBoxes
              key={isTwoStage ? stage : 'login'}
              value={activeValue}
              onChange={setActiveValue}
              autoFocus
              label={stage === 'confirm' ? 'Confirm PIN' : 'PIN'}
            />

            <div className="space-y-4">
              <Button
                onClick={submit}
                disabled={!filled || busy}
                className="w-full h-14 sm:h-16 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest italic shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {busy ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isTwoStage ? (stage === 'confirm' ? 'Confirm PIN' : 'Continue') : 'Login'}
              </Button>

              {mode === 'login' && (
                <div className="text-center lg:text-left">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleForgotPin}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-500 transition-colors disabled:opacity-50"
                  >
                    Forgot PIN? <span className="text-emerald-500 underline underline-offset-4">Recover with OTP</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
