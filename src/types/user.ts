// User-related types matching the backend API contract.

export type RoleName = "ROLE_USER" | "ROLE_ADMIN" | "USER" | "ADMIN";

export interface Role {
  id?: string | number;
  roleName: RoleName;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;

  // Some APIs return a single role directly
  role?: RoleName;

  // Some APIs return roles as an array
  roles?: Role[];
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  location?: string;
  dob?: string;
  gender?: string;
  avatarUrl?: string;

  // Body measurements
  height?: string;
  weight?: string;
  chest?: string;
  waist?: string;
  hips?: string;
  shoeSize?: string;
  fitPreference?: string;
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
  phone?: string;
  bio?: string;
  location?: string;
  dob?: string;
  gender?: string;
  height?: string;
  weight?: string;
  chest?: string;
  waist?: string;
  hips?: string;
  shoeSize?: string;
  fitPreference?: string;
}

// Vì bạn dùng HttpOnly cookie, login response KHÔNG nên có accessToken ở body.
export interface AuthResponse {
  message?: string;
  user: User;
}

export interface UserPreferences {
  favoriteColors: string[];
  preferredStyles: string[];
  lifestyles: string[];
  clothingInterests: string[];
}