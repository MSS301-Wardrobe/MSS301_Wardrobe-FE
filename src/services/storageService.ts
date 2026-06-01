import { apiClient } from "./apiClient";
import type { StoredImage, UploadResult } from "../types/storage";

// Placeholder storage service. Wire these to the real backend later.
export const storageService = {
  async listImages(): Promise<StoredImage[]> {
    // const { data } = await apiClient.get<StoredImage[]>("/storage/images");
    // return data;
    return Promise.resolve([]);
  },
  async upload(file: File): Promise<UploadResult | void> {
    // const form = new FormData();
    // form.append("file", file);
    // const { data } = await apiClient.post<UploadResult>("/storage/upload", form);
    // return data;
    return Promise.resolve();
  },
  async remove(id: string): Promise<void> {
    // await apiClient.delete(`/storage/images/${id}`);
    return Promise.resolve();
  },
};

export default storageService;
