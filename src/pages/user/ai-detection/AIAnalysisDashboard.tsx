import { useEffect, useState } from "react";
import { useAI } from "../../../hooks/useAI";
import { Cpu, TrendingUp, CheckCircle2, Clock, Loader2 } from "lucide-react";
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Line, Legend, AreaChart, Area
} from "recharts";

export function AIAnalysisDashboard() {
  const { getAnalytics } = useAI();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [categoryAccuracy, setCategoryAccuracy] = useState<any[]>([]);
  const [recentDetections, setRecentDetections] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [st, da, mo, ca, re] = await Promise.all([
          getAnalytics('stats'),
          getAnalytics('daily'),
          getAnalytics('monthly'),
          getAnalytics('categories'),
          getAnalytics('recent'),
        ]);
        setStatsData(st);
        setDailyData(da);
        setMonthlyTrend(mo);
        setCategoryAccuracy(ca);
        setRecentDetections(re);
      } catch (err) {
        console.error("Failed to load AI analytics", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
        <Loader2 className="animate-spin" size={40} color="#EA580C" style={{ animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  const stats = [
    { label: "Tổng Nhận Diện", value: statsData?.total || 0, change: "Đã ghi nhận", icon: Cpu, color: "#EA580C", bg: "#FFEDD5" },
    { label: "Độ Tin Cậy TB", value: `${statsData?.avg_confidence || 0}%`, change: "Toàn hệ thống", icon: TrendingUp, color: "#10B981", bg: "#ECFDF5" },
    { label: "Độ Chính Xác Cao (>90%)", value: statsData?.high_accuracy || 0, change: "Đạt chuẩn an toàn", icon: CheckCircle2, color: "#F97316", bg: "#F5F3FF" },
    { label: "Thời Gian Xử Lý", value: "~1.2s", change: "TB mỗi ảnh", icon: Clock, color: "#F59E0B", bg: "#FFFBEB" },
  ];

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
            {dailyData.length > 0 ? (
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
            ) : (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#94A3B8", fontSize: "0.85rem" }}>Chưa có dữ liệu theo ngày</div>
            )}
          </ResponsiveContainer>
        </div>

        {/* Confidence trend */}
        <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4, fontSize: "1rem" }}>Xu Hướng Độ Tin Cậy</h3>
          <p style={{ fontSize: "0.78rem", color: "#64748B", marginBottom: 16 }}>Độ tin cậy trung bình trong các tháng gần đây</p>
          <ResponsiveContainer width="100%" height={220}>
            {monthlyTrend.length > 0 ? (
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EA580C" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EA580C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: "0.8rem" }} formatter={(v) => [`${v}%`, "Độ Tin Cậy"]} />
                <Area type="monotone" dataKey="confidence" stroke="#EA580C" strokeWidth={2.5} fill="url(#confGrad)" dot={{ fill: "#EA580C", r: 4 }} />
              </AreaChart>
            ) : (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#94A3B8", fontSize: "0.85rem" }}>Chưa có dữ liệu theo tháng</div>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category accuracy */}
      <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4, fontSize: "1rem" }}>Phân Loại Theo Danh Mục</h3>
        <p style={{ fontSize: "0.78rem", color: "#64748B", marginBottom: 20 }}>Số lần nhận diện và độ chính xác theo danh mục trang phục</p>
        
        {categoryAccuracy.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {categoryAccuracy.map((cat) => (
              <div key={cat.category} style={{ background: "#F8FAFC", borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <p style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.9rem" }}>{cat.category}</p>
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
        <p style={{ fontSize: "0.78rem", color: "#64748B", marginBottom: 16 }}>Kết quả phân loại AI mới nhất</p>
        
        {recentDetections.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                  {["Danh Mục", "Độ Tin Cậy", "Thời Gian", "Trạng Thái"].map((h) => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentDetections.map((det) => {
                  const dateObj = new Date(det.time);
                  const formattedTime = dateObj.toLocaleDateString('vi-VN') + " " + dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <tr key={det.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <img src={det.img} alt={det.item} style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />
                          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0F172A" }}>{det.item}</span>
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
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: "center", color: "#94A3B8", fontSize: "0.85rem", padding: "20px 0" }}>Chưa có lượt nhận diện nào</div>
        )}
      </div>
    </div>
  );
}
