import { useState } from "react";
import { Search, Filter, Grid3X3, List, Plus, ChevronDown, Heart, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";

const categories = ["Tất Cả", "Áo", "Quần", "Váy", "Áo Khoác", "Phụ Kiện", "Giày Dép"];

const allItems = [
  { id: "1", name: "Áo Sơ Mi Oxford Trắng", category: "Áo", color: "Trắng", tags: ["trang trọng", "văn phòng"], img: "https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=300&h=300&fit=crop", favorite: true, confidence: 97 },
  { id: "2", name: "Quần Jeans Slim Tối", category: "Quần", color: "Chàm", tags: ["thường ngày", "denim"], img: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=300&h=300&fit=crop", favorite: false, confidence: 98 },
  { id: "3", name: "Áo Thun Nữ Đa Màu", category: "Áo", color: "Nhiều Màu", tags: ["thường ngày"], img: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=300&h=300&fit=crop", favorite: true, confidence: 95 },
  { id: "4", name: "Giày Thể Thao Trắng", category: "Giày Dép", color: "Trắng", tags: ["thường ngày", "thể thao"], img: "https://images.unsplash.com/photo-1544441893-675973e31985?w=300&h=300&fit=crop", favorite: false, confidence: 99 },
  { id: "5", name: "Mũ Len Cam", category: "Phụ Kiện", color: "Cam", tags: ["mùa đông", "thường ngày"], img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300&h=300&fit=crop", favorite: false, confidence: 94 },
  { id: "6", name: "Giày Boots Da Nâu", category: "Giày Dép", color: "Nâu", tags: ["thu đông", "lịch sự"], img: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=300&h=300&fit=crop", favorite: true, confidence: 96 },
  { id: "7", name: "Thắt Lưng & Giày Da", category: "Phụ Kiện", color: "Nâu", tags: ["trang trọng", "công sở"], img: "https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=300&h=300&fit=crop", favorite: false, confidence: 93 },
  { id: "8", name: "Quần Jeans Denim", category: "Quần", color: "Xanh", tags: ["thường ngày", "denim"], img: "https://images.unsplash.com/photo-1617178388553-a9d022974a5c?w=300&h=300&fit=crop", favorite: true, confidence: 98 },
  { id: "9", name: "Áo Trắng Tối Giản", category: "Áo", color: "Trắng", tags: ["tối giản", "thanh lịch"], img: "https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?w=300&h=300&fit=crop", favorite: false, confidence: 91 },
  { id: "10", name: "Áo Vest Đen", category: "Áo Khoác", color: "Đen", tags: ["trang trọng", "văn phòng"], img: "https://images.unsplash.com/photo-1731589802956-b4693dae884b?w=300&h=300&fit=crop", favorite: true, confidence: 97 },
  { id: "11", name: "Váy Dạ Hội Đỏ", category: "Váy", color: "Đỏ", tags: ["tiệc tùng", "thanh lịch"], img: "https://images.unsplash.com/photo-1617690033147-ce6b332d677b?w=300&h=300&fit=crop", favorite: true, confidence: 95 },
  { id: "12", name: "Áo Vest Trắng Công Sở", category: "Áo Khoác", color: "Trắng", tags: ["công sở", "trang trọng"], img: "https://images.unsplash.com/photo-1700557477506-369b241cbe54?w=300&h=300&fit=crop", favorite: false, confidence: 93 },
];

const sortOptions = ["Mới Nhất", "Cũ Nhất", "Tên A-Z", "Danh Mục", "Độ Tin Cậy"];

const PAGE_SIZE = 10;

export function WardrobeOverview() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("Tất Cả");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("Mới Nhất");
  const [sortOpen, setSortOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(allItems.filter((i) => i.favorite).map((i) => i.id)));
  const [page, setPage] = useState(1);

  const filtered = allItems.filter((item) => {
    const matchesCategory = activeCategory === "Tất Cả" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.tags.some((t) => t.includes(search.toLowerCase()));
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ color: "#64748B", fontSize: "0.85rem", marginTop: 2 }}>{filtered.length} vật phẩm trong tủ đồ của bạn</p>
        </div>
        <button
          onClick={() => navigate("/app/wardrobe/add")}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 12, background: "linear-gradient(135deg, #EA580C, #F97316)", color: "white", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.88rem" }}
        >
          <Plus size={15} />
          Thêm Vật Phẩm
        </button>
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
                  style={{ display: "block", width: "100%", padding: "10px 16px", textAlign: "left", background: sort === opt ? "#FFEDD5" : "white", color: sort === opt ? "#EA580C" : "#374151", border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: sort === opt ? 600 : 400 }}
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
              {mode === "grid" ? <Grid3X3 size={16} color={viewMode === mode ? "#EA580C" : "#94A3B8"} /> : <List size={16} color={viewMode === mode ? "#EA580C" : "#94A3B8"} />}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setPage(1); }}
            style={{
              padding: "7px 18px", borderRadius: 20, border: "none", cursor: "pointer",
              background: activeCategory === cat ? "#EA580C" : "white",
              color: activeCategory === cat ? "white" : "#64748B",
              fontWeight: activeCategory === cat ? 700 : 400,
              fontSize: "0.85rem", whiteSpace: "nowrap",
              boxShadow: activeCategory === cat ? "0 2px 8px rgba(234,88,12,0.3)" : "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            {cat}
            {cat !== "All" && (
              <span style={{ marginLeft: 6, fontSize: "0.72rem", opacity: 0.8 }}>
                ({allItems.filter((i) => i.category === cat).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid/List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", background: "white", borderRadius: 20, border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>👗</div>
          <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Không tìm thấy vật phẩm</h3>
          <p style={{ color: "#64748B", fontSize: "0.9rem", marginBottom: 20 }}>Thử điều chỉnh tìm kiếm hoặc bộ lọc</p>
          <button onClick={() => navigate("/app/wardrobe/add")} style={{ padding: "10px 20px", borderRadius: 12, background: "#EA580C", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>
            Thêm Trang Phục
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
          {paginated.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/app/wardrobe/${item.id}`)}
              style={{ background: "white", borderRadius: 16, overflow: "hidden", border: "1px solid #E2E8F0", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", transition: "transform 0.2s, box-shadow 0.2s" }}
            >
              <div style={{ position: "relative" }}>
                <img src={item.img} alt={item.name} style={{ width: "100%", height: 180, objectFit: "cover" }} />
                <button
                  onClick={(e) => toggleFavorite(item.id, e)}
                  style={{ position: "absolute", top: 10, right: 10, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <Heart size={15} fill={favorites.has(item.id) ? "#EF4444" : "none"} color={favorites.has(item.id) ? "#EF4444" : "#94A3B8"} />
                </button>
                <div style={{ position: "absolute", bottom: 8, left: 8, background: "#10B981", color: "white", borderRadius: 6, padding: "2px 8px", fontSize: "0.65rem", fontWeight: 700 }}>
                  {item.confidence}% AI
                </div>
              </div>
              <div style={{ padding: "12px 14px" }}>
                <p style={{ fontWeight: 600, color: "#0F172A", fontSize: "0.88rem", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                <p style={{ fontSize: "0.75rem", color: "#64748B", marginBottom: 8 }}>{item.category} · {item.color}</p>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {item.tags.slice(0, 2).map((tag) => (
                    <span key={tag} style={{ background: "#F1F5F9", color: "#64748B", borderRadius: 6, padding: "2px 8px", fontSize: "0.65rem" }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {paginated.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/app/wardrobe/${item.id}`)}
              style={{ background: "white", borderRadius: 14, padding: "12px 16px", border: "1px solid #E2E8F0", cursor: "pointer", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            >
              <img src={item.img} alt={item.name} style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, color: "#0F172A", fontSize: "0.88rem" }}>{item.name}</p>
                <p style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 2 }}>{item.category} · {item.color}</p>
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                {item.tags.slice(0, 2).map((tag) => (
                  <span key={tag} style={{ background: "#FFEDD5", color: "#EA580C", borderRadius: 6, padding: "3px 10px", fontSize: "0.7rem" }}>{tag}</span>
                ))}
              </div>
              <span style={{ background: "#ECFDF5", color: "#10B981", borderRadius: 6, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 700 }}>{item.confidence}%</span>
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
