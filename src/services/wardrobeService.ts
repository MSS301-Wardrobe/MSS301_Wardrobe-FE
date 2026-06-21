import { apiClient } from "./apiClient";
import {
  matchCategoryFromAi,
  normalizeVi,
  SUPPORTED_CATEGORY_NAMES_VI,
} from "../utils/aiMappings";
import type {
  ApiResponse,
  Wardrobe,
  CreateWardrobePayload,
  UpdateWardrobePayload,
  WardrobeZone,
  CreateWardrobeZonePayload,
  UpdateWardrobeZonePayload,
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  ClothingItem,
  CreateClothingItemPayload,
  UpdateClothingItemPayload,
} from "../types/wardrobe";

/**
 * Base prefix khớp với:
 *  - API Gateway predicate:  /api/v1/wardrobe/**
 *  - wardrobe-service context-path: /api/v1/wardrobe
 *  - Vite proxy: /api → http://localhost:8080
 *
 * Ví dụ: /api/v1/wardrobe/wardrobes
 *   → Vite proxy → http://localhost:8080/api/v1/wardrobe/wardrobes
 *   → Gateway → lb://wardrobe-service → /api/v1/wardrobe/wardrobes
 *   → wardrobe-service (context-path /api/v1/wardrobe) → controller @RequestMapping("/wardrobes")
 */
const W = "/wardrobe";

// ─── Wardrobe API ─────────────────────────────────────────────────────────────

export const wardrobeApi = {
  /** POST /wardrobes */
  async create(payload: CreateWardrobePayload): Promise<Wardrobe> {
    const { data } = await apiClient.post<ApiResponse<Wardrobe>>(`${W}/wardrobes`, payload);
    return data.data;
  },

  /** GET /wardrobes/:id */
  async getById(id: string): Promise<Wardrobe> {
    const { data } = await apiClient.get<ApiResponse<Wardrobe>>(`${W}/wardrobes/${id}`);
    return data.data;
  },

  /** GET /wardrobes */
  async getAll(): Promise<Wardrobe[]> {
    const { data } = await apiClient.get<ApiResponse<Wardrobe[]>>(`${W}/wardrobes`);
    return data.data ?? [];
  },

  /** GET /wardrobes/user/:userId */
  async getByUserId(userId: string): Promise<Wardrobe[]> {
    const { data } = await apiClient.get<ApiResponse<Wardrobe[]>>(`${W}/wardrobes/user/${userId}`);
    return data.data ?? [];
  },

  /** PUT /wardrobes/:id */
  async update(id: string, payload: UpdateWardrobePayload): Promise<Wardrobe> {
    const { data } = await apiClient.put<ApiResponse<Wardrobe>>(`${W}/wardrobes/${id}`, payload);
    return data.data;
  },

  /** DELETE /wardrobes/:id */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${W}/wardrobes/${id}`);
  },

  /** GET /wardrobes/search */
  async search(keyword: string): Promise<Wardrobe[]> {
    const { data } = await apiClient.get<ApiResponse<Wardrobe[]>>(`${W}/wardrobes/search?keyword=${encodeURIComponent(keyword)}`);
    return data.data ?? [];
  },
};

// ─── Wardrobe Zone API ────────────────────────────────────────────────────────

export const wardrobeZoneApi = {
  /** POST /wardrobe-zones */
  async create(payload: CreateWardrobeZonePayload): Promise<WardrobeZone> {
    const { data } = await apiClient.post<ApiResponse<WardrobeZone>>(`${W}/wardrobe-zones`, payload);
    return data.data;
  },

  /** GET /wardrobe-zones/:id */
  async getById(id: string): Promise<WardrobeZone> {
    const { data } = await apiClient.get<ApiResponse<WardrobeZone>>(`${W}/wardrobe-zones/${id}`);
    return data.data;
  },

  /** GET /wardrobe-zones */
  async getAll(): Promise<WardrobeZone[]> {
    const { data } = await apiClient.get<ApiResponse<WardrobeZone[]>>(`${W}/wardrobe-zones`);
    return data.data ?? [];
  },

  /** GET /wardrobe-zones/wardrobe/:wardrobeId */
  async getByWardrobeId(wardrobeId: string): Promise<WardrobeZone[]> {
    const { data } = await apiClient.get<ApiResponse<WardrobeZone[]>>(
      `${W}/wardrobe-zones/wardrobe/${wardrobeId}`
    );
    return data.data ?? [];
  },

  /** PUT /wardrobe-zones/:id */
  async update(id: string, payload: UpdateWardrobeZonePayload): Promise<WardrobeZone> {
    const { data } = await apiClient.put<ApiResponse<WardrobeZone>>(
      `${W}/wardrobe-zones/${id}`,
      payload
    );
    return data.data;
  },

  /** DELETE /wardrobe-zones/:id */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${W}/wardrobe-zones/${id}`);
  },

  /** GET /wardrobe-zones/search */
  async search(keyword: string, wardrobeId?: string): Promise<WardrobeZone[]> {
    let url = `${W}/wardrobe-zones/search?keyword=${encodeURIComponent(keyword)}`;
    if (wardrobeId) url += `&wardrobeId=${wardrobeId}`;
    const { data } = await apiClient.get<ApiResponse<WardrobeZone[]>>(url);
    return data.data ?? [];
  },
};

