'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { requestOtp } from '@/services/authService';
import { toAuthUiError } from '@/utils/authErrors';
import Typography from '../../components/atoms/Typography';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Link from 'next/link';
import { sanitizePhone, isValidPhone, PHONE_LENGTH } from '@/utils/validation';

export default function SendOtpPage({ params }: { params: Promise<{ lang: string }> }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locale, setLocale] = useState<string>('en');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    params.then((p) => setLocale(p.lang));
  }, [params]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone(phone)) return;
    setError(null);
    setLoading(true);

    try {
      // The OTP is delivered out-of-band only — never echoed, never logged.
      const challenge = await requestOtp(phone);

      const redirectTo = searchParams.get('redirectTo');
      let verifyUrl = `/${locale}/auth/verify-otp?phone=${encodeURIComponent(phone)}&challengeId=${encodeURIComponent(challenge.challengeId)}&resendAfter=${challenge.resendAfterSeconds}`;
      if (redirectTo) verifyUrl += `&redirectTo=${encodeURIComponent(redirectTo)}`;
      router.push(verifyUrl);
    } catch (err) {
      setError(toAuthUiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-2 sm:p-4">
      <main className="max-w-4xl w-full bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden grid lg:grid-cols-2">

        {/* Left panel, hidden on mobile */}
        <div className="hidden lg:flex relative p-12 bg-slate-900 text-white flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[60px]" />

          <div className="relative z-10">
            <Link href={`/${locale}`} className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center font-black text-white text-xl mb-12 hover:bg-white/20 transition-all">
              LC
            </Link>
            <h2 className="text-5xl font-black leading-[0.9] uppercase italic tracking-tighter mb-6">
              Your Legend <br /> Journey <br /> Starts.
            </h2>
            <div className="space-y-4">
              <p className="text-slate-400 font-medium leading-relaxed max-w-xs">
                Enter your mobile number to access Himalayan experiences curated by local experts.
              </p>
              <div className="flex items-center gap-3 text-emerald-400">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">No password needed</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">PahariYatri</span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">v2.0</span>
          </div>
        </div>

        {/* Right panel, main form */}
        <div className="p-6 sm:p-12 md:p-16 flex flex-col justify-center relative bg-white">
          <button
            onClick={() => router.back()}
            className="absolute top-6 left-6 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all lg:hidden"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <header className="mb-10 text-center lg:text-left pt-6 lg:pt-0">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-4">
              Secure Access
            </span>
            <Typography variant="h1" className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter leading-[0.85] uppercase italic">
              Welcome, <br /> Yatri.
            </Typography>
            <p className="mt-4 text-slate-400 font-medium text-sm">Enter your mobile to receive a one-time code.</p>
          </header>

          <form onSubmit={handleSendOtp} className="space-y-6">
            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 block">
                Mobile Number
              </label>
              <div className="flex gap-2">
                <div className="h-14 px-4 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center font-black text-slate-400 text-sm shrink-0">
                  +91
                </div>
                <Input
                  name="phone"
                  autoFocus
                  type="tel"
                  placeholder="00000 00000"
                  value={phone}
                  onChange={(e) => setPhone(sanitizePhone(e.target.value))}
                  className="h-14 rounded-2xl text-lg font-black tracking-[0.1em] placeholder:text-slate-200 flex-1"
                  maxLength={PHONE_LENGTH}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Button
                type="submit"
                disabled={!isValidPhone(phone) || loading}
                className={`w-full h-16 rounded-2xl text-base font-black tracking-widest transition-all uppercase italic shadow-xl ${
                  loading || !isValidPhone(phone)
                    ? 'bg-slate-200 text-slate-400'
                    : 'bg-slate-900 hover:bg-black text-white shadow-slate-200 active:scale-95'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="w-5 h-5 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
                    Sending code...
                  </span>
                ) : (
                  'Get OTP'
                )}
              </Button>

              <div className="relative py-2 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100" />
                </div>
                <span className="relative px-2 bg-white text-[9px] font-black text-slate-300 uppercase tracking-widest">Or try</span>
              </div>

              <button
                type="button"
                onClick={() => router.push(`/${locale}/auth/login`)}
                className="w-full h-14 rounded-2xl border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-emerald-50 hover:border-emerald-100 hover:text-emerald-600 transition-all flex items-center justify-center gap-3"
              >
                💬 WhatsApp Login
              </button>
            </div>

            <div className="text-center mt-6">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">
                By continuing, you agree to our{' '}
                <Link href={`/${locale}/terms-conditions`} className="text-emerald-500/60 underline px-1">Terms</Link>
                &{' '}
                <Link href={`/${locale}/privacy-policy`} className="text-emerald-500/60 underline px-1">Privacy</Link>
              </p>
            </div>
          </form>

          <footer className="mt-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 text-center lg:text-left">
            &copy; 2026 PahariYatri, Secured by LC Auth
          </footer>
        </div>
      </main>
    </div>
  );
}
