import { wardrobeService, clothingItemApi } from "../services/wardrobeService";
import type { CreateClothingItemPayload } from "../types/wardrobe";

// Wardrobe hook — use clothingItemApi for full CRUD.
export function useWardrobe() {
  return {
    items: [],
    getItems: wardrobeService.getItems,
    getItem: wardrobeService.getItem,
    createItem: (payload: CreateClothingItemPayload) => clothingItemApi.create(payload),
    deleteItem: wardrobeService.deleteItem,
  };
}

export default useWardrobe;
