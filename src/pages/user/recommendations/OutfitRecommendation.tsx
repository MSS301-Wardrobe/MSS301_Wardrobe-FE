import { useState } from "react";
import { Sparkles, Heart, ChevronRight, Star } from "lucide-react";
import { useNavigate } from "react-router";

const occasions = ["Tất Cả", "Công Sở", "Thường Ngày", "Tiệc Tùng", "Đám Cưới", "Du Lịch"];

const sourceBadges: Record<string, { label: string; color: string; bg: string }> = {
  preferences: { label: "Sở Thích Của Bạn", color: "#EA580C", bg: "#FFEDD5" },
  event: { label: "Loại Sự Kiện", color: "#F59E0B", bg: "#FFFBEB" },
  friendGroup: { label: "Nhóm Bạn", color: "#F97316", bg: "#F5F3FF" },
  similarUsers: { label: "Người Dùng Tương Tự", color: "#10B981", bg: "#ECFDF5" },
};

const outfits = [
  {
    id: "1",
    title: "Phong Cách Chuyên Nghiệp",
    occasion: "Công Sở",
    score: 96,
    tags: ["Tối Giản", "Công Sở"],
    sources: ["preferences", "event"],
    description: "Trang phục gọn gàng, uy quyền — hoàn hảo cho các cuộc họp phòng hội đồng và thuyết trình với khách hàng.",
    img: "https://images.unsplash.com/photo-1700557477506-369b241cbe54?w=400&h=480&fit=crop",
    items: 4,
    color: "#EA580C",
  },
  {
    id: "2",
    title: "Phong Cách Cuối Tuần",
    occasion: "Thường Ngày",
    score: 91,
    tags: ["Thoải Mái", "Xu Hướng"],
    sources: ["friendGroup", "similarUsers"],
    description: "Phong cách cuối tuần tự nhiên, thoải mái mà vẫn sành điệu khi khám phá thành phố.",
    img: "https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?w=400&h=480&fit=crop",
    items: 3,
    color: "#10B981",
  },
  {
    id: "3",
    title: "Trang Phục Dạ Tiệc",
    occasion: "Tiệc Tùng",
    score: 94,
    tags: ["Thanh Lịch", "Lễ Hội"],
    sources: ["preferences", "friendGroup"],
    description: "Gây ấn tượng tại mọi sự kiện xã hội với bộ trang phục buổi tối được chọn lọc kỹ lưỡng.",
    img: "https://images.unsplash.com/photo-1617690033147-ce6b332d677b?w=400&h=480&fit=crop",
    items: 5,
    color: "#F97316",
  },
  {
    id: "4",
    title: "Thứ Sáu Lịch Sự",
    occasion: "Công Sở",
    score: 88,
    tags: ["Công Sở Thường", "Thoải Mái"],
    sources: ["preferences", "similarUsers"],
    description: "Kết hợp giữa chuyên nghiệp và thoải mái cho những ngày thứ Sáu giản dị tại văn phòng.",
    img: "https://images.unsplash.com/photo-1731589802956-b4693dae884b?w=400&h=480&fit=crop",
    items: 4,
    color: "#F59E0B",
  },
  {
    id: "5",
    title: "Tiệc Vườn Thanh Lịch",
    occasion: "Đám Cưới",
    score: 93,
    tags: ["Thanh Lịch", "Nữ Tính"],
    sources: ["event", "preferences"],
    description: "Bộ trang phục hoa lá tinh tế, hoàn hảo cho các buổi tiệc ngoài trời.",
    img: "https://images.unsplash.com/photo-1589351189946-b8eb5e170ba6?w=400&h=480&fit=crop",
    items: 5,
    color: "#EC4899",
  },
  {
    id: "6",
    title: "Phong Cách Du Lịch",
    occasion: "Du Lịch",
    score: 89,
    tags: ["Thực Dụng", "Đa Năng"],
    sources: ["similarUsers", "friendGroup"],
    description: "Tiện dụng, thoải mái và linh hoạt cho mọi điểm đến trên thế giới.",
    img: "https://images.unsplash.com/photo-1634921276069-c24ba5d6b35c?w=400&h=480&fit=crop",
    items: 6,
    color: "#0EA5E9",
  },
];

