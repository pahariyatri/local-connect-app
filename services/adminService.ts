/**
 * Admin Service — dashboard, analytics, vendor management
 */
import { api } from '@/lib/apiClient';

// ═══════════════════ DASHBOARD ═══════════════════

export const getDashboard = async () => {
  return api.get('/admin/dashboard', { skipCache: true });
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
  return api.get(`/admin/vendors?${params.toString()}`, { skipCache: true });
};

export const verifyVendor = async (vendorId: string) => {
  return api.patch(`/admin/vendor/${vendorId}/verify`);
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
