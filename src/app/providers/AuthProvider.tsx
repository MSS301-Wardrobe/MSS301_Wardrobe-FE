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
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setUser = useCallback((user: User | null) => {
    setUserState(user);

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role ?? "ROLE_USER");
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("role");
    }
  }, []);

  useEffect(() => {
    apiClient
      .get<User>("/users/me")
      .then(({ data }) => {
        setUser(data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [setUser]);

  const logout = useCallback(() => {
    // Nếu backend có API logout thì gọi thêm ở đây
    // apiClient.post("/users/auth/logout");

    setUser(null);
  }, [setUser]);

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