export function OutfitRecommendation() {
  const navigate = useNavigate();
  const [activeOccasion, setActiveOccasion] = useState("Tất Cả");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const filtered = outfits.filter((o) => activeOccasion === "Tất Cả" || o.occasion === activeOccasion);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 50%, #C2410C 100%)", borderRadius: 20, padding: "28px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: -30, right: 80, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Sparkles size={18} color="rgba(255,255,255,0.8)" />
          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem", fontWeight: 500 }}>Được Cung Cấp Bởi StyleAI</span>
        </div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "white", marginBottom: 6 }}>Gợi Ý Trang Phục Của Bạn</h2>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.875rem", maxWidth: 520 }}>
          Các bộ trang phục do AI tạo từ tủ đồ của bạn, phù hợp với sở thích và dịp mặc.
        </p>
        <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
          {[
            { label: "Bộ Đã Tạo", value: "92" },
            { label: "Điểm Phù Hợp TB", value: "91%" },
            { label: "Đã Lưu Yêu Thích", value: String(favorites.size) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ fontSize: "1.3rem", fontWeight: 800, color: "white" }}>{value}</p>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Occasion tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {occasions.map((occ) => (
          <button
            key={occ}
            onClick={() => setActiveOccasion(occ)}
            style={{
              padding: "8px 20px", borderRadius: 20, border: "none", cursor: "pointer",
              background: activeOccasion === occ ? "#EA580C" : "white",
              color: activeOccasion === occ ? "white" : "#64748B",
              fontWeight: activeOccasion === occ ? 700 : 400, fontSize: "0.875rem",
              boxShadow: activeOccasion === occ ? "0 2px 8px rgba(234,88,12,0.35)" : "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            {occ} {occ !== "Tất Cả" && <span style={{ marginLeft: 4, opacity: 0.75, fontSize: "0.75rem" }}>({outfits.filter((o) => o.occasion === occ).length})</span>}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {filtered.map((outfit) => (
          <div
            key={outfit.id}
            onClick={() => navigate(`/app/recommendations/${outfit.id}`)}
            style={{ background: "white", borderRadius: 20, overflow: "hidden", border: "1px solid #E2E8F0", cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "transform 0.2s, box-shadow 0.2s" }}
          >
            {/* Image */}
            <div style={{ position: "relative" }}>
              <img src={outfit.img} alt={outfit.title} style={{ width: "100%", height: 260, objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.7), transparent)" }} />

              {/* Score badge */}
              <div style={{ position: "absolute", top: 12, left: 12, display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.95)", borderRadius: 20, padding: "4px 12px" }}>
                <Star size={12} fill="#F59E0B" color="#F59E0B" />
                <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#0F172A" }}>{outfit.score}% phù hợp</span>
              </div>

              {/* Favorite */}
              <button
                onClick={(e) => toggleFavorite(outfit.id, e)}
                style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <Heart size={15} fill={favorites.has(outfit.id) ? "#EF4444" : "none"} color={favorites.has(outfit.id) ? "#EF4444" : "#94A3B8"} />
              </button>

              {/* Occasion */}
              <div style={{ position: "absolute", bottom: 12, left: 12 }}>
                <span style={{ background: outfit.color, color: "white", borderRadius: 8, padding: "4px 12px", fontSize: "0.72rem", fontWeight: 700 }}>{outfit.occasion}</span>
              </div>

              {/* Items count */}
              <div style={{ position: "absolute", bottom: 12, right: 12 }}>
                <span style={{ background: "rgba(255,255,255,0.9)", color: "#374151", borderRadius: 8, padding: "4px 10px", fontSize: "0.72rem", fontWeight: 600 }}>{outfit.items} vật phẩm</span>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: "16px 18px" }}>
              <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 6, fontSize: "0.95rem" }}>{outfit.title}</h3>
              <p style={{ fontSize: "0.8rem", color: "#64748B", lineHeight: 1.5, marginBottom: 10 }}>{outfit.description}</p>
              {/* Source badges */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                {outfit.sources.map((src) => {
                  const badge = sourceBadges[src];
                  return (
                    <span key={src} style={{ background: badge.bg, color: badge.color, borderRadius: 5, padding: "2px 8px", fontSize: "0.68rem", fontWeight: 600 }}>
                      {badge.label}
                    </span>
                  );
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {outfit.tags.map((tag) => (
                    <span key={tag} style={{ background: "#F1F5F9", color: "#64748B", borderRadius: 6, padding: "3px 10px", fontSize: "0.72rem" }}>{tag}</span>
                  ))}
                </div>
                <ChevronRight size={16} color="#94A3B8" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 24px", background: "white", borderRadius: 20, border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>✨</div>
          <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Chưa có trang phục cho dịp này</h3>
          <p style={{ color: "#64748B", fontSize: "0.9rem" }}>Thêm trang phục để tạo gợi ý cho dịp này</p>
        </div>
      )}
    </div>
  );
}
