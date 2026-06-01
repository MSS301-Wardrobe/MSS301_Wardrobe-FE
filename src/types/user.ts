// Placeholder user-related types. Extend these to match the real backend.

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
}

export interface UpdateUserPayload {
  name?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
