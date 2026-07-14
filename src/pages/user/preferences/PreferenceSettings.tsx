import { useState, useEffect } from "react";
import { Save, Palette, Shirt, Heart, Star, Loader2, Check, AlertTriangle, X } from "lucide-react";
import { useUser } from "../../../hooks/useUser";
import { friendGroupService } from "../../../services/friendGroupService";
import type { FriendGroup } from "../../../types/group";


const colorSwatches = [
  { key: "BLACK", name: "Đen", hex: "#000000" },
  { key: "WHITE", name: "Trắng", hex: "#FFFFFF" },
  { key: "NAVY", name: "Xanh Đậm", hex: "#1E3A5F" },
  { key: "CREAM", name: "Chàm", hex: "#EA580C" },
  { key: "PURPLE", name: "Tím", hex: "#F97316" },
  { key: "PINK", name: "Hồng", hex: "#EC4899" },
  { key: "RED", name: "Đỏ", hex: "#EF4444" },
  { key: "ORANGE", name: "Cam", hex: "#F97316" },
  { key: "YELLOW", name: "Vàng", hex: "#F59E0B" },
  { key: "GREEN", name: "Xanh Lá", hex: "#10B981" },
  { key: "TURQUOISE", name: "Xanh Mòng Két", hex: "#14B8A6" },
  { key: "GRAY", name: "Xám", hex: "#94A3B8" },
  { key: "BROWN", name: "Nâu", hex: "#92400E" },
  { key: "BEIGE", name: "Be", hex: "#D4B896" },
];

const styleOptions = [
  { id: "MINIMAL", label: "Tối Giản", desc: "Gọn gàng, đơn giản, tinh tế", icon: "⬜" },
  { id: "CASUAL", label: "Thường Ngày", desc: "Thoải mái, trang phục hàng ngày", icon: "👕" },
  { id: "OFFICE", label: "Công Sở", desc: "Chuyên nghiệp nhưng không cứng nhắc", icon: "👔" },
  { id: "ELEGANT", label: "Trang Trọng", desc: "Sắc sảo, bóng bẩy, thanh lịch", icon: "🎩" },
  { id: "STREET", label: "Đường Phố", desc: "Nổi bật, đô thị, xu hướng", icon: "🧢" },
  { id: "BOHEMIAN", label: "Bohemian", desc: "Tự do, phóng khoáng, nghệ thuật", icon: "🌸" },
  { id: "SPORTY", label: "Thể Thao", desc: "Năng động và thể thao", icon: "🏃" },
  { id: "VINTAGE", label: "Cổ Điển", desc: "Retro, cổ điển, vượt thời gian", icon: "🎞️" },
];

const lifestyles = [
  { id: "OFFICE_WORK", label: "Văn Phòng / Công Việc", icon: "💼" },
  { id: "STUDENT_LIFE", label: "Cuộc Sống Sinh Viên", icon: "📚" },
  { id: "TRAVEL_EXPLORATION", label: "Du Lịch & Khám Phá", icon: "✈️" },
  { id: "SOCIAL_EVENTS", label: "Sự Kiện Xã Hội", icon: "🎉" },
  { id: "SPORT_FITNESS", label: "Thể Dục & Thể Thao", icon: "💪" },
  { id: "DATING", label: "Hẹn Hò", icon: "❤️" },
];

const clothingInterests = [
  { id: "DRESS", label: "Váy" },
  { id: "VEST", label: "Áo Vest" },
  { id: "DENIM", label: "Đồ Denim" },
  { id: "WOOL", label: "Đồ Len" },
  { id: "OUTERWEAR", label: "Áo Ngoài" },
  { id: "SPORTSWEAR", label: "Đồ Thể Thao" },
  { id: "HOMEWEAR", label: "Đồ Nhà" },
  { id: "SWIMWEAR", label: "Đồ Bơi" },
  { id: "SUIT", label: "Bộ Vest" },
];

