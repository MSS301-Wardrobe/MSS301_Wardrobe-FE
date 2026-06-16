import { useState } from "react";
import { Plus, Briefcase, Coffee, Zap, Music, Star, Settings, ChevronRight, Shirt, X, Check } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

type Zone = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  count: number;
  isCustom?: boolean;
  previews: string[];
  categories: { name: string; count: number }[];
  lastUpdated: string;
};

const zones: Zone[] = [
  {
    id: "formal",
    name: "Khu Vực Công Sở",
    description: "Trang phục chuyên nghiệp cho các cuộc họp, sự kiện kinh doanh và dịp trang trọng",
    icon: Briefcase,
    color: "#EA580C",
    bg: "linear-gradient(135deg, #FFEDD5, #FFEDD5)",
    border: "#FED7AA",
    count: 48,
    previews: [
      "https://images.unsplash.com/photo-1700557477506-369b241cbe54?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1731589802956-b4693dae884b?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=80&h=80&fit=crop",
    ],
    categories: [
      { name: "Áo Vest", count: 12 },
      { name: "Áo Sơ Mi", count: 18 },
      { name: "Quần Tây", count: 10 },
      { name: "Cà Vạt & Phụ Kiện", count: 8 },
    ],
    lastUpdated: "2 ngày trước",
  },
  {
    id: "casual",
    name: "Khu Vực Thường Ngày",
    description: "Trang phục thoải mái hàng ngày cho cuối tuần, dạo phố và các dịp thư giãn",
    icon: Coffee,
    color: "#10B981",
    bg: "linear-gradient(135deg, #ECFDF5, #D1FAE5)",
    border: "#A7F3D0",
    count: 72,
    previews: [
      "https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=80&h=80&fit=crop",
    ],
    categories: [
      { name: "Áo Thun", count: 24 },
      { name: "Quần Jeans", count: 18 },
      { name: "Giày Thể Thao", count: 12 },
      { name: "Áo Thường Ngày", count: 18 },
    ],
    lastUpdated: "Hôm nay",
  },
  {
    id: "sport",
    name: "Khu Vực Thể Thao",
    description: "Trang phục thể thao và năng động cho phòng gym, hoạt động thể thao và lối sống tích cực",
    icon: Zap,
    color: "#F97316",
    bg: "linear-gradient(135deg, #FFF7ED, #FFEDD5)",
    border: "#FED7AA",
    count: 31,
    previews: [
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1617178388553-a9d022974a5c?w=80&h=80&fit=crop",
    ],
    categories: [
      { name: "Đồ Thể Thao", count: 14 },
      { name: "Giày Thể Thao", count: 8 },
      { name: "Đồ Tập Gym", count: 9 },
    ],
    lastUpdated: "1 tuần trước",
  },
  {
    id: "party",
    name: "Khu Vực Tiệc Tùng",
    description: "Trang phục sành điệu và thời thượng cho các sự kiện xã hội, tiệc tùng và đêm muộn",
    icon: Music,
    color: "#F97316",
    bg: "linear-gradient(135deg, #F5F3FF, #EDE9FE)",
    border: "#DDD6FE",
    count: 27,
    previews: [
      "https://images.unsplash.com/photo-1617690033147-ce6b332d677b?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1589351189946-b8eb5e170ba6?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=80&h=80&fit=crop",
    ],
    categories: [
      { name: "Váy", count: 12 },
      { name: "Đồ Dạ Tiệc", count: 8 },
      { name: "Trang Phục Nổi Bật", count: 7 },
    ],
    lastUpdated: "3 ngày trước",
  },
];

const customZones: Zone[] = [
  {
    id: "travel",
    name: "Du Lịch Thiết Yếu",
    description: "Các món đồ linh hoạt, hoàn hảo để đóng gói gọn nhẹ và trông thật tuyệt ở bất cứ đâu",
    icon: Star,
    color: "#F59E0B",
    bg: "linear-gradient(135deg, #FFFBEB, #FEF3C7)",
    border: "#FDE68A",
    count: 19,
    isCustom: true,
    previews: [
      "https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=80&h=80&fit=crop",
    ],
    categories: [
      { name: "Áo Linh Hoạt", count: 8 },
      { name: "Áo Khoác Nhẹ", count: 6 },
      { name: "Giày Thoải Mái", count: 5 },
    ],
    lastUpdated: "5 ngày trước",
  },
];

