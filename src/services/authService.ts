import { apiClient } from "./apiClient";
import type { User } from "../types/user";

type LoginResponse = {
  message?: string;
  user?: User;
};

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const { data } = await apiClient.post<LoginResponse>("/users/auth/login", {
      email,
      password,
    });

    // Nếu backend login trả luôn user
    if (data?.user) {
      return data.user;
    }

    // Nếu backend login chỉ set cookie và trả message
    return this.me();
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<User>("/users/me");
    return data;
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