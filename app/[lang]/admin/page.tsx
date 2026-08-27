"use client";

import React, { useCallback, useEffect, useState } from "react";
import Typography from "../components/atoms/Typography";
import Button from "../components/atoms/Button";
import TopNavigation from "../components/organisms/TopNavigation";
import MetricsCard from "../components/organisms/MetricsCard";
import {
    getAdminVendors,
    verifyVendor,
    getPendingServices,
    approveService,
    rejectService,
    bulkApproveServices,
    getDashboard,
    getAdminBookings,
    getConversionFunnel,
    getTrafficSources,
    getDeviceBreakdown,
    getZeroResultSearches,
    getSupplyDemandReport,
    getVendorsPerformanceReport,
    getReferralReport,
    getCampaigns,
    getCampaignRoiReport,
    createCampaign,
} from "@/services/adminService";
import { toApiUiError } from "@/utils/apiErrors";

type Tab = "overview" | "vendors" | "payouts" | "growth" | "campaigns" | "supply_demand" | "referrals";

type Vendor = { id: string; businessName: string; type: string; isVerified: boolean; createdAt: string };
type PendingService = {
    id: number;
    name: string;
    description: string;
    thumbnail: string | null;
    createdAt: string;
    vendor?: { id: string; businessName: string };
    prices?: { price: number }[];
};
type Dashboard = {
    bookings: { total: number; confirmed: number };
    revenue: { total: number; currency: string };
    vendors: { total: number; verified: number; pendingVerification: number };
    users: { total: number };
    traffic: { todaySessions: number; monthlySessions: number };
};

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [dashboard, setDashboard] = useState<Dashboard | null>(null);
    const [adminBookings, setAdminBookings] = useState<any[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const [pendingServices, setPendingServices] = useState<PendingService[]>([]);
    const [serviceActionId, setServiceActionId] = useState<number | null>(null);
    const [isBulkApproving, setIsBulkApproving] = useState(false);
    const [vendorFilter, setVendorFilter] = useState<"all" | "pending">("pending");

    // Analytics state
    const [funnelData, setFunnelData] = useState<any>(null);
    const [trafficSources, setTrafficSources] = useState<any[]>([]);
    const [deviceData, setDeviceData] = useState<any[]>([]);
    const [zeroResults, setZeroResults] = useState<any[]>([]);
    const [supplyDemand, setSupplyDemand] = useState<any[]>([]);
    const [vendorsPerformance, setVendorsPerformance] = useState<any[]>([]);
    const [referralData, setReferralData] = useState<any[]>([]);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [roiReport, setRoiReport] = useState<any[]>([]);

    // Loading states
    const [isLoading, setIsLoading] = useState(true);

    // Modal state for Campaign Creation
    const [showCampaignModal, setShowCampaignModal] = useState(false);
    const [newCampaign, setNewCampaign] = useState({
        name: "",
        channel: "google_ads",
        utmCampaign: "",
        budget: "",
        actualSpend: "",
        status: "active",
        targetLocation: "",
        targetRoute: "",
        notes: "",
        startDate: "",
        endDate: "",
    });

    const loadOverview = useCallback(async () => {
        try {
            const [vendorResult, dashboardResult, pendingServicesResult, bookingsResult] = await Promise.all([
                getAdminVendors(1, 100),
                getDashboard(),
                getPendingServices(),
                getAdminBookings(undefined, 1, 50),
            ]);
            setVendors(Array.isArray(vendorResult?.data) ? vendorResult.data : []);
            setDashboard(dashboardResult?.data || dashboardResult);
            setPendingServices(Array.isArray(pendingServicesResult) ? pendingServicesResult : []);
            setAdminBookings(Array.isArray(bookingsResult?.data) ? bookingsResult.data : []);
        } catch (err) {
            setErrorMessage(toApiUiError(err, "We could not load the dashboard.").message);
        }
    }, []);

    const loadAnalytics = useCallback(async () => {
        try {
            const [
                funnelRes,
                trafficRes,
                deviceRes,
                zeroRes,
                supplyRes,
                performanceRes,
                refRes,
                roiRes,
            ] = await Promise.all([
                getConversionFunnel(),
                getTrafficSources(),
                getDeviceBreakdown(),
                getZeroResultSearches(10),
                getSupplyDemandReport(),
                getVendorsPerformanceReport(),
                getReferralReport(),
                getCampaignRoiReport(),
            ]);

            setFunnelData(funnelRes?.data || funnelRes);
            setTrafficSources(trafficRes?.data || trafficRes || []);
            setDeviceData(deviceRes?.data || deviceRes || []);
            setZeroResults(zeroRes?.data || zeroRes || []);
            setSupplyDemand(supplyRes?.data || supplyRes || []);
            setVendorsPerformance(performanceRes?.data || performanceRes || []);
            setReferralData(refRes?.data || refRes || []);
            setRoiReport(roiRes?.data || roiRes || []);
        } catch (err) {
            console.error("Failed to load growth analytics", err);
        }
    }, []);

    const initData = useCallback(async () => {
        setIsLoading(true);
        await Promise.all([loadOverview(), loadAnalytics()]);
        setIsLoading(false);
    }, [loadOverview, loadAnalytics]);

    useEffect(() => {
        initData();
    }, [initData]);

    const handleApprove = async (vendorId: string) => {
        setApprovingId(vendorId);
        try {
            await verifyVendor(vendorId);
            setVendors((prev) => prev.map((v) => (v.id === vendorId ? { ...v, isVerified: true } : v)));
            if (dashboard) {
                setDashboard({
                    ...dashboard,
                    vendors: {
                        ...dashboard.vendors,
                        verified: dashboard.vendors.verified + 1,
                        pendingVerification: Math.max(0, dashboard.vendors.pendingVerification - 1),
                    },
                });
            }
        } catch (err) {
            setErrorMessage(toApiUiError(err, "We could not approve this vendor.").message);
        } finally {
            setApprovingId(null);
        }
    };

    const handleApproveService = async (serviceId: number) => {
        setServiceActionId(serviceId);
        try {
            await approveService(serviceId);
            setPendingServices((prev) => prev.filter((s) => s.id !== serviceId));
        } catch (err) {
            setErrorMessage(toApiUiError(err, "We could not approve this service.").message);
        } finally {
            setServiceActionId(null);
        }
    };

    const handleRejectService = async (serviceId: number) => {
        setServiceActionId(serviceId);
        try {
            await rejectService(serviceId);
            setPendingServices((prev) => prev.filter((s) => s.id !== serviceId));
        } catch (err) {
            setErrorMessage(toApiUiError(err, "We could not reject this service.").message);
        } finally {
            setServiceActionId(null);
        }
    };

    const handleBulkApproveServices = async () => {
        setIsBulkApproving(true);
        try {
            await bulkApproveServices();
            setPendingServices([]);
            const dash = await getDashboard();
            setDashboard(dash?.data || dash);
        } catch (err) {
            setErrorMessage(toApiUiError(err, "We could not bulk approve services.").message);
        } finally {
            setIsBulkApproving(false);
        }
    };

    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...newCampaign,
                budget: newCampaign.budget ? parseFloat(newCampaign.budget) : undefined,
                actualSpend: newCampaign.actualSpend ? parseFloat(newCampaign.actualSpend) : undefined,
                startDate: newCampaign.startDate ? new Date(newCampaign.startDate) : undefined,
                endDate: newCampaign.endDate ? new Date(newCampaign.endDate) : undefined,
            };
            await createCampaign(payload);
            setShowCampaignModal(false);
            setNewCampaign({
                name: "",
                channel: "google_ads",
                utmCampaign: "",
                budget: "",
                actualSpend: "",
                status: "active",
                targetLocation: "",
                targetRoute: "",
                notes: "",
                startDate: "",
                endDate: "",
            });
            const roiRes = await getCampaignRoiReport();
            setRoiReport(roiRes?.data || roiRes || []);
        } catch (err) {
            setErrorMessage(toApiUiError(err, "Failed to create campaign").message);
        }
    };

    const pendingVendorsList = vendors.filter((v) => !v.isVerified);
    const displayedVendors = vendorFilter === "pending" ? pendingVendorsList : vendors;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4" />
                    <Typography variant="p" className="text-slate-400">Loading Command Center...</Typography>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pb-32">
            <TopNavigation title="Super Admin Dashboard" />

            <main className="max-w-7xl mx-auto px-6 pt-24">
                <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <Typography variant="h1" className="text-3xl font-black text-indigo-100 leading-tight">
                            Platform Command Center
                        </Typography>
                        <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mt-1">Super Admin Core Control &amp; Analytics</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setShowCampaignModal(true)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-5 rounded-2xl text-xs shadow-md shadow-indigo-600/30"
                        >
                            + Create Campaign
                        </Button>
                    </div>
                </header>

                {errorMessage && (
                    <p role="alert" className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-2xl p-4 mb-6">{errorMessage}</p>
                )}

                {/* Command Center Tabs */}
                <div className="flex overflow-x-auto gap-2 pb-4 mb-8 border-b border-slate-800">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 ${
                            activeTab === "overview"
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        }`}
                    >
                        Command Overview
                    </button>
                    <button
                        onClick={() => setActiveTab("vendors")}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 ${
                            activeTab === "vendors"
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        }`}
                    >
                        Vendor Queue ({dashboard?.vendors.pendingVerification ?? 0})
                    </button>
                    <button
                        onClick={() => setActiveTab("payouts")}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 ${
                            activeTab === "payouts"
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        }`}
                    >
                        Payouts &amp; Settlements
                    </button>
                    <button
                        onClick={() => setActiveTab("growth")}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 ${
                            activeTab === "growth"
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        }`}
                    >
                        Growth &amp; Funnels
                    </button>
                    <button
                        onClick={() => setActiveTab("campaigns")}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 ${
                            activeTab === "campaigns"
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        }`}
                    >
                        Campaigns ROI
                    </button>
                    <button
                        onClick={() => setActiveTab("supply_demand")}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 ${
                            activeTab === "supply_demand"
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        }`}
                    >
                        Supply vs Demand
                    </button>
                    <button
                        onClick={() => setActiveTab("referrals")}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 ${
                            activeTab === "referrals"
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        }`}
                    >
                        Referral Programs
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === "overview" && (
                    <div className="space-y-8">
                        {/* High Priority Metric Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <MetricsCard
                                label="Total Revenue"
                                value={dashboard ? `₹${dashboard.revenue.total.toLocaleString()}` : "₹0"}
                                icon={<span className="text-2xl">💰</span>}
                            />
                            <MetricsCard
                                label="Total Platform Users"
                                value={dashboard ? dashboard.users.total : "0"}
                                icon={<span className="text-2xl">👥</span>}
                            />
                            <MetricsCard
                                label="Pending Vendor Verifications"
                                value={dashboard ? dashboard.vendors.pendingVerification : 0}
                                icon={<span className="text-2xl">⚡</span>}
                            />
                            <MetricsCard
                                label="Pending Service Approvals"
                                value={pendingServices.length}
                                icon={<span className="text-2xl">⏳</span>}
                            />
                        </div>

                        {/* Pending Service Approvals Queue */}
                        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <div>
                                    <Typography variant="h3" className="text-base font-black text-indigo-400 uppercase tracking-widest">
                                        Pending Service Approvals ({pendingServices.length})
                                    </Typography>
                                    <p className="text-xs text-slate-400 mt-0.5">Services awaiting moderation to appear in public traveler search</p>
                                </div>
                                {pendingServices.length > 0 && (
                                    <Button
                                        onClick={handleBulkApproveServices}
                                        disabled={isBulkApproving}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl text-xs disabled:opacity-50"
                                    >
                                        {isBulkApproving ? "Approving All..." : `Approve All (${pendingServices.length})`}
                                    </Button>
                                )}
                            </div>

                            {pendingServices.length === 0 ? (
                                <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
                                    <p className="text-sm text-slate-500 font-medium">All services have been reviewed and approved!</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                                <th className="px-4 pb-3">Vendor</th>
                                                <th className="px-4 pb-3">Service Name</th>
                                                <th className="px-4 pb-3">Description</th>
                                                <th className="px-4 pb-3">Base Price</th>
                                                <th className="px-4 pb-3">Preview</th>
                                                <th className="px-4 pb-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingServices.map((service) => (
                                                <tr key={service.id} className="border-b border-slate-800/50 text-slate-300 align-middle">
                                                    <td className="px-4 py-3.5 font-semibold text-slate-100 whitespace-nowrap">
                                                        {service.vendor?.businessName || "—"}
                                                    </td>
                                                    <td className="px-4 py-3.5 font-semibold text-indigo-300 whitespace-nowrap">
                                                        {service.name}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-slate-400 max-w-xs truncate">
                                                        {service.description || "No description"}
                                                    </td>
                                                    <td className="px-4 py-3.5 font-bold text-emerald-400 whitespace-nowrap">
                                                        {service.prices?.[0]?.price != null ? `₹${service.prices[0].price}` : "—"}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        {service.thumbnail ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={service.thumbnail} alt={service.name} className="w-14 h-10 object-cover rounded-lg border border-slate-800" />
                                                        ) : (
                                                            <span className="text-[10px] bg-slate-950 px-2 py-1 rounded text-slate-500 font-mono">NO IMAGE</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                                        <div className="flex gap-2 justify-end">
                                                            <Button
                                                                onClick={() => handleApproveService(service.id)}
                                                                disabled={serviceActionId === service.id}
                                                                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-50"
                                                            >
                                                                {serviceActionId === service.id ? "…" : "Approve"}
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleRejectService(service.id)}
                                                                disabled={serviceActionId === service.id}
                                                                className="h-8 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold disabled:opacity-50"
                                                            >
                                                                {serviceActionId === service.id ? "…" : "Reject"}
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Pending Vendors Summary */}
                            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <Typography variant="h3" className="text-base font-black text-indigo-400 uppercase tracking-widest">
                                        Pending Vendor Verifications ({pendingVendorsList.length})
                                    </Typography>
                                    <button onClick={() => setActiveTab("vendors")} className="text-xs font-bold text-indigo-400 hover:underline">View All →</button>
                                </div>
                                {pendingVendorsList.length === 0 ? (
                                    <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
                                        <p className="text-sm text-slate-500 font-medium">No pending vendor applications.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                                        {pendingVendorsList.slice(0, 5).map((vendor) => (
                                            <div key={vendor.id} className="bg-slate-950 border border-slate-800/80 p-4 rounded-2xl flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-bold text-slate-200 text-sm">{vendor.businessName}</h4>
                                                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide mt-0.5">
                                                        Applied {new Date(vendor.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={() => handleApprove(vendor.id)}
                                                    disabled={approvingId === vendor.id}
                                                    className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-50"
                                                >
                                                    {approvingId === vendor.id ? "…" : "Verify"}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Supply Gap Searches */}
                            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                                <Typography variant="h3" className="text-base font-black text-indigo-400 uppercase tracking-widest mb-4">
                                    Top Zero-Result Search Queries (Supply Gaps)
                                </Typography>
                                {zeroResults.length === 0 ? (
                                    <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
                                        <p className="text-sm text-slate-500 font-medium">No zero-result searches logged.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                                    <th className="px-3 pb-3">Keyword</th>
                                                    <th className="px-3 pb-3">Destination</th>
                                                    <th className="px-3 pb-3 text-right">Hits</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {zeroResults.map((item, idx) => (
                                                    <tr key={idx} className="border-b border-slate-800/50 text-slate-300">
                                                        <td className="px-3 py-3 font-semibold text-slate-100">{item.query}</td>
                                                        <td className="px-3 py-3 text-slate-400">{item.location || "Any"}</td>
                                                        <td className="px-3 py-3 text-right font-black text-amber-500">{item.count}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
                )}

                {/* Vendor Verification Queue Tab */}
                {activeTab === "vendors" && (
                    <div className="space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <div>
                                    <Typography variant="h3" className="text-base font-black text-indigo-400 uppercase tracking-widest">
                                        Vendor Operations &amp; Verification Queue
                                    </Typography>
                                    <p className="text-xs text-slate-400 mt-0.5">Manage partner verification statuses across Pahari Yatri network</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setVendorFilter("pending")}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold ${vendorFilter === "pending" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}
                                    >
                                        Pending Verification ({pendingVendorsList.length})
                                    </button>
                                    <button
                                        onClick={() => setVendorFilter("all")}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold ${vendorFilter === "all" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}
                                    >
                                        All Vendors ({vendors.length})
                                    </button>
                                </div>
                            </div>

                            {displayedVendors.length === 0 ? (
                                <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
                                    <p className="text-sm text-slate-500 font-medium">No vendors found for this filter.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                                <th className="px-4 pb-3">Business Name</th>
                                                <th className="px-4 pb-3">Category / Type</th>
                                                <th className="px-4 pb-3">Registered Date</th>
                                                <th className="px-4 pb-3">Verification Status</th>
                                                <th className="px-4 pb-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displayedVendors.map((vendor) => (
                                                <tr key={vendor.id} className="border-b border-slate-800/50 text-slate-300 align-middle">
                                                    <td className="px-4 py-3.5 font-bold text-slate-100 whitespace-nowrap">
                                                        {vendor.businessName}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-slate-400 uppercase tracking-wider text-[10px]">
                                                        {vendor.type || "Local Partner"}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-slate-400">
                                                        {new Date(vendor.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        {vendor.isVerified ? (
                                                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-900">
                                                                Verified
                                                            </span>
                                                        ) : (
                                                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-950 text-amber-400 border border-amber-900">
                                                                Unverified
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                                        {!vendor.isVerified && (
                                                            <Button
                                                                onClick={() => handleApprove(vendor.id)}
                                                                disabled={approvingId === vendor.id}
                                                                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-50"
                                                            >
                                                                {approvingId === vendor.id ? "…" : "Verify Vendor"}
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Financial Disbursement / Payout Queue Tab */}
                {activeTab === "payouts" && (
                    <div className="space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <div>
                                    <Typography variant="h3" className="text-base font-black text-indigo-400 uppercase tracking-widest">
                                        Financial Disbursements &amp; Settlements Queue
                                    </Typography>
                                    <p className="text-xs text-slate-400 mt-0.5">Track booking payments, platform commission, and vendor payouts</p>
                                </div>
                            </div>

                            {adminBookings.length === 0 ? (
                                <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
                                    <p className="text-sm text-slate-500 font-medium">No financial transactions recorded yet.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                                <th className="px-4 pb-3">Booking ID</th>
                                                <th className="px-4 pb-3">Date</th>
                                                <th className="px-4 pb-3">Traveler</th>
                                                <th className="px-4 pb-3 text-right">Total Fee</th>
                                                <th className="px-4 pb-3 text-right">Platform Fee (15%)</th>
                                                <th className="px-4 pb-3 text-right">Vendor Net Payout</th>
                                                <th className="px-4 pb-3">Booking Status</th>
                                                <th className="px-4 pb-3">Disbursement</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {adminBookings.map((b) => {
                                                const totalAmount = Number(b.totalAmount || b.price || 600);
                                                const platformFee = Math.round(totalAmount * 0.15);
                                                const vendorNet = totalAmount - platformFee;
                                                return (
                                                    <tr key={b.id} className="border-b border-slate-800/50 text-slate-300 align-middle">
                                                        <td className="px-4 py-3.5 font-bold text-slate-100">#{b.id}</td>
                                                        <td className="px-4 py-3.5 text-slate-400">{new Date(b.createdAt).toLocaleDateString()}</td>
                                                        <td className="px-4 py-3.5 text-slate-300">{b.user?.phone || b.user?.name || "Traveler"}</td>
                                                        <td className="px-4 py-3.5 text-right font-bold text-slate-100">₹{totalAmount}</td>
                                                        <td className="px-4 py-3.5 text-right text-indigo-400 font-bold">₹{platformFee}</td>
                                                        <td className="px-4 py-3.5 text-right text-emerald-400 font-black">₹{vendorNet}</td>
                                                        <td className="px-4 py-3.5">
                                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                                                b.status === "CONFIRMED" ? "bg-emerald-950 text-emerald-400 border border-emerald-900" : "bg-slate-800 text-slate-400"
                                                            }`}>
                                                                {b.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3.5">
                                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-950 text-blue-400 border border-blue-900">
                                                                SETTLED
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "growth" && (
                    <div className="space-y-8">
                        {/* Funnel Metrics */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                            <Typography variant="h3" className="text-base font-black text-indigo-400 uppercase tracking-widest mb-6">
                                Standard Visitor Conversion Funnel
                            </Typography>
                            {funnelData ? (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-blue-500" />
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Step 1: Session Started</p>
                                        <p className="text-2xl font-black mt-2 text-slate-100">{funnelData.totalSessions}</p>
                                        <p className="text-slate-500 text-[10px] mt-1">100% of traffic</p>
                                    </div>
                                    <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500" />
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Step 2: Planner Used</p>
                                        <p className="text-2xl font-black mt-2 text-slate-100">{funnelData.plannerStarted}</p>
                                        <p className="text-indigo-400 text-[10px] mt-1 font-bold">
                                            {funnelData.totalSessions > 0
                                                ? (Math.min(100, (funnelData.plannerStarted / funnelData.totalSessions) * 100)).toFixed(1) + "%"
                                                : "0%"} conversion
                                        </p>
                                    </div>
                                    <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-amber-500" />
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Step 3: Booking Initiated</p>
                                        <p className="text-2xl font-black mt-2 text-slate-100">{funnelData.bookingsStarted}</p>
                                        <p className="text-amber-400 text-[10px] mt-1 font-bold">
                                            {funnelData.plannerStarted > 0
                                                ? (Math.min(100, (funnelData.bookingsStarted / funnelData.plannerStarted) * 100)).toFixed(1) + "%"
                                                : "0%"} conversion
                                        </p>
                                    </div>
                                    <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Step 4: Booking Completed</p>
                                        <p className="text-2xl font-black mt-2 text-slate-100">{funnelData.paymentsCompleted}</p>
                                        <p className="text-emerald-400 text-[10px] mt-1 font-bold">
                                            {funnelData.totalSessions > 0
                                                ? (Math.min(100, (funnelData.paymentsCompleted / funnelData.totalSessions) * 100)).toFixed(1) + "%"
                                                : "0%"} overall conversion
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6">No funnel analytics loaded.</div>
                            )}
                        </div>

                        {/* Traffic Sources & Platforms */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6">
                                <Typography variant="h3" className="text-base font-black text-indigo-400 uppercase tracking-widest mb-4">
                                    UTM Attribution (Traffic Sources)
                                </Typography>
                                {trafficSources.length === 0 ? (
                                    <p className="text-xs text-slate-500 py-6">No campaign UTM traffic detected yet.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                                    <th className="px-3 pb-3">Source</th>
                                                    <th className="px-3 pb-3">Medium</th>
                                                    <th className="px-3 pb-3">Campaign</th>
                                                    <th className="px-3 pb-3 text-right">Sessions</th>
                                                    <th className="px-3 pb-3 text-right">Conversions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {trafficSources.map((item, idx) => (
                                                    <tr key={idx} className="border-b border-slate-800/50 text-slate-300">
                                                        <td className="px-3 py-3 font-semibold text-slate-200">{item.source || "direct"}</td>
                                                        <td className="px-3 py-3 text-slate-400">{item.medium || "none"}</td>
                                                        <td className="px-3 py-3 text-indigo-400">{item.campaign || "organic"}</td>
                                                        <td className="px-3 py-3 text-right font-bold text-slate-100">{item.sessions}</td>
                                                        <td className="px-3 py-3 text-right font-bold text-emerald-500">{item.conversions}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                                <Typography variant="h3" className="text-base font-black text-indigo-400 uppercase tracking-widest mb-6">
                                    Platforms &amp; Devices
                                </Typography>
                                {deviceData.length === 0 ? (
                                    <p className="text-xs text-slate-500 py-6">No device traffic detected.</p>
                                ) : (
                                    <div className="space-y-6">
                                        {deviceData.map((item, idx) => (
                                            <div key={idx} className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                                                    <span>{item.platform || "Desktop"}</span>
                                                    <span>{item.sessions} sessions ({item.conversions} conv)</span>
                                                </div>
                                                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-850">
                                                    <div
                                                        className="bg-indigo-500 h-full rounded-full"
                                                        style={{ width: `${Math.min(100, (item.sessions / Math.max(1, deviceData.reduce((acc, curr) => acc + Number(curr.sessions), 0))) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "campaigns" && (
                    <div className="space-y-8">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                            <Typography variant="h3" className="text-base font-black text-indigo-400 uppercase tracking-widest mb-6">
                                Marketing Campaign Performance &amp; ROI
                            </Typography>
                            {roiReport.length === 0 ? (
                                <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
                                    <p className="text-sm text-slate-500 font-medium mb-4">No active marketing campaigns.</p>
                                    <Button onClick={() => setShowCampaignModal(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-xl text-xs">
                                        Create First Campaign
                                    </Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                                <th className="px-4 pb-3">Name</th>
                                                <th className="px-4 pb-3">Channel</th>
                                                <th className="px-4 pb-3 text-right">Budget</th>
                                                <th className="px-4 pb-3 text-right">Spend</th>
                                                <th className="px-4 pb-3 text-right">Sessions</th>
                                                <th className="px-4 pb-3 text-right">Conversions</th>
                                                <th className="px-4 pb-3 text-right">Revenue</th>
                                                <th className="px-4 pb-3 text-right">CPC / CPA</th>
                                                <th className="px-4 pb-3 text-right">ROI</th>
                                                <th className="px-4 pb-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {roiReport.map((campaign, idx) => (
                                                <tr key={idx} className="border-b border-slate-800/50 text-slate-300">
                                                    <td className="px-4 py-3 font-semibold text-slate-100">{campaign.name}</td>
                                                    <td className="px-4 py-3 text-slate-400 uppercase tracking-wider text-[10px]">{campaign.channel}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-slate-300">₹{campaign.budget}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-slate-300">₹{campaign.spend}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-slate-100">{campaign.sessions}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-slate-100">{campaign.conversions}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-emerald-400">₹{campaign.revenue.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-right text-slate-400">
                                                        ₹{campaign.cpc} / <span className="text-amber-500">₹{campaign.cpa}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-black text-indigo-400">{campaign.roi}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                                            campaign.status === "active" ? "bg-emerald-950 text-emerald-400 border border-emerald-900" : "bg-slate-800 text-slate-400"
                                                        }`}>
                                                            {campaign.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "supply_demand" && (
                    <div className="space-y-8">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                            <Typography variant="h3" className="text-base font-black text-indigo-400 uppercase tracking-widest mb-6">
                                Supply vs Demand Performance by Location
                            </Typography>
                            {supplyDemand.length === 0 ? (
                                <p className="text-xs text-slate-500 py-6">No location data generated.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                                <th className="px-4 pb-3">Location / Region</th>
                                                <th className="px-4 pb-3 text-right">Searches (Demand)</th>
                                                <th className="px-4 pb-3 text-right">Trip Builds</th>
                                                <th className="px-4 pb-3 text-right">Bookings</th>
                                                <th className="px-4 pb-3 text-right">Active Vendors</th>
                                                <th className="px-4 pb-3 text-right">Active Services (Supply)</th>
                                                <th className="px-4 pb-3 text-right">Conversion</th>
                                                <th className="px-4 pb-3">Gap Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {supplyDemand.map((item, idx) => {
                                                const isSupplyGap = item.searches > 0 && (item.activeVendors === 0 || item.activeServices === 0);
                                                return (
                                                    <tr key={idx} className="border-b border-slate-800/50 text-slate-300">
                                                        <td className="px-4 py-3.5 font-bold text-slate-100">{item.location}</td>
                                                        <td className="px-4 py-3.5 text-right font-bold text-slate-100">{item.searches}</td>
                                                        <td className="px-4 py-3.5 text-right text-slate-300">{item.tripBuilds}</td>
                                                        <td className="px-4 py-3.5 text-right text-slate-300">{item.bookings}</td>
                                                        <td className="px-4 py-3.5 text-right text-indigo-400 font-bold">{item.activeVendors}</td>
                                                        <td className="px-4 py-3.5 text-right text-indigo-300 font-bold">{item.activeServices}</td>
                                                        <td className="px-4 py-3.5 text-right font-black text-emerald-400">{item.conversionRate}</td>
                                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                                            {isSupplyGap ? (
                                                                <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase bg-red-950 text-red-400 border border-red-900 animate-pulse">
                                                                    Supply Gap
                                                                </span>
                                                            ) : (
                                                                <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-900">
                                                                    Healthy
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Vendors General Performance Directory */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                            <Typography variant="h3" className="text-base font-black text-indigo-400 uppercase tracking-widest mb-6">
                                Individual Vendor Funnel Performance
                            </Typography>
                            {vendorsPerformance.length === 0 ? (
                                <p className="text-xs text-slate-500 py-6">No vendor metrics logged.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                                <th className="px-4 pb-3">Vendor Business Name</th>
                                                <th className="px-4 pb-3 text-right">Profile Views</th>
                                                <th className="px-4 pb-3 text-right">Service Views</th>
                                                <th className="px-4 pb-3 text-right">Added to Trip</th>
                                                <th className="px-4 pb-3 text-right">Booking Requests</th>
                                                <th className="px-4 pb-3 text-right">Acceptance Rate</th>
                                                <th className="px-4 pb-3">Verification Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vendorsPerformance.map((vendor, idx) => (
                                                <tr key={idx} className="border-b border-slate-800/50 text-slate-300">
                                                    <td className="px-4 py-3.5 font-bold text-slate-100">{vendor.businessName}</td>
                                                    <td className="px-4 py-3.5 text-right font-bold text-slate-100">{vendor.profileViews}</td>
                                                    <td className="px-4 py-3.5 text-right text-slate-300">{vendor.serviceViews}</td>
                                                    <td className="px-4 py-3.5 text-right text-slate-300">{vendor.addedToTrips}</td>
                                                    <td className="px-4 py-3.5 text-right text-amber-500 font-black">{vendor.totalRequests}</td>
                                                    <td className="px-4 py-3.5 text-right text-emerald-400 font-black">{vendor.acceptanceRate ?? "—"}</td>
                                                    <td className="px-4 py-3.5 whitespace-nowrap">
                                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                                                            vendor.isVerified ? "bg-emerald-950 text-emerald-400 border border-emerald-900" : "bg-slate-800 text-slate-400"
                                                        }`}>
                                                            {vendor.isVerified ? "Verified" : "Unverified"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "referrals" && (
                    <div className="space-y-8">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                            <Typography variant="h3" className="text-base font-black text-indigo-400 uppercase tracking-widest mb-6">
                                Vendor Referral Performance
                            </Typography>
                            {referralData.length === 0 ? (
                                <p className="text-xs text-slate-500 py-6">No referral conversions captured yet.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                                <th className="px-4 pb-3">Referral Code</th>
                                                <th className="px-4 pb-3">Referred Vendor</th>
                                                <th className="px-4 pb-3 text-right">Referred Visitors</th>
                                                <th className="px-4 pb-3 text-right">Trip Builds</th>
                                                <th className="px-4 pb-3 text-right">Booking Requests</th>
                                                <th className="px-4 pb-3 text-right">Conversion</th>
                                                <th className="px-4 pb-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {referralData.map((item, idx) => (
                                                <tr key={idx} className="border-b border-slate-800/50 text-slate-300">
                                                    <td className="px-4 py-3 font-semibold text-slate-100">{item.referralCode}</td>
                                                    <td className="px-4 py-3 text-slate-400">{item.vendorName}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-slate-100">{item.visitors}</td>
                                                    <td className="px-4 py-3 text-right text-slate-300">{item.tripBuilds}</td>
                                                    <td className="px-4 py-3 text-right text-slate-300">{item.bookings}</td>
                                                    <td className="px-4 py-3 text-right font-black text-emerald-400">{item.conversionRate}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button
                                                            onClick={() => {
                                                                const link = `${window.location.origin}/?ref=${item.referralCode}`;
                                                                navigator.clipboard.writeText(link);
                                                                alert(`Referred link copied: ${link}`);
                                                            }}
                                                            className="bg-indigo-900/50 text-indigo-400 border border-indigo-800/80 hover:bg-indigo-800 h-8 px-3 rounded-lg text-[10px] font-bold"
                                                        >
                                                            Copy Link
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Campaign Creation Modal */}
            {showCampaignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 relative shadow-2xl">
                        <button
                            onClick={() => setShowCampaignModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 font-bold"
                        >
                            ✕
                        </button>
                        <h3 className="text-lg font-black text-slate-100 mb-4">Create Marketing Campaign</h3>
                        <form onSubmit={handleCreateCampaign} className="space-y-4">
                            <div>
                                <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Campaign Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newCampaign.name}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                                    placeholder="e.g. Kasol Taxi Monsoon Promo"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Channel</label>
                                    <select
                                        value={newCampaign.channel}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, channel: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="google_ads">Google Ads</option>
                                        <option value="facebook_ads">Facebook Ads</option>
                                        <option value="instagram_organic">Instagram Organic</option>
                                        <option value="referral">Referral Code</option>
                                        <option value="whatsapp">WhatsApp Broadcast</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1">UTM Campaign Code</label>
                                    <input
                                        type="text"
                                        required
                                        value={newCampaign.utmCampaign}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, utmCampaign: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                                        placeholder="e.g. monsoon_kasol_2026"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Budget (₹)</label>
                                    <input
                                        type="number"
                                        value={newCampaign.budget}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, budget: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                                        placeholder="5000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Actual Spend (₹)</label>
                                    <input
                                        type="number"
                                        value={newCampaign.actualSpend}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, actualSpend: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                                        placeholder="2400"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Target Location</label>
                                    <input
                                        type="text"
                                        value={newCampaign.targetLocation}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, targetLocation: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                                        placeholder="Kasol"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Target Route</label>
                                    <input
                                        type="text"
                                        value={newCampaign.targetRoute}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, targetRoute: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                                        placeholder="Mandi - Kasol"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    onClick={() => setShowCampaignModal(false)}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-5 rounded-xl text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md shadow-indigo-600/30"
                                >
                                    Create Campaign
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
