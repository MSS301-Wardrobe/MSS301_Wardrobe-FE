import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Mail,
  Zap,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";

export function ForgotPassword() {
  const navigate = useNavigate();

  const {
    forgotPassword,
    isForgotLoading,
    verifyForgotPasswordOtp,
    isVerifyForgotPasswordOtpLoading,
    resetPassword,
    isResetLoading,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    border: "1.5px solid #E2E8F0",
    borderRadius: 10,
    fontSize: "0.9rem",
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

  const getErrorMessage = (error: any, fallback: string) => {
    return (
      error.response?.data?.message ||
      error.response?.data?.data?.message ||
      error.message ||
      fallback
    );
  };

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      toast.error("Vui lòng nhập email");
      return;
    }

    forgotPassword(trimmedEmail, {
      onSuccess: () => {
        toast.success("Đã gửi mã OTP vào email của bạn");
        setOtp(["", "", "", "", "", ""]);
        setResetToken("");
        setStep("otp");
      },
      onError: (error: any) => {
        toast.error(getErrorMessage(error, "Gửi mã OTP thất bại"));
      },
    });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const code = otp.join("");

    if (!trimmedEmail) {
      toast.error("Vui lòng nhập email");
      return;
    }

    if (code.length < 6) {
      toast.error("Vui lòng nhập đủ mã OTP 6 số");
      return;
    }

    verifyForgotPasswordOtp(
      {
        email: trimmedEmail,
        otp: code,
      },
      {
        onSuccess: (data: { resetToken: string }) => {
          setResetToken(data.resetToken);
          toast.success("Xác thực OTP thành công");
          setStep("password");
        },
        onError: (error: any) => {
          toast.error(getErrorMessage(error, "Xác thực OTP thất bại"));
        },
      },
    );
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetToken) {
      toast.error("Phiên đặt lại mật khẩu không hợp lệ. Vui lòng xác thực OTP lại.");
      setStep("otp");
      return;
    }

    if (!newPassword.trim()) {
      toast.error("Vui lòng nhập mật khẩu mới");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    resetPassword(
      {
        resetToken,
        newPassword,
      },
      {
        onSuccess: () => {
          toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập.");
          navigate("/login");
        },
        onError: (error: any) => {
          toast.error(getErrorMessage(error, "Đổi mật khẩu thất bại"));
        },
      },
    );
  };

  const handleResend = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      toast.error("Vui lòng nhập email trước khi gửi lại mã");
      return;
    }

    forgotPassword(trimmedEmail, {
      onSuccess: () => {
        toast.success("Đã gửi lại mã OTP vào email của bạn");
        setOtp(["", "", "", "", "", ""]);
        setResetToken("");
        setStep("otp");
      },
      onError: (error: any) => {
        toast.error(getErrorMessage(error, "Gửi lại mã OTP thất bại"));
      },
    });
  };

  const handleOtpChange = (index: number, value: string) => {
    const onlyNumber = value.replace(/\D/g, "");

    if (onlyNumber.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = onlyNumber;
    setOtp(newOtp);

    if (onlyNumber && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setOtp(["", "", "", "", "", ""]);
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleBackToOtp = () => {
    setStep("otp");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F8FAFC",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "white",
          borderRadius: 24,
          padding: 48,
          boxShadow: "0 20px 60px rgba(234,88,12,0.10)",
          border: "1px solid #E2E8F0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: "linear-gradient(135deg, #EA580C, #F97316)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zap size={16} color="white" />
          </div>
          <span style={{ fontWeight: 800, color: "#0F172A" }}>
            Smart Wardrobe
          </span>
        </div>

        {step === "email" && (
          <>
            <button
              type="button"
              onClick={() => navigate("/login")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "#64748B",
                background: "none",
                border: "none",
                cursor: "pointer",
                marginBottom: 20,
                padding: 0,
                fontSize: "0.85rem",
              }}
            >
              <ArrowLeft size={15} />
              Quay lại đăng nhập
            </button>

            <div style={{ marginBottom: 32 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: "#FFEDD5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <Mail size={24} color="#EA580C" />
              </div>

              <h2
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  color: "#0F172A",
                  marginBottom: 8,
                }}
              >
                Quên mật khẩu?
              </h2>

              <p
                style={{
                  color: "#64748B",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                }}
              >
                Nhập email tài khoản của bạn. Chúng tôi sẽ gửi mã OTP để đặt lại
                mật khẩu.
              </p>
            </div>

            <form
              onSubmit={handleSubmitEmail}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div>
                <label style={labelStyle}>Địa chỉ email</label>

                <div style={{ position: "relative" }}>
                  <Mail
                    size={16}
                    color="#94A3B8"
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    style={{
                      ...inputStyle,
                      paddingLeft: 42,
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isForgotLoading}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: 10,
                  border: "none",
                  cursor: isForgotLoading ? "default" : "pointer",
                  background: isForgotLoading
                    ? "#FED7AA"
                    : "linear-gradient(135deg, #EA580C, #F97316)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                }}
              >
                {isForgotLoading ? "Đang gửi..." : "Gửi mã OTP"}
              </button>
            </form>
          </>
        )}

        {step === "otp" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "#ECFDF5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <CheckCircle2 size={28} color="#10B981" />
              </div>

              <h2
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  color: "#0F172A",
                  marginBottom: 8,
                }}
              >
                Xác thực OTP
              </h2>

              <p
                style={{
                  color: "#64748B",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                }}
              >
                Nhập mã OTP đã gửi đến
                <br />
                <strong style={{ color: "#0F172A" }}>{email}</strong>
              </p>
            </div>

            <form
              onSubmit={handleVerifyOtp}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div>
                <label
                  style={{
                    ...labelStyle,
                    textAlign: "center",
                    marginBottom: 12,
                  }}
                >
                  Mã OTP
                </label>

                <div
                  style={{ display: "flex", gap: 8, justifyContent: "center" }}
                >
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      style={{
                        width: 46,
                        height: 52,
                        textAlign: "center",
                        border: `2px solid ${digit ? "#EA580C" : "#E2E8F0"}`,
                        borderRadius: 10,
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "#0F172A",
                        background: "white",
                        outline: "none",
                      }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  isVerifyForgotPasswordOtpLoading || otp.join("").length < 6
                }
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: 10,
                  border: "none",
                  cursor:
                    isVerifyForgotPasswordOtpLoading || otp.join("").length < 6
                      ? "default"
                      : "pointer",
                  background:
                    isVerifyForgotPasswordOtpLoading || otp.join("").length < 6
                      ? "#FED7AA"
                      : "linear-gradient(135deg, #EA580C, #F97316)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                }}
              >
                {isVerifyForgotPasswordOtpLoading
                  ? "Đang xác thực..."
                  : "Xác thực OTP"}
              </button>
            </form>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                marginTop: 16,
              }}
            >
              <span style={{ fontSize: "0.85rem", color: "#64748B" }}>
                Chưa nhận được mã?
              </span>

              <button
                type="button"
                onClick={handleResend}
                disabled={isForgotLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  color: "#EA580C",
                  fontWeight: 600,
                  background: "none",
                  border: "none",
                  cursor: isForgotLoading ? "default" : "pointer",
                  fontSize: "0.85rem",
                }}
              >
                <RefreshCw size={13} />
                {isForgotLoading ? "Đang gửi..." : "Gửi lại"}
              </button>
            </div>

            <button
              type="button"
              onClick={handleBackToEmail}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                width: "100%",
                marginTop: 16,
                color: "#64748B",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              <ArrowLeft size={15} />
              Quay lại nhập email
            </button>
          </>
        )}

        {step === "password" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "#ECFDF5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <Lock size={28} color="#10B981" />
              </div>

              <h2
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  color: "#0F172A",
                  marginBottom: 8,
                }}
              >
                Đặt lại mật khẩu
              </h2>

              <p
                style={{
                  color: "#64748B",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                }}
              >
                Nhập mật khẩu mới cho tài khoản
                <br />
                <strong style={{ color: "#0F172A" }}>{email}</strong>
              </p>
            </div>

            <form
              onSubmit={handleResetPassword}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div>
                <label style={labelStyle}>Mật khẩu mới</label>

                <div style={{ position: "relative" }}>
                  <Lock
                    size={16}
                    color="#94A3B8"
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    required
                    style={{
                      ...inputStyle,
                      paddingLeft: 42,
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Xác nhận mật khẩu mới</label>

                <div style={{ position: "relative" }}>
                  <Lock
                    size={16}
                    color="#94A3B8"
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    required
                    style={{
                      ...inputStyle,
                      paddingLeft: 42,
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isResetLoading}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: 10,
                  border: "none",
                  cursor: isResetLoading ? "default" : "pointer",
                  background: isResetLoading
                    ? "#FED7AA"
                    : "linear-gradient(135deg, #EA580C, #F97316)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                }}
              >
                {isResetLoading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
              </button>
            </form>

            <button
              type="button"
              onClick={handleBackToOtp}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                width: "100%",
                marginTop: 16,
                color: "#64748B",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              <ArrowLeft size={15} />
              Quay lại nhập OTP
            </button>
          </>
        )}
      </div>
    </div>
  );
}