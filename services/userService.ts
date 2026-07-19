import { api } from "@/lib/apiClient";
import { ENDPOINTS } from "@/utils/constants";
import { User } from "@/types/userTypes";

export const fetchCurrentUser = async (): Promise<User> => {
    try {
        const response = await api.get(ENDPOINTS.USERS.GET_ME);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.status === 401 ? "Unauthorized" : "An error occurred");
    }
};

export const updateUser = async (userId: string, updatedData: Partial<User>): Promise<User> => {
    try {
        const response = await api.put(ENDPOINTS.USERS.UPDATE(userId), updatedData);
        return response.data;
    } catch (error: any) {
        throw new Error("Failed to update user");
    }
};
