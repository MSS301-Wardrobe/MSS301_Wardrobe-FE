const fs = require('fs');
let content = fs.readFileSync('D:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\image-library\\ImageLibrary.tsx', 'utf8');

// Add storageService import
content = content.replace(
  'import { toast } from "sonner";',
  'import { toast } from "sonner";\nimport { useEffect } from "react";\nimport { storageService } from "../../../services/storageService";'
);

// Remove mock data
content = content.replace(/const allImages = \[[\s\S]*?\];/g, '');

const newBody = `export function ImageLibrary() {
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
          size: img.size ? \`\${img.size} MB\` : "0 MB",
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
  }, []);`;

content = content.replace(/export function ImageLibrary\(\) \{[\s\S]*?const filtered = images.filter/, newBody + '\n\n  const filtered = images.filter');

fs.writeFileSync('D:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\image-library\\ImageLibrary.tsx', content, 'utf8');
console.log("Fixed ImageLibrary mock data");
