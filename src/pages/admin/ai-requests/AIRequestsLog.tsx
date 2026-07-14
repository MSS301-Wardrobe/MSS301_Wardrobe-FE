import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderCircle,
  Pin,
  PinOff,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

import { getAdminUsers } from "../../../services/adminUserService";
import {
  getDetectionHistory,
  getDetectionHistoryDetail,
  getStorageImageUrl,
  hardDeleteDetection,
  toggleDetectionPin,
  toggleDetectionStatus,
} from "../../../services/adminDetectionService";
import {
  clothingItemApi,
  wardrobeApi,
  wardrobeZoneApi,
} from "../../../services/wardrobeService";
import { storageService } from "../../../services/storageService";
import type { UserManagementResponse } from "../../../types/admin";
import type {
  DetectionHistoryDetail,
  DetectionHistoryItem,
  DetectionHistorySort,
  DetectionHistoryTab,
} from "../../../types/ai";
import {
  translateBaseColor,
  translateCategory,
  translateGender,
  translateStyle,
} from "../../../utils/aiMappings";

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

function parseColorLabel(value: DetectionHistoryItem["dominantColor"]): string {
  if (!value) return "—";
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as { base_color?: string; name?: string };
      if (parsed.base_color) return translateBaseColor(parsed.base_color);
      return parsed.name || value;
    } catch {
      return value;
    }
  }
  if (value.base_color) return translateBaseColor(value.base_color);
  return value.name || "—";
}

function parseStyleLabel(value: DetectionHistoryItem["style"]): string {
  if (!value) return "—";
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as string[];
      return parsed.map((item) => translateStyle([item])).join(", ");
    } catch {
      return value;
    }
  }
  return value.map((item) => translateStyle([item])).join(", ");
}

function getRecordStatusLabel(status: DetectionHistoryItem["recordStatus"]): string {
  return status === "INACTIVE" ? "Ngừng hoạt động" : "Hoạt động";
}

function getRecordStatusStyle(status: DetectionHistoryItem["recordStatus"]): React.CSSProperties {
  if (status === "INACTIVE") {
    return {
      background: "#FEF3F2",
      color: "#B42318",
      border: "1px solid #FECDCA",
    };
  }
  return {
    background: "#ECFDF3",
    color: "#027A48",
    border: "1px solid #ABEFC6",
  };
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

const paginationButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #E2E8F0",
  background: "white",
  color: "#334155",
  fontSize: "0.82rem",
  fontWeight: 600,
  cursor: "pointer",
};

type WardrobeContext = {
  wardrobeName?: string;
  zoneName?: string;
};

