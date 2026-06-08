import { useState, useEffect } from "react";
import { Plus, Settings, ChevronRight, ChevronLeft, Shirt, X, Check, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { wardrobeZoneApi, wardrobeApi } from "../../../services/wardrobeService";
import type { WardrobeZone, CreateWardrobeZonePayload } from "../../../types/wardrobe";

// Zone color themes — cycle through for each zone
const zoneThemes = [
  { color: "#4F46E5", bg: "linear-gradient(135deg, #EEF2FF, #E0E7FF)", border: "#C7D2FE" },
  { color: "#10B981", bg: "linear-gradient(135deg, #ECFDF5, #D1FAE5)", border: "#A7F3D0" },
  { color: "#F97316", bg: "linear-gradient(135deg, #FFF7ED, #FFEDD5)", border: "#FED7AA" },
  { color: "#8B5CF6", bg: "linear-gradient(135deg, #F5F3FF, #EDE9FE)", border: "#DDD6FE" },
  { color: "#F59E0B", bg: "linear-gradient(135deg, #FFFBEB, #FEF3C7)", border: "#FDE68A" },
  { color: "#EC4899", bg: "linear-gradient(135deg, #FDF2F8, #FCE7F3)", border: "#F9A8D4" },
];

export function WardrobeZones() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const wardrobeId = searchParams.get("wardrobeId");

  const [wardrobeName, setWardrobeName] = useState<string>("");
  const [zones, setZones] = useState<WardrobeZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newZone, setNewZone] = useState<CreateWardrobeZonePayload>({ wardrobeId: wardrobeId || "", zoneName: "", description: "" });
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const q = searchParams.get("q") || "";

  const fetchZones = async (keyword: string) => {
    if (!wardrobeId) {
      navigate("/app/wardrobe");
      return;
    }
    setLoading(true);
    try {
      const w = await wardrobeApi.getById(wardrobeId);
      setWardrobeName(w.wardrobeName);

      try {
        const fetchedZones = keyword 
          ? await wardrobeZoneApi.search(keyword, wardrobeId)
          : await wardrobeZoneApi.getByWardrobeId(wardrobeId);
        setZones(fetchedZones);
      } catch (err: any) {
        if (err?.response?.data?.errorCode === 'WARDROBE_ZONE_NOT_FOUND' || err?.response?.status === 404) {
          setZones([]);
        } else {
          throw err;
        }
      }
    } catch {
      toast.error("Không thể tải danh sách khu vực");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchZones(q);
    }, 300);
    return () => clearTimeout(timer);
  }, [q, wardrobeId]);

  const handleCreate = async () => {
    if (!newZone.zoneName.trim()) {
      toast.error("Vui lòng nhập tên khu vực");
      return;
    }
    if (!newZone.wardrobeId.trim()) {
      toast.error("Vui lòng nhập Wardrobe ID");
      return;
    }
    setSubmitting(true);
    try {
      const created = await wardrobeZoneApi.create(newZone);
      setZones((prev) => [...prev, created]);
      toast.success(`Khu vực "${created.zoneName}" đã được tạo!`);
      setCreateOpen(false);
      setNewZone({ wardrobeId: wardrobeId || "", zoneName: "", description: "" });
    } catch {
      toast.error("Tạo ngăn kéo thất bại, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (zoneId: string) => {
    try {
      await wardrobeZoneApi.delete(zoneId);
      setZones((prev) => prev.filter((z) => z.zoneId !== zoneId));
      setDeleteConfirm(null);
      toast.success("Đã xóa khu vực thành công");
    } catch {
      toast.error("Xóa khu vực thất bại");
    }
  };

  const getTheme = (index: number) => zoneThemes[index % zoneThemes.length];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <button
              onClick={() => navigate("/app/wardrobe")}
              style={{ background: "#F1F5F9", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <ChevronLeft size={18} color="#64748B" />
            </button>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0F172A" }}>
              {wardrobeName ? wardrobeName : "Đang tải..."}
            </h2>
          </div>
          <p style={{ color: "#64748B", fontSize: "0.875rem", marginLeft: 40 }}>
            {loading ? "Đang tải..." : `${zones.length} ngăn kéo`}
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 12, background: "linear-gradient(135deg, #4F46E5, #8B5CF6)", color: "white", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}
        >
          <Plus size={15} />
          Tạo Ngăn Kéo Mới
        </button>
      </div>

      {/* Summary Bar */}
      {!loading && zones.length > 0 && (
        <div style={{ background: "white", borderRadius: 16, padding: "18px 24px", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", gap: 0, overflowX: "auto" }}>
          {zones.map((zone, i) => {
            const theme = getTheme(i);
            return (
              <div key={zone.zoneId} style={{ flex: 1, minWidth: 120, padding: "0 20px", borderRight: i < zones.length - 1 ? "1px solid #E2E8F0" : "none", textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
                  <Shirt size={14} color={theme.color} />
                  <span style={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 500 }}>{zone.zoneName}</span>
                </div>
                <p style={{ fontSize: "0.65rem", color: "#94A3B8" }}>Khu vực</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px", background: "white", borderRadius: 20, border: "1px solid #E2E8F0" }}>
          <Loader2 size={32} color="#4F46E5" style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ marginLeft: 12, color: "#64748B", fontSize: "0.95rem" }}>Đang tải khu vực...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && zones.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 24px", background: "white", borderRadius: 20, border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🗂️</div>
          <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Tủ đồ này chưa có ngăn kéo nào</h3>
          <p style={{ color: "#64748B", fontSize: "0.9rem", marginBottom: 20 }}>Tạo ngăn kéo đầu tiên để bắt đầu sắp xếp quần áo</p>
          <button onClick={() => setCreateOpen(true)} style={{ padding: "10px 20px", borderRadius: 12, background: "#4F46E5", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>
            Tạo Ngăn Kéo
          </button>
        </div>
      )}

      {/* Zone Grid */}
      {!loading && zones.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {zones.map((zone, index) => {
            const theme = getTheme(index);
            return (
              <div
                key={zone.zoneId}
                style={{ background: theme.bg, borderRadius: 20, padding: 24, border: `1px solid ${theme.border}`, cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", boxShadow: activeZone === zone.zoneId ? `0 8px 32px rgba(0,0,0,0.12)` : "0 2px 8px rgba(0,0,0,0.04)" }}
                onClick={() => setActiveZone(activeZone === zone.zoneId ? null : zone.zoneId)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: "white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                      <Shirt size={22} color={theme.color} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>{zone.zoneName}</p>
                      <p style={{ fontSize: "0.72rem", color: "#64748B", marginTop: 2 }}>ID: {zone.zoneId.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); toast.info("Tính năng chỉnh sửa đang phát triển"); }}
                      style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.7)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      <Settings size={13} color="#64748B" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(zone.zoneId); }}
                      style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.7)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      <X size={13} color="#EF4444" />
                    </button>
                  </div>
                </div>

                {zone.description && (
                  <p style={{ fontSize: "0.82rem", color: "#374151", lineHeight: 1.6, marginBottom: 16 }}>{zone.description}</p>
                )}

                {/* Expanded detail */}
                {activeZone === zone.zoneId && (
                  <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
                    <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>Thông Tin Khu Vực</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "0.8rem", color: "#64748B" }}>Zone ID</span>
                        <span style={{ fontSize: "0.78rem", color: "#374151", fontFamily: "monospace" }}>{zone.zoneId.slice(0, 12)}...</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "0.8rem", color: "#64748B" }}>Wardrobe ID</span>
                        <span style={{ fontSize: "0.78rem", color: "#374151", fontFamily: "monospace" }}>{zone.wardrobeId.slice(0, 12)}...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/app/wardrobe/items?zoneId=${zone.zoneId}`); }}
                    style={{ flex: 2, padding: "9px", borderRadius: 10, border: `1.5px solid ${theme.border}`, background: "white", color: theme.color, fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  >
                    <ChevronRight size={14} />
                    Xem Quần Áo
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/app/wardrobe/add?zoneId=${zone.zoneId}`); }}
                    style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", background: theme.color, color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                  >
                    <Plus size={13} />
                    Thêm
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
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 24, padding: 36, maxWidth: 480, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontWeight: 800, color: "#0F172A", fontSize: "1.1rem" }}>Tạo Ngăn Kéo Mới</h3>
              <button onClick={() => setCreateOpen(false)} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}>
                <X size={16} color="#64748B" />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Tên Ngăn Kéo *</label>
                <input
                  type="text"
                  value={newZone.zoneName}
                  onChange={(e) => setNewZone({ ...newZone, zoneName: e.target.value })}
                  placeholder="Vd: Ngăn Áo Thun"
                  style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Mô Tả</label>
                <textarea
                  value={newZone.description}
                  onChange={(e) => setNewZone({ ...newZone, description: e.target.value })}
                  rows={3}
                  placeholder="Trang phục nào thuộc khu vực này?"
                  style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: "0.88rem", outline: "none", resize: "vertical", fontFamily: "Inter, sans-serif", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setCreateOpen(false)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}>Hủy</button>
                <button
                  onClick={handleCreate}
                  disabled={submitting}
                  style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: submitting ? "#A5B4FC" : "linear-gradient(135deg, #4F46E5, #8B5CF6)", color: "white", fontWeight: 700, cursor: submitting ? "default" : "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}
                >
                  {submitting ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={15} />}
                  {submitting ? "Đang tạo..." : "Tạo Khu Vực"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div onClick={() => setDeleteConfirm(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 20, padding: 32, maxWidth: 380, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.2)", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>⚠️</div>
            <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Xóa Khu Vực?</h3>
            <p style={{ color: "#64748B", fontSize: "0.9rem", marginBottom: 24 }}>Hành động này không thể hoàn tác. Các vật phẩm trong khu vực sẽ không bị xóa.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "11px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer" }}>Hủy</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: "11px", borderRadius: 12, border: "none", background: "#EF4444", color: "white", fontWeight: 700, cursor: "pointer" }}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
