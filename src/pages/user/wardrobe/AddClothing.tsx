import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Upload, X, Cpu, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { clothingItemApi, categoryApi, wardrobeZoneApi } from "../../../services/wardrobeService";
import type { Category, WardrobeZone } from "../../../types/wardrobe";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  border: "1.5px solid #E2E8F0",
  borderRadius: 10,
  fontSize: "0.88rem",
  color: "#0F172A",
  background: "white",
  outline: "none",
  boxSizing: "border-box",
};

const colors = ["Đen", "Trắng", "Xanh Đậm", "Chàm", "Tím", "Đỏ", "Hồng", "Cam", "Vàng", "Xanh Lá", "Xanh Mòng Két", "Xám", "Nâu", "Be", "Nhiều Màu"];
const styles = ["Trang Trọng", "Thường Ngày", "Thể Thao", "Tiệc Tùng", "Du Lịch", "Tối Giản", "Công Sở"];

export function AddClothing() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingAiRef = useRef<{
    classKey: string;
    categoryName: string;
    color: string;
    formStyle: string;
    confidence: number;
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [aiDetecting, setAiDetecting] = useState(false);
  const [aiResult, setAiResult] = useState<{ categoryName: string; confidence: number; color: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Real data from API
  const [categories, setCategories] = useState<Category[]>([]);
  const [zones, setZones] = useState<WardrobeZone[]>([]);

  const [form, setForm] = useState({
    itemName: "",
    categoryId: "",
    zoneId: initialZoneId || "",
    dominantColor: "",
    style: "",
    confidenceScore: undefined as number | undefined,
  });

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [cats, zns] = await Promise.all([
          categoryApi.getAll(),
          wardrobeZoneApi.getAll(), // Fetch all zones to match ID with name, but dropdown will be disabled
        ]);
        setCategories(cats);
        setZones(zns);
      } catch {
        toast.error("Không thể tải danh mục và ngăn kéo");
      }
    };
    fetchMeta();
  }, []);

  const handleFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    setAiDetecting(true);
    setAiResult(null);
    // Simulate AI detection (would hook into ai-detection-service in the future)
    await new Promise((r) => setTimeout(r, 1800));
    setAiDetecting(false);
    const detectedConfidence = 0.947;
    const result = { categoryName: categories[0]?.categoryName ?? "Áo", confidence: detectedConfidence, color: "Trắng" };
    setAiResult(result);
    // Auto-fill form with AI result
    const matchedCat = categories.find((c) => c.categoryName === result.categoryName);
    setForm((f) => ({
      ...f,
      categoryId: matchedCat?.categoryId ?? f.categoryId,
      dominantColor: result.color,
      itemName: f.itemName || "Vật phẩm đã nhận diện",
      confidenceScore: result.confidence,
    }));
    toast.success("Nhận diện AI hoàn tất!");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const toggleOccasion = (occ: string) => {
    setForm((f) => ({
      ...f,
      occasion: f.occasion.includes(occ) ? f.occasion.filter((o) => o !== occ) : [...f.occasion, occ],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview) { toast.error("Vui lòng tải lên hình ảnh trang phục"); return; }
    if (!form.name || !form.category) { toast.error("Tên và danh mục là bắt buộc"); return; }
    toast.success("Đã thêm vật phẩm vào tủ đồ của bạn!");
    setTimeout(() => navigate("/app/wardrobe"), 600);
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <button
        onClick={() => navigate("/app/wardrobe")}
        style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", background: "none", border: "none", cursor: "pointer", marginBottom: 20, fontSize: "0.875rem" }}
      >
        <ArrowLeft size={16} />
        Quay Lại Tủ Đồ
      </button>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24, alignItems: "start" }}>
          {/* Upload Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 16, fontSize: "1rem" }}>Tải Lên Ảnh</h3>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !preview && fileRef.current?.click()}
                style={{
                  borderRadius: 16, border: `2px dashed ${dragOver ? "#EA580C" : preview ? "#E2E8F0" : "#FED7AA"}`,
                  background: dragOver ? "#FFEDD5" : "#F8FAFC",
                  cursor: preview ? "default" : "pointer",
                  transition: "all 0.2s", position: "relative", overflow: "hidden",
                  minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {preview ? (
                  <div style={{ position: "relative", width: "100%", height: 300 }}>
                    <img src={preview} alt="Preview" style={{ width: "100%", height: 300, objectFit: "cover", borderRadius: 14 }} />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setPreview(null); setAiResult(null); }}
                      style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(15,23,42,0.8)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <X size={14} color="white" />
                    </button>
                    {aiDetecting && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(234,88,12,0.7)", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,0.3)", borderTop: "3px solid white", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: 12 }} />
                        <p style={{ color: "white", fontWeight: 600, fontSize: "0.9rem" }}>Đang Nhận Diện AI...</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: 32 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: "#FFEDD5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <Upload size={24} color="#EA580C" />
                    </div>
                    <p style={{ fontWeight: 600, color: "#0F172A", marginBottom: 6 }}>Thả ảnh vào đây</p>
                    <p style={{ fontSize: "0.8rem", color: "#64748B", marginBottom: 16 }}>hoặc nhấn để duyệt</p>
                    <p style={{ fontSize: "0.72rem", color: "#94A3B8" }}>PNG, JPG, WEBP tối đa 10MB</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileInput} style={{ display: "none" }} />

              {!preview && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{ width: "100%", marginTop: 12, padding: "11px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.88rem" }}
                >
                  Duyệt Tệp
                </button>
              )}
            </div>

            {/* AI Result */}
            {aiResult && (
              <div style={{ background: "#ECFDF5", borderRadius: 16, padding: 20, border: "1px solid #A7F3D0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <Cpu size={16} color="#10B981" />
                  <span style={{ fontWeight: 700, color: "#059669", fontSize: "0.9rem" }}>Nhận Diện AI Hoàn Tất</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", borderRadius: 10, padding: "10px 14px" }}>
                    <span style={{ fontSize: "0.82rem", color: "#374151", fontWeight: 500 }}>Danh Mục</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.88rem" }}>{aiResult.category}</span>
                      <Check size={14} color="#10B981" />
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", borderRadius: 10, padding: "10px 14px" }}>
                    <span style={{ fontSize: "0.82rem", color: "#374151", fontWeight: 500 }}>Độ Tin Cậy</span>
                    <span style={{ fontWeight: 700, color: "#10B981", fontSize: "0.88rem" }}>{aiResult.confidence}%</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", borderRadius: 10, padding: "10px 14px" }}>
                    <span style={{ fontSize: "0.82rem", color: "#374151", fontWeight: 500 }}>Màu Đã Phát Hiện</span>
                    <span style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.88rem" }}>{aiResult.color}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", borderRadius: 10, padding: "10px 14px" }}>
                    <span style={{ fontSize: "0.82rem", color: "#374151", fontWeight: 500 }}>Phong Cách</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.88rem" }}>{aiResult.style}</span>
                      <Check size={14} color="#10B981" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Panel */}
          <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 24, fontSize: "1rem" }}>Chi Tiết Trang Phục</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Name */}
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Tên Vật Phẩm *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Vd: Áo Sơ Mi Oxford Trắng" required style={inputStyle} />
              </div>

              {/* Category */}
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Danh Mục *</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {categories.map((cat) => (
                    <button
                      key={cat} type="button"
                      onClick={() => setForm({ ...form, category: cat })}
                      style={{
                        padding: "7px 16px", borderRadius: 20, border: `1.5px solid ${form.category === cat ? "#EA580C" : "#E2E8F0"}`,
                        background: form.category === cat ? "#FFEDD5" : "white",
                        color: form.category === cat ? "#EA580C" : "#64748B",
                        fontWeight: form.category === cat ? 700 : 400,
                        cursor: "pointer", fontSize: "0.82rem",
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color + Size */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Màu Sắc</label>
                  <select value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="">Chọn màu</option>
                    {colors.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Kích Thước</label>
                  <select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="">Chọn size</option>
                    {["XS", "S", "M", "L", "XL", "XXL", "Custom"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Brand + Material */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Thương Hiệu</label>
                  <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Vd: Uniqlo, Zara" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Chất Liệu</label>
                  <input type="text" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} placeholder="Vd: 100% Cotton" style={inputStyle} />
                </div>
              </div>

              {/* Occasions */}
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Dịp Mặc</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {occasions.map((occ) => (
                    <button
                      key={occ} type="button"
                      onClick={() => toggleOccasion(occ)}
                      style={{
                        padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${form.occasion.includes(occ) ? "#F97316" : "#E2E8F0"}`,
                        background: form.occasion.includes(occ) ? "#F5F3FF" : "white",
                        color: form.occasion.includes(occ) ? "#F97316" : "#64748B",
                        fontWeight: form.occasion.includes(occ) ? 600 : 400,
                        cursor: "pointer", fontSize: "0.8rem",
                      }}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Thẻ</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <Tag size={15} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="text" value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                      placeholder="Thêm thẻ..."
                      style={{ ...inputStyle, paddingLeft: 36 }}
                    />
                  </div>
                  <button type="button" onClick={addTag} style={{ padding: "11px 16px", borderRadius: 10, border: "none", background: "#EA580C", color: "white", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>Thêm</button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {tags.map((tag) => (
                    <span key={tag} style={{ background: "#FFEDD5", color: "#EA580C", borderRadius: 20, padding: "4px 12px", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: 6 }}>
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                        <X size={12} color="#EA580C" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Ghi Chú Cá Nhân</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Ghi chú về vật phẩm này..." style={{ ...inputStyle, resize: "vertical", fontFamily: "Inter, sans-serif" }} />
              </div>

              {/* Submit */}
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => navigate("/app/wardrobe")} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "white", color: "#0F172A", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}>
                  Hủy
                </button>
                <button type="submit" style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #EA580C, #F97316)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" }}>
                  Thêm Vào Tủ Đồ
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
