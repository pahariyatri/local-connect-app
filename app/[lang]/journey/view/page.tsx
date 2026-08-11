"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Typography from "../../components/atoms/Typography";
import Button from "../../components/atoms/Button";
import TopNavigation from "../../components/organisms/TopNavigation";
import { getTripById } from "@/services/catalogService";
import { useLocalizationContext } from "@/contexts/LocalizationContext";

interface SharedTrip {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    totalPrice: string | number;
    services: { id: number; name: string; category?: string }[];
}

export default function SharedTripPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { dict } = useLocalizationContext();
    const router = useRouter();
    const pathLang = params.lang || "en";
    const tripId = searchParams.get("tripId");

    const [trip, setTrip] = useState<SharedTrip | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!tripId) {
            setNotFound(true);
            setIsLoading(false);
            return;
        }
        (async () => {
            try {
                const raw: any = await getTripById(tripId);
                const data = raw && typeof raw === "object" && "data" in raw ? raw.data : raw;
                if (data && data.id) {
                    setTrip(data);
                } else {
                    setNotFound(true);
                }
            } catch (err) {
                console.error("Error loading shared trip:", err);
                setNotFound(true);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [tripId]);

    if (!dict || isLoading) return <div className="min-h-screen bg-slate-50" />;
    const journey = dict.page.journey;

    if (notFound || !trip) {
        return (
            <div className="min-h-screen bg-slate-50 pb-32">
                <TopNavigation title={journey.shared_title} />
                <main className="max-w-md mx-auto px-6 pt-24 text-center">
                    <p className="text-slate-800 text-sm font-bold mb-2">This trip link isn&apos;t available.</p>
                    <p className="text-slate-400 text-xs mb-6">It may have been removed, or the link is incomplete.</p>
                    <Button onClick={() => router.push(`/${pathLang}/builder`)} className="h-12 px-6 rounded-2xl">
                        Plan your own trip
                    </Button>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            <TopNavigation title={journey.shared_title} />

            <main className="max-w-md mx-auto px-6 pt-24">
                <header className="mb-10 text-center">
                    <Typography variant="h1" className="text-2xl font-black text-slate-900 leading-tight mb-2 uppercase tracking-tighter italic">
                        {trip.name}
                    </Typography>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        {trip.startDate} — {trip.endDate}
                    </p>
                </header>

                {/* Services in this trip — real data only, no fabricated
                    hour-by-hour itinerary or trip author. */}
                <div className="space-y-3">
                    {trip.services.length === 0 ? (
                        <div className="text-center py-16 bg-white/60 rounded-[2rem] border border-dashed border-slate-200">
                            <p className="text-slate-400 text-sm">No services added to this trip yet.</p>
                        </div>
                    ) : (
                        trip.services.map((service) => (
                            <div key={service.id} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                                <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">{service.name}</h4>
                                {service.category && (
                                    <span className="text-[9px] font-black text-indigo-600 uppercase mt-1 inline-block">{service.category}</span>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-8 p-5 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total</span>
                    <span className="text-lg font-black">₹{Number(trip.totalPrice).toLocaleString("en-IN")}</span>
                </div>

                <div className="mt-10">
                    <Button
                        onClick={() => router.push(`/${pathLang}/builder`)}
                        className="w-full h-16 rounded-2xl bg-indigo-600 text-white font-black shadow-2xl shadow-indigo-200 uppercase tracking-widest text-xs"
                    >
                        {journey.remix}
                    </Button>
                </div>
            </main>
        </div>
    );
}
