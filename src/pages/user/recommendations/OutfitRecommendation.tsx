import { useState, useEffect } from "react";
import { Sparkles, Heart, ChevronRight, Star, Loader2, Wand2, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router";
import { recommendationService } from "../../../services/recommendationService";
import { useAuth } from "../../../hooks/useAuth";
import type { Recommendation } from "../../../types/recommendation";

const occasions = ["Tất Cả", "Công Sở", "Thường Ngày", "Tiệc Tùng", "Đám Cưới", "Du Lịch", "General"];

const sourceBadges: Record<string, { label: string; color: string; bg: string }> = {
  preferences: { label: "Sở Thích Của Bạn", color: "#EA580C", bg: "#FFEDD5" },
  event: { label: "Loại Sự Kiện", color: "#F59E0B", bg: "#FFFBEB" },
  friendGroup: { label: "Nhóm Bạn", color: "#F97316", bg: "#F5F3FF" },
  similarUsers: { label: "Người Dùng Tương Tự", color: "#10B981", bg: "#ECFDF5" },
};

const DEFAULT_IMG = "https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?w=400&h=480&fit=crop";

export function OutfitRecommendation() {
  const navigate = useNavigate();

  // ĐÃ SỬA: Lấy thông tin user động từ hook useAuth của hệ thống
  const { user } = useAuth();

  const [activeOccasion, setActiveOccasion] = useState("Tất Cả");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [outfits, setOutfits] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id || user?.userId;

  const fetchRecommendations = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await recommendationService.getAllRecommendations(userId);
      setOutfits(data || []);
      setError(null);
    } catch (err: any) {
      console.error("Lỗi khi tải gợi ý: ", err);
      setError("Không thể tải danh sách gợi ý.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const handleGenerate = async (type: 'personal' | 'event' | 'group') => {
    if (!userId) return;

    try {
      setIsGenerating(true);

      // 1. Gọi API tạo mới
      if (type === 'personal') {
        await recommendationService.generatePersonal(userId);
      } else if (type === 'event') {
        const eventType = activeOccasion === 'Tất Cả' ? 'Wedding' : activeOccasion;
        await recommendationService.generateEvent(userId, eventType);
      } else if (type === 'group') {
        const mockGroupId = "999e4567-e89b-12d3-a456-426614174999";
        await recommendationService.generateGroup(userId, mockGroupId);
      }

      // 2. Refresh lại danh sách. Vì setOutfits(data) trong fetchRecommendations
      // đã ghi đè danh sách cũ, nên sẽ không bao giờ bị cộng dồn.
      await fetchRecommendations();

    } catch (err: any) {
      alert("Tạo gợi ý thất bại!");
    } finally {
      setIsGenerating(false);
    }
  };

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

  // Màn hình chờ khi chưa có user
  if (!userId && !loading) {
    return (
        <div style={{ textAlign: "center", padding: "60px 24px", background: "white", borderRadius: 20 }}>
          <p style={{ color: "#EF4444", fontWeight: 600 }}>Vui lòng đăng nhập để xem gợi ý trang phục.</p>
        </div>
    );
  }

  if (loading && !isGenerating) {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px", flexDirection: "column", gap: 12 }}>
          <Loader2 size={40} style={{ animation: "spin 1s linear infinite" }} color="#EA580C" />
          <p style={{ color: "#64748B", fontWeight: 500 }}>Đang tải dữ liệu tủ đồ...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div style={{ textAlign: "center", padding: "60px 24px", background: "white", borderRadius: 20, border: "1px solid #FCA5A5" }}>
          <p style={{ color: "#EF4444", fontWeight: 600, marginBottom: 12 }}>{error}</p>
          <button
              onClick={() => window.location.reload()}
              style={{ padding: "8px 20px", background: "#EF4444", color: "white", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600 }}
          >
            Tải lại trang
          </button>
        </div>
    );
  }

  return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24, position: "relative" }}>

        {isGenerating && (
            <div style={{ position: "absolute", zIndex: 50, inset: 0, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 20 }}>
              <div style={{ background: "white", padding: "30px", borderRadius: 20, boxShadow: "0 10px 25px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", alignItems: "center", gap: 15 }}>
                <Wand2 size={40} color="#EA580C" style={{ animation: "bounce 1s infinite" }} />
                <h3 style={{ fontWeight: 700, color: "#0F172A" }}>AI Đang Phân Tích...</h3>
                <p style={{ color: "#64748B", fontSize: "0.9rem" }}>Đang lục lọi tủ đồ để tìm bộ cánh hoàn hảo nhất cho bạn!</p>
              </div>
            </div>
        )}

        <div style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 50%, #C2410C 100%)", borderRadius: 20, padding: "28px 32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "white", marginBottom: 6 }}>Gợi Ý Trang Phục Của Bạn</h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.875rem", maxWidth: 520, marginBottom: 20 }}>
            Sử dụng trí tuệ nhân tạo để mix & match các món đồ trong tủ của bạn.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: 20 }}>
            <button onClick={() => handleGenerate('personal')} style={{ display: "flex", alignItems: "center", gap: 6, background: "white", color: "#EA580C", padding: "8px 16px", borderRadius: 12, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
              <Wand2 size={16} /> Cá Nhân
            </button>
            <button onClick={() => handleGenerate('event')} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.2)", color: "white", padding: "8px 16px", borderRadius: 12, fontWeight: 600, border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer" }}>
              <Calendar size={16} /> Theo Dịp: {activeOccasion}
            </button>
            <button onClick={() => handleGenerate('group')} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.2)", color: "white", padding: "8px 16px", borderRadius: 12, fontWeight: 600, border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer" }}>
              <Users size={16} /> Cho Nhóm Bạn
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {occasions.map((occ) => {
            const count = occ === "Tất Cả" ? outfits.length : outfits.filter((o) => (o.eventType || "General").toLowerCase().includes(occ.toLowerCase())).length;
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {filtered.map((item) => {
            const outfit = item.outfit;
            const score = item.recommendationScore ? Math.round(item.recommendationScore * 10) : 0;
            return (
                <div
                    key={item.recommendationId}
                    onClick={() => navigate(`/app/recommendations/${item.recommendationId}`)}
                    style={{ background: "white", borderRadius: 20, overflow: "hidden", border: "1px solid #E2E8F0", cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                >
                  <div style={{ position: "relative" }}>
                    <img src={outfit?.img || DEFAULT_IMG} alt={outfit?.outfitName} style={{ width: "100%", height: 260, objectFit: "cover" }} />
                    <div style={{ position: "absolute", top: 12, left: 12, display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.95)", borderRadius: 20, padding: "4px 12px" }}>
                      <Star size={12} fill="#F59E0B" color="#F59E0B" />
                      <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#0F172A" }}>{score}% phù hợp</span>
                    </div>
                  </div>
                  <div style={{ padding: "16px 18px" }}>
                    <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 6, fontSize: "0.95rem" }}>
                      {outfit?.outfitName || "Trang phục phong cách"}
                    </h3>
                    <p style={{ fontSize: "0.8rem", color: "#64748B", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {outfit?.description || "Gợi ý tự động từ StyleAI."}
                    </p>
                  </div>
                </div>
            );
          })}
        </div>
      </div>
  );
}