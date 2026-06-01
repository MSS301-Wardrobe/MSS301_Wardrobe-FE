import { useState } from "react";
import { Camera, Save, User, Ruler, Heart } from "lucide-react";
import { toast } from "sonner";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "1.5px solid #E2E8F0",
  borderRadius: 10,
  fontSize: "0.88rem",
  color: "#0F172A",
  background: "white",
  outline: "none",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
};

export function UserProfile() {
  const [profile, setProfile] = useState({
    name: "Jamie Smith",
    email: "jamie@example.com",
    phone: "+1 (555) 234-5678",
    bio: "Người yêu thời trang và chuyên gia có ý thức về phong cách. Thích khám phá thẩm mỹ tối giản và hiện đại.",
    location: "Hà Nội, Việt Nam",
    dob: "1995-06-15",
    gender: "Female",
  });

  const [measurements, setMeasurements] = useState({
    height: "168",
    weight: "62",
    chest: "88",
    waist: "68",
    hips: "94",
    shoeSize: "38",
    fitPreference: "Regular",
  });

  const handleSave = () => {
    toast.success("Cập nhật hồ sơ thành công!");
  };

  return (
    <div style={{ maxWidth: 900, display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Profile Header Card */}
      <div style={{ background: "white", borderRadius: 20, border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ height: 120, background: "linear-gradient(135deg, #4F46E5, #8B5CF6, #C084FC)" }} />
        <div style={{ padding: "0 32px 28px", position: "relative" }}>
          <div style={{ position: "relative", display: "inline-block", marginTop: -44 }}>
            <div style={{
              width: 88, height: 88, borderRadius: "50%",
              background: "linear-gradient(135deg, #4F46E5, #8B5CF6)",
              border: "4px solid white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.8rem", fontWeight: 800, color: "white"
            }}>
              JS
            </div>
            <button style={{
              position: "absolute", bottom: 0, right: 0,
              width: 28, height: 28, borderRadius: "50%",
              background: "#4F46E5", border: "2px solid white",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
            }}>
              <Camera size={12} color="white" />
            </button>
          </div>
          <div style={{ marginTop: 12 }}>
            <h2 style={{ fontWeight: 800, color: "#0F172A", fontSize: "1.25rem" }}>{profile.name}</h2>
            <p style={{ color: "#64748B", fontSize: "0.85rem", marginTop: 2 }}>{profile.email}</p>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              {["Yêu Thời Trang", "Khám Phá Phong Cách", "Tối Giản"].map((tag) => (
                <span key={tag} style={{ background: "#EEF2FF", color: "#4F46E5", borderRadius: 20, padding: "4px 12px", fontSize: "0.75rem", fontWeight: 600 }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={18} color="#4F46E5" />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>Thông Tin Cá Nhân</h3>
            <p style={{ fontSize: "0.78rem", color: "#64748B" }}>Cập nhật thông tin cá nhân của bạn</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { label: "Họ và Tên", key: "name", type: "text" },
            { label: "Địa Chỉ Email", key: "email", type: "email" },
            { label: "Số Điện Thoại", key: "phone", type: "tel" },
            { label: "Địa Điểm", key: "location", type: "text" },
            { label: "Ngày Sinh", key: "dob", type: "date" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
              <input
                type={type}
                value={profile[key as keyof typeof profile]}
                onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                style={inputStyle}
              />
            </div>
          ))}
          <div>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Giới Tính</label>
            <select value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })} style={selectStyle}>
              {["Nữ", "Nam", "Phi nhị phân", "Không muốn tiết lộ"].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Tiểu Sử</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={3}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "Inter, sans-serif" }}
            />
          </div>
        </div>
      </div>

      {/* Body Measurements */}
      <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ruler size={18} color="#8B5CF6" />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>Số Đo Cơ Thể</h3>
            <p style={{ fontSize: "0.78rem", color: "#64748B" }}>Giúp AI gợi ý size phù hợp nhất</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { label: "Chiều Cao (cm)", key: "height" },
            { label: "Cân Nặng (kg)", key: "weight" },
            { label: "Ngực (cm)", key: "chest" },
            { label: "Eo (cm)", key: "waist" },
            { label: "Hông (cm)", key: "hips" },
            { label: "Cỡ Giày (EU)", key: "shoeSize" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
              <input
                type="number"
                value={measurements[key as keyof typeof measurements]}
                onChange={(e) => setMeasurements({ ...measurements, [key]: e.target.value })}
                style={inputStyle}
              />
            </div>
          ))}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 10 }}>Sở Thích Kiểu Dáng</label>
            <div style={{ display: "flex", gap: 10 }}>
              {["Ôm", "Thường", "Rộng Thoải Mái", "Rộng"].map((fit) => (
                <button
                  key={fit}
                  onClick={() => setMeasurements({ ...measurements, fitPreference: fit })}
                  style={{
                    padding: "8px 18px", borderRadius: 10,
                    border: `1.5px solid ${measurements.fitPreference === fit ? "#4F46E5" : "#E2E8F0"}`,
                    background: measurements.fitPreference === fit ? "#EEF2FF" : "white",
                    color: measurements.fitPreference === fit ? "#4F46E5" : "#64748B",
                    fontWeight: measurements.fitPreference === fit ? 600 : 400,
                    cursor: "pointer", fontSize: "0.85rem",
                  }}
                >
                  {fit}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fashion Preferences Summary */}
      <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Heart size={18} color="#F59E0B" />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>Sở Thích Thời Trang</h3>
            <p style={{ fontSize: "0.78rem", color: "#64748B" }}>Hồ sơ phong cách hiện tại của bạn</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <div style={{ background: "#F8FAFC", borderRadius: 12, padding: 16 }}>
            <p style={{ fontSize: "0.75rem", color: "#64748B", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Phong Cách Ưa Thích</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Tối Giản", "Công Sở", "Thanh Lịch"].map((s) => (
                <span key={s} style={{ background: "#EEF2FF", color: "#4F46E5", borderRadius: 6, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 500 }}>{s}</span>
              ))}
            </div>
          </div>
          <div style={{ background: "#F8FAFC", borderRadius: 12, padding: 16 }}>
            <p style={{ fontSize: "0.75rem", color: "#64748B", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Màu Yêu Thích</p>
            <div style={{ display: "flex", gap: 6 }}>
              {["#0F172A", "#4F46E5", "#FFFFFF", "#F59E0B", "#10B981"].map((c) => (
                <div key={c} style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: "1.5px solid #E2E8F0" }} />
              ))}
            </div>
          </div>
          <div style={{ background: "#F8FAFC", borderRadius: 12, padding: 16 }}>
            <p style={{ fontSize: "0.75rem", color: "#64748B", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Lối Sống</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Văn Phòng", "Thường Ngày"].map((s) => (
                <span key={s} style={{ background: "#FFFBEB", color: "#D97706", borderRadius: 6, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 500 }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <button style={{ padding: "11px 24px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "white", color: "#0F172A", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}>
          Hủy
        </button>
        <button
          onClick={handleSave}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 24px", borderRadius: 12, background: "linear-gradient(135deg, #4F46E5, #8B5CF6)", color: "white", border: "none", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" }}
        >
          <Save size={15} />
          Lưu Thay Đổi
        </button>
      </div>
    </div>
  );
}
