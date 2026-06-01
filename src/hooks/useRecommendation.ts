import { recommendationService } from "../services/recommendationService";

// Placeholder recommendation hook. Replace with real state management / react-query later.
export function useRecommendation() {
  return {
    recommendations: [],
    getRecommendations: recommendationService.getRecommendations,
    getRecommendation: recommendationService.getRecommendation,
  };
}

export default useRecommendation;
