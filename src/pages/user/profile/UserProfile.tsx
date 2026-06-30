import { useState, useEffect, useRef } from "react";
import { Camera, Save, User, Ruler, Heart, Loader2 } from "lucide-react";
import { useUser } from "../../../hooks/useUser";
import { useAuthContext } from "../../../app/providers/AuthProvider";

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

const genderToBackend = (gender: string) => {
  switch (gender) {
    case "Nam":
      return "MALE";
    case "Nữ":
      return "FEMALE";
    case "Phi nhị phân":
      return "OTHER";
    case "Không muốn tiết lộ":
      return "OTHER";
    default:
      return undefined;
  }
};

const genderToFrontend = (gender?: string | null) => {
  switch (gender) {
    case "MALE":
      return "Nam";
    case "FEMALE":
      return "Nữ";
    case "OTHER":
      return "Phi nhị phân";
    default:
      return "Nữ";
  }
};

export function UserProfile() {
  const {
    profile,
    isProfileLoading,
    updateProfile,
    isUpdatingProfile,
    isUploadingAvatar,
  } = useUser();

  const {
    user: authUser,
    uploadAvatar,
  } = useAuthContext();

  const avatarUrl = authUser?.avatarUrl || profile?.avatarUrl;
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    dob: "",
    gender: "Nữ",
  });

  const [measurements, setMeasurements] = useState({
    height: "",
    weight: "",
    chest: "",
    waist: "",
    hips: "",
    shoeSize: "",
    fitPreference: "Thường",
  });

  // Populate form when profile loads from API
  useEffect(() => {
    if (!profile) return;

    setForm({
      fullName: profile.fullName ?? "",
      email: profile.email ?? "",
      phone: profile.phoneNumber ?? "",
      bio: profile.notes ?? "",
      location: profile.address ?? "",
      dob: profile.dateOfBirth ?? "",
      gender: genderToFrontend(profile.gender),
    });

    setMeasurements({
      height: profile.height ?? "",
      weight: profile.weight ?? "",
      chest: profile.chest ?? "",
      waist: profile.waist ?? "",
      hips: profile.hips ?? "",
      shoeSize: profile.shoeSize ?? "",
      fitPreference: profile.fitPreference ?? "Thường",
    });
  }, [profile]);

  const handleSave = () => {
    const payload = {
      fullName: form.fullName,
      phoneNumber: form.phone,
      address: form.location,
      dateOfBirth: form.dob,
      gender: genderToBackend(form.gender),
      notes: form.bio,

      height: measurements.height,
      weight: measurements.weight,
      chest: measurements.chest,
      waist: measurements.waist,
      hips: measurements.hips,
      shoeSize: measurements.shoeSize,
      fitPreference: measurements.fitPreference,
    };

    console.log("UPDATE PROFILE PAYLOAD:", payload);

    updateProfile(payload);
  };

  const handleReset = () => {
    if (!profile) return;

    setForm({
      fullName: profile.fullName ?? "",
      email: profile.email ?? "",
      phone: profile.phoneNumber ?? "",
      bio: profile.notes ?? "",
      location: profile.address ?? "",
      dob: profile.dateOfBirth ?? "",
      gender: genderToFrontend(profile.gender),
    });

    setMeasurements({
      height: profile.height ?? "",
      weight: profile.weight ?? "",
      chest: profile.chest ?? "",
      waist: profile.waist ?? "",
      hips: profile.hips ?? "",
      shoeSize: profile.shoeSize ?? "",
      fitPreference: profile.fitPreference ?? "Thường",
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      await uploadAvatar(file);
    } finally {
      e.target.value = "";
    }
  };

  // Derive initials for avatar placeholder
  const initials = form.fullName
    ? form.fullName
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
    : "??";

  if (isProfileLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 300,
          color: "#64748B",
          gap: 10,
        }}
      >
        <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        Đang tải hồ sơ...
      </div>
    );
  }
  return (
    <div
      style={{
        maxWidth: 900,
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* Profile Header Card */}
      <div
        style={{
          background: "white",
          borderRadius: 20,
          border: "1px solid #E2E8F0",
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            height: 120,
            background: "linear-gradient(135deg, #EA580C, #F97316, #FB923C)",
          }}
        />
        <div style={{ padding: "0 32px 28px", position: "relative" }}>
          <div
            style={{
              position: "relative",
              display: "inline-block",
              marginTop: -44,
            }}
          >
            {avatarUrl ? (
              <img
                key={avatarUrl}
                src={avatarUrl}
                alt={form.fullName}
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "4px solid white",
                }}
              />
            ) : (
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #EA580C, #F97316)",
                  border: "4px solid white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.8rem",
                  fontWeight: 800,
                  color: "white",
                }}
              >
                {initials}
              </div>
            )}
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploadingAvatar}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#EA580C",
                border: "2px solid white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              aria-label="Đổi ảnh đại diện"
            >
              {isUploadingAvatar ? (
                <Loader2
                  size={11}
                  color="white"
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <Camera size={12} color="white" />
              )}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <h2
              style={{ fontWeight: 800, color: "#0F172A", fontSize: "1.25rem" }}
            >
              {form.fullName || "Người dùng"}
            </h2>
            <p style={{ color: "#64748B", fontSize: "0.85rem", marginTop: 2 }}>
              {form.email}
            </p>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 12,
                flexWrap: "wrap",
              }}
            >
              {["Yêu Thời Trang", "Khám Phá Phong Cách", "Tối Giản"].map(
                (tag) => (
                  <span
                    key={tag}
                    style={{
                      background: "#FFEDD5",
                      color: "#EA580C",
                      borderRadius: 20,
                      padding: "4px 12px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    {tag}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div
        style={{
          background: "white",
          borderRadius: 20,
          padding: 28,
          border: "1px solid #E2E8F0",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "#FFEDD5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User size={18} color="#EA580C" />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>
              Thông Tin Cá Nhân
            </h3>
            <p style={{ fontSize: "0.78rem", color: "#64748B" }}>
              Cập nhật thông tin cá nhân của bạn
            </p>
          </div>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          {[
            { label: "Họ và Tên", key: "fullName", type: "text" },
            { label: "Địa Chỉ Email", key: "email", type: "email" },
            { label: "Số Điện Thoại", key: "phone", type: "tel" },
            { label: "Địa Điểm", key: "location", type: "text" },
            { label: "Ngày Sinh", key: "dob", type: "date" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#374151",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                {label}
              </label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                style={inputStyle}
              />
            </div>
          ))}
          <div>
            <label
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#374151",
                display: "block",
                marginBottom: 6,
              }}
            >
              Giới Tính
            </label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              style={selectStyle}
            >
              {["Nữ", "Nam", "Phi nhị phân", "Không muốn tiết lộ"].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#374151",
                display: "block",
                marginBottom: 6,
              }}
            >
              Tiểu Sử
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              style={{
                ...inputStyle,
                resize: "vertical",
                fontFamily: "Inter, sans-serif",
              }}
            />
          </div>
        </div>
      </div>

      {/* Body Measurements */}
      <div
        style={{
          background: "white",
          borderRadius: 20,
          padding: 28,
          border: "1px solid #E2E8F0",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "#F5F3FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ruler size={18} color="#F97316" />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>
              Số Đo Cơ Thể
            </h3>
            <p style={{ fontSize: "0.78rem", color: "#64748B" }}>
              Giúp AI gợi ý size phù hợp nhất
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {[
            { label: "Chiều Cao (cm)", key: "height" },
            { label: "Cân Nặng (kg)", key: "weight" },
            { label: "Ngực (cm)", key: "chest" },
            { label: "Eo (cm)", key: "waist" },
            { label: "Hông (cm)", key: "hips" },
            { label: "Cỡ Giày (EU)", key: "shoeSize" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#374151",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                {label}
              </label>
              <input
                type="number"
                value={measurements[key as keyof typeof measurements]}
                onChange={(e) =>
                  setMeasurements({ ...measurements, [key]: e.target.value })
                }
                style={inputStyle}
              />
            </div>
          ))}
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#374151",
                display: "block",
                marginBottom: 10,
              }}
            >
              Sở Thích Kiểu Dáng
            </label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {["Ôm", "Thường", "Rộng Thoải Mái", "Rộng"].map((fit) => (
                <button
                  key={fit}
                  onClick={() =>
                    setMeasurements({ ...measurements, fitPreference: fit })
                  }
                  style={{
                    padding: "8px 18px",
                    borderRadius: 10,
                    border: `1.5px solid ${measurements.fitPreference === fit ? "#EA580C" : "#E2E8F0"}`,
                    background:
                      measurements.fitPreference === fit ? "#FFEDD5" : "white",
                    color:
                      measurements.fitPreference === fit
                        ? "#EA580C"
                        : "#64748B",
                    fontWeight: measurements.fitPreference === fit ? 600 : 400,
                    cursor: "pointer",
                    fontSize: "0.85rem",
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
      <div
        style={{
          background: "white",
          borderRadius: 20,
          padding: 28,
          border: "1px solid #E2E8F0",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "#FFFBEB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Heart size={18} color="#F59E0B" />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>
              Sở Thích Thời Trang
            </h3>
            <p style={{ fontSize: "0.78rem", color: "#64748B" }}>
              Hồ sơ phong cách hiện tại của bạn
            </p>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          <div style={{ background: "#F8FAFC", borderRadius: 12, padding: 16 }}>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#64748B",
                marginBottom: 8,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Phong Cách Ưa Thích
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Tối Giản", "Công Sở", "Thanh Lịch"].map((s) => (
                <span
                  key={s}
                  style={{
                    background: "#FFEDD5",
                    color: "#EA580C",
                    borderRadius: 6,
                    padding: "3px 10px",
                    fontSize: "0.72rem",
                    fontWeight: 500,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div style={{ background: "#F8FAFC", borderRadius: 12, padding: 16 }}>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#64748B",
                marginBottom: 8,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Màu Yêu Thích
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["#0F172A", "#EA580C", "#FFFFFF", "#F59E0B", "#10B981"].map(
                (c) => (
                  <div
                    key={c}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: c,
                      border: "1.5px solid #E2E8F0",
                    }}
                  />
                ),
              )}
            </div>
          </div>
          <div style={{ background: "#F8FAFC", borderRadius: 12, padding: 16 }}>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#64748B",
                marginBottom: 8,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Lối Sống
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Văn Phòng", "Thường Ngày"].map((s) => (
                <span
                  key={s}
                  style={{
                    background: "#FFFBEB",
                    color: "#D97706",
                    borderRadius: 6,
                    padding: "3px 10px",
                    fontSize: "0.72rem",
                    fontWeight: 500,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <button
          onClick={handleReset}
          style={{
            padding: "11px 24px",
            borderRadius: 12,
            border: "1.5px solid #E2E8F0",
            background: "white",
            color: "#0F172A",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Hủy
        </button>
        <button
          onClick={handleSave}
          disabled={isUpdatingProfile}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 24px",
            borderRadius: 12,
            background: isUpdatingProfile
              ? "#FED7AA"
              : "linear-gradient(135deg, #EA580C, #F97316)",
            color: "white",
            border: "none",
            fontWeight: 700,
            cursor: isUpdatingProfile ? "default" : "pointer",
            fontSize: "0.9rem",
          }}
        >
          {isUpdatingProfile ? (
            <>
              <Loader2
                size={15}
                style={{ animation: "spin 1s linear infinite" }}
              />{" "}
              Đang lưu...
            </>
          ) : (
            <>
              <Save size={15} /> Lưu Thay Đổi
            </>
          )}
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
