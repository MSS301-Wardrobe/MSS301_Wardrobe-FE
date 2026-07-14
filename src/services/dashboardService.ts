/**
 * dashboardService.ts
 * Dashboard data service. Wardrobe count uses real API; other stats remain mocked.
 */
import { wardrobeApi, clothingItemApi } from "./wardrobeService";

// ---------- Types ----------

export interface DashboardStats {
  totalClothing: number;
  totalZones: number;
  totalWardrobes: number;
  aiDetections: number;
  outfitsCreated: number;
}

export interface ClothingDistribution {
  name: string;
  value: number;
  color: string;
}

export interface GrowthDataPoint {
  month: string;
  items: number;
  outfits: number;
}

export interface RecentUpload {
  id: string;
  name: string;
  category: string;
  time: string;
  img: string;
}

export interface AiAccuracyStat {
  category: string;
  count: number;
  accuracy: number;
}

export interface OutfitRecommendation {
  title: string;
  score: number;
  tags: string[];
  img: string;
}

export interface DashboardData {
  stats: DashboardStats;
  clothingDistribution: ClothingDistribution[];
  growthData: GrowthDataPoint[];
  recentUploads: RecentUpload[];
  aiAccuracyStats: AiAccuracyStat[];
  outfitRecommendations: OutfitRecommendation[];
}

// ---------- Mock delay helper ----------
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ---------- Mock data per service ----------

/** Wardrobe Service - real API for wardrobe count by user */
async function fetchWardrobeStats(userId: string): Promise<Pick<DashboardStats, "totalClothing" | "totalZones" | "totalWardrobes">> {
  const wardrobes = await wardrobeApi.getByUserId(userId);
  let totalClothing = 0;
  try {
    const clothes = await clothingItemApi.getAll();
    totalClothing = clothes.length;
  } catch (error) {
    console.error("Failed to fetch clothing count", error);
  }
  
  return {
    totalClothing,
    totalZones: 5,
    totalWardrobes: wardrobes.length,
  };
}

async function fetchClothingDistribution(): Promise<ClothingDistribution[]> {
  await delay(200);
  return [
    { name: "Áo", value: 72, color: "#EA580C" },
    { name: "Quần", value: 54, color: "#F97316" },
    { name: "Váy", value: 38, color: "#F59E0B" },
    { name: "Áo Khoác", value: 45, color: "#10B981" },
    { name: "Phụ Kiện", value: 38, color: "#EF4444" },
  ];
}

async function fetchGrowthData(): Promise<GrowthDataPoint[]> {
  await delay(200);
  return [
    { month: "T1", items: 18, outfits: 12 },
    { month: "T2", items: 22, outfits: 15 },
    { month: "T3", items: 31, outfits: 20 },
    { month: "T4", items: 28, outfits: 18 },
    { month: "T5", items: 35, outfits: 24 },
    { month: "T6", items: 42, outfits: 31 },
  ];
}

async function fetchRecentUploads(): Promise<RecentUpload[]> {
  await delay(250);
  return [
    { id: "1", name: "Áo Sơ Mi Trắng Cotton", category: "Áo", time: "2 giờ trước", img: "https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=80&h=80&fit=crop" },
    { id: "2", name: "Quần Slim Jeans Tối", category: "Quần", time: "5 giờ trước", img: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=80&h=80&fit=crop" },
    { id: "3", name: "Thắt Lưng Da Nâu", category: "Phụ Kiện", time: "1 ngày trước", img: "https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=80&h=80&fit=crop" },
    { id: "4", name: "Giày Thể Thao Trắng", category: "Giày", time: "1 ngày trước", img: "https://images.unsplash.com/photo-1544441893-675973e31985?w=80&h=80&fit=crop" },
    { id: "5", name: "Mũ Len", category: "Phụ Kiện", time: "2 ngày trước", img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=80&h=80&fit=crop" },
  ];
}

/** AI Detection Service mock */
async function fetchAiStats(): Promise<Pick<DashboardStats, "aiDetections"> & { accuracyStats: AiAccuracyStat[] }> {
  await delay(350);
  return {
    aiDetections: 1843,
    accuracyStats: [
      { category: "Áo", count: 72, accuracy: 97 },
      { category: "Quần", count: 54, accuracy: 95 },
      { category: "Váy", count: 38, accuracy: 98 },
      { category: "Áo Khoác", count: 45, accuracy: 94 },
      { category: "Phụ Kiện", count: 38, accuracy: 92 },
    ],
  };
}

/** Recommendation Service mock */
async function fetchRecommendations(): Promise<{ outfitsCreated: number; recommendations: OutfitRecommendation[] }> {
  await delay(300);
  return {
    outfitsCreated: 92,
    recommendations: [
      {
        title: "Phong Cách Công Sở",
        score: 94,
        tags: ["Công Sở", "Tối Giản"],
        img: "https://images.unsplash.com/photo-1700557477506-369b241cbe54?w=120&h=120&fit=crop",
      },
      {
        title: "Phong Cách Cuối Tuần",
        score: 89,
        tags: ["Thường Ngày", "Xu Hướng"],
        img: "https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?w=120&h=120&fit=crop",
      },
      {
        title: "Trang Phục Dạ Tiệc",
        score: 91,
        tags: ["Tiệc Tùng", "Thanh Lịch"],
        img: "https://images.unsplash.com/photo-1617690033147-ce6b332d677b?w=120&h=120&fit=crop",
      },
    ],
  };
}

// ---------- Main aggregator ----------

/**
 * Fetches all dashboard data in parallel from each mock service.
 * Replace each fetch function with a real API call when backend is ready.
 */
export async function fetchDashboardData(userId: string): Promise<DashboardData> {
  const [
    wardrobeStats,
    clothingDistribution,
    growthData,
    recentUploads,
    aiResult,
    recommendationResult,
  ] = await Promise.all([
    fetchWardrobeStats(userId),
    fetchClothingDistribution(),
    fetchGrowthData(),
    fetchRecentUploads(),
    fetchAiStats(),
    fetchRecommendations(),
  ]);

  return {
    stats: {
      totalClothing: wardrobeStats.totalClothing,
      totalZones: wardrobeStats.totalZones,
      totalWardrobes: wardrobeStats.totalWardrobes,
      aiDetections: aiResult.aiDetections,
      outfitsCreated: recommendationResult.outfitsCreated,
    },
    clothingDistribution,
    growthData,
    recentUploads,
    aiAccuracyStats: aiResult.accuracyStats,
    outfitRecommendations: recommendationResult.recommendations,
  };
}

export const dashboardService = {
  fetchDashboardData,
  fetchWardrobeStats,
  fetchClothingDistribution,
  fetchGrowthData,
  fetchRecentUploads,
  fetchAiStats,
  fetchRecommendations,
};
