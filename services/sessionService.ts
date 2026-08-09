/**
 * Session Tracking Service
 * 
 * Tracks every visitor action → powers the conversion engine.
 * Works WITHOUT login. Auto-starts on first page load.
 */
import { api, ApiClientError } from '@/lib/apiClient';

export type SessionEventType =
  // Acquisition
  | 'page_view'
  | 'landing_view'
  | 'cta_clicked'
  | 'start_planning'
  | 'signup_started'
  | 'signup_completed'
  | 'login_completed'

  // Trip Builder
  | 'trip_builder_started'
  | 'origin_selected'
  | 'destination_selected'
  | 'dates_selected'
  | 'traveler_count_selected'
  | 'interest_selected'
  | 'route_generated'
  | 'stop_added'
  | 'stop_removed'
  | 'trip_builder_completed'

  // Vendor Discovery
  | 'vendor_list_viewed'
  | 'vendor_viewed'
  | 'service_viewed'
  | 'service_filtered'
  | 'service_added_to_trip'
  | 'service_removed_from_trip'
  | 'service_replaced'

  // Trip
  | 'trip_created'
  | 'trip_saved'
  | 'trip_updated'
  | 'trip_shared'
  | 'shared_trip_viewed'
  | 'trip_duplicated'
  | 'plan_similar_trip_clicked'

  // Booking
  | 'booking_request_started'
  | 'booking_request_submitted'
  | 'vendor_request_received'
  | 'vendor_request_accepted'
  | 'vendor_request_rejected'
  | 'alternative_vendor_requested'
  | 'booking_cancelled'
  | 'booking_completed'

  // Vendor
  | 'vendor_signup_started'
  | 'vendor_signup_completed'
  | 'vendor_onboarding_started'
  | 'vendor_onboarding_completed'
  | 'vendor_service_created'
  | 'vendor_service_published'
  | 'vendor_service_updated'
  | 'vendor_booking_viewed'

  // Retention
  | 'returning_user'
  | 'journey_reopened'
  | 'repeat_trip_started'
  | 'repeat_booking_request'

  // Legacy / other
  | 'destination_view'
  | 'planner_started'
  | 'planner_completed'
  | 'vendor_clicked'
  | 'price_checked'
  | 'booking_started'
  | 'payment_started'
  | 'payment_completed'
  | 'payment_failed'
  | 'search_performed'
  | 'filter_applied'
  | 'share_itinerary'
  | 'login_started'
  | 'review_submitted'
  | 'whatsapp_clicked'
  | 'call_clicked';

const SESSION_KEY = 'lc_session_id';
const ANONYMOUS_ID_KEY = 'lc_anon_id';

class SessionTracker {
  private sessionId: string | null = null;
  private initPromise: Promise<string> | null = null;

