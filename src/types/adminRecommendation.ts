export type RecommendationHistoryType = "all" | "personal" | "group" | "event";
export type RecommendationHistorySort = "newest" | "oldest";

export interface RecommendationHistoryItem {
  recommendationId: string;
  userId: string;
  outfitName: string;
  groupName?: string | null;
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

export interface RecommendationClothingItem {
  itemId: string;
  itemName?: string;
  dominantColor?: string;
  imageId?: string | null;
  category?: { categoryName?: string };
}

export interface RecommendationOutfitDetail {
  outfitId?: string;
  outfitName: string;
  description?: string | null;
  items?: number;
  clothingItems?: RecommendationClothingItem[];
}

export interface RecommendationMemberOutfit {
  userId: string;
  fullName: string;
  recommendationScore: number;
  outfit: RecommendationOutfitDetail;
  creator: boolean;
}

export interface RecommendationHistoryDetail {
  recommendationId: string;
  userId: string;
  recommendationType: RecommendationHistoryType;
  eventType: string;
  recommendationScore: number;
  generatedAt: string;
  outfit: RecommendationOutfitDetail;
  groupId?: string | null;
  groupName?: string | null;
  groupStyles?: string[];
  members?: RecommendationMemberOutfit[];
}
