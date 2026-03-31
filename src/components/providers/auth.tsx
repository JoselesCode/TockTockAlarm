import { createContext, useCallback, useContext, useMemo, useState } from "react";

type DemoUser = {
  profile: {
    name: string;
    email: string;
  };
};

type AuthContextValue = {
  user: DemoUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  signinRedirect: () => Promise<void>;
  removeUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "tocktockalarm.auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  const signinRedirect = useCallback(async () => {
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  const removeUser = useCallback(async () => {
    setIsAuthenticated(false);
    localStorage.setItem(STORAGE_KEY, "false");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: isAuthenticated
        ? {
            profile: {
              name: "Trabajador",
              email: "demo@tocktockalarm.app",
            },
          }
        : null,
      isAuthenticated,
      isLoading: false,
      error: null,
      signinRedirect,
      removeUser,
    }),
    [isAuthenticated, removeUser, signinRedirect]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
