import { API_BASE_URL } from '../utils/constants';

interface FetchOptions extends RequestInit {
    next?: {
        revalidate?: false | 0 | number;
        tags?: string[];
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetcher = async (endpoint: string, options: FetchOptions = {}): Promise<any> => {
    const cacheKey = `api_cache_${endpoint}`;
    
    // 🚀 Fast-track: Return cached data for GET requests if available
    if (!options.method || options.method === 'GET') {
        const cached = typeof window !== 'undefined' ? sessionStorage.getItem(cacheKey) : null;
        if (cached) {
            try { return JSON.parse(cached); } catch { /* ignore */ }
        }
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'API Error' }));
            throw new Error(error.message || 'API Error');
        }

        const data = await response.json();
        
        // 💾 Cache successful GET responses
        if ((!options.method || options.method === 'GET') && typeof window !== 'undefined') {
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
        }

        return data;
    } catch (error) {
        console.error('API Call Error:', error);
        throw error;
    }
};
