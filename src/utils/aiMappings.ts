import type { Category } from "../types/wardrobe";

/** Khớp 13 class YOLO (0-12) và attribute_rules.py / color_extractor.py */

/** Ngưỡng tin cậy tối thiểu phía FE — không đụng BE */
export const MIN_DETECTION_CONFIDENCE = 0.45;

export const CATEGORY_LABELS_VI: Record<string, string> = {
  short_sleeve_top: "Áo tay ngắn",
  long_sleeve_top: "Áo tay dài",
  short_sleeve_outwear: "Áo khoác tay ngắn",
  long_sleeve_outwear: "Áo khoác tay dài",
  vest: "Áo gile",
  sling: "Áo hai dây",
  shorts: "Quần short",
  trousers: "Quần dài",
  skirt: "Chân váy",
  short_sleeve_dress: "Đầm tay ngắn",
  long_sleeve_dress: "Đầm tay dài",
  vest_dress: "Đầm gile",
  sling_dress: "Đầm hai dây",
};

/** Khớp BASIC_COLOR_MAP trong color_extractor.py */
export const BASE_COLOR_LABELS_VI: Record<string, string> = {
  black: "Đen",
  white: "Trắng",
  blue: "Xanh dương",
  gray: "Xám",
  grey: "Xám",
  red: "Đỏ",
  green: "Xanh lá",
  yellow: "Vàng",
  orange: "Cam",
  pink: "Hồng",
  purple: "Tím",
  brown: "Nâu",
  beige: "Be",
  unknown: "Chưa xác định",
};

/** Giá trị style trong attribute_rules.py */
export const STYLE_LABELS_VI: Record<string, string> = {
  casual: "Thường ngày",
  daily: "Hằng ngày",
  "smart casual": "Lịch sự thoải mái",
  streetwear: "Đường phố",
  formal: "Trang trọng",
  business: "Công sở",
  summer: "Mùa hè",
  sport: "Thể thao",
  feminine: "Nữ tính",
  elegant: "Thanh lịch",
  unknown: "Chưa xác định",
};

/** Giá trị occasion trong attribute_rules.py */
export const OCCASION_LABELS_VI: Record<string, string> = {
  daily: "Hằng ngày",
  school: "Đi học",
  "casual outing": "Đi chơi",
  outdoor: "Ngoài trời",
  office: "Công sở",
  meeting: "Họp",
  event: "Sự kiện",
  beach: "Biển",
  summer: "Mùa hè",
  sport: "Thể thao",
  date: "Hẹn hò",
  party: "Dự tiệc",
  "formal meeting": "Họp trang trọng",
  unknown: "Chưa xác định",
};

export const GENDER_LABELS_VI: Record<string, string> = {
  unisex: "Unisex",
  female: "Nữ",
  male: "Nam",
  unknown: "Chưa xác định",
};

export const SUPPORTED_CATEGORY_NAMES_VI = Object.values(CATEGORY_LABELS_VI);

export function getSupportedCategoriesText(): string {
  return SUPPORTED_CATEGORY_NAMES_VI.join(", ");
}

export function buildLowConfidenceMessage(confidencePercent: number): string {
  return (
    `Độ tin cậy chỉ ${confidencePercent}% — quá thấp để kết luận. ` +
    `AI hiện chỉ hỗ trợ 13 loại: ${getSupportedCategoriesText()}. ` +
    `Giày dép, túi xách và phụ kiện chưa được hỗ trợ.`
  );
}

export function translateCategory(className: string): string {
  return CATEGORY_LABELS_VI[className] ?? className;
}

export function translateBaseColor(baseColor: string): string {
  return BASE_COLOR_LABELS_VI[baseColor.toLowerCase()] ?? baseColor;
}

export function translateStyle(styles: string[]): string {
  return styles
    .map((style) => STYLE_LABELS_VI[style.toLowerCase()] ?? style)
    .join(" / ");
}

/** Map style AI → option dropdown form Thêm Trang Phục */
const AI_STYLE_TO_FORM_STYLE: Record<string, string> = {
  casual: "Thường Ngày",
  daily: "Thường Ngày",
  "smart casual": "Công Sở",
  streetwear: "Thường Ngày",
  formal: "Trang Trọng",
  business: "Công Sở",
  summer: "Du Lịch",
  sport: "Thể Thao",
  feminine: "Tiệc Tùng",
  elegant: "Thanh Lịch",
};

