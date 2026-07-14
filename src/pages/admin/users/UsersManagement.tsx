import { useEffect, useState } from "react";

import {
  Ban,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";

import {
  getAdminUsers,
  updateUserByAdmin,
} from "../../../services/adminUserService";

import type {
  UpdateUserAdminRequest,
  UserManagementResponse,
} from "../../../types/admin";

const PAGE_SIZE = 10;

const ROLE_OPTIONS = [
  "ROLE_USER",
  "ROLE_ADMIN",
];

const STATUS_OPTIONS = [
  "ACTIVE",
  "INACTIVE",
  "BLOCKED",
];

function formatDate(value?: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getInitials(user: UserManagementResponse): string {
  const name =
    user.fullName?.trim() ||
    user.username?.trim() ||
    user.email?.trim() ||
    "U";

  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "Đang hoạt động";

    case "INACTIVE":
      return "Không hoạt động";

    case "BLOCKED":
      return "Đã khóa";

    case "PENDING":
      return "Chờ xác nhận";

    default:
      return status || "Chưa xác định";
  }
}

function getStatusStyle(status: string): React.CSSProperties {
  switch (status) {
    case "ACTIVE":
      return {
        background: "#ECFDF3",
        color: "#027A48",
        borderColor: "#ABEFC6",
      };

    case "BLOCKED":
      return {
        background: "#FEF3F2",
        color: "#B42318",
        borderColor: "#FECDCA",
      };

    case "PENDING":
      return {
        background: "#FFFAEB",
        color: "#B54708",
        borderColor: "#FEDF89",
      };

    default:
      return {
        background: "#F2F4F7",
        color: "#475467",
        borderColor: "#E4E7EC",
      };
  }
}

export function UsersManagement() {
  const [users, setUsers] = useState<UserManagementResponse[]>([]);

  const [page, setPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] =
    useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  async function loadUsers(targetPage = 0) {
    try {
      setLoading(true);
      setError(null);

      const result = await getAdminUsers({
        page: targetPage,
        size: PAGE_SIZE,
        sort: "createdAt,desc",
      });

      setUsers(result.items ?? []);
      setPage(result.page);
      setTotalItems(result.totalItems);
      setTotalPages(result.totalPages);
      setHasNext(result.hasNext);
      setHasPrevious(result.hasPrevious);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Không thể tải danh sách người dùng";

      setError(message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers(0);
  }, []);

  async function handleUpdateUser(
    user: UserManagementResponse,
    request: UpdateUserAdminRequest,
  ) {
    try {
      setUpdatingUserId(user.userId);
      setError(null);
      setSuccessMessage(null);

      const updatedUser = await updateUserByAdmin(
        user.userId,
        request,
      );

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.userId === user.userId
            ? {
                ...currentUser,
                ...updatedUser,
              }
            : currentUser,
        ),
      );

      setSuccessMessage("Cập nhật người dùng thành công");

      window.setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Cập nhật người dùng thất bại";

      setError(message);
    } finally {
      setUpdatingUserId(null);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <div>
        <h2
          style={{
            fontSize: "1.3rem",
            fontWeight: 800,
            color: "#0F172A",
            marginBottom: 4,
          }}
        >
          Quản Lý Người Dùng
        </h2>

        <p
          style={{
            color: "#64748B",
            fontSize: "0.85rem",
            margin: 0,
          }}
        >
          Xem và quản lý tài khoản người dùng trên nền tảng
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            background: "#FEF3F2",
            color: "#B42318",
            border: "1px solid #FECDCA",
          }}
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            background: "#ECFDF3",
            color: "#027A48",
            border: "1px solid #ABEFC6",
          }}
        >
          {successMessage}
        </div>
      )}

      <div
        style={{
          background: "white",
          borderRadius: 16,
          border: "1px solid #E2E8F0",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: 20,
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "#FFEDD5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={24} color="#EA580C" />
            </div>

            <div>
              <h3
                style={{
                  margin: 0,
                  fontWeight: 700,
                  color: "#0F172A",
                  fontSize: "1rem",
                }}
              >
                Danh sách người dùng
              </h3>

              <p
                style={{
                  margin: "4px 0 0",
                  color: "#64748B",
                  fontSize: "0.82rem",
                }}
              >
                Tổng cộng {totalItems} tài khoản
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadUsers(page)}
            disabled={loading}
            style={{
              height: 40,
              padding: "0 14px",
              borderRadius: 10,
              border: "1px solid #CBD5E1",
              background: "white",
              color: "#475569",
              display: "flex",
              alignItems: "center",
              gap: 7,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            <RefreshCw size={16} />
            Tải lại
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: 900,
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                <th style={headerCellStyle}>Người dùng</th>
                <th style={headerCellStyle}>Vai trò</th>
                <th style={headerCellStyle}>Trạng thái</th>
                <th style={headerCellStyle}>Ngày tạo</th>
                <th style={headerCellStyle}>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: 60,
                      textAlign: "center",
                      color: "#64748B",
                    }}
                  >
                    <LoaderCircle
                      size={28}
                      style={{
                        animation: "user-loading-spin 1s linear infinite",
                        marginBottom: 10,
                      }}
                    />

                    <div>Đang tải danh sách người dùng...</div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: 60,
                      textAlign: "center",
                      color: "#64748B",
                    }}
                  >
                    Chưa có người dùng nào
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isUpdating =
                    updatingUserId === user.userId;

                  return (
                    <tr key={user.userId}>
                      <td style={bodyCellStyle}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.fullName || user.email}
                              style={{
                                width: 42,
                                height: 42,
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "1px solid #E2E8F0",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 42,
                                height: 42,
                                borderRadius: "50%",
                                background: "#FFEDD5",
                                color: "#EA580C",
                                fontSize: "0.82rem",
                                fontWeight: 800,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {getInitials(user)}
                            </div>
                          )}

                          <div>
                            <div
                              style={{
                                fontSize: "0.87rem",
                                fontWeight: 700,
                                color: "#0F172A",
                              }}
                            >
                              {user.fullName ||
                                user.username ||
                                "Chưa cập nhật tên"}
                            </div>

                            <div
                              style={{
                                marginTop: 3,
                                color: "#64748B",
                                fontSize: "0.78rem",
                              }}
                            >
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={bodyCellStyle}>
                        <span
                          style={{
                            display: "inline-flex",
                            padding: "5px 10px",
                            borderRadius: 999,
                            background: user.role === "ROLE_ADMIN" ? "#FFEDD5" : "#EFF6FF",
                            color: user.role === "ROLE_ADMIN" ? "#EA580C" : "#1D4ED8",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          {user.role || "USER"}
                        </span>
                      </td>

                      <td style={bodyCellStyle}>
                        <span
                          style={{
                            ...getStatusStyle(user.status),
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "5px 10px",
                            borderRadius: 999,
                            borderWidth: 1,
                            borderStyle: "solid",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          {user.status === "ACTIVE" ? (
                            <UserCheck size={14} />
                          ) : user.status === "BLOCKED" ? (
                            <Ban size={14} />
                          ) : (
                            <ShieldCheck size={14} />
                          )}

                          {getStatusLabel(user.status)}
                        </span>
                      </td>

                      <td
                        style={{
                          ...bodyCellStyle,
                          color: "#475569",
                          fontSize: "0.8rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(user.createdAt)}
                      </td>

                      <td style={bodyCellStyle}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
            

                          <select
                            value={user.status || "ACTIVE"}
                            disabled={isUpdating || user.role === "ROLE_ADMIN"}
                            onChange={(event) =>
                              void handleUpdateUser(user, {
                                status: event.target.value,
                              })
                            }
                            style={{
                              ...selectStyle,
                              cursor: (isUpdating || user.role === "ROLE_ADMIN") ? "not-allowed" : "pointer",
                              opacity: (isUpdating || user.role === "ROLE_ADMIN") ? 0.6 : 1,
                            }}
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {getStatusLabel(status)}
                              </option>
                            ))}
                          </select>

                          {isUpdating && (
                            <LoaderCircle
                              size={17}
                              color="#EA580C"
                              style={{
                                animation:
                                  "user-loading-spin 1s linear infinite",
                              }}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid #E2E8F0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: "#64748B",
              fontSize: "0.82rem",
            }}
          >
            Trang {totalPages === 0 ? 0 : page + 1} / {totalPages}
          </span>

          <div
            style={{
              display: "flex",
              gap: 8,
            }}
          >
            <button
              type="button"
              disabled={!hasPrevious || loading}
              onClick={() => void loadUsers(page - 1)}
              style={{
                ...paginationButtonStyle,
                opacity: !hasPrevious || loading ? 0.5 : 1,
                cursor:
                  !hasPrevious || loading
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              <ChevronLeft size={16} />
              Trước
            </button>

            <button
              type="button"
              disabled={!hasNext || loading}
              onClick={() => void loadUsers(page + 1)}
              style={{
                ...paginationButtonStyle,
                opacity: !hasNext || loading ? 0.5 : 1,
                cursor:
                  !hasNext || loading
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              Sau
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes user-loading-spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}

const headerCellStyle: React.CSSProperties = {
  padding: "13px 16px",
  textAlign: "left",
  color: "#475569",
  fontSize: "0.77rem",
  fontWeight: 700,
  borderBottom: "1px solid #E2E8F0",
  whiteSpace: "nowrap",
};

const bodyCellStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderBottom: "1px solid #F1F5F9",
};

const selectStyle: React.CSSProperties = {
  height: 36,
  padding: "0 10px",
  borderRadius: 8,
  border: "1px solid #CBD5E1",
  background: "white",
  color: "#334155",
  fontSize: "0.78rem",
  outline: "none",
};

const paginationButtonStyle: React.CSSProperties = {
  height: 36,
  padding: "0 12px",
  borderRadius: 8,
  border: "1px solid #CBD5E1",
  background: "white",
  color: "#475569",
  display: "flex",
  alignItems: "center",
  gap: 5,
};