export interface User {
    id: string;
    name: string;
    location: string;
    email: string | null;
    phone: string;
    bio: string | null;
    profilePic: string | null;
    firstName?: string;
    lastName?: string;
    role: "Traveler" | "Vendor" | "Admin" | "User" | "Guest";
    vendorType?: "standard" | "agency";
    partnerships?: string[];
}

export interface UserState {
    user: User | null;
    error: string | null;
    loading: boolean;
    fetchUser: () => Promise<void>;
    updateUserState: (userId: string, updatedData: Partial<User>) => Promise<void>;
}
