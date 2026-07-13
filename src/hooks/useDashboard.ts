import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboardService";

export const DASHBOARD_QUERY_KEY = ["dashboard"] as const;

/**
 * useDashboard
 * Fetches all dashboard data from mock services in parallel.
 * Replace dashboardService internals with real API calls when backend is ready.
 */
export function useDashboard() {
  const query = useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: () => dashboardService.fetchDashboardData(),
    staleTime: 2 * 60 * 1000, // 2 minutes cache
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
