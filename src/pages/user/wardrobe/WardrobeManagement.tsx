import { useState, useEffect } from "react";
import {
  Plus, Trash2, Edit3, Check, X, Loader2, Archive,
  ChevronRight, Calendar, Package
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { wardrobeApi } from "../../../services/wardrobeService";
import type { Wardrobe } from "../../../types/wardrobe";

const COLORS = [
  { bg: "linear-gradient(135deg, #EEF2FF, #E0E7FF)", border: "#C7D2FE", accent: "#4F46E5", icon: "#4F46E5" },
  { bg: "linear-gradient(135deg, #ECFDF5, #D1FAE5)", border: "#A7F3D0", accent: "#10B981", icon: "#10B981" },
  { bg: "linear-gradient(135deg, #FFF7ED, #FFEDD5)", border: "#FED7AA", accent: "#F97316", icon: "#F97316" },
  { bg: "linear-gradient(135deg, #F5F3FF, #EDE9FE)", border: "#DDD6FE", accent: "#8B5CF6", icon: "#8B5CF6" },
  { bg: "linear-gradient(135deg, #FFFBEB, #FEF3C7)", border: "#FDE68A", accent: "#F59E0B", icon: "#F59E0B" },
  { bg: "linear-gradient(135deg, #FDF2F8, #FCE7F3)", border: "#F9A8D4", accent: "#EC4899", icon: "#EC4899" },
];

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return dateStr;
  }
};

