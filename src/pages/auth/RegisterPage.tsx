import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { useAuth } from "../../hooks/useAuth";

export function Register() {
  const navigate = useNavigate();
  const { register, isRegisterLoading } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [agreed, setAgreed] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Mật khẩu không khớp");
      return;
    }
    if (!agreed) {
      toast.error("Vui lòng chấp nhận điều khoản và điều kiện");
      return;
    }
    register({ email: form.email.trim(), password: form.password, name: form.name.trim() });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px 11px 42px",
    border: "1.5px solid #E2E8F0",
    borderRadius: 12,
    fontSize: "0.9rem",
    color: "#0F172A",
    background: "white",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "#EA580C";
    e.target.style.boxShadow = "0 0 0 3px rgba(234,88,12,0.12)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "#E2E8F0";
    e.target.style.boxShadow = "none";
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#374151",
    display: "block",
    marginBottom: 6,
  };

  return (
    <AuthLayout>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>Tạo Tài Khoản</h1>
        <p style={{ color: "#64748B", fontSize: "0.88rem", lineHeight: 1.5 }}>
          Bắt đầu xây dựng tủ đồ thông minh được hỗ trợ bởi AI ngay hôm nay.
        </p>
      </div>

      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Full name */}
        <div>
          <label htmlFor="reg-name" style={labelStyle}>Họ và Tên</label>
          <div style={{ position: "relative" }}>
            <User size={16} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input
              id="reg-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder="Nguyễn Thị Lan"
              required
              style={inputStyle}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="reg-email" style={labelStyle}>Email</label>
          <div style={{ position: "relative" }}>
            <Mail size={16} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input
              id="reg-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder="you@example.com"
              required
              style={inputStyle}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="reg-password" style={labelStyle}>Mật Khẩu</label>
          <div style={{ position: "relative" }}>
            <Lock size={16} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input
              id="reg-password"
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder="Tối thiểu 8 ký tự"
              required
              minLength={8}
              style={{ ...inputStyle, paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}
            >
              {showPw ? <EyeOff size={16} color="#94A3B8" /> : <Eye size={16} color="#94A3B8" />}
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="reg-confirm" style={labelStyle}>Xác Nhận Mật Khẩu</label>
          <div style={{ position: "relative" }}>
            <Lock size={16} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input
              id="reg-confirm"
              type={showConfirm ? "text" : "password"}
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder="Nhập lại mật khẩu"
              required
              style={{ ...inputStyle, paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}
            >
              {showConfirm ? <EyeOff size={16} color="#94A3B8" /> : <Eye size={16} color="#94A3B8" />}
            </button>
          </div>
        </div>

        {/* Terms */}
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ marginTop: 2, accentColor: "#EA580C", width: 15, height: 15 }}
          />
          <span style={{ fontSize: "0.8rem", color: "#64748B", lineHeight: 1.5 }}>
            Tôi đồng ý với{" "}
            <a href="#" style={{ color: "#EA580C", fontWeight: 600 }}>Điều Khoản Dịch Vụ</a>
            {" "}và{" "}
            <a href="#" style={{ color: "#EA580C", fontWeight: 600 }}>Chính Sách Bảo Mật</a>
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={isRegisterLoading}
          style={{
            width: "100%",
            padding: "13px 20px",
            borderRadius: 12,
            border: "none",
            cursor: isRegisterLoading ? "default" : "pointer",
            background: isRegisterLoading ? "#FED7AA" : "linear-gradient(135deg, #EA580C, #F97316)",
            color: "white",
            fontWeight: 700,
            fontSize: "0.95rem",
            marginTop: 2,
            boxShadow: "0 8px 20px rgba(234,88,12,0.25)",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => { if (!isRegisterLoading) e.currentTarget.style.opacity = "0.92"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          {isRegisterLoading ? "Đang tạo tài khoản..." : "Tạo Tài Khoản"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: 16, fontSize: "0.85rem", color: "#64748B" }}>
        Đã có tài khoản?{" "}
        <button
          onClick={() => navigate("/login")}
          style={{ color: "#EA580C", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}
        >
          Đăng nhập
        </button>
      </p>
    </AuthLayout>
  );
}
