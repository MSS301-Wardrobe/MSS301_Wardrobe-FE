import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { useWardrobe } from "../../../hooks/useWardrobe";
import type { ClothingItem, Category } from "../../../types/wardrobe";
import { ArrowLeft, Heart, Edit2, Trash2, Share2, Tag, Info, Cpu } from "lucide-react";
import { toast } from "sonner";

const similarItems = [
  { id: "3", name: "Áo Thun Nữ Casual", img: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=100&h=100&fit=crop" },
  { id: "9", name: "Áo Trắng Tối Giản", img: "https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?w=100&h=100&fit=crop" },
  { id: "12", name: "Áo Vest Trắng Công Sở", img: "https://images.unsplash.com/photo-1700557477506-369b241cbe54?w=100&h=100&fit=crop" },
  { id: "4", name: "Giày Thể Thao Trắng", img: "https://images.unsplash.com/photo-1544441893-675973e31985?w=100&h=100&fit=crop" },
];

export function ClothingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clothingItemApi, categoryApi } = useWardrobe();
  const [favorite, setFavorite] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "ai" | "notes">("info");
  const [itemData, setItemData] = useState<ClothingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const cats = await categoryApi.getAll();
        setCategories(cats);
      } catch(e) {}
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    if (!id) return;
    const loadItem = async () => {
      setLoading(true);
      try {
        const data = await clothingItemApi.getById(id);
        setItemData(data);
      } catch (err) {
        toast.error("Không tìm thấy vật phẩm");
      } finally {
        setLoading(false);
      }
    };
    loadItem();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm("Bạn có chắc muốn xóa vật phẩm này không?")) return;
    try {
      await clothingItemApi.delete(id);
      toast.success("Đã xóa vật phẩm khỏi tủ đồ");
      navigate(-1);
    } catch {
      toast.error("Xóa thất bại, vui lòng thử lại");
    }
  };


  const getImageUrl = (imgId?: string) => {
    if (!imgId) return "https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=600&h=700&fit=crop";
    if (imgId.startsWith("http")) return imgId;
    return `http://localhost:8080/api/v1/storage/files/${imgId}`;
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Đang tải...</div>;
  if (!itemData) return <div style={{ padding: 40, textAlign: "center" }}>Không tìm thấy dữ liệu</div>;

  const catName = categories.find(c => c.categoryId === itemData.categoryId)?.categoryName || "Chưa phân loại";

  const item = {
    id: itemData.itemId,
    name: itemData.itemName,
    category: catName,
    subcategory: "-",
    color: itemData.dominantColor || "-",
    material: "-",
    brand: "-",
    size: "-",
    purchaseDate: new Date(itemData.createdAt).toLocaleDateString("vi-VN"),
    purchasePrice: "-",
    condition: "-",
    wearCount: 0,
    lastWorn: "-",
    img: getImageUrl(itemData.imageId),
    tags: [],
    aiConfidence: itemData.confidenceScore ? (itemData.confidenceScore * 100).toFixed(1) : 0,
    aiAttributes: [] as Array<{label: string, value: string, confidence: number}>,
    notes: "Chưa có ghi chú",
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
        {/* Left: Image */}
        <div>
          <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <img src={item.img} alt={item.name} style={{ width: "100%", height: 440, objectFit: "cover" }} />
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
            <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "white", cursor: "pointer", fontSize: "0.85rem", color: "#64748B" }}>
              <Share2 size={16} />
              Chia Sẻ
            </button>
            <button style={{ padding: "10px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "white", cursor: "pointer" }}>
              <Edit2 size={16} color="#64748B" />
            </button>
            <button onClick={handleDelete} style={{ padding: "10px 14px", borderRadius: 12, border: "1.5px solid #FEE2E2", background: "#FEF2F2", cursor: "pointer" }}>
              <Trash2 size={16} color="#EF4444" />
            </button>
          </div>
        </div>

        {/* Right: Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Title */}
          <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ background: "#FFEDD5", color: "#EA580C", borderRadius: 20, padding: "3px 12px", fontSize: "0.75rem", fontWeight: 600 }}>{item.category}</span>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0F172A", marginTop: 10, marginBottom: 4 }}>{item.name}</h2>
                <p style={{ color: "#64748B", fontSize: "0.85rem" }}>{item.brand} · {item.size} · {item.material}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "0.75rem", color: "#64748B" }}>Giá Mua</p>
                <p style={{ fontWeight: 800, color: "#0F172A", fontSize: "1.1rem" }}>{item.purchasePrice}</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 20 }}>
              {[
                { label: "Số Lần Mặc", value: item.wearCount },
                { label: "Lần Cuối Mặc", value: item.lastWorn },
                { label: "Tình Trạng", value: item.condition },
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
                { id: "info", label: "Chi Tiết", icon: Info },
                { id: "ai", label: "Phân Tích AI", icon: Cpu },
                { id: "notes", label: "Thẻ & Ghi Chú", icon: Tag },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  style={{
                    flex: 1, padding: "12px 16px", border: "none", cursor: "pointer",
                    background: activeTab === id ? "#FFEDD5" : "white",
                    color: activeTab === id ? "#EA580C" : "#64748B",
                    fontWeight: activeTab === id ? 700 : 400,
                    fontSize: "0.85rem",
                    borderBottom: activeTab === id ? "2px solid #EA580C" : "2px solid transparent",
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
                    { label: "Danh Mục", value: item.category },
                    { label: "Danh Mục Con", value: item.subcategory },
                    { label: "Màu Sắc", value: item.color },
                    { label: "Chất Liệu", value: item.material },
                    { label: "Thương Hiệu", value: item.brand },
                    { label: "Kích Thước", value: item.size },
                    { label: "Ngày Mua", value: item.purchaseDate },
                    { label: "Tình Trạng", value: item.condition },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p style={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{label}</p>
                      <p style={{ fontSize: "0.88rem", fontWeight: 500, color: "#0F172A" }}>{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "ai" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, background: "#ECFDF5", borderRadius: 12, padding: "10px 14px" }}>
                    <Cpu size={16} color="#10B981" />
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#059669" }}>Độ Tin Cậy AI: {item.aiConfidence}%</span>
                    <div style={{ flex: 1, background: "#D1FAE5", borderRadius: 100, height: 6, marginLeft: 8 }}>
                      <div style={{ width: `${item.aiConfidence}%`, background: "#10B981", borderRadius: 100, height: "100%" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {item.aiAttributes.map((attr) => (
                      <div key={attr.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <p style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 500 }}>{attr.label}</p>
                          <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "#0F172A" }}>{attr.value}</p>
                        </div>
                        <div style={{ textAlign: "right", minWidth: 80 }}>
                          <p style={{ fontSize: "0.72rem", color: "#94A3B8", marginBottom: 4 }}>{attr.confidence}%</p>
                          <div style={{ background: "#F1F5F9", borderRadius: 100, height: 4, width: 80 }}>
                            <div style={{ width: `${attr.confidence}%`, background: "#EA580C", borderRadius: 100, height: "100%" }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "notes" && (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", marginBottom: 8 }}>Thẻ</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {item.tags.map((tag) => (
                        <span key={tag} style={{ background: "#FFEDD5", color: "#EA580C", borderRadius: 20, padding: "4px 12px", fontSize: "0.8rem", fontWeight: 500 }}>
                          #{tag}
                        </span>
                      ))}
                      <button style={{ background: "#F1F5F9", color: "#64748B", borderRadius: 20, padding: "4px 12px", fontSize: "0.8rem", border: "1.5px dashed #CBD5E1", cursor: "pointer" }}>
                        + Thêm thẻ
                      </button>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", marginBottom: 8 }}>Ghi Chú Cá Nhân</p>
                    <p style={{ fontSize: "0.88rem", color: "#64748B", lineHeight: 1.7, background: "#F8FAFC", borderRadius: 10, padding: "12px 14px" }}>{item.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Similar Items */}
          <div style={{ background: "white", borderRadius: 20, padding: 20, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h4 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 14, fontSize: "0.95rem" }}>Vật Phẩm Tương Tự Trong Tủ Đồ</h4>
            <div style={{ display: "flex", gap: 12 }}>
              {similarItems.map((si) => (
                <div key={si.id} onClick={() => navigate(`/app/wardrobe/${si.id}`)} style={{ cursor: "pointer", textAlign: "center" }}>
                  <img src={si.img} alt={si.name} style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover", border: "1px solid #E2E8F0" }} />
                  <p style={{ fontSize: "0.65rem", color: "#64748B", marginTop: 5, maxWidth: 64, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{si.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
