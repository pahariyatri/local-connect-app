/**
 * Centralized API Client for Local Connect Portal — the ONE typed API layer.
 *
 * - Cookie-based auth (HttpOnly, credentials: 'include'); no JS token storage.
 * - Normalized errors: ApiClientError carries the backend's stable machine
 *   code (e.g. AUTH_OTP_INVALID) — UI must branch on codes, never messages.
 * - AbortController timeout on every request.
 * - Safe retry policy: GETs may retry once on network/5xx; mutations are NEVER
 *   retried automatically (OTP/PIN/booking/payment double-submit protection).
 * - Bounded 401 handling: one silent refresh (deduplicated) then one replay;
 *   never for /auth/* endpoints themselves — no refresh loops.
 * - Opt-in sessionStorage caching for non-personal GETs only.
 */

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000') + '/api/v1';

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes for static categories
const DEFAULT_TIMEOUT_MS = 15_000;

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
  /**
   * Opt IN to sessionStorage caching. Only for non-personal, slow-changing data
   * (categories, destinations).
   */
  sessionCache?: boolean;
  /** @deprecated No longer needed — caching is off unless `sessionCache: true`. */
  skipCache?: boolean;
  /** GET-only. Mutations never retry regardless of this value. */
  retries?: number;
  timeoutMs?: number;
}

/** Normalized API error. `code` is the backend's stable machine-readable code. */
export class ApiClientError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly retryAfterSeconds?: number;

  constructor(message: string, statusCode: number, code?: string, retryAfterSeconds?: number) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.code = code || `HTTP_${statusCode}`;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/** Offline / DNS / timeout — anything that never reached the backend. */
export class NetworkError extends Error {
  constructor(message = 'Network error') {
    super(message);
    this.name = 'NetworkError';
  }
}

class ApiClient {
  private baseUrl: string;
  /** Deduplicates concurrent silent-refresh attempts. */
  private refreshInFlight: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getCacheKey(endpoint: string): string {
    return `api_cache_${endpoint}`;
  }

  private getCached(endpoint: string): any | null {
    if (typeof window === 'undefined') return null;
    const cached = sessionStorage.getItem(this.getCacheKey(endpoint));
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) return data;
        sessionStorage.removeItem(this.getCacheKey(endpoint));
      } catch { /* ignore corrupt cache */ }
    }
    return null;
  }

  private setCache(endpoint: string, data: any): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(
        this.getCacheKey(endpoint),
        JSON.stringify({ data, timestamp: Date.now() }),
      );
    } catch { /* storage full — ignore */ }
  }

  /** One deduplicated refresh attempt. Resolves true when a new session was minted. */
  private async trySilentRefresh(): Promise<boolean> {
    if (!this.refreshInFlight) {
      this.refreshInFlight = fetch(`${this.baseUrl}/auth/token/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
        .then((res) => res.ok)
        .catch(() => false)
        .finally(() => {
          // Allow the next 401 (much later) to attempt again.
          setTimeout(() => { this.refreshInFlight = null; }, 0);
        });
    }
    return this.refreshInFlight;
  }

  private async execute(endpoint: string, fetchOptions: RequestInit, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(`${this.baseUrl}${endpoint}`, {
        ...fetchOptions,
        credentials: 'include', // HttpOnly cookie auth
        signal: fetchOptions.signal ?? controller.signal,
      });
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') throw new NetworkError('Request timed out');
      throw new NetworkError((err as Error)?.message);
    } finally {
      clearTimeout(timer);
    }
  }

  private async toError(response: Response): Promise<ApiClientError> {
    const body: any = await response.json().catch(() => ({}));
    return new ApiClientError(
      body.message || `Request failed (${response.status})`,
      response.status,
      typeof body.error === 'string' ? body.error : undefined,
      typeof body.retryAfterSeconds === 'number' ? body.retryAfterSeconds : undefined,
    );
  }

  async request<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const {
      skipAuth: _skipAuth, // auth is cookie-driven; kept for call-site compatibility
      sessionCache = false,
      skipCache = false,
      retries,
      timeoutMs = DEFAULT_TIMEOUT_MS,
      ...fetchOptions
    } = options;

    const isGet = !fetchOptions.method || fetchOptions.method === 'GET';
    const maxNetworkRetries = isGet ? (retries ?? 1) : 0; // mutations: never
    const useCache = isGet && sessionCache && !skipCache;
    const isAuthEndpoint = endpoint.startsWith('/auth/');

    if (useCache) {
      const cached = this.getCached(endpoint);
      if (cached) return cached as T;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxNetworkRetries; attempt++) {
      try {
        let response = await this.execute(endpoint, { ...fetchOptions, headers }, timeoutMs);

        // Bounded session recovery: exactly one refresh + one replay, and never
        // for auth endpoints themselves (prevents any refresh loop).
        if (response.status === 401 && !isAuthEndpoint) {
          const refreshed = await this.trySilentRefresh();
          if (refreshed) {
            response = await this.execute(endpoint, { ...fetchOptions, headers }, timeoutMs);
          }
        }

        if (!response.ok) {
          const error = await this.toError(response);
          // Retry only transport-level server failures on GETs; 4xx never retries.
          if (isGet && response.status >= 500 && attempt < maxNetworkRetries) {
            lastError = error;
            await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
            continue;
          }
          throw error;
        }

        const data = await response.json();
        if (useCache) this.setCache(endpoint, data);
        return data as T;
      } catch (error) {
        if (error instanceof ApiClientError) throw error; // definitive backend answer
        lastError = error as Error;
        if (attempt < maxNetworkRetries) {
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
          continue;
        }
        throw lastError;
      }
    }

    throw lastError ?? new NetworkError();
  }

  // ═══════════════════ CONVENIENCE METHODS ═══════════════════

  get<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any, options: ApiOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T = any>(endpoint: string, body?: any, options: ApiOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T = any>(endpoint: string, body?: any, options: ApiOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  invalidateCache(endpoint: string): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.getCacheKey(endpoint));
    }
  }

  clearAllCache(): void {
    if (typeof window === 'undefined') return;
    const keys = Object.keys(sessionStorage);
    keys.forEach((key) => {
      if (key.startsWith('api_cache_')) sessionStorage.removeItem(key);
    });
  }
}

// Singleton export
export const api = new ApiClient(API_BASE_URL);
export default api;
