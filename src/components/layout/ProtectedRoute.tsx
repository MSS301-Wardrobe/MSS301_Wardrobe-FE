import { Navigate, Outlet } from "react-router";

export type Role = "USER" | "ADMIN";

// Placeholder role resolver. Replace with real auth/API state later.
export function getRole(): Role {
  return localStorage.getItem("role") === "ADMIN" ? "ADMIN" : "USER";
}

interface ProtectedRouteProps {
  allow: Role;
}

export function ProtectedRoute({ allow }: ProtectedRouteProps) {
  const role = getRole();
  if (role !== allow) {
    return <Navigate to={role === "ADMIN" ? "/admin/dashboard" : "/app/dashboard"} replace />;
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
