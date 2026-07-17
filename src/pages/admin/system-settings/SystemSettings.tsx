import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Database,
  RefreshCw,
  Server,
  Settings,
  WifiOff,
} from "lucide-react";

import {
  systemMonitoringService,
  type HealthStatus,
  type ServiceHealth,
  type SystemHealthResponse,
} from "../../../services/systemMonitoringService";

const statusConfig: Record<
  HealthStatus,
  {
    label: string;
    color: string;
    background: string;
    border: string;
    icon: typeof CheckCircle2;
  }
> = {
  UP: {
    label: "Hoạt động",
    color: "#15803D",
    background: "#DCFCE7",
    border: "#BBF7D0",
    icon: CheckCircle2,
  },
  DOWN: {
    label: "Ngừng hoạt động",
    color: "#B91C1C",
    background: "#FEE2E2",
    border: "#FECACA",
    icon: WifiOff,
  },
  DEGRADED: {
    label: "Không ổn định",
    color: "#C2410C",
    background: "#FFEDD5",
    border: "#FED7AA",
    icon: CircleAlert,
  },
  UNKNOWN: {
    label: "Không xác định",
    color: "#475569",
    background: "#F1F5F9",
    border: "#CBD5E1",
    icon: CircleAlert,
  },
};

function StatusBadge({ status }: { status: HealthStatus }) {
  const config = statusConfig[status] ?? statusConfig.UNKNOWN;
  const Icon = config.icon;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 999,
        background: config.background,
        border: `1px solid ${config.border}`,
        color: config.color,
        fontSize: "0.75rem",
        fontWeight: 700,
      }}
    >
      <Icon size={14} />
      {config.label}
    </div>
  );
}

function ServiceCard({ service }: { service: ServiceHealth }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: 16,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "#EFF6FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Server size={21} color="#2563EB" />
          </div>

          <div>
            <div
              style={{
                color: "#0F172A",
                fontWeight: 750,
                fontSize: "0.95rem",
              }}
            >
              {service.name}
            </div>

            <div
              style={{
                color: "#94A3B8",
                fontSize: "0.75rem",
                marginTop: 3,
              }}
            >
              {service.serviceId}
            </div>
          </div>
        </div>

        <StatusBadge status={service.status} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        <div
          style={{
            background: "#F8FAFC",
            borderRadius: 12,
            padding: 12,
          }}
        >
          <div
            style={{
              color: "#94A3B8",
              fontSize: "0.7rem",
              marginBottom: 5,
            }}
          >
            Thời gian phản hồi
          </div>


          <div
            style={{
              color: "#0F172A",
              fontWeight: 700,
              fontSize: "0.88rem",
            }}
          >
            {service.responseTimeMs != null
              ? `${service.responseTimeMs} ms`
              : "Không có"}
          </div>
        </div>

        <div
          style={{
            background: "#F8FAFC",
            borderRadius: 12,
            padding: 12,
          }}
        >
          <div
            style={{
              color: "#94A3B8",
              fontSize: "0.7rem",
              marginBottom: 5,
            }}
          >
            Trạng thái
          </div>

          <div
            style={{
              color:
                statusConfig[service.status]?.color ??
                statusConfig.UNKNOWN.color,
              fontWeight: 700,
              fontSize: "0.88rem",
            }}
          >
            {statusConfig[service.status]?.label ?? "Không xác định"}
          </div>
        </div>
      </div>

      {service.message && (
        <div
          style={{
            color: "#64748B",
            fontSize: "0.78rem",
            lineHeight: 1.5,
            background: "#F8FAFC",
            borderRadius: 10,
            padding: "10px 12px",
          }}
        >
          {service.message}
        </div>
      )}
    </div>
  );
}

