import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { authService } from "../../services/authService";
import { useAuthContext } from "../../app/providers/AuthProvider";
import type { RoleName, User } from "../../types/user";

export function AuthenticatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuthContext();

  const hasProcessed = useRef(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (hasProcessed.current) {
      return;
    }

    hasProcessed.current = true;

    const processGoogleLogin = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      const errorDescription =
        searchParams.get("error_description");

      if (error) {
        console.error("[GOOGLE LOGIN ERROR]", {
          error,
          errorDescription,
        });

        setUser(null);

        setErrorMessage(
          errorDescription ||
            "Đăng nhập Google không thành công"
        );

        return;
      }

      if (!code) {
        console.error(
          "[GOOGLE LOGIN] Không tìm thấy authorization code"
        );

        setUser(null);
        setErrorMessage(
          "Không tìm thấy mã xác thực từ Keycloak"
        );
        return;
      }

      try {
        // 1. Backend đổi code lấy token và lưu HttpOnly cookies.
        await authService.googleCallback(code);

        // 2. Đồng bộ user Keycloak vào database.
        await authService.syncCurrentUser();

        // 3. Lấy thông tin user chuẩn từ /users/me.
        const data = await authService.me();

        console.log("[GOOGLE CURRENT USER]", data);

        const rawRole =
          data.role ??
          data.roles?.[0]?.roleName ??
          "ROLE_USER";

        const normalizedRole: RoleName =
          rawRole === "ROLE_ADMIN" ||
          rawRole === "ADMIN"
            ? "ADMIN"
            : "USER";

        const userId =
          data.userId ??
          data.id ??
          data.sub ??
          "";

        if (!userId) {
          throw new Error(
            "Không lấy được userId sau khi đăng nhập Google"
          );
        }

        const currentUser: User = {
          id: userId,
          email: data.email ?? "",
          fullName:
            data.fullName ??
            data.name ??
            "",
          avatarUrl:
            data.avatarUrl ?? undefined,
          role: normalizedRole,
        };

        // Quan trọng: cập nhật AuthContext ngay.
        setUser(currentUser);

        navigate(
          normalizedRole === "ADMIN"
            ? "/admin/dashboard"
            : "/app/dashboard",
          { replace: true }
        );
      } catch (error: any) {
        console.error(
          "[GOOGLE CALLBACK PROCESSING FAILED]",
          error
        );

        setUser(null);

        const message =
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          error?.response?.data?.data?.message ||
          "Không thể hoàn tất đăng nhập Google. Vui lòng thử lại.";

        setErrorMessage(message);
      }
    };

    void processGoogleLogin();
  }, [navigate, searchParams, setUser]);

  if (errorMessage) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "#F8FAFC",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            padding: 28,
            borderRadius: 16,
            background: "white",
            textAlign: "center",
            boxShadow:
              "0 12px 32px rgba(15, 23, 42, 0.1)",
          }}
        >
          <h2
            style={{
              color: "#DC2626",
              marginBottom: 12,
            }}
          >
            Đăng nhập thất bại
          </h2>

          <p
            style={{
              color: "#64748B",
              marginBottom: 20,
            }}
          >
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/login", {
                replace: true,
              })
            }
            style={{
              padding: "11px 20px",
              border: "none",
              borderRadius: 10,
              background: "#EA580C",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F8FAFC",
        color: "#475569",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h2
          style={{
            color: "#0F172A",
            marginBottom: 10,
          }}
        >
          Đang đăng nhập
        </h2>

        <p>Đang xử lý tài khoản Google của bạn...</p>
      </div>
    </div>
  );
}