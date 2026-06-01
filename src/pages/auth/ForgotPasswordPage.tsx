import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Zap, ArrowLeft, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "sent">("email");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setStep("sent");
    toast.success(`Link đặt lại đã gửi đến ${email}`);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", fontFamily: "Inter, system-ui, sans-serif", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 440, background: "white", borderRadius: 24, padding: 48, boxShadow: "0 20px 60px rgba(79,70,229,0.10)", border: "1px solid #E2E8F0" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, #4F46E5, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={16} color="white" />
          </div>
          <span style={{ fontWeight: 800, color: "#0F172A" }}>StyleAI</span>
        </div>

        {step === "email" ? (
          <>
            <button
              onClick={() => navigate("/login")}
              style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", background: "none", border: "none", cursor: "pointer", marginBottom: 20, padding: 0, fontSize: "0.85rem" }}
            >
              <ArrowLeft size={15} />
              Quay lại Đăng Nhập
            </button>

            <div style={{ marginBottom: 32 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <Mail size={24} color="#4F46E5" />
              </div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>Quên Mật Khẩu?</h2>
              <p style={{ color: "#64748B", fontSize: "0.9rem", lineHeight: 1.6 }}>
                Đừng lo! Nhập địa chỉ email và chúng tôi sẽ gửi link đặt lại mật khẩu cho bạn.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Địa Chỉ Email</label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    style={{
                      width: "100%", padding: "12px 14px 12px 42px",
                      border: "1.5px solid #E2E8F0", borderRadius: 10,
                      fontSize: "0.9rem", color: "#0F172A", background: "white",
                      outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "13px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: loading ? "#A5B4FC" : "linear-gradient(135deg, #4F46E5, #8B5CF6)",
                  color: "white", fontWeight: 700, fontSize: "0.95rem",
                }}
              >
                {loading ? "Đang gửi..." : "Gửi Link Đặt Lại"}
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <CheckCircle2 size={28} color="#10B981" />
              </div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>Kiểm Tra Email</h2>
              <p style={{ color: "#64748B", fontSize: "0.9rem", lineHeight: 1.6 }}>
                Chúng tôi đã gửi mã xác minh 6 chữ số đến<br />
                <strong style={{ color: "#0F172A" }}>{email}</strong>
              </p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 12, textAlign: "center" }}>Nhập mã xác minh</label>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    style={{
                      width: 46, height: 52, textAlign: "center",
                      border: `2px solid ${digit ? "#4F46E5" : "#E2E8F0"}`,
                      borderRadius: 10, fontSize: "1.1rem", fontWeight: 700,
                      color: "#0F172A", background: "white", outline: "none",
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => { toast.success("Đặt lại mật khẩu thành công!"); navigate("/login"); }}
              style={{
                width: "100%", padding: "13px", borderRadius: 10, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, #4F46E5, #8B5CF6)",
                color: "white", fontWeight: 700, fontSize: "0.95rem", marginBottom: 16,
              }}
            >
              Xác Minh & Đặt Lại Mật Khẩu
            </button>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <span style={{ fontSize: "0.85rem", color: "#64748B" }}>Didn't receive the code?</span>
              <button
                onClick={() => toast.success("Code resent!")}
                style={{ display: "flex", alignItems: "center", gap: 4, color: "#4F46E5", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem" }}
              >
                <RefreshCw size={13} />
                Resend
              </button>
            </div>

            <button
              onClick={() => setStep("email")}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", marginTop: 16, color: "#64748B", background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem" }}
            >
              <ArrowLeft size={15} />
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
