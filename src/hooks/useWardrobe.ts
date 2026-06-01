import { wardrobeService } from "../services/wardrobeService";

// Placeholder wardrobe hook. Replace with real state management / react-query later.
export function useWardrobe() {
  return {
    items: [],
    getItems: wardrobeService.getItems,
    getItem: wardrobeService.getItem,
    createItem: wardrobeService.createItem,
    deleteItem: wardrobeService.deleteItem,
  };
}

export default useWardrobe;
