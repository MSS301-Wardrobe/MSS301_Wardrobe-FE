import { apiClient } from "./apiClient";
import type { SystemHealthResponse } from "./systemMonitoringService";

export type DashboardGranularity = "day" | "week" | "month";

export interface KpiMetric {
  total: number;
  thisWeek: number;
  weekTrendPercent: number;
}

export interface DailyActivityPoint {
  date: string;
  dayLabel: string;
  users: number;
  detections: number;
  recommendations: number;
}

export interface MonthlyGrowthPoint {
  month: string;
  monthLabel: string;
  users: number;
  items: number;
}

export interface AdminDashboardOverview {
  generatedAt: string;
  granularity: DashboardGranularity;
  users: KpiMetric;
  clothingItems: KpiMetric;
  detections: KpiMetric;
  recommendations: KpiMetric;
  dailyActivity: DailyActivityPoint[];
  monthlyGrowth: MonthlyGrowthPoint[];
  systemHealth: SystemHealthResponse;
}

export const adminDashboardService = {
  async getOverview(
    granularity: DashboardGranularity = "week",
  ): Promise<AdminDashboardOverview> {
    const { data } = await apiClient.get<AdminDashboardOverview>(
      "/admin/dashboard/overview",
      { params: { granularity } },
    );
    return data;
  },
};
