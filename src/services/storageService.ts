import { apiClient } from "./apiClient";
import type { StoredImage, UploadResult } from "../types/storage";

export const storageService = {
  async listImages(): Promise<StoredImage[]> {
    const { data } = await apiClient.get<StoredImage[]>("/storage/images");
    return data;
  },

  async upload(file: File): Promise<UploadResult> {
    const form = new FormData();
    form.append("file", file);
    const { data } = await apiClient.post<UploadResult>("/storage/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/storage/images/${id}`);
  },

  async confirmImage(id: string): Promise<UploadResult> {
    const { data } = await apiClient.patch<UploadResult>(`/storage/images/${id}/confirm`);
    return data;
  },
};

export default storageService;
