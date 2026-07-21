import { Palette } from "lucide-react";

export function hasFavoriteColors(colors?: string[] | null): boolean {
  return (colors?.length ?? 0) > 0;
}

export function getGroupBannerBackground(colorPalette?: string[] | null): string {
  if (colorPalette && colorPalette.length >= 2) {
    return `linear-gradient(135deg, ${colorPalette[0]}, ${colorPalette[1]})`;
  }
  if (colorPalette && colorPalette.length === 1) {
    return `linear-gradient(135deg, ${colorPalette[0]}, #64748B)`;
  }
  return "linear-gradient(135deg, #E2E8F0, #CBD5E1)";
}

type GroupColorPaletteProps = {
  colorPalette?: string[] | null;
  userHasFavoriteColors?: boolean;
  /** true = nhóm của tôi / chi tiết; false = khám phá */
  isMemberContext?: boolean;
  onConfigureColors?: () => void;
  dotSize?: number;
  compact?: boolean;
};

export function GroupColorPalette({
  colorPalette,
  userHasFavoriteColors = false,
  isMemberContext = true,
  onConfigureColors,
  dotSize = 18,
  compact = false,
}: GroupColorPaletteProps) {
  const colors = colorPalette ?? [];

  if (colors.length > 0) {
    return (
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
        {colors.map((c) => (
          <div
            key={c}
            title={c}
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: "50%",
              background: c,
              border: "1.5px solid #E2E8F0",
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    );
  }

  const message = !userHasFavoriteColors && isMemberContext
    ? "Bạn chưa chọn màu yêu thích. Cập nhật sở thích để hiển thị bảng màu nhóm."
    : "Nhóm chưa có bảng màu. Thành viên cần cấu hình màu yêu thích trong Sở thích phong cách.";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: compact ? "row" : "column",
        alignItems: compact ? "center" : "flex-start",
        gap: compact ? 8 : 10,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flex: 1, minWidth: 0 }}>
        <Palette size={compact ? 14 : 16} color="#94A3B8" style={{ flexShrink: 0, marginTop: 2 }} />
        <p
          style={{
            margin: 0,
            fontSize: compact ? "0.68rem" : "0.78rem",
            color: "#64748B",
            lineHeight: 1.45,
          }}
        >
          {message}
        </p>
      </div>
      {!userHasFavoriteColors && isMemberContext && onConfigureColors && (
        <button
          type="button"
          onClick={onConfigureColors}
          style={{
            padding: compact ? "4px 10px" : "6px 12px",
            borderRadius: 8,
            border: "1px solid #FDBA74",
            background: "#FFF7ED",
            color: "#C2410C",
            fontSize: compact ? "0.68rem" : "0.75rem",
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Cấu hình màu
        </button>
      )}
    </div>
  );
}
