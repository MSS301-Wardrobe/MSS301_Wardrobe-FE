import { apiClient } from "./apiClient";
import { ApiResponse } from "@/types/apiResonse";
import {
  StylePreference,
  SaveStylePreferenceRequest,
} from "@/types/style";

export const stylePreferenceService = {
  async getMyPreferences(): Promise<StylePreference> {
    const { data } = await apiClient.get<ApiResponse<StylePreference>>(
      "/users/style-preferences/me"
    );

    return data.data;
  },

  async saveMyPreferences(
    payload: SaveStylePreferenceRequest
  ): Promise<StylePreference> {
    const { data } = await apiClient.put<ApiResponse<StylePreference>>(
      "/users/style-preferences/me",
      payload
    );

    return data.data;
  },
};