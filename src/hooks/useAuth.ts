import { authService } from "../services/authService";

// Placeholder auth hook. Replace with real state management / react-query later.
export function useAuth() {
  return {
    user: null,
    isAuthenticated: false,
    login: authService.login,
    register: authService.register,
    logout: authService.logout,
  };
}

export default useAuth;
