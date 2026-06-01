import { createContext, useContext, type ReactNode } from "react";
import type { User } from "../../types/user";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
});

// Placeholder auth provider. Wire up real auth state later.
export function AuthProvider({ children }: { children: ReactNode }) {
  const value: AuthContextValue = {
    user: null,
    isAuthenticated: false,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}

export default AuthProvider;
