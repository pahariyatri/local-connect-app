import { create } from "zustand";
import apiClient from "@/lib/apiClient";
import { ENDPOINTS } from "@/utils/constants";

interface Service {
    id: string;
    name: string;
    category: string;
    subcategory: string;
    location: string;
    price: number;
}

interface FilterState {
    filters: {
        subcategoryId?: number;
        city?: string;
        state?: string;
        minPrice?: number;
        maxPrice?: number;
        sortBy?: 'price' | 'rating' | 'distance' | 'popularity' | 'created_at';
        sortOrder?: 'ASC' | 'DESC';
        isAvailable?: boolean;
        searchQuery?: string;
        categoryType?: 'stay' | 'activity' | 'travel' | 'food';
        page?: number;
        take?: number;
    };
    services: Service[];
    total: number;
    loading: boolean;
    setFilters: (filters: Partial<FilterState["filters"]>) => void;
    fetchServices: () => Promise<void>;
    setPage: (page: number) => void;
}

export const useServiceStore = create<FilterState>((set, get) => ({
    filters: {
        subcategoryId: undefined,
        city: "",
        state: "",
        minPrice: undefined,
        maxPrice: undefined,
        sortBy: 'created_at',
        sortOrder: 'DESC',
        isAvailable: true,
        searchQuery: "",
        categoryType: undefined,
        page: 0,
        take: 10
    },
    services: [],
    total: 0,
    loading: false,

    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters, page: 0 }, // Reset to first page when filters change
        }));
        get().fetchServices();
    },

    setPage: (page) => {
        set((state) => ({
            filters: { ...state.filters, page },
        }));
        get().fetchServices();
    },

    fetchServices: async () => {
        set({ loading: true });

        try {
            const { filters } = get();
            const queryParams = new URLSearchParams();

            // Only add non-empty filters to query params
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    queryParams.append(key, value.toString());
                }
            });

            const response = await apiClient.get(`${ENDPOINTS.VENDOR_SERVICES.FILTER}?${queryParams.toString()}`);

            // Handle both response formats: direct array or {services, total, page, take}
            let services = [];
            let total = 0;

            if (Array.isArray(response.data)) {
                // Direct array response
                services = response.data;
                total = response.data.length;
            } else if (response.data && typeof response.data === 'object') {
                // Object response with services property
                services = response.data.services || [];
                total = response.data.total || 0;
            }

            set({
                services: services,
                total: total,
                loading: false
            });
        } catch (error) {
            console.error("Error fetching services:", error);
            set({ loading: false, services: [], total: 0 });
        }
    },
}));
