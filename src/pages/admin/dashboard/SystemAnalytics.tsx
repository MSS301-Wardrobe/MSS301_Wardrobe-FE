import { Users, Shirt, Cpu, Sparkles, TrendingUp, Activity, Globe, Clock } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area
} from "recharts";

const widgets = [
  { label: "Tổng Người Dùng", value: "52,847", change: "+1,234 tuần này", icon: Users, color: "#EA580C", bg: "#FFEDD5", trend: "+12.4%" },
  { label: "Vật Phẩm Trang Phục", value: "2.1M", change: "+48K tuần này", icon: Shirt, color: "#F97316", bg: "#F5F3FF", trend: "+8.7%" },
  { label: "Yêu Cầu Nhận Diện", value: "847K", change: "+23K tuần này", icon: Cpu, color: "#10B981", bg: "#ECFDF5", trend: "+15.2%" },
  { label: "Yêu Cầu Gợi Ý", value: "329K", change: "+12K tuần này", icon: Sparkles, color: "#F59E0B", bg: "#FFFBEB", trend: "+9.8%" },
];

const dailyUsage = [
  { day: "T2", users: 3842, detections: 12420, recommendations: 4890 },
  { day: "T3", users: 4210, detections: 14800, recommendations: 5320 },
  { day: "T4", users: 4850, detections: 16200, recommendations: 6100 },
  { day: "T5", users: 4560, detections: 15400, recommendations: 5780 },
  { day: "T6", users: 5920, detections: 19800, recommendations: 7240 },
  { day: "T7", users: 7340, detections: 24600, recommendations: 9120 },
  { day: "CN", users: 6890, detections: 22100, recommendations: 8450 },
];

const monthlyGrowth = [
  { month: "T12", users: 38420, items: 1540000 },
  { month: "T1", users: 41200, items: 1640000 },
  { month: "T2", users: 43800, items: 1760000 },
  { month: "T3", users: 46300, items: 1870000 },
  { month: "T4", users: 49100, items: 1980000 },
  { month: "T5", users: 52847, items: 2100000 },
];

const topCountries = [
  { country: "🇻🇳 Việt Nam", users: 18420, pct: 34.8 },
  { country: "🇺🇸 Hoa Kỳ", users: 7840, pct: 14.8 },
  { country: "🇯🇵 Nhật Bản", users: 5620, pct: 10.6 },
  { country: "🇰🇷 Hàn Quốc", users: 4890, pct: 9.2 },
  { country: "🇸🇬 Singapore", users: 4120, pct: 7.8 },
  { country: "🇹🇭 Thái Lan", users: 3840, pct: 7.2 },
];

const recentActivity = [
  { event: "Mốc người dùng mới: 52,000 người dùng", time: "2 giờ trước", type: "milestone", icon: "🎯" },
  { event: "AI model v2.0 đã triển khai — độ chính xác lên đến 97.2%", time: "5 giờ trước", type: "system", icon: "🚀" },
  { event: "Lưu lượng cao điểm: 8,420 người dùng đồng thời", time: "1 ngày trước", type: "traffic", icon: "📈" },
  { event: "Đạt mốc 100K lần nhận diện mỗi ngày", time: "2 ngày trước", type: "milestone", icon: "🎉" },
  { event: "Bắt đầu kiểm thử A/B thuật toán gợi ý mới", time: "3 ngày trước", type: "system", icon: "🧪" },
];

const systemHealth = [
  { label: "Thời Gian Phản Hồi API", value: "124ms", status: "good" },
  { label: "Thời Gian Hoạt Động AI", value: "99.97%", status: "good" },
  { label: "Sử Dụng Bộ Nhớ", value: "73%", status: "warn" },
  { label: "Độ Trễ CDN", value: "18ms", status: "good" },
];

