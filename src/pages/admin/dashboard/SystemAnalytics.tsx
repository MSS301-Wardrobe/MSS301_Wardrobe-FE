import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import {
  Activity,
  Cpu,
  RefreshCw,
  Shirt,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  adminDashboardService,
  type AdminDashboardOverview,
  type KpiMetric,
} from "../../../services/adminDashboardService";
import type {
  HealthStatus,
  SystemHealthResponse,
} from "../../../services/systemMonitoringService";

function formatNumber(value: number): string {
  return value.toLocaleString("vi-VN");
}

function formatTrend(value: number): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

function formatWeekChange(value: number): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatNumber(value)} tuần này`;
}

function formatCheckedAt(iso?: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

function overallStatusLabel(status?: HealthStatus): string {
  switch (status) {
    case "UP":
      return "Tất Cả Hệ Thống Hoạt Động";
    case "DEGRADED":
      return "Hệ Thống Không Ổn Định";
    case "DOWN":
      return "Hệ Thống Đang Gặp Sự Cố";
    default:
      return "Đang Kiểm Tra Hệ Thống";
  }
}

function overallStatusColor(status?: HealthStatus): string {
  switch (status) {
    case "UP":
      return "#10B981";
    case "DEGRADED":
      return "#F59E0B";
    case "DOWN":
      return "#EF4444";
    default:
      return "#94A3B8";
  }
}

function buildHealthMetrics(systemHealth?: SystemHealthResponse) {
  const services = systemHealth?.services ?? [];
  const upCount = services.filter((service) => service.status === "UP").length;
  const responseTimes = services
    .map((service) => service.responseTimeMs)
    .filter((value): value is number => typeof value === "number");

  const avgResponse =
    responseTimes.length > 0
      ? Math.round(
          responseTimes.reduce((sum, value) => sum + value, 0) /
            responseTimes.length,
        )
      : null;

  return [
    {
      label: "Service Hoạt Động",
      value: services.length > 0 ? `${upCount}/${services.length}` : "—",
      status: upCount === services.length && services.length > 0 ? "good" : "warn",
    },
    {
      label: "Thời Gian Phản Hồi TB",
      value: avgResponse != null ? `${avgResponse}ms` : "—",
      status: avgResponse != null && avgResponse <= 500 ? "good" : "warn",
    },
    {
      label: "Kafka",
      value: systemHealth?.kafka?.status ?? "UNKNOWN",
      status: systemHealth?.kafka?.status === "UP" ? "good" : "warn",
    },
    {
      label: "Trạng Thái Tổng",
      value: systemHealth?.overallStatus ?? "UNKNOWN",
      status: systemHealth?.overallStatus === "UP" ? "good" : "warn",
    },
  ] as const;
}

type WidgetConfig = {
  label: string;
  metric?: KpiMetric;
  icon: typeof Users;
  color: string;
  bg: string;
};

function MetricWidget({ widget }: { widget: WidgetConfig }) {
  const trend = widget.metric?.weekTrendPercent ?? 0;
  const trendColor = trend >= 0 ? "#10B981" : "#EF4444";
  const TrendIcon = trend >= 0 ? TrendingUp : TrendingDown;

  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        padding: "20px 22px",
        border: "1px solid #E2E8F0",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <p style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 500 }}>
            {widget.label}
          </p>
          <p
            style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              color: "#0F172A",
              marginTop: 4,
            }}
          >
            {formatNumber(widget.metric?.total ?? 0)}
          </p>
          <p style={{ fontSize: "0.72rem", color: "#64748B", marginTop: 4 }}>
            {formatWeekChange(widget.metric?.thisWeek ?? 0)}
          </p>
        </div>
        <div>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: widget.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 6,
            }}
          >
            <widget.icon size={20} color={widget.color} />
          </div>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 4,
              fontSize: "0.75rem",
              fontWeight: 700,
              color: trendColor,
            }}
          >
            <TrendIcon size={14} />
            {formatTrend(trend)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function SystemAnalytics() {
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery<
    AdminDashboardOverview,
    Error
  >({
    queryKey: ["admin-dashboard-overview"],
    queryFn: () => adminDashboardService.getOverview(),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const widgets: WidgetConfig[] = [
    {
      label: "Tổng Người Dùng",
      metric: data?.users,
      icon: Users,
      color: "#EA580C",
      bg: "#FFEDD5",
    },
    {
      label: "Vật Phẩm Trang Phục",
      metric: data?.clothingItems,
      icon: Shirt,
      color: "#F97316",
      bg: "#F5F3FF",
    },
    {
      label: "Yêu Cầu Nhận Diện",
      metric: data?.detections,
      icon: Cpu,
      color: "#10B981",
      bg: "#ECFDF5",
    },
    {
      label: "Yêu Cầu Gợi Ý",
      metric: data?.recommendations,
      icon: Sparkles,
      color: "#F59E0B",
      bg: "#FFFBEB",
    },
  ];

  const dailyUsage = data?.dailyActivity ?? [];
  const monthlyGrowth = data?.monthlyGrowth ?? [];
  const systemHealth = buildHealthMetrics(data?.systemHealth);
  const overallStatus = data?.systemHealth?.overallStatus;
  const axiosError = error as AxiosError | undefined;
  const errorStatus = axiosError?.response?.status;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          borderRadius: 20,
          padding: "24px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <Activity size={16} color="rgba(255,255,255,0.6)" />
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>
              Trung Tâm Quản Trị
            </span>
          </div>
          <h2
            style={{
              fontSize: "1.3rem",
              fontWeight: 800,
              color: "white",
              marginBottom: 4,
            }}
          >
            Phân Tích Hệ Thống
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>
            Giám sát nền tảng thời gian thực và số liệu tăng trưởng
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: "10px 16px",
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: overallStatusColor(overallStatus),
                }}
              />
              <span
                style={{
                  color: overallStatusColor(overallStatus),
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                {isLoading ? "Đang tải..." : overallStatusLabel(overallStatus)}
              </span>
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.7rem",
                marginTop: 2,
              }}
            >
              Cập nhật: {formatCheckedAt(data?.generatedAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            style={{
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "white",
              borderRadius: 10,
              padding: "9px 14px",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              cursor: isFetching ? "not-allowed" : "pointer",
              fontWeight: 700,
              fontSize: "0.8rem",
              opacity: isFetching ? 0.7 : 1,
            }}
          >
            <RefreshCw
              size={16}
              style={{
                animation: isFetching ? "dashboard-spin 1s linear infinite" : "none",
              }}
            />
            Làm mới
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes dashboard-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      {isError && (
        <div
          style={{
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#B91C1C",
            borderRadius: 12,
            padding: "12px 16px",
            fontSize: "0.85rem",
          }}
        >
          {errorStatus === 403
            ? "Bạn không có quyền xem trang tổng quan admin. Hãy đăng nhập bằng tài khoản ROLE_ADMIN."
            : errorStatus === 401
              ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
              : "Không thể tải dữ liệu tổng quan. Hãy restart api-gateway và các microservice rồi thử lại."}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {widgets.map((widget) => (
          <MetricWidget key={widget.label} widget={widget} />
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: 20,
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 24,
            border: "1px solid #E2E8F0",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <h3
            style={{
              fontWeight: 700,
              color: "#0F172A",
              marginBottom: 4,
              fontSize: "1rem",
            }}
          >
            Hoạt Động Hàng Ngày
          </h3>
          <p style={{ fontSize: "0.78rem", color: "#64748B", marginBottom: 16 }}>
            Người dùng mới, nhận diện và gợi ý trong 7 ngày qua
          </p>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={dailyUsage}>
              <defs>
                <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EA580C" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#EA580C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="dayLabel"
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #E2E8F0",
                  fontSize: "0.78rem",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "0.72rem" }} />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#EA580C"
                strokeWidth={2}
                fill="url(#usersGrad)"
                name="Người Dùng Mới"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="recommendations"
                stroke="#F97316"
                strokeWidth={2}
                fill="none"
                strokeDasharray="5 3"
                name="Gợi Ý"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 24,
            border: "1px solid #E2E8F0",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <h3
            style={{
              fontWeight: 700,
              color: "#0F172A",
              marginBottom: 4,
              fontSize: "1rem",
            }}
          >
            Sức Khỏe Hệ Thống
          </h3>
          <p style={{ fontSize: "0.78rem", color: "#64748B", marginBottom: 16 }}>
            Trạng thái microservice và Kafka
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {systemHealth.map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#F8FAFC",
                  borderRadius: 12,
                  padding: "12px 16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: item.status === "good" ? "#10B981" : "#F59E0B",
                      flexShrink: 0,
                    }}
                  />
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "#374151",
                      fontWeight: 500,
                    }}
                  >
                    {item.label}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: 800,
                    color: item.status === "good" ? "#10B981" : "#F59E0B",
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 16,
              background: "#ECFDF5",
              borderRadius: 12,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <TrendingUp size={16} color="#10B981" />
            <p style={{ fontSize: "0.82rem", color: "#059669", fontWeight: 600 }}>
              {overallStatus === "UP"
                ? "Nền tảng hoạt động ở hiệu suất tối đa"
                : "Một số thành phần cần được kiểm tra"}
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: 24,
          border: "1px solid #E2E8F0",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        <h3
          style={{
            fontWeight: 700,
            color: "#0F172A",
            marginBottom: 4,
            fontSize: "1rem",
          }}
        >
          Tăng Trưởng Hàng Tháng
        </h3>
        <p style={{ fontSize: "0.78rem", color: "#64748B", marginBottom: 16 }}>
          Người dùng mới và vật phẩm được thêm trong 6 tháng
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyGrowth} barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              dataKey="monthLabel"
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="users"
              tick={{ fontSize: 10, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="items"
              orientation="right"
              tick={{ fontSize: 10, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #E2E8F0",
                fontSize: "0.78rem",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "0.72rem" }} />
            <Bar
              yAxisId="users"
              dataKey="users"
              fill="#EA580C"
              radius={[4, 4, 0, 0]}
              name="Người Dùng Mới"
            />
            <Bar
              yAxisId="items"
              dataKey="items"
              fill="#F97316"
              radius={[4, 4, 0, 0]}
              name="Vật Phẩm"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
