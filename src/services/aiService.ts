import { apiClient } from "./apiClient";
import type {
  AIDetectionResult,
  AIDetectionViewResult,
  AIAnalysisResult,
  DetectionItem,
  DominantColor,
} from "../types/ai";
import {
  buildLowConfidenceMessage,
  MIN_DETECTION_CONFIDENCE,
  translateBaseColor,
  translateCategory,
  translateGender,
  translateOccasions,
  translateStyle,
} from "../utils/aiMappings";

const AI_DETECT_PATH = "/ai/detect";

export class LowConfidenceDetectionError extends Error {
  readonly confidencePercent: number;

  constructor(confidencePercent: number, message: string) {
    super(message);
    this.name = "LowConfidenceDetectionError";
    this.confidencePercent = confidencePercent;
  }
}

/** 401 — chưa đăng nhập hoặc token hết hạn, gateway trả về AUTH_TOKEN_MISSING */
export class AiUnauthorizedError extends Error {
  constructor(message = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.") {
    super(message);
    this.name = "AiUnauthorizedError";
  }
}

/** 403 — đã đăng nhập nhưng không có quyền, gateway / service trả về AUTH_FORBIDDEN */
export class AiForbiddenError extends Error {
  constructor(message = "Bạn không có quyền sử dụng tính năng nhận diện AI.") {
    super(message);
    this.name = "AiForbiddenError";
  }
}

type AxiosLikeError = {
  response?: {
    status?: number;
    data?: {
      error?: string;
      message?: string;
      detail?: string | { error?: string; message?: string };
    };
  };
};

/** Chuyển HTTP 401/403 từ gateway / ai-detection-service thành error class rõ ràng */
function interpretAiError(error: unknown): never {
  const axiosError = error as AxiosLikeError;
  const status = axiosError?.response?.status;
  const data = axiosError?.response?.data;

  const detailMsg =
    typeof data?.detail === "object" ? data.detail?.message : data?.detail;
  const serverMsg = data?.message ?? detailMsg;

  if (status === 401) {
    throw new AiUnauthorizedError(
      serverMsg ?? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
    );
  }

  if (status === 403) {
    throw new AiForbiddenError(
      serverMsg ?? "Bạn không có quyền sử dụng tính năng nhận diện AI."
    );
  }

  throw error;
}

function normalizeColor(color: DominantColor | string): DominantColor {
  if (typeof color === "string") {
    return {
      name: color,
      base_color: color,
      hex: "#000000",
    };
  }

  return color;
}

async function toUploadFile(image: File | string): Promise<File> {
  if (image instanceof File) {
    return image;
  }

  const response = await fetch(image);
  if (!response.ok) {
    throw new Error("Không thể tải ảnh mẫu để nhận diện");
  }

  const blob = await response.blob();
  const extension = blob.type.split("/")[1] || "jpg";

  return new File([blob], `sample.${extension}`, { type: blob.type || "image/jpeg" });
}

export function mapDetectionToViewResult(
  detection: DetectionItem
): AIDetectionViewResult {
  const confidencePercent = Math.round(detection.confidence * 1000) / 10;
  const color = normalizeColor(detection.dominant_color);
  const category = translateCategory(detection.class_name);
  const colorLabel = translateBaseColor(color.base_color);
  const style = translateStyle(detection.style);
  const occasion = translateOccasions(detection.occasion);
  const gender = translateGender(detection.gender);
  const occasionText = occasion.join(" / ");

  return {
    classId: detection.class_id,
    classKey: detection.class_name,
    category,
    confidence: confidencePercent,
    color,
    colorLabel,
    style,
    occasion,
    gender,
    bbox: detection.bbox,
    attributes: [
      {
        label: "Loại Trang Phục",
        value: category,
        score: confidencePercent,
      },
      {
        label: "Màu Chính",
        value: colorLabel,
        score: Math.min(99, confidencePercent + 1),
      },
      {
        label: "Dịp Phù Hợp",
        value: occasionText,
        score: Math.max(70, confidencePercent - 4),
      },
      {
        label: "Phong Cách",
        value: style,
        score: Math.max(70, confidencePercent - 3),
      },
      {
        label: "Giới Tính",
        value: gender,
        score: Math.max(70, confidencePercent - 8),
      },
    ],
  };
}

export const aiService = {
  async detect(image: File | string): Promise<AIDetectionResult> {
    const file = await toUploadFile(image);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await apiClient.post<AIDetectionResult>(
        AI_DETECT_PATH,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return data;
    } catch (error: unknown) {
      interpretAiError(error);
    }
  },

  async detectForView(image: File | string): Promise<AIDetectionViewResult> {
    const response = await this.detect(image);
    const primary = response.detections[0];

    if (!primary) {
      throw new Error("Không phát hiện trang phục nào trong ảnh");
    }

    const confidencePercent = Math.round(primary.confidence * 1000) / 10;

    if (primary.confidence < MIN_DETECTION_CONFIDENCE) {
      throw new LowConfidenceDetectionError(
        confidencePercent,
        buildLowConfidenceMessage(confidencePercent)
      );
    }

    return mapDetectionToViewResult(primary);
  },

  async analyze(itemId: string): Promise<AIAnalysisResult | void> {
    const { data } = await apiClient.get<AIAnalysisResult>(`/ai/analyze/${itemId}`);
    return data;
  },
};

export default aiService;
