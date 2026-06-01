// Placeholder wardrobe-related types. Extend these to match the real backend.

export interface ClothingItem {
  id: string;
  name: string;
  category?: string;
  color?: string;
  imageUrl?: string;
}

export interface CreateClothingPayload {
  name: string;
  category?: string;
  color?: string;
  imageUrl?: string;
}
