import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboardService";
import { useAuthContext } from "../app/providers/AuthProvider";

export const DASHBOARD_QUERY_KEY = ["dashboard"] as const;

/**
 * useDashboard
 * Fetches all dashboard data. Wardrobe count uses real API by userId.
 */
export function useDashboard() {
  const { user } = useAuthContext();
  const userId = user?.userId ?? user?.id ?? "";

  const query = useQuery({
    queryKey: [...DASHBOARD_QUERY_KEY, userId],
    queryFn: () => dashboardService.fetchDashboardData(userId),
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    enabled: !!userId,
  });

  return {
    stats: query.data?.stats,
    clothingDistribution: query.data?.clothingDistribution ?? [],
    growthData: query.data?.growthData ?? [],
    recentUploads: query.data?.recentUploads ?? [],
    aiAccuracyStats: query.data?.aiAccuracyStats ?? [],
    outfitRecommendations: query.data?.outfitRecommendations ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

export default useDashboard;
