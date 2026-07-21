export type RecommendationHistoryType = "all" | "personal" | "group" | "event";
export type RecommendationHistorySort = "newest" | "oldest";

export interface RecommendationHistoryItem {
  recommendationId: string;
  userId: string;
  outfitName: string;
  description?: string | null;
  itemCount: number;
  recommendationScore: number;
  eventType: string;
  recommendationType: RecommendationHistoryType;
  generatedAt: string;
}

export interface RecommendationHistoryPageResponse {
  items: RecommendationHistoryItem[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  totalCount: number;
  personalCount: number;
  groupCount: number;
  eventCount: number;
}
