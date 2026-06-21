const fs = require('fs');
let content = fs.readFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\ClothingDetail.tsx', 'utf8');

const correctImports = `import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { clothingItemApi, categoryApi } from "../../../services/wardrobeService";
import type { ClothingItem, Category } from "../../../types/wardrobe";
import { ArrowLeft, Heart, Edit2, Trash2, Share2, Tag, Info, Cpu } from "lucide-react";
import { toast } from "sonner";\n\n`;

const similarItemsStr = `const similarItems = [
  { id: "3", name: "Áo Thun Nữ Casual", img: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=100&h=100&fit=crop" },
  { id: "9", name: "Áo Trắng Tối Giản", img: "https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?w=100&h=100&fit=crop" },
  { id: "12", name: "Áo Vest Trắng Công Sở", img: "https://images.unsplash.com/photo-1700557477506-369b241cbe54?w=100&h=100&fit=crop" },
  { id: "4", name: "Giày Thể Thao Trắng", img: "https://images.unsplash.com/photo-1544441893-675973e31985?w=100&h=100&fit=crop" },
];\n\n`;

// Since the file currently starts with:
// import { useNavigate, useParams } from "react-router";
// import { useEffect, useState } from "react";
// import { clothingItemApi, categoryApi } from "../../../services/wardrobeService";
//   subcategory: "Sơ Mi",
// ... we can just find the 'export function ClothingDetail() {' and replace everything BEFORE it.

const idx = content.indexOf('export function ClothingDetail() {');
if (idx !== -1) {
  content = correctImports + similarItemsStr + content.substring(idx);
  fs.writeFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\ClothingDetail.tsx', content, 'utf8');
  console.log("Fixed top of ClothingDetail.tsx");
} else {
  console.log("Could not find export function ClothingDetail");
}
