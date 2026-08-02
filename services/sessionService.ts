/**
 * Session Tracking Service
 * 
 * Tracks every visitor action → powers the conversion engine.
 * Works WITHOUT login. Auto-starts on first page load.
 */
import { api, ApiClientError } from '@/lib/apiClient';

export type SessionEventType =
  | 'page_view'
  | 'destination_view'
  | 'planner_started'
  | 'planner_completed'
  | 'vendor_clicked'
  | 'service_viewed'
  | 'price_checked'
  | 'booking_started'
  | 'booking_completed'
  | 'payment_started'
  | 'payment_completed'
  | 'payment_failed'
  | 'search_performed'
  | 'filter_applied'
  | 'share_itinerary'
  | 'login_started'
  | 'login_completed'
  | 'signup_completed'
  | 'review_submitted'
  | 'whatsapp_clicked'
  | 'call_clicked';

const SESSION_KEY = 'lc_session_id';

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
   * The cached session id can outlive the server-side record (e.g. it
   * naturally expired, or — in dev — the database was reset). Clear the
   * cache so the next getSessionId() call starts a fresh session instead
   * of repeating the same 404 forever.
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

      const response = await api.post('/sessions/start', {
        fingerprint: this.generateFingerprint(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        platform: this.detectPlatform(),
        browser: this.detectBrowser(),
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        landingPage: typeof window !== 'undefined' ? window.location.pathname : undefined,
        utmSource: urlParams?.get('utm_source') || undefined,
        utmMedium: urlParams?.get('utm_medium') || undefined,
        utmCampaign: urlParams?.get('utm_campaign') || undefined,
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
      // Generate a local fallback ID so tracking doesn't break the app
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
      if (sessionId.startsWith('local-')) return; // Skip for fallback sessions

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
      // A 404 here means the server no longer has this session (expired or,
      // in dev, the database was reset) — drop the stale cached id so the
      // *next* tracked event starts a fresh session instead of 404ing forever.
      if (err instanceof ApiClientError && err.statusCode === 404) this.forgetSession();
      // Never let tracking errors break the app
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
      // Silent fail
    }
  }

  // ═══════════════════ HELPERS ═══════════════════

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
