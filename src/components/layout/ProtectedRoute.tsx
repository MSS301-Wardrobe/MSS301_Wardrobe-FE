import { Navigate, Outlet } from "react-router";
import { useAuthContext } from "../../app/providers/AuthProvider";

export type Role = "USER" | "ADMIN";

interface ProtectedRouteProps {
  allow: Role;
}

export function ProtectedRoute({ allow }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthContext();

  // Wait for auth state to be resolved before redirecting
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
              border: "3px solid #EEF2FF",
              borderTopColor: "#4F46E5",
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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role ?? "USER";

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

// Convenience guards so routes.ts can stay JSX-free.
export function RequireUser() {
  return <ProtectedRoute allow="USER" />;
}

export function RequireAdmin() {
  return <ProtectedRoute allow="ADMIN" />;
}

export default ProtectedRoute;
