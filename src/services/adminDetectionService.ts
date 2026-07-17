import apiClient from "./apiClient";
import type {
  DetectionHistoryDetail,
  DetectionHistoryPageResponse,
  DetectionHistorySort,
  DetectionHistoryTab,
  MarkDetectionAddedPayload,
} from "../types/ai";

const BASE = "/ai/admin/detection-history";

export async function getDetectionHistory({
  tab = "not_added",
  page = 0,
  size = 10,
  sort = "newest",
}: {
  tab?: DetectionHistoryTab;
  page?: number;
  size?: number;
  sort?: DetectionHistorySort;
} = {}): Promise<DetectionHistoryPageResponse> {
  const { data } = await apiClient.get<DetectionHistoryPageResponse>(BASE, {
    params: { tab, page, size, sort },
  });
  return data;
}

export async function getDetectionHistoryDetail(
  id: number,
): Promise<DetectionHistoryDetail> {
  const { data } = await apiClient.get<DetectionHistoryDetail>(`${BASE}/${id}`);
  return data;
}

export async function toggleDetectionPin(
  id: number,
): Promise<{ success: boolean; data: DetectionHistoryDetail }> {
  const { data } = await apiClient.patch<{ success: boolean; data: DetectionHistoryDetail }>(
    `${BASE}/${id}/pin`,
  );
  return data;
}

export async function hardDeleteDetection(
  id: number,
): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.delete<{ success: boolean; message: string }>(
    `${BASE}/${id}`,
  );
  return data;
}

export async function toggleDetectionStatus(
  id: number,
): Promise<{ success: boolean; message: string; data: DetectionHistoryDetail }> {
  const { data } = await apiClient.patch<{
    success: boolean;
    message: string;
    data: DetectionHistoryDetail;
  }>(`${BASE}/${id}/toggle-status`);
  return data;
}

export async function markDetectionAdded(
  logId: number,
  payload: MarkDetectionAddedPayload,
): Promise<void> {
  await apiClient.patch(`/ai/detection-logs/${logId}/mark-added`, {
    clothing_item_id: payload.clothingItemId,
    item_name: payload.itemName,
    image_id: payload.imageId,
  });
}

export function getStorageImageUrl(imageId?: string | null): string | null {
  if (!imageId) return null;
  return `http://localhost:8080/api/v1/storage/files/${imageId}`;
}

export interface RequestAddClothingPayload {
  itemName: string;
  categoryId?: string;
  zoneId: string;
  dominantColor?: string;
  style?: string;
  confidenceScore?: number;
  imageId?: string;
}

export const requestAddClothing = async (
  logId: number,
  payload: RequestAddClothingPayload
) => {
  const response = await apiClient.post(
    `/ai/detection-logs/${logId}/request-add`,
    {
      item_name: payload.itemName,
      category_id: payload.categoryId,
      zone_id: payload.zoneId,
      dominant_color: payload.dominantColor,
      style: payload.style,
      confidence_score: payload.confidenceScore,
      image_id: payload.imageId,
    }
  );

  return response.data;
};
