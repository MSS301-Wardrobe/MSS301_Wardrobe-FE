import { useState, useEffect } from "react";
import { Star, Loader2, Wand2, Users, X, User } from "lucide-react";
import { useNavigate } from "react-router";
import { recommendationService } from "../../../services/recommendationService";
import { friendGroupService } from "../../../services/friendGroupService";
import { useAuth } from "../../../hooks/useAuth";
import type { Recommendation } from "../../../types/recommendation";
import { OutfitGrid } from "@/components/common/OutfitGrid.tsx";
import { userService } from "../../../services/userService";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "../../../components/ui/alert-dialog";

export function OutfitRecommendation() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeRecType, setActiveRecType] = useState<'personal' | 'group'>(
      () => (sessionStorage.getItem("activeRecType") as any) || 'personal'
  );

  const [outfits, setOutfits] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showPreferenceAlert, setShowPreferenceAlert] = useState(false);
  const [showGroupAlert, setShowGroupAlert] = useState(false);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [showMissingClothesAlert, setShowMissingClothesAlert] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [myStyles, setMyStyles] = useState<string[]>([]);

  const userId = user?.id || user?.userId;

  useEffect(() => {
    sessionStorage.setItem("activeRecType", activeRecType);
  }, [activeRecType]);

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

  const handleGenerate = async (specificGroupId?: string, specificStyle?: string) => {
    if (!userId) {
      alert("Vui lòng đăng nhập để sử dụng tính năng AI!");
      return;
    }

    if (activeRecType === 'personal' && !specificStyle) {
      try {
        setIsGenerating(true);
        const prefs = await userService.getPreferences();
        const stylesArray = prefs.preferredStyles || [];

        if (!stylesArray || stylesArray.length === 0) {
          setIsGenerating(false);
          setShowPreferenceAlert(true);
          return;
        }

        if (stylesArray.length === 1) {
          return handleGenerate(undefined, stylesArray[0]);
        }

        setMyStyles(stylesArray);
        setShowStyleModal(true);
      } catch (err) {
        console.error("Lỗi lấy sở thích phong cách:", err);
        setIsGenerating(false);
        setShowPreferenceAlert(true);
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    if (activeRecType === 'group' && !specificGroupId) {
      try {
        setIsGenerating(true);
        const groups = await friendGroupService.getMyGroups();
        if (!groups || groups.length === 0) {
          setIsGenerating(false);
          setShowGroupAlert(true);
          return;
        }
        setMyGroups(groups);
        setShowGroupModal(true);
      } catch (err) {
        console.error("Lỗi lấy danh sách nhóm bạn:", err);
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    try {
      setIsGenerating(true);
      setShowStyleModal(false);
      setShowGroupModal(false);

      if (activeRecType === 'personal') {
        const response = await recommendationService.generatePersonal(userId, specificStyle);
        if (response?.outfit?.outfitName === "Chưa thiết lập phong cách cá nhân") {
          setIsGenerating(false);
          setShowPreferenceAlert(true);
          return;
        } else if (response?.outfit?.outfitName === "Thiếu trang phục phù hợp") {
          setIsGenerating(false);
          setShowMissingClothesAlert(true);
          return;
        }
      } else if (activeRecType === 'group' && specificGroupId) {
        const response = await recommendationService.generateGroup(userId, specificGroupId);
        if (response?.outfit?.outfitName === "Chưa tham gia nhóm bạn nào") {
          setIsGenerating(false);
          setShowGroupAlert(true);
          return;
        } else if (response?.outfit?.outfitName === "Thiếu trang phục phù hợp") {
          setIsGenerating(false);
          setShowMissingClothesAlert(true);
          return;
        }
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

    if (activeRecType === 'personal' && !isPersonal) return false;
    if (activeRecType === 'group' && !isGroup) return false;
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
            <div style={{ position: "absolute", zIndex: 50, inset: 0, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", borderRadius: 20 }}>
              <div style={{ background: "white", padding: "30px", borderRadius: 20, boxShadow: "0 10px 25px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", alignItems: "center", gap: 15 }}>
                <Wand2 size={40} color="#EA580C" style={{ animation: "bounce 1s infinite" }} />
                <h3 style={{ fontWeight: 700, color: "#0F172A" }}>AI Đang Phân Tích...</h3>
              </div>
            </div>
        )}

        {showGroupModal && (
            <div style={{ position: "fixed", zIndex: 100, inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ background: "white", borderRadius: 20, padding: 24, width: "100%", maxWidth: 440, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0F172A" }}>Chọn Nhóm Bạn Phối Đồ</h3>
                  <button onClick={() => setShowGroupModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}><X size={20} /></button>
                </div>
                <p style={{ color: "#64748B", fontSize: "0.875rem", marginBottom: 20 }}>Vui lòng lựa chọn cụ thể một nhóm bạn bên dưới để AI tiến hành phân tích và phối đồ tối ưu nhất.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "260px", overflowY: "auto" }}>
                  {myGroups.map(group => (
                      <button
                          key={group.groupId || group.id}
                          onClick={() => handleGenerate(group.groupId || group.id)}
                          style={{ width: "100%", padding: "12px", textAlign: "left", borderRadius: 12, border: "1px solid #E2E8F0", background: "#F8FAFC", cursor: "pointer", fontWeight: 600, color: "#334155" }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#FFF7ED"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "#F8FAFC"}
                      >
                        👥 {group.groupName || "Nhóm bạn thời trang"}
                      </button>
                  ))}
                </div>
              </div>
            </div>
        )}

        {showStyleModal && (
            <div style={{ position: "fixed", zIndex: 100, inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ background: "white", borderRadius: 20, padding: 24, width: "100%", maxWidth: 440, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0F172A" }}>Chọn Phong Cách Gợi Ý</h3>
                  <button onClick={() => setShowStyleModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}><X size={20} /></button>
                </div>
                <p style={{ color: "#64748B", fontSize: "0.875rem", marginBottom: 20 }}>Hôm nay bạn muốn StyleAI thiết kế và lựa chọn trang phục theo phong cách nào?</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "260px", overflowY: "auto" }}>
                  {myStyles.map(styleName => (
                      <button
                          key={styleName}
                          onClick={() => handleGenerate(undefined, styleName)}
                          style={{ width: "100%", padding: "12px", textAlign: "left", borderRadius: 12, border: "1px solid #E2E8F0", background: "#F8FAFC", cursor: "pointer", fontWeight: 600, color: "#334155", textTransform: "capitalize", transition: "all 0.2s" }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#FFF7ED"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "#F8FAFC"}
                      >
                        ✨ Phong cách {styleName}
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
                onClick={() => setActiveRecType('personal')}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 12, fontWeight: 700, border: "none", cursor: "pointer", transition: "all 0.2s", background: activeRecType === 'personal' ? "white" : "rgba(255,255,255,0.15)", color: activeRecType === 'personal' ? "#EA580C" : "white" }}
            >
              <User size={16} /> Cá Nhân
            </button>
            <button
                onClick={() => setActiveRecType('group')}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 12, fontWeight: 700, border: "none", cursor: "pointer", transition: "all 0.2s", background: activeRecType === 'group' ? "white" : "rgba(255,255,255,0.15)", color: activeRecType === 'group' ? "#EA580C" : "white" }}
            >
              <Users size={16} /> Cho Nhóm Bạn
            </button>
          </div>

          <button onClick={() => handleGenerate()} style={{ background: "#0F172A", color: "white", padding: "12px 24px", borderRadius: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8, border: "none", cursor: "pointer" }}>
            <Wand2 size={18} />
            ✨ Tạo Gợi Ý Mới {activeRecType === 'personal' ? '(Cá Nhân)' : '(Nhóm)'}
          </button>
        </div>

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

                return (
                    <div
                        key={item.recommendationId}
                        onClick={() => navigate(`/app/recommendations/${item.recommendationId}`)}
                        style={{ background: "white", borderRadius: 20, overflow: "hidden", border: "1px solid #E2E8F0", cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                    >
                      <div style={{ position: "relative" }}>
                        <OutfitGrid items={(outfit as any)?.clothingItems || []} />
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

        <AlertDialog open={showPreferenceAlert} onOpenChange={setShowPreferenceAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bạn chưa thiết lập sở thích cá nhân 🚨</AlertDialogTitle>
              <AlertDialogDescription>
                Hệ thống chưa thể đưa ra gợi ý cá nhân hóa do bạn chưa chọn phong cách và màu sắc ưa thích. Hãy cập nhật gu thời trang của bạn để AI phân tích chuẩn xác nhất nhé!
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowPreferenceAlert(false)}>
                Để sau
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                setShowPreferenceAlert(false);
                navigate('/app/preferences');
              }}>
                Cài đặt sở thích ngay
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showGroupAlert} onOpenChange={setShowGroupAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bạn chưa tham gia nhóm bạn nào 👥</AlertDialogTitle>
              <AlertDialogDescription>
                Hệ thống chưa thể đưa ra gợi ý theo nhóm do bạn chưa kết nối hay tham gia vào bất kỳ nhóm bạn bè nào. Hãy kết nối và tham gia nhóm để cùng nhau chia sẻ phong cách thời trang nhé!
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowGroupAlert(false)}>
                Để sau
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                setShowGroupAlert(false);
                navigate('/app/friend-groups');
              }}>
                Tham gia nhóm ngay
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={showMissingClothesAlert} onOpenChange={setShowMissingClothesAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tủ Đồ Thiếu Trang Phục 👕👖</AlertDialogTitle>
              <AlertDialogDescription>
                Tủ đồ của bạn hiện tại không có đủ các thành phần cơ bản (Cần ít nhất 1 Áo + 1 Quần/Chân Váy, hoặc 1 Đầm liền) để AI có thể phối ra một bộ đồ hoàn chỉnh. Vui lòng thêm quần áo mới vào tủ nhé!
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowMissingClothesAlert(false)}>
                Để sau
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                setShowMissingClothesAlert(false);
                navigate('/app/wardrobe');
              }}>
                Đi đến Tủ đồ
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
}