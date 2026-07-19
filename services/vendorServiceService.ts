import { api } from "@/lib/apiClient";
import { ENDPOINTS } from "@/utils/constants";

export const filterServices = async (filters: {
    minPrice?: number;
    maxPrice?: number;
    latitude?: number;
    longitude?: number;
    city?: string;
    state?: string;
    subcategoryId?: number;
}): Promise<any> => {
    const queryParams = new URLSearchParams(filters as any).toString();
    return api.get(`${ENDPOINTS.VENDOR_SERVICES.FILTER}?${queryParams}`);
};

export const getServiceById = async (id: string): Promise<any> => {
    return api.get(ENDPOINTS.VENDOR_SERVICES.GET_BY_ID(id));
};

export const getServicesByCategory = async (categoryType: string, city?: string, limit?: number): Promise<any> => {
    const queryParams = new URLSearchParams();
    if (city) queryParams.append('city', city);
    if (limit) queryParams.append('limit', limit.toString());
    const queryString = queryParams.toString();
    return api.get(`/service/by-category/${categoryType}${queryString ? `?${queryString}` : ''}`);
};

