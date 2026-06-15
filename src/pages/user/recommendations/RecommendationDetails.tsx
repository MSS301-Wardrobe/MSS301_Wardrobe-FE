import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Star, Heart, Share2, ChevronRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const outfit = {
  id: "1",
  title: "Phong Cách Chuyên Nghiệp",
  occasion: "Công Sở",
  score: 96,
  description: "Bộ trang phục tối giản, uy quyền toát lên sự tự tin và chuyên nghiệp. Được chọn lọc kỹ lưỡng để tạo ấn tượng mạnh trong mọi môi trường chuyên nghiệp — từ cuộc họp với khách hàng đến thuyết trình trong phòng hội đồng.",
  styleExplanation: "Chìa khóa của bộ trang phục này là sự cân bằng giữa cấu trúc và linh hoạt. Áo sơ mi trắng tạo nền tảng gọn gàng, trong khi áo blazer tối màu mang lại vẻ uy quyền. Quần âu slim-fit giữ dáng vẻ sắc sảo mà không quá trang trọng. Phụ kiện da hoàn thiện bảng màu tinh tế.",
  img: "https://images.unsplash.com/photo-1700557477506-369b241cbe54?w=600&h=700&fit=crop",
  items: [
    { id: "1", name: "Áo Sơ Mi Oxford Trắng", category: "Áo", color: "Trắng", img: "https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=150&h=150&fit=crop", role: "Lớp Cơ Bản" },
    { id: "10", name: "Áo Blazer Đen", category: "Áo Khoác", color: "Đen", img: "https://images.unsplash.com/photo-1731589802956-b4693dae884b?w=150&h=150&fit=crop", role: "Điểm Nhấn" },
    { id: "2", name: "Quần Slim Jeans Tối", category: "Quần", color: "Xanh Navy", img: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=150&h=150&fit=crop", role: "Nền Tảng" },
    { id: "7", name: "Thắt Lưng Da", category: "Phụ Kiện", color: "Nâu", img: "https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=150&h=150&fit=crop", role: "Điểm Phụ" },
  ],
  tags: ["Tối Giản", "Công Sở", "Chuyên Nghiệp", "Phong Cách Uy Quyền"],
  colorPalette: ["#000000", "#FFFFFF", "#1E3A5F", "#92400E"],
  compatibilityBreakdown: [
    { aspect: "Hài Hòa Màu Sắc", score: 98 },
    { aspect: "Phù Hợp Phong Cách", score: 95 },
    { aspect: "Phù Hợp Dịp", score: 97 },
    { aspect: "Mức Độ Thoải Mái", score: 92 },
    { aspect: "Điểm Xu Hướng", score: 94 },
  ],
};

const alternatives = [
  { id: "4", title: "Thứ Sáu Lịch Sự", score: 88, img: "https://images.unsplash.com/photo-1731589802956-b4693dae884b?w=200&h=240&fit=crop" },
  { id: "2", title: "Phong Cách Cuối Tuần", score: 91, img: "https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?w=200&h=240&fit=crop" },
  { id: "6", title: "Phong Cách Du Lịch", score: 89, img: "https://images.unsplash.com/photo-1634921276069-c24ba5d6b35c?w=200&h=240&fit=crop" },
];

export function RecommendationDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [saved, setSaved] = useState(false);

  return (
    <div style={{ maxWidth: 1000 }}>
      <button
        onClick={() => navigate("/app/recommendations")}
        style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", background: "none", border: "none", cursor: "pointer", marginBottom: 20, fontSize: "0.875rem" }}
      >
        <ArrowLeft size={16} />
        Quay Lại Gợi Ý
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 24 }}>
        {/* Image Panel */}
        <div>
          <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid #E2E8F0", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", position: "relative" }}>
            <img src={outfit.img} alt={outfit.title} style={{ width: "100%", height: 480, objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.5), transparent)" }} />

            {/* Score */}
            <div style={{ position: "absolute", top: 16, left: 16, display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.95)", borderRadius: 20, padding: "6px 14px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
              <Star size={14} fill="#F59E0B" color="#F59E0B" />
              <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0F172A" }}>{outfit.score}% Phù Hợp</span>
            </div>

            {/* Occasion */}
            <div style={{ position: "absolute", bottom: 16, left: 16 }}>
              <span style={{ background: "#EA580C", color: "white", borderRadius: 8, padding: "5px 14px", fontSize: "0.78rem", fontWeight: 700 }}>{outfit.occasion}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              onClick={() => { setSaved(!saved); toast.success(saved ? "Đã xóa khỏi yêu thích" : "Đã lưu vào yêu thích!"); }}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px", borderRadius: 12, border: `1.5px solid ${saved ? "#FEE2E2" : "#E2E8F0"}`, background: saved ? "#FEF2F2" : "white", cursor: "pointer", color: saved ? "#EF4444" : "#64748B", fontWeight: 600, fontSize: "0.85rem" }}
            >
              <Heart size={15} fill={saved ? "#EF4444" : "none"} />
              {saved ? "Đã Lưu" : "Lưu Trang Phục"}
            </button>
            <button onClick={() => toast.success("Đã sao chép link!")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "white", cursor: "pointer", color: "#64748B", fontWeight: 600, fontSize: "0.85rem" }}>
              <Share2 size={15} />
              Chia Sẻ
            </button>
          </div>

          {/* Color Palette */}
          <div style={{ background: "white", borderRadius: 16, padding: 18, border: "1px solid #E2E8F0", marginTop: 12 }}>
            <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>Bảng Màu</p>
            <div style={{ display: "flex", gap: 10 }}>
              {outfit.colorPalette.map((c) => (
                <div key={c} style={{ width: 36, height: 36, borderRadius: 10, background: c, border: "1.5px solid #E2E8F0", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }} />
              ))}
            </div>
          </div>
        </div>

        {/* Details Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Title */}
          <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>{outfit.title}</h2>
            <p style={{ color: "#64748B", lineHeight: 1.7, fontSize: "0.9rem", marginBottom: 16 }}>{outfit.description}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {outfit.tags.map((tag) => (
                <span key={tag} style={{ background: "#FFEDD5", color: "#EA580C", borderRadius: 20, padding: "4px 12px", fontSize: "0.78rem", fontWeight: 600 }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Compatibility Breakdown */}
          <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Sparkles size={16} color="#F97316" />
              <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem" }}>Phân Tích Điểm Tương Thích</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {outfit.compatibilityBreakdown.map((item) => (
                <div key={item.aspect}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: "0.82rem", color: "#374151", fontWeight: 500 }}>{item.aspect}</span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#EA580C" }}>{item.score}%</span>
                  </div>
                  <div style={{ background: "#F1F5F9", borderRadius: 100, height: 7 }}>
                    <div style={{ width: `${item.score}%`, background: "linear-gradient(90deg, #EA580C, #F97316)", borderRadius: 100, height: "100%", transition: "width 0.6s" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outfit Items */}
          <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 16, fontSize: "0.95rem" }}>Thành Phần Trang Phục ({outfit.items.length} vật phẩm)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {outfit.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/app/wardrobe/${item.id}`)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, background: "#F8FAFC", border: "1px solid #E2E8F0", cursor: "pointer" }}
                >
                  <img src={item.img} alt={item.name} style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover" }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, color: "#0F172A", fontSize: "0.88rem" }}>{item.name}</p>
                    <p style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 2 }}>{item.category} · {item.color}</p>
                  </div>
                  <span style={{ background: "#FFEDD5", color: "#EA580C", borderRadius: 6, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 600 }}>{item.role}</span>
                  <ChevronRight size={14} color="#94A3B8" />
                </div>
              ))}
            </div>
          </div>

          {/* Style Explanation */}
          <div style={{ background: "linear-gradient(135deg, #FFEDD5, #F5F3FF)", borderRadius: 20, padding: 24, border: "1px solid #FED7AA" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "#EA580C", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={15} color="white" />
              </div>
              <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem" }}>Giải Thích Phong Cách</h3>
            </div>
            <p style={{ color: "#374151", lineHeight: 1.75, fontSize: "0.88rem" }}>{outfit.styleExplanation}</p>
          </div>

          {/* Friend Group Influence */}
          <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "#F97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "0.85rem" }}>👥</span>
              </div>
              <div>
                <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem" }}>Ảnh Hưởng Nhóm Bạn</h3>
                <p style={{ fontSize: "0.72rem", color: "#64748B" }}>Cách nhóm bạn ảnh hưởng đến gợi ý này</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { group: "Đội Tiên Phong Thời Trang", emoji: "👗", influence: 42, members: 8, style: "Thanh Lịch & Tối Giản" },
                { group: "Câu Lạc Bộ Đường Phố", emoji: "🧢", influence: 31, members: 12, style: "Đường Phố & Thường Ngày" },
                { group: "Mạng Lưới Phong Cách Văn Phòng", emoji: "💼", influence: 27, members: 15, style: "Chuyên Nghiệp & Gọn Gàng" },
              ].map((g) => (
                <div key={g.group} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 12, background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>{g.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, color: "#0F172A", fontSize: "0.85rem", marginBottom: 4 }}>{g.group}</p>
                    <p style={{ fontSize: "0.72rem", color: "#64748B" }}>{g.members} thành viên · {g.style}</p>
                    <div style={{ marginTop: 6, background: "#E2E8F0", borderRadius: 100, height: 4, overflow: "hidden" }}>
                      <div style={{ width: `${g.influence}%`, background: "linear-gradient(90deg, #F97316, #EA580C)", borderRadius: 100, height: "100%" }} />
                    </div>
                  </div>
                  <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#F97316", flexShrink: 0 }}>{g.influence}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendation Insights */}
          <div style={{ background: "linear-gradient(135deg, #0F172A, #1E293B)", borderRadius: 20, padding: 24, color: "white" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Sparkles size={16} color="#F59E0B" />
              <h3 style={{ fontWeight: 700, fontSize: "0.95rem" }}>Phân Tích AI</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Độ Tin Cậy Mô Hình", value: "96.2%", icon: "🎯" },
                { label: "Điểm Dữ Liệu", value: "1,247", icon: "📊" },
                { label: "Người Dùng Tương Tự", value: "342", icon: "👤" },
                { label: "Tương Thích Tủ Đồ", value: "Cao", icon: "✅" },
              ].map((insight) => (
                <div key={insight.label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p style={{ fontSize: "1rem", marginBottom: 4 }}>{insight.icon}</p>
                  <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "white", marginBottom: 2 }}>{insight.value}</p>
                  <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.55)" }}>{insight.label}</p>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 14, border: "1px solid rgba(255,255,255,0.08)" }}>
              <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
                Bộ trang phục này được tạo ra bằng cách lọc cộng tác từ 342 người dùng có hồ sơ phong cách tương tự, kết hợp với lịch sử sở thích cá nhân và xu hướng phổ biến trong các nhóm bạn của bạn. AI đã đối chiếu 1.247 điểm dữ liệu tủ đồ để đạt điểm tương thích 96,2%.
              </p>
            </div>
          </div>

          {/* Similar Alternatives */}
          <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 16, fontSize: "0.95rem" }}>Lựa Chọn Tương Tự</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {alternatives.map((alt) => (
                <div
                  key={alt.id}
                  onClick={() => navigate(`/app/recommendations/${alt.id}`)}
                  style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #E2E8F0", cursor: "pointer" }}
                >
                  <img src={alt.img} alt={alt.title} style={{ width: "100%", height: 100, objectFit: "cover" }} />
                  <div style={{ padding: "8px 10px" }}>
                    <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#0F172A", marginBottom: 3 }}>{alt.title}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Star size={10} fill="#F59E0B" color="#F59E0B" />
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748B" }}>{alt.score}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
