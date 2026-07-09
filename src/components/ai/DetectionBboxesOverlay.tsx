import type { AIDetectionViewResult } from "../../types/ai";
import type { NormalizedCrop } from "../../utils/imageCrop";

type ImageLayout = {
  offsetX: number;
  offsetY: number;
  displayWidth: number;
  displayHeight: number;
  naturalWidth: number;
  naturalHeight: number;
};

type DetectionBboxesOverlayProps = {
  layout: ImageLayout;
  results: AIDetectionViewResult[];
  /** Vùng crop đã dùng khi nhận diện — bbox từ API nằm trong hệ tọa độ ảnh crop */
  detectionCrop?: NormalizedCrop | null;
  activeIndex?: number;
  onSelect?: (index: number) => void;
};

function toFullImageBbox(
  bbox: NonNullable<AIDetectionViewResult["bbox"]>,
  crop: NormalizedCrop | null | undefined,
  naturalWidth: number,
  naturalHeight: number
) {
  const originX = (crop?.x ?? 0) * naturalWidth;
  const originY = (crop?.y ?? 0) * naturalHeight;

  return {
    x1: originX + bbox.x1,
    y1: originY + bbox.y1,
    x2: originX + bbox.x2,
    y2: originY + bbox.y2,
  };
}

export function DetectionBboxesOverlay({
  layout,
  results,
  detectionCrop,
  activeIndex,
  onSelect,
}: DetectionBboxesOverlayProps) {
  const scaleX = layout.displayWidth / layout.naturalWidth;
  const scaleY = layout.displayHeight / layout.naturalHeight;

  return (
    <div
      style={{
        position: "absolute",
        left: layout.offsetX,
        top: layout.offsetY,
        width: layout.displayWidth,
        height: layout.displayHeight,
        pointerEvents: "none",
      }}
    >
      {results.map((item, index) => {
        if (!item.bbox) return null;

        const fullBbox = toFullImageBbox(
          item.bbox,
          detectionCrop,
          layout.naturalWidth,
          layout.naturalHeight
        );

        const left = fullBbox.x1 * scaleX;
        const top = fullBbox.y1 * scaleY;
        const width = (fullBbox.x2 - fullBbox.x1) * scaleX;
        const height = (fullBbox.y2 - fullBbox.y1) * scaleY;
        const isActive = activeIndex === index;
        const color = isActive ? "#EA580C" : "#22C55E";
        const showLabel = isActive || results.length <= 3;

        return (
          <button
            key={`${item.classKey}-${index}`}
            type="button"
            onClick={() => onSelect?.(index)}
            style={{
              position: "absolute",
              left,
              top,
              width,
              height,
              border: `${isActive ? 2.5 : 1.5}px solid ${color}`,
              borderRadius: 8,
              background: isActive ? "rgba(234,88,12,0.14)" : "rgba(34,197,94,0.06)",
              boxShadow: isActive ? "0 0 0 3px rgba(234,88,12,0.2)" : "none",
              pointerEvents: onSelect ? "auto" : "none",
              cursor: onSelect ? "pointer" : "default",
              padding: 0,
              opacity: isActive ? 1 : 0.75,
            }}
          >
            {showLabel && (
              <span
                style={{
                  position: "absolute",
                  top: -26,
                  left: 0,
                  background: color,
                  color: "white",
                  borderRadius: "6px 6px 6px 0",
                  padding: "3px 10px",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  maxWidth: 220,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  zIndex: 2,
                }}
              >
                {item.category} — {item.confidence}%
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
