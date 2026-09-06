/**
 * Booking Service — handles the entire booking flow
 * Rule: Never trust frontend price. Backend recalculates everything.
 */
import { api } from '@/lib/apiClient';
import { sessionTracker } from './sessionService';

export const createBooking = async (
  bookingData: {
    packageId: number;
    userId?: string;
    travelDate: string;
    guestCount: number;
  },
  /** Tracking-only context, never sent to the API — `destination` feeds the
   * admin demand report's by-city aggregation on the resulting booking_completed event. */
  trackingMeta?: { destination?: string },
) => {

  // Track booking started
  sessionTracker.track('booking_started', {
    entityType: 'trip',
    entityId: String(bookingData.packageId),
    metadata: {
      travelDate: bookingData.travelDate,
      guestCount: bookingData.guestCount,
    },
  });

  const raw = await api.post('/booking', bookingData);
  // Unwrap standardized API envelope. Reservation-fee model: this no longer
  // creates a Razorpay order — { bookingId, status, totalAmount,
  // reservationFeeAmount, itemCount, message }. Payment happens later, once
  // vendors confirm (see reserveBooking()).
  const result = (raw as any)?.data ?? raw;

  if (result?.bookingId) {
    sessionTracker.track('booking_completed', {
      entityType: 'booking',
      entityId: String(result.bookingId),
      metadata: {
        reservationFeeAmount: result.reservationFeeAmount,
        currency: result.currency,
        destination: trackingMeta?.destination,
      },
    });
  }

  // Invalidate cached data
  api.invalidateCache('/booking');

  return result;
};

export const getBooking = async (bookingId: string) => {
  const raw = await api.get(`/booking/${bookingId}`);
  return (raw as any)?.data ?? raw;
};

export const cancelBooking = async (bookingId: string) => {
  return api.post(`/booking/${bookingId}/cancel`);
};

export interface UserBookingsQuery {
  status?: string;
  page?: number;
  limit?: number;
}

export interface UserBookingsResult {
  bookings: any[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/** The logged-in traveller's own bookings ("My Trips"). See `GET /api/v1/booking`. */
export const getUserBookings = async (query: UserBookingsQuery = {}): Promise<UserBookingsResult> => {
  const params = new URLSearchParams();
  if (query.status) params.set('status', query.status);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  const qs = params.toString();

  const raw = await api.get(`/booking${qs ? `?${qs}` : ''}`, { skipCache: true });
  const result = (raw as any)?.data ?? raw;

  return {
    bookings: Array.isArray(result?.data) ? result.data : [],
    total: result?.total ?? 0,
    page: result?.page ?? 1,
    limit: result?.limit ?? 20,
    pages: result?.pages ?? 0,
  };
};

export interface VendorBookingsQuery {
  status?: string;
  page?: number;
  limit?: number;
}

export interface VendorBookingsResult {
  bookings: any[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * A vendor's bookings — backs the vendor profile/dashboard booking list.
 * See `GET /api/v1/booking/vendor/:vendorId` (backend/src/feature/booking).
 */
export const getVendorBookings = async (
  vendorId: string,
  query: VendorBookingsQuery = {},
): Promise<VendorBookingsResult> => {
  const params = new URLSearchParams();
  if (query.status) params.set('status', query.status);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  const qs = params.toString();

  const raw = await api.get(`/booking/vendor/${vendorId}${qs ? `?${qs}` : ''}`);
  const result = (raw as any)?.data ?? raw;

  return {
    bookings: Array.isArray(result?.data) ? result.data : [],
    total: result?.total ?? 0,
    page: result?.page ?? 1,
    limit: result?.limit ?? 20,
    pages: result?.pages ?? 0,
  };
};

// ─── Vendor confirmation workflow ──────────────────────────────────────

/** A vendor's booking-item request inbox. See `GET /api/v1/booking/vendor/:vendorId/items`. */
export const getVendorItems = async (vendorId: string, status?: string): Promise<any[]> => {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const raw = await api.get(`/booking/vendor/${vendorId}/items${qs}`, { skipCache: true });
  const result = (raw as any)?.data ?? raw;
  return Array.isArray(result) ? result : [];
};

/** Vendor accepts or rejects one line item. See `PATCH /api/v1/booking/items/:itemId/respond`. */
export const respondToBookingItem = async (itemId: number, decision: 'accept' | 'reject', reason?: string) => {
  const raw = await api.patch(`/booking/items/${itemId}/respond`, { decision, reason });
  api.invalidateCache('/booking');
  return (raw as any)?.data ?? raw;
};

/** Traveler swaps a rejected item for a different service. See `PATCH /api/v1/booking/:id/items/:itemId/replace`. */
export const replaceBookingItem = async (bookingId: number, itemId: number, serviceId: number) => {
  const raw = await api.patch(`/booking/${bookingId}/items/${itemId}/replace`, { serviceId });
  api.invalidateCache('/booking');
  return (raw as any)?.data ?? raw;
};

/** Traveler drops a rejected item without replacing it. See `PATCH /api/v1/booking/:id/items/:itemId/remove`. */
export const removeBookingItem = async (bookingId: number, itemId: number) => {
  const raw = await api.patch(`/booking/${bookingId}/items/${itemId}/remove`, {});
  api.invalidateCache('/booking');
  return (raw as any)?.data ?? raw;
};

/** Direct Searcher flow (AUDIT-003): book a single service without going through the multi-day Trip Planner. See `POST /api/v1/booking/direct`. */
export interface CreateDirectBookingData {
  serviceId: number;
  travelDate: string;
  endDate?: string;
  guestCount?: number;
  quantity?: number;
  notes?: string;
  idempotencyKey?: string;
}

export interface DirectBookingResult {
  bookingId: number;
  status: string;
  source: string;
  totalAmount: number;
  reservationFeeAmount: number;
  currency: string;
  itemCount: number;
  message: string;
  isDuplicate?: boolean;
}

export const createDirectBooking = async (
  data: CreateDirectBookingData,
  /** Tracking-only context, never sent to the API — see createBooking(). */
  trackingMeta?: { destination?: string },
): Promise<DirectBookingResult> => {
  sessionTracker.track('booking_started', {
    entityType: 'service',
    entityId: String(data.serviceId),
    metadata: { travelDate: data.travelDate, guestCount: data.guestCount },
  });

  const raw = await api.post('/booking/direct', data);
  const result = ((raw as any)?.data ?? raw) as DirectBookingResult;

  if (result?.bookingId) {
    sessionTracker.track('booking_completed', {
      entityType: 'booking',
      entityId: String(result.bookingId),
      metadata: {
        reservationFeeAmount: result.reservationFeeAmount,
        currency: result.currency,
        source: 'direct',
        destination: trackingMeta?.destination,
      },
    });
  }

  api.invalidateCache('/booking');
  return result;
};

/** Creates the Razorpay order for the reservation fee — only once every vendor has confirmed. See `POST /api/v1/booking/:id/reserve`. */
export const reserveBooking = async (bookingId: number): Promise<{ bookingId: number; orderId: string; amount: number; currency: string }> => {
  const raw = await api.post(`/booking/${bookingId}/reserve`, {});
  return ((raw as any)?.data ?? raw) as any;
};

/** Vendor contact details — only returns data once the booking is RESERVED (fee paid). See `GET /api/v1/booking/:id/vendor-contacts`. */
export const getBookingVendorContacts = async (bookingId: number): Promise<{ items: any[] }> => {
  const raw = await api.get(`/booking/${bookingId}/vendor-contacts`, { skipCache: true });
  return ((raw as any)?.data ?? raw) as any;
};
