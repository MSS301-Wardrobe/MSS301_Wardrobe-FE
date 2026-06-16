import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "../../types/user";
import { apiClient } from "../../services/apiClient";
import { ACCESS_TOKEN_KEY } from "../../utils/constants";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, try to restore session from token
  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Demo mode: if token is the mock demo token, restore user from localStorage directly
    if (token === "demo-token") {
      const demoRole = localStorage.getItem("role") ?? "USER";
      setUser({
        id: "demo-user",
        email: demoRole === "ADMIN" ? "admin@gmail.com" : "user@example.com",
        name: demoRole === "ADMIN" ? "Admin" : "Demo User",
        role: demoRole as "USER" | "ADMIN",
      });
      setIsLoading(false);
      return;
    }

    apiClient
      .get<User>("/users/me")
      .then(({ data }) => {
        setUser(data);
        localStorage.setItem("role", data.role ?? "USER");
      })
      .catch(() => {
        // Token is invalid or expired — clear it
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem("role");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem("role");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}

export default AuthProvider;
