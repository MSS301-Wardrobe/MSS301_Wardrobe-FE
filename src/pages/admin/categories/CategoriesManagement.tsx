import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { categoryApi } from "../../../services/wardrobeService";
import { getAdminUsers } from "../../../services/adminUserService";
import type {
  CategoryAnalyticsItem,
  CategoryAnalyticsResponse,
  CategoryUsersResponse,
} from "../../../types/wardrobe";
import type { UserManagementResponse } from "../../../types/admin";
import { SUPPORTED_CATEGORY_NAMES_VI } from "../../../utils/aiMappings";
import { BarChart2, Package, FolderTree, TrendingUp, Users, X, Loader2, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";

// ─── Palette — 13 màu phân biệt, thứ tự khớp DB ─────────────────────────────
const COLORS = [
  "#F97316", "#FB923C", "#FBBF24", "#34D399", "#10B981",
  "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899",
  "#F43F5E", "#A78BFA", "#64748B",
];

// ─── Màu cố định theo thứ tự 13 danh mục AI ─────────────────────────────────
function colorForCategory(name: string): string {
  const idx = SUPPORTED_CATEGORY_NAMES_VI.indexOf(name);
  return COLORS[idx >= 0 ? idx : 0];
}

type CategoryWithColor = CategoryAnalyticsItem & { color: string };

type Granularity = "day" | "month" | "year";

const BAR_ROW_HEIGHT = 38;
const BAR_CHART_PADDING = 48;
const MODAL_PAGE_SIZE = 10;

/** Gộp dữ liệu API về đúng 13 danh mục AI, tránh trùng tên từ DB */
function buildCanonicalCategories(
  categories: CategoryAnalyticsItem[]
): CategoryWithColor[] {
  const countMap = new Map<string, number>();
  for (const cat of categories) {
    countMap.set(cat.categoryName, (countMap.get(cat.categoryName) ?? 0) + cat.count);
  }

  const total = Array.from(countMap.values()).reduce((sum, n) => sum + n, 0);

  return SUPPORTED_CATEGORY_NAMES_VI.map((name) => {
    const count = countMap.get(name) ?? 0;
    const percentage = total > 0 ? Math.round((count * 10000) / total) / 100 : 0;
    return {
      categoryId: name,
      categoryName: name,
      count,
      percentage,
      color: colorForCategory(name),
    };
  });
}

// ─── Helper: chuyển giá trị input → date string YYYY-MM-DD cho API ─────────
function toApiDate(granularity: Granularity, inputVal: string): string {
  if (!inputVal) return new Date().toISOString().slice(0, 10);
  if (granularity === "day") return inputVal;               // YYYY-MM-DD
  if (granularity === "month") return `${inputVal}-01`;     // YYYY-MM → YYYY-MM-01
  return `${inputVal}-01-01`;                               // YYYY → YYYY-01-01
}

// ─── Helper: giá trị mặc định cho input theo granularity ────────────────────
function defaultInput(granularity: Granularity): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  if (granularity === "day") return `${yyyy}-${mm}-${dd}`;
  if (granularity === "month") return `${yyyy}-${mm}`;
  return String(yyyy);
}

// ─── Năm có thể chọn ─────────────────────────────────────────────────────────
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) =>
  String(new Date().getFullYear() - i)
);

// ─── Helper: nhãn khoảng thời gian ───────────────────────────────────────────
function formatPeriodLabel(granularity: Granularity, inputVal: string): string {
  if (granularity === "day") return `Ngày ${inputVal}`;
  if (granularity === "month") {
    const [yyyy, mm] = inputVal.split("-");
    return `Tháng ${mm}/${yyyy}`;
  }
  return `Năm ${inputVal}`;
}

