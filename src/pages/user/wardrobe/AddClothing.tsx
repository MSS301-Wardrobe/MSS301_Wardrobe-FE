import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Upload, X, Cpu, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  clothingItemApi,
  categoryApi,
  ensureAiCategoryCatalog,
  resolveCategoryFromAi,
  wardrobeZoneApi,
} from "../../../services/wardrobeService";
import { aiService } from "../../../services/aiService";
import {
  mapAiStyleToFormStyle,
  translateBaseColor,
  translateCategory,
  translateStyle,
} from "../../../utils/aiMappings";
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
const styles = ["Trang Trọng", "Thanh Lịch", "Thường Ngày", "Thể Thao", "Tiệc Tùng", "Du Lịch", "Tối Giản", "Công Sở"];

export function AddClothing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialZoneId = searchParams.get("zoneId");

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [aiDetecting, setAiDetecting] = useState(false);
  const [aiResult, setAiResult] = useState<{
    categoryName: string;
    confidence: number;
    color: string;
    style: string;
  } | null>(null);
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

  const applyAiToForm = useCallback(
    async (
      detection: {
        classKey: string;
        categoryName: string;
        color: string;
        formStyle: string;
        confidence: number;
      },
      cats: Category[]
    ) => {
      const { category, categories: updatedCategories } = await resolveCategoryFromAi(
        cats,
        detection.classKey,
        detection.categoryName
      );

      if (updatedCategories.length !== cats.length) {
        setCategories(updatedCategories);
      }

      setForm((f) => ({
        ...f,
        categoryId: category?.categoryId ?? f.categoryId,
        dominantColor: detection.color,
        style: detection.formStyle || f.style,
        confidenceScore: detection.confidence,
      }));

      if (category?.categoryId) {
        pendingAiRef.current = null;
      }
    },
    []
  );

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [cats, zns] = await Promise.all([
          categoryApi.getAll(),
          wardrobeZoneApi.getAll(), // Fetch all zones to match ID with name, but dropdown will be disabled
        ]);
        const syncedCategories = await ensureAiCategoryCatalog(cats);
        setCategories(syncedCategories);
        setZones(zns);
      } catch {
        toast.error("Không thể tải danh mục và ngăn kéo");
      }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    if (pendingAiRef.current) {
      void applyAiToForm(pendingAiRef.current, categories);
    }
  }, [categories, applyAiToForm]);

  const handleFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    setSelectedFile(file);
    setAiDetecting(true);
    setAiResult(null);

    try {
      const response = await aiService.detect(file);
      const primary = response.detections[0];

      if (!primary) {
        toast.error("Không phát hiện trang phục nào trong ảnh");
        return;
      }

      const categoryName = translateCategory(primary.class_name);
      const colorName = translateBaseColor(primary.dominant_color.base_color);
      const styleLabel = translateStyle(primary.style);
      const formStyle = mapAiStyleToFormStyle(primary.style);

      const result = {
        categoryName,
        confidence: primary.confidence,
        color: colorName,
        style: styleLabel,
      };

      setAiResult(result);

      const detection = {
        classKey: primary.class_name,
        categoryName,
        color: colorName,
        formStyle,
        confidence: primary.confidence,
      };
      pendingAiRef.current = detection;
      await applyAiToForm(detection, categories);

      toast.success("Nhận diện AI hoàn tất!");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string; detail?: string } } })
          .response?.data?.message ||
        (error as { response?: { data?: { message?: string; detail?: string } } })
          .response?.data?.detail ||
        (error as Error).message ||
        "Nhận diện AI thất bại";
      toast.error(message);
    } finally {
      setAiDetecting(false);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemName.trim()) {
      toast.error("Vui lòng nhập tên vật phẩm");
      return;
    }
    setSubmitting(true);
    try {
      await clothingItemApi.create({
        itemName: form.itemName,
        categoryId: form.categoryId || undefined,
        zoneId: form.zoneId || undefined,
        dominantColor: form.dominantColor || undefined,
        style: form.style || undefined,
        confidenceScore: form.confidenceScore,
        // imageId would come from storage-service upload in a full flow
      });
      toast.success("Đã thêm vật phẩm vào tủ đồ!");
      setTimeout(() => {
        if (initialZoneId) navigate(`/app/wardrobe/items?zoneId=${initialZoneId}`);
        else navigate("/app/wardrobe");
      }, 600);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Thêm thất bại, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <button
        type="button"
        onClick={() => {
          if (initialZoneId) navigate(`/app/wardrobe/items?zoneId=${initialZoneId}`);
          else navigate("/app/wardrobe");
        }}
        style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", background: "none", border: "none", cursor: "pointer", marginBottom: 20, fontSize: "0.875rem" }}
      >
        <ArrowLeft size={16} />
        {initialZoneId ? "Quay Lại Ngăn Kéo" : "Quay Lại Tủ Đồ"}
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
                  borderRadius: 16, border: `2px dashed ${dragOver ? "#4F46E5" : preview ? "#E2E8F0" : "#C7D2FE"}`,
                  background: dragOver ? "#EEF2FF" : "#F8FAFC",
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
                      onClick={(e) => { e.stopPropagation(); setPreview(null); setAiResult(null); setSelectedFile(null); }}
                      style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(15,23,42,0.8)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <X size={14} color="white" />
                    </button>
                    {aiDetecting && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(79,70,229,0.7)", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,0.3)", borderTop: "3px solid white", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: 12 }} />
                        <p style={{ color: "white", fontWeight: 600, fontSize: "0.9rem" }}>Đang Nhận Diện AI...</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: 32 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <Upload size={24} color="#4F46E5" />
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
                      <span style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.88rem" }}>{aiResult.categoryName}</span>
                      <Check size={14} color="#10B981" />
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", borderRadius: 10, padding: "10px 14px" }}>
                    <span style={{ fontSize: "0.82rem", color: "#374151", fontWeight: 500 }}>Độ Tin Cậy</span>
                    <span style={{ fontWeight: 700, color: "#10B981", fontSize: "0.88rem" }}>{(aiResult.confidence * 100).toFixed(1)}%</span>
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
                <input
                  type="text"
                  value={form.itemName}
                  onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                  placeholder="Vd: Áo Sơ Mi Oxford Trắng"
                  required
                  style={inputStyle}
                />
              </div>

              {/* Category */}
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Danh Mục</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                  ))}
                </select>
              </div>

              {/* Zone */}
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Ngăn Kéo</label>
                <select
                  value={form.zoneId}
                  onChange={(e) => setForm({ ...form, zoneId: e.target.value })}
                  style={{ ...inputStyle, cursor: initialZoneId ? "not-allowed" : "pointer", background: initialZoneId ? "#F8FAFC" : "white" }}
                  disabled={!!initialZoneId}
                >
                  <option value="">Chọn ngăn kéo</option>
                  {zones.map((z) => (
                    <option key={z.zoneId} value={z.zoneId}>{z.zoneName}</option>
                  ))}
                </select>
              </div>

              {/* Color + Style */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Màu Chủ Đạo</label>
                  <select
                    value={form.dominantColor}
                    onChange={(e) => setForm({ ...form, dominantColor: e.target.value })}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    <option value="">Chọn màu</option>
                    {colors.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Phong Cách</label>
                  <select
                    value={form.style}
                    onChange={(e) => setForm({ ...form, style: e.target.value })}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    <option value="">Chọn phong cách</option>
                    {styles.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Confidence Score */}
              {aiResult && (
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                    Độ Tin Cậy AI: {form.confidenceScore !== undefined ? `${(form.confidenceScore * 100).toFixed(1)}%` : "N/A"}
                  </label>
                  <div style={{ background: "#F1F5F9", borderRadius: 100, height: 8 }}>
                    <div style={{ width: `${(form.confidenceScore ?? 0) * 100}%`, background: "linear-gradient(90deg, #10B981, #34D399)", borderRadius: 100, height: "100%", transition: "width 0.3s" }} />
                  </div>
                </div>
              )}

              {/* Submit */}
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    if (initialZoneId) navigate(`/app/wardrobe/items?zoneId=${initialZoneId}`);
                    else navigate("/app/wardrobe");
                  }}
                  style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "white", color: "#0F172A", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: submitting ? "#A5B4FC" : "linear-gradient(135deg, #4F46E5, #8B5CF6)", color: "white", fontWeight: 700, cursor: submitting ? "default" : "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  {submitting ? (
                    <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Đang lưu...</>
                  ) : (
                    "Thêm Vào Tủ Đồ"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
