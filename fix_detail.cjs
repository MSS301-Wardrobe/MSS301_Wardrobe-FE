const fs = require('fs');
let content = fs.readFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\ClothingDetail.tsx', 'utf8');

// 1. Add useParams and APIs
content = content.replace(
  'import { useNavigate } from "react-router";',
  'import { useNavigate, useParams } from "react-router";\nimport { useEffect, useState } from "react";\nimport { clothingItemApi, categoryApi } from "../../../services/wardrobeService";\nimport type { ClothingItem, Category } from "../../../types/wardrobe";'
);

content = content.replace(
  'import { useState } from "react";\nimport { toast } from "sonner";',
  'import { toast } from "sonner";'
);

// 2. Remove the mock 'const item =' entirely, or just replace the component body
// It's easier to replace the start of the component up to the return statement.
const oldBodyRegex = /export function ClothingDetail\(\) \{[\s\S]*?return \(/;

const newBody = `export function ClothingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
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
    // mock delete
    toast.success("Đã xóa vật phẩm khỏi tủ đồ");
    navigate("/app/wardrobe");
  };

  const getImageUrl = (imgId?: string) => {
    if (!imgId) return "https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=600&h=700&fit=crop";
    if (imgId.startsWith("http")) return imgId;
    return \`http://localhost:8080/api/v1/storage/files/\${imgId}\`;
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
    aiAttributes: [],
    notes: "Chưa có ghi chú",
  };

  return (`

content = content.replace(oldBodyRegex, newBody);

fs.writeFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\ClothingDetail.tsx', content, 'utf8');
console.log("Updated ClothingDetail.tsx");
