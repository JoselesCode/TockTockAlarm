import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "firebase/auth";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ensureUserProfile } from "@/lib/firebase/users";

type AppUser = {
  uid: string;
  profile: {
    name: string;
    email: string;
  };
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
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setError(null);
        setFirebaseUser(user);

        if (user) {
          await ensureUserProfile({
            uid: user.uid,
            name: user.displayName || "Usuario",
            email: user.email || "",
            photoURL: user.photoURL,
          });
        }
      } catch (err) {
        console.error("Error creando/actualizando usuario en Firestore:", err);
        setError(
          err instanceof Error
            ? err
            : new Error("Error al sincronizar usuario con Firestore")
        );
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
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cerrar sesión"));
      throw err;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: firebaseUser
        ? {
            uid: firebaseUser.uid,
            profile: {
              name: firebaseUser.displayName || "Usuario",
              email: firebaseUser.email || "",
            },
          }
        : null,
      isAuthenticated: !!firebaseUser,
      isLoading,
      error,
      signinRedirect,
      removeUser,
    }),
    [firebaseUser, isLoading, error, signinRedirect, removeUser]
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