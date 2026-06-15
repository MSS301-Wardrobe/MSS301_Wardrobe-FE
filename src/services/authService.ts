import { apiClient } from "./apiClient";

export const authService = {
  async login(email: string, password: string) {
    await apiClient.post("/users/auth/login", {
      email,
      password,
    });

    const { data } = await apiClient.get("/users/me");

    localStorage.setItem("user", JSON.stringify(data));

    const role = data.roles?.[0]?.roleName ?? data.role ?? "ROLE_USER";
    localStorage.setItem("role", role);

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

  async logout() {
    await apiClient.post("/users/auth/logout");

    localStorage.removeItem("user");
    localStorage.removeItem("role");
  },
};

export default authService;