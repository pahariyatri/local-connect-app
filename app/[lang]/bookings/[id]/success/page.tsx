"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Typography from "../../../components/atoms/Typography";
import Button from "../../../components/atoms/Button";
import Link from "next/link";
import confetti from "canvas-confetti";

export default function BookingSuccessPage() {
    const { lang, id } = useParams();
    const router = useRouter();

    useEffect(() => {
        // Trigger confetti on mount
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() { // eslint-disable-line @typescript-eslint/no-explicit-any
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-emerald-500 relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
            
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-48 h-48 bg-emerald-300/20 rounded-full blur-3xl animate-pulse" />
            </div>

            <div className="relative z-10 max-w-sm w-full bg-white rounded-[3rem] p-8 shadow-2xl shadow-emerald-900/20 animate-slide-up">
                
                <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto mb-6 flex items-center justify-center animate-bounce">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>

                <p className="text-emerald-600 font-black uppercase tracking-widest text-xs mb-2">Payment Successful</p>
                <Typography variant="h1" className="text-3xl font-black text-slate-900 mb-2">
                    You&apos;re Going to the Mountains! 🏔️
                </Typography>
                <p className="text-slate-500 text-sm font-medium mb-8">
                    Booking ID: <span className="text-slate-900 font-bold">{id}</span><br/>
                    A confirmation email is on its way.
                </p>

                <div className="space-y-3">
                    <Button 
                        onClick={() => router.push(`/${lang}/bookings`)}
                        className="w-full h-14 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-widest hover:bg-emerald-600 active:scale-95 transition-all shadow-lg shadow-emerald-500/30"
                    >
                        View My Trip
                    </Button>
                    <Link href={`/${lang}/`} className="block w-full py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                        Back to Home
                    </Link>
                </div>

            </div>

             <div className="mt-12 text-white/80 text-[10px] font-bold uppercase tracking-widest animate-fade-in delay-1000">
                Crafted with love by Local Connect
            </div>

        </div>
    );
}