function formatDateTime(value?: string | null): string {
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

function formatAddedAt(first?: string, last?: string, count = 1): string {
  if (!first && !last) return "—";
  const firstLabel = formatDateTime(first);
  const lastLabel = formatDateTime(last);
  if (count <= 1 || firstLabel === lastLabel) return lastLabel;
  return `${firstLabel} – ${lastLabel}`;
}

// ─── Custom Tooltip cho Bar chart ────────────────────────────────────────────
function BarTooltip({ active, payload }: { active?: boolean; payload?: { payload: CategoryAnalyticsItem }[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", fontSize: "0.82rem", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}>
      <p style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>{item.categoryName}</p>
      <p style={{ color: "#64748B" }}>Số lượng: <strong style={{ color: "#F97316" }}>{item.count.toLocaleString()}</strong></p>
      <p style={{ color: "#64748B" }}>Tỷ lệ: <strong style={{ color: "#3B82F6" }}>{item.percentage}%</strong></p>
    </div>
  );
}

// ─── Custom Tooltip cho Pie chart ────────────────────────────────────────────
function PieTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: CategoryAnalyticsItem }[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", fontSize: "0.82rem", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}>
      <p style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>{item.categoryName}</p>
      <p style={{ color: "#64748B" }}>Số lượng: <strong style={{ color: "#F97316" }}>{item.count.toLocaleString()}</strong></p>
      <p style={{ color: "#64748B" }}>Tỷ lệ: <strong style={{ color: "#3B82F6" }}>{item.percentage}%</strong></p>
    </div>
  );
}

