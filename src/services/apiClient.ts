import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const status = error.response?.status;
    const url = originalRequest?.url ?? "";

    console.log("[API ERROR]", {
      url,
      status,
      retried: originalRequest?._retry,
    });

    const isAuthEndpoint =
      url.includes("/users/auth/login") ||
      url.includes("/users/auth/register") ||
      url.includes("/users/auth/refresh") ||
      url.includes("/users/auth/logout");

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        console.log("[AUTH] Access token expired. Trying refresh...");

        await apiClient.post("/users/auth/refresh");

        console.log("[AUTH] Refresh success. Retrying original request...");

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.log("[AUTH] Refresh failed:", refreshError);

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;