export function WardrobeManagement() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  
  const [wardrobes, setWardrobes] = useState<Wardrobe[]>([]);
  const [loading, setLoading] = useState(true);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchWardrobes = async (keyword: string) => {
    setLoading(true);
    try {
      const data = keyword ? await wardrobeApi.search(keyword) : await wardrobeApi.getAll();
      setWardrobes(data);
    } catch (err: any) {
      if (err?.response?.data?.errorCode === 'WARDROBE_NOT_FOUND' || err?.response?.status === 404) {
        setWardrobes([]);
      } else {
        toast.error("Không thể tải danh sách tủ đồ");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWardrobes(q);
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  // ─── Create ──────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!createName.trim()) return toast.error("Vui lòng nhập tên tủ đồ");
    setCreating(true);
    try {
      const created = await wardrobeApi.create({ wardrobeName: createName.trim() });
      setWardrobes((prev) => [created, ...prev]);
      toast.success(`Tủ đồ "${created.wardrobeName}" đã được tạo!`);
      setCreateOpen(false);
      setCreateName("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Tạo tủ đồ thất bại");
    } finally {
      setCreating(false);
    }
  };

  // ─── Edit ────────────────────────────────────────────────────────────────────

  const startEdit = (w: Wardrobe) => {
    setEditingId(w.wardrobeId);
    setEditName(w.wardrobeName);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return toast.error("Tên không được để trống");
    setSavingEdit(true);
    try {
      const updated = await wardrobeApi.update(id, { wardrobeName: editName.trim() });
      setWardrobes((prev) => prev.map((w) => (w.wardrobeId === id ? updated : w)));
      toast.success("Đã cập nhật tên tủ đồ");
      setEditingId(null);
    } catch {
      toast.error("Cập nhật thất bại");
    } finally {
      setSavingEdit(false);
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    try {
      await wardrobeApi.delete(id);
      setWardrobes((prev) => prev.filter((w) => w.wardrobeId !== id));
      setDeleteId(null);
      toast.success("Đã xóa tủ đồ");
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  const getColor = (index: number) => COLORS[index % COLORS.length];

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          {/* Title is already in Topbar */}
          <p style={{ color: "#64748B", fontSize: "0.85rem", marginTop: 3 }}>
            {loading ? "Đang tải..." : `${wardrobes.length} tủ đồ`}
          </p>
        </div>
        <button
          id="create-wardrobe-btn"
          onClick={() => setCreateOpen(true)}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 12, background: "linear-gradient(135deg, #EA580C, #F97316)", color: "white", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem" }}
        >
          <Plus size={15} /> Tạo Tủ Đồ Mới
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 0", background: "white", borderRadius: 20, border: "1px solid #E2E8F0" }}>
          <Loader2 size={32} color="#EA580C" style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ marginLeft: 12, color: "#64748B" }}>Đang tải tủ đồ...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && wardrobes.length === 0 && (
        <div style={{ textAlign: "center", padding: "64px 24px", background: "white", borderRadius: 20, border: "2px dashed #C7D2FE" }}>
          <Archive size={48} color="#C7D2FE" style={{ margin: "0 auto 16px" }} />
          <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Chưa có tủ đồ nào</h3>
          <p style={{ color: "#64748B", fontSize: "0.9rem", marginBottom: 20 }}>
            Tạo tủ đồ đầu tiên để bắt đầu tổ chức tủ đồ của bạn
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            style={{ padding: "10px 24px", borderRadius: 12, background: "linear-gradient(135deg, #EA580C, #F97316)", color: "white", border: "none", cursor: "pointer", fontWeight: 700 }}
          >
            Tạo Ngay
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && wardrobes.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {wardrobes.map((w, index) => {
            const color = getColor(index);
            const isEditing = editingId === w.wardrobeId;
            return (
              <div
                key={w.wardrobeId}
                style={{ background: color.bg, borderRadius: 20, padding: 24, border: `1.5px solid ${color.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", transition: "transform 0.15s, box-shadow 0.15s" }}
              >
                {/* Top row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1, minWidth: 0 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 13, background: "white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", flexShrink: 0 }}>
                      <Package size={20} color={color.icon} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {isEditing ? (
                        <input
                          autoFocus
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") saveEdit(w.wardrobeId); if (e.key === "Escape") cancelEdit(); }}
                          style={{ width: "100%", padding: "6px 10px", border: `2px solid ${color.accent}`, borderRadius: 8, fontSize: "0.92rem", fontWeight: 700, color: "#0F172A", outline: "none", background: "white", boxSizing: "border-box" }}
                        />
                      ) : (
                        <p style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w.wardrobeName}</p>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                        <Calendar size={11} color="#94A3B8" />
                        <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>{formatDate(w.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: 5, flexShrink: 0, marginLeft: 8 }}>
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEdit(w.wardrobeId)}
                          disabled={savingEdit}
                          style={{ width: 30, height: 30, borderRadius: 8, background: color.accent, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          {savingEdit ? <Loader2 size={12} color="white" style={{ animation: "spin 1s linear infinite" }} /> : <Check size={13} color="white" />}
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.8)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <X size={13} color="#64748B" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(w)}
                          title="Đổi tên"
                          style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.8)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Edit3 size={13} color="#64748B" />
                        </button>
                        <button
                          onClick={() => setDeleteId(w.wardrobeId)}
                          title="Xóa"
                          style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.8)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Trash2 size={13} color="#EF4444" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* ID info removed */}

                {/* Navigate to contents */}
                <button
                  onClick={() => navigate(`/app/wardrobe/zones?wardrobeId=${w.wardrobeId}&wardrobeName=${encodeURIComponent(w.wardrobeName)}`)}
                  style={{ width: "100%", padding: "10px", borderRadius: 12, border: `1.5px solid ${color.border}`, background: "white", color: color.accent, fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  Xem Các Ngăn Kéo
                  <ChevronRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create Modal ── */}
      {createOpen && (
        <div
          onClick={() => setCreateOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "white", borderRadius: 24, padding: 36, maxWidth: 460, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Package size={18} color="#EA580C" />
                </div>
                <h3 style={{ fontWeight: 800, color: "#0F172A", fontSize: "1.05rem" }}>Tạo Tủ Đồ Mới</h3>
              </div>
              <button onClick={() => setCreateOpen(false)} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}>
                <X size={16} color="#64748B" />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                  Tên Tủ Đồ <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  id="wardrobe-name-input"
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
                  placeholder="Vd: Tủ Đồ Mùa Đông, Tủ Công Sở..."
                  maxLength={100}
                  style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: "0.9rem", outline: "none", boxSizing: "border-box", color: "#0F172A" }}
                />
                <p style={{ fontSize: "0.72rem", color: "#94A3B8", marginTop: 4, textAlign: "right" }}>{createName.length}/100</p>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button
                  onClick={() => setCreateOpen(false)}
                  style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}
                >
                  Hủy
                </button>
                <button
                  id="create-wardrobe-submit-btn"
                  onClick={handleCreate}
                  disabled={creating}
                  style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: creating ? "#FDBA74" : "linear-gradient(135deg, #EA580C, #F97316)", color: "white", fontWeight: 700, cursor: creating ? "default" : "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  {creating ? (
                    <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Đang tạo...</>
                  ) : (
                    <><Plus size={15} /> Tạo Tủ Đồ</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteId && (
        <div
          onClick={() => setDeleteId(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "white", borderRadius: 20, padding: 32, maxWidth: 380, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.2)", textAlign: "center" }}
          >
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={24} color="#EF4444" />
            </div>
            <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Xóa Tủ Đồ?</h3>
            <p style={{ color: "#64748B", fontSize: "0.88rem", lineHeight: 1.6, marginBottom: 24 }}>
              Tủ đồ <strong style={{ color: "#0F172A" }}>
                {wardrobes.find((w) => w.wardrobeId === deleteId)?.wardrobeName}
              </strong> sẽ bị xóa vĩnh viễn. Quần áo bên trong sẽ không bị xóa.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setDeleteId(null)}
                style={{ flex: 1, padding: "11px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer" }}
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                style={{ flex: 1, padding: "11px", borderRadius: 12, border: "none", background: "#EF4444", color: "white", fontWeight: 700, cursor: "pointer" }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
