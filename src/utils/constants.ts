// Shared application constants.

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export const ACCESS_TOKEN_KEY = "accessToken";

export const ROUTES = {
  landing: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  dashboard: "/dashboard",
  wardrobe: "/wardrobe",
  profile: "/profile",
  preferences: "/preferences",
  friends: "/friends",
  aiDetection: "/ai-detection",
  aiAnalysis: "/ai-analysis",
  recommendations: "/recommendations",
  eventRecommendation: "/event-recommendation",
  library: "/library",
  admin: "/admin",
} as const;
