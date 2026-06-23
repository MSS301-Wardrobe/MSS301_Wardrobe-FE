import { useState, useEffect } from "react";
import { Sparkles, Heart, ChevronRight, Star, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { recommendationService } from "../../../services/recommendationService";
import type { Recommendation } from "../../../types/recommendation";

const occasions = ["Tất Cả", "Công Sở", "Thường Ngày", "Tiệc Tùng", "Đám Cưới", "Du Lịch", "General"];

const sourceBadges: Record<string, { label: string; color: string; bg: string }> = {
  preferences: { label: "Sở Thích Của Bạn", color: "#EA580C", bg: "#FFEDD5" },
  event: { label: "Loại Sự Kiện", color: "#F59E0B", bg: "#FFFBEB" },
  friendGroup: { label: "Nhóm Bạn", color: "#F97316", bg: "#F5F3FF" },
  similarUsers: { label: "Người Dùng Tương Tự", color: "#10B981", bg: "#ECFDF5" },
};

// URL ảnh mặc định phòng trường hợp API trả về img: null
const DEFAULT_IMG = "https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?w=400&h=480&fit=crop";

export function OutfitRecommendation() {
  const navigate = useNavigate();

  // States
  const [activeOccasion, setActiveOccasion] = useState("Tất Cả");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [outfits, setOutfits] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Tạm thời hardcode ID này để test. Sau này bạn thay bằng const { user } = useAuth();
  const userId = "123e4567-e89b-12d3-a456-426614174000";

  // Gọi API lấy dữ liệu thật khi tải trang
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const data = await recommendationService.getAllRecommendations(userId);
        setOutfits(data || []);
      } catch (err) {
        console.error("Lỗi khi tải gợi ý: ", err);
        setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId]);

  // Bộ lọc theo Dịp (Sự kiện)
  const filtered = outfits.filter((o) => {
    if (activeOccasion === "Tất Cả") return true;
    const eventType = o.eventType || "General";
    return eventType.toLowerCase().includes(activeOccasion.toLowerCase());
  });

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Hiển thị màn hình Loading
  if (loading) {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px", flexDirection: "column", gap: 12 }}>
          <Loader2 size={40} style={{ animation: "spin 1s linear infinite" }} color="#EA580C" />
          <p style={{ color: "#64748B", fontWeight: 500 }}>Đang tải gợi ý từ AI...</p>
        </div>
    );
  }

  // Hiển thị màn hình Lỗi
  if (error) {
    return (
        <div style={{ textAlign: "center", padding: "60px 24px", background: "white", borderRadius: 20, border: "1px solid #FCA5A5" }}>
          <p style={{ color: "#EF4444", fontWeight: 600, marginBottom: 12 }}>{error}</p>
          <button
              onClick={() => window.location.reload()}
              style={{ padding: "8px 20px", background: "#EF4444", color: "white", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600 }}
          >
            Thử lại
          </button>
        </div>
    );
  }

  // Tính toán số liệu thống kê
  const averageScore = outfits.length > 0
      ? Math.round(outfits.reduce((acc, curr) => acc + (curr.recommendationScore || 0), 0) / outfits.length)
      : 0;

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
              { label: "Bộ Đã Tạo", value: String(outfits.length) },
              { label: "Điểm Phù Hợp TB", value: `${averageScore}%` },
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
          {occasions.map((occ) => {
            const count = occ === "Tất Cả"
                ? outfits.length
                : outfits.filter((o) => (o.eventType || "General").toLowerCase().includes(occ.toLowerCase())).length;

            return (
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
                  {occ} {occ !== "Tất Cả" && <span style={{ marginLeft: 4, opacity: 0.75, fontSize: "0.75rem" }}>({count})</span>}
                </button>
            );
          })}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {filtered.map((item) => {
            const outfit = item.outfit;
            const score = item.recommendationScore ? Math.round(item.recommendationScore * 10) : 0; // Backend trả 8.5 -> FE show 85%
            const eventType = item.eventType || "General";
            const tags = outfit?.tags || [];
            const sources = item.sources || ["preferences"];

            return (
                <div
                    key={item.recommendationId}
                    onClick={() => navigate(`/app/recommendations/${item.recommendationId}`)}
                    style={{ background: "white", borderRadius: 20, overflow: "hidden", border: "1px solid #E2E8F0", cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "transform 0.2s, box-shadow 0.2s" }}
                >
                  {/* Image */}
                  <div style={{ position: "relative" }}>
                    <img src={outfit?.img || DEFAULT_IMG} alt={outfit?.outfitName} style={{ width: "100%", height: 260, objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.7), transparent)" }} />

                    {/* Score badge */}
                    <div style={{ position: "absolute", top: 12, left: 12, display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.95)", borderRadius: 20, padding: "4px 12px" }}>
                      <Star size={12} fill="#F59E0B" color="#F59E0B" />
                      <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#0F172A" }}>{score}% phù hợp</span>
                    </div>

                    {/* Favorite */}
                    <button
                        onClick={(e) => toggleFavorite(item.recommendationId, e)}
                        style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      <Heart size={15} fill={favorites.has(item.recommendationId) ? "#EF4444" : "none"} color={favorites.has(item.recommendationId) ? "#EF4444" : "#94A3B8"} />
                    </button>

                    {/* Occasion Label */}
                    <div style={{ position: "absolute", bottom: 12, left: 12 }}>
                  <span style={{ background: "#EA580C", color: "white", borderRadius: 8, padding: "4px 12px", fontSize: "0.72rem", fontWeight: 700 }}>
                    {eventType}
                  </span>
                    </div>

                    {/* Items count */}
                    <div style={{ position: "absolute", bottom: 12, right: 12 }}>
                  <span style={{ background: "rgba(255,255,255,0.9)", color: "#374151", borderRadius: 8, padding: "4px 10px", fontSize: "0.72rem", fontWeight: 600 }}>
                    {outfit?.items || 0} vật phẩm
                  </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: "16px 18px" }}>
                    <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 6, fontSize: "0.95rem" }}>
                      {outfit?.outfitName || "Trang phục phong cách"}
                    </h3>
                    <p style={{ fontSize: "0.8rem", color: "#64748B", lineHeight: 1.5, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {outfit?.description || "Gợi ý tự động từ StyleAI."}
                    </p>

                    {/* Source badges */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                      {sources.map((src) => {
                        const badge = sourceBadges[src] || { label: src, color: "#64748B", bg: "#F1F5F9" };
                        return (
                            <span key={src} style={{ background: badge.bg, color: badge.color, borderRadius: 5, padding: "2px 8px", fontSize: "0.68rem", fontWeight: 600 }}>
                        {badge.label}
                      </span>
                        );
                      })}
                    </div>

                    {/* Tags & Arrow */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} style={{ background: "#F1F5F9", color: "#64748B", borderRadius: 6, padding: "3px 10px", fontSize: "0.72rem" }}>
                        {tag}
                      </span>
                        ))}
                      </div>
                      <ChevronRight size={16} color="#94A3B8" />
                    </div>
                  </div>
                </div>
            );
          })}
        </div>

        {/* Rỗng */}
        {filtered.length === 0 && !loading && (
            <div style={{ textAlign: "center", padding: "60px 24px", background: "white", borderRadius: 20, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>✨</div>
              <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Chưa có trang phục cho dịp này</h3>
              <p style={{ color: "#64748B", fontSize: "0.9rem" }}>Hệ thống chưa tạo gợi ý cho dịp bạn chọn.</p>
            </div>
        )}
      </div>
  );
}