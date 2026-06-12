import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type UserRole = "worker" | "rrhh";

export type AccessibilityFontSize = "normal" | "large" | "extra";

export type AccessibilitySettings = {
  fontSize: AccessibilityFontSize;
  lowVision: boolean;
  colorBlind: boolean;
  hearing: boolean;
  reducedMotion: boolean;
  simpleMode: boolean;
};

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  fontSize: "normal",
  lowVision: false,
  colorBlind: false,
  hearing: false,
  reducedMotion: false,
  simpleMode: false,
};

export type FirestoreUserProfile = {
  uid: string;
  name: string;
  email: string;
  photoURL?: string | null;
  role: UserRole;
  status: "active" | "inactive";
  faceDescriptor?: number[];
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
      role: "worker",
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

export async function getUserProfile(
  uid: string
): Promise<FirestoreUserProfile | null> {
  try {
    const ref = doc(db, "users", uid);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) return null;

    return snapshot.data() as FirestoreUserProfile;
  } catch (error) {
    console.error("Error obteniendo perfil del usuario:", error);
    return null;
  }
}

export async function getAllActiveUsers(): Promise<FirestoreUserProfile[]> {
  try {
    const ref = collection(db, "users");
    const q = query(ref, where("status", "==", "active"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docItem) => ({
      ...(docItem.data() as FirestoreUserProfile),
    }));
  } catch (error) {
    console.error("Error obteniendo usuarios activos:", error);
    return [];
  }
}

export async function updateUserRole(uid: string, role: UserRole) {
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

export async function getUserAccessibilitySettings(
  uid: string
): Promise<AccessibilitySettings> {
  try {
    const ref = doc(db, "users", uid, "settings", "accessibility");
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      return DEFAULT_ACCESSIBILITY_SETTINGS;
    }

    return {
      ...DEFAULT_ACCESSIBILITY_SETTINGS,
      ...(snapshot.data() as Partial<AccessibilitySettings>),
    };
  } catch (error) {
    console.error("Error obteniendo configuración de accesibilidad:", error);
    return DEFAULT_ACCESSIBILITY_SETTINGS;
  }
}

export async function saveUserAccessibilitySettings(
  uid: string,
  settings: AccessibilitySettings
) {
  try {
    const ref = doc(db, "users", uid, "settings", "accessibility");

    await setDoc(
      ref,
      {
        ...settings,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error guardando configuración de accesibilidad:", error);
    throw error;
  }
}

export async function captureImage(video: HTMLVideoElement): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx?.drawImage(video, 0, 0);

  return canvas.toDataURL("image/jpeg");
}