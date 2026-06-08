import { useState, useEffect } from "react";
import { Search, Filter, Grid3X3, List, Plus, ChevronDown, Heart, Eye, ChevronLeft, ChevronRight, Loader2, Archive } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { clothingItemApi, categoryApi, wardrobeZoneApi, wardrobeApi } from "../../../services/wardrobeService";
import type { ClothingItem, Category } from "../../../types/wardrobe";

const sortOptions = ["Mới Nhất", "Cũ Nhất", "Tên A-Z"];

const PAGE_SIZE = 10;

export function WardrobeOverview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const zoneId = searchParams.get("zoneId");

  const [zoneName, setZoneName] = useState<string>("");
  const [parentWardrobeId, setParentWardrobeId] = useState<string>("");
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Tất Cả");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("Mới Nhất");
  const [sortOpen, setSortOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  // Fetch clothing items and categories on mount
  useEffect(() => {
    if (!zoneId) {
      navigate("/app/wardrobe");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [z, fetchedItems, fetchedCategories] = await Promise.all([
          wardrobeZoneApi.getById(zoneId),
          clothingItemApi.getByZoneId(zoneId),
          categoryApi.getAll(),
        ]);
        
        setZoneName(z.zoneName);
        setParentWardrobeId(z.wardrobeId);
        setCategories(fetchedCategories);
        setItems(fetchedItems);
        
      } catch (err) {
        toast.error("Không thể tải dữ liệu tủ đồ. Vui lòng thử lại.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [zoneId, navigate]);

  // Sort
  const sorted = [...items].sort((a, b) => {
    if (sort === "Mới Nhất") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === "Cũ Nhất") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sort === "Tên A-Z") return a.itemName.localeCompare(b.itemName);
    return 0;
  });

  // Filter by category (using categoryId matching)
  const activeCategoryObj = categories.find((c) => c.categoryName === activeCategory);
  const filtered = sorted.filter((item) => {
    const matchesCategory =
      activeCategory === "Tất Cả" ||
      (activeCategoryObj && item.categoryId === activeCategoryObj.categoryId);
    const matchesSearch = item.itemName.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await clothingItemApi.delete(id);
      setItems((prev) => prev.filter((i) => i.itemId !== id));
      toast.success("Đã xóa vật phẩm khỏi tủ đồ");
    } catch {
      toast.error("Xóa thất bại, vui lòng thử lại");
    }
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "—";
    return categories.find((c) => c.categoryId === categoryId)?.categoryName ?? "—";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <button
              onClick={() => navigate(parentWardrobeId ? `/app/wardrobe/zones?wardrobeId=${parentWardrobeId}` : "/app/wardrobe")}
              style={{ background: "#F1F5F9", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <ChevronLeft size={18} color="#64748B" />
            </button>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0F172A" }}>
              {zoneName ? zoneName : "Đang tải..."}
            </h2>
          </div>
          <p style={{ color: "#64748B", fontSize: "0.85rem", marginLeft: 40 }}>
            {loading ? "Đang tải..." : `${filtered.length} vật phẩm trong ngăn kéo này`}
          </p>
        </div>
        <div style={{ flex: 1 }}></div>
      </div>

      {/* Controls */}
      <div style={{ background: "white", borderRadius: 16, padding: "16px 20px", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F1F5F9", borderRadius: 10, padding: "9px 14px", flex: 1, minWidth: 200 }}>
          <Search size={15} color="#94A3B8" />
          <input
            placeholder="Tìm kiếm trang phục..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ background: "none", border: "none", outline: "none", fontSize: "0.87rem", color: "#0F172A", width: "100%" }}
          />
        </div>

        {/* Sort */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setSortOpen(!sortOpen)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "white", cursor: "pointer", fontSize: "0.85rem", color: "#374151", fontWeight: 500 }}
          >
            <Filter size={14} color="#64748B" />
            {sort}
            <ChevronDown size={13} color="#94A3B8" />
          </button>
          {sortOpen && (
            <div style={{ position: "absolute", top: 44, right: 0, background: "white", border: "1px solid #E2E8F0", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 10, minWidth: 180, overflow: "hidden" }}>
              {sortOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setSort(opt); setSortOpen(false); }}
                  style={{ display: "block", width: "100%", padding: "10px 16px", textAlign: "left", background: sort === opt ? "#EEF2FF" : "white", color: sort === opt ? "#4F46E5" : "#374151", border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: sort === opt ? 600 : 400 }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", background: "#F1F5F9", borderRadius: 10, padding: 3 }}>
          {(["grid", "list"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{ padding: "6px 10px", borderRadius: 8, background: viewMode === mode ? "white" : "transparent", border: "none", cursor: "pointer", boxShadow: viewMode === mode ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}
            >
              {mode === "grid" ? <Grid3X3 size={16} color={viewMode === mode ? "#4F46E5" : "#94A3B8"} /> : <List size={16} color={viewMode === mode ? "#4F46E5" : "#94A3B8"} />}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
        <button
          onClick={() => { setActiveCategory("Tất Cả"); setPage(1); }}
          style={{
            padding: "7px 18px", borderRadius: 20, border: "none", cursor: "pointer",
            background: activeCategory === "Tất Cả" ? "#4F46E5" : "white",
            color: activeCategory === "Tất Cả" ? "white" : "#64748B",
            fontWeight: activeCategory === "Tất Cả" ? 700 : 400,
            fontSize: "0.85rem", whiteSpace: "nowrap",
            boxShadow: activeCategory === "Tất Cả" ? "0 2px 8px rgba(79,70,229,0.3)" : "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          Tất Cả
          <span style={{ marginLeft: 6, fontSize: "0.72rem", opacity: 0.8 }}>({items.length})</span>
        </button>
        {categories.map((cat) => (
          <button
            key={cat.categoryId}
            onClick={() => { setActiveCategory(cat.categoryName); setPage(1); }}
            style={{
              padding: "7px 18px", borderRadius: 20, border: "none", cursor: "pointer",
              background: activeCategory === cat.categoryName ? "#4F46E5" : "white",
              color: activeCategory === cat.categoryName ? "white" : "#64748B",
              fontWeight: activeCategory === cat.categoryName ? 700 : 400,
              fontSize: "0.85rem", whiteSpace: "nowrap",
              boxShadow: activeCategory === cat.categoryName ? "0 2px 8px rgba(79,70,229,0.3)" : "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            {cat.categoryName}
            <span style={{ marginLeft: 6, fontSize: "0.72rem", opacity: 0.8 }}>
              ({items.filter((i) => i.categoryId === cat.categoryId).length})
            </span>
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px", background: "white", borderRadius: 20, border: "1px solid #E2E8F0" }}>
          <Loader2 size={32} color="#4F46E5" style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ marginLeft: 12, color: "#64748B", fontSize: "0.95rem" }}>Đang tải tủ đồ...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", background: "white", borderRadius: 20, border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>👗</div>
          <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Không tìm thấy vật phẩm</h3>
          <p style={{ color: "#64748B", fontSize: "0.9rem", marginBottom: 20 }}>Thử điều chỉnh tìm kiếm hoặc thêm quần áo mới</p>
          <button onClick={() => navigate(zoneId ? `/app/wardrobe/add?zoneId=${zoneId}` : "/app/wardrobe/add")} style={{ padding: "10px 20px", borderRadius: 12, background: "#4F46E5", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>
            Thêm Trang Phục
          </button>
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
                <div style={{ width: "100%", height: 180, background: "linear-gradient(135deg, #EEF2FF, #E0E7FF)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "3rem" }}>👕</span>
                </div>
                <button
                  onClick={(e) => toggleFavorite(item.itemId, e)}
                  style={{ position: "absolute", top: 10, right: 10, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <Heart size={15} fill={favorites.has(item.itemId) ? "#EF4444" : "none"} color={favorites.has(item.itemId) ? "#EF4444" : "#94A3B8"} />
                </button>
                {item.confidenceScore && (
                  <div style={{ position: "absolute", bottom: 8, left: 8, background: "#10B981", color: "white", borderRadius: 6, padding: "2px 8px", fontSize: "0.65rem", fontWeight: 700 }}>
                    {Math.round(item.confidenceScore * 100)}% AI
                  </div>
                )}
              </div>
              <div style={{ padding: "12px 14px" }}>
                <p style={{ fontWeight: 600, color: "#0F172A", fontSize: "0.88rem", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.itemName}</p>
                <p style={{ fontSize: "0.75rem", color: "#64748B", marginBottom: 8 }}>
                  {getCategoryName(item.categoryId)}{item.dominantColor ? ` · ${item.dominantColor}` : ""}
                </p>
                {item.style && (
                  <span style={{ background: "#F1F5F9", color: "#64748B", borderRadius: 6, padding: "2px 8px", fontSize: "0.65rem" }}>{item.style}</span>
                )}
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
              <div style={{ width: 56, height: 56, borderRadius: 10, background: "linear-gradient(135deg, #EEF2FF, #E0E7FF)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: "1.5rem" }}>👕</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, color: "#0F172A", fontSize: "0.88rem" }}>{item.itemName}</p>
                <p style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 2 }}>
                  {getCategoryName(item.categoryId)}{item.dominantColor ? ` · ${item.dominantColor}` : ""}
                </p>
              </div>
              {item.style && (
                <span style={{ background: "#EEF2FF", color: "#4F46E5", borderRadius: 6, padding: "3px 10px", fontSize: "0.7rem" }}>{item.style}</span>
              )}
              {item.confidenceScore && (
                <span style={{ background: "#ECFDF5", color: "#10B981", borderRadius: 6, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 700 }}>
                  {Math.round(item.confidenceScore * 100)}%
                </span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/app/wardrobe/${item.itemId}`); }}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
              >
                <Eye size={16} color="#94A3B8" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: 4 }}>
          <p style={{ fontSize: "0.8rem", color: "#64748B" }}>
            Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} trong {filtered.length} vật phẩm
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Trang trước"
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
                  background: p === currentPage ? "linear-gradient(135deg, #4F46E5, #8B5CF6)" : "white",
                  color: p === currentPage ? "white" : "#374151",
                  fontWeight: p === currentPage ? 700 : 500,
                  boxShadow: p === currentPage ? "0 2px 8px rgba(79,70,229,0.3)" : "none",
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Trang sau"
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
