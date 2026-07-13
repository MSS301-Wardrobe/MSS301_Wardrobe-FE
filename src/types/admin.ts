export interface UserManagementResponse {
  userId: string;
  username?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  email: string;
  role: string;
  status: string;
  createdAt?: string;
}

export interface UpdateUserAdminRequest {
  username?: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  status?: string;
}