import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userService } from "../services/userService";
import { useAuthContext } from "../app/providers/AuthProvider";
import type {
  UpdateUserPayload,
  UserPreferences,
  UserProfile,
} from "../types/user";

export const USER_PROFILE_KEY = ["user", "profile"] as const;
export const USER_PREFERENCES_KEY = ["user", "preferences"] as const;

// Demo fallback data when backend is not available
function buildDemoProfile(user: {
  id: string;
  email: string;
  name?: string;
  role?: string;
}): UserProfile {
  return {
    id: user.id,
    userId: user.id,
    name: user.name ?? "Demo User",
    email: user.email,
    phone: "",
    bio: "Người dùng demo của StyleAI.",
    location: "Hà Nội, Việt Nam",
    dob: "2000-01-01",
    gender: "Nữ",
    fitPreference: "Thường",
  };
}

const DEMO_PREFERENCES: UserPreferences = {
  favoriteColors: ["#000000", "#EA580C", "#FFFFFF"],
  preferredStyles: ["minimal", "business"],
  lifestyles: ["office", "social"],
  clothingInterests: ["Áo Vest", "Đồ Denim", "Giày Dép"],
};

export function useUser() {
  const { isAuthenticated, user } = useAuthContext();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["user", "profile", user?.id ?? user?.email],
    queryFn: async () => {
      try {
        return await userService.getCurrentUser();
      } catch {
        if (user) return buildDemoProfile(user);
        throw new Error("Không thể tải hồ sơ");
      }
    },
    enabled: isAuthenticated && !!user,
    staleTime: 0,
  });

  const preferencesQuery = useQuery({
    queryKey: ["user", "preferences", user?.id ?? user?.email],
    queryFn: async () => {
      try {
        return await userService.getPreferences();
      } catch {
        return DEMO_PREFERENCES;
      }
    },
    enabled: isAuthenticated && !!user,
    staleTime: 0,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (payload: UpdateUserPayload) =>
      userService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
      toast.success("Cập nhật hồ sơ thành công!");
    },
    onError: () => {
      toast.error("Không thể cập nhật hồ sơ. Vui lòng thử lại.");
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (payload: UserPreferences) =>
      userService.updatePreferences(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "preferences"] });
      toast.success(
        "Đã lưu sở thích! AI sẽ cá nhân hóa gợi ý theo sở thích của bạn.",
      );
    },
    onError: () => {
      toast.error("Không thể lưu sở thích. Vui lòng thử lại.");
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_KEY });
      toast.success("Cập nhật ảnh đại diện thành công!");
    },
    onError: () => {
      toast.error("Không thể tải ảnh lên. Vui lòng thử lại.");
    },
  });

  return {
    profile: profileQuery.data,
    isProfileLoading: profileQuery.isLoading,
    preferences: preferencesQuery.data,
    isPreferencesLoading: preferencesQuery.isLoading,
    updateProfile: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isPending,
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
    uploadAvatar: uploadAvatarMutation.mutate,
    isUploadingAvatar: uploadAvatarMutation.isPending,
  };
}

export default useUser;
