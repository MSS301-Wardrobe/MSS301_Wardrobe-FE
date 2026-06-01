import { apiClient } from "./apiClient";
import type { User, UpdateUserPayload } from "../types/user";

// Placeholder user service. Wire these to the real backend later.
export const userService = {
  async getCurrentUser(): Promise<User | void> {
    // const { data } = await apiClient.get<User>("/users/me");
    // return data;
    return Promise.resolve();
  },
  async updateProfile(payload: UpdateUserPayload): Promise<User | void> {
    // const { data } = await apiClient.put<User>("/users/me", payload);
    // return data;
    return Promise.resolve();
  },
};

export default userService;
