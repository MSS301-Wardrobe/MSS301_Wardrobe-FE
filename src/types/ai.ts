// Placeholder AI-related types. Extend these to match the real backend.

export interface AIDetectionResult {
  labels: string[];
  confidence?: number;
}

export interface AIAnalysisResult {
  itemId: string;
  summary?: string;
  attributes?: Record<string, string>;
}
