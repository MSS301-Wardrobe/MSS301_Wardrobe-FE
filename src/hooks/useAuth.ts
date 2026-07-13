import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { authService } from "../services/authService";
import { useAuthContext } from "../app/providers/AuthProvider";
import type {
  LoginPayload,
  RegisterPayload,
  RoleName,
  User,
} from "../types/user";

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    logout: ctxLogout,
  } = useAuthContext();

  const navigate = useNavigate();

  // Demo accounts - used when backend is unavailable
  const DEMO_ACCOUNTS: Record<string, { password: string; role: "ADMIN" | "USER"; name: string }> = {
    "demo@styleai.com":  { password: "demo123",  role: "USER",  name: "Demo User" },
    "admin@styleai.com": { password: "admin123", role: "ADMIN", name: "Admin Demo" },
    "user@styleai.com":  { password: "user123",  role: "USER",  name: "Pham Duc Nguyen" },
  };

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      setUser(null);
      return await authService.login(payload.email, payload.password);

      // Try real backend first
      try {
        return await authService.login(payload.email, payload.password);
      } catch (err: any) {
        // Fallback to demo mode if backend unavailable (network error or 5xx)
        const status = err?.response?.status;
        const isBackendDown = !status || status >= 500;
        if (isBackendDown) {
          const demo = DEMO_ACCOUNTS[payload.email.toLowerCase()];
          if (demo && demo.password === payload.password) {
            return {
              id: "demo-001",
              email: payload.email,
              name: demo.name,
              role: demo.role,
              avatarUrl: undefined,
            } as any;
          }
        }
        throw err;
      }
    },

    onSuccess: (data) => {
      const role = data.role ?? data.roles?.[0]?.roleName ?? "ROLE_USER";

      const normalizedRole: RoleName =
        role === "ROLE_ADMIN" || role === "ADMIN" ? "ADMIN" : "USER";

      const currentUser: User = {
        id: data.userId ?? data.id ?? "",
        email: data.email ?? "",
        fullName: data.fullName,
        avatarUrl: data.avatarUrl ?? undefined,
        role: normalizedRole,
      };

      setUser(currentUser);

      toast.success("Chào mừng trở lại!");

      navigate(
        normalizedRole === "ADMIN" ? "/admin/dashboard" : "/app/dashboard",
        { replace: true },
      );
    },

    onError: () => {
      setUser(null);
      toast.error("Email hoặc mật khẩu không đúng. Vui lòng thử lại.");
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (_data, variables) => {
      toast.success(
        "Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP.",
      );
      navigate("/verify-otp", { state: { email: variables.email } });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Không thể tạo tài khoản. Email có thể đã được sử dụng.";
      toast.error(message);
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: () => {
      toast.success("Mã xác minh đã được gửi đến email của bạn.");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.data?.message ||
        "Không thể gửi mã xác minh.";
      toast.error(message);
    },
  });

  const verifyForgotPasswordOtpMutation = useMutation({
    mutationFn: (payload: { email: string; otp: string }) =>
      authService.verifyForgotPasswordOtp(payload),
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.data?.message ||
        "Mã OTP không hợp lệ hoặc đã hết hạn.";
      toast.error(message);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (payload: {
      resetToken: string;
      newPassword: string;
    }) => authService.resetPassword(payload),
    onSuccess: () => {
      toast.success("Đặt lại mật khẩu thành công!");
      navigate("/login");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.data?.message ||
        "Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.";
      toast.error(message);
    },
  });

  const logout = async () => {
    await ctxLogout();
    navigate("/login");
  };

  return {
    user,
    isAuthenticated,
    isLoading,

    login: loginMutation.mutate,
    isLoginLoading: loginMutation.isPending,

    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegisterLoading: registerMutation.isPending,

    forgotPassword: forgotPasswordMutation.mutate,
    isForgotLoading: forgotPasswordMutation.isPending,

    verifyForgotPasswordOtp: verifyForgotPasswordOtpMutation.mutate,
    isVerifyForgotPasswordOtpLoading: verifyForgotPasswordOtpMutation.isPending,

    resetPassword: resetPasswordMutation.mutate,
    isResetLoading: resetPasswordMutation.isPending,

    logout,
  };
}

export default useAuth;