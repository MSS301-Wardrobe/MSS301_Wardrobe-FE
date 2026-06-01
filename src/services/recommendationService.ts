import { apiClient } from "./apiClient";
import type { Recommendation, RecommendationQuery } from "../types/recommendation";

// Placeholder recommendation service. Wire these to the real backend later.
export const recommendationService = {
  async getRecommendations(query?: RecommendationQuery): Promise<Recommendation[]> {
    // const { data } = await apiClient.get<Recommendation[]>("/recommendations", { params: query });
    // return data;
    return Promise.resolve([]);
  },
  async getRecommendation(id: string): Promise<Recommendation | void> {
    // const { data } = await apiClient.get<Recommendation>(`/recommendations/${id}`);
    // return data;
    return Promise.resolve();
  },
};

export default recommendationService;