function DetectionDetailModal({
  detail,
  userMap,
  variant,
  onClose,
}: {
  detail: DetectionHistoryDetail;
  userMap: Map<string, UserManagementResponse>;
  variant: "not_added" | "added";
  onClose: () => void;
}) {
  const [wardrobeContext, setWardrobeContext] = useState<WardrobeContext>({});
  const [loadingWardrobe, setLoadingWardrobe] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);

  const user = userMap.get(detail.userId);
  const isAdded = variant === "added";

  useEffect(() => {
    if (!isAdded || !detail.clothingItemId) {
      setImageUrl(getStorageImageUrl(detail.imageId));
      return;
    }

    let cancelled = false;

    async function loadAddedContext() {
      setLoadingWardrobe(true);
      setLoadingImage(true);
      try {
        const item = await clothingItemApi.getById(detail.clothingItemId!);
        if (cancelled) return;

        const resolvedImageId = detail.imageId || item.imageId;
        if (resolvedImageId) {
          try {
            const presignedUrl = await storageService.getPresignedUrl(resolvedImageId);
            if (!cancelled) setImageUrl(presignedUrl);
          } catch {
            if (!cancelled) setImageUrl(getStorageImageUrl(resolvedImageId));
          }
        } else if (!cancelled) {
          setImageUrl(null);
        }

        if (!item.zoneId) {
          if (!cancelled) setWardrobeContext({});
          return;
        }

        const zone = await wardrobeZoneApi.getById(item.zoneId);
        if (cancelled) return;

        let wardrobeName: string | undefined;
        if (zone.wardrobeId) {
          const wardrobe = await wardrobeApi.getById(zone.wardrobeId);
          wardrobeName = wardrobe.wardrobeName;
        }

        if (!cancelled) {
          setWardrobeContext({
            zoneName: zone.zoneName,
            wardrobeName,
          });
        }
      } catch {
        if (!cancelled) {
          setWardrobeContext({});
          setImageUrl(getStorageImageUrl(detail.imageId));
        }
      } finally {
        if (!cancelled) {
          setLoadingWardrobe(false);
          setLoadingImage(false);
        }
      }
    }

    void loadAddedContext();
    return () => {
      cancelled = true;
    };
  }, [detail.clothingItemId, detail.imageId, isAdded]);

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
          width: isAdded ? "min(900px, 100%)" : "min(520px, 100%)",
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
              Chi tiết nhận diện #{detail.id}
            </h3>
            <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: "0.82rem" }}>
              {isAdded
                ? "Thông tin đầy đủ về kết quả nhận diện và tủ đồ"
                : "Thông tin kết quả nhận diện chưa lưu vào tủ đồ"}
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

        {isAdded ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(260px, 1fr) minmax(300px, 1.2fr)",
              gap: 24,
              padding: 24,
            }}
          >
            <div
              style={{
                borderRadius: 12,
                border: "1px solid #E2E8F0",
                background: "#F8FAFC",
                minHeight: 280,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {loadingImage ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748B", fontSize: "0.85rem" }}>
                  <LoaderCircle size={18} style={{ animation: "spin 1s linear infinite" }} />
                  Đang tải ảnh...
                </div>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt={detail.itemName || "Ảnh nhận diện"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ color: "#94A3B8", fontSize: "0.85rem" }}>Không có ảnh</span>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <section>
                <h4 style={{ margin: "0 0 10px", fontSize: "0.82rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                  Người thực hiện
                </h4>
                <div style={{ display: "grid", gap: 6, fontSize: "0.88rem", color: "#334155" }}>
                  <div><strong>Tên:</strong> {getUserName(detail.userId, userMap)}</div>
                  <div><strong>Email:</strong> {user?.email || "—"}</div>
                </div>
              </section>

              <section>
                <h4 style={{ margin: "0 0 10px", fontSize: "0.82rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                  Nhận diện AI
                </h4>
                <div style={{ display: "grid", gap: 6, fontSize: "0.88rem", color: "#334155" }}>
                  <div><strong>Danh mục:</strong> {translateCategory(detail.className || detail.category)}</div>
                  <div><strong>Độ tin cậy:</strong> {detail.confidence}%</div>
                  <div><strong>Màu:</strong> {parseColorLabel(detail.dominantColor)}</div>
                  <div><strong>Phong cách:</strong> {parseStyleLabel(detail.style)}</div>
                  <div><strong>Giới tính:</strong> {detail.gender ? translateGender(detail.gender) : "—"}</div>
                  <div><strong>Ngày giờ nhận diện:</strong> {formatDate(detail.createdAt)}</div>
                </div>
              </section>

              <section>
                <h4 style={{ margin: "0 0 10px", fontSize: "0.82rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                  Tủ đồ
                </h4>
                {loadingWardrobe ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748B", fontSize: "0.85rem" }}>
                    <LoaderCircle size={16} style={{ animation: "spin 1s linear infinite" }} />
                    Đang tải thông tin tủ đồ...
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 6, fontSize: "0.88rem", color: "#334155" }}>
                    <div><strong>Tên đồ:</strong> {detail.itemName || "—"}</div>
                    <div><strong>Tủ:</strong> {wardrobeContext.wardrobeName || "—"}</div>
                    <div><strong>Khu vực:</strong> {wardrobeContext.zoneName || "—"}</div>
                    <div><strong>Ngày thêm tủ:</strong> {formatDate(detail.addedAt)}</div>
                  </div>
                )}
              </section>
            </div>
          </div>
        ) : (
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            <section>
              <h4 style={{ margin: "0 0 10px", fontSize: "0.82rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                Người thực hiện
              </h4>
              <div style={{ fontSize: "0.88rem", color: "#334155" }}>
                <strong>Tên:</strong> {getUserName(detail.userId, userMap)}
              </div>
            </section>

            <section>
              <h4 style={{ margin: "0 0 10px", fontSize: "0.82rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                Nhận diện AI
              </h4>
              <div style={{ display: "grid", gap: 6, fontSize: "0.88rem", color: "#334155" }}>
                <div><strong>Danh mục:</strong> {translateCategory(detail.className || detail.category)}</div>
                <div><strong>Độ tin cậy:</strong> {detail.confidence}%</div>
                <div><strong>Màu:</strong> {parseColorLabel(detail.dominantColor)}</div>
                <div><strong>Phong cách:</strong> {parseStyleLabel(detail.style)}</div>
                <div><strong>Giới tính:</strong> {detail.gender ? translateGender(detail.gender) : "—"}</div>
                <div><strong>Ngày giờ nhận diện:</strong> {formatDate(detail.createdAt)}</div>
              </div>
            </section>

            <span
              style={{
                display: "inline-flex",
                alignSelf: "flex-start",
                padding: "6px 12px",
                borderRadius: 999,
                background: "#FEF3C7",
                color: "#B45309",
                fontWeight: 700,
                fontSize: "0.8rem",
              }}
            >
              Chưa thêm vào tủ đồ
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

type ConfirmAction =
  | { type: "hard_delete"; item: DetectionHistoryItem }
  | { type: "toggle_status"; item: DetectionHistoryItem };

function ConfirmActionModal({
  action,
  userMap,
  loading,
  onConfirm,
  onCancel,
}: {
  action: ConfirmAction;
  userMap: Map<string, UserManagementResponse>;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { item } = action;
  const isInactive = item.recordStatus === "INACTIVE";

  const config =
    action.type === "hard_delete"
      ? {
          title: "Xác nhận xóa",
          message:
            "Bạn có chắc chắn muốn xóa bản ghi nhận diện này không? Bản ghi sẽ bị xóa vĩnh viễn khỏi lịch sử và không thể khôi phục.",
          confirmLabel: "Xác nhận xóa",
          confirmColor: "#B42318",
          confirmBg: "#FEF3F2",
          confirmBorder: "#FECDCA",
          iconColor: "#B42318",
          iconBg: "#FEF3F2",
        }
      : isInactive
        ? {
            title: "Kích hoạt lại",
            message:
              "Kích hoạt lại bản ghi này? Đếm ngược 7 ngày xóa sẽ được hủy và bản ghi tiếp tục hiển thị ở trạng thái hoạt động.",
            confirmLabel: "Kích hoạt lại",
            confirmColor: "#027A48",
            confirmBg: "#ECFDF3",
            confirmBorder: "#ABEFC6",
            iconColor: "#027A48",
            iconBg: "#ECFDF3",
          }
        : {
            title: "Chuyển trạng thái",
            message:
              "Chuyển bản ghi sang ngừng hoạt động? Bản ghi sẽ tự động xóa sau 7 ngày nếu không kích hoạt lại.",
            confirmLabel: "Ngừng hoạt động",
            confirmColor: "#B54708",
            confirmBg: "#FFFAEB",
            confirmBorder: "#FEDF89",
            iconColor: "#B54708",
            iconBg: "#FFFAEB",
          };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
        padding: 24,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          width: "min(460px, 100%)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ padding: "24px 24px 0" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: config.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={22} color={config.iconColor} />
            </div>
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  color: "#0F172A",
                }}
              >
                {config.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  color: "#64748B",
                  fontSize: "0.88rem",
                  lineHeight: 1.55,
                }}
              >
                {config.message}
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              borderRadius: 10,
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              fontSize: "0.82rem",
              color: "#475467",
              display: "grid",
              gap: 4,
            }}
          >
            {action.type === "hard_delete" ? (
              <div>
                <strong>Loại:</strong> Chưa thêm vào tủ đồ
              </div>
            ) : (
              <div>
                <strong>Loại:</strong> Đã thêm vào tủ đồ
              </div>
            )}
            <div>
              <strong>User:</strong> {getUserName(item.userId, userMap)}
            </div>
            <div>
              <strong>Danh mục:</strong>{" "}
              {translateCategory(item.className || item.category)}
            </div>
            <div>
              <strong>Ngày nhận diện:</strong> {formatDate(item.createdAt)}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            padding: "20px 24px 24px",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid #E2E8F0",
              background: "white",
              color: "#475467",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: `1px solid ${config.confirmBorder}`,
              background: config.confirmBg,
              color: config.confirmColor,
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {loading && (
              <LoaderCircle size={14} style={{ animation: "spin 1s linear infinite" }} />
            )}
            {config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AIRequestsLog() {
  const [activeTab, setActiveTab] = useState<DetectionHistoryTab>("not_added");
  const [sort, setSort] = useState<DetectionHistorySort>("newest");
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<DetectionHistoryItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [notAddedCount, setNotAddedCount] = useState(0);
  const [addedCount, setAddedCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  const [detailItem, setDetailItem] = useState<DetectionHistoryDetail | null>(null);
  const [detailVariant, setDetailVariant] = useState<"not_added" | "added">("not_added");
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

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

      const result = await getDetectionHistory({
        tab: activeTab,
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
      setNotAddedCount(result.notAddedCount ?? 0);
      setAddedCount(result.addedCount ?? 0);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Không thể tải lịch sử nhận diện AI";
      setError(message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, sort]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    void loadHistory(0);
    setPage(0);
  }, [activeTab, sort, loadHistory]);

  async function handlePin(item: DetectionHistoryItem) {
    try {
      setActionId(item.id);
      setError(null);
      const result = await toggleDetectionPin(item.id);
      setItems((current) =>
        current.map((row) =>
          row.id === item.id ? { ...row, isPinned: result.data.isPinned } : row,
        ),
      );
      setSuccessMessage(result.data.isPinned ? "Đã ghim bản ghi" : "Đã bỏ ghim bản ghi");
      window.setTimeout(() => setSuccessMessage(null), 2500);
      await loadHistory(page);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Không thể cập nhật ghim",
      );
    } finally {
      setActionId(null);
    }
  }

  async function executeHardDelete(item: DetectionHistoryItem) {
    try {
      setActionId(item.id);
      setConfirmLoading(true);
      setError(null);
      const result = await hardDeleteDetection(item.id);
      setConfirmAction(null);
      setSuccessMessage(result.message || "Đã xóa bản ghi");
      window.setTimeout(() => setSuccessMessage(null), 2500);
      await loadHistory(page);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Không thể xóa bản ghi",
      );
    } finally {
      setActionId(null);
      setConfirmLoading(false);
    }
  }

  async function executeToggleStatus(item: DetectionHistoryItem) {
    try {
      setActionId(item.id);
      setConfirmLoading(true);
      setError(null);
      const result = await toggleDetectionStatus(item.id);
      setConfirmAction(null);
      setSuccessMessage(result.message);
      window.setTimeout(() => setSuccessMessage(null), 3000);
      await loadHistory(page);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Không thể chuyển trạng thái",
      );
    } finally {
      setActionId(null);
      setConfirmLoading(false);
    }
  }

  async function handleConfirmAction() {
    if (!confirmAction) return;

    if (confirmAction.type === "hard_delete") {
      await executeHardDelete(confirmAction.item);
      return;
    }

    await executeToggleStatus(confirmAction.item);
  }

  async function handleViewDetail(item: DetectionHistoryItem, variant: "not_added" | "added") {
    try {
      setDetailLoading(true);
      const detail = await getDetectionHistoryDetail(item.id);
      setDetailVariant(variant);
      setDetailItem(detail);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Không thể tải chi tiết",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  const tabButtonStyle = useMemo(
    () =>
      (tab: DetectionHistoryTab): React.CSSProperties => ({
        padding: "10px 16px",
        borderRadius: 10,
        border: "1px solid",
        borderColor: activeTab === tab ? "#FDBA74" : "#E2E8F0",
        background: activeTab === tab ? "#FFF7ED" : "white",
        color: activeTab === tab ? "#C2410C" : "#64748B",
        fontWeight: 700,
        fontSize: "0.84rem",
        cursor: "pointer",
      }),
    [activeTab],
  );

  const sortButtonStyle = useMemo(
    () =>
      (value: DetectionHistorySort): React.CSSProperties => ({
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>
          Lịch Sử Nhận Diện AI
        </h2>
        <p style={{ color: "#64748B", fontSize: "0.85rem", margin: 0 }}>
          Theo dõi kết quả nhận diện và hành vi thêm vào tủ đồ
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
        <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", border: "1px solid #E2E8F0" }}>
          <div style={{ color: "#64748B", fontSize: "0.78rem", fontWeight: 600 }}>Chưa thêm tủ</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0F172A", marginTop: 4 }}>{notAddedCount}</div>
        </div>
        <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", border: "1px solid #E2E8F0" }}>
          <div style={{ color: "#64748B", fontSize: "0.78rem", fontWeight: 600 }}>Đã thêm tủ</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0F172A", marginTop: 4 }}>{addedCount}</div>
        </div>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: 10, background: "#FEF3F2", color: "#B42318", border: "1px solid #FECDCA" }}>
          {error}
        </div>
      )}

      {successMessage && (
        <div style={{ padding: "12px 16px", borderRadius: 10, background: "#ECFDF3", color: "#027A48", border: "1px solid #ABEFC6" }}>
          {successMessage}
        </div>
      )}

      <div style={{ background: "white", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2E8F0", display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" style={tabButtonStyle("not_added")} onClick={() => setActiveTab("not_added")}>
              Chưa thêm tủ ({notAddedCount})
            </button>
            <button type="button" style={tabButtonStyle("added")} onClick={() => setActiveTab("added")}>
              Đã thêm tủ ({addedCount})
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
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                <th style={tableHeaderStyle}>#</th>
                <th style={tableHeaderStyle}>Ghim</th>
                <th style={tableHeaderStyle}>User</th>
                <th style={tableHeaderStyle}>Danh mục</th>
                {activeTab === "added" && <th style={tableHeaderStyle}>Tên đồ đã lưu</th>}
                <th style={tableHeaderStyle}>Độ tin cậy</th>
                <th style={tableHeaderStyle}>Ngày giờ nhận diện</th>
                {activeTab === "added" && <th style={tableHeaderStyle}>Trạng thái</th>}
                <th style={tableHeaderStyle}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={activeTab === "added" ? 9 : 7} style={{ ...tableCellStyle, textAlign: "center", padding: 40 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#64748B" }}>
                      <LoaderCircle size={18} style={{ animation: "spin 1s linear infinite" }} />
                      Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === "added" ? 9 : 7} style={{ ...tableCellStyle, textAlign: "center", padding: 40, color: "#94A3B8" }}>
                    Không có bản ghi nào
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const isActing = actionId === item.id;
                  const isInactive = item.recordStatus === "INACTIVE";

                  return (
                    <tr
                      key={item.id}
                      style={{
                        background: item.isPinned ? "#FFFBEB" : isInactive ? "#FFF8F8" : "white",
                      }}
                    >
                      <td style={tableCellStyle}>{page * PAGE_SIZE + index + 1}</td>
                      <td style={tableCellStyle}>
                        {item.isPinned ? (
                          <Pin size={16} color="#EA580C" fill="#EA580C" />
                        ) : (
                          <span style={{ color: "#CBD5E1" }}>—</span>
                        )}
                      </td>
                      <td style={{ ...tableCellStyle, fontWeight: 600 }}>{getUserName(item.userId, userMap)}</td>
                      <td style={tableCellStyle}>{translateCategory(item.className || item.category)}</td>
                      {activeTab === "added" && (
                        <td style={tableCellStyle}>{item.itemName || "—"}</td>
                      )}
                      <td style={tableCellStyle}>{item.confidence}%</td>
                      <td style={tableCellStyle}>{formatDate(item.createdAt)}</td>
                      {activeTab === "added" && (
                        <td style={tableCellStyle}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignSelf: "flex-start",
                                padding: "4px 10px",
                                borderRadius: 999,
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                ...getRecordStatusStyle(item.recordStatus),
                              }}
                            >
                              {getRecordStatusLabel(item.recordStatus)}
                            </span>
                            {isInactive && item.daysUntilDeletion != null && (
                              <span style={{ fontSize: "0.72rem", color: "#B42318" }}>
                                Còn {item.daysUntilDeletion} ngày trước khi xóa
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                      <td style={tableCellStyle}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button
                            type="button"
                            style={actionButtonStyle}
                            disabled={detailLoading}
                            onClick={() => void handleViewDetail(item, activeTab)}
                          >
                            <Eye size={14} />
                            Chi tiết
                          </button>
                          <button
                            type="button"
                            style={actionButtonStyle}
                            disabled={isActing}
                            onClick={() => void handlePin(item)}
                          >
                            {item.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                            {item.isPinned ? "Bỏ ghim" : "Ghim"}
                          </button>
                          {activeTab === "not_added" ? (
                            <button
                              type="button"
                              style={{ ...actionButtonStyle, color: "#B42318", borderColor: "#FECDCA" }}
                              disabled={isActing}
                              onClick={() => setConfirmAction({ type: "hard_delete", item })}
                            >
                              <Trash2 size={14} />
                              Xóa
                            </button>
                          ) : (
                            <button
                              type="button"
                              style={{
                                ...actionButtonStyle,
                                color: isInactive ? "#027A48" : "#B54708",
                                borderColor: isInactive ? "#ABEFC6" : "#FEDF89",
                              }}
                              disabled={isActing}
                              onClick={() => setConfirmAction({ type: "toggle_status", item })}
                            >
                              {isInactive ? <CheckCircle size={14} /> : <Ban size={14} />}
                              {isInactive ? "Kích hoạt lại" : "Ngừng hoạt động"}
                            </button>
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

        <div style={{ padding: "14px 20px", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#64748B", fontSize: "0.82rem" }}>
            Trang {totalPages === 0 ? 0 : page + 1} / {totalPages} · {totalItems} bản ghi
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              disabled={!hasPrevious || loading}
              onClick={() => void loadHistory(page - 1)}
              style={{ ...paginationButtonStyle, opacity: !hasPrevious || loading ? 0.5 : 1, cursor: !hasPrevious || loading ? "not-allowed" : "pointer" }}
            >
              <ChevronLeft size={16} />
              Trước
            </button>
            <button
              type="button"
              disabled={!hasNext || loading}
              onClick={() => void loadHistory(page + 1)}
              style={{ ...paginationButtonStyle, opacity: !hasNext || loading ? 0.5 : 1, cursor: !hasNext || loading ? "not-allowed" : "pointer" }}
            >
              Sau
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {detailItem && (
        <DetectionDetailModal
          detail={detailItem}
          userMap={userMap}
          variant={detailVariant}
          onClose={() => setDetailItem(null)}
        />
      )}

      {confirmAction && (
        <ConfirmActionModal
          action={confirmAction}
          userMap={userMap}
          loading={confirmLoading}
          onConfirm={() => void handleConfirmAction()}
          onCancel={() => {
            if (!confirmLoading) setConfirmAction(null);
          }}
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
