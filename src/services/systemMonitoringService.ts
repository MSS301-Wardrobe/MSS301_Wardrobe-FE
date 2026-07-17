import { apiClient } from "./apiClient";

export type HealthStatus =
  | "UP"
  | "DOWN"
  | "DEGRADED"
  | "UNKNOWN";

export interface ServiceHealth {
  name: string;
  serviceId: string;
  url?: string;
  status: HealthStatus;
  responseTimeMs?: number | null;
  message?: string;
}

export interface KafkaHealth {
  status: HealthStatus;
  brokerCount: number;
  consumerGroupCount: number;
  clusterId?: string | null;
  responseTimeMs?: number | null;
  message?: string;
}

export interface SystemHealthResponse {
  overallStatus: HealthStatus;
  checkedAt: string;
  services: ServiceHealth[];
  kafka: KafkaHealth;
}

export const systemMonitoringService = {
  async getSystemHealth(): Promise<SystemHealthResponse> {
    const { data } =
      await apiClient.get<SystemHealthResponse>(
        "/admin/system/health",
      );

    return data;
  },
};