import { useState, useEffect } from "react";
import { Star, Loader2, Wand2, Calendar, Users, X } from "lucide-react";
import { useNavigate } from "react-router";
import { recommendationService } from "../../../services/recommendationService";
import { useAuth } from "../../../hooks/useAuth";
import type { Recommendation } from "../../../types/recommendation";
// ĐÃ CẬP NHẬT: Import hàm dynamic URL từ file vừa tạo
import { getDynamicOutfitImage } from "../../../utils/imageHelpers";

const OCCASIONS = [
  { id: "All", label: "Tất Cả" },
  { id: "Meeting", label: "Công Sở" },
  { id: "Casual", label: "Thường Ngày" },
  { id: "Party", label: "Tiệc Tùng" },
  { id: "Wedding", label: "Đám Cưới" },
  { id: "Travel", label: "Du Lịch" }
];

export function OutfitRecommendation() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeRecType, setActiveRecType] = useState<'personal' | 'event' | 'group'>(
      () => (sessionStorage.getItem("activeRecType") as any) || 'personal'
  );
  const [activeTab, setActiveTab] = useState(
      () => sessionStorage.getItem("activeTab") || 'All'
  );

  const [outfits, setOutfits] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  const userId = user?.id || user?.userId;

  useEffect(() => {
    sessionStorage.setItem("activeRecType", activeRecType);
  }, [activeRecType]);

  useEffect(() => {
    sessionStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const fetchRecommendations = async () => {
    if (!userId) return;
    try {
      const data = await recommendationService.getAllRecommendations(userId);
      setOutfits(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Lỗi khi tải gợi ý: ", err);
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

  const handleGenerate = async (specificEvent?: string) => {
    if (!userId) {
      alert("Vui lòng đăng nhập để sử dụng tính năng AI!");
      return;
    }

    if (activeRecType === 'event' && activeTab === 'All' && !specificEvent) {
      setShowEventModal(true);
      return;
    }

    try {
      setIsGenerating(true);
      setShowEventModal(false);

      if (activeRecType === 'personal') {
        await recommendationService.generatePersonal(userId);
      } else if (activeRecType === 'event') {
        const eventTypeToUse = specificEvent || activeTab;
        await recommendationService.generateEvent(userId, eventTypeToUse);
        if (specificEvent) setActiveTab(specificEvent);
      } else if (activeRecType === 'group') {
        const mockGroupId = "999e4567-e89b-12d3-a456-426614174999";
        await recommendationService.generateGroup(userId, mockGroupId);
      }

      await fetchRecommendations();
    } catch (err: any) {
      console.error("Lỗi khi tạo AI: ", err);
      alert("Thất bại! Vui lòng kiểm tra lại tủ đồ.");
    } finally {
      setIsGenerating(false);
    }
  };

  const filtered = outfits.filter((o) => {
    const name = o.outfit?.outfitName || "";
    const isPersonal = name.includes("Cá Nhân");
    const isGroup = name.includes("Nhóm");
    const isEvent = !isPersonal && !isGroup;

    if (activeRecType === 'personal' && !isPersonal) return false;
    if (activeRecType === 'group' && !isGroup) return false;
    if (activeRecType === 'event') {
      if (!isEvent) return false;
      if (activeTab !== "All") {
        const eType = o.eventType || "General";
        if (!eType.toLowerCase().includes(activeTab.toLowerCase())) return false;
      }
    }
    return true;
  }).reverse();

  if (!userId && !loading) {
    return <div style={{ textAlign: "center", padding: "60px 24px" }}><p>Vui lòng đăng nhập.</p></div>;
  }

  if (loading && !isGenerating) {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px", flexDirection: "column", gap: 12 }}>
          <Loader2 size={40} style={{ animation: "spin 1s linear infinite" }} color="#EA580C" />
          <p style={{ color: "#64748B", fontWeight: 500 }}>Đang tải dữ liệu...</p>
        </div>
    );
  }

  return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24, position: "relative" }}>

        {isGenerating && (
            <div style={{ position: "absolute", zIndex: 50, inset: 0, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 20 }}>
              <div style={{ background: "white", padding: "30px", borderRadius: 20, boxShadow: "0 10px 25px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", alignItems: "center", gap: 15 }}>
                <Wand2 size={40} color="#EA580C" style={{ animation: "bounce 1s infinite" }} />
                <h3 style={{ fontWeight: 700, color: "#0F172A" }}>AI Đang Phân Tích...</h3>
              </div>
            </div>
        )}

        {showEventModal && (
            <div style={{ position: "fixed", zIndex: 100, inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ background: "white", borderRadius: 20, padding: 24, width: "100%", maxWidth: 440, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0F172A" }}>Chọn Loại Sự Kiện Phối Đồ</h3>
                  <button onClick={() => setShowEventModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}><X size={20} /></button>
                </div>
                <p style={{ color: "#64748B", fontSize: "0.875rem", marginBottom: 20 }}>Vui lòng lựa chọn cụ thể một mục đích hoặc sự kiện bên dưới để AI tiến hành phân tích tủ đồ tối ưu nhất.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {OCCASIONS.filter(o => o.id !== "All").map(occ => (
                      <button
                          key={occ.id}
                          onClick={() => handleGenerate(occ.id)}
                          style={{ width: "100%", padding: "12px", textAlign: "left", borderRadius: 12, border: "1px solid #E2E8F0", background: "#F8FAFC", cursor: "pointer", fontWeight: 600, color: "#334155" }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#FFF7ED"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "#F8FAFC"}
                      >
                        ✨ Phối đồ {occ.label}
                      </button>
                  ))}
                </div>
              </div>
            </div>
        )}

        <div style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 50%, #C2410C 100%)", borderRadius: 20, padding: "28px 32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "white", marginBottom: 6 }}>Gợi Ý Trang Phục Của Bạn</h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.875rem", maxWidth: 520, marginBottom: 20 }}>
            Quản lý lịch sử mix đồ của AI theo từng danh mục. Bấm "Tạo Gợi Ý Mới" để AI tiếp tục học hỏi từ tủ đồ của bạn.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: 20, paddingBottom: 20 }}>
            <button
                onClick={() => { setActiveRecType('personal'); setActiveTab('All'); }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 12, fontWeight: 700, border: "none", cursor: "pointer", transition: "all 0.2s", background: activeRecType === 'personal' ? "white" : "rgba(255,255,255,0.15)", color: activeRecType === 'personal' ? "#EA580C" : "white" }}
            >
              <Wand2 size={16} /> Cá Nhân
            </button>
            <button
                onClick={() => setActiveRecType('event')}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 12, fontWeight: 700, border: "none", cursor: "pointer", transition: "all 0.2s", background: activeRecType === 'event' ? "white" : "rgba(255,255,255,0.15)", color: activeRecType === 'event' ? "#EA580C" : "white" }}
            >
              <Calendar size={16} /> Theo Dịp
            </button>
            <button
                onClick={() => { setActiveRecType('group'); setActiveTab('All'); }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 12, fontWeight: 700, border: "none", cursor: "pointer", transition: "all 0.2s", background: activeRecType === 'group' ? "white" : "rgba(255,255,255,0.15)", color: activeRecType === 'group' ? "#EA580C" : "white" }}
            >
              <Users size={16} /> Cho Nhóm Bạn
            </button>
          </div>

          <button onClick={() => handleGenerate()} style={{ background: "#0F172A", color: "white", padding: "12px 24px", borderRadius: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8, border: "none", cursor: "pointer" }}>
            <Wand2 size={18} />
            ✨ Tạo Gợi Ý Mới {activeRecType === 'personal' ? '(Cá Nhân)' : activeRecType === 'event' ? `(${activeTab === 'All' ? 'Chọn Dịp' : OCCASIONS.find(o => o.id === activeTab)?.label})` : '(Nhóm)'}
          </button>
        </div>

        {activeRecType === 'event' && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "4px 0" }}>
              {OCCASIONS.map((occ) => (
                  <button
                      key={occ.id}
                      onClick={() => setActiveTab(occ.id)}
                      style={{
                        padding: "8px 20px", borderRadius: 20, border: "none", cursor: "pointer",
                        background: activeTab === occ.id ? "#0F172A" : "white",
                        color: activeTab === occ.id ? "white" : "#64748B",
                        fontWeight: activeTab === occ.id ? 700 : 500, fontSize: "0.875rem",
                        boxShadow: activeTab === occ.id ? "0 2px 8px rgba(15,23,42,0.25)" : "0 1px 3px rgba(0,0,0,0.05)",
                      }}
                  >
                    {occ.label}
                  </button>
              ))}
            </div>
        )}

        {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 20, border: "2px dashed #E2E8F0" }}>
              <Wand2 size={48} color="#94A3B8" style={{ margin: "0 auto 16px", opacity: 0.5 }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#475569", marginBottom: 8 }}>Chưa Có Gợi Ý Nào</h3>
            </div>
        ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {filtered.map((item) => {
                const outfit = item.outfit;
                const score = item.recommendationScore ? Math.round(item.recommendationScore * 10) : 0;

                // ĐÃ CẬP NHẬT: Gọi hàm từ imageHelpers bóc tách theo ID
                const dynamicCoverImg = getDynamicOutfitImage(item.recommendationId, outfit?.outfitName, item.eventType);

                return (
                    <div
                        key={item.recommendationId}
                        onClick={() => navigate(`/app/recommendations/${item.recommendationId}`)}
                        style={{ background: "white", borderRadius: 20, overflow: "hidden", border: "1px solid #E2E8F0", cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                    >
                      <div style={{ position: "relative" }}>
                        <img src={outfit?.img || dynamicCoverImg} alt={outfit?.outfitName} style={{ width: "100%", height: 260, objectFit: "cover" }} />
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
        )}
      </div>
  );
}