import { Settings } from "lucide-react";

export function SystemSettings() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>Cấu Hình Hệ Thống</h2>
        <p style={{ color: "#64748B", fontSize: "0.85rem" }}>Quản lý các thiết lập chung của nền tảng</p>
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: 48, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Settings size={26} color="#4F46E5" />
        </div>
        <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>Thiết lập nền tảng</h3>
        <p style={{ color: "#64748B", fontSize: "0.85rem", maxWidth: 420 }}>
          Khu vực này sẽ cho phép cấu hình các tham số hệ thống, tích hợp và quyền hạn. Tính năng sẽ được kết nối với API trong giai đoạn tiếp theo.
        </p>
      </div>
    </div>
  );
}
