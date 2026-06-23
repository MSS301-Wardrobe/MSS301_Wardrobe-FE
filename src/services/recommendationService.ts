import { apiClient } from "./apiClient";
import type { Recommendation } from "../types/recommendation";

export const recommendationService = {
  async getAllRecommendations(userId: string): Promise<Recommendation[]> {
    const response = await apiClient.get(`/recommendation/user/${userId}`);
    return response.data.data;
  },

  async getRecommendationDetail(id: string): Promise<Recommendation> {
    const response = await apiClient.get(`/recommendation/${id}`);
    return response.data.data;
  },

  async generatePersonal(userId: string): Promise<Recommendation> {
    const response = await apiClient.get(`/recommendation/generate/personal`, {
      params: { userId }
    });
    return response.data.data;
  },

  async generateEvent(userId: string, eventType: string): Promise<Recommendation> {
    const response = await apiClient.get(`/recommendation/generate/event`, {
      params: { userId, eventType }
    });
    return response.data.data;
  },

  async generateGroup(userId: string, groupId: string): Promise<Recommendation> {
    const response = await apiClient.get(`/recommendation/generate/group`, {
      params: { userId, groupId }
    });
    return response.data.data;
  }
};

export default recommendationService;