export function WardrobeZones() {
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [newZone, setNewZone] = useState({ name: "", description: "" });
  const [activeZone, setActiveZone] = useState<string | null>(null);

  const handleCreate = () => {
    if (!newZone.name.trim()) { toast.error("Vui lòng nhập tên khu vực"); return; }
    toast.success(`Khu vực "${newZone.name}" đã được tạo!`);
    setCreateOpen(false);
    setNewZone({ name: "", description: "" });
  };

  const allZones = [...zones, ...customZones];
  const totalItems = allZones.reduce((s, z) => s + z.count, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <p style={{ color: "#64748B", fontSize: "0.875rem", marginTop: 4 }}>
            {allZones.length} khu vực · {totalItems} vật phẩm được sắp xếp
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 12, background: "linear-gradient(135deg, #EA580C, #F97316)", color: "white", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}
        >
          <Plus size={15} />
          Tạo Khu Vực Tùy Chỉnh
        </button>
      </div>

      {/* Summary Bar */}
      <div style={{ background: "white", borderRadius: 16, padding: "18px 24px", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", gap: 0, overflowX: "auto" }}>
        {allZones.map((zone, i) => (
          <div key={zone.id} style={{ flex: 1, minWidth: 100, padding: "0 20px", borderRight: i < allZones.length - 1 ? "1px solid #E2E8F0" : "none", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
              <zone.icon size={14} color={zone.color} />
              <span style={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 500 }}>{zone.name.replace(" Zone", "").replace(" Essentials", "")}</span>
            </div>
            <p style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0F172A" }}>{zone.count}</p>
            <p style={{ fontSize: "0.65rem", color: "#94A3B8" }}>vật phẩm</p>
          </div>
        ))}
      </div>

      {/* Zone Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
        {allZones.map((zone) => (
          <div
            key={zone.id}
            style={{ background: zone.bg, borderRadius: 20, padding: 24, border: `1px solid ${zone.border}`, cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", boxShadow: activeZone === zone.id ? `0 8px 32px rgba(0,0,0,0.12)` : "0 2px 8px rgba(0,0,0,0.04)" }}
            onClick={() => setActiveZone(activeZone === zone.id ? null : zone.id)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                  <zone.icon size={22} color={zone.color} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <p style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>{zone.name}</p>
                    {zone.isCustom && (
                      <span style={{ background: "white", color: "#F59E0B", borderRadius: 6, padding: "2px 7px", fontSize: "0.62rem", fontWeight: 700, border: "1px solid #FDE68A" }}>Tùy Chỉnh</span>
                    )}
                  </div>
                  <p style={{ fontSize: "0.72rem", color: "#64748B", marginTop: 2 }}>Cập nhật {zone.lastUpdated}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); toast.success(`Đang quản lý ${zone.name}...`); }}
                  style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.7)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <Settings size={13} color="#64748B" />
                </button>
              </div>
            </div>

            {/* Count badge */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
              <span style={{ fontSize: "2rem", fontWeight: 800, color: zone.color }}>{zone.count}</span>
              <span style={{ fontSize: "0.82rem", color: "#64748B" }}>vật phẩm</span>
            </div>

            <p style={{ fontSize: "0.82rem", color: "#374151", lineHeight: 1.6, marginBottom: 16 }}>{zone.description}</p>

            {/* Preview thumbnails */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {zone.previews.map((img, i) => (
                <img key={i} src={img} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", border: "2px solid rgba(255,255,255,0.8)" }} />
              ))}
              {zone.count > zone.previews.length && (
                <div style={{ width: 52, height: 52, borderRadius: 10, background: "rgba(255,255,255,0.6)", border: "2px solid rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748B" }}>+{zone.count - zone.previews.length}</span>
                </div>
              )}
            </div>

            {/* Category breakdown (expanded) */}
            {activeZone === zone.id && (
              <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>Phân Tích Danh Mục</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {zone.categories.map((cat) => (
                    <div key={cat.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Shirt size={12} color={zone.color} />
                        <span style={{ fontSize: "0.8rem", color: "#374151" }}>{cat.name}</span>
                      </div>
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: zone.color }}>{cat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={(e) => { e.stopPropagation(); navigate("/app/wardrobe"); }}
                style={{ flex: 2, padding: "9px", borderRadius: 10, border: `1.5px solid ${zone.border}`, background: "white", color: zone.color, fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <ChevronRight size={14} />
                Xem Khu Vực
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigate("/app/wardrobe/add"); }}
                style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", background: zone.color, color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
              >
                <Plus size={13} />
                Thêm
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Zone Modal */}
      {createOpen && (
        <div onClick={() => setCreateOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 24, padding: 36, maxWidth: 440, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontWeight: 800, color: "#0F172A", fontSize: "1.1rem" }}>Tạo Khu Vực Tùy Chỉnh</h3>
              <button onClick={() => setCreateOpen(false)} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}>
                <X size={16} color="#64748B" />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Tên Khu Vực *</label>
                <input type="text" value={newZone.name} onChange={(e) => setNewZone({ ...newZone, name: e.target.value })} placeholder="Vd: Bộ Sưu Tập Mùa Hè" style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Mô Tả</label>
                <textarea value={newZone.description} onChange={(e) => setNewZone({ ...newZone, description: e.target.value })} rows={3} placeholder="Trang phục nào thuộc khu vực này?" style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: "0.88rem", outline: "none", resize: "vertical", fontFamily: "Inter, sans-serif", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setCreateOpen(false)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}>Hủy</button>
                <button onClick={handleCreate} style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #EA580C, #F97316)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                  <Check size={15} />
                  Tạo Khu Vực
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
