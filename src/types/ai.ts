export interface DetectionBBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface DominantColor {
  name: string;
  base_color: string;
  hex: string;
}

export interface DetectionItem {
  class_id: number;
  class_name: string;
  confidence: number;
  bbox: DetectionBBox;
  dominant_color: DominantColor;
  style: string[];
  occasion: string[];
  gender: string;
  logId?: number;
  editable_fields: {
    material: string | null;
    brand: string | null;
    season: string | null;
  };
}

export interface AIDetectionResult {
  success: boolean;
  userId: string;
  email: string;
  role: string;
  detections: DetectionItem[];
}

export interface AIAnalysisResult {
  itemId: string;
  summary?: string;
  attributes?: Record<string, string>;
}

export interface AIDetectionViewResult {
  classId: number;
  classKey: string;
  category: string;
  confidence: number;
  color: DominantColor;
  colorLabel: string;
  style: string;
  styleKeys?: string[];
  occasion: string[];
  gender: string;
  logId?: number;
  bbox?: DetectionBBox;
  attributes: { label: string; value: string; score: number }[];
}

export type DetectionHistoryTab = "not_added" | "added";
export type DetectionHistorySort = "newest" | "oldest";

export interface DetectionHistoryItem {
  id: number;
  userId: string;
  className: string;
  category: string;
  confidence: number;
  dominantColor?: DominantColor | string | null;
  style?: string[] | string | null;
  gender?: string | null;
  occasion?: string[] | string | null;
  imageId?: string | null;
  itemName?: string | null;
  wardrobeStatus: "NOT_ADDED" | "ADDED";
  clothingItemId?: string | null;
  isPinned: boolean;
  recordStatus: "ACTIVE" | "INACTIVE" | "DELETED";
  createdAt: string;
  addedAt?: string | null;
  deactivatedAt?: string | null;
  daysUntilDeletion?: number | null;
}

export interface DetectionHistoryDetail extends DetectionHistoryItem {
  status?: string;
  pinnedAt?: string | null;
}

export interface DetectionHistoryPageResponse {
  items: DetectionHistoryItem[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  notAddedCount: number;
  addedCount: number;
}

export interface MarkDetectionAddedPayload {
  clothingItemId: string;
  itemName: string;
  imageId?: string;
}
