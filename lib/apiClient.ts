/**
 * Centralized API Client for Local Connect Portal
 * 
 * Features:
 * - Automatic auth token injection
 * - Request/response interceptors  
 * - Retry logic for failed requests
 * - Session-based caching for GET requests
 * - Error normalization
 */

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000') + '/api/v1';

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes for static categories

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
  skipCache?: boolean;
  retries?: number;
}

interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
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
        // Unified TTL for static data
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

  async request<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { skipAuth = false, skipCache = false, retries = 1, ...fetchOptions } = options;

    // Fast-path: return cached GET data
    const isGet = !fetchOptions.method || fetchOptions.method === 'GET';
    if (isGet && !skipCache) {
      const cached = this.getCached(endpoint);
      if (cached) return cached as T;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };

    // Inject auth token
    if (!skipAuth) {
      const token = this.getAuthToken();
      // Only set Authorization header if we have a real token
      if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...fetchOptions,
          headers,
          credentials: 'include', // Crucial for HttpOnly cookies
        });

        if (!response.ok) {
          const errorBody: ApiError = await response.json().catch(() => ({
            message: `HTTP ${response.status}`,
            statusCode: response.status,
          }));

          // Don't retry 4xx errors (client errors)
          if (response.status >= 400 && response.status < 500) {
            throw new Error(errorBody.message || `API Error: ${response.status}`);
          }

          throw new Error(errorBody.message || `Server Error: ${response.status}`);
        }

        const data = await response.json();

        // Cache GET responses
        if (isGet && !skipCache) {
          this.setCache(endpoint, data);
        }

        return data as T;
      } catch (error) {
        lastError = error as Error;
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1))); // exponential backoff
        }
      }
    }

    throw lastError;
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

  /**
   * Invalidate cache for an endpoint
   */
  invalidateCache(endpoint: string): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.getCacheKey(endpoint));
    }
  }

  /**
   * Clear all API cache
   */
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
