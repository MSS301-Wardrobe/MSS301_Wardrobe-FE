import { apiClient } from "./apiClient";
import { ApiResponse } from "@/types/apiResonse";

import type {
  UserProfile,
  UpdateUserPayload,
  UserPreferences,
  User,
} from "../types/user";


export const userService = {
  async getCurrentUser(): Promise<UserProfile> {
    const { data } = await apiClient.get<ApiResponse<UserProfile>>("/users/me");
    return data.data;
  },

  async updateProfile(payload: UpdateUserPayload): Promise<UserProfile> {
    const { data } = await apiClient.put<ApiResponse<UserProfile>>(
      "/users/me",
      payload
    );
    return data.data;
  },

  async getPreferences(): Promise<UserPreferences> {
    const { data } =
      await apiClient.get<ApiResponse<UserPreferences>>(
        "/users/me/preferences"
      );

    return data.data;
  },

  async updatePreferences(payload: UserPreferences): Promise<UserPreferences> {
    const { data } = await apiClient.put<ApiResponse<UserPreferences>>(
      "/users/me/preferences",
      payload
    );

    return data.data;
  },

  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClient.put<ApiResponse<User>>(
      "/users/me/avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return data.data;
  }
};

export default userService;