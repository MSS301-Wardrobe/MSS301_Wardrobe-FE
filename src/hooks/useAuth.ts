import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { authService } from "../services/authService";
import { useAuthContext } from "../app/providers/AuthProvider";
import type { LoginPayload, RegisterPayload } from "../types/user";

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, logout: ctxLogout } = useAuthContext();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) =>
      authService.login(payload.email, payload.password),
    onSuccess: (data) => {
      const role = data.roles?.[0]?.roleName ?? data.role ?? "USER";
      const normalizedRole = role === "ROLE_ADMIN" || role === "ADMIN" ? "ADMIN" : "USER";

      setUser({
        id: data.id ?? data.userId ?? "",
        email: data.email ?? "",
        name: data.name,
        avatarUrl: data.avatarUrl,
        role: normalizedRole,
      });
      toast.success("Chào mừng trở lại!");
      const dest = normalizedRole === "ADMIN" ? "/admin/dashboard" : "/app/dashboard";
      navigate(dest);
    },
    onError: () => {
      toast.error("Email hoặc mật khẩu không đúng. Vui lòng thử lại.");
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (data) => {
      setUser(data.user);
      toast.success("Tạo tài khoản thành công! Chào mừng đến với StyleAI!");
      navigate("/app/dashboard");
    },
    onError: () => {
      toast.error("Không thể tạo tài khoản. Email có thể đã được sử dụng.");
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: () => {
      toast.success("Mã xác minh đã được gửi đến email của bạn.");
    },
    onError: () => {
      toast.error("Không tìm thấy tài khoản với email này.");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (payload: { email: string; otp: string; newPassword: string }) =>
      authService.resetPassword(payload),
    onSuccess: () => {
      toast.success("Đặt lại mật khẩu thành công!");
      navigate("/login");
    },
    onError: () => {
      toast.error("Mã xác minh không hợp lệ hoặc đã hết hạn.");
    },
  });

  const logout = () => {
    authService.logout();
    ctxLogout();
    navigate("/login");
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegisterLoading: registerMutation.isPending,
    forgotPassword: forgotPasswordMutation.mutate,
    isForgotLoading: forgotPasswordMutation.isPending,
    resetPassword: resetPasswordMutation.mutate,
    isResetLoading: resetPasswordMutation.isPending,
    logout,
  };
}

export default useAuth;
