import { useNavigate } from "react-router";
import { Zap, Sparkles, TrendingUp, CheckCircle2, Star, Shirt, Cpu, Camera } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Tải Lên Thông Minh",
    desc: "Kéo và thả ảnh trang phục. Hệ thống tự động xử lý và tổ chức chúng vào tủ đồ kỹ thuật số của bạn.",
    color: "#EA580C",
    bg: "#FFEDD5",
  },
  {
    icon: Cpu,
    title: "Nhận Diện AI",
    desc: "Thị giác máy tính tiên tiến nhận diện danh mục, màu sắc, họa tiết và phong cách với độ chính xác trên 95%.",
    color: "#F97316",
    bg: "#F5F3FF",
  },
  {
    icon: Sparkles,
    title: "Gợi Ý Trang Phục",
    desc: "Nhận gợi ý bộ trang phục cá nhân hóa dựa trên tủ đồ, dịp mặc và sở thích thời trang của bạn.",
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
  {
    icon: TrendingUp,
    title: "Phân Tích Phong Cách",
    desc: "Theo dõi thống kê tủ đồ, những vật phẩm mặc nhiều nhất và khám phá khoảng trống trong bộ sưu tập.",
    color: "#10B981",
    bg: "#ECFDF5",
  },
];

const benefits = [
  "Không bao giờ quên những gì có trong tủ đồ",
  "Tiết kiệm thời gian chọn trang phục mỗi sáng",
  "Giảm mua sắm bốc đồng với thống kê tủ đồ",
  "Nhận gợi ý phong cách được cá nhân hóa",
  "Chia sẻ trang phục và nhận phản hồi từ cộng đồng",
  "Theo dõi chi phí mỗi lần mặc của trang phục",
];

const stats = [
  { value: "50K+", label: "Người Dùng" },
  { value: "2M+", label: "Vật Phẩm Nhận Diện" },
  { value: "98%", label: "Độ Chính Xác AI" },
  { value: "4.9★", label: "Đánh Giá" },
];

const testimonials = [
  {
    name: "Nguyễn Thị Lan",
    role: "Nhà Thiết Kế Thời Trang",
    avatar: "NL",
    text: "StyleAI đã thay đổi hoàn toàn cách tôi quản lý tủ đồ. Khả năng nhận diện AI cực kỳ chính xác!",
    color: "#EA580C",
  },
  {
    name: "Trần Văn Minh",
    role: "Giám Đốc Marketing",
    avatar: "TM",
    text: "Tôi tiết kiệm 20 phút mỗi sáng khi chọn trang phục. Gợi ý cho trang phục công sở rất phù hợp.",
    color: "#F97316",
  },
  {
    name: "Phạm Thu Hà",
    role: "Sinh Viên Đại Học",
    avatar: "PH",
    text: "Rất thích cách nó giúp tôi phối đồ. Tôi đã khám phá ra bao nhiêu bộ trang phục mà tôi chưa từng nghĩ đến!",
    color: "#10B981",
  },
];

