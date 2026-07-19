import apiClient from "@/lib/apiClient";

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