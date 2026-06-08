// ─── Wardrobe ────────────────────────────────────────────────────────────────

export interface Wardrobe {
  wardrobeId: string;
  userId: string;
  wardrobeName: string;
  createdAt: string;
}

export interface CreateWardrobePayload {
  userId: string;
  wardrobeName: string;
}

export interface UpdateWardrobePayload {
  wardrobeName: string;
}

// ─── Wardrobe Zone ────────────────────────────────────────────────────────────

export interface WardrobeZone {
  zoneId: string;
  wardrobeId: string;
  zoneName: string;
  description?: string;
}

export interface CreateWardrobeZonePayload {
  wardrobeId: string;
  zoneName: string;
  description?: string;
}

export interface UpdateWardrobeZonePayload {
  wardrobeId: string;
  zoneName: string;
  description?: string;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  categoryId: string;
  categoryName: string;
  description?: string;
}

export interface CreateCategoryPayload {
  categoryName: string;
  description?: string;
}

export interface UpdateCategoryPayload {
  categoryName: string;
  description?: string;
}

// ─── Clothing Item ────────────────────────────────────────────────────────────

export interface ClothingItem {
  itemId: string;
  zoneId?: string;
  categoryId?: string;
  imageId?: string;
  itemName: string;
  dominantColor?: string;
  style?: string;
  confidenceScore?: number;
  createdAt: string;
}

export interface CreateClothingItemPayload {
  zoneId?: string;
  categoryId?: string;
  imageId?: string;
  itemName: string;
  dominantColor?: string;
  style?: string;
  confidenceScore?: number;
}

export interface UpdateClothingItemPayload {
  zoneId?: string;
  categoryId?: string;
  imageId?: string;
  itemName: string;
  dominantColor?: string;
  style?: string;
  confidenceScore?: number;
}

// ─── API wrapper ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Legacy aliases kept for backward compat with old imports
export type CreateClothingPayload = CreateClothingItemPayload;
