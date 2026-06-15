import { FolderTree } from "lucide-react";

export function CategoriesManagement() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>Quản Lý Danh Mục</h2>
        <p style={{ color: "#64748B", fontSize: "0.85rem" }}>Tổ chức danh mục trang phục và thuộc tính phân loại</p>
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: 48, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FolderTree size={26} color="#F97316" />
        </div>
        <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>Cây danh mục</h3>
        <p style={{ color: "#64748B", fontSize: "0.85rem", maxWidth: 420 }}>
          Khu vực này sẽ cho phép thêm, sửa và sắp xếp các danh mục trang phục. Tính năng sẽ được kết nối với API trong giai đoạn tiếp theo.
        </p>
      </div>
    </div>
  );
}
