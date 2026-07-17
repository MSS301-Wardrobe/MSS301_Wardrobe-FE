import { apiClient } from "./apiClient";
import type { User } from "../types/user";
import type { ApiResponse } from "@/types/apiResonse";

type LoginResponse = {
  message?: string;
  user?: User;
  data?: User;
};

type VerifyForgotPasswordOtpResponse = {
  resetToken: string;
};

type ResetPasswordPayload = {
  resetToken: string;
  newPassword: string;
};

export const authService = {
  async login(email: string, password: string): Promise<User> {
    try {
      const response = await apiClient.post<LoginResponse>(
        "/users/auth/login",
        {
          email: email.trim(),
          password,
        },
      );

      /*
       * Trường hợp backend trả trực tiếp thông tin user:
       * {
       *   user: {...}
       * }
       */
      if (response.data?.user) {
        return response.data.user;
      }

      /*
       * Trường hợp backend dùng ApiResponse:
       * {
       *   code: 1000,
       *   data: {...}
       * }
       */
      if (response.data?.data) {
        return response.data.data;
      }

      /*
       * Nếu backend chỉ set HttpOnly cookie sau khi login thành công,
       * mới gọi /users/me để lấy thông tin.
       */
      return await this.me();
    } catch (error) {
      /*
       * Quan trọng:
       * Không trả demo user.
       * Không nuốt lỗi.
       * Ném lỗi về useMutation để chạy onError.
       */
      throw error;
    }
  },

  async me(): Promise<User> {
    const { data } =
      await apiClient.get<ApiResponse<User>>("/users/me");

    if (!data?.data) {
      throw new Error("Không lấy được thông tin người dùng");
    }

    return data.data;
  },

  async register(payload: {
    email: string;
    username: string;
    password: string;
    fullName: string;
  }) {
    const { data } = await apiClient.post(
      "/users/auth/register",
      payload,
    );

    return data;
  },

  async confirmRegister(payload: {
    email: string;
    otp: string;
  }) {
    const { data } = await apiClient.post(
      "/users/auth/confirm-register",
      payload,
    );

    return data;
  },

  async resendCode(email: string) {
    const { data } = await apiClient.post(
      "/users/auth/resend-code",
      { email },
    );

    return data;
  },

  async forgotPassword(email: string) {
    const { data } = await apiClient.post(
      "/users/auth/forgot-password",
      { email },
    );

    return data;
  },

  async verifyForgotPasswordOtp(payload: {
    email: string;
    otp: string;
  }): Promise<VerifyForgotPasswordOtpResponse> {
    const { data } = await apiClient.post<
      ApiResponse<VerifyForgotPasswordOtpResponse>
    >(
      "/users/auth/verify-forgot-password-otp",
      payload,
    );

    return data.data;
  },

  async resetPassword(payload: ResetPasswordPayload) {
    const { data } = await apiClient.post(
      "/users/auth/reset-password",
      payload,
    );

    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/users/auth/logout");
  },

  async refresh(): Promise<void> {
    await apiClient.post("/users/auth/refresh");
  },

  async googleCallback(code: string): Promise<void> {
    const redirectUri = `${window.location.origin}/authenticate`;

    await apiClient.post("/users/auth/google/callback", {
      code,
      redirectUri,
    });
  },

  async syncCurrentUser(): Promise<User> {
    const { data } = await apiClient.post<ApiResponse<User>>(
      "/users/auth/me/sync",
    );

    return data.data;
  },
};

export default authService;