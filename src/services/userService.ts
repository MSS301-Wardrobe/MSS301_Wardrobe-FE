import { apiClient } from "./apiClient";
import type { UserProfile, UpdateUserPayload, UserPreferences } from "../types/user";

export const userService = {
  async getCurrentUser(): Promise<UserProfile> {
    const { data } = await apiClient.get<UserProfile>("/users/me");
    return data;
  },

  async updateProfile(payload: UpdateUserPayload): Promise<UserProfile> {
    const { data } = await apiClient.put<UserProfile>("/users/me", payload);
    return data;
  },

  async getPreferences(): Promise<UserPreferences> {
    const { data } = await apiClient.get<UserPreferences>("/users/me/preferences");
    return data;
  },

  async updatePreferences(payload: UserPreferences): Promise<UserPreferences> {
    const { data } = await apiClient.put<UserPreferences>("/users/me/preferences", payload);
    return data;
  },

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post<{ avatarUrl: string }>("/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};

export default userService;
