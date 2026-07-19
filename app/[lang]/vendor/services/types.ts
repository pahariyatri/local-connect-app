export type SeasonalPrice = {
    id: string;
    seasonName: string;
    startDate: string; // ISO format
    endDate: string; // ISO format
    price: number;
};

export type Service = {
    id: number;
    name: string;
    prices: Record<string, number>; // Base prices (weekday, weekend, etc.)
    seasonalPrices?: SeasonalPrice[];
    dynamicPricingEnabled?: boolean;
    marketPrice?: number;
    discountedPrice?: number;
    availability: string;
    category?: string;
    subcategory?: string;
    description?: string;
    image?: string; 
    status?: "active" | "inactive" | "pending";
    subLocation?: string;
    isVerified?: boolean;
    verificationDate?: string;
    highlights?: string[];
    capacity?: number;
    hasActiveBookings?: boolean; // New flag to lock pricing
};
