import { useCallback, useEffect, useState, useRef } from "react";
import {
  Upload,
  Cpu,
  X,
  CheckCircle2,
  ChevronRight,
  BarChart2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { ManualCropOverlay } from "../../../components/ai/ManualCropOverlay";
import { aiService, LowConfidenceDetectionError } from "../../../services/aiService";

import {
  useAI,
  LowConfidenceDetectionError,
} from "../../../hooks/useAI";
import { storageService } from "../../../services/storageService";
import type { AIDetectionViewResult } from "../../../types/ai";
import { SUPPORTED_CATEGORY_NAMES_VI } from "../../../utils/aiMappings";
import {
  cropImageFile,
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
  const { detectForView } = useAI();
  const fileRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const previewImageRef = useRef<HTMLImageElement>(null);

  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [result, setResult] = useState<AIDetectionViewResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [imageLayout, setImageLayout] = useState<ImageLayout | null>(null);
  const [detectionWarning, setDetectionWarning] = useState<string | null>(null);
  const [lowConfidence, setLowConfidence] = useState<number | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [cropArea, setCropArea] = useState<NormalizedCrop>(DEFAULT_CROP);

  const updateImageLayout = useCallback(() => {
    const container = previewContainerRef.current;
    const image = previewImageRef.current;

    if (!container || !image || !image.complete || image.naturalWidth === 0) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();

    setImageLayout({
      offsetX: imageRect.left - containerRect.left,
      offsetY: imageRect.top - containerRect.top,
      displayWidth: imageRect.width,
      displayHeight: imageRect.height,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
    });
  }, []);

  const handlePreviewImageLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const image = event.currentTarget;
      const container = previewContainerRef.current;

      if (!container || image.naturalWidth === 0) {
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

      image.style.width = `${displayWidth}px`;
      image.style.height = `${displayHeight}px`;

      setCropArea(DEFAULT_CROP);
      updateImageLayout();
    },
    [updateImageLayout]
  );

  useEffect(() => {
    if (result) {
      updateImageLayout();
    }
  }, [result, updateImageLayout]);

  const resetPreview = () => {
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null);
    setSourceFile(null);
    setResult(null);
    setImageLayout(null);
    setDetectionWarning(null);
    setLowConfidence(null);
    setCropArea(DEFAULT_CROP);
  };

  const handleFile = (file: File) => {
    resetPreview();
    setSourceFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setDetectionWarning(null);
    setLowConfidence(null);
    setCropArea(DEFAULT_CROP);
  };

  const runDetection = async () => {
    if (!sourceFile) {
      toast.error("Vui lòng tải ảnh trước");
      return;
    }

    setResult(null);
    setDetectionWarning(null);
    setLowConfidence(null);
    setDetecting(true);
    setProgress(10);

    const progressTimer = window.setInterval(() => {
      setProgress((current) => (current >= 90 ? current : current + 10));
    }, 200);

    try {
      const croppedFile = await cropImageFile(sourceFile, cropArea);
      const detectionResult = await detectForView(croppedFile);

      // Auth error (401/403) đã được hook xử lý, trả null → dừng
      if (!detectionResult) return;

      setProgress(100);
      setResult(detectionResult);
      sessionStorage.setItem(SESSION_KEY_RESULT, JSON.stringify(detectionResult));

      toast.success(
        `Nhận diện hoàn tất! Độ tin cậy ${detectionResult.confidence}%`
      );
    } catch (error: unknown) {
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

  const colorName = result?.colorLabel ?? "-";
  const colorHex = result?.color?.hex;
  const categoryText = result?.category ?? "-";
  const styleText = result?.style ?? "-";

  const cropEditable = Boolean(preview && imageLayout && !detecting && !result);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #4F46E5, #8B5CF6)", borderRadius: 20, padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                borderRadius: 16, border: `2px dashed ${dragOver ? "#4F46E5" : "#C7D2FE"}`,
                background: dragOver ? "#EEF2FF" : "#F8FAFC",
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
                    position: "relative",
                    lineHeight: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    ref={previewImageRef}
                    src={preview}
                    alt="Upload"
                    decoding="sync"
                    onLoad={handlePreviewImageLoad}
                    style={{
                      maxWidth: "100%",
                      maxHeight: PREVIEW_MAX_HEIGHT,
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                      objectPosition: "center",
                      borderRadius: 14,
                      display: "block",
                      imageRendering: "auto",
                    }}
                  />

                  {imageLayout && (
                    <ManualCropOverlay
                      layout={imageLayout}
                      crop={cropArea}
                      onChange={setCropArea}
                      editable={cropEditable}
                      confirmed={Boolean(result)}
                      label={
                        result
                          ? `${categoryText} — ${result.confidence}%`
                          : undefined
                      }
                    />
                  )}

                  {detecting && imageLayout && (
                    <div
                      style={{
                        position: "absolute",
                        left: imageLayout.offsetX,
                        top: imageLayout.offsetY,
                        width: imageLayout.displayWidth,
                        height: imageLayout.displayHeight,
                        background: "rgba(79,70,229,0.85)",
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
              ) : (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, #EEF2FF, #F5F3FF)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <Cpu size={28} color="#4F46E5" />
                  </div>

                  <p style={{ fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>
                    Thả hình ảnh trang phục vào đây
                  </p>

                  <p style={{ fontSize: "0.8rem", color: "#64748B", marginBottom: 20 }}>
                    hoặc nhấn để duyệt từ thiết bị của bạn
                  </p>

                  <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                    {["JPG", "PNG", "WEBP"].map((fmt) => (
                      <span key={fmt} style={{ background: "#EEF2FF", color: "#4F46E5", borderRadius: 6, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 600 }}>{fmt}</span>
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
              <button onClick={() => fileRef.current?.click()} style={{ width: "100%", marginTop: 12, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #4F46E5, #8B5CF6)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Upload size={16} />
                Tải Lên Hình Ảnh
              </button>
            ) : (
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontSize: "0.8rem", color: "#64748B", lineHeight: 1.5 }}>
                  Kéo khung tím để chọn vùng trang phục cần nhận diện. Kéo góc dưới bên phải để đổi kích thước.
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
                      ? "#A5B4FC"
                      : "linear-gradient(135deg, #4F46E5, #8B5CF6)",
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
                {result && (
                  <button
                    onClick={() => {
                      setResult(null);
                      setDetectionWarning(null);
                      setLowConfidence(null);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 12,
                      border: "1.5px solid #C7D2FE",
                      background: "white",
                      color: "#4F46E5",
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

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!result && !detecting && !detectionWarning ? (
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
          ) : result ? (
            <>
              <div
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: 24,
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <CheckCircle2 size={20} color="#10B981" />
                  <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>
                    Kết Quả Nhận Diện
                  </h3>
                </div>

                <div
                  style={{
                    background: "linear-gradient(135deg, #ECFDF5, #D1FAE5)",
                    borderRadius: 14,
                    padding: "16px 20px",
                    marginBottom: 20,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, color: "#059669", fontSize: "0.9rem" }}>
                      Độ Tin Cậy Tổng Thể
                    </span>
                    <span style={{ fontWeight: 800, color: "#059669", fontSize: "1.1rem" }}>
                      {result.confidence}%
                    </span>
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.5)", borderRadius: 100, height: 8 }}>
                    <div
                      style={{
                        width: `${result.confidence}%`,
                        background: "#10B981",
                        borderRadius: 100,
                        height: "100%",
                        transition: "width 0.6s",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <InfoCard label="Danh Mục" value={categoryText} />

                  <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "12px 14px" }}>
                    <CardLabel label="Màu Sắc" />
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {colorHex && (
                        <span
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            backgroundColor: colorHex,
                            border: "1px solid #CBD5E1",
                            display: "inline-block",
                          }}
                        />
                      )}
                      <p style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.88rem" }}>
                        {colorName}
                      </p>
                    </div>
                  </div>

                  <OccasionCard occasions={result.occasion || []} />
                  <InfoCard label="Phong Cách" value={styleText} />
                </div>
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: 24,
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <h4 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 16, fontSize: "0.95rem" }}>
                  Phân Tích Thuộc Tính
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {(result.attributes || []).map((attr) => {
                    const label = attr.label;
                    const lower = label.toLowerCase();
                    const value = attr.value;
                    const attrColorHex = lower.includes("màu") ? colorHex : undefined;

                    return (
                      <div key={attr.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <div>
                            <span style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 500 }}>
                              {label}:{" "}
                            </span>

                            <span
                              style={{
                                fontSize: "0.82rem",
                                fontWeight: 700,
                                color: "#0F172A",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              {attrColorHex && (
                                <span
                                  style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    backgroundColor: attrColorHex,
                                    border: "1px solid #CBD5E1",
                                    display: "inline-block",
                                  }}
                                />
                              )}
                              {value}
                            </span>
                          </div>

                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              color: attr.score >= 90 ? "#10B981" : "#F59E0B",
                            }}
                          >
                            {attr.score}%
                          </span>
                        </div>

                        <div style={{ background: "#F1F5F9", borderRadius: 100, height: 5 }}>
                          <div
                            style={{
                              width: `${attr.score}%`,
                              background: attr.score >= 90 ? "#10B981" : "#F59E0B",
                              borderRadius: 100,
                              height: "100%",
                              transition: "width 0.5s",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => navigate("/app/wardrobe/add")}
                style={{ width: "100%", padding: "13px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #4F46E5, #8B5CF6)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                Thêm Vào Tủ Đồ
                <ChevronRight size={16} />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CardLabel({ label }: { label: string }) {
  return (
    <p
      style={{
        fontSize: "0.72rem",
        color: "#64748B",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        marginBottom: 4,
      }}
    >
      {label}
    </p>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "12px 14px" }}>
      <CardLabel label={label} />
      <p style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.88rem" }}>
        {value}
      </p>
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

function OccasionCard({ occasions }: { occasions: string[] }) {
  return (
    <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "12px 14px" }}>
      <CardLabel label="Dịp Phù Hợp Gợi Ý" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {occasions.length > 0 ? (
          occasions.map((occ) => (
            <span
              key={occ}
              style={{
                background: "#EEF2FF",
                color: "#4F46E5",
                borderRadius: 20,
                padding: "4px 10px",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {occ}
            </span>
          ))
        ) : (
          <p style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.88rem" }}>-</p>
        )}
      </div>
    </div>
  );
}