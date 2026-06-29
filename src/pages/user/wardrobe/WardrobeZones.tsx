import { useEffect, useState } from "react";
import { Plus, ChevronRight, X, Check, Box, Edit3, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { wardrobeZoneApi } from "../../../services/wardrobeService";
import { WardrobeZone } from "../../../types/wardrobe";

const COLORS = [
  { color: "#EA580C", bg: "linear-gradient(135deg, #FFEDD5, #FFEDD5)", border: "#FED7AA" },
  { color: "#10B981", bg: "linear-gradient(135deg, #ECFDF5, #D1FAE5)", border: "#A7F3D0" },
  { color: "#3B82F6", bg: "linear-gradient(135deg, #EFF6FF, #DBEAFE)", border: "#BFDBFE" },
  { color: "#F97316", bg: "linear-gradient(135deg, #F5F3FF, #EDE9FE)", border: "#DDD6FE" },
  { color: "#F59E0B", bg: "linear-gradient(135deg, #FFFBEB, #FEF3C7)", border: "#FDE68A" },
];

export function WardrobeZones() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const wardrobeId = searchParams.get("wardrobeId");
  const q = searchParams.get("q") || "";

  const [zones, setZones] = useState<WardrobeZone[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [newZone, setNewZone] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  // Edit State
  const [editOpen, setEditOpen] = useState(false);
  const [editZone, setEditZone] = useState({ id: "", name: "", description: "" });
  const [editing, setEditing] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!wardrobeId) return;
    const fetchZones = async () => {
      try {
        const data = q 
          ? await wardrobeZoneApi.search(q, wardrobeId)
          : await wardrobeZoneApi.getByWardrobeId(wardrobeId);
        setZones(data);
      } catch (error) {
        toast.error("Không thể tải danh sách ngăn kéo");
      } finally {
        setLoading(false);
      }
    };
    
    const timer = setTimeout(() => {
      fetchZones();
    }, 300);
    return () => clearTimeout(timer);
  }, [wardrobeId, q]);

  const handleCreate = async () => {
    if (!wardrobeId) return toast.error("Không tìm thấy Tủ đồ");
    if (!newZone.name.trim()) return toast.error("Vui lòng nhập tên ngăn kéo");
    
    setCreating(true);
    try {
      const created = await wardrobeZoneApi.create({
        wardrobeId: wardrobeId,
        zoneName: newZone.name.trim(),
        description: newZone.description.trim()
      });
      setZones((prev) => [...prev, created]);
      toast.success(`Ngăn kéo "${created.zoneName}" đã được tạo!`);
      setCreateOpen(false);
      setNewZone({ name: "", description: "" });
    } catch (error) {
      toast.error("Tạo ngăn kéo thất bại");
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (zone: WardrobeZone) => {
    setEditZone({ id: zone.zoneId, name: zone.zoneName, description: zone.description || "" });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editZone.name.trim()) return toast.error("Vui lòng nhập tên ngăn kéo");
    setEditing(true);
    try {
      const updated = await wardrobeZoneApi.update(editZone.id, {
        wardrobeId: wardrobeId!,
        zoneName: editZone.name.trim(),
        description: editZone.description.trim()
      });
      setZones((prev) => prev.map((z) => z.zoneId === editZone.id ? updated : z));
      toast.success("Đã cập nhật ngăn kéo");
      setEditOpen(false);
    } catch (error) {
      toast.error("Cập nhật thất bại");
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await wardrobeZoneApi.delete(id);
      setZones((prev) => prev.filter((z) => z.zoneId !== id));
      toast.success("Đã xóa ngăn kéo");
      setDeleteId(null);
    } catch (error) {
      toast.error("Xóa ngăn kéo thất bại");
    }
  };

  if (!wardrobeId) {
    return <div style={{ padding: 20 }}>Không tìm thấy Tủ đồ ID. Vui lòng quay lại màn hình Tủ đồ.</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => navigate("/app/wardrobe")}
            style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid #E2E8F0", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#475569" }}
            title="Quay lại Tủ Đồ"
          >
            <ArrowLeft size={16} />
          </button>
          <p style={{ color: "#64748B", fontSize: "0.875rem" }}>
            {zones.length} ngăn kéo
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 12, background: "linear-gradient(135deg, #EA580C, #F97316)", color: "white", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}
        >
          <Plus size={15} />
          Tạo Ngăn Kéo
        </button>
      </div>

      {loading ? (
        <p>Đang tải ngăn kéo...</p>
      ) : zones.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", background: "white", borderRadius: 16, border: "1px dashed #CBD5E1" }}>
          <p style={{ color: "#64748B" }}>Chưa có ngăn kéo nào. Hãy tạo ngăn kéo mới!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {zones.map((zone, i) => {
            const theme = COLORS[i % COLORS.length];
            return (
              <div
                key={zone.zoneId}
                style={{ background: theme.bg, borderRadius: 20, padding: 24, border: `1px solid ${theme.border}`, cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: "white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", flexShrink: 0 }}>
                      <Box size={22} color={theme.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{zone.zoneName}</p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div style={{ display: "flex", gap: 6, marginLeft: 10 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(zone); }}
                      style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.8)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      <Edit3 size={14} color="#64748B" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteId(zone.zoneId); }}
                      style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.8)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      <Trash2 size={14} color="#EF4444" />
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: "0.82rem", color: "#374151", lineHeight: 1.6, marginBottom: 16, minHeight: 40, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {zone.description || "Chưa có mô tả"}
                </p>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/app/wardrobe/items?zoneId=${zone.zoneId}&zoneName=${encodeURIComponent(zone.zoneName)}`); }}
                    style={{ flex: 1, padding: "9px", borderRadius: 10, border: `1.5px solid ${theme.border}`, background: "white", color: theme.color, fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  >
                    <ChevronRight size={14} />
                    Xem Chi Tiết
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Zone Modal */}
      {createOpen && (
        <div onClick={() => setCreateOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 24, padding: 36, maxWidth: 440, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontWeight: 800, color: "#0F172A", fontSize: "1.1rem" }}>Tạo Ngăn Kéo Mới</h3>
              <button onClick={() => setCreateOpen(false)} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}>
                <X size={16} color="#64748B" />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Tên Ngăn Kéo *</label>
                <input type="text" value={newZone.name} onChange={(e) => setNewZone({ ...newZone, name: e.target.value })} placeholder="Vd: Quần Áo Mùa Đông" style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Mô Tả</label>
                <textarea value={newZone.description} onChange={(e) => setNewZone({ ...newZone, description: e.target.value })} rows={3} placeholder="Mô tả về ngăn kéo này" style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: "0.88rem", outline: "none", resize: "vertical", fontFamily: "Inter, sans-serif", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setCreateOpen(false)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}>Hủy</button>
                <button disabled={creating} onClick={handleCreate} style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #EA580C, #F97316)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, opacity: creating ? 0.7 : 1 }}>
                  <Check size={15} />
                  {creating ? "Đang tạo..." : "Tạo Ngăn Kéo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Zone Modal */}
      {editOpen && (
        <div onClick={() => setEditOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 24, padding: 36, maxWidth: 440, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontWeight: 800, color: "#0F172A", fontSize: "1.1rem" }}>Cập Nhật Ngăn Kéo</h3>
              <button onClick={() => setEditOpen(false)} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}>
                <X size={16} color="#64748B" />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Tên Ngăn Kéo *</label>
                <input type="text" value={editZone.name} onChange={(e) => setEditZone({ ...editZone, name: e.target.value })} style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Mô Tả</label>
                <textarea value={editZone.description} onChange={(e) => setEditZone({ ...editZone, description: e.target.value })} rows={3} style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: "0.88rem", outline: "none", resize: "vertical", fontFamily: "Inter, sans-serif", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setEditOpen(false)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}>Hủy</button>
                <button disabled={editing} onClick={handleEdit} style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #10B981, #059669)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, opacity: editing ? 0.7 : 1 }}>
                  <Check size={15} />
                  {editing ? "Đang lưu..." : "Cập Nhật"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div onClick={() => setDeleteId(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 20, padding: 32, maxWidth: 380, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.2)", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={24} color="#EF4444" />
            </div>
            <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Xóa Ngăn Kéo?</h3>
            <p style={{ color: "#64748B", fontSize: "0.88rem", lineHeight: 1.6, marginBottom: 24 }}>
              Ngăn kéo <strong style={{ color: "#0F172A" }}>{zones.find((z) => z.zoneId === deleteId)?.zoneName}</strong> sẽ bị xóa vĩnh viễn. Quần áo bên trong sẽ không bị xóa.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: "11px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer" }}>Hủy</button>
              <button onClick={() => handleDelete(deleteId)} style={{ flex: 1, padding: "11px", borderRadius: 12, border: "none", background: "#EF4444", color: "white", fontWeight: 700, cursor: "pointer" }}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
