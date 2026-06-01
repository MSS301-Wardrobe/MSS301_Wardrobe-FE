import { useState } from "react";
import { Sparkles, Star, Heart, ChevronRight, CalendarDays, Cpu, Users } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const events = [
  { id: "work", label: "Công Sở", icon: "💼", desc: "Văn Phòng & Kinh Doanh", color: "#4F46E5", bg: "#EEF2FF" },
  { id: "casual", label: "Thường Ngày", icon: "☕", desc: "Mặc Hàng Ngày", color: "#10B981", bg: "#ECFDF5" },
  { id: "party", label: "Tiệc Tùng", icon: "🎉", desc: "Sự Kiện Xã Hội", color: "#8B5CF6", bg: "#F5F3FF" },
  { id: "wedding", label: "Đám Cưới", icon: "💍", desc: "Lễ Nghi Trang Trọng", color: "#EC4899", bg: "#FDF2F8" },
  { id: "travel", label: "Du Lịch", icon: "✈️", desc: "Khi Di Chuyển", color: "#0EA5E9", bg: "#F0F9FF" },
  { id: "interview", label: "Phỏng Vấn", icon: "🎯", desc: "Ấn Tượng Đầu Tiên", color: "#F59E0B", bg: "#FFFBEB" },
];

type Outfit = {
  id: string;
  title: string;
  score: number;
  source: string;
  sourceColor: string;
  reason: string;
  img: string;
  items: number;
  tags: string[];
  favorites: number;
};

const recommendations: Record<string, Outfit[]> = {
  work: [
    { id: "w1", title: "Chuyên Nghiệp Uy Quyền", score: 96, source: "AI + Sở Thích", sourceColor: "#4F46E5", reason: "Phù hợp phong cách tối giản và lịch sử công sở của bạn", img: "https://images.unsplash.com/photo-1700557477506-369b241cbe54?w=400&h=500&fit=crop", items: 4, tags: ["Trang Trọng", "Tối Giản"], favorites: 24 },
    { id: "w2", title: "Quyền Lực Lịch Sự", score: 91, source: "Nhóm Bạn", sourceColor: "#8B5CF6", reason: "Phổ biến trong nhóm Minimalist Collective tuần này", img: "https://images.unsplash.com/photo-1731589802956-b4693dae884b?w=400&h=500&fit=crop", items: 4, tags: ["Kinh Doanh", "Sắc Sảo"], favorites: 18 },
    { id: "w3", title: "Giám Đốc Sáng Tạo", score: 87, source: "Người Dùng Tương Tự", sourceColor: "#10B981", reason: "87% người dùng có hồ sơ tương tự yêu thích sự kết hợp này", img: "https://images.unsplash.com/photo-1634921276069-c24ba5d6b35c?w=400&h=500&fit=crop", items: 3, tags: ["Công Sở Thường"], favorites: 31 },
  ],
  casual: [
    { id: "c1", title: "Cuối Tuần Tối Giản", score: 93, source: "AI + Sở Thích", sourceColor: "#4F46E5", reason: "Màu sắc yêu thích và sở thích phong cách thường ngày của bạn", img: "https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?w=400&h=500&fit=crop", items: 3, tags: ["Thoải Mái", "Gọn Gàng"], favorites: 42 },
    { id: "c2", title: "Khám Phá Thành Phố", score: 89, source: "Loại Sự Kiện", sourceColor: "#10B981", reason: "Tối ưu cho các hoạt động ngoài trời cuối tuần", img: "https://images.unsplash.com/photo-1589351189946-b8eb5e170ba6?w=400&h=500&fit=crop", items: 4, tags: ["Thường Ngày", "Đa Năng"], favorites: 27 },
    { id: "c3", title: "Đường Phố Tự Nhiên", score: 85, source: "Nhóm Bạn", sourceColor: "#8B5CF6", reason: "Đang thịnh hành trong nhóm Street Style Crew", img: "https://images.unsplash.com/photo-1617690033147-ce6b332d677b?w=400&h=500&fit=crop", items: 3, tags: ["Đường Phố", "Nổi Bật"], favorites: 19 },
  ],
  party: [
    { id: "p1", title: "Rực Rỡ Buổi Tối", score: 95, source: "AI + Sở Thích", sourceColor: "#4F46E5", reason: "Cân bằng hoàn hảo giữa thanh lịch và lễ hội cho sự kiện xã hội", img: "https://images.unsplash.com/photo-1617690033147-ce6b332d677b?w=400&h=500&fit=crop", items: 5, tags: ["Thanh Lịch", "Lễ Hội"], favorites: 56 },
    { id: "p2", title: "Đêm Nổi Bật", score: 90, source: "Loại Sự Kiện", sourceColor: "#10B981", reason: "AI tối ưu cho các dịp tiệc tùng và ánh sáng buổi tối", img: "https://images.unsplash.com/photo-1589351189946-b8eb5e170ba6?w=400&h=500&fit=crop", items: 4, tags: ["Ấn Tượng", "Lộng Lẫy"], favorites: 38 },
  ],
  wedding: [
    { id: "wed1", title: "Thanh Lịch Vườn Hoa", score: 94, source: "AI + Sở Thích", sourceColor: "#4F46E5", reason: "Cổ điển và phù hợp cho lễ cưới ngoài trời", img: "https://images.unsplash.com/photo-1700557477506-369b241cbe54?w=400&h=500&fit=crop", items: 5, tags: ["Trang Trọng", "Lãng Mạn"], favorites: 63 },
    { id: "wed2", title: "Khách Mời Tinh Tế", score: 88, source: "Người Dùng Tương Tự", sourceColor: "#10B981", reason: "Lựa chọn phổ biến của người dùng tham dự sự kiện tương tự", img: "https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?w=400&h=500&fit=crop", items: 5, tags: ["Thanh Lịch", "Cổ Điển"], favorites: 44 },
  ],
  travel: [
    { id: "t1", title: "Lữ Hành Đa Năng", score: 92, source: "AI + Sở Thích", sourceColor: "#4F46E5", reason: "Các món đồ phối hợp linh hoạt, gọn nhẹ mà vẫn đẹp", img: "https://images.unsplash.com/photo-1634921276069-c24ba5d6b35c?w=400&h=500&fit=crop", items: 6, tags: ["Thực Dụng", "Đa Năng"], favorites: 35 },
    { id: "t2", title: "Du Khách Thành Phố", score: 87, source: "Loại Sự Kiện", sourceColor: "#10B981", reason: "Tối ưu cho nhiều môi trường và hoạt động du lịch khác nhau", img: "https://images.unsplash.com/photo-1589351189946-b8eb5e170ba6?w=400&h=500&fit=crop", items: 5, tags: ["Thường Ngày", "Thông Minh"], favorites: 28 },
  ],
  interview: [
    { id: "i1", title: "Ấn Tượng Đầu Tiên", score: 98, source: "AI + Sở Thích", sourceColor: "#4F46E5", reason: "Bộ trang phục điểm cao nhất cho ấn tượng chuyên nghiệp đầu tiên trong ngành của bạn", img: "https://images.unsplash.com/photo-1731589802956-b4693dae884b?w=400&h=500&fit=crop", items: 4, tags: ["Chuyên Nghiệp", "Tự Tin"], favorites: 78 },
    { id: "i2", title: "Sẵn Sàng Ngành Công Nghệ", score: 91, source: "Người Dùng Tương Tự", sourceColor: "#10B981", reason: "Được 91% người dùng đã xin được việc trong lĩnh vực mục tiêu của bạn sử dụng", img: "https://images.unsplash.com/photo-1700557477506-369b241cbe54?w=400&h=500&fit=crop", items: 4, tags: ["Lịch Sự", "Bóng Bẩy"], favorites: 52 },
  ],
};

