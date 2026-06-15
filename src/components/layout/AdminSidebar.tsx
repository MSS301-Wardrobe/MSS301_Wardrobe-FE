import { NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard, Users, FolderTree, Cpu, Sparkles, Settings,
  LogOut, ChevronLeft, ChevronRight, Zap
} from "lucide-react";
import { toast } from "sonner";

const navItems = [
  { icon: LayoutDashboard, label: "Admin Dashboard", path: "/admin/dashboard" },
  { icon: Users, label: "Quản Lý Người Dùng", path: "/admin/users" },
  { icon: FolderTree, label: "Quản Lý Danh Mục", path: "/admin/categories" },
  { icon: Cpu, label: "Lịch Sử Nhận Diện AI", path: "/admin/ai-requests" },
  { icon: Sparkles, label: "Lịch Sử Gợi Ý", path: "/admin/recommendation-logs" },
  { icon: Settings, label: "Cấu Hình Hệ Thống", path: "/admin/system-settings" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ collapsed, onToggle }: SidebarProps) {
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
            <p style={{ fontSize: "0.7rem", color: "#64748B", lineHeight: 1.2 }}>Quản Trị Hệ Thống</p>
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

      {/* Admin info */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full flex items-center justify-center shrink-0"
              style={{
                width: 32, height: 32,
                background: "linear-gradient(135deg, #EA580C, #F97316)",
                color: "white", fontSize: "0.75rem", fontWeight: 600
              }}
            >
              AD
            </div>
            <div>
              <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#0F172A" }}>Quản Trị Viên</p>
              <p style={{ fontSize: "0.7rem", color: "#64748B" }}>admin@example.com</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
