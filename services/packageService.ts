/**
 * Package — create and fetch (single source: plan + selected services)
 */
import { api } from '@/lib/apiClient';

export interface CreatePackagePayload {
  name?: string;
  origin: string;
  destinations: string[];
  startDate: string;
  endDate: string;
  guestCount?: number;
  servicePreferences?: string[];
  selectedServices: Record<string, Record<string, number | null>>;
  totalPrice?: number;
  sessionId?: string;
}

export interface PackageResponse {
  id: number;
  name?: string;
  origin?: string;
  destinations?: string[];
  startDate: string;
  endDate: string;
  guestCount?: number;
  servicePreferences?: string[];
  selectedServices?: Record<string, Record<string, number | null>>;
  totalPrice?: number;
  vendorDetails?: Record<string, { id: string; name: string; image: string; price: number; category: string; description?: string }>;
  createdAt?: string;
}

export async function createPackage(payload: CreatePackagePayload): Promise<PackageResponse> {
  const result = await api.post<{ data?: PackageResponse }>('/package', payload, { skipAuth: true });
  return (result as any)?.data ?? result;
}

export async function getPackage(id: number): Promise<PackageResponse> {
  const result = await api.get<{ data?: PackageResponse }>(`/package/${id}`, { skipAuth: true });
  return (result as any)?.data ?? result;
}