export function PreferenceSettings() {
  const { preferences, isPreferencesLoading, updatePreferences, isUpdatingPreferences } = useUser();

  const [selectedColors, setSelectedColors] = useState<string[]>([
    "BLACK",
    "ORANGE",
    "WHITE",
  ]);

  const [selectedStyles, setSelectedStyles] = useState<string[]>([
    "MINIMAL",
    "OFFICE",
  ]);

  const [selectedLifestyles, setSelectedLifestyles] = useState<string[]>([
    "OFFICE_WORK",
    "SOCIAL_EVENTS",
  ]);

  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "VEST",
    "DENIM",
    "SHOES",
  ]);

  // Populate from API when loaded
  useEffect(() => {
    if (!preferences) return;
    setSelectedColors(preferences.favoriteColors ?? []);
    setSelectedStyles(preferences.preferredStyles ?? []);
    setSelectedLifestyles(preferences.lifestyles ?? []);
    setSelectedInterests(preferences.clothingInterests ?? []);
  }, [preferences]);

  const toggleColor = (key: string) => {
    setSelectedColors((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };
  const toggleStyle = (id: string) => {
    setSelectedStyles((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };
  const toggleLifestyle = (id: string) => {
    setSelectedLifestyles((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };
  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]);
  };

  // --- Confirm dialog state ---
  const [conflictGroups, setConflictGroups] = useState<FriendGroup[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  // Payload cần lưu sau khi user xác nhận
  const [pendingPayload, setPendingPayload] = useState<null | {
    favoriteColors: string[];
    preferredStyles: string[];
    lifestyles: string[];
    clothingInterests: string[];
  }>(null);

  const handleSave = async () => {
    const payload = {
      favoriteColors: selectedColors,
      preferredStyles: selectedStyles,
      lifestyles: selectedLifestyles,
      clothingInterests: selectedInterests,
    };

    // Kiểm tra xem style có thay đổi so với hiện tại không
    const currentStyles = preferences?.preferredStyles ?? [];
    const stylesChanged =
      selectedStyles.length !== currentStyles.length ||
      selectedStyles.some((s) => !currentStyles.includes(s));

    if (!stylesChanged) {
      // Không đổi style → lưu luôn
      updatePreferences(payload);
      return;
    }

    // Có đổi style → kiểm tra conflict
    setIsCheckingConflict(true);
    try {
      const conflicts = await friendGroupService.getStyleConflictGroups(selectedStyles);
      if (conflicts.length === 0) {
        // Không có conflict → lưu luôn
        updatePreferences(payload);
      } else {
        // Có conflict → hiện dialog cảnh báo
        setConflictGroups(conflicts);
        setPendingPayload(payload);
        setShowConfirmDialog(true);
      }
    } catch {
      // Nếu API conflict thất bại, vẫn lưu bình thường
      updatePreferences(payload);
    } finally {
      setIsCheckingConflict(false);
    }
  };

  const handleConfirmSave = () => {
    if (pendingPayload) {
      updatePreferences(pendingPayload);
    }
    setShowConfirmDialog(false);
    setPendingPayload(null);
    setConflictGroups([]);
  };

  const handleCancelSave = () => {
    setShowConfirmDialog(false);
    setPendingPayload(null);
    setConflictGroups([]);
  };

  if (isPreferencesLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, color: "#64748B", gap: 10 }}>
        <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        Đang tải sở thích...
      </div>
    );
  }

  return (
    <>
      <div style={{ maxWidth: 860, display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Header */}
          <div style={{ background: "linear-gradient(135deg, #EA580C, #F97316)", borderRadius: 20, padding: "28px 32px", color: "white" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 6 }}>Sở Thích Phong Cách</h2>
            <p style={{ opacity: 0.85, fontSize: "0.9rem", lineHeight: 1.6 }}>
              Hãy cho chúng tôi biết về phong cách của bạn để AI gợi ý trang phục hoàn hảo nhất.
            </p>
          </div>

          {/* Favorite Colors */}
          <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FFEDD5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Palette size={18} color="#EA580C" />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>Màu Yêu Thích</h3>
                <p style={{ fontSize: "0.78rem", color: "#64748B" }}>Chọn màu bạn thích mặc ({selectedColors.length} đã chọn)</p>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, overflowX: "hidden" }}>
              {colorSwatches.map((c) => {
                const selected = selectedColors.includes(c.key);

                const isLightColor = ["WHITE", "BEIGE", "YELLOW"].includes(c.key);

                return (
                  <button
                    key={c.key}
                    onClick={() => toggleColor(c.key)}
                    title={c.name}
                    style={{
                      width: 66,
                      minHeight: 78,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 7,
                      background: selected ? "#FFF7ED" : "transparent",
                      border: selected ? "1.5px solid #FDBA74" : "1.5px solid transparent",
                      borderRadius: 14,
                      cursor: "pointer",
                      padding: "8px 6px",
                      transition: "all 0.15s",
                      boxShadow: selected ? "0 4px 12px rgba(234,88,12,0.12)" : "none",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        background: c.hex,
                        border: selected
                          ? "3px solid #EA580C"
                          : "2px solid #CBD5E1",
                        boxShadow: selected
                          ? "0 0 0 3px #FFEDD5"
                          : "0 2px 5px rgba(15,23,42,0.08)",
                        transition: "all 0.15s",
                      }}
                    >
                      {selected && (
                        <div
                          style={{
                            position: "absolute",
                            right: -5,
                            bottom: -5,
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: "#EA580C",
                            border: "2px solid white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 6px rgba(234,88,12,0.35)",
                          }}
                        >
                          <Check
                            size={12}
                            color="white"
                            strokeWidth={3}
                          />
                        </div>
                      )}

                      {isLightColor && !selected && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 3,
                            borderRadius: "50%",
                            border: "1px solid rgba(15,23,42,0.08)",
                            pointerEvents: "none",
                          }}
                        />
                      )}
                    </div>

                    <span
                      style={{
                        fontSize: "0.68rem",
                        color: selected ? "#EA580C" : "#64748B",
                        fontWeight: selected ? 800 : 500,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Styles */}
          <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Shirt size={18} color="#F97316" />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>Phong Cách Ưa Thích</h3>
                <p style={{ fontSize: "0.78rem", color: "#64748B" }}>Phong cách nào định hình tủ đồ của bạn?</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
              {styleOptions.map((style) => {
                const selected = selectedStyles.includes(style.id);
                return (
                  <button
                    key={style.id}
                    onClick={() => toggleStyle(style.id)}
                    style={{
                      padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${selected ? "#EA580C" : "#E2E8F0"}`,
                      background: selected ? "#FFEDD5" : "white",
                      cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontSize: "1.4rem", marginBottom: 6 }}>{style.icon}</div>
                    <p style={{ fontWeight: 600, color: selected ? "#EA580C" : "#0F172A", fontSize: "0.88rem" }}>{style.label}</p>
                    <p style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 3 }}>{style.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lifestyle Selection */}
          <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Heart size={18} color="#F59E0B" />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>Lối Sống</h3>
                <p style={{ fontSize: "0.78rem", color: "#64748B" }}>Bạn thường dành thời gian ở đâu nhất?</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
              {lifestyles.map((life) => {
                const selected = selectedLifestyles.includes(life.id);
                return (
                  <button
                    key={life.id}
                    onClick={() => toggleLifestyle(life.id)}
                    style={{
                      padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${selected ? "#F59E0B" : "#E2E8F0"}`,
                      background: selected ? "#FFFBEB" : "white",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>{life.icon}</span>
                    <span style={{ fontWeight: selected ? 600 : 400, color: selected ? "#D97706" : "#374151", fontSize: "0.85rem" }}>{life.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clothing Interests */}
          <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Star size={18} color="#10B981" />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>Quan Tâm Trang Phục</h3>
                <p style={{ fontSize: "0.78rem", color: "#64748B" }}>Bạn quan tâm đến loại trang phục nào?</p>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, overflowX: "hidden" }}>
              {clothingInterests.map((interest) => {
                const selected = selectedInterests.includes(interest.id);

                return (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    style={{
                      padding: "7px 16px",
                      borderRadius: 20,
                      border: `1.5px solid ${selected ? "#10B981" : "#E2E8F0"}`,
                      background: selected ? "#ECFDF5" : "white",
                      color: selected ? "#059669" : "#64748B",
                      fontWeight: selected ? 600 : 400,
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      transition: "all 0.15s",
                    }}
                  >
                    {interest.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button
              onClick={() => {
                if (preferences) {
                  setSelectedColors(preferences.favoriteColors ?? []);
                  setSelectedStyles(preferences.preferredStyles ?? []);
                  setSelectedLifestyles(preferences.lifestyles ?? []);
                  setSelectedInterests(preferences.clothingInterests ?? []);
                }
              }}
              style={{ padding: "11px 24px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "white", color: "#0F172A", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}
            >
              Đặt Lại
            </button>
            <button
              onClick={handleSave}
              disabled={isUpdatingPreferences || isCheckingConflict}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "11px 24px", borderRadius: 12,
                background: (isUpdatingPreferences || isCheckingConflict) ? "#FED7AA" : "linear-gradient(135deg, #EA580C, #F97316)",
                color: "white", border: "none", fontWeight: 700,
                cursor: (isUpdatingPreferences || isCheckingConflict) ? "default" : "pointer", fontSize: "0.9rem",
              }}
            >
              {(isUpdatingPreferences || isCheckingConflict)
                ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Đang kiểm tra...</>
                : <><Save size={15} /> Lưu Sở Thích</>
              }
            </button>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>

        {/* ====== Confirm Dialog: cảnh báo rời nhóm ====== */}
        {showConfirmDialog && (
          <div
            style={{
              position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 9999, padding: 20,
            }}
          >
            <div
              style={{
                width: "100%", maxWidth: 460,
                background: "white", borderRadius: 20, padding: 28,
                boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <AlertTriangle size={22} color="#D97706" />
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, color: "#0F172A", fontSize: "1.05rem", marginBottom: 6 }}>
                    Bạn sẽ rời khỏi {conflictGroups.length} nhóm
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "#64748B", lineHeight: 1.6 }}>
                    Các nhóm dưới đây có phong cách chủ đạo không còn phù hợp với sở thích mới của bạn.
                    Bạn sẽ tự động bị xóa khỏi các nhóm này sau khi lưu.
                  </p>
                </div>
              </div>

              {/* Danh sách nhóm bị ảnh hưởng */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, maxHeight: 220, overflowY: "auto" }}>
                {conflictGroups.map((g) => (
                  <div
                    key={g.groupId}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      background: "#FFF7ED", borderRadius: 12, padding: "10px 14px",
                      border: "1px solid #FED7AA",
                    }}
                  >
                    <span style={{ fontSize: "1.3rem" }}>{g.emoji ?? "\uD83D\uDC57"}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.88rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {g.groupName}
                      </p>
                      {g.primaryStyleLabels && g.primaryStyleLabels.length > 0 && (
                        <span style={{ fontSize: "0.8rem", color: "#64748B", background: "#F1F5F9", padding: "2px 8px", borderRadius: 12 }}>
                          Phong cách: {g.primaryStyleLabels.join(", ")}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "#64748B", whiteSpace: "nowrap" }}>
                      {g.memberCount} thành viên
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={handleCancelSave}
                  style={{
                    flex: 1, padding: "11px", borderRadius: 12,
                    border: "1.5px solid #E2E8F0", background: "white",
                    color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.88rem",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  <X size={14} /> Giữ Nguyên
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  disabled={isUpdatingPreferences}
                  style={{
                    flex: 2, padding: "11px", borderRadius: 12,
                    border: "none",
                    background: isUpdatingPreferences ? "#FED7AA" : "linear-gradient(135deg, #EA580C, #F97316)",
                    color: "white", fontWeight: 700, cursor: isUpdatingPreferences ? "default" : "pointer",
                    fontSize: "0.88rem",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  {isUpdatingPreferences
                    ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Đang lưu...</>
                    : <><Check size={14} /> Đổi Phong Cách &amp; Rời Nhóm</>
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
