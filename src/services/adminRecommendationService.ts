import { apiClient } from "./apiClient";
import type {
  RecommendationHistoryPageResponse,
  RecommendationHistorySort,
  RecommendationHistoryType,
} from "../types/adminRecommendation";
import type { Recommendation } from "../types/recommendation";

const BASE = "/recommendation/admin/history";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function getRecommendationHistory({
  type = "all",
  page = 0,
  size = 10,
  sort = "newest",
}: {
  type?: RecommendationHistoryType;
  page?: number;
  size?: number;
  sort?: RecommendationHistorySort;
} = {}): Promise<RecommendationHistoryPageResponse> {
  const { data } = await apiClient.get<ApiResponse<RecommendationHistoryPageResponse>>(BASE, {
    params: { type, page, size, sort },
  });
  return data.data;
}

export async function getRecommendationHistoryDetail(
  id: string,
): Promise<Recommendation> {
  const { data } = await apiClient.get<ApiResponse<Recommendation>>(`/recommendation/${id}`);
  return data.data;
}
