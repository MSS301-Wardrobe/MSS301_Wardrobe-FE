import { useState } from "react";
import { Users, Plus, Search, Crown, Sparkles, TrendingUp, UserPlus, X, Check, Globe } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const myGroups = [
  {
    id: "1",
    name: "Minimalist Collective",
    emoji: "🎯",
    color: "#4F46E5",
    bg: "#EEF2FF",
    members: 12,
    myRole: "admin",
    styles: ["Tối Giản", "Công Sở Thường", "Gọn Gàng"],
    colors: ["#000000", "#FFFFFF", "#4F46E5"],
    activity: "Active",
    recentOutfit: "https://images.unsplash.com/photo-1700557477506-369b241cbe54?w=80&h=80&fit=crop",
    topStyle: "Tối Giản",
    joined: "3 tháng trước",
  },
  {
    id: "2",
    name: "Street Style Crew",
    emoji: "🔥",
    color: "#EF4444",
    bg: "#FEF2F2",
    members: 28,
    myRole: "member",
    styles: ["Đường Phố", "Đô Thị", "Thường Ngày"],
    colors: ["#000000", "#EF4444", "#F97316"],
    activity: "Very Active",
    recentOutfit: "https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?w=80&h=80&fit=crop",
    topStyle: "Đường Phố",
    joined: "1 tháng trước",
  },
  {
    id: "3",
    name: "Office Chic Club",
    emoji: "💼",
    color: "#10B981",
    bg: "#ECFDF5",
    members: 19,
    myRole: "member",
    styles: ["Công Sở", "Kinh Doanh", "Lịch Sự"],
    colors: ["#0F172A", "#334155", "#64748B"],
    activity: "Active",
    recentOutfit: "https://images.unsplash.com/photo-1731589802956-b4693dae884b?w=80&h=80&fit=crop",
    topStyle: "Công Sở Trang Trọng",
    joined: "2 tháng trước",
  },
];

const discoverGroups = [
  {
    id: "4",
    name: "Vintage Vibes",
    emoji: "🎞️",
    color: "#F59E0B",
    bg: "#FFFBEB",
    members: 47,
    styles: ["Cổ Điển", "Retro", "Truyền Thống"],
    colors: ["#92400E", "#D97706", "#F59E0B"],
    img: "https://images.unsplash.com/photo-1761957374132-a5137e99f26c?w=300&h=200&fit=crop",
    joined: false,
  },
  {
    id: "5",
    name: "Luxury Fashion Elite",
    emoji: "👑",
    color: "#8B5CF6",
    bg: "#F5F3FF",
    members: 34,
    styles: ["Xa Xỉ", "Thời Trang Cao Cấp", "Thanh Lịch"],
    colors: ["#6D28D9", "#8B5CF6", "#C4B5FD"],
    img: "https://images.unsplash.com/photo-1768767121186-b1486acc4e14?w=300&h=200&fit=crop",
    joined: false,
  },
  {
    id: "6",
    name: "Sporty & Athleisure",
    emoji: "⚡",
    color: "#10B981",
    bg: "#ECFDF5",
    members: 62,
    styles: ["Thể Thao", "Năng Động", "Thoải Mái"],
    colors: ["#10B981", "#34D399", "#6EE7B7"],
    img: "https://images.unsplash.com/photo-1761957375235-46acb4862151?w=300&h=200&fit=crop",
    joined: false,
  },
];

