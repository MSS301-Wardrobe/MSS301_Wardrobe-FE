import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import { ArrowLeft, Upload, X, Cpu, Check, Loader2, Plus, Package } from "lucide-react";
import { toast } from "sonner";
import { useWardrobe } from "../../../hooks/useWardrobe";
import { useAI } from "../../../hooks/useAI";
import { storageService } from "../../../services/storageService";
import { requestAddClothing } from "../../../services/adminDetectionService";
import { useAuth } from "../../../hooks/useAuth";
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

const colors = ["?en", "Tr?ng", "Xanh ??m", "Chm", "Tm", "??", "H?ng", "Cam", "Vng", "Xanh L", "Xanh Mng Kt", "Xm", "Nu", "Be", "Nhi?u Mu"];
const styles = ["Trang Tr?ng", "Thanh L?ch", "Th??ng Ngy", "Th? Thao", "Ti?c Tng", "Du L?ch", "T?i Gi?n", "Cng S?"];
const CACHE_TTL = 24 * 60 * 60 * 1000;

interface CachePayload<T> {
  cachedAt: number;
  data: T;
}

const saveCache = <T,>(key: string, data: T) => {
  const payload: CachePayload<T> = {
    cachedAt: Date.now(),
    data,
  };

  localStorage.setItem(
    key,
    JSON.stringify(payload)
  );
};

