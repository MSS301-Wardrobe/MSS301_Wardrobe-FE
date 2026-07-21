import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";

import { getAdminUsers } from "../../../services/adminUserService";
import {
  getRecommendationHistory,
  getRecommendationHistoryDetail,
} from "../../../services/adminRecommendationService";
import type { UserManagementResponse } from "../../../types/admin";
import type {
  RecommendationHistoryItem,
  RecommendationHistorySort,
  RecommendationHistoryType,
} from "../../../types/adminRecommendation";
import type { Recommendation } from "../../../types/recommendation";

const PAGE_SIZE = 10;

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getUserName(
  userId: string,
  userMap: Map<string, UserManagementResponse>,
): string {
  const user = userMap.get(userId);
  return (
    user?.fullName?.trim() ||
    user?.username?.trim() ||
    user?.email?.trim() ||
    userId.slice(0, 8)
  );
}

function getTypeLabel(type: RecommendationHistoryType | string): string {
  switch (type) {
    case "personal":
      return "Cá nhân";
    case "group":
      return "Nhóm bạn";
    case "event":
      return "Sự kiện";
    default:
      return "Tất cả";
  }
}

function getTypeStyle(type: RecommendationHistoryType | string): React.CSSProperties {
  switch (type) {
    case "personal":
      return { background: "#FFF7ED", color: "#C2410C", border: "1px solid #FDBA74" };
    case "group":
      return { background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" };
    case "event":
      return { background: "#ECFDF5", color: "#047857", border: "1px solid #A7F3D0" };
    default:
      return { background: "#F8FAFC", color: "#475467", border: "1px solid #E2E8F0" };
  }
}

const tableHeaderStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "#64748B",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  borderBottom: "1px solid #E2E8F0",
  whiteSpace: "nowrap",
};

const tableCellStyle: React.CSSProperties = {
  padding: "14px 16px",
  fontSize: "0.85rem",
  color: "#334155",
  borderBottom: "1px solid #F1F5F9",
  verticalAlign: "middle",
};

const actionButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid #E2E8F0",
  background: "white",
  color: "#475467",
  fontSize: "0.78rem",
  fontWeight: 600,
  cursor: "pointer",
};

