/**
 * PrepTracker — Pre-Planning & Engagement Pipeline
 *
 * A thin, typed wrapper over sessionTracker.
 * Provides funnel-specific event methods so the rest of the app
 * never has to remember raw event type strings.
 *
 * Every event → existing /api/v1/sessions/event endpoint.
 * Zero new backend tables needed.
 */
import { sessionTracker } from '@/services/sessionService';

class PrepTracker {
  /**
   * Builder funnel steps 1–4
   */
  funnelStep(
    step: 1 | 2 | 3 | 4 | 'plan_submitted',
    metadata?: Record<string, any>,
  ): void {
    const eventTypeMap: Record<string | number, string> = {
      1: 'planner_started',
      2: 'planner_started',      // reuse planner_started for step 2+, metadata differentiates
      3: 'planner_started',
      4: 'planner_started',
      plan_submitted: 'planner_completed',
    };

    sessionTracker.track(eventTypeMap[step] as any, {
      metadata: {
        funnel_step: step,
        ...metadata,
      },
    });
  }

  /**
   * Results page: services loaded from API
   */
  resultsViewed(serviceCount: number, destinations: string[]): void {
    sessionTracker.track('destination_view', {
      metadata: {
        serviceCount,
        destinations,
      },
    });
  }

  /**
   * User clicked a service/vendor card
   */
  serviceClicked(serviceId: string, vendorId?: string, name?: string): void {
    sessionTracker.track('vendor_clicked', {
      entityType: 'service',
      entityId: serviceId,
      metadata: { vendorId, name },
    });
  }

  /**
   * User clicked "Book Now" on results page
   */
  bookingStarted(amount: number, destinations: string[]): void {
    sessionTracker.track('booking_started', {
      metadata: { amount, destinations },
    });
  }

  /**
   * Payment successfully verified by backend
   */
  paymentCompleted(bookingId: number, amount: number): void {
    sessionTracker.track('payment_completed', {
      entityType: 'booking',
      entityId: String(bookingId),
      metadata: { amount },
    });
  }

  /**
   * Payment failed or was dismissed
   */
  paymentFailed(bookingId: number, reason?: string): void {
    sessionTracker.track('payment_failed', {
      entityType: 'booking',
      entityId: String(bookingId),
      metadata: { reason },
    });
  }

  /**
   * User shared their itinerary
   */
  itineraryShared(destinations: string[], shareUrl: string): void {
    sessionTracker.track('share_itinerary', {
      metadata: { destinations, shareUrl },
    });
  }

  /**
   * Share link opened (ref=share in URL)
   */
  shareOpened(destinations?: string[]): void {
    sessionTracker.track('page_view', {
      metadata: { via: 'share_link', destinations },
    });
  }
}

// Singleton
export const prepTracker = new PrepTracker();
export default prepTracker;
