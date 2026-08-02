"use client";

import React, { useCallback, useEffect, useState } from "react";
import Typography from "../components/atoms/Typography";
import Button from "../components/atoms/Button";
import TopNavigation from "../components/organisms/TopNavigation";
import MetricsCard from "../components/organisms/MetricsCard";
import { getAdminVendors, verifyVendor, getDashboard } from "@/services/adminService";
import { toApiUiError } from "@/utils/apiErrors";

// ─── Icon system — same inline-stroke-SVG convention used across the app ───

type IconName = "home" | "check" | "shield";

const ICON_PATHS: Record<IconName, React.ReactNode> = {
    home: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></>,
    check: <path d="M20 6 9 17l-5-5" />,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
};

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">
            {ICON_PATHS[name]}
        </svg>
    );
}

type Vendor = { id: string; businessName: string; type: string; isVerified: boolean; createdAt: string };
type Dashboard = { revenue: { total: number; currency: string }; users: { total: number }; vendors: { pendingVerification: number } };

export default function AdminDashboard() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [dashboard, setDashboard] = useState<Dashboard | null>(null);
    const [state, setState] = useState<"loading" | "error" | "ready">("loading");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [approvingId, setApprovingId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setState("loading");
        setErrorMessage(null);
        try {
            const [vendorResult, dashboardResult] = await Promise.all([
                getAdminVendors(1, 50),
                getDashboard(),
            ]);
            setVendors(Array.isArray(vendorResult?.data) ? vendorResult.data : []);
            setDashboard(dashboardResult);
            setState("ready");
        } catch (err) {
            setErrorMessage(toApiUiError(err, "We could not load the dashboard.").message);
            setState("error");
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleApprove = async (vendorId: string) => {
        setApprovingId(vendorId);
        try {
            await verifyVendor(vendorId);
            setVendors((prev) => prev.map((v) => (v.id === vendorId ? { ...v, isVerified: true } : v)));
        } catch (err) {
            setErrorMessage(toApiUiError(err, "We could not approve this vendor.").message);
        } finally {
            setApprovingId(null);
        }
    };

    const pendingVendors = vendors.filter((v) => !v.isVerified);

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            <TopNavigation title="Admin Control" />

            <main className="max-w-md mx-auto px-6 pt-24">
                <header className="mb-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <Typography variant="h1" className="text-3xl font-black text-indigo-900 leading-tight">
                                Platform Overview
                            </Typography>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Vendor approvals &amp; key metrics</p>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200">
                            <Icon name="shield" className="w-6 h-6" />
                        </div>
                    </div>
                </header>

                {errorMessage && (
                    <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 mb-6">{errorMessage}</p>
                )}

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <MetricsCard label="Total revenue" value={dashboard ? `₹${dashboard.revenue.total.toLocaleString()}` : "—"} icon={<Icon name="check" className="w-5 h-5" />} />
                    <MetricsCard label="Total users" value={dashboard ? dashboard.users.total : "—"} icon={<Icon name="home" className="w-5 h-5" />} />
                </div>

                <section className="mb-10">
                    <Typography variant="h3" className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">
                        Vendor applications {pendingVendors.length > 0 && `(${pendingVendors.length})`}
                    </Typography>

                    {state === "loading" && (
                        <div className="space-y-3">
                            {[0, 1].map((i) => (
                                <div key={i} className="p-5 rounded-3xl bg-white border border-slate-100 animate-pulse h-20" />
                            ))}
                        </div>
                    )}

                    {state === "ready" && pendingVendors.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                            <p className="text-sm text-slate-400 font-medium">No applications waiting for review.</p>
                        </div>
                    )}

                    {state === "ready" && (
                        <div className="space-y-4">
                            {pendingVendors.map((vendor) => (
                                <div key={vendor.id} className="bg-white border border-slate-100 p-5 rounded-3xl flex justify-between items-center">
                                    <div className="flex gap-4 items-center min-w-0">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                                            <Icon name="home" className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-slate-900 text-sm truncate">{vendor.businessName}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{vendor.type} · Applied {new Date(vendor.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleApprove(vendor.id)}
                                        disabled={approvingId === vendor.id}
                                        className="h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex-shrink-0 disabled:opacity-50"
                                    >
                                        {approvingId === vendor.id ? "Approving…" : "Approve"}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
