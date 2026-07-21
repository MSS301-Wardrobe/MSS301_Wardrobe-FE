import { useEffect, useState } from "react";
import { useAI } from "../../../hooks/useAI";
import { Cpu, TrendingUp, CheckCircle2, Clock, Loader2, Shirt, ChevronLeft, ChevronRight } from "lucide-react";
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Line, Legend
} from "recharts";
import { getStorageImageUrl } from "../../../services/adminDetectionService";
import { translateCategory } from "../../../utils/aiMappings";
import type { AIAnalyticsGranularity } from "../../../services/aiService";

type ActivityPoint = {
  label: string;
  detections: number;
  accuracy: number;
};

function formatDetectionTime(value?: string | null): string {
  if (!value) return "—";
  const normalized =
    value.endsWith("Z") || value.includes("+") ? value : `${value}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

function periodLabel(granularity: AIAnalyticsGranularity): string {
  if (granularity === "day") return "hôm nay";
  if (granularity === "month") return "tháng này";
  return "7 ngày qua";
}

function activityChartTitle(granularity: AIAnalyticsGranularity): string {
  if (granularity === "day") return "Lượng Nhận Diện Hôm Nay";
  if (granularity === "month") return "Lượng Nhận Diện Trong Tháng";
  return "Lượng Nhận Diện 7 Ngày Qua";
}

function activityChartSubtitle(granularity: AIAnalyticsGranularity): string {
  if (granularity === "day") return "Số lần nhận diện và độ chính xác theo từng giờ hôm nay";
  if (granularity === "month") return "Số lần nhận diện và độ chính xác theo từng ngày trong tháng";
  return "Số lần nhận diện và độ chính xác trong 7 ngày qua";
}

function formatProcessingTime(seconds?: number | null): string {
  if (seconds == null || Number.isNaN(seconds)) return "—";
  if (seconds < 1) return `~${Math.round(seconds * 1000)}ms`;
  return `~${seconds}s`;
}

type RecentDetectionItem = {
  id: number;
  item: string;
  category: string;
  confidence: number;
  time: string;
  status: string;
  imageId?: string | null;
};

const RECENT_PAGE_SIZE = 5;

export function AIAnalysisDashboard() {
  const { getAnalytics } = useAI();
  const [granularity, setGranularity] = useState<AIAnalyticsGranularity>("week");
  const [loading, setLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(false);
  const [statsData, setStatsData] = useState<any>(null);
  const [dailyData, setDailyData] = useState<ActivityPoint[]>([]);
  const [categoryAccuracy, setCategoryAccuracy] = useState<any[]>([]);
  const [recentDetections, setRecentDetections] = useState<RecentDetectionItem[]>([]);
  const [recentPage, setRecentPage] = useState(0);
  const [recentTotalPages, setRecentTotalPages] = useState(0);
  const [recentTotalItems, setRecentTotalItems] = useState(0);
  const [recentHasNext, setRecentHasNext] = useState(false);
  const [recentHasPrevious, setRecentHasPrevious] = useState(false);

  const granularityOptions: { id: AIAnalyticsGranularity; label: string }[] = [
    { id: "day", label: "Ngày" },
    { id: "week", label: "Tuần" },
    { id: "month", label: "Tháng" },
  ];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [st, da, ca, re] = await Promise.all([
          getAnalytics("stats", granularity),
          getAnalytics("daily", granularity),
          getAnalytics("categories", granularity),
          getAnalytics("recent", granularity, { page: 0, size: RECENT_PAGE_SIZE }),
        ]);
        setStatsData(st);
        setDailyData(da);
        setCategoryAccuracy(ca);
        setRecentDetections(re?.items ?? []);
        setRecentPage(0);
        setRecentTotalPages(re?.totalPages ?? 0);
        setRecentTotalItems(re?.totalItems ?? 0);
        setRecentHasNext(re?.hasNext ?? false);
        setRecentHasPrevious(re?.hasPrevious ?? false);
      } catch (err) {
        console.error("Failed to load AI analytics", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [granularity]);

  async function loadRecentPage(targetPage: number) {
    try {
      setRecentLoading(true);
      const re = await getAnalytics("recent", granularity, {
        page: targetPage,
        size: RECENT_PAGE_SIZE,
      });
      setRecentDetections(re?.items ?? []);
      setRecentPage(re?.page ?? targetPage);
      setRecentTotalPages(re?.totalPages ?? 0);
      setRecentTotalItems(re?.totalItems ?? 0);
      setRecentHasNext(re?.hasNext ?? false);
      setRecentHasPrevious(re?.hasPrevious ?? false);
    } catch (err) {
      console.error("Failed to load recent detections", err);
    } finally {
      setRecentLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
        <Loader2 className="animate-spin" size={40} color="#EA580C" style={{ animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  const stats = [
    { label: "Tổng Nhận Diện", value: statsData?.total || 0, change: periodLabel(granularity), icon: Cpu, color: "#EA580C", bg: "#FFEDD5" },
    { label: "Độ Tin Cậy TB", value: `${statsData?.avg_confidence || 0}%`, change: "Của bạn", icon: TrendingUp, color: "#10B981", bg: "#ECFDF5" },
    { label: "Độ Chính Xác Cao (>90%)", value: statsData?.high_accuracy || 0, change: periodLabel(granularity), icon: CheckCircle2, color: "#F97316", bg: "#F5F3FF" },
    { label: "Thời Gian Xử Lý", value: formatProcessingTime(statsData?.avg_processing_time_sec), change: "TB mỗi ảnh", icon: Clock, color: "#F59E0B", bg: "#FFFBEB" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {granularityOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setGranularity(option.id)}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              border: "1px solid",
              borderColor: granularity === option.id ? "#F97316" : "#E2E8F0",
              background: granularity === option.id ? "#F97316" : "#FFFFFF",
              color: granularity === option.id ? "#FFFFFF" : "#64748B",
              fontWeight: 700,
              fontSize: "0.84rem",
              cursor: "pointer",
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "white", borderRadius: 16, padding: "20px 22px", border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 500 }}>{s.label}</p>
                <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0F172A", marginTop: 4 }}>{s.value}</p>
                <p style={{ fontSize: "0.72rem", color: s.color, marginTop: 4 }}>{s.change}</p>
              </div>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.icon size={20} color={s.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4, fontSize: "1rem" }}>{activityChartTitle(granularity)}</h3>
        <p style={{ fontSize: "0.78rem", color: "#64748B", marginBottom: 16 }}>{activityChartSubtitle(granularity)}</p>
        <ResponsiveContainer width="100%" height={260}>
          {dailyData.length > 0 ? (
            <ComposedChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} interval={granularity === "day" ? 2 : 0} />
              <YAxis yAxisId="left" allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: "0.8rem" }} />
              <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
              <Bar yAxisId="left" dataKey="detections" fill="#EA580C" radius={[4, 4, 0, 0]} name="Nhận Diện" barSize={granularity === "day" ? 12 : 24} />
              <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#10B981" strokeWidth={2} dot={{ fill: "#10B981", r: 3 }} name="Độ Chính Xác %" />
            </ComposedChart>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#94A3B8", fontSize: "0.85rem" }}>Chưa có dữ liệu</div>
          )}
        </ResponsiveContainer>
      </div>

      {/* Category accuracy */}
      <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4, fontSize: "1rem" }}>Phân Loại Theo Danh Mục</h3>
        <p style={{ fontSize: "0.78rem", color: "#64748B", marginBottom: 20 }}>
          Số lần nhận diện và độ chính xác theo danh mục ({periodLabel(granularity)})
        </p>
        
        {categoryAccuracy.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {categoryAccuracy.map((cat) => (
              <div key={cat.category} style={{ background: "#F8FAFC", borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <p style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.9rem" }}>{translateCategory(cat.category)}</p>
                    <p style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 2 }}>{cat.detections} lần nhận diện</p>
                  </div>
                  <span style={{
                    background: cat.accuracy >= 96 ? "#ECFDF5" : cat.accuracy >= 90 ? "#FFEDD5" : "#FFFBEB",
                    color: cat.accuracy >= 96 ? "#10B981" : cat.accuracy >= 90 ? "#EA580C" : "#F59E0B",
                    borderRadius: 8, padding: "4px 10px", fontSize: "0.78rem", fontWeight: 700,
                  }}>
                    {cat.accuracy}%
                  </span>
                </div>
                <div style={{ background: "#E2E8F0", borderRadius: 100, height: 6 }}>
                  <div style={{
                    width: `${cat.accuracy}%`, height: "100%", borderRadius: 100,
                    background: cat.accuracy >= 96 ? "#10B981" : cat.accuracy >= 90 ? "#EA580C" : "#F59E0B",
                    transition: "width 0.5s",
                  }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", color: "#94A3B8", fontSize: "0.85rem", padding: "20px 0" }}>Chưa có dữ liệu danh mục</div>
        )}
      </div>

      {/* Recent detections table */}
      <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4, fontSize: "1rem" }}>Nhận Diện Gần Đây</h3>
        <p style={{ fontSize: "0.78rem", color: "#64748B", marginBottom: 16 }}>
          Kết quả phân loại AI mới nhất ({periodLabel(granularity)})
        </p>
        
        {recentDetections.length > 0 || recentLoading ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                  {["#", "Danh Mục", "Độ Tin Cậy", "Thời Gian", "Trạng Thái"].map((h) => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentLoading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#64748B" }}>
                      <Loader2 size={18} style={{ animation: "spin 1s linear infinite", display: "inline-block" }} />
                    </td>
                  </tr>
                ) : (
                recentDetections.map((det, index) => {
                  const imageUrl = getStorageImageUrl(det.imageId);
                  const formattedTime = formatDetectionTime(det.time);

                  return (
                    <tr key={det.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "12px", fontSize: "0.82rem", color: "#94A3B8" }}>
                        {recentPage * RECENT_PAGE_SIZE + index + 1}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {imageUrl ? (
                            <img src={imageUrl} alt={det.item} style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Shirt size={16} color="#94A3B8" />
                            </div>
                          )}
                          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0F172A" }}>
                            {translateCategory(det.item || det.category)}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ background: "#F1F5F9", borderRadius: 100, height: 5, width: 64 }}>
                            <div style={{ width: `${det.confidence}%`, background: det.confidence >= 90 ? "#10B981" : "#F59E0B", borderRadius: 100, height: "100%" }} />
                          </div>
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: det.confidence >= 90 ? "#10B981" : "#F59E0B" }}>{det.confidence}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ fontSize: "0.82rem", color: "#94A3B8" }}>{formattedTime}</span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span style={{
                          background: det.status === "success" ? "#ECFDF5" : "#FFFBEB",
                          color: det.status === "success" ? "#10B981" : "#F59E0B",
                          borderRadius: 6, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 700, textTransform: "capitalize",
                        }}>
                          {det.status === "success" ? "✓ Xác Nhận" : "⚠ Xem Xét"}
                        </span>
                      </td>
                    </tr>
                  )
                })
                )}
              </tbody>
            </table>

            <div style={{ paddingTop: 16, borderTop: "1px solid #E2E8F0", marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <span style={{ color: "#64748B", fontSize: "0.82rem" }}>
                Trang {recentTotalPages === 0 ? 0 : recentPage + 1} / {recentTotalPages} · {recentTotalItems} bản ghi
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  disabled={!recentHasPrevious || recentLoading}
                  onClick={() => void loadRecentPage(recentPage - 1)}
                  style={{
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
                    cursor: !recentHasPrevious || recentLoading ? "not-allowed" : "pointer",
                    opacity: !recentHasPrevious || recentLoading ? 0.5 : 1,
                  }}
                >
                  <ChevronLeft size={16} />
                  Trước
                </button>
                <button
                  type="button"
                  disabled={!recentHasNext || recentLoading}
                  onClick={() => void loadRecentPage(recentPage + 1)}
                  style={{
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
                    cursor: !recentHasNext || recentLoading ? "not-allowed" : "pointer",
                    opacity: !recentHasNext || recentLoading ? 0.5 : 1,
                  }}
                >
                  Sau
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", color: "#94A3B8", fontSize: "0.85rem", padding: "20px 0" }}>Chưa có lượt nhận diện nào</div>
        )}
      </div>
    </div>
  );
}