const sourceIcons: Record<string, React.ElementType> = {
  "AI + Sở Thích": Cpu,
  "Loại Sự Kiện": CalendarDays,
  "Nhóm Bạn": Users,
  "Người Dùng Tương Tự": Users,
};

export function EventRecommendation() {
  const navigate = useNavigate();
  const [activeEvent, setActiveEvent] = useState("work");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [eventDate, setEventDate] = useState("");

  const toggleFav = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else { next.add(id); toast.success("Đã lưu vào yêu thích!"); }
      return next;
    });
  };

  const activeEventData = events.find((e) => e.id === activeEvent)!;
  const outfits = recommendations[activeEvent] || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #312E81 100%)", borderRadius: 20, padding: "28px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(79,70,229,0.15)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <CalendarDays size={18} color="rgba(255,255,255,0.6)" />
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.82rem", fontWeight: 500 }}>Tạo Kiểu AI Theo Sự Kiện</span>
        </div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "white", marginBottom: 6 }}>Gợi Ý Theo Sự Kiện</h2>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.875rem", maxWidth: 520, marginBottom: 24 }}>
          Cho chúng tôi biết dịp của bạn và AI sẽ tuyển chọn trang phục hoàn hảo từ tủ đồ của bạn — xem xét phong cách, sở thích nhóm bạn và người dùng tương tự.
        </p>

        {/* Event Date Input */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px" }}>
            <CalendarDays size={15} color="rgba(255,255,255,0.7)" />
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              style={{ background: "none", border: "none", outline: "none", color: "rgba(255,255,255,0.9)", fontSize: "0.875rem" }}
            />
          </div>
          <button
            onClick={() => toast.success("Đã cập nhật gợi ý cho ngày sự kiện của bạn!")}
            style={{ padding: "10px 18px", borderRadius: 10, background: "#4F46E5", color: "white", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem", display: "flex", alignItems: "center", gap: 6 }}
          >
            <Sparkles size={14} />
            Nhận Gợi Ý
          </button>
        </div>
      </div>

      {/* Event Type Selector */}
      <div style={{ background: "white", borderRadius: 18, padding: 20, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>Chọn Dịp</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => setActiveEvent(event.id)}
              style={{
                padding: "14px 12px", borderRadius: 14,
                border: `2px solid ${activeEvent === event.id ? event.color : "#E2E8F0"}`,
                background: activeEvent === event.id ? event.bg : "white",
                cursor: "pointer", textAlign: "center", transition: "all 0.15s",
              }}
            >
              <div style={{ fontSize: "1.6rem", marginBottom: 6 }}>{event.icon}</div>
              <p style={{ fontWeight: activeEvent === event.id ? 700 : 500, color: activeEvent === event.id ? event.color : "#374151", fontSize: "0.85rem" }}>{event.label}</p>
              <p style={{ fontSize: "0.68rem", color: "#94A3B8", marginTop: 2 }}>{event.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recommendation Sources Legend */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { label: "AI + Sở Thích", color: "#4F46E5", icon: Cpu },
          { label: "Loại Sự Kiện", color: "#10B981", icon: CalendarDays },
          { label: "Nhóm Bạn", color: "#8B5CF6", icon: Users },
          { label: "Người Dùng Tương Tự", color: "#F59E0B", icon: Users },
        ].map(({ label, color, icon: Icon }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, background: "white", borderRadius: 10, padding: "6px 12px", border: "1px solid #E2E8F0" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
            <Icon size={12} color={color} />
            <span style={{ fontSize: "0.75rem", color: "#374151", fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Outfit Cards */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: activeEventData.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>{activeEventData.icon}</div>
          <div>
            <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>Trang Phục Tốt Nhất Cho {activeEventData.label}</h3>
            <p style={{ fontSize: "0.78rem", color: "#64748B", marginTop: 1 }}>{outfits.length} gợi ý do AI tuyển chọn từ tủ đồ của bạn</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {outfits.map((outfit, rank) => (
            <div
              key={outfit.id}
              style={{ background: "white", borderRadius: 20, overflow: "hidden", border: "1px solid #E2E8F0", cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
              onClick={() => navigate(`/app/recommendations/${outfit.id}`)}
            >
              {/* Image */}
              <div style={{ position: "relative" }}>
                <img src={outfit.img} alt={outfit.title} style={{ width: "100%", height: 260, objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.7), transparent)" }} />

                {/* Rank badge */}
                {rank === 0 && (
                  <div style={{ position: "absolute", top: 12, left: 12, background: "#F59E0B", color: "white", borderRadius: 8, padding: "4px 10px", fontSize: "0.72rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 4 }}>
                    <Star size={11} fill="white" />
                    Phù Hợp Nhất
                  </div>
                )}

                {/* Score */}
                <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.95)", borderRadius: 20, padding: "4px 12px", display: "flex", alignItems: "center", gap: 4 }}>
                  <Star size={11} fill="#F59E0B" color="#F59E0B" />
                  <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#0F172A" }}>{outfit.score}%</span>
                </div>

                {/* Source badge */}
                <div style={{ position: "absolute", bottom: 12, left: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.9)", borderRadius: 8, padding: "4px 10px" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: outfit.sourceColor }} />
                    <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#374151" }}>{outfit.source}</span>
                  </div>
                </div>

                {/* Items count */}
                <div style={{ position: "absolute", bottom: 12, right: 12 }}>
                  <span style={{ background: "rgba(255,255,255,0.9)", color: "#374151", borderRadius: 7, padding: "4px 9px", fontSize: "0.68rem", fontWeight: 600 }}>{outfit.items} vật phẩm</span>
                </div>

                {/* Favorite */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFav(outfit.id); }}
                  style={{ position: "absolute", top: rank === 0 ? 12 : 12, right: 52, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Heart size={15} fill={favorites.has(outfit.id) ? "#EF4444" : "none"} color={favorites.has(outfit.id) ? "#EF4444" : "#94A3B8"} />
                </button>
              </div>

              {/* Content */}
              <div style={{ padding: "16px 18px" }}>
                <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 6, fontSize: "0.95rem" }}>{outfit.title}</h3>

                {/* Reason */}
                <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "8px 12px", marginBottom: 12 }}>
                  <p style={{ fontSize: "0.75rem", color: "#64748B", lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 600, color: outfit.sourceColor }}>Lý do: </span>
                    {outfit.reason}
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 5 }}>
                    {outfit.tags.map((tag) => (
                      <span key={tag} style={{ background: activeEventData.bg, color: activeEventData.color, borderRadius: 6, padding: "3px 8px", fontSize: "0.7rem", fontWeight: 600 }}>{tag}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Heart size={11} color="#EF4444" fill="#EF4444" />
                    <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>{outfit.favorites + (favorites.has(outfit.id) ? 1 : 0)}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/app/recommendations/${outfit.id}`); }}
                  style={{ width: "100%", marginTop: 12, padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #4F46E5, #8B5CF6)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  Xem Toàn Bộ Trang Phục
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {outfits.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px", background: "white", borderRadius: 20, border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>{activeEventData.icon}</div>
            <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Chưa có trang phục cho {activeEventData.label}</h3>
            <p style={{ color: "#64748B", fontSize: "0.9rem" }}>Thêm trang phục để tạo gợi ý cho dịp này</p>
          </div>
        )}
      </div>
    </div>
  );
}
