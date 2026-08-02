// Mirrors backend/src/feature/service/entities/service.entity.ts (+ Address, Price).
// No `image` field exists on the entity — a real image lives at
// additionalData.images[0] by convention (see services/vendorService.ts).

export type ServicePrice = {
  id: number;
  price: number;
  dayType: "weekday" | "weekend" | "both";
  isPeakSeason: boolean;
  discount: number | null;
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
  isAvailable: boolean;
  capacity: number;
  createdAt: string;
  additionalData?: { images?: string[]; [key: string]: any } | null;
  subcategory?: { id: number; name: string } | null;
  addresses?: ServiceAddress[];
  prices?: ServicePrice[];
};
