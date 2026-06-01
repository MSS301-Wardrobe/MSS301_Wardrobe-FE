import { apiClient } from "./apiClient";
import type { LoginPayload, RegisterPayload, AuthResponse } from "../types/user";

// Placeholder auth service. Wire these to the real backend later.
export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse | void> {
    // const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
    // return data;
    return Promise.resolve();
  },
  async register(payload: RegisterPayload): Promise<AuthResponse | void> {
    // const { data } = await apiClient.post<AuthResponse>("/auth/register", payload);
    // return data;
    return Promise.resolve();
  },
  async forgotPassword(email: string): Promise<void> {
    // await apiClient.post("/auth/forgot-password", { email });
    return Promise.resolve();
  },
  async logout(): Promise<void> {
    // await apiClient.post("/auth/logout");
    return Promise.resolve();
  },
};

export default authService;
