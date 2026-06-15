import { NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard, Shirt, Cpu, Sparkles, Images, User, Settings,
  LogOut, ChevronLeft, ChevronRight, Zap, Users, Calendar
} from "lucide-react";
import { toast } from "sonner";

const navItems = [
  { icon: LayoutDashboard, label: "Tổng Quan", path: "/app/dashboard" },
  { icon: Shirt, label: "Tủ Đồ", path: "/app/wardrobe" },
  { icon: Users, label: "Nhóm Bạn", path: "/app/friend-groups" },
  { icon: Cpu, label: "Nhận Diện AI", path: "/app/ai-detection" },
  { icon: Sparkles, label: "Gợi Ý Trang Phục", path: "/app/recommendations" },
  { icon: Calendar, label: "Trang Phục Sự Kiện", path: "/app/event-outfits" },
  { icon: Images, label: "Thư Viện Ảnh", path: "/app/image-library" },
];

const bottomNavItems = [
  { icon: User, label: "Hồ Sơ", path: "/app/profile" },
  { icon: Settings, label: "Sở Thích", path: "/app/preferences" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function UserSidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("role");
    toast.success("Đăng xuất thành công");
    navigate("/login");
  };

  return (
    <aside
      className="relative flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0 h-screen"
      style={{ width: collapsed ? 72 : 240 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div
          className="flex items-center justify-center rounded-xl shrink-0"
          style={{
            width: 36, height: 36,
            background: "linear-gradient(135deg, #EA580C, #F97316)"
          }}
        >
          <Zap size={18} color="white" />
        </div>
        {!collapsed && (
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0F172A", lineHeight: 1.2 }}>StyleAI</p>
            <p style={{ fontSize: "0.7rem", color: "#64748B", lineHeight: 1.2 }}>Tủ Đồ Thông Minh</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-16 z-10 flex items-center justify-center bg-white border border-border rounded-full shadow-sm cursor-pointer hover:bg-muted transition-colors"
        style={{ width: 24, height: 24 }}
      >
        {collapsed ? <ChevronRight size={12} color="#64748B" /> : <ChevronLeft size={12} color="#64748B" />}
      </button>

      {/* Main nav */}
      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink key={path} to={path}>
            {({ isActive }) => (
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150"
                style={{
                  background: isActive ? "#FFEDD5" : "transparent",
                  color: isActive ? "#EA580C" : "#64748B",
                }}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && (
                  <span style={{ fontSize: "0.875rem", fontWeight: isActive ? 600 : 400 }}>
                    {label}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 py-4 border-t border-sidebar-border flex flex-col gap-1">
        {bottomNavItems.map(({ icon: Icon, label, path }) => (
          <NavLink key={path} to={path}>
            {({ isActive }) => (
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150"
                style={{
                  background: isActive ? "#FFEDD5" : "transparent",
                  color: isActive ? "#EA580C" : "#64748B",
                }}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && (
                  <span style={{ fontSize: "0.875rem", fontWeight: isActive ? 600 : 400 }}>
                    {label}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 w-full text-left"
          style={{ color: "#EF4444" }}
          title={collapsed ? "Đăng xuất" : undefined}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {!collapsed && <span style={{ fontSize: "0.875rem" }}>Đăng Xuất</span>}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-sidebar-border">
          <NavLink to="/app/profile">
            <div className="flex items-center gap-3 rounded-xl cursor-pointer transition-colors duration-150 hover:bg-muted -mx-1 px-1 py-1">
              <div
                className="rounded-full flex items-center justify-center shrink-0"
                style={{
                  width: 32, height: 32,
                  background: "linear-gradient(135deg, #EA580C, #F97316)",
                  color: "white", fontSize: "0.75rem", fontWeight: 600
                }}
              >
                JS
              </div>
              <div>
                <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#0F172A" }}>Jamie Smith</p>
                <p style={{ fontSize: "0.7rem", color: "#64748B" }}>jamie@example.com</p>
              </div>
            </div>
          </NavLink>
        </div>
      )}
    </aside>
  );
}
