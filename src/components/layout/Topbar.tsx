import { Bell, Search, Plus } from "lucide-react";
import { useNavigate, useLocation, useSearchParams } from "react-router";
import { useState } from "react";
import { useAuthContext } from "../../app/providers/AuthProvider";

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
  "/admin/dashboard": "Tổng Quan",
  "/admin/users": "Quản Lý Người Dùng",
  "/admin/categories": "Quản Lý Danh Mục",
  "/admin/ai-requests": "Lịch Sử Nhận Diện AI",
  "/admin/recommendation-logs": "Lịch Sử Gợi Ý",
  "/admin/system-settings": "Quản lí hệ thống",
};

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const searchParams = new URLSearchParams(location.search);
  const customTitle = searchParams.get("wardrobeName") || searchParams.get("zoneName");
  const { user } = useAuthContext();

  const displayName = user?.fullName || user?.username || "Người dùng";
  const avatarUrl = user?.avatarUrl;

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const title = customTitle || (routeTitles[location.pathname] ??
    (location.pathname.startsWith("/app/wardrobe/") ? "Chi Tiết Trang Phục" :
      location.pathname.startsWith("/app/recommendations/") ? "Chi Tiết Gợi Ý" :
        location.pathname.startsWith("/app/friend-groups/") ? "Chi Tiết Nhóm" :
          "StyleAI"));

  const notifications = [
    { id: 1, text: "AI đã nhận diện 3 trang phục mới", time: "2 phút trước", color: "#EA580C" },
    { id: 2, text: "Gợi ý trang phục mới đã sẵn sàng", time: "15 phút trước", color: "#F97316" },
    { id: 3, text: "Tủ đồ của bạn đã tổ chức được 85%", time: "1 giờ trước", color: "#10B981" },
  ];

  const [searchParamsUrl, setSearchParamsUrl] = useSearchParams();
  const q = searchParamsUrl.get("q") || "";

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      searchParamsUrl.set("q", val);
    } else {
      searchParamsUrl.delete("q");
    }
    setSearchParamsUrl(searchParamsUrl);
  };

  return (
    <header className="sticky top-0 z-20 bg-card border-b border-border flex items-center justify-between px-6 py-4">
      <div>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", lineHeight: 1 }}>{title}</h1>
        <p style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 2 }}>
          {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        {/* <div className="hidden md:flex items-center gap-2 bg-muted rounded-xl px-3 py-2" style={{ minWidth: 220 }}>
          <Search size={15} color="#64748B" />
          <input
            placeholder="Tìm kiếm..."
            value={q}
            onChange={handleSearch}
            className="bg-transparent outline-none border-none"
            style={{ fontSize: "0.85rem", color: "#0F172A", width: "100%" }}
          />
        </div> */}

        {/* Add Button */}
        {/* <button
          onClick={() => navigate("/app/wardrobe/add")}
          className="flex items-center gap-2 rounded-xl px-4 py-2 transition-all hover:opacity-90"
          style={{ background: "#EA580C", color: "white", fontSize: "0.85rem", fontWeight: 600 }}
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Thêm Vật Phẩm</span>
        </button> */}


        {/* Avatar */}
        <div
          className="rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
          style={{
            width: 38,
            height: 38,
            background: avatarUrl
              ? "transparent"
              : "linear-gradient(135deg, #EA580C, #F97316)",
            color: "white",
            fontSize: "0.8rem",
            fontWeight: 700,
          }}
          onClick={() => navigate("/app/profile")}
          title={displayName}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            initials || "U"
          )}
        </div>
      </div>
    </header>
  );
}
