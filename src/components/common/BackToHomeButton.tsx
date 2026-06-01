import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

// Always navigates to the home route (never browser history back).
export function BackToHomeButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/")}
      className="group"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 16px",
        borderRadius: 10,
        border: "1px solid #E2E8F0",
        background: "white",
        color: "#0F172A",
        fontWeight: 600,
        fontSize: "0.85rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = "#C7D2FE";
        el.style.background = "#EEF2FF";
        el.style.color = "#4F46E5";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = "#E2E8F0";
        el.style.background = "white";
        el.style.color = "#0F172A";
      }}
    >
      <ArrowLeft size={16} />
      <span>Quay Lại Trang Chủ</span>
    </button>
  );
}

export default BackToHomeButton;
