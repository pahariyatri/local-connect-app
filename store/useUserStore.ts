import { create } from "zustand";
import { fetchCurrentUser, updateUser } from "@/services/userService";
import { User, UserState } from "@/types/userTypes";

export const useUserStore = create<UserState>((set) => ({
    user: null,
    error: null,
    loading: false,

    // Fetch User Data
    fetchUser: async () => {
        set({ loading: true, error: null });
        try {
            const data = await fetchCurrentUser();
            const user: User = mapUserData(data);
            set({ user, loading: false });
        } catch (err: unknown) {
            set({ error: err instanceof Error ? err.message : "Failed to fetch user data", loading: false });
        }
    },

    // Update User Data
    updateUserState: async (userId, updatedData) => {
        set({ loading: true });
        try {
            const updatedUser = await updateUser(userId, updatedData);
            set({ user: updatedUser, loading: false });
        } catch (err) {
            set({ error: "Failed to update user", loading: false });
        }
    },
}));

// Utility function to map API response to User object
const mapUserData = (data: any): User => ({
    id: data.id || data._id || `user-${Math.random().toString(36).substring(2, 9)}`,
    name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.name || "User",
    location: data.location || "Unknown Location",
    email: data.email || null,
    phone: data.phone || "",
    bio: data.bio || null,
    profilePic: data.profilePic || null,
    role: data.role || "Traveler",
});
