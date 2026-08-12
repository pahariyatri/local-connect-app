'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { verifyOtp, forgotPinVerify, requestOtp, forgotPinRequest } from '@/services/authService';
import { toAuthUiError } from '@/utils/authErrors';
import Form from '../../components/molecules/Form';
import Button from '../../components/atoms/Button';
import AuthShell from '../components/AuthShell';

const OTP_LENGTH = 6;
const DEFAULT_RESEND_COOLDOWN = 45; // backend-enforced; the visible timer is UX only

/** Mask all but the last 4 digits for display: 99999 12345 → •••••12345 */
const maskPhone = (p: string) => (p.length > 4 ? '•'.repeat(p.length - 4) + p.slice(-4) : p);

export default function VerifyOtpPage() {
  const router = useRouter();
  const { lang } = useParams() as { lang: string };
  const searchParams = useSearchParams();

  const phone = searchParams.get('phone') || '';
  const purpose = searchParams.get('purpose') === 'forgot' ? 'forgot' : 'registration';
  const initialChallengeId = searchParams.get('challengeId') || '';
  const initialResendAfter = parseInt(searchParams.get('resendAfter') || '', 10) || DEFAULT_RESEND_COOLDOWN;
  const redirectTo = searchParams.get('redirectTo');

  const [challengeId, setChallengeId] = useState(initialChallengeId);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(initialResendAfter);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Visible countdown; the backend enforces the real cooldown independently.
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && !canResend) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown, canResend]);

  const handleOtpVerification = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isVerifying) return;

    setError(null);
    setSuccess(null);
    const otpString = otp.join('');
    if (otpString.length < OTP_LENGTH) {
      setError(`Please enter all ${OTP_LENGTH} digits.`);
      return;
    }

    setIsVerifying(true);
    const redirectSuffix = redirectTo ? `&redirectTo=${encodeURIComponent(redirectTo)}` : '';
    try {
      if (purpose === 'forgot') {
        const { resetTicket } = await forgotPinVerify(challengeId, otpString);
        setSuccess('Verified! Set your new PIN...');
        router.push(`/${lang}/auth/pin?mode=reset&ticket=${encodeURIComponent(resetTicket)}${redirectSuffix}`);
        return;
      }

      const result = await verifyOtp(challengeId, otpString);
      if (result.nextStep === 'pin_setup' && result.setupTicket) {
        setSuccess('Verified! Create your PIN...');
        router.push(`/${lang}/auth/pin?mode=signup&ticket=${encodeURIComponent(result.setupTicket)}${redirectSuffix}`);
      } else {
        // Existing account — phone ownership proven, continue with PIN login.
        setSuccess('Verified! Sign in with your PIN...');
        router.push(`/${lang}/auth/pin?mode=login&phone=${phone}${redirectSuffix}`);
      }
    } catch (err) {
      const ui = toAuthUiError(err);
      setError(ui.message);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;
    setError(null);
    setSuccess(null);
    setIsResending(true);
    try {
      const challenge =
        purpose === 'forgot' ? await forgotPinRequest(phone) : await requestOtp(phone);
      // The new challenge invalidates the previous one server-side.
      setChallengeId(challenge.challengeId);
      setSuccess('New code sent.');
      setCountdown(challenge.resendAfterSeconds || DEFAULT_RESEND_COOLDOWN);
      setCanResend(false);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      const ui = toAuthUiError(err);
      setError(ui.message);
      if (ui.retryAfterSeconds) {
        setCountdown(ui.retryAfterSeconds);
        setCanResend(false);
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasteData = e.clipboardData.getData('text').slice(0, OTP_LENGTH);
    if (!/^\d+$/.test(pasteData)) return;

    const digits = pasteData.split('');
    const newOtp = Array(OTP_LENGTH).fill('');
    digits.forEach((digit, i) => {
      if (i < OTP_LENGTH) newOtp[i] = digit;
    });
    setOtp(newOtp);
    const nextIndex = Math.min(digits.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
    if (digits.length === OTP_LENGTH) {
      setTimeout(() => handleOtpVerification(), 50);
    }
  };

  // Auto-submit when all fields are filled (not while showing an error).
  useEffect(() => {
    if (otp.every((digit) => digit !== '') && !isVerifying && !error) {
      handleOtpVerification();
    }
  }, [otp]);

  if (!phone || !challengeId) {
    return (
      <AuthShell lang={lang} title="Session expired" subtitle="This verification link is incomplete. Please start over.">
        <Button onClick={() => router.push(`/${lang}/auth/login`)} className="w-full h-12 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-semibold transition-colors">
          Go to sign in
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      lang={lang}
      eyebrow={purpose === 'forgot' ? 'PIN Recovery' : 'Verification'}
      title={<>Enter the <span className="text-emerald-500">Code</span></>}
      subtitle={
        <>
          Sent to <span className="text-slate-900 font-bold">+91 {maskPhone(phone)}</span>{' '}
          <button onClick={() => router.push(`/${lang}/auth/login`)} className="text-emerald-600 font-bold underline underline-offset-2 hover:text-emerald-700">
            Change
          </button>
        </>
      }
      onBack={() => router.push(`/${lang}/auth/login`)}
    >
      <Form onSubmit={handleOtpVerification} className="space-y-6">
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

        <div className="flex justify-between gap-2.5 sm:gap-3 my-2" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              maxLength={1}
              className={`w-full h-14 sm:h-16 text-center text-xl font-black rounded-2xl transition-all outline-none border-2 ${
                digit
                  ? 'border-emerald-500 bg-emerald-50/30 text-slate-900 shadow-sm'
                  : 'border-slate-200 bg-slate-50/70 text-slate-400 focus:bg-white focus:border-slate-900 focus:shadow-sm'
              }`}
              placeholder="•"
              required
            />
          ))}
        </div>

        <div className="space-y-4">
          <Button
            type="submit"
            disabled={otp.some((digit) => !digit)}
            isLoading={isVerifying}
            className="w-full h-14 sm:h-15 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-black uppercase tracking-[0.15em] shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98]"
          >
            Verify & Continue
          </Button>

          <div className="text-center pt-1">
            <button
              type="button"
              disabled={!canResend || isResending}
              onClick={handleResend}
              className="text-xs text-slate-400 disabled:opacity-75 transition-colors font-medium"
            >
              Didn&apos;t receive a code?{' '}
              {canResend ? (
                <span className="text-emerald-700 font-bold underline underline-offset-2">
                  {isResending ? 'Sending…' : 'Resend now'}
                </span>
              ) : (
                <span className="text-slate-600 font-semibold">
                  Retry in <span className="tabular-nums">{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </Form>
    </AuthShell>
  );
}
