import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Users, Crown, Sparkles, TrendingUp, Heart, Share2, Settings, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

const group = {
  id: "1",
  name: "Minimalist Collective",
  emoji: "🎯",
  color: "#EA580C",
  bg: "#FFEDD5",
  members: 12,
  description: "Cộng đồng những người yêu thích thời trang tối giản, đề cao chất lượng hơn số lượng. Chúng tôi chia sẻ ý tưởng trang phục, mẹo phối đồ và khuyến khích cách tiếp cận có chủ ý trong việc xây dựng tủ quần áo.",
  topStyle: "Tối Giản",
  activity: "Hoạt Động",
  created: "Tháng 2 năm 2025",
  sharedStyles: [
    { style: "Tối Giản", pct: 92 },
    { style: "Công Sở Thường", pct: 78 },
    { style: "Lịch Sự Thường Ngày", pct: 65 },
    { style: "Công Sở", pct: 54 },
    { style: "Đơn Sắc", pct: 88 },
  ],
  sharedColors: ["#000000", "#FFFFFF", "#EA580C", "#334155", "#94A3B8", "#E2E8F0"],
  radarData: [
    { subject: "Tối Giản", A: 95 },
    { subject: "Công Sở", A: 72 },
    { subject: "Thường Ngày", A: 58 },
    { subject: "Thể Thao", A: 30 },
    { subject: "Cổ Điển", A: 45 },
    { subject: "Xu Hướng", A: 68 },
  ],
  members_list: [
    { id: "1", name: "Jamie Smith", initials: "JS", color: "#EA580C", role: "admin", items: 247, style: "Tối Giản" },
    { id: "2", name: "Alex Chen", initials: "AC", color: "#F97316", role: "member", items: 183, style: "Công Sở Thường" },
    { id: "3", name: "Sam Rivera", initials: "SR", color: "#10B981", role: "member", items: 156, style: "Tối Giản" },
    { id: "4", name: "Jordan Lee", initials: "JL", color: "#F59E0B", role: "member", items: 312, style: "Lịch Sự Thường Ngày" },
    { id: "5", name: "Morgan Taylor", initials: "MT", color: "#EF4444", role: "member", items: 94, style: "Công Sở" },
    { id: "6", name: "Riley Park", initials: "RP", color: "#0EA5E9", role: "member", items: 271, style: "Tối Giản" },
  ],
};

const trendingOutfits = [
  { id: "1", title: "Đơn Sắc Trắng Tinh", likes: 8, img: "https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?w=200&h=240&fit=crop", postedBy: "JS" },
  { id: "2", title: "Phong Cách Công Sở Tối", likes: 6, img: "https://images.unsplash.com/photo-1731589802956-b4693dae884b?w=200&h=240&fit=crop", postedBy: "AC" },
  { id: "3", title: "Tối Giản Văn Phòng", likes: 11, img: "https://images.unsplash.com/photo-1700557477506-369b241cbe54?w=200&h=240&fit=crop", postedBy: "SR" },
];

const influenceBreakdown = [
  { source: "Bảng Màu Nhóm", pct: 42, color: "#EA580C" },
  { source: "Phong Cách Chung", pct: 31, color: "#F97316" },
  { source: "Trang Phục Phổ Biến", pct: 18, color: "#F59E0B" },
  { source: "Hoạt Động Thành Viên", pct: 9, color: "#10B981" },
];

