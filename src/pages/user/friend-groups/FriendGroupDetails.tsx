import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Users,
  Crown,
  Sparkles,
  TrendingUp,
  Heart,
  Share2,
  Settings,
  UserPlus,
  Loader2,
  X,
  Trash2,
  UserMinus,
  AlertTriangle,
  UserCheck,
  UserX,
  Clock,
  Package,
} from "lucide-react";
import { useState, useEffect } from "react";

import { toast } from "sonner";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { friendGroupService } from "@/services/friendGroupService";
import { groupSharedApi } from "@/services/wardrobeService";
import { storageService } from "@/services/storageService";
import { ShareOutfitModal } from "@/components/common/ShareOutfitModal";
import type { SharedClothingItem } from "@/types/wardrobe";
import { useAuthContext } from "@/app/providers/AuthProvider";








function getInitials(name?: string | null) {
  if (!name) return "?";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function formatMonthYear(value?: string) {
  if (!value) return "Không rõ";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Không rõ";
  }

  return date.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });
}

function buildRadarData(commonStyles: { label: string; percentage: number }[]) {
  if (!commonStyles || commonStyles.length === 0) {
    return [
      { subject: "Tối Giản", A: 0 },
      { subject: "Công Sở", A: 0 },
      { subject: "Thường Ngày", A: 0 },
      { subject: "Thể Thao", A: 0 },
      { subject: "Cổ Điển", A: 0 },
      { subject: "Đường Phố", A: 0 },
    ];
  }

  return commonStyles.map((item) => ({
    subject: item.label,
    A: item.percentage,
  }));
}

