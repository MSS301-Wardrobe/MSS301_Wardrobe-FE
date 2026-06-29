import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "../../components/layout/AuthLayout";
import authService from "../../services/authService";

export function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState = location.state?.email ?? "";

  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }

    if (!otp.trim()) {
      toast.error("Vui lòng nhập mã OTP");
      return;
    }

    try {
      setLoading(true);

      await authService.confirmRegister({
        email: email.trim(),
        otp: otp.trim(),
      });

      toast.success("Xác thực tài khoản thành công! Vui lòng đăng nhập.");

      navigate("/login");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Xác thực OTP thất bại";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      toast.error("Vui lòng nhập email trước khi gửi lại mã");
      return;
    }

    try {
      setResending(true);

      await authService.resendCode(email.trim());

      toast.success("Đã gửi lại mã OTP vào email của bạn");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Gửi lại mã OTP thất bại";

      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    border: "1.5px solid #E2E8F0",
    borderRadius: 12,
    fontSize: "0.95rem",
    color: "#0F172A",
    background: "white",
    outline: "none",
    boxSizing: "border-box",
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
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <MailCheck size={42} color="#EA580C" style={{ marginBottom: 10 }} />
        <h1 style={{ fontSize: "1.55rem", fontWeight: 800, color: "#0F172A" }}>
          Xác Thực Email
        </h1>
        <p style={{ color: "#64748B", fontSize: "0.88rem", lineHeight: 1.5 }}>
          Nhập mã OTP được gửi đến email của bạn.
        </p>
      </div>

      <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Mã OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Nhập mã 6 số"
            maxLength={6}
            required
            style={{
              ...inputStyle,
              textAlign: "center",
              fontSize: "1.2rem",
              letterSpacing: 6,
              fontWeight: 700,
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "13px 20px",
            borderRadius: 12,
            border: "none",
            background: loading ? "#A5B4FC" : "linear-gradient(135deg, #EA580C, #F97316)",
            color: "white",
            fontWeight: 700,
            fontSize: "0.95rem",
            cursor: loading ? "default" : "pointer",
          }}
        >
          {loading ? "Đang xác thực..." : "Xác Thực"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleResend}
        disabled={resending}
        style={{
          width: "100%",
          marginTop: 14,
          background: "none",
          border: "none",
          color: "#EA580C",
          fontWeight: 700,
          cursor: resending ? "default" : "pointer",
        }}
      >
        {resending ? "Đang gửi lại mã..." : "Gửi lại mã OTP"}
      </button>

      <p style={{ textAlign: "center", marginTop: 18, fontSize: "0.85rem", color: "#64748B" }}>
        Đã xác thực rồi?{" "}
        <button
          onClick={() => navigate("/login")}
          style={{
            color: "#EA580C",
            fontWeight: 700,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Đăng nhập
        </button>
      </p>
    </AuthLayout>
  );
}