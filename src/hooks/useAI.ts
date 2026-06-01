import { aiService } from "../services/aiService";

// Placeholder AI hook. Replace with real state management / react-query later.
export function useAI() {
  return {
    detect: aiService.detect,
    analyze: aiService.analyze,
  };
}

export default useAI;
