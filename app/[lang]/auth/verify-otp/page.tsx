'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { verifyOtp, forgotPinVerify, requestOtp, forgotPinRequest } from '@/services/authService';
import { toAuthUiError } from '@/utils/authErrors';
import Form from '../../components/molecules/Form';
import Button from '../../components/atoms/Button';
import Typography from '../../components/atoms/Typography';

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
        router.push(`/${lang}/auth/pin?mode=create&ticket=${encodeURIComponent(result.setupTicket)}${redirectSuffix}`);
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Session Invalid</h2>
          <p className="text-slate-500 mb-8">This verification link is incomplete. Please restart the sign-in process.</p>
          <Button onClick={() => router.push(`/${lang}/auth/login`)} className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-2 sm:p-4">
      <main className="max-w-4xl w-full bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden grid lg:grid-cols-2">

        {/* Left Side: Brand Context (Hidden on small screens) */}
        <div className="hidden lg:flex relative p-12 bg-slate-900 text-white flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px]" />

          <div className="relative z-10">
            <div
              onClick={() => router.push('/')}
              className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center font-black text-white text-xl mb-12 cursor-pointer hover:bg-white/20 transition-all"
            >
              LC
            </div>
            <h2 className="text-5xl font-black leading-[0.9] uppercase italic tracking-tighter mb-6">
              Secure <br /> Access.
            </h2>
            <div className="space-y-4">
              <p className="text-slate-400 font-medium leading-relaxed max-w-xs">
                Enter the code sent to your device to verify your identity and access your dashboard.
              </p>
              <div className="flex items-center gap-3 text-emerald-400">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">End-to-end encrypted</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              Local Connect Portal
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              v2.0
            </span>
          </div>
        </div>

        {/* Right Side: Verification Form */}
        <div className="p-6 sm:p-12 md:p-16 flex flex-col justify-center relative bg-white">
          <button
            onClick={() => router.push(`/${lang}/auth/login`)}
            className="absolute top-6 left-6 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"
            title="Go Back"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>

          <header className="mb-8 sm:mb-12 text-center lg:text-left pt-6 lg:pt-0">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-4">
              {purpose === 'forgot' ? 'PIN Recovery' : 'Identity Shield'}
            </span>
            <Typography variant="h1" className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter leading-[0.85] uppercase italic">
              Verify <br /> Phone.
            </Typography>
            <div className="mt-4 flex flex-col lg:flex-row items-center gap-2">
              <p className="text-slate-400 font-medium text-sm italic">
                Sent to <span className="text-slate-900 font-black">+91 {maskPhone(phone)}</span>
              </p>
              <button onClick={() => router.push(`/${lang}/auth/login`)} className="text-emerald-500 text-[10px] font-black uppercase tracking-widest hover:underline">
                (Change)
              </button>
            </div>
          </header>

          <Form onSubmit={handleOtpVerification} className="space-y-8 sm:space-y-10">
            {/* Feedback Banners */}
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

            <div className="flex justify-between gap-1.5 sm:gap-3 max-w-sm mx-auto lg:mx-0" onPaste={handlePaste}>
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
                  className={`w-full h-14 sm:h-20 text-center text-2xl sm:text-3xl font-black rounded-2xl transition-all outline-none border-2 ${digit ? 'border-slate-900 bg-white text-slate-900' : 'border-transparent bg-slate-50 text-slate-400'
                    } focus:bg-white focus:border-slate-900 focus:shadow-lg focus:shadow-slate-100`}
                  placeholder="•"
                  required
                />
              ))}
            </div>

            <div className="space-y-4">
              <Button
                type="submit"
                disabled={otp.some((digit) => !digit) || isVerifying}
                className="w-full h-14 sm:h-16 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest italic shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isVerifying ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Verify & Continue'
                )}
              </Button>

              <div className="text-center lg:text-left">
                <button
                  type="button"
                  disabled={!canResend || isResending}
                  onClick={handleResend}
                  className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 disabled:opacity-75 transition-colors"
                >
                  <span>Didn&apos;t receive code?</span>
                  {canResend ? (
                    <span className="text-emerald-500 underline underline-offset-4 group-hover:text-emerald-600 transition-all flex items-center gap-2">
                      {isResending ? 'Sending...' : 'Resend Now'}
                    </span>
                  ) : (
                    <span className="text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
                      Try again in <span className="font-mono tabular-nums">{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          </Form>

          <footer className="mt-12 lg:mt-24 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 text-center lg:text-left">
            &copy; 2026 Local Connect Portal, Secured by LC Auth
          </footer>
        </div>
      </main>
    </div>
  );
}
