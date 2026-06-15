import type { ReactNode } from "react";
import { Zap, Cpu, Shirt, Calendar, Sparkles, ShieldCheck } from "lucide-react";
import { BackToHomeButton } from "../common/BackToHomeButton";

const features = [
  { icon: Cpu, title: "Nhận Diện Trang Phục AI", desc: "Tự động phân loại quần áo từ ảnh." },
  { icon: Shirt, title: "Tổ Chức Tủ Đồ Thông Minh", desc: "Sắp xếp tủ đồ gọn gàng, khoa học." },
  { icon: Calendar, title: "Gợi Ý Theo Sự Kiện", desc: "Đề xuất bộ đồ cho mọi dịp." },
];

const outfits = [
  { src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=480&h=600&fit=crop&q=80", title: "Smart Casual", tag: "Năng động", score: "92%" },
  { src: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=480&h=600&fit=crop&q=80", title: "Office Look", tag: "Công sở", score: "88%" },
  { src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=480&h=600&fit=crop&q=80", title: "Weekend Style", tag: "Cuối tuần", score: "85%" },
];

const authStyles = `
@keyframes authFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
.outfit-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.outfit-card{border-radius:18px;overflow:hidden;background:rgba(255,255,255,0.14);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.2);position:relative;transition:transform .25s ease,box-shadow .25s ease}
.outfit-card:hover{transform:translateY(-4px);box-shadow:0 14px 30px rgba(15,23,42,0.25)}
.outfit-card-img{width:100%;height:180px;object-fit:cover;object-position:center top;display:block}
.ai-thumb{width:88px;height:88px;object-fit:cover;border-radius:16px;display:block;flex-shrink:0}
@media (max-width:1024px){.outfit-card-img{height:150px}}
`;

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.12)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.2)",
  boxShadow: "0 8px 32px rgba(15,23,42,0.18)",
};

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ height: "100vh", overflow: "hidden", display: "flex", fontFamily: "Inter, system-ui, sans-serif", background: "#F8FAFC" }}>
      <style>{authStyles}</style>

      {/* ===== LEFT — premium visual (hidden on mobile) ===== */}
      <div
        className="hidden md:flex md:w-[60%] lg:w-1/2"
        style={{
          position: "relative",
          overflowY: "auto",
          overflowX: "hidden",
          background: "linear-gradient(135deg, #EA580C 0%, #F97316 50%, #FB923C 100%)",
          flexDirection: "column",
          justifyContent: "flex-start",
          gap: 22,
          padding: "40px 52px",
          color: "white",
        }}
      >
        {/* Decorative glows */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: -120, right: -100, width: 360, height: 360, borderRadius: "50%", background: "rgba(255,255,255,0.12)", filter: "blur(20px)" }} />
          <div style={{ position: "absolute", bottom: -140, left: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(251,146,60,0.35)", filter: "blur(30px)" }} />
        </div>

        {/* Hero */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 100, padding: "6px 14px", marginBottom: 20 }}>
            <Sparkles size={14} color="white" />
            <span style={{ fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.01em" }}>Công Nghệ Thời Trang AI</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.9rem, 2.6vw, 2.6rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: 14, maxWidth: 460 }}>
            Trợ Lý Tủ Đồ AI Thông Minh Của Bạn
          </h1>
          <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "0.98rem", lineHeight: 1.65, maxWidth: 440 }}>
            Tải ảnh quần áo lên, sắp xếp tủ đồ và nhận gợi ý trang phục cá nhân hóa được hỗ trợ bởi AI.
          </p>
        </div>

        {/* Preview composition */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 14, flexShrink: 0 }}>
          {/* AI detection preview */}
          <div style={{ ...glass, borderRadius: 18, padding: 16, animation: "authFloat 6s ease-in-out infinite" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <img
                className="ai-thumb"
                src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=240&h=240&fit=crop&q=80"
                alt="Áo thun trắng"
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <Cpu size={13} color="white" />
                  <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.75)" }}>Đang nhận diện AI</span>
                </div>
                <p style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 8 }}>Áo Thun Trắng</p>
                <div style={{ height: 5, borderRadius: 100, background: "rgba(255,255,255,0.22)" }}>
                  <div style={{ width: "98%", height: "100%", borderRadius: 100, background: "white" }} />
                </div>
              </div>
              <span style={{ fontSize: "0.82rem", fontWeight: 800, alignSelf: "flex-start" }}>98%</span>
            </div>
          </div>

          {/* Recommendation preview */}
          <div style={{ ...glass, borderRadius: 18, padding: 16, animation: "authFloat 6s ease-in-out infinite", animationDelay: "1.2s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <Sparkles size={13} color="white" />
              <span style={{ fontSize: "0.78rem", fontWeight: 700 }}>Gợi ý hôm nay</span>
            </div>
            <div className="outfit-grid">
              {outfits.map((o) => (
                <div key={o.title} className="outfit-card">
                  <div style={{ position: "relative" }}>
                    <img className="outfit-card-img" src={o.src} alt={o.title} />
                    <span style={{ position: "absolute", top: 8, right: 8, display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.6rem", fontWeight: 700, color: "white", background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", borderRadius: 100, padding: "3px 8px" }}>
                      {o.score} hợp
                    </span>
                  </div>
                  <div style={{ padding: "10px 12px 12px" }}>
                    <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "white", lineHeight: 1.2, marginBottom: 6 }}>{o.title}</p>
                    <span style={{ display: "inline-block", fontSize: "0.64rem", fontWeight: 600, color: "white", background: "rgba(255,255,255,0.2)", borderRadius: 100, padding: "3px 9px" }}>{o.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, flexShrink: 0 }}>
          {features.map((f) => (
            <div key={f.title} style={{ ...glass, borderRadius: 14, padding: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <f.icon size={17} color="white" />
              </div>
              <p style={{ fontSize: "0.82rem", fontWeight: 700, lineHeight: 1.3, marginBottom: 4 }}>{f.title}</p>
              <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.72)", lineHeight: 1.4 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== RIGHT — auth form ===== */}
      <div className="w-full md:w-[40%] lg:w-1/2" style={{ display: "flex", flexDirection: "column", background: "#F8FAFC" }}>
        {/* Top navigation */}
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, #EA580C, #F97316)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={17} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "#0F172A" }}>StyleAI</span>
          </div>
          <BackToHomeButton />
        </nav>

        {/* Centered card */}
        <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 28px 24px", overflowY: "auto" }}>
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              background: "white",
              borderRadius: 24,
              boxShadow: "0 24px 64px rgba(15,23,42,0.08)",
              border: "1px solid #EEF0F4",
              padding: "30px 36px 26px",
            }}
          >
            {children}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16, color: "#94A3B8", fontSize: "0.72rem" }}>
              <ShieldCheck size={13} />
              <span>Bảo mật & mã hóa dữ liệu của bạn</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
