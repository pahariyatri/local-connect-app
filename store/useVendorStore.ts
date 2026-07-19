import { create } from "zustand";

interface Vendor {
    id: string;
    name: string;
    services: string[];
}

interface VendorState {
    vendors: Vendor[];
    addVendor: (vendor: Vendor) => void;
    removeVendor: (id: string) => void;
}

export const useVendorStore = create<VendorState>((set) => ({
    vendors: [],
    addVendor: (vendor) =>
        set((state) => ({
            vendors: [...state.vendors, vendor],
        })),
    removeVendor: (id) =>
        set((state) => ({
            vendors: state.vendors.filter((vendor) => vendor.id !== id),
        })),
}));
