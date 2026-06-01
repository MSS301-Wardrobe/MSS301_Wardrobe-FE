import { createBrowserRouter } from "react-router";
import { UserLayout } from "../components/layout/UserLayout";
import { AdminLayout } from "../components/layout/AdminLayout";
import { RequireUser, RequireAdmin } from "../components/layout/ProtectedRoute";

// Public pages
import { Landing } from "../pages/landing/Landing";
import { Login } from "../pages/auth/LoginPage";
import { Register } from "../pages/auth/RegisterPage";
import { ForgotPassword } from "../pages/auth/ForgotPasswordPage";

// End user pages
import { Dashboard } from "../pages/user/dashboard/Dashboard";
import { WardrobeOverview } from "../pages/user/wardrobe/WardrobeOverview";
import { ClothingDetail } from "../pages/user/wardrobe/ClothingDetail";
import { AddClothing } from "../pages/user/wardrobe/AddClothing";
import { WardrobeZones } from "../pages/user/wardrobe/WardrobeZones";
import { FriendGroups } from "../pages/user/friend-groups/FriendGroups";
import { FriendGroupDetails } from "../pages/user/friend-groups/FriendGroupDetails";
import { AIDetection } from "../pages/user/ai-detection/AIDetection";
import { AIAnalysisDashboard } from "../pages/user/ai-detection/AIAnalysisDashboard";
import { OutfitRecommendation } from "../pages/user/recommendations/OutfitRecommendation";
import { RecommendationDetails } from "../pages/user/recommendations/RecommendationDetails";
import { EventRecommendation } from "../pages/user/event-outfits/EventRecommendation";
import { ImageLibrary } from "../pages/user/image-library/ImageLibrary";
import { UserProfile } from "../pages/user/profile/UserProfile";
import { PreferenceSettings } from "../pages/user/preferences/PreferenceSettings";

// Admin pages
import { SystemAnalytics } from "../pages/admin/dashboard/SystemAnalytics";
import { UsersManagement } from "../pages/admin/users/UsersManagement";
import { CategoriesManagement } from "../pages/admin/categories/CategoriesManagement";
import { AIRequestsLog } from "../pages/admin/ai-requests/AIRequestsLog";
import { RecommendationLogs } from "../pages/admin/recommendation-logs/RecommendationLogs";
import { SystemSettings } from "../pages/admin/system-settings/SystemSettings";

export const router = createBrowserRouter([
  // Public routes
  { path: "/", Component: Landing },
  { path: "/login", Component: Login },
  { path: "/register", Component: Register },
  { path: "/forgot-password", Component: ForgotPassword },

  // End user routes (role: USER)
  {
    path: "/app",
    Component: RequireUser,
    children: [
      {
        Component: UserLayout,
        children: [
          { path: "dashboard", Component: Dashboard },
          { path: "wardrobe", Component: WardrobeOverview },
          { path: "wardrobe/add", Component: AddClothing },
          { path: "wardrobe/zones", Component: WardrobeZones },
          { path: "wardrobe/:id", Component: ClothingDetail },
          { path: "friend-groups", Component: FriendGroups },
          { path: "friend-groups/:id", Component: FriendGroupDetails },
          { path: "ai-detection", Component: AIDetection },
          { path: "ai-analysis", Component: AIAnalysisDashboard },
          { path: "recommendations", Component: OutfitRecommendation },
          { path: "recommendations/:id", Component: RecommendationDetails },
          { path: "event-outfits", Component: EventRecommendation },
          { path: "image-library", Component: ImageLibrary },
          { path: "profile", Component: UserProfile },
          { path: "preferences", Component: PreferenceSettings },
        ],
      },
    ],
  },

  // Admin routes (role: ADMIN)
  {
    path: "/admin",
    Component: RequireAdmin,
    children: [
      {
        Component: AdminLayout,
        children: [
          { path: "dashboard", Component: SystemAnalytics },
          { path: "users", Component: UsersManagement },
          { path: "categories", Component: CategoriesManagement },
          { path: "ai-requests", Component: AIRequestsLog },
          { path: "recommendation-logs", Component: RecommendationLogs },
          { path: "system-settings", Component: SystemSettings },
        ],
      },
    ],
  },
]);
