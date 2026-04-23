import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type UserRole = "worker" | "rrhh";

export type FirestoreUserProfile = {
  uid: string;
  name: string;
  email: string;
  photoURL?: string | null;
  role: UserRole;
  status: "active" | "inactive";
  createdAt?: unknown;
  updatedAt?: unknown;
};

export async function ensureUserProfile(input: {
  uid: string;
  name: string;
  email: string;
  photoURL?: string | null;
}) {
  const ref = doc(db, "users", input.uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    await setDoc(ref, {
      uid: input.uid,
      name: input.name,
      email: input.email,
      photoURL: input.photoURL ?? null,

      // Roles del sistema
      role: "worker",

      // Estado del usuario
      status: "active",

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return;
  }

  await updateDoc(ref, {
    name: input.name,
    email: input.email,
    photoURL: input.photoURL ?? null,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Obtener perfil completo del usuario desde Firestore
 */
export async function getUserProfile(
  uid: string
): Promise<FirestoreUserProfile | null> {
  try {
    const ref = doc(db, "users", uid);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as FirestoreUserProfile;
  } catch (error) {
    console.error("Error obteniendo perfil del usuario:", error);
    return null;
  }
}

/**
 * Cambiar rol del usuario
 * útil para administración futura RRHH/Admin
 */
export async function updateUserRole(
  uid: string,
  role: UserRole
) {
  try {
    const ref = doc(db, "users", uid);

    await updateDoc(ref, {
      role,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error actualizando rol:", error);
    throw error;
  }
}

/**
 * Cambiar estado del usuario
 */
export async function updateUserStatus(
  uid: string,
  status: "active" | "inactive"
) {
  try {
    const ref = doc(db, "users", uid);

    await updateDoc(ref, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error actualizando estado:", error);
    throw error;
  }
}