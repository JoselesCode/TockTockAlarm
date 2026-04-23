import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setIsLoading(true);
        setError(null);

        if (!firebaseUser) {
          setUser(null);
          return;
        }

        await ensureUserProfile({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || "Usuario",
          email: firebaseUser.email || "",
          photoURL: firebaseUser.photoURL,
        });

        const profile = await getUserProfile(firebaseUser.uid);

        setUser({
          uid: firebaseUser.uid,
          profile: {
            name: profile?.name || firebaseUser.displayName || "Usuario",
            email: profile?.email || firebaseUser.email || "",
            photoURL: profile?.photoURL || firebaseUser.photoURL,
          },
          role: profile?.role || "worker",
          status: profile?.status || "active",
        });
      } catch (err) {
        console.error("Error sincronizando usuario:", err);
        setError(
          err instanceof Error
            ? err
            : new Error("Error al sincronizar usuario con Firestore")
        );
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signinRedirect = useCallback(async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al iniciar sesión"));
      throw err;
    }
  }, []);

  const removeUser = useCallback(async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cerrar sesión"));
      throw err;
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