// Placeholder recommendation-related types. Extend these to match the real backend.

export interface Recommendation {
  id: string;
  title?: string;
  itemIds: string[];
  score?: number;
}

export interface RecommendationQuery {
  occasion?: string;
  weather?: string;
  limit?: number;
}
