import { apiClient } from "./apiClient";
import type { ClothingItem, CreateClothingPayload } from "../types/wardrobe";

// Placeholder wardrobe service. Wire these to the real backend later.
export const wardrobeService = {
  async getItems(): Promise<ClothingItem[]> {
    // const { data } = await apiClient.get<ClothingItem[]>("/wardrobe");
    // return data;
    return Promise.resolve([]);
  },
  async getItem(id: string): Promise<ClothingItem | void> {
    // const { data } = await apiClient.get<ClothingItem>(`/wardrobe/${id}`);
    // return data;
    return Promise.resolve();
  },
  async createItem(payload: CreateClothingPayload): Promise<ClothingItem | void> {
    // const { data } = await apiClient.post<ClothingItem>("/wardrobe", payload);
    // return data;
    return Promise.resolve();
  },
  async deleteItem(id: string): Promise<void> {
    // await apiClient.delete(`/wardrobe/${id}`);
    return Promise.resolve();
  },
};

export default wardrobeService;