function DetailModal({
  detail,
  userMap,
  onClose,
}: {
  detail: Recommendation;
  userMap: Map<string, UserManagementResponse>;
  onClose: () => void;
}) {
  const user = userMap.get(detail.userId);
  const clothingItems = detail.outfit?.clothingItems ?? [];
  const score = Math.round((detail.recommendationScore ?? 0) * 10);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          width: "min(640px, 100%)",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0F172A" }}>
              {detail.outfit?.outfitName || "Chi tiết gợi ý"}
            </h3>
            <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: "0.82rem" }}>
              Điểm phù hợp: {score}%
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "#F8FAFC",
              borderRadius: 8,
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={18} color="#64748B" />
          </button>
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          <section>
            <h4 style={{ margin: "0 0 10px", fontSize: "0.82rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
              Người dùng
            </h4>
            <div style={{ display: "grid", gap: 6, fontSize: "0.88rem", color: "#334155" }}>
              <div><strong>Tên:</strong> {getUserName(detail.userId, userMap)}</div>
              <div><strong>Email:</strong> {user?.email || "—"}</div>
            </div>
          </section>

          <section>
            <h4 style={{ margin: "0 0 10px", fontSize: "0.82rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
              Thông tin gợi ý
            </h4>
            <div style={{ display: "grid", gap: 6, fontSize: "0.88rem", color: "#334155" }}>
              <div><strong>Loại sự kiện:</strong> {detail.eventType || "—"}</div>
              <div><strong>Mô tả:</strong> {detail.outfit?.description || "—"}</div>
            </div>
          </section>

          <section>
            <h4 style={{ margin: "0 0 10px", fontSize: "0.82rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
              Trang phục trong bộ ({clothingItems.length})
            </h4>
            {clothingItems.length === 0 ? (
              <p style={{ margin: 0, color: "#94A3B8", fontSize: "0.85rem" }}>Không có dữ liệu chi tiết</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {clothingItems.map((item) => (
                  <div
                    key={item.itemId}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #E2E8F0",
                      background: "#F8FAFC",
                      fontSize: "0.85rem",
                      color: "#334155",
                    }}
                  >
                    <strong>{item.itemName || "Trang phục"}</strong>
                    {item.dominantColor ? ` · ${item.dominantColor}` : ""}
                    {item.category?.categoryName ? ` · ${item.category.categoryName}` : ""}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export function RecommendationLogs() {
  const [activeType, setActiveType] = useState<RecommendationHistoryType>("all");
  const [sort, setSort] = useState<RecommendationHistorySort>("newest");
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<RecommendationHistoryItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [personalCount, setPersonalCount] = useState(0);
  const [groupCount, setGroupCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<Recommendation | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [userMap, setUserMap] = useState<Map<string, UserManagementResponse>>(new Map());

  const loadUsers = useCallback(async () => {
    try {
      const result = await getAdminUsers({ page: 0, size: 500, sort: "createdAt,desc" });
      const map = new Map<string, UserManagementResponse>();
      for (const user of result.items ?? []) {
        map.set(user.userId, user);
      }
      setUserMap(map);
    } catch {
      setUserMap(new Map());
    }
  }, []);

  const loadHistory = useCallback(async (targetPage = 0) => {
    try {
      setLoading(true);
      setError(null);

      const result = await getRecommendationHistory({
        type: activeType,
        page: targetPage,
        size: PAGE_SIZE,
        sort,
      });

      setItems(result.items ?? []);
      setPage(result.page);
      setTotalItems(result.totalItems);
      setTotalPages(result.totalPages);
      setHasNext(result.hasNext);
      setHasPrevious(result.hasPrevious);
      setTotalCount(result.totalCount ?? 0);
      setPersonalCount(result.personalCount ?? 0);
      setGroupCount(result.groupCount ?? 0);
      setEventCount(result.eventCount ?? 0);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Không thể tải lịch sử gợi ý";
      setError(message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeType, sort]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    void loadHistory(0);
    setPage(0);
  }, [activeType, sort, loadHistory]);

  async function handleViewDetail(item: RecommendationHistoryItem) {
    try {
      setDetailLoading(true);
      const data = await getRecommendationHistoryDetail(item.recommendationId);
      setDetail(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Không thể tải chi tiết",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  const typeButtonStyle = useMemo(
    () =>
      (type: RecommendationHistoryType): React.CSSProperties => ({
        padding: "10px 16px",
        borderRadius: 10,
        border: "1px solid",
        borderColor: activeType === type ? "#FDBA74" : "#E2E8F0",
        background: activeType === type ? "#FFF7ED" : "white",
        color: activeType === type ? "#C2410C" : "#64748B",
        fontWeight: 700,
        fontSize: "0.84rem",
        cursor: "pointer",
      }),
    [activeType],
  );

  const sortButtonStyle = useMemo(
    () =>
      (value: RecommendationHistorySort): React.CSSProperties => ({
        padding: "8px 14px",
        borderRadius: 8,
        border: "1px solid",
        borderColor: sort === value ? "#FDBA74" : "#E2E8F0",
        background: sort === value ? "#FFF7ED" : "white",
        color: sort === value ? "#C2410C" : "#64748B",
        fontWeight: 600,
        fontSize: "0.82rem",
        cursor: "pointer",
      }),
    [sort],
  );

  const statCards = [
    { label: "Cá nhân", value: personalCount, icon: User, color: "#C2410C", bg: "#FFEDD5" },
    { label: "Nhóm bạn", value: groupCount, icon: Users, color: "#2563EB", bg: "#EFF6FF" },
    { label: "Sự kiện", value: eventCount, icon: Sparkles, color: "#059669", bg: "#ECFDF5" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>
          Lịch Sử Gợi Ý
        </h2>
        <p style={{ color: "#64748B", fontSize: "0.85rem", margin: 0 }}>
          Xem lại các gợi ý trang phục mà hệ thống đã tạo
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            style={{
              background: "white",
              borderRadius: 14,
              padding: "18px 20px",
              border: "1px solid #E2E8F0",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ color: "#64748B", fontSize: "0.78rem", fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0F172A", marginTop: 2 }}>
                {value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: 10, background: "#FEF3F2", color: "#B42318", border: "1px solid #FECDCA" }}>
          {error}
        </div>
      )}

      <div style={{ background: "white", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2E8F0", display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" style={typeButtonStyle("all")} onClick={() => setActiveType("all")}>
              Tất cả ({totalCount})
            </button>
            <button type="button" style={typeButtonStyle("personal")} onClick={() => setActiveType("personal")}>
              Cá nhân ({personalCount})
            </button>
            <button type="button" style={typeButtonStyle("group")} onClick={() => setActiveType("group")}>
              Nhóm bạn ({groupCount})
            </button>
            <button type="button" style={typeButtonStyle("event")} onClick={() => setActiveType("event")}>
              Sự kiện ({eventCount})
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ color: "#64748B", fontSize: "0.82rem", fontWeight: 600 }}>Sắp xếp:</span>
            <button type="button" style={sortButtonStyle("newest")} onClick={() => setSort("newest")}>
              Mới nhất
            </button>
            <button type="button" style={sortButtonStyle("oldest")} onClick={() => setSort("oldest")}>
              Cũ nhất
            </button>
            <button
              type="button"
              onClick={() => void loadHistory(page)}
              disabled={loading}
              style={{ ...actionButtonStyle, marginLeft: 4 }}
            >
              <RefreshCw size={14} />
              Làm mới
            </button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                <th style={tableHeaderStyle}>#</th>
                <th style={tableHeaderStyle}>Người dùng</th>
                <th style={tableHeaderStyle}>Tên gợi ý</th>
                <th style={tableHeaderStyle}>Loại</th>
                <th style={tableHeaderStyle}>Số món</th>
                <th style={tableHeaderStyle}>Điểm phù hợp</th>
                <th style={tableHeaderStyle}>Thời gian</th>
                <th style={tableHeaderStyle}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ ...tableCellStyle, textAlign: "center", padding: 40 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#64748B" }}>
                      <LoaderCircle size={18} style={{ animation: "spin 1s linear infinite" }} />
                      Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ ...tableCellStyle, textAlign: "center", padding: 40, color: "#94A3B8" }}>
                    Chưa có gợi ý nào
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item.recommendationId}>
                    <td style={tableCellStyle}>{page * PAGE_SIZE + index + 1}</td>
                    <td style={{ ...tableCellStyle, fontWeight: 600 }}>
                      {getUserName(item.userId, userMap)}
                    </td>
                    <td style={{ ...tableCellStyle, maxWidth: 260 }}>
                      <div style={{ fontWeight: 600, color: "#0F172A" }}>{item.outfitName}</div>
                      {item.description && (
                        <div style={{ fontSize: "0.78rem", color: "#94A3B8", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 240 }}>
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td style={tableCellStyle}>
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          ...getTypeStyle(item.recommendationType),
                        }}
                      >
                        {getTypeLabel(item.recommendationType)}
                      </span>
                    </td>
                    <td style={tableCellStyle}>{item.itemCount}</td>
                    <td style={tableCellStyle}>{Math.round(item.recommendationScore * 10)}%</td>
                    <td style={tableCellStyle}>{formatDate(item.generatedAt)}</td>
                    <td style={tableCellStyle}>
                      <button
                        type="button"
                        style={actionButtonStyle}
                        disabled={detailLoading}
                        onClick={() => void handleViewDetail(item)}
                      >
                        <Eye size={14} />
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: "14px 20px", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#64748B", fontSize: "0.82rem" }}>
            Trang {totalPages === 0 ? 0 : page + 1} / {totalPages} · {totalItems} bản ghi
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              disabled={!hasPrevious || loading}
              onClick={() => void loadHistory(page - 1)}
              style={{
                ...actionButtonStyle,
                opacity: !hasPrevious || loading ? 0.5 : 1,
                cursor: !hasPrevious || loading ? "not-allowed" : "pointer",
              }}
            >
              <ChevronLeft size={16} />
              Trước
            </button>
            <button
              type="button"
              disabled={!hasNext || loading}
              onClick={() => void loadHistory(page + 1)}
              style={{
                ...actionButtonStyle,
                opacity: !hasNext || loading ? 0.5 : 1,
                cursor: !hasNext || loading ? "not-allowed" : "pointer",
              }}
            >
              Sau
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {detail && (
        <DetailModal
          detail={detail}
          userMap={userMap}
          onClose={() => setDetail(null)}
        />
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
