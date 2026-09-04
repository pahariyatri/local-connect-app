export type SeasonalPrice = {
  id: string;
  seasonName: string;
  startDate: string;
  endDate: string;
  price: number;
};

export type ServicePrice = {
  id?: number;
  price: number;
  dayType?: "weekday" | "weekend" | "both";
  isPeakSeason?: boolean;
  discount?: number | null;
};

export type ServiceAddress = {
  id: number;
  name?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  isPrimary: boolean;
};

export type Service = {
  id: number;
  name: string;
  description: string;
  isAvailable?: boolean;
  capacity: number;
  createdAt?: string;
  category?: string;
  subcategory?: any;
  prices?: any;
  seasonalPrices?: SeasonalPrice[];
  dynamicPricingEnabled?: boolean;
  hasActiveBookings?: boolean;
  availability?: string;
  status?: string;
  additionalData?: { images?: string[]; [key: string]: any } | null;
  thumbnail?: string | null;
  images?: string[] | null;
  addresses?: ServiceAddress[];
};