  /**
   * Get or create a session
   */
  async getSessionId(): Promise<string> {
    if (this.sessionId && this.sessionId !== 'undefined') return this.sessionId;

    // Check localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored && stored !== 'undefined') {
        this.sessionId = stored;
        return stored;
      }
    }

    // Start a new session — only one concurrent init
    if (!this.initPromise) {
      this.initPromise = this.startSession();
    }

    return this.initPromise;
  }

  /**
   * Forget session to trigger reset
   */
  private forgetSession(): void {
    this.sessionId = null;
    this.initPromise = null;
    if (typeof window !== 'undefined') localStorage.removeItem(SESSION_KEY);
  }

  private async startSession(): Promise<string> {
    try {
      // Get UTM params from URL
      const urlParams = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : null;

      const anonId = this.getOrGenerateAnonymousId();

      const response = await api.post('/sessions/start', {
        fingerprint: this.generateFingerprint(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        platform: this.detectPlatform(),
        browser: this.detectBrowser(),
        referrer: typeof document !== 'undefined' ? (document.referrer || 'none') : 'none',
        landingPage: typeof window !== 'undefined' ? window.location.pathname : undefined,
        utmSource: urlParams?.get('utm_source') || undefined,
        utmMedium: urlParams?.get('utm_medium') || undefined,
        utmCampaign: urlParams?.get('utm_campaign') || undefined,
        utmContent: urlParams?.get('utm_content') || undefined,
        utmTerm: urlParams?.get('utm_term') || undefined,
        anonymousVisitorId: anonId,
        initialReferrer: typeof document !== 'undefined' ? (document.referrer || 'none') : 'none',
        referralCode: urlParams?.get('ref') || undefined,
      }, { skipAuth: true });

      const data = response?.data || response;
      if (data?.id) {
        this.sessionId = data.id;
        if (typeof window !== 'undefined') {
          localStorage.setItem(SESSION_KEY, data.id);
        }
        return data.id;
      }
      throw new Error('Invalid session start response');
    } catch (error) {
      console.warn('Session tracking failed:', error);
      const fallbackId = `local-${Date.now()}`;
      this.sessionId = fallbackId;
      return fallbackId;
    }
  }

  /**
   * Track a visitor event
   */
  async track(
    eventType: SessionEventType,
    options?: {
      page?: string;
      entityType?: string;
      entityId?: string;
      metadata?: Record<string, any>;
      durationMs?: number;
    },
  ): Promise<void> {
    try {
      const sessionId = await this.getSessionId();
      
      // Push to GTM/GA4/Meta Pixel if configured
      this.pushToThirdParty(eventType, options?.metadata);

      if (sessionId.startsWith('local-')) return; // Skip API log for fallback sessions

      await api.post('/sessions/event', {
        sessionId,
        eventType,
        page: options?.page || (typeof window !== 'undefined' ? window.location.pathname : undefined),
        entityType: options?.entityType,
        entityId: options?.entityId,
        metadata: options?.metadata,
        durationMs: options?.durationMs,
      }, { skipAuth: true });
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 404) this.forgetSession();
    }
  }

  /**
   * Link session to authenticated user (call after login)
   */
  async linkUser(userId: string): Promise<void> {
    try {
      const sessionId = await this.getSessionId();
      if (sessionId.startsWith('local-')) return;

      await api.post(`/sessions/${sessionId}/link-user/${userId}`, undefined, { skipAuth: true });
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 404) this.forgetSession();
    }
  }

  // ═══════════════════ HELPERS ═══════════════════

  private getOrGenerateAnonymousId(): string {
    if (typeof window === 'undefined') return 'ssr-anon';
    let anonId = localStorage.getItem(ANONYMOUS_ID_KEY);
    if (!anonId) {
      anonId = 'anon-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now();
      localStorage.setItem(ANONYMOUS_ID_KEY, anonId);
    }
    return anonId;
  }

  private pushToThirdParty(eventType: SessionEventType, metadata?: Record<string, any>): void {
    if (typeof window === 'undefined') return;

    // GA4 Gtag
    if (process.env.NEXT_PUBLIC_GA4_ID && (window as any).gtag) {
      (window as any).gtag('event', eventType, metadata || {});
    }

    // Meta Pixel
    if (process.env.NEXT_PUBLIC_META_PIXEL_ID && (window as any).fbq) {
      (window as any).fbq('track', eventType, metadata || {});
    }

    // GTM DataLayer
    if (process.env.NEXT_PUBLIC_GTM_ID && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: eventType,
        ...metadata,
      });
    }
  }

  private generateFingerprint(): string {
    if (typeof window === 'undefined') return 'ssr';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('fingerprint', 2, 2);
    }
    return btoa(
      `${navigator.userAgent}|${screen.width}x${screen.height}|${new Date().getTimezoneOffset()}|${navigator.language}`,
    ).slice(0, 32);
  }

  private detectPlatform(): string {
    if (typeof window === 'undefined') return 'server';
    const ua = navigator.userAgent.toLowerCase();
    if (/tablet|ipad/i.test(ua)) return 'tablet';
    if (/mobile|android|iphone/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  private detectBrowser(): string {
    if (typeof navigator === 'undefined') return 'unknown';
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other';
  }
}

// Singleton
export const sessionTracker = new SessionTracker();
export default sessionTracker;
