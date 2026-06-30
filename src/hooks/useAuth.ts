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

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      // Xóa user cũ trước, tránh màn hình còn hiện an5
      setUser(null);

      // API login đã set cookie và trả về user mới
      return await authService.login(payload.email, payload.password);
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
    onError: () => {
      toast.error("Không tìm thấy tài khoản với email này.");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (payload: {
      email: string;
      otp: string;
      newPassword: string;
    }) => authService.resetPassword(payload),
    onSuccess: () => {
      toast.success("Đặt lại mật khẩu thành công!");
      navigate("/login");
    },
    onError: () => {
      toast.error("Mã xác minh không hợp lệ hoặc đã hết hạn.");
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
    resetPassword: resetPasswordMutation.mutate,
    isResetLoading: resetPasswordMutation.isPending,
    logout,
  };
}

export default useAuth;
