/**
 * Payout Service — real GET-only integration with the existing backend
 * `/payouts` endpoints (no new backend work; these routes already existed
 * and were simply never called from the frontend).
 */
import { api } from '@/lib/apiClient';

export interface Payout {
  id: string;
  vendorId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'rejected';
  transactionReference: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface VendorAccountingSummary {
  vendorId: string;
  totalEarnings: number;
  totalPaid: number;
  totalPending: number;
  totalProcessing: number;
  currency: string;
  payoutsCount: number;
  recentPayouts: Payout[];
}

export const getVendorPayouts = async (vendorId: string): Promise<Payout[]> => {
  const raw = await api.get(`/payouts/vendor/${vendorId}`);
  return ((raw as any)?.data ?? raw ?? []) as Payout[];
};

export const getVendorAccountingSummary = async (vendorId: string): Promise<VendorAccountingSummary> => {
  const raw = await api.get(`/payouts/vendor/${vendorId}/summary`);
  return ((raw as any)?.data ?? raw) as VendorAccountingSummary;
};
