import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "../../components/layout/AuthLayout";
import {authService} from "../../services/authService"

export function Login() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    setLoading(true);

    const user = await authService.login(email.trim(), password);

    toast.success("Đăng nhập thành công!");

    const role =
      user.roles?.[0]?.roleName ||
      user.role ||
      "USER";

    localStorage.setItem("role", role);

    setTimeout(() => {
      if (role === "ROLE_ADMIN" || role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/app/dashboard");
      }
    }, 500);
  } catch (err: any) {
    toast.error(err.message || "Đăng nhập thất bại");
  } finally {
    setLoading(false);
  }
};
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px 12px 42px",
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
    e.target.style.borderColor = "#4F46E5";
    e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.12)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "#E2E8F0";
    e.target.style.boxShadow = "none";
  };
  const labelStyle: React.CSSProperties = { fontSize: "0.85rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 };

  return (
    <AuthLayout>
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>Chào Mừng Trở Lại</h1>
        <p style={{ color: "#64748B", fontSize: "0.9rem", lineHeight: 1.5 }}>
          Đăng nhập để tiếp tục quản lý tủ đồ thông minh của bạn.
        </p>
      </div>

      {/* Google */}
      <button
        type="button"
        style={{ width: "100%", padding: "12px 20px", border: "1.5px solid #E2E8F0", borderRadius: 12, background: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, color: "#0F172A", transition: "background 0.2s" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#F8FAFC"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "white"; }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Tiếp tục với Google
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
        <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
        <span style={{ fontSize: "0.75rem", color: "#94A3B8", fontWeight: 600 }}>HOẶC</span>
        <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
      </div>

      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Email */}
        <div>
          <label htmlFor="login-email" style={labelStyle}>Email</label>
          <div style={{ position: "relative" }}>
            <Mail size={16} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={onFocus} onBlur={onBlur} placeholder="you@example.com" required style={inputStyle} />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="login-password" style={labelStyle}>Mật Khẩu</label>
          <div style={{ position: "relative" }}>
            <Lock size={16} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input id="login-password" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} onFocus={onFocus} onBlur={onBlur} placeholder="••••••••" required style={{ ...inputStyle, paddingRight: 44 }} />
            <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
              {showPw ? <EyeOff size={16} color="#94A3B8" /> : <Eye size={16} color="#94A3B8" />}
            </button>
          </div>
        </div>

        {/* Remember / Forgot */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.83rem", color: "#475569" }}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ accentColor: "#4F46E5", width: 15, height: 15 }} />
            Ghi nhớ đăng nhập
          </label>
          <button type="button" onClick={() => navigate("/forgot-password")} style={{ fontSize: "0.83rem", color: "#4F46E5", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
            Quên mật khẩu?
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%", padding: "13px 20px", borderRadius: 12, border: "none", cursor: loading ? "default" : "pointer",
            background: loading ? "#A5B4FC" : "linear-gradient(135deg, #4F46E5, #8B5CF6)",
            color: "white", fontWeight: 700, fontSize: "0.95rem", marginTop: 2,
            boxShadow: "0 8px 20px rgba(79,70,229,0.25)", transition: "opacity 0.2s, transform 0.1s",
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.92"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: 22, fontSize: "0.85rem", color: "#64748B" }}>
        Chưa có tài khoản?{" "}
        <button onClick={() => navigate("/register")} style={{ color: "#4F46E5", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>
          Tạo tài khoản
        </button>
      </p>
    </AuthLayout>
  );
}
