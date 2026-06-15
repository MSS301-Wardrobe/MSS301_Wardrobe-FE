import { useState, useRef } from "react";
import { Upload, Cpu, X, CheckCircle2, ChevronRight, BarChart2, Zap } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

const exampleImages = [
  { label: "Áo Sơ Mi Trắng", img: "https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=200&h=200&fit=crop" },
  { label: "Quần Jeans", img: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=200&h=200&fit=crop" },
  { label: "Giày Thể Thao", img: "https://images.unsplash.com/photo-1544441893-675973e31985?w=200&h=200&fit=crop" },
  { label: "Váy Đỏ", img: "https://images.unsplash.com/photo-1617690033147-ce6b332d677b?w=200&h=200&fit=crop" },
];

type DetectionResult = {
  category: string;
  confidence: number;
  color: string;
  pattern: string;
  style: string;
  occasion: string[];
  attributes: { label: string; value: string; score: number }[];
};

const mockResult: DetectionResult = {
  category: "Áo / Sơ Mi",
  confidence: 97.3,
  color: "Trắng / Trắng Kem",
  pattern: "Trơn",
  style: "Công Sở / Lịch Sự",
  occasion: ["Văn Phòng", "Trang Trọng", "Lịch Sự"],
  attributes: [
    { label: "Loại Trang Phục", value: "Áo Oxford", score: 97 },
    { label: "Màu Chính", value: "Trắng", score: 99 },
    { label: "Họa Tiết", value: "Trơn", score: 98 },
    { label: "Chất Liệu", value: "Cotton (ước tính)", score: 87 },
    { label: "Độ Dài Tay", value: "Tay Dài", score: 95 },
    { label: "Kiểu Cổ", value: "Cổ Bẻ Rộng", score: 92 },
    { label: "Phong Cách", value: "Công Sở Trang Trọng", score: 94 },
    { label: "Giới Tính", value: "Unisex / Nam", score: 89 },
  ],
};

export function AIDetection() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [progress, setProgress] = useState(0);

  const runDetection = async (imgUrl: string) => {
    setPreview(imgUrl);
    setResult(null);
    setDetecting(true);
    setProgress(0);
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 90));
      setProgress(i);
    }
    setDetecting(false);
    setResult(mockResult);
    toast.success("Nhận diện hoàn tất! Độ tin cậy 97.3%");
  };

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    runDetection(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #EA580C, #F97316)", borderRadius: 20, padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Cpu size={18} color="rgba(255,255,255,0.8)" />
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem", fontWeight: 500 }}>AI Vision Engine v2.0</span>
          </div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "white", marginBottom: 4 }}>Nhận Diện Trang Phục</h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.875rem" }}>Tải lên hình ảnh trang phục để phân loại ngay lập tức bằng AI</p>
        </div>
        <button
          onClick={() => navigate("/app/ai-analysis")}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12, background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.25)", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}
        >
          <BarChart2 size={15} />
          Xem Phân Tích
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Upload Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 16, fontSize: "1rem" }}>Tải Lên Hình Ảnh</h3>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !preview && fileRef.current?.click()}
              style={{
                borderRadius: 16, border: `2px dashed ${dragOver ? "#EA580C" : "#FED7AA"}`,
                background: dragOver ? "#FFEDD5" : "#F8FAFC",
                cursor: preview ? "default" : "pointer",
                transition: "all 0.2s", position: "relative", overflow: "hidden",
                minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {preview ? (
                <div style={{ width: "100%", height: 320, position: "relative" }}>
                  <img src={preview} alt="Upload" style={{ width: "100%", height: 320, objectFit: "cover", borderRadius: 14 }} />

                  {/* AI detecting overlay */}
                  {detecting && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(234,88,12,0.85)", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
                      <div style={{ width: 50, height: 50, border: "3px solid rgba(255,255,255,0.3)", borderTop: "3px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      <p style={{ color: "white", fontWeight: 700 }}>Đang phân tích hình ảnh...</p>
                      <div style={{ width: 200, background: "rgba(255,255,255,0.2)", borderRadius: 100, height: 6 }}>
                        <div style={{ width: `${progress}%`, background: "white", borderRadius: 100, height: "100%", transition: "width 0.1s" }} />
                      </div>
                      <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.8rem" }}>{progress}% hoàn thành</p>
                    </div>
                  )}

                  {/* Bounding box visualization (after detection) */}
                  {result && !detecting && (
                    <div style={{
                      position: "absolute", top: "15%", left: "20%", right: "20%", bottom: "10%",
                      border: "2px solid #10B981", borderRadius: 8, boxShadow: "0 0 0 2px rgba(16,185,129,0.3)",
                    }}>
                      <div style={{ position: "absolute", top: -24, left: 0, background: "#10B981", color: "white", borderRadius: "6px 6px 6px 0", padding: "2px 10px", fontSize: "0.72rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                        {result.category} — {result.confidence}%
                      </div>
                    </div>
                  )}

                  <button
                    onClick={(e) => { e.stopPropagation(); setPreview(null); setResult(null); }}
                    style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(15,23,42,0.8)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <X size={14} color="white" />
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, #FFEDD5, #F5F3FF)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <Cpu size={28} color="#EA580C" />
                  </div>
                  <p style={{ fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>Thả hình ảnh trang phục vào đây</p>
                  <p style={{ fontSize: "0.8rem", color: "#64748B", marginBottom: 20 }}>hoặc nhấn để duyệt từ thiết bị của bạn</p>
                  <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                    {["JPG", "PNG", "WEBP"].map((fmt) => (
                      <span key={fmt} style={{ background: "#FFEDD5", color: "#EA580C", borderRadius: 6, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 600 }}>{fmt}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} style={{ display: "none" }} />

            {!preview && (
              <button onClick={() => fileRef.current?.click()} style={{ width: "100%", marginTop: 12, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #EA580C, #F97316)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Upload size={16} />
                Tải Lên Để Nhận Diện
              </button>
            )}
          </div>

          {/* Quick Examples */}
          <div style={{ background: "white", borderRadius: 20, padding: 20, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h4 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 14, fontSize: "0.9rem" }}>Thử Hình Ảnh Mẫu</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {exampleImages.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => runDetection(ex.img)}
                  style={{ borderRadius: 12, overflow: "hidden", border: "1.5px solid #E2E8F0", cursor: "pointer", background: "none", padding: 0 }}
                >
                  <img src={ex.img} alt={ex.label} style={{ width: "100%", height: 80, objectFit: "cover" }} />
                  <p style={{ padding: "6px 8px", fontSize: "0.75rem", fontWeight: 500, color: "#374151", textAlign: "center" }}>{ex.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!result && !detecting ? (
            <div style={{ background: "white", borderRadius: 20, padding: 40, border: "1px solid #E2E8F0", textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Zap size={28} color="#CBD5E1" />
              </div>
              <h3 style={{ fontWeight: 700, color: "#94A3B8", marginBottom: 8 }}>Sẵn Sàng Nhận Diện</h3>
              <p style={{ color: "#CBD5E1", fontSize: "0.85rem" }}>Tải lên hình ảnh trang phục để xem kết quả AI</p>
            </div>
          ) : result ? (
            <>
              {/* Main result */}
              <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <CheckCircle2 size={20} color="#10B981" />
                  <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>Kết Quả Nhận Diện</h3>
                </div>

                {/* Confidence bar */}
                <div style={{ background: "linear-gradient(135deg, #ECFDF5, #D1FAE5)", borderRadius: 14, padding: "16px 20px", marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, color: "#059669", fontSize: "0.9rem" }}>Độ Tin Cậy Tổng Thể</span>
                    <span style={{ fontWeight: 800, color: "#059669", fontSize: "1.1rem" }}>{result.confidence}%</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.5)", borderRadius: 100, height: 8 }}>
                    <div style={{ width: `${result.confidence}%`, background: "#10B981", borderRadius: 100, height: "100%", transition: "width 0.6s" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "Danh Mục", value: result.category },
                    { label: "Màu Sắc", value: result.color },
                    { label: "Họa Tiết", value: result.pattern },
                    { label: "Phong Cách", value: result.style },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: "#F8FAFC", borderRadius: 12, padding: "12px 14px" }}>
                      <p style={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{label}</p>
                      <p style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.88rem" }}>{value}</p>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 14 }}>
                  <p style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600, marginBottom: 8 }}>DỊP PHÙ HỢP GỢI Ý</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {result.occasion.map((occ) => (
                      <span key={occ} style={{ background: "#FFEDD5", color: "#EA580C", borderRadius: 20, padding: "4px 12px", fontSize: "0.78rem", fontWeight: 600 }}>{occ}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Attribute breakdown */}
              <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <h4 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 16, fontSize: "0.95rem" }}>Phân Tích Thuộc Tính</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {result.attributes.map((attr) => (
                    <div key={attr.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <div>
                          <span style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 500 }}>{attr.label}:  </span>
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0F172A" }}>{attr.value}</span>
                        </div>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: attr.score >= 90 ? "#10B981" : "#F59E0B" }}>{attr.score}%</span>
                      </div>
                      <div style={{ background: "#F1F5F9", borderRadius: 100, height: 5 }}>
                        <div style={{ width: `${attr.score}%`, background: attr.score >= 90 ? "#10B981" : "#F59E0B", borderRadius: 100, height: "100%", transition: "width 0.5s" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate("/app/wardrobe/add")}
                style={{ width: "100%", padding: "13px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #EA580C, #F97316)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
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
