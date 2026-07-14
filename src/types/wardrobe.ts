// ─── Wardrobe ────────────────────────────────────────────────────────────────

export interface Wardrobe {
  wardrobeId: string;
  userId: string;
  wardrobeName: string;
  createdAt: string;
}

export interface CreateWardrobePayload {
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

// ─── Group Shared Clothing Item ───────────────────────────────────────────────

export interface SharedClothingItem {
  shareId: string;
  itemId: string;
  itemName: string;
  imageId?: string;
  dominantColor?: string;
  style?: string;
  confidenceScore?: number;
  groupId: string;
  sharedByUserId: string;
  sharedAt: string;
  likeCount: number;
  likedByMe: boolean;
}

export interface ShareClothingItemPayload {
  clothingItemId: string;
  groupId: string;
}

// ─── Category Analytics ───────────────────────────────────────────────────────

export interface CategoryAnalyticsItem {
  categoryId: string;
  categoryName: string;
  description?: string;
  count: number;
  percentage: number;
}

export interface CategoryAnalyticsResponse {
  granularity: "day" | "month" | "year";
  from: string;
  to: string;
  totalItems: number;
  categories: CategoryAnalyticsItem[];
}

export interface CategoryUserItem {
  userId: string;
  itemCount: number;
  firstAddedAt?: string;
  lastAddedAt?: string;
}

export interface CategoryUsersResponse {
  categoryName: string;
  granularity: "day" | "month" | "year";
  from: string;
  to: string;
  totalUsers: number;
  totalItems: number;
  users: CategoryUserItem[];
}

// ─── API wrapper ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Legacy aliases kept for backward compat with old imports
export type CreateClothingPayload = CreateClothingItemPayload;