const readCache = <T,>(
  key: string,
  fallback: T
): T => {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    const payload =
      JSON.parse(raw) as CachePayload<T>;

    if (
      typeof payload.cachedAt !== "number" ||
      payload.data === undefined
    ) {
      localStorage.removeItem(key);
      return fallback;
    }

    const expired =
      Date.now() - payload.cachedAt > CACHE_TTL;

    if (expired) {
      localStorage.removeItem(key);
      return fallback;
    }

    return payload.data;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
};
export function AddClothing() {
  const navigate = useNavigate();
  const { detect } = useAI();
  const [searchParams] = useSearchParams();
  const initialZoneId = searchParams.get("zoneId");
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const currentUserId = user?.id;
  const navState = location.state as {
    prefillDetection?: any;
    previewImage?: string;
    sourceFile?: File;
    imageId?: string;
    detectionLogId?: number;
  } | null;
  const {
    clothingItemApi,
    categoryApi,
    ensureAiCategoryCatalog,
    resolveCategoryFromAi,
    wardrobeZoneApi,
    wardrobeApi,
  } = useWardrobe();

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
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);
  const [detectionLogId, setDetectionLogId] = useState<number | null>(
    navState?.detectionLogId ?? null
  );

  // Create Wardrobe Modal
  const [createWardrobeOpen, setCreateWardrobeOpen] = useState(false);
  const [createWardrobeName, setCreateWardrobeName] = useState("");
  const [creatingWardrobe, setCreatingWardrobe] = useState(false);

  // Create Zone Modal
  const [createZoneOpen, setCreateZoneOpen] = useState(false);
  const [createZoneName, setCreateZoneName] = useState("");
  const [createZoneDesc, setCreateZoneDesc] = useState("");
  const [creatingZone, setCreatingZone] = useState(false);

  // Real data from API
  const [categories, setCategories] = useState<Category[]>([]);
  const [wardrobes, setWardrobes] = useState<any[]>([]);
  const [zones, setZones] = useState<WardrobeZone[]>([]);

  // doc cache khi wardrobe loi
  const [wardrobeServiceOffline, setWardrobeServiceOffline] = useState(false);

  const [form, setForm] = useState({
    itemName: "",
    categoryId: "",
    wardrobeId: "",
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
    if (authLoading || !currentUserId) {
      return;
    }

    const fetchMeta = async () => {
      try {
        const [cats, zns, wrdbs] =
          await Promise.all([
            categoryApi.getAll(),
            wardrobeZoneApi.getAll(),
            wardrobeApi.getAll(),
          ]);

        const syncedCategories =
          await ensureAiCategoryCatalog(cats);

        setCategories(syncedCategories);
        setZones(zns);
        setWardrobes(wrdbs);
        setWardrobeServiceOffline(false);

        saveCache(
          "wardrobe_categories_cache",
          syncedCategories
        );

        saveCache(
          `wardrobe_zones_cache_${currentUserId}`,
          zns
        );

        saveCache(
          `wardrobes_cache_${currentUserId}`,
          wrdbs
        );
      } catch {
        const cachedCategories =
          readCache<Category[]>(
            "wardrobe_categories_cache",
            []
          );

        const cachedZones =
          readCache<WardrobeZone[]>(
            `wardrobe_zones_cache_${currentUserId}`,
            []
          );

        const cachedWardrobes =
          readCache<any[]>(
            `wardrobes_cache_${currentUserId}`,
            []
          );

        setCategories(cachedCategories);
        setZones(cachedZones);
        setWardrobes(cachedWardrobes);
        setWardrobeServiceOffline(true);

        if (
          cachedCategories.length === 0 ||
          cachedZones.length === 0 ||
          cachedWardrobes.length === 0
        ) {
          toast.error(
            "Wardrobe Service đang tạm dừng và chưa có dữ liệu đã lưu."
          );
        } else {
          toast.warning(
            "Wardrobe Service đang tạm dừng. Đang sử dụng dữ liệu lưu gần nhất."
          );
        }
      }
    };

    void fetchMeta();
  }, [currentUserId, authLoading]);


  // Apply AI detection data from navigation state
  useEffect(() => {
    if (!navState?.prefillDetection) return;

    if (navState.imageId) {
      setPreview(`http://localhost:8080/api/v1/storage/files/${navState.imageId}`);
      setUploadedImageId(navState.imageId);
    } else if (navState.previewImage) {
      setPreview(navState.previewImage);
    }

    if (navState.sourceFile) setSelectedFile(navState.sourceFile);
    const primary = navState.prefillDetection;
    const colorLabel = primary.colorLabel || primary.color?.name || '';
    const styleLabel = primary.style || '';
    const formStyle = mapAiStyleToFormStyle(primary.styleKeys || []);
    const catName = primary.category || '';
    const confValue = typeof primary.confidence === 'number'
      ? (primary.confidence > 1 ? primary.confidence / 100 : primary.confidence)
      : 0;
    setAiResult({ categoryName: catName, confidence: confValue, color: colorLabel, style: styleLabel });
    const detection = {
      classKey: primary.classKey || '',
      categoryName: catName,
      color: colorLabel,
      formStyle,
      confidence: confValue,
    };
    pendingAiRef.current = detection;
    setForm(f => ({ ...f, dominantColor: colorLabel, style: styleLabel, confidenceScore: confValue }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navState]);

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
      // Auth error (401/403) đã được hook xử lý tự động, trả null → dừng
      const response = await detect(file);
      if (!response) return;

      const primary = response.detections[0];


      if (!primary) {
        toast.error("Không phát hiện trang phục nào trong ảnh");
        return;
      }

      if (primary.logId) {
        setDetectionLogId(primary.logId);
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

    if (!form.zoneId) {
      toast.error("Vui lòng chọn tủ đồ và ngăn kéo");
      return;
    }

    if (!detectionLogId) {
      toast.error(
        "Không tìm thấy kết quả nhận diện AI. Vui lòng nhận diện lại ảnh."
      );
      return;
    }

    setSubmitting(true);

    try {
      let finalImageId: string | undefined =
        uploadedImageId || undefined;

      // Chỉ upload nếu ảnh chưa được Storage Service lưu trước đó.
      if (!finalImageId && selectedFile) {
        toast.loading("Đang tải ảnh lên...", {
          id: "upload-toast",
        });

        const uploadResult =
          await storageService.upload(selectedFile);

        finalImageId = uploadResult.id;

        toast.success("Tải ảnh thành công!", {
          id: "upload-toast",
        });
      }

      if (!finalImageId) {
        toast.error("Không tìm thấy ảnh để thêm vào tủ đồ");
        return;
      }

      // Không gọi wardrobe-service trực tiếp nữa.
      // AI service ghi WAITING_WARDROBE và phát Kafka event.
      const result = await requestAddClothing(
        detectionLogId,
        {
          itemName: form.itemName.trim(),
          categoryId: form.categoryId || undefined,
          zoneId: form.zoneId,
          dominantColor:
            form.dominantColor || undefined,
          style: form.style || undefined,
          confidenceScore: form.confidenceScore,
          imageId: finalImageId,
        }
      );

      if (
        result.status === "WAITING_WARDROBE"
      ) {
        toast.success(
          "Yêu cầu đã được tiếp nhận. Vật phẩm đang được thêm vào tủ đồ."
        );
      } else if (result.status === "ADDED") {
        toast.success(
          "Vật phẩm đã có trong tủ đồ."
        );
      } else {
        toast.success(
          result.message ||
          "Yêu cầu đã được tiếp nhận."
        );
      }

      sessionStorage.removeItem(
        "ai_detection_image_id"
      );
      sessionStorage.removeItem(
        "ai_detection_result"
      );

      setTimeout(() => {
        if (initialZoneId) {
          navigate(
            `/app/wardrobe/items?zoneId=${initialZoneId}`
          );
        } else {
          navigate("/app/wardrobe");
        }
      }, 600);
    } catch (err: any) {
      toast.dismiss("upload-toast");

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Không thể tiếp nhận yêu cầu. Vui lòng thử lại.";

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateWardrobe = async () => {
    if (!createWardrobeName.trim()) return toast.error("Vui lòng nhập tên tủ đồ");
    setCreatingWardrobe(true);
    try {
      const created = await wardrobeApi.create({ wardrobeName: createWardrobeName.trim() });
      setWardrobes((prev) => {
        const updated = [...prev, created];

        if (currentUserId) {
          saveCache(
            `wardrobes_cache_${currentUserId}`,
            updated
          );
        }

        return updated;
      });
      setForm(f => ({ ...f, wardrobeId: created.wardrobeId }));
      toast.success(`Tủ đồ "${created.wardrobeName}" đã được tạo!`);
      setCreateWardrobeOpen(false);
      setCreateWardrobeName("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Tạo tủ đồ thất bại");
    } finally {
      setCreatingWardrobe(false);
    }
  };

  const handleCreateZone = async () => {
    if (!createZoneName.trim()) return toast.error("Vui lòng nhập tên ngăn kéo");
    setCreatingZone(true);
    try {
      const created = await wardrobeZoneApi.create({ wardrobeId: form.wardrobeId, zoneName: createZoneName.trim(), description: createZoneDesc.trim() });
      setZones((prev) => {
        const updated = [...prev, created];

        if (currentUserId) {
          saveCache(
            `wardrobe_zones_cache_${currentUserId}`,
            updated
          );
        }

        return updated;
      });
      setForm(f => ({ ...f, zoneId: created.zoneId }));
      toast.success(`Ngăn kéo "${created.zoneName}" đã được tạo!`);
      setCreateZoneOpen(false);
      setCreateZoneName("");
      setCreateZoneDesc("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Tạo ngăn kéo thất bại");
    } finally {
      setCreatingZone(false);
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
                  borderRadius: 16, border: `2px dashed ${dragOver ? "#EA580C" : preview ? "#E2E8F0" : "#C7D2FE"}`,
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
                      onClick={(e) => { e.stopPropagation(); setPreview(null); setAiResult(null); setSelectedFile(null); }}
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

              {/* Wardrobe */}
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Tu Do</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    value={form.wardrobeId}
                    onChange={(e) => setForm({ ...form, wardrobeId: e.target.value, zoneId: "" })}
                    style={{ ...inputStyle, flex: 1, cursor: initialZoneId ? "not-allowed" : "pointer", background: initialZoneId ? "#F8FAFC" : "white" }}
                    disabled={!!initialZoneId}
                  >
                    <option value="">Chon tu do</option>
                    {wardrobes.map((w: any) => (
                      <option key={w.wardrobeId} value={w.wardrobeId}>{w.wardrobeName}</option>
                    ))}
                  </select>
                  {!initialZoneId && (
                    <button
                      type="button"
                      disabled={wardrobeServiceOffline}
                      style={{ padding: "0 14px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #EA580C, #F97316)", color: "white", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}
                      onClick={() => {
                        if (!wardrobeServiceOffline) {
                          setCreateWardrobeOpen(true);
                        }
                      }}
                    >
                      <Plus size={16} />
                      {wardrobeServiceOffline
                        ? "Dịch vụ tạm dừng"
                        : "Tạo Tủ Đồ"}
                    </button>
                  )}
                </div>
              </div>

              {/* Zone */}
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Ngan Keo</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    value={form.zoneId}
                    onChange={(e) => setForm({ ...form, zoneId: e.target.value })}
                    style={{ ...inputStyle, flex: 1, cursor: (!form.wardrobeId && !initialZoneId) ? "not-allowed" : "pointer", background: (!form.wardrobeId && !initialZoneId) ? "#F8FAFC" : "white" }}
                    disabled={!form.wardrobeId && !initialZoneId}
                  >
                    <option value="">Chon ngan keo</option>
                    {zones.filter((z: any) => !form.wardrobeId || z.wardrobeId === form.wardrobeId).map((z) => (
                      <option key={z.zoneId} value={z.zoneId}>{z.zoneName}</option>
                    ))}
                  </select>
                  {form.wardrobeId && !initialZoneId && (
                    <button
                      type="button"
                      disabled={wardrobeServiceOffline}
                      style={{ padding: "0 14px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #EA580C, #F97316)", color: "white", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}
                      onClick={() => {
                        if (!wardrobeServiceOffline) {
                          setCreateZoneOpen(true);
                        }
                      }}
                    >
                      <Plus size={16} />
                      {wardrobeServiceOffline
                        ? "Dịch vụ tạm dừng"
                        : "Tạo ngăn kéo"}
                    </button>
                  )}
                </div>
              </div>

              {/* Color + Style */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Mau Chu Dao</label>
                  <input
                    type="text"
                    value={form.dominantColor}
                    onChange={(e) => setForm({ ...form, dominantColor: e.target.value })}
                    placeholder="Vd: Xam"
                    style={{ ...inputStyle, background: form.dominantColor ? "#F0FDF4" : "white" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Phong Cach</label>
                  <input
                    type="text"
                    value={form.style}
                    onChange={(e) => setForm({ ...form, style: e.target.value })}
                    placeholder="Vd: Thuong ngay"
                    style={{ ...inputStyle, background: form.style ? "#F0FDF4" : "white" }}
                  />
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
                  style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: submitting ? "#FDBA74" : "linear-gradient(135deg, #EA580C, #F97316)", color: "white", fontWeight: 700, cursor: submitting ? "default" : "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
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

      {/* ── Create Wardrobe Modal ── */}
      {createWardrobeOpen && (
        <div
          onClick={() => setCreateWardrobeOpen(false)}
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
              <button onClick={() => setCreateWardrobeOpen(false)} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}>
                <X size={16} color="#64748B" />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                  Tên Tủ Đồ <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={createWardrobeName}
                  onChange={(e) => setCreateWardrobeName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreateWardrobe(); }}
                  placeholder="Vd: Tủ Đồ Mùa Đông, Tủ Công Sở..."
                  maxLength={100}
                  style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: "0.9rem", outline: "none", boxSizing: "border-box", color: "#0F172A" }}
                />
                <p style={{ fontSize: "0.72rem", color: "#94A3B8", marginTop: 4, textAlign: "right" }}>{createWardrobeName.length}/100</p>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button
                  onClick={() => setCreateWardrobeOpen(false)}
                  style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateWardrobe}
                  disabled={creatingWardrobe}
                  style={{ padding: "0 14px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #EA580C, #F97316)", color: "white", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}
                >
                  {creatingWardrobe ? (
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

      {/* ── Create Zone Modal ── */}
      {createZoneOpen && (
        <div
          onClick={() => setCreateZoneOpen(false)}
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
                <h3 style={{ fontWeight: 800, color: "#0F172A", fontSize: "1.05rem" }}>Tạo Ngăn Kéo Mới</h3>
              </div>
              <button onClick={() => setCreateZoneOpen(false)} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}>
                <X size={16} color="#64748B" />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                  Tên Ngăn Kéo <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={createZoneName}
                  onChange={(e) => setCreateZoneName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreateZone(); }}
                  placeholder="Vd: Áo Thun, Quần Jean..."
                  maxLength={100}
                  style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: "0.9rem", outline: "none", boxSizing: "border-box", color: "#0F172A" }}
                />
                <p style={{ fontSize: "0.72rem", color: "#94A3B8", marginTop: 4, textAlign: "right" }}>{createZoneName.length}/100</p>
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Mô Tả</label>
                <textarea value={createZoneDesc} onChange={(e) => setCreateZoneDesc(e.target.value)} rows={2} placeholder="Mô tả về ngăn kéo này" style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: "0.88rem", outline: "none", resize: "vertical", fontFamily: "Inter, sans-serif", boxSizing: "border-box" }} />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button
                  onClick={() => setCreateZoneOpen(false)}
                  style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateZone}
                  disabled={creatingZone}
                  style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: creatingZone ? "#FDBA74" : "linear-gradient(135deg, #EA580C, #F97316)", color: "white", fontWeight: 700, cursor: creatingZone ? "default" : "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  {creatingZone ? (
                    <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Đang tạo...</>
                  ) : (
                    <><Plus size={15} /> Tạo Ngăn Kéo</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
