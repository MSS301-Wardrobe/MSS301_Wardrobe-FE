import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Crown,
  Sparkles,
  UserPlus,
  X,
  Check,
  Globe,
} from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";


import {
  friendGroupService,
  type FriendGroup,
} from "../../../services/friendGroupService";


export function FriendGroups() {
  const navigate = useNavigate();

  const [myGroups, setMyGroups] = useState<FriendGroup[]>([]);
  const [discoverGroups, setDiscoverGroups] = useState<FriendGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    emoji: "👗",
  });
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const filteredDiscoverGroups = discoverGroups.filter((group) =>
    group.groupName.toLowerCase().includes(search.toLowerCase())
  );

  const defaultBg = "#FFEDD5";
  const defaultColor = "#EA580C";
  const defaultStyles = ["Thời Trang", "Cộng Đồng"];
  const defaultColors = ["#EA580C", "#F97316", "#FB923C"];

  const handleJoin = async (id: string, name: string) => {
    try {
      const joinedGroup = await friendGroupService.joinGroup(id);

      setJoinedIds((prev) => new Set([...prev, id]));

      setMyGroups((prev) => [joinedGroup, ...prev]);
      setDiscoverGroups((prev) => prev.filter((group) => group.groupId !== id));

      toast.success(`Đã tham gia nhóm "${name}"!`);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Tham gia nhóm thất bại"
      );
    }
  };

  const handleCreate = async () => {
    if (!newGroup.name.trim()) {
      toast.error("Vui lòng nhập tên nhóm");
      return;
    }

    try {
      const createdGroup = await friendGroupService.createGroup({
        groupName: newGroup.name.trim(),
        description: newGroup.description,
        emoji: newGroup.emoji,
      });

      setMyGroups((prev) => [createdGroup, ...prev]);

      toast.success(`Nhóm "${createdGroup.groupName}" đã được tạo!`);

      setCreateOpen(false);
      setNewGroup({ name: "", description: "", emoji: "👗" });
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Tạo nhóm thất bại"
      );
    }
  };

  const emojiOptions = ["👗", "👔", "🎯", "🔥", "👑", "⚡", "🌸", "🎞️", "💼", "🌊"];

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoading(true);

        const [myGroupsData, discoverGroupsData] = await Promise.all([
          friendGroupService.getMyGroups(),
          friendGroupService.discoverGroups(),
        ]);

        setMyGroups(myGroupsData);
        setDiscoverGroups(discoverGroupsData);
      } catch (err: any) {
        toast.error(
          err.response?.data?.message ||
          err.message ||
          "Không thể tải danh sách nhóm"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #EA580C 0%, #F97316 60%, #FB923C 100%)", borderRadius: 20, padding: "28px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -30, right: 120, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Users size={18} color="rgba(255,255,255,0.75)" />
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.82rem", fontWeight: 500 }}>Thời Trang Cộng Đồng</span>
            </div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "white", marginBottom: 6 }}>Nhóm Bạn</h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.875rem" }}>Kết nối với bạn bè, chia sẻ phong cách và nhận gợi ý trang phục cộng đồng</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setCreateOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 12, background: "white", color: "#EA580C", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem" }}
            >
              <Plus size={15} />
              Tạo Nhóm
            </button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 28, marginTop: 24 }}>
          {[
            { label: "Nhóm Của Tôi", value: myGroups.length },
            { label: "Tổng Thành Viên", value: myGroups.reduce((s, g) => s + g.memberCount, 0) },
            { label: "Phù Hợp Phong Cách", value: "87%" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ fontSize: "1.4rem", fontWeight: 800, color: "white" }}>{value}</p>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.65)" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {isLoading && (
        <p style={{ color: "#64748B", fontSize: "0.875rem" }}>
          Đang tải danh sách nhóm...
        </p>
      )}

      {/* My Groups */}
      <div>
        <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 16, fontSize: "1.05rem" }}>Nhóm Của Tôi</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {myGroups.map((group) => (
            <div
              key={group.groupId}
              onClick={() => navigate(`/app/friend-groups/${group.groupId}`)}
              style={{ background: "white", borderRadius: 18, padding: 22, border: "1px solid #E2E8F0", cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", transition: "transform 0.2s, box-shadow 0.2s" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: defaultBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                    {group.emoji || "👗"}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem" }}>{group.groupName}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                      <Users size={12} color="#94A3B8" />
                      <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>{group.memberCount} thành viên</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {(group.myRole === "OWNER" || group.myRole === "ADMIN") && (
                    <div style={{ display: "flex", alignItems: "center", gap: 3, background: "#FFFBEB", borderRadius: 6, padding: "3px 8px" }}>
                      <Crown size={11} color="#F59E0B" />
                      <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#D97706" }}>Quản Trị Viên</span>
                    </div>
                  )}
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: group.active ? "#10B981" : "#F59E0B" }} />
                </div>
              </div>

              {/* Style tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {defaultStyles.map((s) => (
                  <span key={s} style={{ background: defaultBg, color: defaultColor, borderRadius: 20, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 600 }}>{s}</span>
                ))}
              </div>

              {/* Color palette + activity */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {defaultColors.map((c) => (
                    <div key={c} style={{ width: 18, height: 18, borderRadius: "50%", background: c, border: "1.5px solid #E2E8F0" }} />
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: "0.7rem", color: "#94A3B8" }}>
                    Tạo lúc {group.createdAt ? new Date(group.createdAt).toLocaleDateString("vi-VN") : "gần đây"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discover Groups */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1.05rem" }}>Khám Phá Nhóm</h3>
            <p style={{ fontSize: "0.78rem", color: "#64748B", marginTop: 2 }}>Tìm nhóm phù hợp với phong cách của bạn</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white", borderRadius: 10, padding: "9px 14px", border: "1px solid #E2E8F0" }}>
            <Search size={14} color="#94A3B8" />
            <input
              placeholder="Tìm kiếm nhóm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: "none", border: "none", outline: "none", fontSize: "0.85rem", color: "#0F172A", width: 180 }}
            />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filteredDiscoverGroups.map((group) => {
            const isJoined = joinedIds.has(group.groupId)
            return (
              <div key={group.groupId} style={{ background: "white", borderRadius: 18, overflow: "hidden", border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      width: "100%",
                      height: 130,
                      background: "linear-gradient(135deg, #EA580C, #F97316)",
                    }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.6), transparent)" }} />
                  <div style={{ position: "absolute", bottom: 10, left: 14, display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: defaultBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>{group.emoji}</div>
                    <div>
                      <p style={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>{group.groupName}</p>
                      <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.68rem" }}>{group.memberCount} thành viên</p>
                    </div>
                  </div>
                  <div style={{ position: "absolute", top: 10, right: 10 }}>
                    <span style={{ background: "rgba(255,255,255,0.9)", borderRadius: 6, padding: "3px 8px", fontSize: "0.65rem", fontWeight: 700, color: "#374151", display: "flex", alignItems: "center", gap: 4 }}>
                      <Globe size={10} />
                      Công Khai
                    </span>
                  </div>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                    {defaultStyles.map((s) => (
                      <span key={s} style={{ background: defaultBg, color: defaultColor, borderRadius: 20, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
                    {defaultColors.map((c) => (
                      <div key={c} style={{ width: 16, height: 16, borderRadius: "50%", background: c, border: "1.5px solid #E2E8F0" }} />
                    ))}
                  </div>
                  <button
                    onClick={() => handleJoin(group.groupId, group.groupName)}
                    disabled={isJoined}
                    style={{
                      width: "100%", padding: "9px", borderRadius: 10, border: `1.5px solid ${isJoined ? "#10B981" : defaultColor}`,
                      background: isJoined ? "#ECFDF5" : defaultBg,
                      color: isJoined ? "#10B981" : defaultColor,
                      fontWeight: 700, cursor: isJoined ? "default" : "pointer", fontSize: "0.85rem",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}
                  >
                    {isJoined ? <><Check size={14} /> Đã Tham Gia</> : <><UserPlus size={14} /> Tham Gia</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Group Modal */}
      {createOpen && (
        <div
          onClick={() => setCreateOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 24, padding: 36, maxWidth: 480, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <div>
                <h3 style={{ fontWeight: 800, color: "#0F172A", fontSize: "1.2rem" }}>Tạo Nhóm Mới</h3>
                <p style={{ color: "#64748B", fontSize: "0.85rem", marginTop: 4 }}>Xây dựng cộng đồng thời trang của riêng bạn</p>
              </div>
              <button onClick={() => setCreateOpen(false)} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}>
                <X size={16} color="#64748B" />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Biểu Tượng Nhóm</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {emojiOptions.map((em) => (
                    <button
                      key={em}
                      onClick={() => setNewGroup({ ...newGroup, emoji: em })}
                      style={{ width: 40, height: 40, borderRadius: 10, background: newGroup.emoji === em ? "#FFEDD5" : "#F1F5F9", border: `1.5px solid ${newGroup.emoji === em ? "#EA580C" : "transparent"}`, fontSize: "1.2rem", cursor: "pointer" }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Tên Nhóm *</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="vd. Câu Lạc Bộ Phong Cách Tối Giản"
                  style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: "0.9rem", color: "#0F172A", background: "white", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Mô Tả</label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  rows={3}
                  placeholder="Nhóm này về chủ đề gì?"
                  style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: "0.88rem", color: "#0F172A", background: "white", outline: "none", resize: "vertical", fontFamily: "Inter, sans-serif", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setCreateOpen(false)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}>Hủy</button>
                <button
                  onClick={handleCreate}
                  style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #EA580C, #F97316)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}
                >
                  <Sparkles size={15} />
                  Tạo Nhóm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
