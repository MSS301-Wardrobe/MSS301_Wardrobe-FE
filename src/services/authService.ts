import { apiClient } from "./apiClient";
import type { User } from "../types/user";
import { ApiResponse } from "@/types/apiResonse";

type LoginResponse = {
  message?: string;
  user?: User;
};

// Demo credentials — used when backend is not available
const DEMO_USERS = [
  { email: "admin@gmail.com", password: "Admin@123", role: "ADMIN", name: "Admin" },
  { email: "user@example.com", password: "User@123", role: "USER", name: "Demo User" },
];

export const authService = {
  async login(email: string, password: string): Promise<User> {
    try {
      const { data } = await apiClient.post<LoginResponse>("/users/auth/login", {
        email,
        password,
      });
      if (data?.user) return data.user;
      return this.me();
    } catch {
      // Demo fallback when backend is unavailable
      const demo = DEMO_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (demo) {
        return { id: "demo-user", email: demo.email, name: demo.name, role: demo.role as "USER" | "ADMIN" };
      }
      throw new Error("Email hoặc mật khẩu không đúng");
    }
  },

  async me(): Promise<User> {
  const { data } = await apiClient.get<ApiResponse<User>>("/users/me");
  return data.data;
},

  async register(payload: {
    email: string;
    password: string;
  }) {
    const { data } = await apiClient.post("/users/auth/register", payload);
    return data;
  },

  async confirmRegister(payload: {
    email: string;
    otp: string;
  }) {
    const { data } = await apiClient.post("/users/auth/confirm-register", payload);
    return data;
  },

  async resendCode(email: string) {
    const { data } = await apiClient.post("/users/auth/resend-code", {
      email,
    });
    return data;
  },

  async forgotPassword(email: string) {
    const { data } = await apiClient.post("/users/auth/forgot-password", {
      email,
    });
    return data;
  },

  async resetPassword(payload: {
    email: string;
    otp: string;
    newPassword: string;
  }) {
    const { data } = await apiClient.post("/users/auth/reset-password", payload);
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/users/auth/logout");
  },

  async refresh(): Promise<void> {
  await apiClient.post("/users/auth/refresh");
}
};

export default authService;