import { apiClient } from "./apiClient";
import type { AIDetectionResult, AIAnalysisResult } from "../types/ai";

// Placeholder AI service. Wire these to the real backend later.
export const aiService = {
  async detect(image: File | string): Promise<AIDetectionResult | void> {
    // const { data } = await apiClient.post<AIDetectionResult>("/ai/detect", { image });
    // return data;
    return Promise.resolve();
  },
  async analyze(itemId: string): Promise<AIAnalysisResult | void> {
    // const { data } = await apiClient.get<AIAnalysisResult>(`/ai/analyze/${itemId}`);
    // return data;
    return Promise.resolve();
  },
};

export default aiService;
