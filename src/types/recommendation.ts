// Placeholder recommendation-related types. Extend these to match the real backend.

export interface Outfit {
  outfitId: string;
  outfitName: string;
  description: string | null;
  img: string | null;
  items: number;
  tags: string[];
}

export interface Recommendation {
  recommendationId: string;
  userId: string;
  outfit: Outfit;
  recommendationScore: number;
  eventType: string;
  sources: string[];
}