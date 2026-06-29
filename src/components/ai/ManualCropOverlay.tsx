import { useCallback, useEffect, useRef, useState } from "react";
import type { NormalizedCrop } from "../../utils/imageCrop";

type ImageLayout = {
  offsetX: number;
  offsetY: number;
  displayWidth: number;
  displayHeight: number;
};

type DragMode = "move" | "resize" | null;

const MIN_CROP_SIZE = 0.12;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type ManualCropOverlayProps = {
  layout: ImageLayout;
  crop: NormalizedCrop;
  onChange: (crop: NormalizedCrop) => void;
  editable: boolean;
  label?: string;
  confirmed?: boolean;
};

export function ManualCropOverlay({
  layout,
  crop,
  onChange,
  editable,
  label,
  confirmed = false,
}: ManualCropOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    mode: DragMode;
    startX: number;
    startY: number;
    startCrop: NormalizedCrop;
  } | null>(null);

  const [dragging, setDragging] = useState(false);

  const toNormalized = useCallback(
    (clientX: number, clientY: number) => {
      const overlay = overlayRef.current;
      if (!overlay) {
        return { x: 0, y: 0 };
      }

      const rect = overlay.getBoundingClientRect();
      return {
        x: clamp((clientX - rect.left) / layout.displayWidth, 0, 1),
        y: clamp((clientY - rect.top) / layout.displayHeight, 0, 1),
      };
    },
    [layout.displayWidth, layout.displayHeight]
  );

  const endDrag = useCallback(() => {
    dragRef.current = null;
    setDragging(false);
  }, []);

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || !editable) {
        return;
      }

      const point = toNormalized(event.clientX, event.clientY);
      const start = toNormalized(drag.startX, drag.startY);
      const deltaX = point.x - start.x;
      const deltaY = point.y - start.y;
      const base = drag.startCrop;

      if (drag.mode === "move") {
        onChange({
          ...base,
          x: clamp(base.x + deltaX, 0, 1 - base.width),
          y: clamp(base.y + deltaY, 0, 1 - base.height),
        });
        return;
      }

      const nextWidth = clamp(base.width + deltaX, MIN_CROP_SIZE, 1 - base.x);
      const nextHeight = clamp(base.height + deltaY, MIN_CROP_SIZE, 1 - base.y);

      onChange({
        ...base,
        width: nextWidth,
        height: nextHeight,
      });
    },
    [editable, onChange, toNormalized]
  );

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, [endDrag, onPointerMove]);

  const startDrag = (
    event: React.PointerEvent,
    mode: DragMode
  ) => {
    if (!editable) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    dragRef.current = {
      mode,
      startX: event.clientX,
      startY: event.clientY,
      startCrop: crop,
    };
    setDragging(true);
  };

  const borderColor = confirmed ? "#10B981" : "#EA580C";
  const labelBg = confirmed ? "#10B981" : "#EA580C";

  return (
    <div
      ref={overlayRef}
      style={{
        position: "absolute",
        left: layout.offsetX,
        top: layout.offsetY,
        width: layout.displayWidth,
        height: layout.displayHeight,
        pointerEvents: editable ? "auto" : "none",
        touchAction: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(15, 23, 42, 0.45)",
          clipPath: `polygon(
            0% 0%, 0% 100%, ${crop.x * 100}% 100%, ${crop.x * 100}% ${crop.y * 100}%,
            ${(crop.x + crop.width) * 100}% ${crop.y * 100}%,
            ${(crop.x + crop.width) * 100}% ${(crop.y + crop.height) * 100}%,
            ${crop.x * 100}% ${(crop.y + crop.height) * 100}%,
            ${crop.x * 100}% 100%, 100% 100%, 100% 0%
          )`,
        }}
      />

      <div
        onPointerDown={(event) => startDrag(event, "move")}
        style={{
          position: "absolute",
          left: `${crop.x * 100}%`,
          top: `${crop.y * 100}%`,
          width: `${crop.width * 100}%`,
          height: `${crop.height * 100}%`,
          border: `2px solid ${borderColor}`,
          borderRadius: 8,
          boxShadow: `0 0 0 2px ${confirmed ? "rgba(16,185,129,0.25)" : "rgba(234,88,12,0.25)"}`,
          cursor: editable ? (dragging ? "grabbing" : "grab") : "default",
          boxSizing: "border-box",
        }}
      >
        {(label || editable) && (
          <div
            style={{
              position: "absolute",
              top: -24,
              left: 0,
              background: labelBg,
              color: "white",
              borderRadius: "6px 6px 6px 0",
              padding: "2px 10px",
              fontSize: "0.72rem",
              fontWeight: 700,
              whiteSpace: "nowrap",
              maxWidth: 220,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {label || "Kéo để chọn vùng nhận diện"}
          </div>
        )}

        {editable && (
          <div
            onPointerDown={(event) => startDrag(event, "resize")}
            style={{
              position: "absolute",
              right: -6,
              bottom: -6,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: borderColor,
              border: "2px solid white",
              cursor: "nwse-resize",
            }}
          />
        )}
      </div>
    </div>
  );
}
