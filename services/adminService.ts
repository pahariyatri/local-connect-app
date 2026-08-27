/**
 * Admin Service — dashboard, analytics, vendor management
 */
import { api } from '@/lib/apiClient';

// ═══════════════════ DASHBOARD ═══════════════════

export const getDashboard = async () => {
  const raw = await api.get('/admin/dashboard', { skipCache: true });
  return (raw as any)?.data ?? raw;
};

// ═══════════════════ BOOKINGS ═══════════════════

export const getAdminBookings = async (status?: string, page = 1, limit = 20) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.append('status', status);
  return api.get(`/admin/bookings?${params.toString()}`, { skipCache: true });
};

// ═══════════════════ VENDORS ═══════════════════

export const getAdminVendors = async (page = 1, limit = 20) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const raw = await api.get(`/admin/vendors?${params.toString()}`, { skipCache: true });
  return (raw as any)?.data ?? raw;
};

export const verifyVendor = async (vendorId: string) => {
  const raw = await api.patch(`/admin/vendor/${vendorId}/verify`);
  return (raw as any)?.data ?? raw;
};

// ═══════════════════ SERVICE APPROVALS ═══════════════════

export const getPendingServices = async () => {
  const raw = await api.get('/admin/services/pending', { skipCache: true });
  return (raw as any)?.data ?? raw;
};

export const approveService = async (serviceId: number) => {
  const raw = await api.patch(`/admin/services/${serviceId}/approve`);
  return (raw as any)?.data ?? raw;
};

export const rejectService = async (serviceId: number) => {
  const raw = await api.patch(`/admin/services/${serviceId}/reject`);
  return (raw as any)?.data ?? raw;
};

// ═══════════════════ REVENUE ═══════════════════

export const getRevenue = async (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  return api.get(`/admin/revenue?${params.toString()}`, { skipCache: true });
};

// ═══════════════════ ANALYTICS ═══════════════════

export const getConversionFunnel = async (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  return api.get(`/sessions/analytics/funnel?${params.toString()}`, { skipCache: true });
};

export const getPopularDestinations = async (limit = 10) => {
  return api.get(`/sessions/analytics/destinations?limit=${limit}`, { skipCache: true });
};

export const getPopularVendors = async (limit = 10) => {
  return api.get(`/sessions/analytics/vendors?limit=${limit}`, { skipCache: true });
};

export const getTrafficSources = async (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  return api.get(`/sessions/analytics/traffic?${params.toString()}`, { skipCache: true });
};

export const getDeviceBreakdown = async (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  return api.get(`/sessions/analytics/devices?${params.toString()}`, { skipCache: true });
};

export const getAbandonedBookings = async (hoursAgo = 24) => {
  return api.get(`/sessions/analytics/abandoned?hoursAgo=${hoursAgo}`, { skipCache: true });
};

export const getVendorAnalytics = async () => {
  return api.get('/admin/vendor-analytics', { skipCache: true });
};

export const getZeroResultSearches = async (limit = 20) => {
  return api.get(`/sessions/analytics/zero-results?limit=${limit}`, { skipCache: true });
};

export const getSupplyDemandReport = async () => {
  return api.get('/sessions/analytics/supply-demand', { skipCache: true });
};

export const getVendorsPerformanceReport = async () => {
  return api.get('/sessions/analytics/vendor-performance', { skipCache: true });
};

export const getReferralReport = async () => {
  return api.get('/sessions/analytics/referrals', { skipCache: true });
};

export const createCampaign = async (data: any) => {
  return api.post('/sessions/campaigns', data);
};

export const getCampaigns = async () => {
  return api.get('/sessions/campaigns', { skipCache: true });
};

export const getCampaignRoiReport = async () => {
  return api.get('/sessions/campaigns/roi', { skipCache: true });
};