export function FriendGroupDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthContext();
  const currentUserId = currentUser?.id ?? "";
  const [activeTab, setActiveTab] = useState<
    "overview" | "members" | "trends" | "influence"
  >("overview");


  const [inviteOpen, setInviteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [deletingGroup, setDeletingGroup] = useState(false);
  const [joinRequestsOpen, setJoinRequestsOpen] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const [editGroupOpen, setEditGroupOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(false);
  const [editGroupForm, setEditGroupForm] = useState({
    groupName: "",
    description: "",
    emoji: "👗",
  });



  const {
    data: group,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["friend-group-detail", id],
    queryFn: () => friendGroupService.getGroupDetail(id!),
    enabled: !!id,
  });

  const {
    data: joinRequests = [],
    isLoading: isJoinRequestsLoading,
    refetch: refetchJoinRequests,
  } = useQuery({
    queryKey: ["friend-group-join-requests", id],
    queryFn: () => friendGroupService.getGroupJoinRequests(id!),
    enabled: !!id && group?.myRole === "OWNER",
  });

  // Shared outfits trong nhóm — chỉ load khi ở tab trends
  const {
    data: sharedItems = [],
    isLoading: isSharedLoading,
  } = useQuery({
    queryKey: ["group-shared-items", id],
    queryFn: () => groupSharedApi.getSharedItemsByGroup(id!),
    enabled: !!id && activeTab === "trends",
  });

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          color: "#64748B",
        }}
      >
        <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        Đang tải chi tiết nhóm...
      </div>
    );
  }

  if (isError || !group) {
    return (
      <div style={{ maxWidth: 1080, width: "100%" }}>
        <button
          onClick={() => navigate("/app/friend-groups")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#64748B",
            background: "none",
            border: "none",
            cursor: "pointer",
            marginBottom: 20,
            fontSize: "0.875rem",
          }}
        >
          <ArrowLeft size={16} />
          Quay Lại Nhóm Bạn
        </button>

        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 24,
            border: "1px solid #E2E8F0",
            color: "#EF4444",
            fontWeight: 600,
          }}
        >
          Không thể tải chi tiết nhóm.
        </div>
      </div>
    );
  }

  const radarData = buildRadarData(group.commonStyles ?? []);
  const isOwner = group.myRole === "OWNER";
  const pendingJoinRequestCount = joinRequests.length;

  const handleInviteMember = async () => {
    const email = inviteEmail.trim();

    if (!email) {
      toast.error("Vui lòng nhập email người muốn mời");
      return;
    }

    try {
      // TODO: khi BE có API thì mở dòng này
      await friendGroupService.inviteMember(group.groupId, { email });

      toast.success(`Đã gửi lời mời đến ${email}`);
      setInviteEmail("");
      setInviteOpen(false);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Mời thành viên thất bại";
      toast.error(message);
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm("Bạn có chắc muốn giải tán nhóm này không?")) {
      return;
    }

    try {
      setDeletingGroup(true);

      // TODO: khi BE có API thì mở dòng này
      await friendGroupService.deleteGroup(group.groupId);

      toast.success("Đã giải tán nhóm");
      navigate("/app/friend-groups");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Giải tán nhóm thất bại";
      toast.error(message);
    } finally {
      setDeletingGroup(false);
    }
  };

  const handleKickMember = async (memberId: string, memberName: string) => {
    if (!window.confirm(`Bạn có chắc muốn kích ${memberName} khỏi nhóm không?`)) {
      return;
    }

    try {
      // TODO: khi BE có API thì mở dòng này
      await friendGroupService.kickMember(group.groupId, memberId);

      toast.success(`Đã kích ${memberName} khỏi nhóm`);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Kích thành viên thất bại";
      toast.error(message);
    }
  };

  const handleAcceptJoinRequest = async (requestId: string) => {
    try {
      setProcessingRequestId(requestId);

      await friendGroupService.acceptJoinRequest(requestId);

      toast.success("Đã chấp nhận yêu cầu tham gia");

      await refetchJoinRequests();

      queryClient.invalidateQueries({
        queryKey: ["friend-group-detail", id],
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.data?.message ||
        error?.message ||
        "Chấp nhận yêu cầu thất bại";

      toast.error(message);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectJoinRequest = async (requestId: string) => {
    try {
      setProcessingRequestId(requestId);

      await friendGroupService.rejectJoinRequest(requestId);

      toast.success("Đã từ chối yêu cầu tham gia");

      await refetchJoinRequests();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.data?.message ||
        error?.message ||
        "Từ chối yêu cầu thất bại";

      toast.error(message);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const openEditGroupModal = () => {
    setEditGroupForm({
      groupName: group.groupName ?? "",
      description: group.description ?? "",
      emoji: group.emoji ?? "👗",
    });

    setSettingsOpen(false);
    setEditGroupOpen(true);
  };

  const handleUpdateGroup = async () => {
    if (!editGroupForm.groupName.trim()) {
      toast.error("Vui lòng nhập tên nhóm");
      return;
    }

    try {
      setEditingGroup(true);

      await friendGroupService.updateGroup(group.groupId, {
        groupName: editGroupForm.groupName.trim(),
        description: editGroupForm.description.trim(),
        emoji: editGroupForm.emoji,
      });

      toast.success("Đã cập nhật thông tin nhóm");

      setEditGroupOpen(false);

      queryClient.invalidateQueries({
        queryKey: ["friend-group-detail", id],
      });

      queryClient.invalidateQueries({
        queryKey: ["friend-groups"],
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.data?.message ||
        error?.message ||
        "Cập nhật nhóm thất bại";

      toast.error(message);
    } finally {
      setEditingGroup(false);
    }
  };

  return (
    <div style={{ maxWidth: 960 }}>
      <button
        onClick={() => navigate("/app/friend-groups")}
        style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", background: "none", border: "none", cursor: "pointer", marginBottom: 20, fontSize: "0.875rem" }}
      >
        <ArrowLeft size={16} />
        Quay Lại Nhóm Bạn
      </button>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #EA580C, #F97316)", borderRadius: 20, padding: "28px 32px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>
            {group.emoji ?? "👥"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white" }}>{group.groupName}</h2>
              <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 6, padding: "3px 10px", display: "flex", alignItems: "center", gap: 4 }}>
                <Crown size={11} color="rgba(255,255,255,0.9)" />
                <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>
                  {group.myRole === "OWNER"
                    ? "Chủ Nhóm"
                    : group.myRole === "ADMIN"
                      ? "Quản Trị Viên"
                      : "Thành Viên"}
                </span>
              </div>
            </div>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.875rem", lineHeight: 1.6, maxWidth: 560 }}>{group.description || "Nhóm chưa có mô tả."}</p>
            <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
              {[
                { label: "Thành Viên", value: group.memberCount },
                { label: "Phong Cách Chủ Đạo", value: group.primaryStyleLabels?.length ? group.primaryStyleLabels.join(", ") : "Chưa rõ" },
                { label: "Trạng Thái", value: group.status ?? "Hoạt Động" },
                { label: "Thành Lập", value: formatMonthYear(group.createdAt) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "white" }}>{value}</p>
                  <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.65)" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
          {isOwner && (
            <div style={{ display: "flex", gap: 8, position: "relative" }}>
              <button
                onClick={() => setInviteOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 16px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.15)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.25)",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                }}
              >
                <UserPlus size={14} />
                Mời
              </button>

              <button
                onClick={() => setSettingsOpen(true)}
                style={{
                  position: "relative",
                  padding: "9px 12px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  cursor: "pointer",
                }}
              >
                <Settings size={15} color="white" />

                {pendingJoinRequestCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -7,
                      right: -7,
                      minWidth: 20,
                      height: 20,
                      padding: "0 6px",
                      borderRadius: 999,
                      background: "#EF4444",
                      color: "white",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid #F97316",
                      boxSizing: "border-box",
                    }}
                  >
                    {pendingJoinRequestCount > 99 ? "99+" : pendingJoinRequestCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "white", borderRadius: 14, padding: 4, border: "1px solid #E2E8F0", width: "fit-content" }}>
        {([
          { id: "overview", label: "Tổng Quan" },
          { id: "members", label: `Thành Viên (${group.memberCount})` },
          { id: "trends", label: "Xu Hướng Trang Phục" },
          { id: "influence", label: "Ảnh Hưởng Gợi Ý" },
        ] as const).map(({ id: tabId, label }) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            style={{
              padding: "8px 18px", borderRadius: 10, border: "none", cursor: "pointer",
              background: activeTab === tabId ? "#EA580C" : "transparent",
              color: activeTab === tabId ? "white" : "#64748B",
              fontWeight: activeTab === tabId ? 700 : 400, fontSize: "0.85rem", whiteSpace: "nowrap",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Shared Styles */}
          <div style={{ background: "white", borderRadius: 18, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 18, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={16} color="#EA580C" />
              Sở Thích Phong Cách Chung
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {(group.commonStyles ?? []).map((s) => (
                <div key={s.styleName}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "#374151" }}>
                      {s.label}
                    </span>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#EA580C" }}>
                      {s.percentage}%
                    </span>
                  </div>
                  <div style={{ background: "#F1F5F9", borderRadius: 100, height: 6 }}>
                    <div
                      style={{
                        width: `${s.percentage}%`,
                        background: "linear-gradient(90deg, #EA580C, #F97316)",
                        borderRadius: 100,
                        height: "100%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Style Radar */}
          <div style={{ background: "white", borderRadius: 18, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={16} color="#F97316" />
              Đặc Trưng Phong Cách Nhóm
            </h3>
            <p style={{ fontSize: "0.78rem", color: "#64748B", marginBottom: 8 }}>Phân bố phong cách trung bình của tất cả thành viên</p>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#94A3B8" }} />
                <Radar dataKey="A" stroke="#EA580C" fill="#EA580C" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: "0.8rem" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Shared Colors */}
          <div style={{ background: "white", borderRadius: 18, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 16, fontSize: "0.95rem" }}>Bảng Màu Nhóm</h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {(group.colorPalette ?? []).map((c) => (
                <div key={c} style={{ textAlign: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: c, border: "1.5px solid #E2E8F0", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }} />
                  <p style={{ fontSize: "0.6rem", color: "#94A3B8", marginTop: 4 }}>{c}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick member preview */}
          <div style={{ background: "white", borderRadius: 18, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
              <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem" }}>Thành Viên Tích Cực</h3>
              <button onClick={() => setActiveTab("members")} style={{ fontSize: "0.8rem", color: "#EA580C", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>Xem tất cả</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(group.activeMembers ?? []).slice(0, 4).map((m, index) => (
                <div
                  key={m.userId}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: ["#EA580C", "#F97316", "#10B981", "#F59E0B", "#EF4444"][index % 5],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      flexShrink: 0,
                      overflow: "hidden",
                    }}
                  >
                    {m.avatarUrl ? (
                      <img
                        src={m.avatarUrl}
                        alt={m.fullName}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      getInitials(m.fullName)
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0F172A" }}>
                      {m.fullName}
                    </p>
                    <p style={{ fontSize: "0.72rem", color: "#64748B" }}>
                      {m.mainStyleLabel ?? "Chưa có phong cách"}
                    </p>
                  </div>

                  {(m.role === "OWNER" || m.role === "ADMIN") && (
                    <Crown size={14} color="#F59E0B" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "members" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          {(group.members ?? []).map((m, index) => (
            <div
              key={m.userId}
              style={{
                background: "white",
                borderRadius: 16,
                padding: "18px 20px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: [
                      "#EA580C",
                      "#F97316",
                      "#10B981",
                      "#F59E0B",
                      "#EF4444",
                    ][index % 5],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {m.avatarUrl ? (
                    <img
                      src={m.avatarUrl}
                      alt={m.fullName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    getInitials(m.fullName)
                  )}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 700,
                        color: "#0F172A",
                        fontSize: "0.9rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {m.fullName}
                    </p>

                    {(m.role === "OWNER" || m.role === "ADMIN") && (
                      <Crown size={13} color="#F59E0B" />
                    )}
                  </div>

                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "#64748B",
                      marginTop: 2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {m.email}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div
                  style={{
                    background: "#F8FAFC",
                    borderRadius: 10,
                    padding: "8px 12px",
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "1rem",
                      fontWeight: 800,
                      color: "#0F172A",
                    }}
                  >
                    {m.role === "OWNER"
                      ? "Chủ nhóm"
                      : m.role === "ADMIN"
                        ? "Admin"
                        : "Member"}
                  </p>
                  <p style={{ fontSize: "0.65rem", color: "#64748B" }}>
                    Vai Trò
                  </p>
                </div>

                <div style={{ width: 10 }} />

                <div
                  style={{
                    background: "#FFEDD5",
                    borderRadius: 10,
                    padding: "8px 12px",
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "1rem",
                      fontWeight: 800,
                      color: "#EA580C",
                    }}
                  >
                    {formatMonthYear(m.joinedAt)}
                  </p>
                  <p style={{ fontSize: "0.65rem", color: "#64748B" }}>
                    Tham Gia
                  </p>
                </div>
              </div>

              {isOwner && m.role !== "OWNER" && (
                <button
                  type="button"
                  onClick={() =>
                    handleKickMember(m.memberId ?? m.userId, m.fullName)
                  }
                  style={{
                    width: "100%",
                    marginTop: 12,
                    padding: "9px 12px",
                    borderRadius: 10,
                    border: "1px solid #FECACA",
                    background: "#FEF2F2",
                    color: "#DC2626",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <UserMinus size={14} />
                  Kích khỏi nhóm
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "trends" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              background: "white",
              borderRadius: 18,
              padding: "18px 20px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: "#0F172A",
                  marginBottom: 4,
                }}
              >
                Xu hướng trang phục trong nhóm
              </h3>

              <p
                style={{
                  color: "#64748B",
                  fontSize: "0.82rem",
                  lineHeight: 1.5,
                }}
              >
                Các bộ trang phục được thành viên chia sẻ và yêu thích nhiều nhất.
              </p>
            </div>

            {/* Chỉ hiện nút Share nếu user đã là member của nhóm (có myRole) */}
            {group.myRole && (
              <button
                type="button"
                onClick={() => setShareModalOpen(true)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg, #EA580C, #F97316)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <Share2 size={15} />
                Chia sẻ outfit
              </button>
            )}
          </div>

          {isSharedLoading ? (
            <div
              style={{
                background: "white",
                borderRadius: 18,
                padding: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                color: "#64748B",
                border: "1px solid #E2E8F0",
              }}
            >
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              Đang tải...
            </div>
          ) : sharedItems.length === 0 ? (
            <div
              style={{
                background: "white",
                borderRadius: 18,
                padding: 36,
                border: "1px dashed #CBD5E1",
                textAlign: "center",
                color: "#64748B",
              }}
            >
              <Sparkles size={28} color="#EA580C" style={{ marginBottom: 10 }} />

              <p
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "#0F172A",
                  marginBottom: 4,
                }}
              >
                Chưa có trang phục nào được chia sẻ
              </p>

              <p style={{ fontSize: "0.82rem" }}>
                Hãy là người đầu tiên chia sẻ outfit vào nhóm này.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: 18,
              }}
            >
              {sharedItems.map((outfit) => (
                <SharedOutfitCard
                  key={outfit.shareId}
                  outfit={outfit}
                  isOwner={outfit.sharedByUserId === currentUserId}
                  onUnshare={async () => {
                    try {
                      await groupSharedApi.unshareItem(outfit.shareId);
                      queryClient.invalidateQueries({ queryKey: ["group-shared-items", id] });
                      toast.success("Đã hủy chia sẻ");
                    } catch (err: any) {
                      toast.error(err?.response?.data?.message || "Hủy chia sẻ thất bại");
                    }
                  }}
                  onLikeToggled={(_shareId, _liked) => {
                    // Không cần invalidate vì optimistic update đã handle trong component
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "influence" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Banner giải thích */}
          <div style={{ background: "linear-gradient(135deg, #FFEDD5, #F5F3FF)", borderRadius: 18, padding: 24, border: "1px solid #FED7AA" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Sparkles size={18} color="#EA580C" />
              <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>Nhóm Này Ảnh Hưởng Đến Gợi Ý Của Bạn Như Thế Nào</h3>
            </div>
            <p style={{ color: "#64748B", fontSize: "0.875rem", lineHeight: 1.7 }}>
              AI phân tích sở thích chung, trang phục phổ biến và mẫu hoạt động trong nhóm để tinh chỉnh gợi ý trang phục cá nhân của bạn. Nhóm có độ phù hợp phong cách cao hơn sẽ có mức độ ảnh hưởng mạnh hơn.
            </p>

            {/* Tổng ảnh hưởng: tính từ commonStyles */}
            {(() => {
              const styles = group.commonStyles ?? [];
              // Tổng % là trung bình các style, tối đa 100
              const total = styles.length > 0
                ? Math.min(Math.round(styles.reduce((s, x) => s + (x.percentage ?? 0), 0) / styles.length), 100)
                : 0;
              return (
                <div style={{ marginTop: 16, background: "white", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <p style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 500 }}>Mức Độ Ảnh Hưởng Nhóm</p>
                    <p style={{ fontSize: "1.4rem", fontWeight: 800, color: "#EA580C" }}>
                      {styles.length === 0 ? "--" : `${total}%`}
                    </p>
                  </div>
                  <div style={{ flex: 1, background: "#F1F5F9", borderRadius: 100, height: 10 }}>
                    <div style={{ width: `${total}%`, background: "linear-gradient(90deg, #EA580C, #F97316)", borderRadius: 100, height: "100%", transition: "width 0.8s ease" }} />
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#64748B", whiteSpace: "nowrap" }}>trên tổng trọng số AI</span>
                </div>
              );
            })()}
          </div>

          {/* Phân tích theo từng phong cách từ API */}
          {(group.commonStyles ?? []).length === 0 ? (
            <div style={{ background: "white", borderRadius: 18, padding: 36, border: "1px dashed #CBD5E1", textAlign: "center", color: "#64748B" }}>
              <TrendingUp size={28} color="#EA580C" style={{ marginBottom: 10, opacity: 0.5 }} />
              <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>Chưa có dữ liệu phân tích</p>
              <p style={{ fontSize: "0.82rem" }}>Nhóm cần có ít nhất 2 thành viên để bắt đầu phân tích xu hướng phong cách.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              {(group.commonStyles ?? []).map((item, idx) => {
                const PALETTE = ["#EA580C", "#F97316", "#F59E0B", "#10B981", "#6366F1", "#EC4899"];
                const color = PALETTE[idx % PALETTE.length];
                return (
                  <div key={item.styleName} style={{ background: "white", borderRadius: 16, padding: "18px 20px", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0F172A" }}>{item.label ?? item.styleName}</p>
                      <span style={{ fontSize: "0.9rem", fontWeight: 800, color }}>{item.percentage ?? 0}%</span>
                    </div>
                    <div style={{ background: "#F1F5F9", borderRadius: 100, height: 8 }}>
                      <div style={{ width: `${item.percentage ?? 0}%`, background: color, borderRadius: 100, height: "100%", transition: "width 0.6s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Màu sắc nhóm nếu có */}
          {(group.colorPalette ?? []).length > 0 && (
            <div style={{ background: "white", borderRadius: 18, padding: "18px 22px", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A", marginBottom: 12 }}>Bảng Màu Đặc Trưng Nhóm</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {(group.colorPalette ?? []).map((color) => (
                  <div
                    key={color}
                    title={color}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: color,
                      border: "2px solid white",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      cursor: "default",
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {inviteOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              background: "white",
              borderRadius: 18,
              padding: 22,
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0F172A" }}>
                Mời thành viên
              </h3>

              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                style={{
                  border: "none",
                  background: "#F8FAFC",
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: "0.85rem", color: "#64748B", marginBottom: 14 }}>
              Nhập email người bạn muốn mời vào nhóm.
            </p>

            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="friend@example.com"
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1.5px solid #E2E8F0",
                borderRadius: 12,
                fontSize: "0.9rem",
                outline: "none",
                boxSizing: "border-box",
                marginBottom: 16,
              }}
            />

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #E2E8F0",
                  background: "white",
                  color: "#64748B",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleInviteMember}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg, #EA580C, #F97316)",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Gửi lời mời
              </button>
            </div>
          </div>
        </div>
      )}

      {editGroupOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 460,
              background: "white",
              borderRadius: 18,
              padding: 22,
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 800,
                    color: "#0F172A",
                  }}
                >
                  Chỉnh sửa thông tin nhóm
                </h3>

                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#64748B",
                    marginTop: 3,
                  }}
                >
                  Cập nhật tên, mô tả và biểu tượng nhóm.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditGroupOpen(false)}
                style={{
                  border: "none",
                  background: "#F8FAFC",
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "#374151",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Biểu tượng nhóm
                </label>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["👗", "👔", "🎯", "🔥", "👑", "⚡", "🌸", "🎞️", "💼", "🌊"].map(
                    (emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() =>
                          setEditGroupForm((prev) => ({
                            ...prev,
                            emoji,
                          }))
                        }
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background:
                            editGroupForm.emoji === emoji ? "#FFEDD5" : "#F8FAFC",
                          border:
                            editGroupForm.emoji === emoji
                              ? "1.5px solid #EA580C"
                              : "1.5px solid #E2E8F0",
                          fontSize: "1.2rem",
                          cursor: "pointer",
                        }}
                      >
                        {emoji}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "#374151",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Tên nhóm *
                </label>

                <input
                  type="text"
                  value={editGroupForm.groupName}
                  onChange={(e) =>
                    setEditGroupForm((prev) => ({
                      ...prev,
                      groupName: e.target.value,
                    }))
                  }
                  placeholder="Nhập tên nhóm"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: 12,
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "#374151",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Mô tả
                </label>

                <textarea
                  rows={3}
                  value={editGroupForm.description}
                  onChange={(e) =>
                    setEditGroupForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Nhập mô tả nhóm"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: 12,
                    fontSize: "0.88rem",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 20,
              }}
            >
              <button
                type="button"
                onClick={() => setEditGroupOpen(false)}
                disabled={editingGroup}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #E2E8F0",
                  background: "white",
                  color: "#64748B",
                  fontWeight: 700,
                  cursor: editingGroup ? "default" : "pointer",
                }}
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleUpdateGroup}
                disabled={editingGroup}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: editingGroup
                    ? "#FED7AA"
                    : "linear-gradient(135deg, #EA580C, #F97316)",
                  color: "white",
                  fontWeight: 800,
                  cursor: editingGroup ? "default" : "pointer",
                }}
              >
                {editingGroup ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 440,
              background: "white",
              borderRadius: 18,
              padding: 22,
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0F172A" }}>
                Cài đặt nhóm
              </h3>

              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                style={{
                  border: "none",
                  background: "#F8FAFC",
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setSettingsOpen(false);
                setJoinRequestsOpen(true);
              }}
              style={{
                position: "relative",
                overflow: "visible",
                width: "100%",
                padding: "14px 14px",
                minHeight: 56,
                borderRadius: 12,
                border: "1px solid #E2E8F0",
                background: "white",
                color: "#0F172A",
                fontWeight: 700,
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                boxSizing: "border-box",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  minWidth: 0,
                }}
              >
                <UserCheck size={16} color="#EA580C" />
                <span>Yêu cầu tham gia</span>
              </span>

              {pendingJoinRequestCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -7,
                    right: -7,
                    minWidth: 22,
                    height: 22,
                    padding: "0 7px",
                    borderRadius: 999,
                    background: "#EF4444",
                    color: "white",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid white",
                    boxSizing: "border-box",
                    boxShadow: "0 2px 6px rgba(239,68,68,0.35)",
                  }}
                >
                  {pendingJoinRequestCount > 99 ? "99+" : pendingJoinRequestCount}
                </span>
              )}
            </button>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginTop: 10,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setSettingsOpen(false);
                  setActiveTab("members");
                }}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #E2E8F0",
                  background: "white",
                  color: "#0F172A",
                  fontWeight: 700,
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Users size={16} color="#EA580C" />
                Quản lý thành viên
              </button>

              <button
                type="button"
                onClick={openEditGroupModal}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #E2E8F0",
                  background: "white",
                  color: "#0F172A",
                  fontWeight: 700,
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Settings size={16} color="#EA580C" />
                Chỉnh sửa thông tin nhóm
              </button>

              <button
                type="button"
                onClick={handleDeleteGroup}
                disabled={deletingGroup}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #FECACA",
                  background: "#FEF2F2",
                  color: "#DC2626",
                  fontWeight: 800,
                  cursor: deletingGroup ? "default" : "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Trash2 size={16} />
                {deletingGroup ? "Đang giải tán..." : "Giải tán nhóm"}
              </button>
            </div>

            <div
              style={{
                marginTop: 16,
                padding: 12,
                borderRadius: 12,
                background: "#FFFBEB",
                border: "1px solid #FDE68A",
                display: "flex",
                gap: 8,
                color: "#92400E",
                fontSize: "0.8rem",
                lineHeight: 1.5,
              }}
            >
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              Chỉ chủ nhóm mới có quyền mời, kích thành viên và giải tán nhóm.
            </div>
          </div>
        </div>
      )}

      {joinRequestsOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 560,
              background: "white",
              borderRadius: 18,
              padding: 22,
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0F172A" }}>
                  Yêu cầu tham gia
                </h3>
                <p style={{ fontSize: "0.8rem", color: "#64748B", marginTop: 3 }}>
                  Duyệt người dùng muốn tham gia nhóm này
                </p>
              </div>

              <button
                type="button"
                onClick={() => setJoinRequestsOpen(false)}
                style={{
                  border: "none",
                  background: "#F8FAFC",
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {isJoinRequestsLoading ? (
              <div
                style={{
                  padding: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  color: "#64748B",
                }}
              >
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                Đang tải yêu cầu...
              </div>
            ) : joinRequests.length === 0 ? (
              <div
                style={{
                  padding: 24,
                  borderRadius: 14,
                  background: "#F8FAFC",
                  border: "1px dashed #CBD5E1",
                  textAlign: "center",
                  color: "#64748B",
                  fontSize: "0.88rem",
                }}
              >
                Hiện chưa có yêu cầu tham gia nào.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {joinRequests.map((request) => {
                  const isProcessing = processingRequestId === request.requestId;

                  return (
                    <div
                      key={request.requestId}
                      style={{
                        border: "1px solid #E2E8F0",
                        borderRadius: 14,
                        padding: 14,
                        background: "white",
                      }}
                    >
                      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            background: "#EA580C",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            overflow: "hidden",
                            flexShrink: 0,
                          }}
                        >
                          {request.requesterAvatarUrl ? (
                            <img
                              src={request.requesterAvatarUrl}
                              alt={request.requesterName}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            getInitials(request.requesterName)
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 10,
                              alignItems: "flex-start",
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <p
                                style={{
                                  fontSize: "0.9rem",
                                  fontWeight: 800,
                                  color: "#0F172A",
                                }}
                              >
                                {request.requesterName}
                              </p>

                              <p
                                style={{
                                  fontSize: "0.75rem",
                                  color: "#64748B",
                                  marginTop: 2,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {request.requesterEmail}
                              </p>
                            </div>

                            {request.previouslyKicked && (
                              <span
                                style={{
                                  background: "#FEF2F2",
                                  color: "#DC2626",
                                  borderRadius: 999,
                                  padding: "3px 8px",
                                  fontSize: "0.68rem",
                                  fontWeight: 800,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                Từng bị kick
                              </span>
                            )}
                          </div>

                          {request.message && (
                            <p
                              style={{
                                marginTop: 10,
                                fontSize: "0.8rem",
                                color: "#475569",
                                lineHeight: 1.5,
                                background: "#F8FAFC",
                                borderRadius: 10,
                                padding: "8px 10px",
                              }}
                            >
                              “{request.message}”
                            </p>
                          )}

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              marginTop: 10,
                              color: "#94A3B8",
                              fontSize: "0.72rem",
                            }}
                          >
                            <Clock size={12} />
                            Gửi lúc{" "}
                            {request.createdAt
                              ? new Date(request.createdAt).toLocaleString("vi-VN")
                              : "không rõ"}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 8,
                              marginTop: 12,
                            }}
                          >
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleRejectJoinRequest(request.requestId)}
                              style={{
                                padding: "8px 12px",
                                borderRadius: 10,
                                border: "1px solid #FECACA",
                                background: "#FEF2F2",
                                color: "#DC2626",
                                fontWeight: 700,
                                cursor: isProcessing ? "default" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                              }}
                            >
                              <UserX size={14} />
                              Từ chối
                            </button>

                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleAcceptJoinRequest(request.requestId)}
                              style={{
                                padding: "8px 12px",
                                borderRadius: 10,
                                border: "none",
                                background: isProcessing
                                  ? "#FED7AA"
                                  : "linear-gradient(135deg, #EA580C, #F97316)",
                                color: "white",
                                fontWeight: 700,
                                cursor: isProcessing ? "default" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                              }}
                            >
                              <UserCheck size={14} />
                              Duyệt
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share Outfit Modal */}
      {shareModalOpen && id && (
        <ShareOutfitModal
          groupId={id}
          onClose={() => setShareModalOpen(false)}
          onShared={() => {
            queryClient.invalidateQueries({ queryKey: ["group-shared-items", id] });
          }}
        />
      )}
    </div>
  );
}



function SharedOutfitCard({
  outfit,
  isOwner,
  onUnshare,
  onLikeToggled,
}: {
  outfit: SharedClothingItem;
  isOwner: boolean;
  onUnshare: () => void;
  onLikeToggled: (shareId: string, liked: boolean) => void;
}) {
  const [imgUrl, setImgUrl] = useState<string | undefined>(undefined);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Optimistic like state
  const [liked, setLiked] = useState(outfit.likedByMe);
  const [likeCount, setLikeCount] = useState(outfit.likeCount ?? 0);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    if (outfit.imageId) {
      storageService
        .getPresignedUrl(outfit.imageId)
        .then(setImgUrl)
        .catch(() => {});
    }
  }, [outfit.imageId]);

  // Sync khi data refresh từ server
  useEffect(() => {
    setLiked(outfit.likedByMe);
    setLikeCount(outfit.likeCount ?? 0);
  }, [outfit.likedByMe, outfit.likeCount]);

  const handleLike = async () => {
    if (liking) return;
    // Optimistic update
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => c + (newLiked ? 1 : -1));
    setLiking(true);
    try {
      const res = await groupSharedApi.toggleLike(outfit.shareId);
      setLiked(res.liked);
      setLikeCount((c) => {
        // Correct nếu server trả về khác optimistic
        const optimisticChange = newLiked ? 1 : -1;
        const actualChange = res.liked ? 1 : -1;
        return c - optimisticChange + actualChange;
      });
      onLikeToggled(outfit.shareId, res.liked);
    } catch {
      // Rollback
      setLiked(!newLiked);
      setLikeCount((c) => c + (newLiked ? -1 : 1));
    } finally {
      setLiking(false);
    }
  };

  const sharedDate = outfit.sharedAt
    ? new Date(outfit.sharedAt).toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "short",
      })
    : "";

  return (
    <div
      style={{
        background: "white",
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid #E2E8F0",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)";
      }}
    >
      {/* Image */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 200,
          background: outfit.dominantColor ? `${outfit.dominantColor}33` : "#F1F5F9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={outfit.itemName}
            onLoad={() => setImgLoaded(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              opacity: imgLoaded ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          />
        ) : (
          <Package size={36} color="#CBD5E1" />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(15,23,42,0.3), transparent 55%)",
          }}
        />

        {/* Color dot */}
        {outfit.dominantColor && (
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: outfit.dominantColor,
              border: "2px solid white",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            }}
          />
        )}

        {/* ❤️ Like button — nổi trên ảnh góc phải */}
        <button
          type="button"
          onClick={handleLike}
          disabled={liking}
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            background: liked ? "#FEF2F2" : "rgba(255,255,255,0.92)",
            border: liked ? "1.5px solid #FCA5A5" : "1.5px solid rgba(255,255,255,0.6)",
            borderRadius: 999,
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            gap: 5,
            cursor: liking ? "default" : "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            transition: "all 0.18s ease",
            transform: liking ? "scale(0.9)" : "scale(1)",
          }}
        >
          <style>{`
            @keyframes heartPop {
              0% { transform: scale(1); }
              40% { transform: scale(1.4); }
              70% { transform: scale(0.9); }
              100% { transform: scale(1); }
            }
            .heart-icon-liked {
              animation: heartPop 0.35s ease;
            }
          `}</style>
          <Heart
            size={13}
            fill={liked ? "#EF4444" : "none"}
            color={liked ? "#EF4444" : "#64748B"}
            className={liked ? "heart-icon-liked" : ""}
          />
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              color: liked ? "#DC2626" : "#64748B",
              minWidth: 8,
              transition: "color 0.18s ease",
            }}
          >
            {likeCount}
          </span>
        </button>

        {/* Date badge */}
        {sharedDate && (
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 10,
              background: "rgba(255,255,255,0.9)",
              borderRadius: 8,
              padding: "3px 8px",
              fontSize: "0.68rem",
              fontWeight: 600,
              color: "#64748B",
            }}
          >
            {sharedDate}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "14px 16px" }}>
        <p
          style={{
            fontWeight: 700,
            color: "#0F172A",
            fontSize: "0.9rem",
            marginBottom: 6,
            lineHeight: 1.4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {outfit.itemName}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
          }}
        >
          {/* Style tag */}
          {outfit.style && (
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "#F97316",
                background: "#FFF7ED",
                borderRadius: 6,
                padding: "3px 8px",
                textTransform: "capitalize",
              }}
            >
              {outfit.style}
            </span>
          )}

          {/* Unshare button (chỉ người share mới thấy) */}
          {isOwner && (
            <button
              type="button"
              onClick={onUnshare}
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 8,
                padding: "5px 10px",
                cursor: "pointer",
                fontSize: "0.7rem",
                color: "#DC2626",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginLeft: "auto",
              }}
            >
              <X size={11} />
              Hủy share
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

