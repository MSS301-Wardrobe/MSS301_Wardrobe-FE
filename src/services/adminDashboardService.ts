import { apiClient } from "./apiClient";
import type { SystemHealthResponse } from "./systemMonitoringService";

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
  users: KpiMetric;
  clothingItems: KpiMetric;
  detections: KpiMetric;
  recommendations: KpiMetric;
  dailyActivity: DailyActivityPoint[];
  monthlyGrowth: MonthlyGrowthPoint[];
  systemHealth: SystemHealthResponse;
}

export const adminDashboardService = {
  async getOverview(): Promise<AdminDashboardOverview> {
    const { data } = await apiClient.get<AdminDashboardOverview>(
      "/admin/dashboard/overview",
    );
    return data;
  },
};