// ─── Component chính ─────────────────────────────────────────────────────────
export function CategoriesManagement() {
  const [granularity, setGranularity] = useState<Granularity>("month");
  const [inputVal, setInputVal] = useState<string>(defaultInput("month"));
  const [analytics, setAnalytics] = useState<CategoryAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userMap, setUserMap] = useState<Map<string, UserManagementResponse>>(new Map());

  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [usersModalLoading, setUsersModalLoading] = useState(false);
  const [usersModalError, setUsersModalError] = useState<string | null>(null);
  const [usersModalData, setUsersModalData] = useState<CategoryUsersResponse | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);

  useEffect(() => {
    getAdminUsers({ page: 0, size: 500, sort: "createdAt,desc" })
      .then((res) => {
        const map = new Map<string, UserManagementResponse>();
        for (const user of res.items ?? []) {
          map.set(user.userId, user);
        }
        setUserMap(map);
      })
      .catch(() => {
        // Không chặn trang nếu không load được user list
      });
  }, []);

  const fetchAnalytics = useCallback(
    async (g: Granularity, val: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await categoryApi.getAnalytics(g, toApiDate(g, val));
        setAnalytics(result);
      } catch {
        setError("Không thể tải dữ liệu thống kê. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchAnalytics(granularity, inputVal);
  }, []);  // chỉ fetch lần đầu

  const handleGranularityChange = (g: Granularity) => {
    const def = defaultInput(g);
    setGranularity(g);
    setInputVal(def);
    fetchAnalytics(g, def);
  };

  const handleDateChange = (val: string) => {
    setInputVal(val);
  };

  const handleSearch = () => {
    fetchAnalytics(granularity, inputVal);
  };

  const handleOpenUsersModal = async (categoryName: string) => {
    setSelectedCategoryName(categoryName);
    setUsersModalOpen(true);
    setUsersModalLoading(true);
    setUsersModalError(null);
    setUsersModalData(null);

    try {
      const result = await categoryApi.getUsersByCategory(
        categoryName,
        granularity,
        toApiDate(granularity, inputVal)
      );
      setUsersModalData(result);
    } catch (err: unknown) {
      let message = "Không thể tải danh sách user. Vui lòng thử lại.";
      if (axios.isAxiosError(err)) {
        const backend = err.response?.data?.message;
        if (typeof backend === "string" && backend.trim()) {
          message = backend;
        }
      } else if (err instanceof Error && err.message) {
        message = err.message;
      }
      setUsersModalError(message);
    } finally {
      setUsersModalLoading(false);
    }
  };

  const closeUsersModal = () => {
    setUsersModalOpen(false);
    setUsersModalData(null);
    setUsersModalError(null);
    setSelectedCategoryName(null);
  };

  const cats = analytics?.categories ?? [];
  const total = analytics?.totalItems ?? 0;

  // Luôn đúng 13 danh mục — thứ tự cố định cho bảng & pie legend
  const catsWithColor = buildCanonicalCategories(cats);
  // Bar chart: sắp xếp giảm dần theo count
  const barChartData = [...catsWithColor].sort((a, b) => b.count - a.count);
  const barChartHeight = barChartData.length * BAR_ROW_HEIGHT + BAR_CHART_PADDING;
  const topCat = barChartData[0];

  // Pie chỉ vẽ các lát có dữ liệu; legend luôn hiển thị đủ 13 danh mục
  const pieSlices = catsWithColor.filter((cat) => cat.count > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>
          Quản Lý Danh Mục
        </h2>
        <p style={{ color: "#64748B", fontSize: "0.85rem" }}>
          Thống kê số lượng trang phục theo 13 danh mục AI
        </p>
      </div>

      {/* ─── Bộ lọc thời gian ────────────────────────────────────────────── */}
      <div style={{ background: "white", borderRadius: 14, padding: "18px 22px", border: "1px solid #E2E8F0", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 600, color: "#475569", fontSize: "0.85rem" }}>Lọc theo:</span>

        {/* Tab chọn granularity */}
        <div style={{ display: "flex", gap: 4, background: "#F1F5F9", borderRadius: 8, padding: 3 }}>
          {(["day", "month", "year"] as Granularity[]).map((g) => (
            <button
              key={g}
              onClick={() => handleGranularityChange(g)}
              style={{
                padding: "5px 14px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.8rem",
                background: granularity === g ? "#F97316" : "transparent",
                color: granularity === g ? "#fff" : "#64748B",
                transition: "all 0.15s",
              }}
            >
              {g === "day" ? "Ngày" : g === "month" ? "Tháng" : "Năm"}
            </button>
          ))}
        </div>

        {/* Input ngày/tháng/năm */}
        {granularity === "day" && (
          <input
            type="date"
            value={inputVal}
            onChange={(e) => handleDateChange(e.target.value)}
            style={inputStyle}
          />
        )}
        {granularity === "month" && (
          <CustomMonthPicker value={inputVal} onChange={handleDateChange} />
        )}
        {granularity === "year" && (
          <select
            value={inputVal}
            onChange={(e) => handleDateChange(e.target.value)}
            style={{ ...inputStyle, paddingRight: 28 }}
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        )}

        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: "7px 18px",
            background: "#F97316",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: "0.82rem",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Đang tải..." : "Xem thống kê"}
        </button>
      </div>

      {/* ─── Lỗi ─────────────────────────────────────────────────────────── */}
      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 18px", color: "#DC2626", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {/* ─── Summary cards ───────────────────────────────────────────────── */}
      {analytics && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <SummaryCard icon={<Package size={22} color="#F97316" />} label="Tổng trang phục" value={total.toLocaleString()} bg="#FFF7ED" />
          <SummaryCard icon={<FolderTree size={22} color="#3B82F6" />} label="Số danh mục" value="13" bg="#EFF6FF" />
          <SummaryCard icon={<TrendingUp size={22} color="#10B981" />} label="Danh mục nhiều nhất" value={topCat?.categoryName ?? "—"} bg="#F0FDF4" sub={topCat ? `${topCat.count} trang phục (${topCat.percentage}%)` : ""} />
          <SummaryCard icon={<BarChart2 size={22} color="#8B5CF6" />} label="Khoảng thời gian" value={analytics.granularity === "day" ? "1 ngày" : analytics.granularity === "month" ? "1 tháng" : "1 năm"} bg="#F5F3FF" sub={analytics.from?.slice(0, 10)} />
        </div>
      )}

      {/* ─── Charts ──────────────────────────────────────────────────────── */}
      {analytics && cats.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Bar chart */}
          <div style={chartCard}>
            <h3 style={chartTitle}>Số lượng theo danh mục</h3>
            <p style={chartSub}>Sắp xếp theo số lượng giảm dần</p>
            <ResponsiveContainer width="100%" height={barChartHeight}>
              <BarChart
                layout="vertical"
                data={barChartData}
                margin={{ top: 8, right: 28, left: 4, bottom: 8 }}
                barCategoryGap="18%"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="categoryName"
                  width={142}
                  interval={0}
                  reversed
                  tick={{ fontSize: 11, fill: "#475569" }}
                  axisLine={false}
                  tickLine={false}
                />
                <ReTooltip content={<BarTooltip />} cursor={{ fill: "rgba(249,115,22,0.06)" }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={24}>
                  {barChartData.map((entry) => (
                    <Cell key={entry.categoryName} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div style={chartCard}>
            <h3 style={chartTitle}>Phân bổ tỷ lệ</h3>
            <p style={chartSub}>Phần trăm mỗi danh mục trên tổng số</p>
            {total > 0 && pieSlices.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                    <Pie
                      data={pieSlices}
                      dataKey="count"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={88}
                      paddingAngle={2}
                    >
                      {pieSlices.map((entry) => (
                        <Cell key={entry.categoryName} fill={entry.color} />
                      ))}
                    </Pie>
                    <ReTooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend tách riêng — luôn đúng 13 danh mục, không bị cắt chart */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                    gap: "6px 12px",
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: "1px solid #F1F5F9",
                  }}
                >
                  {catsWithColor.map((cat) => (
                    <div
                      key={cat.categoryName}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        opacity: cat.count > 0 ? 1 : 0.45,
                      }}
                    >
                      <span
                        style={{
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          background: cat.color,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: "0.72rem", color: "#475569", lineHeight: 1.3 }}>
                        {cat.categoryName}
                        {cat.count > 0 && (
                          <span style={{ color: "#94A3B8", marginLeft: 4 }}>
                            ({cat.percentage}%)
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyChart />
            )}
          </div>
        </div>
      )}

      {/* ─── Bảng chi tiết ───────────────────────────────────────────────── */}
      {analytics && (
        <div style={chartCard}>
          <h3 style={chartTitle}>Chi tiết theo danh mục</h3>
          <p style={chartSub}>Danh sách đầy đủ 13 danh mục AI và số lượng trang phục tương ứng</p>

          <div style={{ overflowX: "auto", marginTop: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #F1F5F9" }}>
                  <Th>#</Th>
                  <Th>Màu</Th>
                  <Th align="left">Tên danh mục</Th>
                  <Th>Số lượng</Th>
                  <Th>Tỷ lệ</Th>
                  <Th align="left">Biểu đồ</Th>
                  <Th>Thao tác</Th>
                </tr>
              </thead>
              <tbody>
                {catsWithColor.map((cat, i) => (
                  <tr key={cat.categoryName} style={{ borderBottom: "1px solid #F8FAFC" }}>
                    <Td>{i + 1}</Td>
                    <Td>
                      <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: "50%", background: cat.color }} />
                    </Td>
                    <Td align="left" style={{ fontWeight: 600, color: "#0F172A" }}>{cat.categoryName}</Td>
                    <Td>
                      <span style={{ fontWeight: 700, color: "#F97316" }}>{cat.count.toLocaleString()}</span>
                    </Td>
                    <Td>
                      <span style={{ color: "#3B82F6", fontWeight: 600 }}>{cat.percentage}%</span>
                    </Td>
                    <Td align="left">
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 160 }}>
                        <div style={{ flex: 1, height: 7, background: "#F1F5F9", borderRadius: 4, overflow: "hidden" }}>
                          <div
                            style={{
                              height: "100%",
                              width: `${total > 0 ? (cat.count / (barChartData[0]?.count || 1)) * 100 : 0}%`,
                              background: cat.color,
                              borderRadius: 4,
                              transition: "width 0.6s ease",
                            }}
                          />
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <button
                        type="button"
                        disabled={cat.count === 0}
                        onClick={() => handleOpenUsersModal(cat.categoryName)}
                        title={cat.count === 0 ? "Không có dữ liệu" : "Xem danh sách user"}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "5px 10px",
                          borderRadius: 8,
                          border: "1px solid #E2E8F0",
                          background: cat.count > 0 ? "#FFF7ED" : "#F8FAFC",
                          color: cat.count > 0 ? "#EA580C" : "#94A3B8",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: cat.count > 0 ? "pointer" : "not-allowed",
                          opacity: cat.count > 0 ? 1 : 0.6,
                        }}
                      >
                        <Users size={13} />
                        Xem user
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {cats.length === 0 && !loading && (
            <EmptyChart label="Không có dữ liệu trong khoảng thời gian đã chọn" />
          )}
        </div>
      )}

      {/* ─── Placeholder khi chưa có dữ liệu ────────────────────────────── */}
      {!analytics && !loading && !error && (
        <div style={{ background: "white", borderRadius: 16, padding: 48, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FolderTree size={26} color="#F97316" />
          </div>
          <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>Chọn bộ lọc để xem thống kê</h3>
        </div>
      )}

      {loading && !analytics && (
        <div style={{ textAlign: "center", padding: 48, color: "#94A3B8", fontSize: "0.9rem" }}>
          Đang tải dữ liệu...
        </div>
      )}

      {usersModalOpen && (
        <CategoryUsersModal
          categoryName={selectedCategoryName ?? ""}
          periodLabel={formatPeriodLabel(granularity, inputVal)}
          loading={usersModalLoading}
          error={usersModalError}
          data={usersModalData}
          userMap={userMap}
          onClose={closeUsersModal}
        />
      )}
    </div>
  );
}

// ─── Modal danh sách user theo danh mục ──────────────────────────────────────

function CategoryUsersModal({
  categoryName,
  periodLabel,
  loading,
  error,
  data,
  userMap,
  onClose,
}: {
  categoryName: string;
  periodLabel: string;
  loading: boolean;
  error: string | null;
  data: CategoryUsersResponse | null;
  userMap: Map<string, UserManagementResponse>;
  onClose: () => void;
}) {
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [data, categoryName]);

  const allUsers = data?.users ?? [];
  const totalPages = Math.ceil(allUsers.length / MODAL_PAGE_SIZE) || 1;
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const pageStart = safePage * MODAL_PAGE_SIZE;
  const pageUsers = allUsers.slice(pageStart, pageStart + MODAL_PAGE_SIZE);
  const hasPrevious = safePage > 0;
  const hasNext = safePage < totalPages - 1;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
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
          width: "100%",
          maxWidth: 760,
          maxHeight: "80vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>
              User có danh mục: {categoryName}
            </h3>
            <p style={{ fontSize: "0.8rem", color: "#64748B" }}>Khoảng thời gian: {periodLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: "none", background: "#F1F5F9", borderRadius: 8, padding: 6, cursor: "pointer", color: "#64748B" }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "16px 24px", overflowY: "auto", flex: 1 }}>
          {loading && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, padding: 40, color: "#64748B" }}>
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
              Đang tải...
            </div>
          )}

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 16px", color: "#DC2626", fontSize: "0.85rem" }}>
              {error}
            </div>
          )}

          {!loading && !error && data && data.users.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "#94A3B8", fontSize: "0.85rem" }}>
              Không có user nào có danh mục này trong khoảng thời gian đã chọn.
            </div>
          )}

          {!loading && !error && data && data.users.length > 0 && (
            <>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #F1F5F9" }}>
                    <Th>#</Th>
                    <Th align="left">Tên user</Th>
                    <Th align="left">Email</Th>
                    <Th align="left">Ngày thêm vào tủ</Th>
                    <Th>Số lượng</Th>
                  </tr>
                </thead>
                <tbody>
                  {pageUsers.map((row, index) => {
                    const user = userMap.get(row.userId);
                    const displayName = user?.fullName || user?.username || row.userId.slice(0, 8) + "…";
                    const email = user?.email ?? "—";
                    const addedLabel = formatAddedAt(row.firstAddedAt, row.lastAddedAt, row.itemCount);
                    return (
                      <tr key={row.userId} style={{ borderBottom: "1px solid #F8FAFC" }}>
                        <Td>{pageStart + index + 1}</Td>
                        <Td align="left" style={{ fontWeight: 600, color: "#0F172A" }}>{displayName}</Td>
                        <Td align="left" style={{ color: "#64748B" }}>{email}</Td>
                        <Td align="left" style={{ color: "#475569", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                          {addedLabel}
                        </Td>
                        <Td>
                          <span style={{ fontWeight: 700, color: "#F97316" }}>{row.itemCount.toLocaleString()}</span>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p style={{ marginTop: 14, fontSize: "0.78rem", color: "#94A3B8", textAlign: "right" }}>
                Tổng: {data.totalUsers} user · {data.totalItems.toLocaleString()} trang phục
              </p>
            </>
          )}
        </div>

        {!loading && !error && data && data.users.length > 0 && (
          <div
            style={{
              padding: "12px 24px",
              borderTop: "1px solid #E2E8F0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#64748B", fontSize: "0.82rem" }}>
              Trang {totalPages === 0 ? 0 : safePage + 1} / {totalPages}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                disabled={!hasPrevious}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                style={{
                  ...modalPaginationButtonStyle,
                  opacity: !hasPrevious ? 0.5 : 1,
                  cursor: !hasPrevious ? "not-allowed" : "pointer",
                }}
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                type="button"
                disabled={!hasNext}
                onClick={() => setPage((p) => p + 1)}
                style={{
                  ...modalPaginationButtonStyle,
                  opacity: !hasNext ? 0.5 : 1,
                  cursor: !hasNext ? "not-allowed" : "pointer",
                }}
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryCard({ icon, label, value, bg, sub }: { icon: React.ReactNode; label: string; value: string; bg: string; sub?: string }) {
  return (
    <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", border: "1px solid #E2E8F0", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", display: "flex", alignItems: "flex-start", gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: "0.76rem", color: "#94A3B8", fontWeight: 500, marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</p>
        {sub && <p style={{ fontSize: "0.72rem", color: "#64748B", marginTop: 1 }}>{sub}</p>}
      </div>
    </div>
  );
}

function EmptyChart({ label = "Không có trang phục nào trong khoảng thời gian này" }: { label?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "#94A3B8" }}>
      <BarChart2 size={36} color="#E2E8F0" />
      <p style={{ fontSize: "0.85rem" }}>{label}</p>
    </div>
  );
}

function Th({ children, align = "center" }: { children: React.ReactNode; align?: "left" | "center" }) {
  return (
    <th style={{ padding: "10px 12px", textAlign: align, color: "#94A3B8", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
      {children}
    </th>
  );
}

function Td({ children, align = "center", style: extraStyle }: { children: React.ReactNode; align?: "left" | "center"; style?: React.CSSProperties }) {
  return (
    <td style={{ padding: "11px 12px", textAlign: align, color: "#475569", ...extraStyle }}>
      {children}
    </td>
  );
}

// ─── Shared styles ─────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  padding: "7px 12px",
  border: "1.5px solid #E2E8F0",
  borderRadius: 8,
  fontSize: "0.85rem",
  color: "#334155",
  outline: "none",
  background: "#F8FAFC",
};

const chartCard: React.CSSProperties = {
  background: "white",
  borderRadius: 16,
  padding: "22px 24px",
  border: "1px solid #E2E8F0",
  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
};

const chartTitle: React.CSSProperties = {
  fontSize: "1rem",
  fontWeight: 700,
  color: "#0F172A",
  marginBottom: 2,
};

const chartSub: React.CSSProperties = {
  fontSize: "0.78rem",
  color: "#94A3B8",
  marginBottom: 0,
};

const modalPaginationButtonStyle: React.CSSProperties = {
  height: 36,
  padding: "0 12px",
  borderRadius: 8,
  border: "1px solid #CBD5E1",
  background: "white",
  color: "#475569",
  display: "flex",
  alignItems: "center",
  gap: 5,
  fontSize: "0.82rem",
  fontWeight: 600,
};

// ─── Custom Month Picker ──────────────────────────────────────────────────────
function CustomMonthPicker({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(() => {
    if (value) return parseInt(value.split("-")[0], 10);
    return new Date().getFullYear();
  });

  useEffect(() => {
    if (open && value) {
      setCurrentYear(parseInt(value.split("-")[0], 10));
    } else if (open && !value) {
      setCurrentYear(new Date().getFullYear());
    }
  }, [open, value]);

  const months = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
  
  const handleSelectMonth = (monthIndex: number) => {
    const mm = String(monthIndex + 1).padStart(2, "0");
    onChange(`${currentYear}-${mm}`);
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setOpen(false);
  };

  const handleThisMonth = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    onChange(`${yyyy}-${mm}`);
    setOpen(false);
  };

  let selectedYear = -1;
  let selectedMonthIndex = -1;
  if (value) {
    const parts = value.split("-");
    selectedYear = parseInt(parts[0], 10);
    selectedMonthIndex = parseInt(parts[1], 10) - 1;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          style={{
            ...inputStyle,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            minWidth: 140,
            cursor: "pointer",
          }}
        >
          <span>
            {value ? (() => {
              const [y, m] = value.split("-");
              return `${parseInt(m, 10)}/${y}`;
            })() : "Chọn tháng"}
          </span>
          <Calendar size={16} color="#64748B" />
        </button>
      </PopoverTrigger>
      <PopoverContent style={{ width: 220, padding: 12, borderRadius: 12, background: "white", zIndex: 1050 }} align="start">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <button onClick={() => setCurrentYear(y => y - 1)} style={{ background: "#F1F5F9", borderRadius: 6, border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}><ChevronLeft size={16} color="#475569" /></button>
          <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#0F172A" }}>{currentYear}</span>
          <button onClick={() => setCurrentYear(y => y + 1)} style={{ background: "#F1F5F9", borderRadius: 6, border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}><ChevronRight size={16} color="#475569" /></button>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 16 }}>
          {months.map((m, i) => {
            const isSelected = selectedYear === currentYear && selectedMonthIndex === i;
            return (
              <button
                key={m}
                onClick={() => handleSelectMonth(i)}
                style={{
                  padding: "6px 0",
                  borderRadius: 6,
                  border: "none",
                  background: isSelected ? "#3B82F6" : "transparent",
                  color: isSelected ? "white" : "#334155",
                  fontWeight: isSelected ? 600 : 400,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                {m}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #E2E8F0", paddingTop: 10 }}>
          <button onClick={handleClear} style={{ background: "transparent", border: "none", color: "#3B82F6", fontSize: "0.82rem", cursor: "pointer", fontWeight: 500, padding: "4px 8px" }}>Xóa</button>
          <button onClick={handleThisMonth} style={{ background: "transparent", border: "none", color: "#3B82F6", fontSize: "0.82rem", cursor: "pointer", fontWeight: 500, padding: "4px 8px" }}>Tháng này</button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
