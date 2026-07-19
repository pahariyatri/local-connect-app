import { create } from "zustand";

// Define the type for a Service
export interface Service {
    id: number;
    name: string;
    location: string;
    subcategory: string;
}

// Define the Zustand store interface
interface WishlistState {
    wishlist: Service[];
    addToWishlist: (service: Service) => void;
    removeFromWishlist: (serviceId: number) => void;
    loadWishlist: () => void;
}

// Create Zustand store
const useWishlistStore = create<WishlistState>((set) => ({
    wishlist: [],

    // Add to Wishlist
    addToWishlist: (service) =>
        set((state) => {
            const updatedWishlist = [...state.wishlist, service];
            localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
            return { wishlist: updatedWishlist };
        }),

    // Remove from Wishlist
    removeFromWishlist: (serviceId) =>
        set((state) => {
            const updatedWishlist = state.wishlist.filter((s) => s.id !== serviceId);
            localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
            return { wishlist: updatedWishlist };
        }),

    // Load Wishlist from LocalStorage
    loadWishlist: () =>
        set(() => {
            const storedWishlist = localStorage.getItem("wishlist");
            return { wishlist: storedWishlist ? JSON.parse(storedWishlist) : [] };
        }),
}));

export default useWishlistStore;
