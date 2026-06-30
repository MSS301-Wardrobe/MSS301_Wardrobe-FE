import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "../../types/user";
import { authService } from "../../services/authService";
import { userService } from "../../services/userService";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: () => { },
  logout: async () => { },
  uploadAvatar: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setUser = useCallback((user: User | null) => {
    setUserState(user);
  }, []);

  const uploadAvatar = useCallback(async (file: File) => {
    const updatedUser = await userService.uploadAvatar(file);
    setUser(updatedUser);
  }, [setUser]);

  useEffect(() => {
    let cancelled = false;

    authService
      .me()
      .then((user) => {
        if (!cancelled) {
          setUser(user);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [setUser]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, [setUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        setUser,
        logout,
        uploadAvatar,
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