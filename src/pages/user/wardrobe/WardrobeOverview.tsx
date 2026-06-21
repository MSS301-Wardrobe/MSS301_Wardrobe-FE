import { useEffect, useState } from "react";
import { Search, Filter, Grid3X3, List, ChevronDown, Heart, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { clothingItemApi } from "../../../services/wardrobeService";
import { ClothingItem } from "../../../types/wardrobe";

const PAGE_SIZE = 10;

export function WardrobeOverview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const zoneId = searchParams.get("zoneId");

  const [allItems, setAllItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const data = zoneId 
          ? await clothingItemApi.getByZoneId(zoneId) 
          : await clothingItemApi.getAll();
        setAllItems(data);
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

  const getImageUrl = (imgId?: string) => {
    if (!imgId) return "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=300&h=300&fit=crop";
    if (imgId.startsWith("http")) return imgId;
    return `http://localhost:8080/api/v1/storage/files/${imgId}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ color: "#64748B", fontSize: "0.85rem", marginTop: 2 }}>{filtered.length} vật phẩm trong ngăn kéo của bạn</p>
        </div>
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
                <img src={getImageUrl(item.imageId)} alt={item.itemName} style={{ width: "100%", height: 180, objectFit: "cover" }} />
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
              <div style={{ padding: "12px 14px" }}>
                <p style={{ fontWeight: 600, color: "#0F172A", fontSize: "0.88rem", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.itemName}</p>
                <p style={{ fontSize: "0.75rem", color: "#64748B", marginBottom: 8 }}>{item.dominantColor || "Không rõ màu"}</p>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {item.style && (
                    <span style={{ background: "#F1F5F9", color: "#64748B", borderRadius: 6, padding: "2px 8px", fontSize: "0.65rem" }}>{item.style}</span>
                  )}
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
              <img src={getImageUrl(item.imageId)} alt={item.itemName} style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
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
              <Eye size={16} color="#94A3B8" />
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
  );
}
