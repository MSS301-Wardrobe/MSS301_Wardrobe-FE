import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Star, Heart, Share2, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { recommendationService } from "../../../services/recommendationService";
import type { Recommendation } from "../../../types/recommendation";

const DEFAULT_IMG = "https://images.unsplash.com/photo-1700557477506-369b241cbe54?w=600&h=700&fit=crop";
const ITEM_DEFAULT_IMG = "https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=150&h=150&fit=crop";

export function RecommendationDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [saved, setSaved] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Recommendation nhận được từ Backend:", recommendation);
  }, [recommendation]);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        if (id) {
          const data = await recommendationService.getRecommendationDetail(id);
          setRecommendation(data);
        }
      } catch (error) {
        toast.error("Không thể tải thông tin gợi ý.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <Loader2 size={40} className="animate-spin" color="#EA580C" />
        </div>
    );
  }

  if (!recommendation) {
    return <div style={{ textAlign: "center", padding: 40 }}>Không tìm thấy dữ liệu trang phục.</div>;
  }

  const outfit = recommendation.outfit;
  const score = recommendation.recommendationScore ? Math.round(recommendation.recommendationScore * 10) : 85;
  const clothingItems = (outfit as any).clothingItems || [];

  return (
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px" }}>
        <button
            onClick={() => navigate("/app/recommendations")}
            style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", background: "none", border: "none", cursor: "pointer", marginBottom: 20, fontSize: "0.875rem" }}
        >
          <ArrowLeft size={16} />
          Quay Lại Gợi Ý
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 24 }}>
          {/* Image Panel */}
          <div>
            <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid #E2E8F0", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", position: "relative" }}>
              <img src={outfit.img || DEFAULT_IMG} alt={outfit.outfitName} style={{ width: "100%", height: 480, objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.5), transparent)" }} />

              <div style={{ position: "absolute", top: 16, left: 16, display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.95)", borderRadius: 20, padding: "6px 14px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
                <Star size={14} fill="#F59E0B" color="#F59E0B" />
                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0F172A" }}>{score}% Phù Hợp</span>
              </div>

              <div style={{ position: "absolute", bottom: 16, left: 16 }}>
              <span style={{ background: "#EA580C", color: "white", borderRadius: 8, padding: "5px 14px", fontSize: "0.78rem", fontWeight: 700 }}>
                {recommendation.eventType}
              </span>
              </div>
            </div>
          </div>

          {/* Details Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Title */}
            <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>{outfit.outfitName}</h2>
              <p style={{ color: "#64748B", lineHeight: 1.7, fontSize: "0.9rem", marginBottom: 16 }}>{outfit.description}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {outfit.tags && outfit.tags.map((tag: string) => (
                    <span key={tag} style={{ background: "#FFEDD5", color: "#EA580C", borderRadius: 20, padding: "4px 12px", fontSize: "0.78rem", fontWeight: 600 }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Outfit Items */}
            <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 16, fontSize: "0.95rem" }}>Thành Phần Trang Phục ({clothingItems.length} vật phẩm)</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {clothingItems.map((item: any) => (
                    <div
                        key={item.itemId}
                        onClick={() => navigate(`/app/wardrobe/${item.itemId}`)}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, background: "#F8FAFC", border: "1px solid #E2E8F0", cursor: "pointer" }}
                    >
                      <img src={item.img || ITEM_DEFAULT_IMG} alt={item.itemName} style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover" }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, color: "#0F172A", fontSize: "0.88rem" }}>{item.itemName}</p>
                        <p style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 2 }}>Màu sắc: {item.dominantColor}</p>
                      </div>
                      <span style={{ background: "#FFEDD5", color: "#EA580C", borderRadius: 6, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 600 }}>{item.style}</span>
                      <ChevronRight size={14} color="#94A3B8" />
                    </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}