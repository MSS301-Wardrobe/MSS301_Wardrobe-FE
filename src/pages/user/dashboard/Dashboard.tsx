import { Shirt, Cpu, Sparkles, Upload, Eye, Layers, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { useAuthContext } from "../../../app/providers/AuthProvider";

const stats = [
  { label: "Tổng Trang Phục", value: "247", change: "+12 tuần này", icon: Shirt, color: "#EA580C", bg: "#FFEDD5" },
  { label: "Khu Vực Tủ Đồ", value: "5", change: "4 mặc định + 1 tùy chỉnh", icon: Layers, color: "#F97316", bg: "#F5F3FF" },
  { label: "Nhận Diện AI", value: "1.843", change: "+38 hôm nay", icon: Cpu, color: "#F59E0B", bg: "#FFFBEB" },
  { label: "Bộ Đã Tạo", value: "92", change: "+5 tuần này", icon: Sparkles, color: "#10B981", bg: "#ECFDF5" },
];

const pieData = [
  { name: "Áo", value: 72, color: "#EA580C" },
  { name: "Quần", value: 54, color: "#F97316" },
  { name: "Váy", value: 38, color: "#F59E0B" },
  { name: "Áo Khoác", value: 45, color: "#10B981" },
  { name: "Phụ Kiện", value: 38, color: "#EF4444" },
];

const barData = [
  { month: "T1", items: 18, outfits: 12 },
  { month: "T2", items: 22, outfits: 15 },
  { month: "T3", items: 31, outfits: 20 },
  { month: "T4", items: 28, outfits: 18 },
  { month: "T5", items: 35, outfits: 24 },
  { month: "T6", items: 42, outfits: 31 },
];

const recentUploads = [
  { id: "1", name: "Áo Sơ Mi Trắng Cotton", category: "Áo", time: "2 giờ trước", img: "https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=80&h=80&fit=crop" },
  { id: "2", name: "Quần Slim Jeans Tối", category: "Quần", time: "5 giờ trước", img: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=80&h=80&fit=crop" },
  { id: "3", name: "Thắt Lưng Da Nâu", category: "Phụ Kiện", time: "1 ngày trước", img: "https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=80&h=80&fit=crop" },
  { id: "4", name: "Giày Thể Thao Trắng", category: "Giày", time: "1 ngày trước", img: "https://images.unsplash.com/photo-1544441893-675973e31985?w=80&h=80&fit=crop" },
  { id: "5", name: "Mũ Len", category: "Phụ Kiện", time: "2 ngày trước", img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=80&h=80&fit=crop" },
];

const aiStats = [
  { category: "Áo", count: 72, accuracy: 97 },
  { category: "Quần", count: 54, accuracy: 95 },
  { category: "Váy", count: 38, accuracy: 98 },
  { category: "Áo Khoác", count: 45, accuracy: 94 },
  { category: "Phụ Kiện", count: 38, accuracy: 92 },
];

const recommendations = [
  { title: "Phong Cách Công Sở", score: 94, tags: ["Công Sở", "Tối Giản"], img: "https://images.unsplash.com/photo-1700557477506-369b241cbe54?w=120&h=120&fit=crop" },
  { title: "Phong Cách Cuối Tuần", score: 89, tags: ["Thường Ngày", "Xu Hướng"], img: "https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?w=120&h=120&fit=crop" },
  { title: "Trang Phục Dạ Tiệc", score: 91, tags: ["Tiệc Tùng", "Thanh Lịch"], img: "https://images.unsplash.com/photo-1617690033147-ce6b332d677b?w=120&h=120&fit=crop" },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "bạn";

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Chào buổi sáng";
    if (h < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Greeting */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0F172A" }}>{getGreeting()}, {displayName}! 👋</h2>
          <p style={{ color: "#64748B", marginTop: 4, fontSize: "0.9rem" }}>Đây là những gì đang diễn ra với tủ đồ của bạn hôm nay.</p>
        </div>
        <button
          onClick={() => navigate("/app/wardrobe/add")}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12, background: "linear-gradient(135deg, #EA580C, #F97316)", color: "white", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}
        >
          <Upload size={16} />
          Tải Lên Trang Phục
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "white", borderRadius: 16, padding: "20px 22px", border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 500 }}>{s.label}</p>
                <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0F172A", marginTop: 4 }}>{s.value}</p>
                <p style={{ fontSize: "0.75rem", color: s.color, marginTop: 4, fontWeight: 500 }}>{s.change}</p>
              </div>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.icon size={20} color={s.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 20 }}>
        {/* Pie Chart */}
        <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4, fontSize: "1rem" }}>Phân Bố Trang Phục</h3>
          <p style={{ fontSize: "0.8rem", color: "#64748B", marginBottom: 16 }}>Theo danh mục</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart key="clothing-distribution-pie">
              <Pie key="pie-clothing" data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" nameKey="name">
                {pieData.map((entry) => (
                  <Cell key={`pie-cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} items`, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {pieData.map((item) => (
              <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                <span style={{ fontSize: "0.75rem", color: "#64748B" }}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4, fontSize: "1rem" }}>Tăng Trưởng Tủ Đồ</h3>
          <p style={{ fontSize: "0.8rem", color: "#64748B", marginBottom: 16 }}>Trang phục thêm và bộ tạo hàng tháng</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart key="wardrobe-growth-bar" data={barData} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: "0.8rem" }} />
              <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
              <Bar key="bar-items" dataKey="items" fill="#EA580C" radius={[4, 4, 0, 0]} name="Trang Phục Thêm" />
              <Bar key="bar-outfits" dataKey="outfits" fill="#F97316" radius={[4, 4, 0, 0]} name="Bộ Trang Phục" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Uploads + AI Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }}>
        {/* Recent uploads */}
        <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>Tải Lên Gần Đây</h3>
              <p style={{ fontSize: "0.78rem", color: "#64748B", marginTop: 2 }}>Vật phẩm mới nhất trong tủ đồ của bạn</p>
            </div>
            <button onClick={() => navigate("/app/wardrobe")} style={{ fontSize: "0.8rem", color: "#EA580C", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>Xem tất cả</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentUploads.map((item) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #F1F5F9", cursor: "pointer" }} onClick={() => navigate(`/app/wardrobe/${item.id}`)}>
                <img src={item.img} alt={item.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover" }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: "#0F172A", fontSize: "0.85rem" }}>{item.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "#64748B" }}>{item.category}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.7rem", color: "#94A3B8" }}>{item.time}</span>
                  <Eye size={14} color="#94A3B8" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Detection Stats */}
        <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4, fontSize: "1rem" }}>Thống Kê Nhận Diện AI</h3>
          <p style={{ fontSize: "0.78rem", color: "#64748B", marginBottom: 16 }}>Độ chính xác phân loại theo danh mục</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {aiStats.map((s) => (
              <div key={s.category}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "#374151" }}>{s.category}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748B" }}>{s.count} vật phẩm</span>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#10B981" }}>{s.accuracy}%</span>
                  </div>
                </div>
                <div style={{ background: "#F1F5F9", borderRadius: 100, height: 6 }}>
                  <div style={{ width: `${s.accuracy}%`, background: "linear-gradient(90deg, #EA580C, #F97316)", borderRadius: 100, height: "100%", transition: "width 0.6s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ background: "linear-gradient(135deg, #EA580C 0%, #EA580C 100%)", borderRadius: 16, padding: 24, color: "white" }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 4 }}>Thao Tác Nhanh</h3>
        <p style={{ fontSize: "0.78rem", opacity: 0.8, marginBottom: 20 }}>Bắt đầu các thao tác phổ biến nhất</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          {[
            { label: "Tải Lên Trang Phục", icon: Upload, path: "/app/wardrobe/add", desc: "Thêm vật phẩm mới vào tủ đồ" },
            { label: "Quét AI", icon: Cpu, path: "/app/ai-detection", desc: "Nhận diện trang phục bằng AI" },
            { label: "Gợi Ý Trang Phục", icon: Sparkles, path: "/app/recommendations", desc: "Tạo gợi ý bộ trang phục" },
            { label: "Trang Phục Sự Kiện", icon: Calendar, path: "/app/event-outfits", desc: "Mặc đẹp cho mọi dịp" },
            { label: "Quản Lý Khu Vực", icon: Layers, path: "/app/wardrobe/zones", desc: "Tổ chức khu vực tủ đồ" },
            { label: "Nhóm Bạn", icon: Users, path: "/app/friend-groups", desc: "Xem xu hướng phong cách nhóm" },
          ].map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 12,
                padding: "14px 16px",
                color: "white",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.2s",
                backdropFilter: "blur(4px)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.22)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)"; }}
            >
              <action.icon size={18} style={{ marginBottom: 8, opacity: 0.9 }} />
              <p style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: 2 }}>{action.label}</p>
              <p style={{ fontSize: "0.72rem", opacity: 0.7 }}>{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Outfit Recommendations */}
      <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>Gợi Ý Trang Phục Hôm Nay</h3>
            <p style={{ fontSize: "0.78rem", color: "#64748B", marginTop: 2 }}>Trang phục AI gợi ý từ tủ đồ của bạn</p>
          </div>
          <button onClick={() => navigate("/app/recommendations")} style={{ fontSize: "0.8rem", color: "#EA580C", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>Xem tất cả</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {recommendations.map((r, i) => (
            <div key={i} style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #E2E8F0", cursor: "pointer" }} onClick={() => navigate("/app/recommendations")}>
              <div style={{ position: "relative" }}>
                <img src={r.img} alt={r.title} style={{ width: "100%", height: 120, objectFit: "cover" }} />
                <div style={{ position: "absolute", top: 8, right: 8, background: "#10B981", color: "white", borderRadius: 20, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 700 }}>
                  {r.score}% Phù Hợp
                </div>
              </div>
              <div style={{ padding: "12px 14px" }}>
                <p style={{ fontWeight: 600, fontSize: "0.85rem", color: "#0F172A", marginBottom: 6 }}>{r.title}</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {r.tags.map((tag) => (
                    <span key={tag} style={{ background: "#FFEDD5", color: "#EA580C", borderRadius: 6, padding: "2px 8px", fontSize: "0.7rem", fontWeight: 500 }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
