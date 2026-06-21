import { useState } from "react";
import { Search, Trash2, Download, Grid3X3, ChevronDown, X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import { storageService } from "../../../services/storageService";

const sortOptions = ["Mới Nhất", "Cũ Nhất", "Lớn Nhất", "Nhỏ Nhất", "Tên A-Z"];

const PAGE_SIZE = 10;



export function ImageLibrary() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Mới Nhất");
  const [sortOpen, setSortOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const data = await storageService.listImages();
        const mapped = data.map(img => ({
          id: img.id,
          name: img.name || "Không rõ tên",
          size: img.size ? `${img.size} MB` : "0 MB",
          date: img.createdAt ? new Date(img.createdAt).toLocaleDateString("vi-VN") : "Hôm nay",
          category: "Chưa phân loại",
          img: img.url
        }));
        setImages(mapped);
      } catch (err) {
        toast.error("Không thể tải thư viện ảnh");
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  const filtered = images.filter((img) =>
    img.name.toLowerCase().includes(search.toLowerCase()) ||
    img.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deleteSelected = () => {
    setImages((prev) => prev.filter((img) => !selected.has(img.id)));
    toast.success(`Đã xóa ${selected.size} hình ảnh`);
    setSelected(new Set());
  };

  const deleteSingle = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    toast.success("Đã xóa hình ảnh");
    if (preview?.id === id) setPreview(null);
  };

  const totalSize = images.reduce((sum, img) => sum + parseFloat(img.size), 0).toFixed(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stats bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Tổng Hình Ảnh", value: String(images.length) },
          { label: "Tổng Dung Lượng", value: `${totalSize} MB` },
          { label: "Tháng Này", value: "12" },
          { label: "Danh Mục", value: "6" },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "white", borderRadius: 14, padding: "16px 18px", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <p style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 500 }}>{label}</p>
            <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0F172A", marginTop: 4 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ background: "white", borderRadius: 16, padding: "14px 18px", border: "1px solid #E2E8F0", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 8, background: "#F1F5F9", borderRadius: 10, padding: "9px 14px" }}>
          <Search size={15} color="#94A3B8" />
          <input
            placeholder="Tìm kiếm hình ảnh..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ background: "none", border: "none", outline: "none", fontSize: "0.87rem", color: "#0F172A", width: "100%" }}
          />
        </div>

        {/* Sort */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setSortOpen(!sortOpen)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "white", cursor: "pointer", fontSize: "0.85rem", color: "#374151" }}
          >
            <Grid3X3 size={14} color="#64748B" />
            {sort}
            <ChevronDown size={13} color="#94A3B8" />
          </button>
          {sortOpen && (
            <div style={{ position: "absolute", top: 44, right: 0, background: "white", border: "1px solid #E2E8F0", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 10, minWidth: 180, overflow: "hidden" }}>
              {sortOptions.map((opt) => (
                <button key={opt} onClick={() => { setSort(opt); setSortOpen(false); }} style={{ display: "block", width: "100%", padding: "10px 16px", textAlign: "left", background: sort === opt ? "#FFEDD5" : "white", color: sort === opt ? "#EA580C" : "#374151", border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: sort === opt ? 600 : 400 }}>
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {selected.size > 0 && (
          <button onClick={deleteSelected} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "1.5px solid #FEE2E2", background: "#FEF2F2", color: "#EF4444", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>
            <Trash2 size={14} />
            Delete ({selected.size})
          </button>
        )}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
        {paginated.map((img) => (
          <div
            key={img.id}
            style={{
              background: "white", borderRadius: 14, overflow: "hidden",
              border: `1.5px solid ${selected.has(img.id) ? "#EA580C" : "#E2E8F0"}`,
              boxShadow: selected.has(img.id) ? "0 0 0 3px #FFEDD5" : "0 2px 8px rgba(0,0,0,0.04)",
              cursor: "pointer", position: "relative",
            }}
          >
            <div style={{ position: "relative" }} onClick={() => setPreview(img)}>
              <img src={img.img} alt={img.name} style={{ width: "100%", height: 150, objectFit: "cover" }} />
              <div className="overlay" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", transition: "background 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ZoomIn size={24} color="white" style={{ opacity: 0 }} />
              </div>
            </div>

            {/* Checkbox */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleSelect(img.id); }}
              style={{ position: "absolute", top: 8, left: 8, width: 22, height: 22, borderRadius: 6, background: selected.has(img.id) ? "#EA580C" : "rgba(255,255,255,0.9)", border: `1.5px solid ${selected.has(img.id) ? "#EA580C" : "#E2E8F0"}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {selected.has(img.id) && <span style={{ color: "white", fontSize: "0.7rem" }}>✓</span>}
            </button>

            <div style={{ padding: "10px 12px" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.name}</p>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: "0.65rem", color: "#94A3B8" }}>{img.size}</span>
                <span style={{ fontSize: "0.65rem", color: "#94A3B8" }}>{img.date}</span>
              </div>
              <span style={{ display: "inline-block", marginTop: 6, background: "#FFEDD5", color: "#EA580C", borderRadius: 5, padding: "2px 8px", fontSize: "0.62rem", fontWeight: 600 }}>{img.category}</span>
            </div>

            {/* Delete button */}
            <button
              onClick={(e) => { e.stopPropagation(); deleteSingle(img.id); }}
              style={{ position: "absolute", top: 8, right: 8, width: 24, height: 24, borderRadius: 6, background: "rgba(239,68,68,0.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Trash2 size={12} color="white" />
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: "0.8rem", color: "#64748B" }}>
            Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} trong {filtered.length} hình ảnh
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

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 24px", background: "white", borderRadius: 20, border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🖼️</div>
          <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Không tìm thấy hình ảnh</h3>
          <p style={{ color: "#64748B", fontSize: "0.9rem" }}>Thử điều chỉnh từ khóa tìm kiếm</p>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.85)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 20, overflow: "hidden", maxWidth: 600, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
            <img src={preview.img} alt={preview.name} style={{ width: "100%", height: 360, objectFit: "cover" }} />
            <div style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem" }}>{preview.name}</p>
                <p style={{ fontSize: "0.8rem", color: "#64748B", marginTop: 2 }}>{preview.size} · {preview.date} · {preview.category}</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => toast.success("Đã tải xuống!")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "white", cursor: "pointer", color: "#374151", fontSize: "0.85rem", fontWeight: 500 }}>
                  <Download size={14} />
                  Tải Xuống
                </button>
                <button onClick={() => { deleteSingle(preview.id); setPreview(null); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "1.5px solid #FEE2E2", background: "#FEF2F2", cursor: "pointer", color: "#EF4444", fontSize: "0.85rem", fontWeight: 500 }}>
                  <Trash2 size={14} />
                  Xóa
                </button>
                <button onClick={() => setPreview(null)} style={{ padding: "9px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "white", cursor: "pointer" }}>
                  <X size={16} color="#64748B" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
