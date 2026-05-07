import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { signOut } from "firebase/auth";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { auth } from "@/lib/firebase";
import {
  ensureUserProfile,
  getUserProfile,
  type UserRole,
} from "@/lib/firebase/users";

type AppUser = {
  uid: string;
  profile: {
    name: string;
    email: string;
    photoURL?: string | null;
  };
  role: UserRole;
  status?: "active" | "inactive";
};

type AuthContextValue = {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  signinRedirect: () => Promise<void>;
  removeUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadUserProfile = useCallback(async (firebaseUser: {
    uid: string;
    displayName?: string | null;
    email?: string | null;
    photoUrl?: string | null;
    photoURL?: string | null;
  }) => {
    await ensureUserProfile({
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || "Usuario",
      email: firebaseUser.email || "",
      photoURL: firebaseUser.photoUrl || firebaseUser.photoURL || null,
    });

    const profile = await getUserProfile(firebaseUser.uid);

    setUser({
      uid: firebaseUser.uid,
      profile: {
        name: profile?.name || firebaseUser.displayName || "Usuario",
        email: profile?.email || firebaseUser.email || "",
        photoURL:
          profile?.photoURL ||
          firebaseUser.photoUrl ||
          firebaseUser.photoURL ||
          null,
      },
      role: profile?.role || "worker",
      status: profile?.status || "active",
    });
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await FirebaseAuthentication.getCurrentUser();

        if (result.user) {
          await loadUserProfile(result.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error cargando usuario:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [loadUserProfile]);

  const signinRedirect = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await FirebaseAuthentication.signInWithGoogle();

      if (!result.user) {
        throw new Error("No se pudo obtener el usuario de Google");
      }

      await loadUserProfile(result.user);
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError(err instanceof Error ? err : new Error("Error al iniciar sesión"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadUserProfile]);

  const removeUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await FirebaseAuthentication.signOut();
      await signOut(auth);

      setUser(null);
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
      setError(err instanceof Error ? err : new Error("Error al cerrar sesión"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      error,
      signinRedirect,
      removeUser,
    }),
    [user, isLoading, error, signinRedirect, removeUser]
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