export function FriendGroups() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "", emoji: "👗" });
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());

  const handleJoin = (id: string, name: string) => {
    setJoinedIds((prev) => new Set([...prev, id]));
    toast.success(`Đã tham gia nhóm "${name}"!`);
  };

  const handleCreate = () => {
    if (!newGroup.name.trim()) { toast.error("Vui lòng nhập tên nhóm"); return; }
    toast.success(`Nhóm "${newGroup.name}" đã được tạo!`);
    setCreateOpen(false);
    setNewGroup({ name: "", description: "", emoji: "👗" });
  };

  const emojiOptions = ["👗", "👔", "🎯", "🔥", "👑", "⚡", "🌸", "🎞️", "💼", "🌊"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #4F46E5 0%, #8B5CF6 60%, #C084FC 100%)", borderRadius: 20, padding: "28px 32px", position: "relative", overflow: "hidden" }}>
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
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 12, background: "white", color: "#4F46E5", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem" }}
            >
              <Plus size={15} />
              Tạo Nhóm
            </button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 28, marginTop: 24 }}>
          {[
            { label: "Nhóm Của Tôi", value: myGroups.length },
            { label: "Tổng Thành Viên", value: myGroups.reduce((s, g) => s + g.members, 0) },
            { label: "Phù Hợp Phong Cách", value: "87%" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ fontSize: "1.4rem", fontWeight: 800, color: "white" }}>{value}</p>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.65)" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* My Groups */}
      <div>
        <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 16, fontSize: "1.05rem" }}>Nhóm Của Tôi</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {myGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => navigate(`/app/friend-groups/${group.id}`)}
              style={{ background: "white", borderRadius: 18, padding: 22, border: "1px solid #E2E8F0", cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", transition: "transform 0.2s, box-shadow 0.2s" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: group.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                    {group.emoji}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem" }}>{group.name}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                      <Users size={12} color="#94A3B8" />
                      <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>{group.members} thành viên</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {group.myRole === "admin" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 3, background: "#FFFBEB", borderRadius: 6, padding: "3px 8px" }}>
                      <Crown size={11} color="#F59E0B" />
                      <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#D97706" }}>Quản Trị Viên</span>
                    </div>
                  )}
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: group.activity === "Very Active" ? "#10B981" : "#F59E0B" }} />
                </div>
              </div>

              {/* Style tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {group.styles.map((s) => (
                  <span key={s} style={{ background: group.bg, color: group.color, borderRadius: 20, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 600 }}>{s}</span>
                ))}
              </div>

              {/* Color palette + activity */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {group.colors.map((c) => (
                    <div key={c} style={{ width: 18, height: 18, borderRadius: "50%", background: c, border: "1.5px solid #E2E8F0" }} />
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <img src={group.recentOutfit} alt="" style={{ width: 26, height: 26, borderRadius: 6, objectFit: "cover" }} />
                  <span style={{ fontSize: "0.7rem", color: "#94A3B8" }}>Đã tham gia {group.joined}</span>
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
          {discoverGroups.map((group) => {
            const isJoined = joinedIds.has(group.id);
            return (
              <div key={group.id} style={{ background: "white", borderRadius: 18, overflow: "hidden", border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <div style={{ position: "relative" }}>
                  <img src={group.img} alt={group.name} style={{ width: "100%", height: 130, objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.6), transparent)" }} />
                  <div style={{ position: "absolute", bottom: 10, left: 14, display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: group.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>{group.emoji}</div>
                    <div>
                      <p style={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>{group.name}</p>
                      <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.68rem" }}>{group.members} thành viên</p>
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
                    {group.styles.map((s) => (
                      <span key={s} style={{ background: group.bg, color: group.color, borderRadius: 20, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
                    {group.colors.map((c) => (
                      <div key={c} style={{ width: 16, height: 16, borderRadius: "50%", background: c, border: "1.5px solid #E2E8F0" }} />
                    ))}
                  </div>
                  <button
                    onClick={() => handleJoin(group.id, group.name)}
                    disabled={isJoined}
                    style={{
                      width: "100%", padding: "9px", borderRadius: 10, border: `1.5px solid ${isJoined ? "#10B981" : group.color}`,
                      background: isJoined ? "#ECFDF5" : group.bg,
                      color: isJoined ? "#10B981" : group.color,
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
                      style={{ width: 40, height: 40, borderRadius: 10, background: newGroup.emoji === em ? "#EEF2FF" : "#F1F5F9", border: `1.5px solid ${newGroup.emoji === em ? "#4F46E5" : "transparent"}`, fontSize: "1.2rem", cursor: "pointer" }}
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
                  style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #4F46E5, #8B5CF6)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}
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
