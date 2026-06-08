import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Heart, Trash2, Info, Cpu, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { clothingItemApi, categoryApi, wardrobeZoneApi } from "../../../services/wardrobeService";
import type { ClothingItem, Category, WardrobeZone } from "../../../types/wardrobe";

export function ClothingDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<ClothingItem | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [zone, setZone] = useState<WardrobeZone | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "ai">("info");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchItem = async () => {
      setLoading(true);
      try {
        const fetched = await clothingItemApi.getById(id);
        setItem(fetched);

        // Fetch related data in parallel
        const promises: Promise<any>[] = [];
        if (fetched.categoryId) promises.push(categoryApi.getById(fetched.categoryId));
        else promises.push(Promise.resolve(null));
        if (fetched.zoneId) promises.push(wardrobeZoneApi.getById(fetched.zoneId));
        else promises.push(Promise.resolve(null));

        const [cat, zn] = await Promise.all(promises);
        setCategory(cat);
        setZone(zn);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error("Không thể tải thông tin vật phẩm");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await clothingItemApi.delete(id);
      toast.success("Đã xóa vật phẩm khỏi tủ đồ");
      navigate("/app/wardrobe");
    } catch {
      toast.error("Xóa thất bại, vui lòng thử lại");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
        <Loader2 size={36} color="#4F46E5" style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ marginLeft: 14, color: "#64748B", fontSize: "1rem" }}>Đang tải thông tin...</span>
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔍</div>
        <h2 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Không tìm thấy vật phẩm</h2>
        <p style={{ color: "#64748B", marginBottom: 24 }}>Vật phẩm này không tồn tại hoặc đã bị xóa.</p>
        <button
          onClick={() => navigate("/app/wardrobe")}
          style={{ padding: "10px 20px", borderRadius: 12, background: "#4F46E5", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}
        >
          Quay Lại Tủ Đồ
        </button>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      {/* Back */}
      <button
        onClick={() => navigate("/app/wardrobe")}
        style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", background: "none", border: "none", cursor: "pointer", marginBottom: 20, fontSize: "0.875rem" }}
      >
        <ArrowLeft size={16} />
        Quay Lại Tủ Đồ
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 24, alignItems: "start" }}>
        {/* Left: Image placeholder */}
        <div>
          <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", background: "linear-gradient(135deg, #EEF2FF, #E0E7FF)", height: 440, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "8rem" }}>👕</span>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              onClick={() => setFavorite(!favorite)}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px", borderRadius: 12, border: `1.5px solid ${favorite ? "#FEE2E2" : "#E2E8F0"}`, background: favorite ? "#FEF2F2" : "white", cursor: "pointer", fontSize: "0.85rem", fontWeight: 500, color: favorite ? "#EF4444" : "#64748B" }}
            >
              <Heart size={16} fill={favorite ? "#EF4444" : "none"} color={favorite ? "#EF4444" : "#64748B"} />
              {favorite ? "Đã Lưu" : "Lưu"}
            </button>
            <button
              onClick={() => setDeleteConfirm(true)}
              style={{ padding: "10px 14px", borderRadius: 12, border: "1.5px solid #FEE2E2", background: "#FEF2F2", cursor: "pointer" }}
            >
              <Trash2 size={16} color="#EF4444" />
            </button>
          </div>
        </div>

        {/* Right: Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Title card */}
          <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                {category && (
                  <span style={{ background: "#EEF2FF", color: "#4F46E5", borderRadius: 20, padding: "3px 12px", fontSize: "0.75rem", fontWeight: 600 }}>
                    {category.categoryName}
                  </span>
                )}
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0F172A", marginTop: 10, marginBottom: 4 }}>{item.itemName}</h2>
                <p style={{ color: "#64748B", fontSize: "0.85rem" }}>
                  {zone ? `Khu vực: ${zone.zoneName}` : "Chưa phân khu vực"}
                  {item.dominantColor ? ` · ${item.dominantColor}` : ""}
                </p>
              </div>
              {item.confidenceScore && (
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "0.75rem", color: "#64748B" }}>Điểm AI</p>
                  <p style={{ fontWeight: 800, color: "#10B981", fontSize: "1.3rem" }}>
                    {(item.confidenceScore * 100).toFixed(1)}%
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
              {[
                { label: "Ngày Thêm", value: formatDate(item.createdAt) },
                { label: "Phong Cách", value: item.style ?? "—" },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "#F8FAFC", borderRadius: 12, padding: "12px 14px" }}>
                  <p style={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 500 }}>{label}</p>
                  <p style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.9rem", marginTop: 3 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ background: "white", borderRadius: 20, border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", borderBottom: "1px solid #E2E8F0" }}>
              {[
                { id: "info" as const, label: "Chi Tiết", icon: Info },
                { id: "ai" as const, label: "Phân Tích AI", icon: Cpu },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    flex: 1, padding: "12px 16px", border: "none", cursor: "pointer",
                    background: activeTab === id ? "#EEF2FF" : "white",
                    color: activeTab === id ? "#4F46E5" : "#64748B",
                    fontWeight: activeTab === id ? 700 : 400,
                    fontSize: "0.85rem",
                    borderBottom: activeTab === id ? "2px solid #4F46E5" : "2px solid transparent",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            <div style={{ padding: 20 }}>
              {activeTab === "info" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {[
                    { label: "Item ID", value: item.itemId },
                    { label: "Danh Mục", value: category?.categoryName ?? "—" },
                    { label: "Khu Vực", value: zone?.zoneName ?? "—" },
                    { label: "Màu Chủ Đạo", value: item.dominantColor ?? "—" },
                    { label: "Phong Cách", value: item.style ?? "—" },
                    { label: "Ngày Tạo", value: formatDate(item.createdAt) },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p style={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{label}</p>
                      <p style={{ fontSize: label === "Item ID" ? "0.72rem" : "0.88rem", fontWeight: 500, color: "#0F172A", fontFamily: label === "Item ID" ? "monospace" : "inherit", wordBreak: "break-all" }}>{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "ai" && (
                <div>
                  {item.confidenceScore ? (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, background: "#ECFDF5", borderRadius: 12, padding: "10px 14px" }}>
                        <Cpu size={16} color="#10B981" />
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#059669" }}>
                          Độ Tin Cậy AI: {(item.confidenceScore * 100).toFixed(1)}%
                        </span>
                        <div style={{ flex: 1, background: "#D1FAE5", borderRadius: 100, height: 6, marginLeft: 8 }}>
                          <div style={{ width: `${item.confidenceScore * 100}%`, background: "#10B981", borderRadius: 100, height: "100%" }} />
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {[
                          { label: "Màu Chủ Đạo", value: item.dominantColor ?? "—", confidence: item.confidenceScore },
                          { label: "Phong Cách", value: item.style ?? "—", confidence: item.confidenceScore * 0.95 },
                          { label: "Danh Mục", value: category?.categoryName ?? "—", confidence: item.confidenceScore * 0.98 },
                        ].map((attr) => (
                          <div key={attr.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <p style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 500 }}>{attr.label}</p>
                              <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "#0F172A" }}>{attr.value}</p>
                            </div>
                            <div style={{ textAlign: "right", minWidth: 80 }}>
                              <p style={{ fontSize: "0.72rem", color: "#94A3B8", marginBottom: 4 }}>{(attr.confidence * 100).toFixed(0)}%</p>
                              <div style={{ background: "#F1F5F9", borderRadius: 100, height: 4, width: 80 }}>
                                <div style={{ width: `${attr.confidence * 100}%`, background: "#4F46E5", borderRadius: 100, height: "100%" }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: "center", padding: "32px 24px", color: "#64748B" }}>
                      <Cpu size={32} color="#CBD5E1" style={{ marginBottom: 12 }} />
                      <p>Chưa có dữ liệu phân tích AI</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div
          onClick={() => setDeleteConfirm(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "white", borderRadius: 20, padding: 32, maxWidth: 380, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.2)", textAlign: "center" }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>⚠️</div>
            <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Xóa vật phẩm này?</h3>
            <p style={{ color: "#64748B", fontSize: "0.9rem", marginBottom: 24 }}>
              <strong style={{ color: "#0F172A" }}>{item.itemName}</strong> sẽ bị xóa vĩnh viễn khỏi tủ đồ của bạn.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setDeleteConfirm(false)}
                style={{ flex: 1, padding: "11px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer" }}
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                style={{ flex: 1, padding: "11px", borderRadius: 12, border: "none", background: "#EF4444", color: "white", fontWeight: 700, cursor: "pointer" }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
