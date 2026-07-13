import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:8080/api/v1";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },

  // Bắt buộc để trình duyệt gửi HttpOnly Cookie
  withCredentials: true,
});

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

function isAuthEndpoint(url: string): boolean {
  return (
    url.includes("/users/auth/login") ||
    url.includes("/users/auth/register") ||
    url.includes("/users/auth/confirm-register") ||
    url.includes("/users/auth/resend-code") ||
    url.includes("/users/auth/google/callback") ||
    url.includes("/users/auth/me/sync") ||
    url.includes("/users/auth/refresh") ||
    url.includes("/users/auth/logout") ||
    url.includes("/users/auth/forgot-password") ||
    url.includes("/users/auth/verify-forgot-password-otp") ||
    url.includes("/users/auth/reset-password")
  );
}

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as RetryConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const url = originalRequest.url ?? "";

    console.log("[API ERROR]", {
      url,
      status,
      retried: originalRequest._retry,
    });

    /*
     * Không tự refresh cho các endpoint auth.
     *
     * Đặc biệt:
     * - google/callback đang tạo cookie
     * - me/sync chạy ngay sau callback
     * - refresh không được tự gọi lại chính nó
     */
    if (status === 401 && isAuthEndpoint(url)) {
      return Promise.reject(error);
    }

    /*
     * Với API bình thường:
     * Access token hết hạn thì gọi refresh một lần,
     * sau đó thử lại request ban đầu.
     */
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log(
          "[AUTH] Access token expired. Trying refresh..."
        );

        await apiClient.post("/users/auth/refresh");

        console.log(
          "[AUTH] Refresh success. Retrying original request..."
        );

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error(
          "[AUTH] Refresh failed:",
          refreshError
        );

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;