// ─── Category API ─────────────────────────────────────────────────────────────

export const categoryApi = {
  /** POST /categories */
  async create(payload: CreateCategoryPayload): Promise<Category> {
    const { data } = await apiClient.post<ApiResponse<Category>>(`${W}/categories`, payload);
    return data.data;
  },

  /** GET /categories/:id */
  async getById(id: string): Promise<Category> {
    const { data } = await apiClient.get<ApiResponse<Category>>(`${W}/categories/${id}`);
    return data.data;
  },

  /** GET /categories */
  async getAll(): Promise<Category[]> {
    const { data } = await apiClient.get<ApiResponse<Category[]>>(`${W}/categories`);
    return data.data ?? [];
  },

  /** PUT /categories/:id */
  async update(id: string, payload: UpdateCategoryPayload): Promise<Category> {
    const { data } = await apiClient.put<ApiResponse<Category>>(`${W}/categories/${id}`, payload);
    return data.data;
  },

  /** DELETE /categories/:id */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${W}/categories/${id}`);
  },
};

/** Đảm bảo 13 danh mục AI có trong DB để dropdown khớp nhãn nhận diện */
export async function ensureAiCategoryCatalog(
  existing: Category[]
): Promise<Category[]> {
  const catalog = [...existing];
  const known = new Set(catalog.map((category) => normalizeVi(category.categoryName)));

  for (const label of SUPPORTED_CATEGORY_NAMES_VI) {
    if (known.has(normalizeVi(label))) {
      continue;
    }

    try {
      const created = await categoryApi.create({ categoryName: label });
      catalog.push(created);
      known.add(normalizeVi(label));
    } catch {
      // Bỏ qua nếu không tạo được — resolveCategoryFromAi sẽ thử lại khi nhận diện
    }
  }

  return catalog;
}

/** Tìm hoặc tạo danh mục khớp kết quả AI */
export async function resolveCategoryFromAi(
  categories: Category[],
  classKey: string,
  aiLabel: string
): Promise<{ category: Category | undefined; categories: Category[] }> {
  let matched = matchCategoryFromAi(categories, classKey, aiLabel);
  if (matched) {
    return { category: matched, categories };
  }

  const alreadyExists = categories.find(
    (category) => normalizeVi(category.categoryName) === normalizeVi(aiLabel)
  );
  if (alreadyExists) {
    return { category: alreadyExists, categories };
  }

  try {
    const created = await categoryApi.create({ categoryName: aiLabel });
    return { category: created, categories: [...categories, created] };
  } catch {
    return { category: undefined, categories };
  }
}

// ─── Clothing Item API ────────────────────────────────────────────────────────

export const clothingItemApi = {
  /** POST /clothing-items */
  async create(payload: CreateClothingItemPayload): Promise<ClothingItem> {
    const { data } = await apiClient.post<ApiResponse<ClothingItem>>(`${W}/clothing-items`, payload);
    return data.data;
  },

  /** GET /clothing-items/:id */
  async getById(id: string): Promise<ClothingItem> {
    const { data } = await apiClient.get<ApiResponse<ClothingItem>>(`${W}/clothing-items/${id}`);
    return data.data;
  },

  /** GET /clothing-items */
  async getAll(): Promise<ClothingItem[]> {
    const { data } = await apiClient.get<ApiResponse<ClothingItem[]>>(`${W}/clothing-items`);
    return data.data ?? [];
  },

  /** GET /clothing-items/zone/:zoneId */
  async getByZoneId(zoneId: string): Promise<ClothingItem[]> {
    const { data } = await apiClient.get<ApiResponse<ClothingItem[]>>(
      `${W}/clothing-items/zone/${zoneId}`
    );
    return data.data ?? [];
  },

  /** GET /clothing-items/category/:categoryId */
  async getByCategoryId(categoryId: string): Promise<ClothingItem[]> {
    const { data } = await apiClient.get<ApiResponse<ClothingItem[]>>(
      `${W}/clothing-items/category/${categoryId}`
    );
    return data.data ?? [];
  },

  /** PUT /clothing-items/:id */
  async update(id: string, payload: UpdateClothingItemPayload): Promise<ClothingItem> {
    const { data } = await apiClient.put<ApiResponse<ClothingItem>>(
      `${W}/clothing-items/${id}`,
      payload
    );
    return data.data;
  },

  /** DELETE /clothing-items/:id */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${W}/clothing-items/${id}`);
  },
};

// ─── Legacy compat ────────────────────────────────────────────────────────────

export const wardrobeService = {
  getItems: () => clothingItemApi.getAll(),
  getItem: (id: string) => clothingItemApi.getById(id),
  deleteItem: (id: string) => clothingItemApi.delete(id),
};

export default wardrobeService;
