import { useEffect, useState } from "react";
import { Search, Grid3X3, List, Heart, ChevronLeft, ChevronRight, ArrowLeft, Plus, Trash2, Edit3, X, Check } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { clothingItemApi, wardrobeApi, wardrobeZoneApi } from "../../../services/wardrobeService";
import { storageService } from "../../../services/storageService";
import { ClothingItem, Wardrobe, WardrobeZone } from "../../../types/wardrobe";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export function WardrobeOverview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const zoneId = searchParams.get("zoneId");
  const zoneName = searchParams.get("zoneName") || "Ngăn Kéo";

  const [allItems, setAllItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageUrlMap, setImageUrlMap] = useState<Record<string, string>>({});

  const PLACEHOLDER = "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=300&h=300&fit=crop";
  const getImageUrl = (itemId: string, imgId?: string) => {
    if (!imgId) return PLACEHOLDER;
    return imageUrlMap[itemId] ?? PLACEHOLDER;
  };

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit modal state
  const [editItem, setEditItem] = useState<ClothingItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editWardrobeId, setEditWardrobeId] = useState("");
  const [editZoneId, setEditZoneId] = useState("");
  const [wardrobes, setWardrobes] = useState<Wardrobe[]>([]);
  const [editZones, setEditZones] = useState<WardrobeZone[]>([]);
  const [loadingWardrobes, setLoadingWardrobes] = useState(false);
  const [loadingEditZones, setLoadingEditZones] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setImageUrlMap({}); // reset khi đổi zone để tránh ảnh cũ
      try {
        const data = zoneId 
          ? await clothingItemApi.getByZoneId(zoneId) 
          : await clothingItemApi.getAll();
        setAllItems(data);

        // Fetch pre-signed URLs cho từng item có ảnh
        const entries = await Promise.all(
          data
            .filter((item) => item.imageId)
            .map(async (item) => {
              try {
                const url = await storageService.getPresignedUrl(item.imageId!);
                return [item.itemId, url] as [string, string];
              } catch (err) {
                console.warn(`[WardrobeOverview] getPresignedUrl failed for ${item.imageId}:`, err);
                return null;
              }
            })
        );
        const urlMap: Record<string, string> = {};
        entries.forEach((e) => { if (e) urlMap[e[0]] = e[1]; });
        setImageUrlMap(urlMap);
      } catch (error) {
        console.error("Failed to fetch clothing items:", error);
      } finally {
        setLoading(false);

      }
    };
    fetchItems();
  }, [zoneId]);

  const filtered = allItems.filter((item) => {
    const matchesSearch = item.itemName.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await clothingItemApi.delete(deleteId);
      setAllItems((prev) => prev.filter((i) => i.itemId !== deleteId));
      toast.success("Dã xóa vật phẩm khỏi tủ đồ");
      setDeleteId(null);
    } catch {
      toast.error("Xóa thất bại, vui lòng thử lại");
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = async (item: ClothingItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditItem(item);
    setEditName(item.itemName);
    setEditZoneId(item.zoneId ?? "");
    setEditWardrobeId("");
    setEditZones([]);

    // Load danh sách tủ đồ
    setLoadingWardrobes(true);
    try {
      const ws = await wardrobeApi.getAll();
      setWardrobes(ws);

      // Tìm wardrobeId của zoneId hiện tại
      if (item.zoneId) {
        for (const w of ws) {
          try {
            const zones = await wardrobeZoneApi.getByWardrobeId(w.wardrobeId);
            if (zones.some((z) => z.zoneId === item.zoneId)) {
              setEditWardrobeId(w.wardrobeId);
              setEditZones(zones);
              break;
            }
          } catch {}
        }
      }
    } catch {
      toast.error("Không thể tải danh sách tủ đồ");
    } finally {
      setLoadingWardrobes(false);
    }
  };

  const handleWardrobeChange = async (wId: string) => {
    setEditWardrobeId(wId);
    setEditZoneId("");
    setEditZones([]);
    if (!wId) return;
    setLoadingEditZones(true);
    try {
      const zones = await wardrobeZoneApi.getByWardrobeId(wId);
      setEditZones(zones);
    } catch {
      toast.error("Không thể tải ngăn kéo");
    } finally {
      setLoadingEditZones(false);
    }
  };

  const handleEdit = async () => {
    if (!editItem || !editName.trim()) return;
    setEditing(true);
    try {
      const newZoneId = editZoneId || editItem.zoneId;
      const updated = await clothingItemApi.update(editItem.itemId, {
        itemName: editName.trim(),
        zoneId: newZoneId,
        imageId: editItem.imageId,          // ← giữ lại ảnh gốc
        categoryId: editItem.categoryId,    // ← giữ lại danh mục
        dominantColor: editItem.dominantColor,
        style: editItem.style,
        confidenceScore: editItem.confidenceScore,
      });

      const zoneChanged = editZoneId && editZoneId !== editItem.zoneId;

      if (zoneChanged) {
        // Item đã chuyển ngăn → xóa khỏi danh sách zone hiện tại
        // Giữ lại imageUrlMap entry để zone mới hiện ảnh ngay khi load
        setAllItems((prev) => prev.filter((i) => i.itemId !== editItem.itemId));
        toast.success("Đã di chuyển vật phẩm sang ngăn mới");
      } else {
        // Chỉ đổi tên → update in-place
        setAllItems((prev) =>
          prev.map((i) =>
            i.itemId === editItem.itemId
              ? { ...i, itemName: updated.itemName }
              : i
          )
        );
        toast.success("Đã cập nhật tên vật phẩm");
      }
      setEditItem(null);

    } catch {
      toast.error("Cập nhật thất bại");
    } finally {
      setEditing(false);
    }
  };



  return (
    <>
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {zoneId && (
            <button
              onClick={() => navigate(-1)}
              style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid #E2E8F0", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#475569", flexShrink: 0 }}
              title="Quay lại chọn ngăn kéo"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            {zoneId && (
              <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem", marginBottom: 2 }}>{zoneName}</h3>
            )}
            <p style={{ color: "#64748B", fontSize: "0.85rem" }}>{filtered.length} vật phẩm trong ngăn kéo của bạn</p>
          </div>
        </div>
        {zoneId && (
          <button
            onClick={() => navigate(`/app/wardrobe/add?zoneId=${zoneId}`)}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 12, background: "linear-gradient(135deg, #EA580C, #F97316)", color: "white", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}
          >
            <Plus size={15} />
            Thêm Trang Phục
          </button>
        )}
      </div>

      {/* Controls */}
      <div style={{ background: "white", borderRadius: 16, padding: "16px 20px", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F1F5F9", borderRadius: 10, padding: "9px 14px", flex: 1, minWidth: 200 }}>
          <Search size={15} color="#94A3B8" />
          <input
            placeholder="Tìm kiếm trang phục, thẻ..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ background: "none", border: "none", outline: "none", fontSize: "0.87rem", color: "#0F172A", width: "100%" }}
          />
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", background: "#F1F5F9", borderRadius: 10, padding: 3 }}>
          {(["grid", "list"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{ padding: "6px 10px", borderRadius: 8, background: viewMode === mode ? "white" : "transparent", border: "none", cursor: "pointer", boxShadow: viewMode === mode ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}
            >
              {mode === "grid" ? <Grid3X3 size={16} color={viewMode === mode ? "#EA580C" : "#94A3B8"} /> : <List size={16} color={viewMode === mode ? "#EA580C" : "#94A3B8"} />}
            </button>
          ))}
        </div>
      </div>

      {/* Grid/List */}
      {loading ? (
        <p>Đang tải vật phẩm...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", background: "white", borderRadius: 20, border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>👗</div>
          <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Không có vật phẩm nào</h3>
          <p style={{ color: "#64748B", fontSize: "0.9rem", marginBottom: 20 }}>Bạn chưa thêm vật phẩm nào vào ngăn kéo này.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
          {paginated.map((item) => (
            <div
              key={item.itemId}
              onClick={() => navigate(`/app/wardrobe/${item.itemId}`)}
              style={{ background: "white", borderRadius: 16, overflow: "hidden", border: "1px solid #E2E8F0", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", transition: "transform 0.2s, box-shadow 0.2s" }}
            >
              <div style={{ position: "relative" }}>
                <img src={getImageUrl(item.itemId, item.imageId)} alt={item.itemName} style={{ width: "100%", height: 180, objectFit: "cover" }} />
                <button
                  onClick={(e) => toggleFavorite(item.itemId, e)}
                  style={{ position: "absolute", top: 10, right: 10, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <Heart size={15} fill={favorites.has(item.itemId) ? "#EF4444" : "none"} color={favorites.has(item.itemId) ? "#EF4444" : "#94A3B8"} />
                </button>
                <div style={{ position: "absolute", bottom: 8, left: 8, background: "#10B981", color: "white", borderRadius: 6, padding: "2px 8px", fontSize: "0.65rem", fontWeight: 700 }}>
                  {item.confidenceScore ?? 100}% AI
                </div>
              </div>
              <div style={{ padding: "10px 14px" }}>
                <p style={{ fontWeight: 600, color: "#0F172A", fontSize: "0.88rem", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.itemName}</p>
                <p style={{ fontSize: "0.75rem", color: "#64748B", marginBottom: 8 }}>{item.dominantColor || "Không rõ màu"}</p>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                  {item.style && (
                    <span style={{ background: "#F1F5F9", color: "#64748B", borderRadius: 6, padding: "2px 8px", fontSize: "0.65rem" }}>{item.style}</span>
                  )}
                </div>
                {/* Action buttons */}
                <div style={{ display: "flex", gap: 6, borderTop: "1px solid #F1F5F9", paddingTop: 8 }}>
                  <button
                    onClick={(e) => openEdit(item, e)}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "6px", borderRadius: 8, border: "1.5px solid #E2E8F0", background: "white", cursor: "pointer", fontSize: "0.7rem", color: "#475569", fontWeight: 500 }}
                  >
                    <Edit3 size={12} /> Sửa
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteId(item.itemId); }}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "6px", borderRadius: 8, border: "1.5px solid #FEE2E2", background: "#FEF2F2", cursor: "pointer", fontSize: "0.7rem", color: "#EF4444", fontWeight: 500 }}
                  >
                    <Trash2 size={12} /> Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {paginated.map((item) => (
            <div
              key={item.itemId}
              onClick={() => navigate(`/app/wardrobe/${item.itemId}`)}
              style={{ background: "white", borderRadius: 14, padding: "12px 16px", border: "1px solid #E2E8F0", cursor: "pointer", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            >
              <img src={getImageUrl(item.itemId, item.imageId)} alt={item.itemName} style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, color: "#0F172A", fontSize: "0.88rem" }}>{item.itemName}</p>
                <p style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 2 }}>{item.dominantColor}</p>
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                {item.style && (
                  <span style={{ background: "#FFEDD5", color: "#EA580C", borderRadius: 6, padding: "3px 10px", fontSize: "0.7rem" }}>{item.style}</span>
                )}
              </div>
              <span style={{ background: "#ECFDF5", color: "#10B981", borderRadius: 6, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 700 }}>{item.confidenceScore ?? 100}%</span>
              <div style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => openEdit(item, e)}
                  style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #E2E8F0", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  title="Sửa tên"
                >
                  <Edit3 size={13} color="#64748B" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteId(item.itemId); }}
                  style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #FEE2E2", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  title="Xóa"
                >
                  <Trash2 size={13} color="#EF4444" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: 4 }}>
          <p style={{ fontSize: "0.8rem", color: "#64748B" }}>
            Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} trong {filtered.length} vật phẩm
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid #E2E8F0", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: currentPage === 1 ? "default" : "pointer", color: currentPage === 1 ? "#CBD5E1" : "#475569", opacity: currentPage === 1 ? 0.6 : 1 }}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  minWidth: 36, height: 36, padding: "0 6px", borderRadius: 10, cursor: "pointer", fontSize: "0.85rem",
                  border: p === currentPage ? "none" : "1.5px solid #E2E8F0",
                  background: p === currentPage ? "linear-gradient(135deg, #EA580C, #F97316)" : "white",
                  color: p === currentPage ? "white" : "#374151",
                  fontWeight: p === currentPage ? 700 : 500,
                  boxShadow: p === currentPage ? "0 2px 8px rgba(234,88,12,0.3)" : "none",
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid #E2E8F0", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: currentPage === totalPages ? "default" : "pointer", color: currentPage === totalPages ? "#CBD5E1" : "#475569", opacity: currentPage === totalPages ? 0.6 : 1 }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setDeleteId(null); }} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 20, padding: 32, maxWidth: 380, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.2)", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={24} color="#EF4444" />
            </div>
            <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Xóa Vật Phẩm?</h3>
            <p style={{ color: "#64748B", fontSize: "0.88rem", lineHeight: 1.6, marginBottom: 24 }}>
              <strong style={{ color: "#0F172A" }}>{allItems.find(i => i.itemId === deleteId)?.itemName}</strong> sẽ bị xóa vĩnh viễn khỏi tủ đồ.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: "11px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer" }}>Hủy</button>
              <button onClick={handleDelete} disabled={deleting} style={{ flex: 1, padding: "11px", borderRadius: 12, border: "none", background: deleting ? "#FCA5A5" : "#EF4444", color: "white", fontWeight: 700, cursor: "pointer" }}>
                {deleting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setEditItem(null); }} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 20, padding: 32, maxWidth: 460, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontWeight: 800, color: "#0F172A", fontSize: "1.05rem" }}>Chỉnh Sửa Vật Phẩm</h3>
              <button onClick={() => setEditItem(null)} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}><X size={16} color="#64748B" /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Tên */}
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Tên Vật Phẩm *</label>
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleEdit(); }}
                  style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* Tủ Đồ */}
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Di Chuyển Đến Tủ Đồ</label>
                <select
                  value={editWardrobeId}
                  onChange={(e) => handleWardrobeChange(e.target.value)}
                  disabled={loadingWardrobes}
                  style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: "0.88rem", outline: "none", background: "white", cursor: "pointer" }}
                >
                  <option value="">{loadingWardrobes ? "Đang tải..." : "-- Giữ nguyên --"}</option>
                  {wardrobes.map((w) => (
                    <option key={w.wardrobeId} value={w.wardrobeId}>{w.wardrobeName}</option>
                  ))}
                </select>
              </div>

              {/* Ngăn Kéo */}
              {editWardrobeId && (
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Chọn Ngăn Kéo</label>
                  <select
                    value={editZoneId}
                    onChange={(e) => setEditZoneId(e.target.value)}
                    disabled={loadingEditZones}
                    style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: "0.88rem", outline: "none", background: "white", cursor: "pointer" }}
                  >
                    <option value="">{loadingEditZones ? "Đang tải ngăn kéo..." : "-- Chọn ngăn kéo --"}</option>
                    {editZones.map((z) => (
                      <option key={z.zoneId} value={z.zoneId}>{z.zoneName}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setEditItem(null)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}>Hủy</button>
              <button onClick={handleEdit} disabled={editing || !editName.trim()} style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: editing ? "#FDBA74" : "linear-gradient(135deg, #EA580C, #F97316)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                <Check size={15} />
                {editing ? "Đang lưu..." : "Lưu Thay Đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

