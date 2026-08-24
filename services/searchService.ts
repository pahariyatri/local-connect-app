import apiClient from "@/lib/apiClient";

/** Mirrors backend `PublicServiceDto` (discovery.service.ts) — the sanitized,
 * no-private-contact-info shape returned by the real discovery search API. */
export interface DiscoveryService {
    id: number;
    slug: string;
    name: string;
    category: string;
    thumbnail: string;
    images: string[];
    shortDescription: string;
    description: string;
    /** Real inclusions, or the backend's own generic fallback when a service hasn't set any — never invented client-side. */
    inclusions: string[];
    exclusions: string[];
    cancellationPolicy: string;
    termsAndConditions: string;
    capacity: number;
    isAvailable: boolean;
    serviceArea: string;
    vendor: {
        id: string;
        publicName: string;
        verified: boolean;
        /** Real vendor trustScore, or null if genuinely unrated — never invented. */
        rating: number | null;
    };
    location: {
        city: string;
        state: string;
        latitude: number | null;
        longitude: number | null;
    };
    distanceKm: number | null;
    pricing: {
        unitPrice: number;
        basePrice: number;
        currency: string;
        pricingLabel: string;
        /** Number of nights the quote covers — only meaningful for stay-type services. */
        nights?: number;
        /**
         * Unit the price is quoted in, derived server-side from the service's
         * own category tree. `night` only for the Accommodation subtree;
         * everything else is `service` and renders without a unit rather than
         * an invented one (PY-036).
         */
        priceUnit?: 'night' | 'service';
    };
}

export interface DiscoverySearchParams {
    q?: string;
    location?: string;
    category?: string;
    /** All services for one vendor — the vendor profile page's real data source (AUDIT-007). */
    vendorId?: string;
    dateFrom?: string;
    dateTo?: string;
    travelers?: number;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'recommended' | 'nearest' | 'price_low' | 'price_high' | 'popularity';
    page?: number;
    limit?: number;
    sessionId?: string;
}

export interface DiscoverySearchResult {
    services: DiscoveryService[];
    total: number;
    page: number;
    totalPages: number;
}

/**
 * The real, public marketplace search — `GET /api/v1/discovery/services`.
 * Server-side location/category/price/geo filtering against real Address
 * records (not a client-side guess). Zero-result searches are automatically
 * logged server-side (feeds the admin Supply vs Demand board) whenever a
 * `sessionId` or `location` is passed — always pass `sessionId` so that
 * tracking fires.
 */
export async function searchDiscoveryServices(params: DiscoverySearchParams): Promise<DiscoverySearchResult> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            query.append(key, String(value));
        }
    });

    const raw: any = await apiClient.get(`/discovery/services?${query.toString()}`, { skipAuth: true });
    const envelope = raw && typeof raw === "object" && "data" in raw ? raw : { data: raw, meta: {} };

    return {
        services: Array.isArray(envelope.data) ? envelope.data : [],
        total: envelope.meta?.total ?? envelope.data?.length ?? 0,
        page: envelope.meta?.page ?? params.page ?? 1,
        totalPages: envelope.meta?.totalPages ?? 1,
    };
}

export interface RecentSearch {
    id: string;
    query: string;
    type: "location" | "service" | "vendor";
    timestamp: string;
    userId?: string;
}

export interface SearchFilters {
    city?: string;
    category?: string;
    priceMin?: number;
    priceMax?: number;
    rating?: number;
    availability?: boolean;
}

class SearchService {
    async getRecentSearches(limit: number = 10): Promise<RecentSearch[]> {
        try {
            const response = await apiClient.get(`/search/recent?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching recent searches:", error);
            return [];
        }
    }

    async saveRecentSearch(search: Omit<RecentSearch, "id" | "timestamp">): Promise<void> {
        try {
            await apiClient.post("/search/recent", search);
        } catch (error) {
            console.error("Error saving recent search:", error);
        }
    }

    async searchServices(query: string, filters?: SearchFilters): Promise<any[]> {
        try {
            const params = new URLSearchParams();
            params.append("query", query);

            if (filters) {
                if (filters.city) params.append("city", filters.city);
                if (filters.category) params.append("category", filters.category);
                if (filters.priceMin) params.append("priceMin", filters.priceMin.toString());
                if (filters.priceMax) params.append("priceMax", filters.priceMax.toString());
                if (filters.rating) params.append("rating", filters.rating.toString());
                if (filters.availability) params.append("availability", filters.availability.toString());
            }

            const response = await apiClient.get(`/search/services?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error("Error searching services:", error);
            return [];
        }
    }

    async searchLocations(query: string): Promise<any[]> {
        try {
            const response = await apiClient.get(`/search/locations?query=${encodeURIComponent(query)}`);
            return response.data;
        } catch (error) {
            console.error("Error searching locations:", error);
            return [];
        }
    }

    async getPopularSearches(): Promise<string[]> {
        try {
            const response = await apiClient.get("/search/popular");
            return response.data;
        } catch (error) {
            console.error("Error fetching popular searches:", error);
            return [];
        }
    }
}

export const searchService = new SearchService();