export function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Nav */}
      <nav style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E2E8F0", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #EA580C, #F97316)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={18} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0F172A" }}>StyleAI</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => navigate("/login")}
              style={{ padding: "8px 20px", borderRadius: 10, border: "1px solid #E2E8F0", background: "white", color: "#0F172A", fontWeight: 500, cursor: "pointer", fontSize: "0.9rem" }}
            >
              Đăng Nhập
            </button>
            <button
              onClick={() => navigate("/register")}
              style={{ padding: "8px 20px", borderRadius: 10, background: "linear-gradient(135deg, #EA580C, #F97316)", color: "white", fontWeight: 600, cursor: "pointer", border: "none", fontSize: "0.9rem" }}
            >
              Đăng Ký
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#FFEDD5", border: "1px solid #FED7AA", borderRadius: 100, padding: "6px 14px", marginBottom: 24 }}>
            <Sparkles size={14} color="#EA580C" />
            <span style={{ fontSize: "0.8rem", color: "#EA580C", fontWeight: 600 }}>Trí Tuệ Thời Trang AI</span>
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 800, color: "#0F172A", lineHeight: 1.1, marginBottom: 24 }}>
            Tủ Đồ Của Bạn,{" "}
            <span style={{ background: "linear-gradient(135deg, #EA580C, #F97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Được Tổ Chức Thông Minh
            </span>
          </h1>
          <p style={{ fontSize: "1.15rem", color: "#64748B", maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Tải lên trang phục, để AI tự động phân loại mọi thứ và nhận gợi ý trang phục cá nhân hóa phù hợp với phong cách và dịp của bạn.
          </p>
        </div>

        {/* Hero image */}
        <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", boxShadow: "0 25px 80px rgba(234,88,12,0.15)", border: "1px solid #E2E8F0" }}>
          <img
            src="https://images.unsplash.com/photo-1672137233327-37b0c1049e77?w=1200&h=500&fit=crop&crop=center"
            alt="Tủ đồ sang trọng"
            style={{ width: "100%", height: 420, objectFit: "cover" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(234,88,12,0.4), transparent)" }} />

          <div style={{ position: "absolute", top: 24, left: 24, background: "white", borderRadius: 16, padding: "12px 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FFEDD5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Cpu size={18} color="#EA580C" />
            </div>
            <div>
              <p style={{ fontSize: "0.7rem", color: "#64748B" }}>Nhận Diện AI</p>
              <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0F172A" }}>98.5% Chính Xác</p>
            </div>
          </div>

          <div style={{ position: "absolute", bottom: 24, right: 24, background: "white", borderRadius: 16, padding: "12px 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shirt size={18} color="#10B981" />
            </div>
            <div>
              <p style={{ fontSize: "0.7rem", color: "#64748B" }}>Trang Phục Đã Tổ Chức</p>
              <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0F172A" }}>247 Vật Phẩm</p>
            </div>
          </div>

          <div style={{ position: "absolute", top: "50%", right: 24, transform: "translateY(-50%)", background: "white", borderRadius: 16, padding: "12px 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={18} color="#F59E0B" />
            </div>
            <div>
              <p style={{ fontSize: "0.7rem", color: "#64748B" }}>Gợi Ý Hôm Nay</p>
              <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0F172A" }}>3 Bộ Sẵn Sàng</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: "linear-gradient(135deg, #EA580C, #F97316)", padding: "48px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, textAlign: "center" }}>
          {stats.map((s) => (
            <div key={s.label}>
              <p style={{ fontSize: "2.5rem", fontWeight: 800, color: "white" }}>{s.value}</p>
              <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.75)", marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: "0.85rem", color: "#EA580C", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 12 }}>Tính Năng</p>
          <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#0F172A", marginBottom: 16 }}>Tất Cả Những Gì Bạn Cần</h2>
          <p style={{ color: "#64748B", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
            Nền tảng quản lý tủ đồ toàn diện được hỗ trợ bởi công nghệ AI tiên tiến
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          {features.map((f) => (
            <div key={f.title} style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <f.icon size={22} color={f.color} />
              </div>
              <h3 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 10, fontSize: "1.05rem" }}>{f.title}</h3>
              <p style={{ color: "#64748B", lineHeight: 1.7, fontSize: "0.9rem" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section style={{ background: "white", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <p style={{ fontSize: "0.85rem", color: "#EA580C", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 12 }}>Lợi Ích</p>
            <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#0F172A", marginBottom: 20, lineHeight: 1.2 }}>
              Vì Sao Hàng Nghìn Người Yêu StyleAI
            </h2>
            <p style={{ color: "#64748B", marginBottom: 32, lineHeight: 1.7 }}>
              Từ sinh viên đến chuyên gia thời trang, StyleAI thích nghi với lối sống của bạn và giúp bạn luôn đẹp nhất mỗi ngày.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {benefits.map((b) => (
                <div key={b} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0 }} />
                  <span style={{ color: "#374151", fontSize: "0.95rem" }}>{b}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/register")}
              style={{ marginTop: 36, padding: "14px 28px", borderRadius: 12, background: "linear-gradient(135deg, #EA580C, #F97316)", color: "white", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", border: "none" }}
            >
              Bắt Đầu Miễn Phí Ngay
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(234,88,12,0.15)" }}>
              <img
                src="https://images.unsplash.com/photo-1649361811423-a55616f7ab11?w=600&h=500&fit=crop"
                alt="Tủ đồ được tổ chức"
                style={{ width: "100%", height: 400, objectFit: "cover" }}
              />
            </div>
            <div style={{ position: "absolute", bottom: -20, left: -20, background: "white", borderRadius: 16, padding: "16px 20px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />)}
              </div>
              <p style={{ fontSize: "0.8rem", fontWeight: 600, marginTop: 4, color: "#0F172A" }}>Được 50.000+ người dùng yêu thích</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#0F172A", marginBottom: 12 }}>Người Dùng Nói Gì</h2>
          <p style={{ color: "#64748B" }}>Tham gia cùng hàng nghìn người yêu thích tủ đồ thông minh</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {testimonials.map((t) => (
            <div key={t.name} style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />)}
              </div>
              <p style={{ color: "#374151", lineHeight: 1.7, marginBottom: 20, fontSize: "0.9rem" }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.85rem" }}>
                  {t.avatar}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#0F172A" }}>{t.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "#64748B" }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 24px", background: "linear-gradient(135deg, #EA580C 0%, #F97316 50%, #FB923C 100%)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "white", marginBottom: 20, lineHeight: 1.2 }}>
            Sẵn Sàng Thay Đổi Tủ Đồ Của Bạn?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.85)", marginBottom: 40, fontSize: "1.05rem", lineHeight: 1.7 }}>
            Tham gia cùng hơn 50.000 người dùng đã cách mạng hóa cách họ quản lý trang phục và các bộ đồ.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/register")}
              style={{ padding: "16px 36px", borderRadius: 14, background: "white", color: "#EA580C", fontWeight: 800, fontSize: "1rem", cursor: "pointer", border: "none" }}
            >
              Tạo Tài Khoản Miễn Phí
            </button>
            <button
              onClick={() => navigate("/login")}
              style={{ padding: "16px 36px", borderRadius: 14, background: "rgba(255,255,255,0.15)", color: "white", fontWeight: 600, fontSize: "1rem", cursor: "pointer", border: "1px solid rgba(255,255,255,0.3)" }}
            >
              Đăng Nhập
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#0F172A", padding: "48px 24px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #EA580C, #F97316)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Zap size={16} color="white" />
                </div>
                <span style={{ fontWeight: 800, fontSize: "1rem", color: "white" }}>StyleAI</span>
              </div>
              <p style={{ color: "#94A3B8", fontSize: "0.85rem", maxWidth: 240, lineHeight: 1.7 }}>
                Quản lý tủ đồ thông minh bằng AI cho tín đồ thời trang hiện đại.
              </p>
            </div>
            <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
              {[
                { title: "Sản Phẩm", links: ["Tính Năng", "Bảng Giá", "Cập Nhật", "Lộ Trình"] },
                { title: "Công Ty", links: ["Về Chúng Tôi", "Blog", "Tuyển Dụng", "Báo Chí"] },
                { title: "Hỗ Trợ", links: ["Trung Tâm Hỗ Trợ", "Cộng Đồng", "Quyền Riêng Tư", "Điều Khoản"] },
              ].map((col) => (
                <div key={col.title}>
                  <p style={{ fontWeight: 600, color: "white", fontSize: "0.85rem", marginBottom: 14 }}>{col.title}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {col.links.map((link) => (
                      <a key={link} href="#" style={{ color: "#94A3B8", fontSize: "0.8rem", textDecoration: "none" }}>{link}</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid #334155", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ color: "#64748B", fontSize: "0.8rem" }}>© 2026 StyleAI. Đã đăng ký bản quyền.</p>
            <p style={{ color: "#64748B", fontSize: "0.8rem" }}>Tạo ra với ❤️ cho những người yêu thời trang</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
