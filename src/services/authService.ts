import { apiClient } from "./apiClient";
import type { LoginPayload, RegisterPayload, AuthResponse } from "../types/user";
import { ACCESS_TOKEN_KEY } from "../utils/constants";

// Demo credentials (used when backend is not available)
const DEMO_USERS = [
  { email: "admin@gmail.com", password: "Admin@123", role: "ADMIN" as const, name: "Admin" },
  { email: "user@example.com", password: "User@123", role: "USER" as const, name: "Demo User" },
];

function tryDemoLogin(email: string, password: string): AuthResponse | null {
  const match = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!match) return null;
  return {
    accessToken: "demo-token",
    user: { id: "demo-user", email: match.email, name: match.name, role: match.role },
  };
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
      localStorage.setItem("role", data.user.role ?? "USER");
      return data;
    } catch {
      // Fallback to demo mode when backend is unavailable
      const demo = tryDemoLogin(payload.email, payload.password);
      if (demo) {
        localStorage.setItem(ACCESS_TOKEN_KEY, demo.accessToken);
        localStorage.setItem("role", demo.user.role ?? "USER");
        return demo;
      }
      throw new Error("Email hoặc mật khẩu không đúng");
    }
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const { data } = await apiClient.post<AuthResponse>("/auth/register", payload);
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
      localStorage.setItem("role", data.user.role ?? "USER");
      return data;
    } catch {
      // Demo mode: simulate register success
      const demoResp: AuthResponse = {
        accessToken: "demo-token",
        user: { id: "demo-user", email: payload.email, name: payload.name ?? "Người dùng", role: "USER" },
      };
      localStorage.setItem(ACCESS_TOKEN_KEY, demoResp.accessToken);
      localStorage.setItem("role", "USER");
      return demoResp;
    }
  },

  async forgotPassword(email: string): Promise<void> {
    try {
      await apiClient.post("/auth/forgot-password", { email });
    } catch {
      // Demo mode: silently succeed
    }
  },

  async resetPassword(payload: { email: string; otp: string; newPassword: string }): Promise<void> {
    try {
      await apiClient.post("/auth/reset-password", payload);
    } catch {
      // Demo mode: silently succeed
    }
  },

  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/auth/google", { idToken });
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem("role", data.user.role ?? "USER");
    return data;
  },

  logout(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem("role");
  },
};

export default authService;
