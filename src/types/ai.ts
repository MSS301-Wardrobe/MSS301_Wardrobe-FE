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
  occasion: string[];
  gender: string;
  bbox?: DetectionBBox;
  attributes: { label: string; value: string; score: number }[];
}
