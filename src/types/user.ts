// User-related types matching the backend API contract.

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role?: "USER" | "ADMIN";
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

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface UserPreferences {
  favoriteColors: string[];
  preferredStyles: string[];
  lifestyles: string[];
  clothingInterests: string[];
}