/** Danh mục cha khi DB chỉ có nhóm rộng (Áo, Quần, Đầm...) */
export const AI_CLASS_PARENT_CATEGORY: Record<string, string> = {
  short_sleeve_top: "Áo",
  long_sleeve_top: "Áo",
  short_sleeve_outwear: "Áo khoác",
  long_sleeve_outwear: "Áo khoác",
  vest: "Áo",
  sling: "Áo",
  shorts: "Quần",
  trousers: "Quần",
  skirt: "Chân váy",
  short_sleeve_dress: "Đầm",
  long_sleeve_dress: "Đầm",
  vest_dress: "Đầm",
  sling_dress: "Đầm",
};

/** Từ khóa tìm danh mục DB theo class YOLO (ưu tiên từ cụ thể → chung) */
const AI_CLASS_CATEGORY_SEARCH: Record<string, string[]> = {
  short_sleeve_top: ["áo tay ngắn", "áo"],
  long_sleeve_top: ["áo tay dài", "áo"],
  short_sleeve_outwear: ["áo khoác tay ngắn", "áo khoác"],
  long_sleeve_outwear: ["áo khoác tay dài", "áo khoác"],
  vest: ["áo gile", "gile", "áo"],
  sling: ["áo hai dây", "áo"],
  shorts: ["quần short", "quần", "short"],
  trousers: ["quần dài", "quần"],
  skirt: ["chân váy", "váy"],
  short_sleeve_dress: ["đầm tay ngắn", "đầm"],
  long_sleeve_dress: ["đầm tay dài", "đầm"],
  vest_dress: ["đầm gile", "đầm"],
  sling_dress: ["đầm hai dây", "đầm 2 dây", "đầm"],
};

export function normalizeVi(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/g, "d")
    .trim();
}

export function getAiParentCategoryLabel(classKey: string): string {
  return AI_CLASS_PARENT_CATEGORY[classKey] ?? "";
}

export function matchCategoryFromAi(
  categories: Category[],
  classKey: string,
  aiLabel: string
): Category | undefined {
  if (!categories.length) {
    return undefined;
  }

  const aiNorm = normalizeVi(aiLabel);

  const exact = categories.find(
    (category) => normalizeVi(category.categoryName) === aiNorm
  );
  if (exact) {
    return exact;
  }

  const partial = categories.find((category) => {
    const catNorm = normalizeVi(category.categoryName);
    return catNorm.includes(aiNorm) || aiNorm.includes(catNorm);
  });
  if (partial) {
    return partial;
  }

  const aiTokens = aiNorm.split(/\s+/).filter((token) => token.length > 1);
  const tokenMatch = categories.find((category) => {
    const catNorm = normalizeVi(category.categoryName);
    return aiTokens.some(
      (token) => catNorm.includes(token) || token.includes(catNorm)
    );
  });
  if (tokenMatch) {
    return tokenMatch;
  }

  const parentLabel = getAiParentCategoryLabel(classKey);
  if (parentLabel) {
    const parentNorm = normalizeVi(parentLabel);
    const parentMatch = categories.find((category) => {
      const catNorm = normalizeVi(category.categoryName);
      return catNorm === parentNorm || catNorm.includes(parentNorm) || parentNorm.includes(catNorm);
    });
    if (parentMatch) {
      return parentMatch;
    }
  }

  const searchTerms = [
    aiNorm,
    ...(parentLabel ? [parentLabel] : []),
    ...(AI_CLASS_CATEGORY_SEARCH[classKey] ?? []),
  ];
  for (const term of searchTerms) {
    const termNorm = normalizeVi(term);
    const matched = categories.find((category) =>
      normalizeVi(category.categoryName).includes(termNorm)
    );
    if (matched) {
      return matched;
    }
  }

  return undefined;
}

export function mapAiStyleToFormStyle(aiStyles: string[]): string {
  for (const style of aiStyles) {
    const mapped = AI_STYLE_TO_FORM_STYLE[style.toLowerCase()];
    if (mapped) {
      return mapped;
    }
  }

  return "";
}

export function translateOccasions(occasions: string[]): string[] {
  return occasions.map(
    (occasion) => OCCASION_LABELS_VI[occasion.toLowerCase()] ?? occasion
  );
}

export function translateGender(gender: string): string {
  return GENDER_LABELS_VI[gender.toLowerCase()] ?? gender;
}
