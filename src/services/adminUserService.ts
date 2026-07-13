import axios from "axios";

import apiClient from "./apiClient";

import type {
  ApiResponse,
  PageResponse,
} from "../types/apiResponses";

import type {
  UpdateUserAdminRequest,
  UserManagementResponse,
} from "../types/admin";

function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (axios.isAxiosError(error)) {
    const backendMessage = error.response?.data?.message;

    if (
      typeof backendMessage === "string" &&
      backendMessage.trim().length > 0
    ) {
      return backendMessage;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

export async function updateUserByAdmin(
  userId: string,
  request: UpdateUserAdminRequest,
): Promise<UserManagementResponse> {
  try {
    const response = await apiClient.put<
      ApiResponse<UserManagementResponse>
    >("/users/admin", request, {
      params: {
        userId,
      },
    });

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Không thể cập nhật người dùng",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Không thể cập nhật người dùng",
      ),
    );
  }
}

export async function getAdminUsers({
  page = 0,
  size = 10,
  sort = "createdAt,desc",
}: {
  page?: number;
  size?: number;
  sort?: string;
} = {}): Promise<PageResponse<UserManagementResponse>> {
  try {
    const response = await apiClient.get<
      ApiResponse<PageResponse<UserManagementResponse>>
    >("/users/admin", {
      params: {
        page,
        size,
        sort,
      },
    });

    if (!response.data.success) {
      throw new Error(
        response.data.message ||
          "Không thể tải danh sách người dùng",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Không thể tải danh sách người dùng",
      ),
    );
  }
}