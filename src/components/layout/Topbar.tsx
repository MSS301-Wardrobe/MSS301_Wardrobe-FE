import { Bell, Search, Plus } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useState } from "react";

const routeTitles: Record<string, string> = {
  "/app/dashboard": "Tổng Quan",
  "/app/wardrobe": "Tủ Đồ Của Tôi",
  "/app/wardrobe/add": "Thêm Trang Phục",
  "/app/wardrobe/zones": "Khu Vực Tủ Đồ",
  "/app/profile": "Hồ Sơ",
  "/app/preferences": "Sở Thích",
  "/app/friend-groups": "Nhóm Bạn",
  "/app/ai-detection": "Nhận Diện AI",
  "/app/ai-analysis": "Phân Tích AI",
  "/app/recommendations": "Gợi Ý Trang Phục",
  "/app/event-outfits": "Gợi Ý Theo Sự Kiện",
  "/app/image-library": "Thư Viện Ảnh",
  "/admin/dashboard": "Admin Dashboard",
  "/admin/users": "Quản Lý Người Dùng",
  "/admin/categories": "Quản Lý Danh Mục",
  "/admin/ai-requests": "Lịch Sử Nhận Diện AI",
  "/admin/recommendation-logs": "Lịch Sử Gợi Ý",
  "/admin/system-settings": "Cấu Hình Hệ Thống",
};

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const title = routeTitles[location.pathname] ??
    (location.pathname.startsWith("/app/wardrobe/") ? "Chi Tiết Trang Phục" :
     location.pathname.startsWith("/app/recommendations/") ? "Chi Tiết Gợi Ý" :
     location.pathname.startsWith("/app/friend-groups/") ? "Chi Tiết Nhóm" :
     "StyleAI");

  const notifications = [
    { id: 1, text: "AI đã nhận diện 3 trang phục mới", time: "2 phút trước", color: "#EA580C" },
    { id: 2, text: "Gợi ý trang phục mới đã sẵn sàng", time: "15 phút trước", color: "#F97316" },
    { id: 3, text: "Tủ đồ của bạn đã tổ chức được 85%", time: "1 giờ trước", color: "#10B981" },
  ];

  return (
    <header className="sticky top-0 z-20 bg-card border-b border-border flex items-center justify-between px-6 py-4">
      <div>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", lineHeight: 1 }}>{title}</h1>
        <p style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 2 }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-muted rounded-xl px-3 py-2" style={{ minWidth: 220 }}>
          <Search size={15} color="#64748B" />
          <input
            placeholder="Tìm kiếm tủ đồ..."
            className="bg-transparent outline-none border-none"
            style={{ fontSize: "0.85rem", color: "#0F172A", width: "100%" }}
          />
        </div>

        {/* Add Button */}
        <button
          onClick={() => navigate("/app/wardrobe/add")}
          className="flex items-center gap-2 rounded-xl px-4 py-2 transition-all hover:opacity-90"
          style={{ background: "#EA580C", color: "white", fontSize: "0.85rem", fontWeight: 600 }}
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Thêm Vật Phẩm</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex items-center justify-center rounded-xl bg-muted transition-all hover:bg-border"
            style={{ width: 38, height: 38 }}
          >
            <Bell size={17} color="#64748B" />
            <span
              className="absolute top-1.5 right-1.5 rounded-full"
              style={{ width: 8, height: 8, background: "#EF4444" }}
            />
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-12 bg-card border border-border rounded-2xl shadow-xl z-50"
              style={{ width: 300 }}
            >
              <div className="px-4 py-3 border-b border-border">
                <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>Thông Báo</p>
              </div>
              {notifications.map((n) => (
                <div key={n.id} className="px-4 py-3 hover:bg-muted transition-colors cursor-pointer border-b border-border last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full mt-0.5 shrink-0" style={{ width: 8, height: 8, background: n.color, marginTop: 6 }} />
                    <div>
                      <p style={{ fontSize: "0.8rem", color: "#0F172A", lineHeight: 1.4 }}>{n.text}</p>
                      <p style={{ fontSize: "0.7rem", color: "#64748B", marginTop: 2 }}>{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div
          className="rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
          style={{
            width: 38, height: 38,
            background: "linear-gradient(135deg, #EA580C, #F97316)",
            color: "white", fontSize: "0.8rem", fontWeight: 700
          }}
          onClick={() => navigate("/app/profile")}
        >
          JS
        </div>
      </div>
    </header>
  );
}