export function SystemAnalytics() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Admin banner */}
      <div style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)", borderRadius: 20, padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Activity size={16} color="rgba(255,255,255,0.6)" />
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>Trung Tâm Quản Trị</span>
          </div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "white", marginBottom: 4 }}>Phân Tích Hệ Thống</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>Giám sát nền tảng thời gian thực và số liệu tăng trưởng</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "10px 16px", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
              <span style={{ color: "#10B981", fontSize: "0.8rem", fontWeight: 600 }}>Tất Cả Hệ Thống Hoạt Động</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", marginTop: 2 }}>Kiểm tra lần cuối: 2 phút trước</p>
          </div>
        </div>
      </div>

      {/* Metric widgets */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {widgets.map((w) => (
          <div key={w.label} style={{ background: "white", borderRadius: 16, padding: "20px 22px", border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 500 }}>{w.label}</p>
                <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0F172A", marginTop: 4 }}>{w.value}</p>
                <p style={{ fontSize: "0.72rem", color: "#64748B", marginTop: 4 }}>{w.change}</p>
              </div>
              <div>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: w.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                  <w.icon size={20} color={w.color} />
                </div>
                <span style={{ display: "block", textAlign: "right", fontSize: "0.75rem", fontWeight: 700, color: "#10B981" }}>{w.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
        {/* Daily Usage */}
        <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4, fontSize: "1rem" }}>Hoạt Động Hàng Ngày</h3>
          <p style={{ fontSize: "0.78rem", color: "#64748B", marginBottom: 16 }}>Người dùng, nhận diện và gợi ý tuần này</p>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={dailyUsage}>
              <defs>
                <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EA580C" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#EA580C" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="detectGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: "0.78rem" }} />
              <Legend wrapperStyle={{ fontSize: "0.72rem" }} />
              <Area type="monotone" dataKey="users" stroke="#EA580C" strokeWidth={2} fill="url(#usersGrad)" name="Người Dùng Hoạt Động" dot={false} />
              <Area type="monotone" dataKey="recommendations" stroke="#F97316" strokeWidth={2} fill="none" strokeDasharray="5 3" name="Gợi Ý" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* System Health */}
        <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4, fontSize: "1rem" }}>Sức Khỏe Hệ Thống</h3>
          <p style={{ fontSize: "0.78rem", color: "#64748B", marginBottom: 16 }}>Chỉ số hiệu suất cơ sở hạ tầng</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {systemHealth.map((s) => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F8FAFC", borderRadius: 12, padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.status === "good" ? "#10B981" : "#F59E0B", flexShrink: 0 }} />
                  <p style={{ fontSize: "0.82rem", color: "#374151", fontWeight: 500 }}>{s.label}</p>
                </div>
                <span style={{ fontSize: "0.88rem", fontWeight: 800, color: s.status === "good" ? "#10B981" : "#F59E0B" }}>{s.value}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, background: "#ECFDF5", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={16} color="#10B981" />
            <p style={{ fontSize: "0.82rem", color: "#059669", fontWeight: 600 }}>Nền tảng hoạt động ở hiệu suất tối đa</p>
          </div>
        </div>
      </div>

      {/* Monthly Growth */}
      <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4, fontSize: "1rem" }}>Tăng Trưởng Hàng Tháng</h3>
        <p style={{ fontSize: "0.78rem", color: "#64748B", marginBottom: 16 }}>Tăng trưởng người dùng và vật phẩm trong 6 tháng</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyGrowth} barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="users" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="items" orientation="right" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: "0.78rem" }} />
            <Legend wrapperStyle={{ fontSize: "0.72rem" }} />
            <Bar yAxisId="users" dataKey="users" fill="#EA580C" radius={[4, 4, 0, 0]} name="Người Dùng" />
            <Bar yAxisId="items" dataKey="items" fill="#F97316" radius={[4, 4, 0, 0]} name="Vật Phẩm" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Top Countries */}
        <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Globe size={16} color="#EA580C" />
            <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>Quốc Gia Hàng Đầu</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {topCountries.map((c, i) => (
              <div key={c.country}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "0.72rem", color: "#94A3B8", width: 16 }}>#{i + 1}</span>
                    <span style={{ fontSize: "0.82rem", color: "#374151", fontWeight: 500 }}>{c.country}</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748B" }}>{c.users.toLocaleString()}</span>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#EA580C", minWidth: 40, textAlign: "right" }}>{c.pct}%</span>
                  </div>
                </div>
                <div style={{ background: "#F1F5F9", borderRadius: 100, height: 5 }}>
                  <div style={{ width: `${c.pct * 2}%`, background: i === 0 ? "#EA580C" : i === 1 ? "#F97316" : "#C4B5FD", borderRadius: 100, height: "100%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Clock size={16} color="#F97316" />
            <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>Sự Kiện Hệ Thống Gần Đây</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentActivity.map((act, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", borderRadius: 12, background: "#F8FAFC" }}>
                <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{act.icon}</span>
                <div>
                  <p style={{ fontSize: "0.82rem", color: "#0F172A", fontWeight: 500, lineHeight: 1.4 }}>{act.event}</p>
                  <p style={{ fontSize: "0.7rem", color: "#94A3B8", marginTop: 3 }}>{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
