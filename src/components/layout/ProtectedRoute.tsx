import { Navigate, Outlet } from "react-router";
import { useAuthContext } from "../../app/providers/AuthProvider";

export type Role = "USER" | "ADMIN";

interface ProtectedRouteProps {
  allow: Role;
}

function normalizeRole(role?: string | null): Role {
  if (role === "ROLE_ADMIN" || role === "ADMIN") {
    return "ADMIN";
  }

  return "USER";
}

export function ProtectedRoute({ allow }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthContext();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, system-ui, sans-serif",
          color: "#64748B",
          fontSize: "0.9rem",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 36,
              height: 36,
              border: "3px solid #FFEDD5",
              borderTopColor: "#EA580C",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          Đang tải...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = normalizeRole(user.role);

  if (role !== allow) {
    return (
      <Navigate
        to={role === "ADMIN" ? "/admin/dashboard" : "/app/dashboard"}
        replace
      />
    );
  }

  return <Outlet />;
}

export function RequireUser() {
  return <ProtectedRoute allow="USER" />;
}

export function RequireAdmin() {
  return <ProtectedRoute allow="ADMIN" />;
}

export default ProtectedRoute;