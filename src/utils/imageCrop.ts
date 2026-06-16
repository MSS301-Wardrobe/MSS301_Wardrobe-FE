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
