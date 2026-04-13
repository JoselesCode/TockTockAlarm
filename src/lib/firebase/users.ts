import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

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