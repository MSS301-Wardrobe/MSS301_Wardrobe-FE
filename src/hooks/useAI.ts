import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  aiService,
  AiForbiddenError,
  AiUnauthorizedError,
  LowConfidenceDetectionError,
} from "../services/aiService";
import type { AIDetectionResult, AIDetectionViewResult, AIAnalysisResult } from "../types/ai";

// Re-export để các page chỉ cần import từ hook
export { LowConfidenceDetectionError };

export function useAI() {
  const navigate = useNavigate();

  /**
   * Xử lý lỗi 401/403 từ AI service.
   * Trả về true nếu đã xử lý (toast + điều hướng), false nếu không phải auth error.
   */
  function handleAuthError(error: unknown): boolean {
    if (error instanceof AiUnauthorizedError) {
      toast.error(error.message);
      navigate("/login");
      return true;
    }

    if (error instanceof AiForbiddenError) {
      toast.error(error.message);
      return true;
    }

    return false;
  }

  /**
   * Nhận diện trang phục, trả về raw result từ BE.
   * Auth error (401/403) được xử lý tự động, trả null.
   * Các lỗi khác được throw lên để page tự xử lý.
   */
  async function detect(image: File | string): Promise<AIDetectionResult | null> {
    try {
      return await aiService.detect(image);
    } catch (error: unknown) {
      if (handleAuthError(error)) return null;
      throw error;
    }
  }

  /**
   * Nhận diện trang phục, trả về kết quả đã được map sang ViewResult.
   * Auth error (401/403) → xử lý tự động, trả null.
   * LowConfidenceDetectionError → throw lên để page hiển thị cảnh báo.
   * Các lỗi khác → throw lên.
   */
  async function detectForView(image: File | string): Promise<AIDetectionViewResult | null> {
    try {
      return await aiService.detectForView(image);
    } catch (error: unknown) {
      if (handleAuthError(error)) return null;
      throw error;
    }
  }


  const getAnalytics = async (type: 'stats' | 'daily' | 'monthly' | 'categories' | 'recent') => {
    try {
      if (type === 'stats') return await aiService.getStats();
      if (type === 'daily') return await aiService.getDaily();
      if (type === 'monthly') return await aiService.getMonthly();
      if (type === 'categories') return await aiService.getCategories();
      if (type === 'recent') return await aiService.getRecent();
    } catch (error: unknown) {
      handleAuthError(error);
      throw error;
    }
  };

  return { detect, detectForView, getAnalytics };
}

export default useAI;
