import { type CSSProperties } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { AIDetectionViewResult } from "../../types/ai";

type DetectionResultsPanelProps = {
  results: AIDetectionViewResult[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onAdd: (result: AIDetectionViewResult) => void;
};

export function DetectionResultsPanel({
  results,
  activeIndex,
  onSelect,
  onAdd,
}: DetectionResultsPanelProps) {
  const active = results[activeIndex];
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < results.length - 1;

  return (
    <div style={panelStyle}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "linear-gradient(135deg, #10B981, #34D399)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <CheckCircle2 size={20} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h3 style={{ fontWeight: 800, color: "#0F172A", fontSize: "1.05rem", margin: 0 }}>
              Kết Quả Nhận Diện
            </h3>
            <span style={countBadgeStyle}>{results.length} trang phục</span>
          </div>
          <p style={{ color: "#64748B", fontSize: "0.82rem", margin: "6px 0 0" }}>
            Chọn mục bên dưới hoặc bấm vào khung trên ảnh.
          </p>
        </div>
      </div>

      <div style={listContainerStyle}>
        {results.map((item, index) => (
          <DetectionListItem
            key={`${item.classKey}-${index}`}
            result={item}
            index={index}
            isActive={activeIndex === index}
            onSelect={() => onSelect(index)}
          />
        ))}
      </div>

      {active && (
        <div style={detailCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94A3B8", letterSpacing: "0.04em" }}>
              CHI TIẾT MỤC {activeIndex + 1}
            </span>
            {results.length > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  type="button"
                  onClick={() => onSelect(activeIndex - 1)}
                  disabled={!canGoPrev}
                  aria-label="Mục trước"
                  style={navButtonStyle(!canGoPrev)}
                >
                  <ChevronLeft size={14} />
                </button>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748B", minWidth: 36, textAlign: "center" }}>
                  {activeIndex + 1}/{results.length}
                </span>
                <button
                  type="button"
                  onClick={() => onSelect(activeIndex + 1)}
                  disabled={!canGoNext}
                  aria-label="Mục tiếp"
                  style={navButtonStyle(!canGoNext)}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          <p style={{ fontWeight: 800, color: "#0F172A", fontSize: "1.2rem", margin: "0 0 12px" }}>
            {active.category}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            <Tag label="Độ tin cậy" value={`${active.confidence}%`} accent="#059669" />
            <Tag
              label="Màu"
              value={active.colorLabel}
              swatch={active.color?.hex}
            />
            <Tag label="Phong cách" value={active.style} />
            <Tag
              label="Dịp"
              value={(active.occasion || []).slice(0, 2).join(" · ") || "-"}
            />
          </div>

          <button type="button" onClick={() => onAdd(active)} style={addButtonStyle}>
            <Plus size={16} />
            Thêm Vào Tủ Đồ
          </button>
        </div>
      )}
    </div>
  );
}

function DetectionListItem({
  result,
  index,
  isActive,
  onSelect,
}: {
  result: AIDetectionViewResult;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button type="button" onClick={onSelect} style={listItemStyle(isActive)}>
      <span style={indexBadgeStyle(isActive)}>{index + 1}</span>
      <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
        <p style={{ margin: 0, fontWeight: 700, color: "#0F172A", fontSize: "0.86rem" }}>
          {result.category}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: "0.74rem", color: "#94A3B8" }}>
          {result.style}
        </p>
      </div>
      {result.color?.hex && (
        <span
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: result.color.hex,
            border: "2px solid white",
            boxShadow: "0 0 0 1px #E2E8F0",
            flexShrink: 0,
          }}
        />
      )}
      <span style={confidenceStyle(result.confidence)}>{result.confidence}%</span>
    </button>
  );
}

function Tag({
  label,
  value,
  accent,
  swatch,
}: {
  label: string;
  value: string;
  accent?: string;
  swatch?: string;
}) {
  return (
    <div
      style={{
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        borderRadius: 10,
        padding: "8px 12px",
        minWidth: 0,
        flex: "1 1 120px",
      }}
    >
      <p style={{ margin: 0, fontSize: "0.68rem", color: "#94A3B8", fontWeight: 600, marginBottom: 2 }}>
        {label}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {swatch && (
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: swatch,
              border: "1px solid #CBD5E1",
              flexShrink: 0,
            }}
          />
        )}
        <p
          style={{
            margin: 0,
            fontWeight: 700,
            color: accent ?? "#0F172A",
            fontSize: "0.8rem",
            lineHeight: 1.3,
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function confidenceStyle(confidence: number): CSSProperties {
  const color = confidence >= 80 ? "#059669" : confidence >= 60 ? "#D97706" : "#64748B";
  return {
    fontSize: "0.78rem",
    fontWeight: 800,
    color,
    flexShrink: 0,
    minWidth: 44,
    textAlign: "right",
  };
}

function listItemStyle(isActive: boolean): CSSProperties {
  return {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${isActive ? "#FDBA74" : "transparent"}`,
    background: isActive ? "#FFF7ED" : "transparent",
    cursor: "pointer",
    transition: "background 0.15s, border-color 0.15s",
    boxShadow: isActive ? "inset 3px 0 0 #EA580C" : "none",
  };
}

function indexBadgeStyle(isActive: boolean): CSSProperties {
  return {
    width: 26,
    height: 26,
    borderRadius: 8,
    background: isActive ? "#EA580C" : "#E2E8F0",
    color: isActive ? "white" : "#64748B",
    fontSize: "0.72rem",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };
}

function navButtonStyle(disabled: boolean): CSSProperties {
  return {
    width: 28,
    height: 28,
    borderRadius: 8,
    border: "1px solid #E2E8F0",
    background: disabled ? "#F8FAFC" : "white",
    color: disabled ? "#CBD5E1" : "#475569",
    cursor: disabled ? "default" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}

const panelStyle: CSSProperties = {
  background: "white",
  borderRadius: 20,
  padding: 22,
  border: "1px solid #E2E8F0",
  boxShadow: "0 4px 20px rgba(15,23,42,0.06)",
  display: "flex",
  flexDirection: "column",
  gap: 16,
  alignSelf: "start",
  position: "sticky",
  top: 16,
};

const listContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  maxHeight: 220,
  overflowY: "auto",
  padding: "4px 2px",
  background: "#F8FAFC",
  borderRadius: 14,
  border: "1px solid #E2E8F0",
};

const detailCardStyle: CSSProperties = {
  borderRadius: 16,
  padding: 18,
  background: "linear-gradient(160deg, #FFFBF7 0%, #FFFFFF 55%)",
  border: "1px solid #FED7AA",
};

const countBadgeStyle: CSSProperties = {
  background: "#FFF7ED",
  color: "#C2410C",
  borderRadius: 20,
  padding: "3px 10px",
  fontSize: "0.72rem",
  fontWeight: 700,
  border: "1px solid #FED7AA",
};

const addButtonStyle: CSSProperties = {
  width: "100%",
  padding: "13px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #EA580C, #F97316)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: "0.9rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  boxShadow: "0 4px 14px rgba(234,88,12,0.3)",
};