export function FriendGroupDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "trends" | "influence">("overview");

  return (
    <div style={{ maxWidth: 960 }}>
      <button
        onClick={() => navigate("/app/friend-groups")}
        style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", background: "none", border: "none", cursor: "pointer", marginBottom: 20, fontSize: "0.875rem" }}
      >
        <ArrowLeft size={16} />
        Quay Lại Nhóm Bạn
      </button>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #EA580C, #F97316)", borderRadius: 20, padding: "28px 32px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>
            {group.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white" }}>{group.name}</h2>
              <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 6, padding: "3px 10px", display: "flex", alignItems: "center", gap: 4 }}>
                <Crown size={11} color="rgba(255,255,255,0.9)" />
                <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Quản Trị Viên</span>
              </div>
            </div>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.875rem", lineHeight: 1.6, maxWidth: 560 }}>{group.description}</p>
            <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
              {[
                { label: "Thành Viên", value: group.members },
                { label: "Phong Cách Chủ Đạo", value: group.topStyle },
                { label: "Trạng Thái", value: group.activity },
                { label: "Thành Lập", value: group.created },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "white" }}>{value}</p>
                  <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.65)" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => toast.success("Đã sao chép link mời!")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.25)", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>
              <UserPlus size={14} />
              Mời
            </button>
            <button style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", cursor: "pointer" }}>
              <Settings size={15} color="white" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "white", borderRadius: 14, padding: 4, border: "1px solid #E2E8F0", width: "fit-content" }}>
        {([
          { id: "overview", label: "Tổng Quan" },
          { id: "members", label: `Thành Viên (${group.members})` },
          { id: "trends", label: "Xu Hướng Trang Phục" },
          { id: "influence", label: "Ảnh Hưởng Gợi Ý" },
        ] as const).map(({ id: tabId, label }) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            style={{
              padding: "8px 18px", borderRadius: 10, border: "none", cursor: "pointer",
              background: activeTab === tabId ? "#EA580C" : "transparent",
              color: activeTab === tabId ? "white" : "#64748B",
              fontWeight: activeTab === tabId ? 700 : 400, fontSize: "0.85rem", whiteSpace: "nowrap",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Shared Styles */}
          <div style={{ background: "white", borderRadius: 18, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 18, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={16} color="#EA580C" />
              Sở Thích Phong Cách Chung
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {group.sharedStyles.map((s) => (
                <div key={s.style}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "#374151" }}>{s.style}</span>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#EA580C" }}>{s.pct}%</span>
                  </div>
                  <div style={{ background: "#F1F5F9", borderRadius: 100, height: 6 }}>
                    <div style={{ width: `${s.pct}%`, background: "linear-gradient(90deg, #EA580C, #F97316)", borderRadius: 100, height: "100%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Style Radar */}
          <div style={{ background: "white", borderRadius: 18, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={16} color="#F97316" />
              Đặc Trưng Phong Cách Nhóm
            </h3>
            <p style={{ fontSize: "0.78rem", color: "#64748B", marginBottom: 8 }}>Phân bố phong cách trung bình của tất cả thành viên</p>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={group.radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#94A3B8" }} />
                <Radar dataKey="A" stroke="#EA580C" fill="#EA580C" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: "0.8rem" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Shared Colors */}
          <div style={{ background: "white", borderRadius: 18, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 16, fontSize: "0.95rem" }}>Bảng Màu Nhóm</h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {group.sharedColors.map((c) => (
                <div key={c} style={{ textAlign: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: c, border: "1.5px solid #E2E8F0", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }} />
                  <p style={{ fontSize: "0.6rem", color: "#94A3B8", marginTop: 4 }}>{c}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick member preview */}
          <div style={{ background: "white", borderRadius: 18, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
              <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem" }}>Thành Viên Tích Cực</h3>
              <button onClick={() => setActiveTab("members")} style={{ fontSize: "0.8rem", color: "#EA580C", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>Xem tất cả</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {group.members_list.slice(0, 4).map((m) => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>{m.initials}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0F172A" }}>{m.name}</p>
                    <p style={{ fontSize: "0.72rem", color: "#64748B" }}>{m.style} · {m.items} vật phẩm</p>
                  </div>
                  {m.role === "admin" && <Crown size={14} color="#F59E0B" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "members" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {group.members_list.map((m) => (
            <div key={m.id} style={{ background: "white", borderRadius: 16, padding: "18px 20px", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.9rem", fontWeight: 700 }}>{m.initials}</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <p style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.9rem" }}>{m.name}</p>
                    {m.role === "admin" && <Crown size={13} color="#F59E0B" />}
                  </div>
                  <p style={{ fontSize: "0.72rem", color: "#64748B", marginTop: 2 }}>{m.style}</p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "8px 12px", flex: 1, textAlign: "center" }}>
                  <p style={{ fontSize: "1rem", fontWeight: 800, color: "#0F172A" }}>{m.items}</p>
                  <p style={{ fontSize: "0.65rem", color: "#64748B" }}>Vật Phẩm</p>
                </div>
                <div style={{ width: 10 }} />
                <div style={{ background: "#FFEDD5", borderRadius: 10, padding: "8px 12px", flex: 1, textAlign: "center" }}>
                  <p style={{ fontSize: "1rem", fontWeight: 800, color: "#EA580C" }}>87%</p>
                  <p style={{ fontSize: "0.65rem", color: "#64748B" }}>Phù Hợp</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "trends" && (
        <div>
          <p style={{ color: "#64748B", fontSize: "0.875rem", marginBottom: 16 }}>Các bộ trang phục phổ biến nhất được chia sẻ bởi thành viên nhóm</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {trendingOutfits.map((outfit) => (
              <div key={outfit.id} style={{ background: "white", borderRadius: 18, overflow: "hidden", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ position: "relative" }}>
                  <img src={outfit.img} alt={outfit.title} style={{ width: "100%", height: 200, objectFit: "cover" }} />
                  <div style={{ position: "absolute", bottom: 8, right: 8, background: "white", borderRadius: 8, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4 }}>
                    <Heart size={12} fill="#EF4444" color="#EF4444" />
                    <span style={{ fontSize: "0.72rem", fontWeight: 700 }}>{outfit.likes}</span>
                  </div>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <p style={{ fontWeight: 600, color: "#0F172A", fontSize: "0.88rem", marginBottom: 6 }}>{outfit.title}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#EA580C", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.6rem", fontWeight: 700 }}>{outfit.postedBy}</div>
                      <span style={{ fontSize: "0.72rem", color: "#64748B" }}>bởi thành viên</span>
                    </div>
                    <button onClick={() => toast.success("Đã thêm vào cảm hứng tủ đồ!")} style={{ background: "#FFEDD5", border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: "0.72rem", color: "#EA580C", fontWeight: 600 }}>
                      Lưu
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "influence" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "linear-gradient(135deg, #FFEDD5, #F5F3FF)", borderRadius: 18, padding: 24, border: "1px solid #FED7AA" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Sparkles size={18} color="#EA580C" />
              <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>Nhóm Này Ảnh Hưởng Đến Gợi Ý Của Bạn Như Thế Nào</h3>
            </div>
            <p style={{ color: "#64748B", fontSize: "0.875rem", lineHeight: 1.7 }}>
              AI phân tích sở thích chung, trang phục phổ biến và mẫu hoạt động trong nhóm để tinh chỉnh gợi ý trang phục cá nhân của bạn. Nhóm có độ phù hợp phong cách cao hơn sẽ có mức độ ảnh hưởng mạnh hơn.
            </p>
            <div style={{ marginTop: 16, background: "white", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <p style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 500 }}>Mức Độ Ảnh Hưởng Nhóm</p>
                <p style={{ fontSize: "1.4rem", fontWeight: 800, color: "#EA580C" }}>23%</p>
              </div>
              <div style={{ flex: 1, background: "#F1F5F9", borderRadius: 100, height: 10 }}>
                <div style={{ width: "23%", background: "linear-gradient(90deg, #EA580C, #F97316)", borderRadius: 100, height: "100%" }} />
              </div>
              <span style={{ fontSize: "0.75rem", color: "#64748B", whiteSpace: "nowrap" }}>trên tổng trọng số AI</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {influenceBreakdown.map((item) => (
              <div key={item.source} style={{ background: "white", borderRadius: 16, padding: "18px 20px", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0F172A" }}>{item.source}</p>
                  <span style={{ fontSize: "0.9rem", fontWeight: 800, color: item.color }}>{item.pct}%</span>
                </div>
                <div style={{ background: "#F1F5F9", borderRadius: 100, height: 8 }}>
                  <div style={{ width: `${item.pct}%`, background: item.color, borderRadius: 100, height: "100%", transition: "width 0.6s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
