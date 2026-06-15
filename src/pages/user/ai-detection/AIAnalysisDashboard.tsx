import { Cpu, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import {
  ComposedChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Line, Legend, AreaChart, Area
} from "recharts";

const stats = [
  { label: "Tổng Nhận Diện", value: "1,843", change: "+127 tuần này", icon: Cpu, color: "#EA580C", bg: "#FFEDD5" },
  { label: "Độ Tin Cậy TB", value: "94.6%", change: "↑ 1.2% so với tháng trước", icon: TrendingUp, color: "#10B981", bg: "#ECFDF5" },
  { label: "Độ Chính Xác Cao (>90%)", value: "1,620", change: "87.9% tổng số lần nhận diện", icon: CheckCircle2, color: "#F97316", bg: "#F5F3FF" },
  { label: "Thời Gian Xử Lý", value: "1.2s", change: "TB mỗi ảnh", icon: Clock, color: "#F59E0B", bg: "#FFFBEB" },
];

const categoryAccuracy = [
  { category: "Váy", detections: 384, accuracy: 98.1 },
  { category: "Giày Dép", detections: 219, accuracy: 97.4 },
  { category: "Áo", detections: 523, accuracy: 96.8 },
  { category: "Quần", detections: 342, accuracy: 95.3 },
  { category: "Áo Khoác", detections: 198, accuracy: 94.7 },
  { category: "Phụ Kiện", detections: 177, accuracy: 92.1 },
];

const dailyData = [
  { day: "T2", detections: 143, accuracy: 93.2 },
  { day: "T3", detections: 187, accuracy: 94.8 },
  { day: "T4", detections: 221, accuracy: 95.1 },
  { day: "T5", detections: 196, accuracy: 94.5 },
  { day: "T6", detections: 264, accuracy: 96.2 },
  { day: "T7", detections: 312, accuracy: 95.8 },
  { day: "CN", detections: 289, accuracy: 94.9 },
];

const monthlyTrend = [
  { month: "T12", confidence: 91.2 },
  { month: "T1", confidence: 92.5 },
  { month: "T2", confidence: 93.1 },
  { month: "T3", confidence: 93.8 },
  { month: "T4", confidence: 94.2 },
  { month: "T5", confidence: 94.6 },
];

const recentDetections = [
  { id: 1, item: "Áo Sơ Mi Oxford Trắng", category: "Áo", confidence: 97.3, time: "5 phút trước", status: "success", img: "https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=60&h=60&fit=crop" },
  { id: 2, item: "Quần Jeans Slim Tối", category: "Quần", confidence: 98.1, time: "18 phút trước", status: "success", img: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=60&h=60&fit=crop" },
  { id: 3, item: "Váy Dạ Hội Đỏ", category: "Váy", confidence: 95.6, time: "42 phút trước", status: "success", img: "https://images.unsplash.com/photo-1617690033147-ce6b332d677b?w=60&h=60&fit=crop" },
  { id: 4, item: "Thắt Lưng Da", category: "Phụ Kiện", confidence: 87.2, time: "1 giờ trước", status: "review", img: "https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=60&h=60&fit=crop" },
  { id: 5, item: "Mũ Len Cam", category: "Phụ Kiện", confidence: 94.1, time: "2 giờ trước", status: "success", img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=60&h=60&fit=crop" },
  { id: 6, item: "Giày Boots Da Nâu", category: "Giày Dép", confidence: 96.8, time: "3 giờ trước", status: "success", img: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=60&h=60&fit=crop" },
];

export function AIAnalysisDashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
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

      {/* Charts Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        {/* Daily detections */}
        <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4, fontSize: "1rem" }}>Lượng Nhận Diện Hàng Ngày</h3>
          <p style={{ fontSize: "0.78rem", color: "#64748B", marginBottom: 16 }}>Số lần nhận diện và độ chính xác tuần này</p>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" domain={[85, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: "0.8rem" }} />
              <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
              <Bar yAxisId="left" dataKey="detections" fill="#EA580C" radius={[4, 4, 0, 0]} name="Nhận Diện" barSize={16} />
              <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#10B981" strokeWidth={2} dot={{ fill: "#10B981", r: 3 }} name="Độ Chính Xác %" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Confidence trend */}
        <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4, fontSize: "1rem" }}>Xu Hướng Độ Tin Cậy</h3>
          <p style={{ fontSize: "0.78rem", color: "#64748B", marginBottom: 16 }}>Độ tin cậy trung bình trong 6 tháng</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyTrend}>
              <defs>
                <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EA580C" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#EA580C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis domain={[89, 97]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: "0.8rem" }} formatter={(v) => [`${v}%`, "Độ Tin Cậy"]} />
              <Area type="monotone" dataKey="confidence" stroke="#EA580C" strokeWidth={2.5} fill="url(#confGrad)" dot={{ fill: "#EA580C", r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category accuracy */}
      <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4, fontSize: "1rem" }}>Phân Loại Theo Danh Mục</h3>
        <p style={{ fontSize: "0.78rem", color: "#64748B", marginBottom: 20 }}>Số lần nhận diện và độ chính xác theo danh mục trang phục</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {categoryAccuracy.map((cat) => (
            <div key={cat.category} style={{ background: "#F8FAFC", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <p style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.9rem" }}>{cat.category}</p>
                  <p style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 2 }}>{cat.detections} lần nhận diện</p>
                </div>
                <span style={{
                  background: cat.accuracy >= 96 ? "#ECFDF5" : cat.accuracy >= 93 ? "#FFEDD5" : "#FFFBEB",
                  color: cat.accuracy >= 96 ? "#10B981" : cat.accuracy >= 93 ? "#EA580C" : "#F59E0B",
                  borderRadius: 8, padding: "4px 10px", fontSize: "0.78rem", fontWeight: 700,
                }}>
                  {cat.accuracy}%
                </span>
              </div>
              <div style={{ background: "#E2E8F0", borderRadius: 100, height: 6 }}>
                <div style={{
                  width: `${cat.accuracy}%`, height: "100%", borderRadius: 100,
                  background: cat.accuracy >= 96 ? "#10B981" : cat.accuracy >= 93 ? "#EA580C" : "#F59E0B",
                  transition: "width 0.5s",
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent detections table */}
      <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4, fontSize: "1rem" }}>Nhận Diện Gần Đây</h3>
        <p style={{ fontSize: "0.78rem", color: "#64748B", marginBottom: 16 }}>Kết quả phân loại AI mới nhất</p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                {["Vật Phẩm", "Danh Mục", "Độ Tin Cậy", "Thời Gian", "Trạng Thái"].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentDetections.map((det) => (
                <tr key={det.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img src={det.img} alt={det.item} style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0F172A" }}>{det.item}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ background: "#FFEDD5", color: "#EA580C", borderRadius: 6, padding: "3px 10px", fontSize: "0.75rem", fontWeight: 600 }}>{det.category}</span>
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
                    <span style={{ fontSize: "0.82rem", color: "#94A3B8" }}>{det.time}</span>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
