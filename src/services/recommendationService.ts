import { apiClient } from "./apiClient";
import type { Recommendation } from "../types/recommendation";

export const recommendationService = {
  // Lấy toàn bộ danh sách gợi ý của 1 User
  async getAllRecommendations(userId: string): Promise<Recommendation[]> {
    const response = await apiClient.get(`/recommendations/user/${userId}`);
    return response.data.data;
  },

  // Lấy chi tiết 1 gợi ý khi click vào Card
  async getRecommendationDetail(id: string): Promise<Recommendation> {
    const response = await apiClient.get(`/recommendations/${id}`);
    return response.data.data;
  },

  // Gợi ý cá nhân (Content-Based)
  async generatePersonal(userId: string): Promise<Recommendation> {
    const response = await apiClient.get(`/recommendations/generate/personal`, {
      params: { userId }
    });
    return response.data.data;
  }
};

export default recommendationService;