// User-related types matching the backend API contract.

export type RoleName = "ROLE_USER" | "ROLE_ADMIN" | "USER" | "ADMIN";

export interface Role {
  id?: string | number;
  roleName: RoleName;
}

export interface User {
  id: string;
  userId?: string;
  email: string;
  username?: string;
  fullName?: string;
  name?: string;
  avatarUrl?: string | null;

  role?: RoleName;
  roles?: Role[];
}

export interface UserProfile {
  id?: string;
  userId: string;
  profileId?: string;

  fullName: string;
  email: string;
  username?: string;

  avatarUrl?: string | null;
  phoneNumber?: string | null;
  address?: string | null;

  role?: RoleName;
  status?: string;

  gender?: string | null;
  dateOfBirth?: string | null;
  notes?: string | null;

  // Body measurements
  height?: string | null;
  weight?: string | null;
  chest?: string | null;
  waist?: string | null;
  hips?: string | null;
  shoeSize?: string | null;
  fitPreference?: string | null;

  favoriteColors?: string | null;
  stylePreference?: string | null;
  lifestylePreference?: string | null;
  occupation?: string | null;

  // Giữ tạm field cũ nếu vài màn khác còn dùng
  phone?: string;
  bio?: string;
  location?: string;
  dob?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  name?: string;
}

export interface UpdateUserPayload {
  fullName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  notes?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;

  height?: string;
  weight?: string;
  chest?: string;
  waist?: string;
  hips?: string;
  shoeSize?: string;
  fitPreference?: string;

  favoriteColors?: string;
  stylePreference?: string;
  lifestylePreference?: string;
  occupation?: string;
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