export function SystemSettings() {
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery<SystemHealthResponse, Error>({
    queryKey: ["admin-system-health"],
    queryFn: () =>
      systemMonitoringService.getSystemHealth(),
    refetchInterval: 15_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const kafka = data?.kafka;
  const KafkaIcon =
    kafka?.status === "UP"
      ? CheckCircle2
      : kafka?.status === "DOWN"
        ? WifiOff
        : CircleAlert;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.3rem",
              fontWeight: 800,
              color: "#0F172A",
              marginBottom: 4,
            }}
          >
            Giám Sát Hệ Thống
          </h2>

          <p
            style={{
              color: "#64748B",
              fontSize: "0.85rem",
            }}
          >
            Theo dõi trạng thái microservice và Kafka
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          style={{
            border: "1px solid #CBD5E1",
            background: "#FFFFFF",
            color: "#334155",
            borderRadius: 10,
            padding: "9px 14px",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            cursor: isFetching ? "not-allowed" : "pointer",
            fontWeight: 700,
            fontSize: "0.8rem",
            opacity: isFetching ? 0.7 : 1,
          }}
        >
          <RefreshCw
            size={16}
            style={{
              animation: isFetching
                ? "system-spin 1s linear infinite"
                : "none",
            }}
          />
          Làm mới
        </button>
      </div>

      <style>
        {`
          @keyframes system-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      {isLoading && (
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 16,
            padding: 40,
            textAlign: "center",
            color: "#64748B",
          }}
        >
          Đang kiểm tra trạng thái hệ thống...
        </div>
      )}

      {isError && (
        <div
          style={{
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: 16,
            padding: 20,
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#B91C1C",
          }}
        >
          <CircleAlert size={22} />
          Không thể lấy thông tin giám sát hệ thống.
        </div>
      )}

      {data && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "#64748B",
                  fontSize: "0.78rem",
                  marginBottom: 10,
                }}
              >
                <Activity size={17} />
                Trạng thái tổng thể
              </div>

              <StatusBadge status={data.overallStatus} />
            </div>

            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "#64748B",
                  fontSize: "0.78rem",
                  marginBottom: 10,
                }}
              >
                <Server size={17} />
                Microservice hoạt động
              </div>

              <div
                style={{
                  color: "#0F172A",
                  fontSize: "1.35rem",
                  fontWeight: 800,
                }}
              >
                {
                  data.services.filter(
                    (service) => service.status === "UP",
                  ).length
                }
                /{data.services.length}
              </div>
            </div>

            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "#64748B",
                  fontSize: "0.78rem",
                  marginBottom: 10,
                }}
              >
                <Clock3 size={17} />
                Lần kiểm tra gần nhất
              </div>

              <div
                style={{
                  color: "#0F172A",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                }}
              >
                {new Date(data.checkedAt).toLocaleString("vi-VN")}
              </div>
            </div>
          </div>

          <div>
            <h3
              style={{
                color: "#0F172A",
                fontSize: "1rem",
                fontWeight: 800,
                marginBottom: 14,
              }}
            >
              Trạng thái Microservice
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 16,
              }}
            >
              {data.services.map((service) => (
                <ServiceCard
                  key={service.serviceId}
                  service={service}
                />
              ))}
            </div>
          </div>

          <div>
            <h3
              style={{
                color: "#0F172A",
                fontSize: "1rem",
                fontWeight: 800,
                marginBottom: 14,
              }}
            >
              Trạng thái Kafka
            </h3>

            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: 16,
                padding: 22,
                boxShadow:
                  "0 2px 10px rgba(15, 23, 42, 0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 13,
                      background: "#F3E8FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Database size={23} color="#7E22CE" />
                  </div>

                  <div>
                    <div
                      style={{
                        fontWeight: 800,
                        color: "#0F172A",
                      }}
                    >
                      Apache Kafka
                    </div>

                    <div
                      style={{
                        color: "#94A3B8",
                        fontSize: "0.75rem",
                        marginTop: 3,
                      }}
                    >
                      Message broker
                    </div>
                  </div>
                </div>

                <StatusBadge
                  status={kafka?.status ?? "UNKNOWN"}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    background: "#F8FAFC",
                    borderRadius: 12,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      color: "#94A3B8",
                      fontSize: "0.72rem",
                    }}
                  >
                    Broker
                  </div>

                  <div
                    style={{
                      color: "#0F172A",
                      fontWeight: 800,
                      fontSize: "1.1rem",
                      marginTop: 6,
                    }}
                  >
                    {kafka?.brokerCount ?? 0}
                  </div>
                </div>

                <div
                  style={{
                    background: "#F8FAFC",
                    borderRadius: 12,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      color: "#94A3B8",
                      fontSize: "0.72rem",
                    }}
                  >
                    Consumer groups
                  </div>

                  <div
                    style={{
                      background: "#F8FAFC",
                      borderRadius: 12,
                      padding: 14,
                    }}
                  >
                    <div
                      style={{
                        color: "#94A3B8",
                        fontSize: "0.72rem",
                      }}
                    >
                      Thời gian phản hồi
                    </div>

                    <div
                      style={{
                        color: "#0F172A",
                        fontWeight: 800,
                        fontSize: "1.1rem",
                        marginTop: 6,
                      }}
                    >
                      {kafka?.responseTimeMs != null
                        ? `${kafka.responseTimeMs} ms`
                        : "Không có"}
                    </div>
                  </div>

                  <div
                    style={{
                      color: "#0F172A",
                      fontWeight: 800,
                      fontSize: "1.1rem",
                      marginTop: 6,
                    }}
                  >
                    {kafka?.consumerGroupCount ?? 0}
                  </div>
                </div>
              </div>

              {kafka?.clusterId && (
                <div
                  style={{
                    marginTop: 14,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "#F8FAFC",
                    color: "#64748B",
                    fontSize: "0.76rem",
                    wordBreak: "break-all",
                  }}
                >
                  <strong style={{ color: "#334155" }}>
                    Cluster ID:
                  </strong>{" "}
                  {kafka.clusterId}
                </div>
              )}

              {kafka?.message && (
                <div
                  style={{
                    marginTop: 16,
                    padding: "11px 13px",
                    borderRadius: 10,
                    background:
                      kafka.status === "UP"
                        ? "#F0FDF4"
                        : "#FEF2F2",
                    color:
                      kafka.status === "UP"
                        ? "#166534"
                        : "#B91C1C",
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <KafkaIcon size={17} />
                  {kafka.message}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              background: "#FFF7ED",
              borderRadius: 16,
              padding: 18,
              border: "1px solid #FED7AA",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <Settings size={20} color="#EA580C" />

            <div>
              <div
                style={{
                  color: "#9A3412",
                  fontWeight: 750,
                  fontSize: "0.85rem",
                }}
              >
                Tự động cập nhật
              </div>

              <div
                style={{
                  color: "#C2410C",
                  fontSize: "0.78rem",
                  marginTop: 4,
                  lineHeight: 1.5,
                }}
              >
                Trạng thái hệ thống được tự động kiểm tra lại mỗi
                15 giây.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}