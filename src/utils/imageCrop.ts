export type NormalizedCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const DEFAULT_CROP: NormalizedCrop = {
  x: 0.05,
  y: 0.05,
  width: 0.9,
  height: 0.9,
};

type PixelBBox = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

function cropToPixels(
  crop: NormalizedCrop,
  naturalWidth: number,
  naturalHeight: number
): PixelBBox {
  return {
    x1: crop.x * naturalWidth,
    y1: crop.y * naturalHeight,
    x2: (crop.x + crop.width) * naturalWidth,
    y2: (crop.y + crop.height) * naturalHeight,
  };
}

function intersectionArea(a: PixelBBox, b: PixelBBox): number {
  const x1 = Math.max(a.x1, b.x1);
  const y1 = Math.max(a.y1, b.y1);
  const x2 = Math.min(a.x2, b.x2);
  const y2 = Math.min(a.y2, b.y2);

  if (x2 <= x1 || y2 <= y1) {
    return 0;
  }

  return (x2 - x1) * (y2 - y1);
}

/** Kiểm tra bbox detection có nằm trong vùng crop người dùng chọn hay không */
export function detectionOverlapsCrop(
  bbox: PixelBBox,
  crop: NormalizedCrop,
  naturalWidth: number,
  naturalHeight: number,
  minOverlapRatio = 0.2
): boolean {
  const cropPx = cropToPixels(crop, naturalWidth, naturalHeight);
  const bboxArea = Math.max(1, (bbox.x2 - bbox.x1) * (bbox.y2 - bbox.y1));
  const overlap = intersectionArea(bbox, cropPx);
  const overlapRatio = overlap / bboxArea;

  const centerX = (bbox.x1 + bbox.x2) / 2;
  const centerY = (bbox.y1 + bbox.y2) / 2;
  const centerInside =
    centerX >= cropPx.x1 &&
    centerX <= cropPx.x2 &&
    centerY >= cropPx.y1 &&
    centerY <= cropPx.y2;

  return centerInside || overlapRatio >= minOverlapRatio;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Không thể đọc ảnh"));
    image.src = src;
  });
}

export async function cropImageFile(
  file: File,
  crop: NormalizedCrop
): Promise<File> {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(imageUrl);
    const sx = Math.round(crop.x * image.naturalWidth);
    const sy = Math.round(crop.y * image.naturalHeight);
    const sw = Math.max(1, Math.round(crop.width * image.naturalWidth));
    const sh = Math.max(1, Math.round(crop.height * image.naturalHeight));

    const canvas = document.createElement("canvas");
    canvas.width = sw;
    canvas.height = sh;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Không thể crop ảnh");
    }

    context.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (value) => (value ? resolve(value) : reject(new Error("Không thể crop ảnh"))),
        file.type || "image/jpeg",
        0.95
      );
    });

    return new File([blob], `crop-${file.name}`, {
      type: file.type || "image/jpeg",
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
