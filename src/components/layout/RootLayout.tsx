import { Outlet } from "react-router";
import { AuthProvider } from "../../app/providers/AuthProvider";

/**
 * RootLayout wraps all routes with AuthProvider so that
 * useNavigate (used inside AuthProvider) is available within
 * the router context.
 */
export function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

export default RootLayout;
