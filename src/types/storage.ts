// Placeholder storage-related types. Extend these to match the real backend.

export interface StoredImage {
  id: string;
  url: string;
  name?: string;
  createdAt?: string;
}

export interface UploadResult {
  id: string;
  url: string;
}
