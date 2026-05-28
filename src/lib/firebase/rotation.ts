import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { RotationConfig } from "@/lib/weekly-rotation";

export async function getUserRotationConfig(
  uid: string
): Promise<RotationConfig | null> {
  const ref = doc(db, "users", uid, "settings", "rotationConfig");
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) return null;

  return snapshot.data() as RotationConfig;
}

export async function saveUserRotationConfig(
  uid: string,
  config: RotationConfig
) {
  const ref = doc(db, "users", uid, "settings", "rotationConfig");

  await setDoc(
    ref,
    {
      ...config,
      configured: true,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}