import { useState, useEffect } from "react";
import { Save, Palette, Shirt, Heart, Star, Loader2 } from "lucide-react";
import { useUser } from "../../../hooks/useUser";

const colorSwatches = [
  { name: "Đen", hex: "#000000" },
  { name: "Trắng", hex: "#FFFFFF" },
  { name: "Xanh Đậm", hex: "#1E3A5F" },
  { name: "Chàm", hex: "#EA580C" },
  { name: "Tím", hex: "#F97316" },
  { name: "Hồng", hex: "#EC4899" },
  { name: "Đỏ", hex: "#EF4444" },
  { name: "Cam", hex: "#F97316" },
  { name: "Vàng", hex: "#F59E0B" },
  { name: "Xanh Lá", hex: "#10B981" },
  { name: "Xanh Mòng Két", hex: "#14B8A6" },
  { name: "Xám", hex: "#94A3B8" },
  { name: "Nâu", hex: "#92400E" },
  { name: "Be", hex: "#D4B896" },
];

const styleOptions = [
  { id: "minimal", label: "Tối Giản", desc: "Gọn gàng, đơn giản, tinh tế", icon: "⬜" },
  { id: "casual", label: "Thường Ngày", desc: "Thoải mái, trang phục hàng ngày", icon: "👕" },
  { id: "business", label: "Công Sở", desc: "Chuyên nghiệp nhưng không cứng nhắc", icon: "👔" },
  { id: "formal", label: "Trang Trọng", desc: "Sắc sảo, bóng bẩy, thanh lịch", icon: "🎩" },
  { id: "streetwear", label: "Đường Phố", desc: "Nổi bật, đô thị, xu hướng", icon: "🧢" },
  { id: "bohemian", label: "Bohemian", desc: "Tự do, phóng khoáng, nghệ thuật", icon: "🌸" },
  { id: "sporty", label: "Thể Thao", desc: "Năng động và thể thao", icon: "🏃" },
  { id: "vintage", label: "Cổ Điển", desc: "Retro, cổ điển, vượt thời gian", icon: "🎞️" },
];

const lifestyles = [
  { id: "office", label: "Văn Phòng / Công Việc", icon: "💼" },
  { id: "student", label: "Cuộc Sống Sinh Viên", icon: "📚" },
  { id: "travel", label: "Du Lịch & Khám Phá", icon: "✈️" },
  { id: "social", label: "Sự Kiện Xã Hội", icon: "🎉" },
  { id: "fitness", label: "Thể Dục & Thể Thao", icon: "💪" },
  { id: "date", label: "Hẹn Hò", icon: "❤️" },
];

const clothingInterests = [
  "Váy", "Áo Vest", "Đồ Denim", "Đồ Len", "Áo Ngoài",
  "Giày Dép", "Túi Xách", "Trang Sức", "Đồng Hồ", "Kính Mát",
  "Đồ Thể Thao", "Đồ Nhà", "Đồ Bơi", "Đồ Lót", "Bộ Vest",
];

export function PreferenceSettings() {
  const { preferences, isPreferencesLoading, updatePreferences, isUpdatingPreferences } = useUser();

  const [selectedColors, setSelectedColors] = useState<string[]>(["#000000", "#EA580C", "#FFFFFF"]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["minimal", "business"]);
  const [selectedLifestyles, setSelectedLifestyles] = useState<string[]>(["office", "social"]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Áo Vest", "Đồ Denim", "Giày Dép"]);

  // Populate from API when loaded
  useEffect(() => {
    if (!preferences) return;
    setSelectedColors(preferences.favoriteColors ?? []);
    setSelectedStyles(preferences.preferredStyles ?? []);
    setSelectedLifestyles(preferences.lifestyles ?? []);
    setSelectedInterests(preferences.clothingInterests ?? []);
  }, [preferences]);

  const toggleColor = (hex: string) => {
    setSelectedColors((prev) => prev.includes(hex) ? prev.filter((c) => c !== hex) : [...prev, hex]);
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

  const handleSave = () => {
    updatePreferences({
      favoriteColors: selectedColors,
      preferredStyles: selectedStyles,
      lifestyles: selectedLifestyles,
      clothingInterests: selectedInterests,
    });
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
    <div style={{ maxWidth: 860, display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #EA580C, #F97316)", borderRadius: 20, padding: "28px 32px", color: "white" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 6 }}>Sở Thích Phong Cách</h2>
        <p style={{ opacity: 0.85, fontSize: "0.9rem", lineHeight: 1.6 }}>
          Hãy cho chúng tôi biết về phong cách của bạn để AI gợi ý trang phục hoàn hảo nhất.
        </p>
      </div>

      {/* Favorite Colors */}
      <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FFEDD5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Palette size={18} color="#EA580C" />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>Màu Yêu Thích</h3>
            <p style={{ fontSize: "0.78rem", color: "#64748B" }}>Chọn màu bạn thích mặc ({selectedColors.length} đã chọn)</p>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {colorSwatches.map((c) => {
            const selected = selectedColors.includes(c.hex);
            return (
              <button
                key={c.hex}
                onClick={() => toggleColor(c.hex)}
                title={c.name}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  background: "none", border: "none", cursor: "pointer", padding: 4,
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", background: c.hex,
                  border: selected ? "3px solid #EA580C" : "2px solid #E2E8F0",
                  boxShadow: selected ? "0 0 0 2px #FFEDD5" : "none",
                  transition: "all 0.15s",
                }} />
                <span style={{ fontSize: "0.65rem", color: "#64748B", whiteSpace: "nowrap" }}>{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preferred Styles */}
      <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shirt size={18} color="#F97316" />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>Phong Cách Ưa Thích</h3>
            <p style={{ fontSize: "0.78rem", color: "#64748B" }}>Phong cách nào định hình tủ đồ của bạn?</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
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
      <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Heart size={18} color="#F59E0B" />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>Lối Sống</h3>
            <p style={{ fontSize: "0.78rem", color: "#64748B" }}>Bạn thường dành thời gian ở đâu nhất?</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
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
      <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Star size={18} color="#10B981" />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>Quan Tâm Trang Phục</h3>
            <p style={{ fontSize: "0.78rem", color: "#64748B" }}>Bạn quan tâm đến loại trang phục nào?</p>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {clothingInterests.map((interest) => {
            const selected = selectedInterests.includes(interest);
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                style={{
                  padding: "7px 16px", borderRadius: 20,
                  border: `1.5px solid ${selected ? "#10B981" : "#E2E8F0"}`,
                  background: selected ? "#ECFDF5" : "white",
                  color: selected ? "#059669" : "#64748B",
                  fontWeight: selected ? 600 : 400,
                  cursor: "pointer", fontSize: "0.85rem", transition: "all 0.15s",
                }}
              >
                {interest}
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
          disabled={isUpdatingPreferences}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "11px 24px", borderRadius: 12,
            background: isUpdatingPreferences ? "#FED7AA" : "linear-gradient(135deg, #EA580C, #F97316)",
            color: "white", border: "none", fontWeight: 700,
            cursor: isUpdatingPreferences ? "default" : "pointer", fontSize: "0.9rem",
          }}
        >
          {isUpdatingPreferences
            ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Đang lưu...</>
            : <><Save size={15} /> Lưu Sở Thích</>
          }
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
