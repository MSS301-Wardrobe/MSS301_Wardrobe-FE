import { useCallback, useEffect, useState, useRef } from "react";
import {
  Upload,
  Cpu,
  X,
  BarChart2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { DetectionBboxesOverlay } from "../../../components/ai/DetectionBboxesOverlay";
import { DetectionResultsPanel } from "../../../components/ai/DetectionResultsPanel";
import { ManualCropOverlay } from "../../../components/ai/ManualCropOverlay";
import {
  useAI,
  CropRegionEmptyError,
  LowConfidenceDetectionError,
} from "../../../hooks/useAI";
import { storageService } from "../../../services/storageService";
import type { AIDetectionViewResult } from "../../../types/ai";
import { SUPPORTED_CATEGORY_NAMES_VI } from "../../../utils/aiMappings";
import {
  DEFAULT_CROP,
  type NormalizedCrop,
} from "../../../utils/imageCrop";

type ImageLayout = {
  offsetX: number;
  offsetY: number;
  displayWidth: number;
  displayHeight: number;
  naturalWidth: number;
  naturalHeight: number;
};

const PREVIEW_MAX_HEIGHT = 640;

export function AIDetection() {
  const navigate = useNavigate();
  const { detectAllForView } = useAI();
  const fileRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const previewImageRef = useRef<HTMLImageElement>(null);

  const SESSION_KEY_IMG_ID = "ai_detection_image_id";
  const SESSION_KEY_RESULT = "ai_detection_result";
  const SESSION_KEY_CROP = "ai_detection_crop";

  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [results, setResults] = useState<AIDetectionViewResult[]>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY_RESULT);
      if (!saved) return [];
      const parsed = JSON.parse(saved) as AIDetectionViewResult | AIDetectionViewResult[];
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  });
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [imageLayout, setImageLayout] = useState<ImageLayout | null>(null);
  const [detectionWarning, setDetectionWarning] = useState<string | null>(null);
  const [lowConfidence, setLowConfidence] = useState<number | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [cropArea, setCropArea] = useState<NormalizedCrop>(DEFAULT_CROP);
  const [detectionCrop, setDetectionCrop] = useState<NormalizedCrop | null>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY_CROP);
      return saved ? (JSON.parse(saved) as NormalizedCrop) : null;
    } catch {
      return null;
    }
  });
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(
    () => sessionStorage.getItem(SESSION_KEY_IMG_ID)
  );


  const updateImageLayout = useCallback(() => {
    const container = previewContainerRef.current;
    const image = previewImageRef.current;

    if (!container || !image || !image.complete || image.naturalWidth === 0) {
      return;
    }

    const containerWidth = container.clientWidth;
    const scale = Math.min(
      1,
      containerWidth > 0 ? containerWidth / image.naturalWidth : 1,
      PREVIEW_MAX_HEIGHT / image.naturalHeight
    );

    const displayWidth = Math.max(1, Math.round(image.naturalWidth * scale));
    const displayHeight = Math.max(1, Math.round(image.naturalHeight * scale));

    setImageLayout({
      offsetX: 0,
      offsetY: 0,
      displayWidth,
      displayHeight,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
    });
  }, []);

  const handlePreviewImageLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const image = event.currentTarget;
      if (image.naturalWidth === 0) {
        return;
      }

      setCropArea((current) => detectionCrop ?? current ?? DEFAULT_CROP);
      updateImageLayout();
    },
    [updateImageLayout, detectionCrop]
  );

  useEffect(() => {
    if (!preview) {
      return;
    }

    const container = previewContainerRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver(() => {
      updateImageLayout();
    });

    observer.observe(container);
    updateImageLayout();

    return () => observer.disconnect();
  }, [preview, results.length, updateImageLayout]);

  useEffect(() => {
    if (results.length > 0) {
      updateImageLayout();
    }
  }, [results, activeResultIndex, updateImageLayout]);

  // Khi khôi phục từ sessionStorage: lấy pre-signed URL rồi fetch blob để tạo lại sourceFile
  useEffect(() => {
    if (uploadedImageId && !sourceFile) {
      storageService.getPresignedUrl(uploadedImageId)
        .then((presignedUrl) => {
          setPreview(presignedUrl);
          // Fetch blob từ S3 URL công khai để tạo lại File object cho cropImageFile
          return fetch(presignedUrl)
            .then((r) => r.blob())
            .then((blob) => {
              setSourceFile(new File([blob], "restored-image.jpg", { type: blob.type || "image/jpeg" }));
            });
        })
        .catch(() => {
          sessionStorage.removeItem(SESSION_KEY_IMG_ID);
          sessionStorage.removeItem(SESSION_KEY_RESULT);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedImageId]);

  const resetPreview = () => {
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null);
    setSourceFile(null);
    setResults([]);
    setActiveResultIndex(0);
    setDetectionCrop(null);
    setCropArea(DEFAULT_CROP);
    setImageLayout(null);
    setDetectionWarning(null);
    setLowConfidence(null);
    setUploadedImageId(null);
    sessionStorage.removeItem(SESSION_KEY_IMG_ID);
    sessionStorage.removeItem(SESSION_KEY_RESULT);
    sessionStorage.removeItem(SESSION_KEY_CROP);
  };

  const handleFile = async (file: File) => {
    resetPreview();
    setSourceFile(file);
    setPreview(URL.createObjectURL(file));
    setResults([]);
    setActiveResultIndex(0);
    setDetectionWarning(null);
    setLowConfidence(null);

    try {
      toast.loading("Đang tải ảnh lên (tạm thời)...", { id: "upload-ai-toast" });
      const uploadResult = await storageService.upload(file);
      setUploadedImageId(uploadResult.id);
      // Lưu imageId vào sessionStorage để giữ state khi chuyển tab
      sessionStorage.setItem(SESSION_KEY_IMG_ID, uploadResult.id);
      // Lấy pre-signed URL để hiển thị preview (không dùng XHR, tránh CORS)
      const presignedUrl = await storageService.getPresignedUrl(uploadResult.id);
      setPreview(presignedUrl);
      toast.success("Tải ảnh lên thành công", { id: "upload-ai-toast" });
    } catch (e) {
      toast.error("Tải ảnh lên thất bại", { id: "upload-ai-toast" });
    }
  };

  const runDetection = async () => {
    if (!sourceFile) {
      toast.error("Vui lòng tải ảnh trước");
      return;
    }

    if (!imageLayout) {
      toast.error("Ảnh chưa sẵn sàng, vui lòng đợi một chút");
      return;
    }

    setResults([]);
    setActiveResultIndex(0);
    setDetectionWarning(null);
    setLowConfidence(null);
    setDetecting(true);
    setProgress(10);

    const progressTimer = window.setInterval(() => {
      setProgress((current) => (current >= 90 ? current : current + 10));
    }, 200);

    try {
      const detectionResults = await detectAllForView(sourceFile, {
        crop: cropArea,
        naturalWidth: imageLayout.naturalWidth,
        naturalHeight: imageLayout.naturalHeight,
        imageId: uploadedImageId ?? undefined,
      });

      if (!detectionResults?.length) return;

      setProgress(100);
      setResults(detectionResults);
      setDetectionCrop(cropArea);
      setActiveResultIndex(0);
      sessionStorage.setItem(SESSION_KEY_RESULT, JSON.stringify(detectionResults));
      sessionStorage.setItem(SESSION_KEY_CROP, JSON.stringify(cropArea));

      toast.success(
        `Nhận diện hoàn tất! Phát hiện ${detectionResults.length} trang phục`
      );
    } catch (error: unknown) {
      if (error instanceof CropRegionEmptyError) {
        setDetectionWarning(error.message);
        setLowConfidence(null);
        toast.error(error.message);
        return;
      }

      if (error instanceof LowConfidenceDetectionError) {
        setDetectionWarning(error.message);
        setLowConfidence(error.confidencePercent);
        toast.error(error.message);
        return;
      }

      const message =
        (error as { response?: { data?: { message?: string; detail?: string } } })
          .response?.data?.message ||
        (error as { response?: { data?: { message?: string; detail?: string } } })
          .response?.data?.detail ||
        (error as Error).message ||
        "Nhận diện thất bại";

      toast.error(message);
    } finally {
      window.clearInterval(progressTimer);
      setDetecting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) {
      handleFile(file);
    }
  };

  const hasResults = results.length > 0;
  const cropEditable = Boolean(preview && imageLayout && !detecting && !hasResults);

  const navigateToAddClothing = (detection: AIDetectionViewResult) => {
    navigate("/app/wardrobe/add", {
      state: {
        prefillDetection: detection,
        previewImage: preview,
        sourceFile,
        imageId: uploadedImageId,
        detectionLogId: detection.logId,
      },
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #EA580C, #F97316)", borderRadius: 20, padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Cpu size={18} color="rgba(255,255,255,0.8)" />
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem", fontWeight: 500 }}>
              AI Vision Engine v2.0
            </span>
          </div>

          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "white", marginBottom: 4 }}>
            Nhận Diện Trang Phục
          </h2>

          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.875rem" }}>
            Tải lên hình ảnh trang phục để phân loại ngay lập tức bằng AI
          </p>
        </div>

        <button
          onClick={() => navigate("/app/ai-analysis")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.15)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.25)",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.85rem",
          }}
        >
          <BarChart2 size={15} />
          Xem Phân Tích
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: hasResults
            ? "minmax(360px, 1.15fr) minmax(300px, 0.85fr)"
            : "1fr 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: 24,
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 16, fontSize: "1rem" }}>
              Tải Lên Hình Ảnh
            </h3>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !preview && fileRef.current?.click()}
              style={{
                borderRadius: 16, border: `2px dashed ${dragOver ? "#EA580C" : "#FED7AA"}`,
                background: dragOver ? "#FFF7ED" : "#F8FAFC",
                cursor: preview ? "default" : "pointer",
                transition: "all 0.2s",
                position: "relative",
                overflow: "hidden",
                minHeight: preview ? "auto" : 320,
                display: preview ? "block" : "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {preview ? (
                <div
                  ref={previewContainerRef}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "8px 0",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: imageLayout?.displayWidth ?? "100%",
                      height: imageLayout?.displayHeight ?? "auto",
                      maxWidth: "100%",
                      flexShrink: 0,
                      lineHeight: 0,
                    }}
                  >
                    <img
                      ref={previewImageRef}
                      src={preview}
                      alt="Upload"
                      decoding="sync"
                      onLoad={handlePreviewImageLoad}
                      style={{
                        width: imageLayout ? imageLayout.displayWidth : "100%",
                        height: imageLayout ? imageLayout.displayHeight : "auto",
                        maxWidth: "100%",
                        objectFit: "contain",
                        borderRadius: 14,
                        display: "block",
                      }}
                    />

                    {imageLayout && cropEditable && (
                      <ManualCropOverlay
                        layout={imageLayout}
                        crop={cropArea}
                        onChange={setCropArea}
                        editable
                      />
                    )}

                    {imageLayout && hasResults && (
                      <DetectionBboxesOverlay
                        layout={imageLayout}
                        results={results}
                        activeIndex={activeResultIndex}
                        onSelect={setActiveResultIndex}
                      />
                    )}

                    {detecting && imageLayout && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(234,88,12,0.85)",
                          borderRadius: 14,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 16,
                          zIndex: 20,
                        }}
                      >
                      <div
                        style={{
                          width: 50,
                          height: 50,
                          border: "3px solid rgba(255,255,255,0.3)",
                          borderTop: "3px solid white",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      <p style={{ color: "white", fontWeight: 700 }}>
                        Đang phân tích hình ảnh...
                      </p>
                      <div
                        style={{
                          width: 200,
                          background: "rgba(255,255,255,0.2)",
                          borderRadius: 100,
                          height: 6,
                        }}
                      >
                        <div
                          style={{
                            width: `${progress}%`,
                            background: "white",
                            borderRadius: 100,
                            height: "100%",
                            transition: "width 0.1s",
                          }}
                        />
                      </div>

                      <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.8rem" }}>
                        {progress}% hoàn thành
                      </p>
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resetPreview();
                    }}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "rgba(15,23,42,0.8)",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 30,
                    }}
                  >
                    <X size={14} color="white" />
                  </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, #FFF7ED, #FFF7ED)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <Cpu size={28} color="#EA580C" />
                  </div>

                  <p style={{ fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>
                    Thả hình ảnh trang phục vào đây
                  </p>

                  <p style={{ fontSize: "0.8rem", color: "#64748B", marginBottom: 20 }}>
                    hoặc nhấn để duyệt từ thiết bị của bạn
                  </p>

                  <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                    {["JPG", "PNG", "WEBP"].map((fmt) => (
                      <span key={fmt} style={{ background: "#FFF7ED", color: "#EA580C", borderRadius: 6, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 600 }}>{fmt}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
              style={{ display: "none" }}
            />

            {!preview ? (
              <button onClick={() => fileRef.current?.click()} style={{ width: "100%", marginTop: 12, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #EA580C, #F97316)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Upload size={16} />
                Tải Lên Hình Ảnh
              </button>
            ) : (
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontSize: "0.8rem", color: "#64748B", lineHeight: 1.5 }}>
                  {hasResults
                    ? "Bấm \"Chọn lại vùng\" để kéo khung và nhận diện lại."
                    : "Kéo khung cam để chọn vùng cần nhận diện. AI quét toàn ảnh và chỉ hiện kết quả trong vùng đó — nên bao trọn trang phục."}
                </p>
                <button
                  onClick={runDetection}
                  disabled={detecting || !sourceFile}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 12,
                    border: "none",
                    background: detecting
                      ? "#FDBA74"
                      : "linear-gradient(135deg, #EA580C, #F97316)",
                    color: "white",
                    fontWeight: 700,
                    cursor: detecting ? "default" : "pointer",
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Cpu size={16} />
                  {detecting ? "Đang nhận diện..." : "Nhận Diện Vùng Đã Chọn"}
                </button>
                {hasResults && (
                  <button
                    onClick={() => {
                      if (detectionCrop) {
                        setCropArea(detectionCrop);
                      }
                      setResults([]);
                      setActiveResultIndex(0);
                      setDetectionCrop(null);
                      setDetectionWarning(null);
                      setLowConfidence(null);
                      sessionStorage.removeItem(SESSION_KEY_RESULT);
                      sessionStorage.removeItem(SESSION_KEY_CROP);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 12,
                      border: "1.5px solid #FED7AA",
                      background: "white",
                      color: "#EA580C",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    Chọn lại vùng nhận diện
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {!hasResults && !detecting && !detectionWarning ? (
            <div
              style={{
                background: "white",
                borderRadius: 20,
                padding: 40,
                border: "1px solid #E2E8F0",
                textAlign: "center",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  background: "#F1F5F9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Zap size={28} color="#CBD5E1" />
              </div>

              <h3 style={{ fontWeight: 700, color: "#94A3B8", marginBottom: 8 }}>
                Sẵn Sàng Nhận Diện
              </h3>

              <p style={{ color: "#CBD5E1", fontSize: "0.85rem" }}>
                Tải lên hình ảnh trang phục để xem kết quả AI
              </p>
            </div>
          ) : detectionWarning ? (
            <UnsupportedDetectionPanel
              message={detectionWarning}
              confidence={lowConfidence}
            />
          ) : hasResults ? (
            <DetectionResultsPanel
              results={results}
              activeIndex={activeResultIndex}
              onSelect={setActiveResultIndex}
              onAdd={navigateToAddClothing}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function UnsupportedDetectionPanel({
  message,
  confidence,
}: {
  message: string;
  confidence: number | null;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 20,
        padding: 24,
        border: "1px solid #FDE68A",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <h3 style={{ fontWeight: 700, color: "#B45309", marginBottom: 10, fontSize: "1rem" }}>
        Không thể nhận diện chính xác
      </h3>

      {confidence !== null && (
        <p style={{ color: "#92400E", fontSize: "0.88rem", marginBottom: 12 }}>
          Độ tin cậy: <strong>{confidence}%</strong> (yêu cầu tối thiểu 45%)
        </p>
      )}

      <p style={{ color: "#78350F", fontSize: "0.88rem", lineHeight: 1.6, marginBottom: 16 }}>
        {message}
      </p>

      <p style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600, marginBottom: 8 }}>
        CÁC LOẠI ĐƯỢC HỖ TRỢ
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {SUPPORTED_CATEGORY_NAMES_VI.map((name) => (
          <span
            key={name}
            style={{
              background: "#F8FAFC",
              color: "#475569",
              borderRadius: 20,
              padding: "4px 10px",
              fontSize: "0.75rem",
              fontWeight: 600,
              border: "1px solid #E2E8F0",
            }}
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
