import { Sparkles } from "lucide-react";

export function RecommendationLogs() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>Lịch Sử Gợi Ý</h2>
        <p style={{ color: "#64748B", fontSize: "0.85rem" }}>Xem lại các gợi ý trang phục mà hệ thống đã tạo</p>
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: 48, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sparkles size={26} color="#F59E0B" />
        </div>
        <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>Nhật ký gợi ý</h3>
        <p style={{ color: "#64748B", fontSize: "0.85rem", maxWidth: 420 }}>
          Khu vực này sẽ hiển thị lịch sử các yêu cầu gợi ý trang phục cùng kết quả. Tính năng sẽ được kết nối với API trong giai đoạn tiếp theo.
        </p>
      </div>
    </div>
  );
}
